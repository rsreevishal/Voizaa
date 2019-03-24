const exe = require("./app");
const express = require('express');
const path = require("path");
app = express();
app.use("public",express.static(path.join(__dirname,"messages")));
app.listen("3000");
app.get('/',(req,res)=>{
    for(i=0;i<20;i++)
    {
        exe.execute("open",i);
    }   
    res.sendFile(path.join(__dirname,"messages","message.html"));
});