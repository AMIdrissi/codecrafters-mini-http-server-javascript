const net = require("net");

const checkPath = (path , socket) =>{
    if(path=="/"){ // this will give an array with the [method , path , HTTP -v]
        socket.write("HTTP/1.1 200 OK\r\n\r\n") // here you write the status for the HTTP request
        console.log("good")
    } else{
        socket.write("HTTP/1.1 404 NOT FOUND\r\n\r\n")
        console.log("bad")
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
        checkPath(data.toString().split("\n")[0].split(" ")[1] , socket);
        socket.end();
    })
});

server.listen(4221, "localhost");
