const { argv } = require("process");

// this handles the args of the .sh call mentionned 
let dir = "./";

let prev = "";

for (const arg of argv) {
    
    if (prev == "--directory"){
        dir = arg;
        console.log(dir);
    }
    prev = arg;

}

if (!dir.endsWith("/")) dir += "/";

