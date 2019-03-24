const express = require("express");
const app = express();
app.get("/",(req,res)=>{
    Email.send({
        Host : "smtp.elasticemail.com",
        Username : "rsreevishal111@gmail.com",
        Password : "f71c4fcf-076d-433e-a47e-e0c2fdeac106",
        To : 'rsreevishal111@gmail.com',
        From : "rsreevishal111@gmail.com",
        Subject : "This is the subject",
        Body : "And this is the body"
    }).then(
      message => alert(message)
    );
});
app.listen("8080");