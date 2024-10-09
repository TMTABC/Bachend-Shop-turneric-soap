const port = 4000;
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path =require('path');
const cors =require('cors')
const {diskStorage} = require("multer");

app.use(express.json());
app.use(cors());

//Database Connection with mongodb
mongoose.connect("mongodb+srv://tmtri22052004:DrZo5ty7SO3OQc3D@cluster0.f23vu.mongodb.net/")

//Api creation
app.get('/',(req,res)=>{
    res.send("Express App is running")
})

// Image Storage Engine
const storage = diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload =multer({storage:storage})

//Creating Upload Endpoint for images
app.use('./images',express.static('upload/images'))
app.post('/upload',upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://locallhost:${port}/images/${req.file.filename}`
    })
})

// Schema for creating products
const Product = mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true
    },
    old_price:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        default:Date.now(),
    },
    avilable:{
        type:Boolean,
        default:true
    }
})
app.post('/addproduct',async (req,res)=>{
    const {id,name,image,category,new_price,old_price}=req.body;
    let products = await Product.find({});
    let idProduct;
    if (products.length>0){
        let last_product_array = products.slice(-1);
        let last_product= last_product_array[0];
        idProduct=last_product.id+1;
    }else {
        idProduct=1;
    }
    const product = new Product({
        id:idProduct,
        name:name,
        image:image,
        category:category,
        new_price:new_price,
        old_price:old_price
    })
    console.log(product)
    await product.save();
    console.log("SAVE");
    res.json({
        success:true,
        name:name,
    })
})
//Creating API for deleting Product
app.post('/removedproduct',async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name,
    })
})

//Creating API for getting all Product
app.get('/allproducts',async (req,res)=>{
    let products = await Product.find({})
    console.log("All products Fetched");
    res.send(products)
})

app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on port "+ port);
    }else {
        console.log("Error : ",error);
    }
})