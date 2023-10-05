// Note : i did complicate it a little here 
const net = require("net");
const fs = require("fs");

let dir = "./";
    if (process.argv[2] == "--directory"){
        dir = process.argv[3];
    }
if (!dir.endsWith("/")) dir += "/";

const parseHTTP = (request , socket) => {
    const HTTP_Method=['CONNECT',
    'DELETE',
    'GET',   
    'HEAD',    
    'OPTIONS',   
    'POST',   
    'PUT',]

    const HTTPreqElms = request.split(`\r\n`);
    const req_Line = request.split(`\r\n`)[0]; 
    let [method , path ,ver] = req_Line.split(" ");
    let headers = new Map();

    if (!HTTP_Method.includes(method)) { // verifie the type of the request
        socket.write("HTTP/1.1 400 BAD REQUEST\r\n\r\n");
        socket.end();
        server.close();
    }

    for (let i = 1; i < HTTPreqElms.length; i++) {
        if (HTTPreqElms[i]!=="") {
            headers.set(String(HTTPreqElms[i].split(":")[0]).trim(),String(HTTPreqElms[i].split(":")[1]).trim());
        }
    }
    return [headers , method];
}

const checkFileType = (path) => {
    if (path.endsWith(".html")) 
        return "text/html";
    
    else if (path.endsWith(".txt")){
        return "text/plain";
    }
    else
        return "application/octet-stream";
    
}

const loopOnPath = (path ,socket ,data) => {
    let temp = "";
    let word = "";
    let flag = 0 ;
    let counter = 0;
    let [headers,method] = parseHTTP(data.toString(),socket); 

    //* simple / path
    if(path=="/"){ // this will give an array with the [method , path , HTTP -v]
        socket.write("HTTP/1.1 200 OK\r\n\r\n") // here you write the status for the HTTP request
        return word;
    }

    //* path like /user-agent
    for (const key of headers.keys()) {
        if (path==='/'+key.toLowerCase()) {
            word = headers.get(key);
            return word;
        }
    }

    //* for echo and general path (so far)
    for (let i = 0; i < path.length; i++) {
        if (path[i]==="/") {
            counter++;
        }

        if(i===0 && path[i]!="/") {
            socket.write("HTTP/1.1 400 BAD REQUEST\r\n\r\n");
            return null;
        }

        if (i===path.length-1 && flag===0) {
            socket.write("HTTP/1.1 404 NOT FOUND\r\n\r\n");
            return null;
        }

        if (i!==0 && path[i]==="/" && counter===2) {
            if(temp.slice(1,)==="echo"){
                flag=1;
                continue;
            }
            if(temp.slice(1,)==="files"){
                const file = dir + path.replace(/^\/files\//g, "");
                if (method=="GET") {
                    if (fs.existsSync(file)) {
                        const fileCont = fs.readFileSync(file);
                        socket.write(`HTTP/1.1 200 OK\r\nContent-Type: ${checkFileType(file)}\r\nContent-Length: ${new Blob([fileCont]).size}\r\n\r\n${fileCont}\r\n`,
                        );
                    }
                    else {
                        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        
                    }
                    return word;
                }else if(method="POST"){
                    fs.writeFileSync(file , data.toString().split("\r\n\r\n")[1]);
                    socket.write("HTTP/1.1 201 CREATED\r\n\r\n");
                }
            }
        }
        if (flag===1) {
            word+=path[i];
        }
        temp+=path[i]
    }
    return word;
}

const writeHTTP = (path ,socket ,data) => {
    const str = loopOnPath(path,socket,data);
    if (str && str!=="") {
        socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}`)
    }
}

console.log("outside")
const server = net.createServer((socket) => { //this is an event based function thingy
    socket.on("close" , () => {
        socket.end(); // prepare for close ,basically this shuts down the road so anyone trying to write something after this is gonna resolve in an error
        server.close();
    });
    socket.on("data" , (data) => { // data here is the one containing all the infos about our HTTP request and headers
        socket.read(); // not sure what i should read here tbh 
        // like the exercice says the \r\n ends the status line and the 2ns \r\n signifies the end of the headers section (Response,Representation,General)
        writeHTTP(data.toString().split("\r\n")[0].split(" ")[1] , socket,data);
        socket.end();
    })
});

const s = server.listen(4221, "localhost");
s.on("listening" , () => {console.log("listening")})