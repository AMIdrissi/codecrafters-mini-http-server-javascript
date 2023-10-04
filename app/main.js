// Note : i did complicate it a little here 
const net = require("net");

const loopOnPath = (path ,socket) => {
    let temp = "";
    let word = "";
    let flag = 0 ;
    let counter = 0;

    if(path=="/"){ // this will give an array with the [method , path , HTTP -v]
        socket.write("HTTP/1.1 200 OK\r\n\r\n") // here you write the status for the HTTP request
        return word;
    }

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
            } else{
                socket.write("HTTP/1.1 404 NOT FOUND\r\n\r\n")
                return null;
            }
        }
        if (flag===1) {
            word+=path[i];
        }
        temp+=path[i]
    }
    return word;
}

const parsePath = (path ,socket) => {

    const str = loopOnPath(path,socket);
    
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
        parsePath(data.toString().split("\r\n")[0].split(" ")[1] , socket);
        socket.end();
    })
});

server.listen(4221, "localhost");