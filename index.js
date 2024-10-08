const port = 4000;
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path =require('path');
const cors =require('cors')

app.use(express.json());
app.use(cors());

//Database Connection with mongodb
mongoose.connect("mongodb+srv://tmtri22052004:DrZo5ty7SO3OQc3D@cluster0.f23vu.mongodb.net/")

//Api creation
app.get('/',(req,res)=>{
    res.send("Express App is running")
})

app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on port "+ port);
    }else {
        console.log("Error : ",error);
    }
})