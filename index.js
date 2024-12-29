const port = 4000;
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path =require('path');
const cors =require('cors')
const {diskStorage} = require("multer");
const {raw} = require("express");

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
app.use('/images',express.static('upload/images'))
app.post('/upload',upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
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
//Schema creating for User model
const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now()
    }
})
//Creating Endpoint for registering the user
app.post('/signup',async (req,res)=>{
    let check = await Users.findOne({email:req.body.email})
    if (check){
        return res.status(400).json({
            success:false,
            errors:"Existing user found with email address"
        })
    }
    let cart={};
    for (let i = 0; i < 300; i++) {
        cart[i]=0;
    }
    const user = new Users({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        cartData:cart
    })
    await user.save();
    const data= {
        user:{
            id:user.id
        }
    }
    const token = jwt.sign(data,"secret_ecom");
    res.json({success:true,token})
})

// creating endpoint for user login
app.post("/login",async (req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if (user){
        const passCompare = req.body.password === user.password;
        if (passCompare){
            const data={
                user:{
                    id:user.id,
                }
            }
            const token = jwt.sign(data,"secret_ecom");
            res.json({success:true,token})
        }else {
            res.json({success:false,error:"Wrong Password"})
        }
    }else {
        res.json({success:false,error:"Wrong Email"})
    }
})

//creating end point for newcollection data
app.get("/newcollection",async (req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New collection Fetched")
    res.send(newcollection);
})

//creating end point for popular
app.get("/popular",async (req,res)=>{
    //let products = await Product.find({category:req.body.category});
    let products = await Product.find({category:'xaphong'});
    let popular = products.slice(0,4);
    console.log("Popular Fetched")
    res.send(popular);
})

// creating middleware to fetch user
    const fetchUser = async (req,res,next)=>{
        const token = req.header('auth-token')
        if (!token){
            res.status(401).send({error:"Please authenticate using valid token"})
        }else {
            try {
                const data = jwt.verify(token,'secret_ecom');
                req.user = data.user;
                next();
            }catch (error){
                res.status(401).send({error:"Please authenticate using valid token"})
            }
        }
    }

// creating endpoint for add cart
app.post("/addcart",fetchUser, async (req,res)=>{
    console.log("add  ",req.body.itemId);
    const userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId]+=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Add")
})
// creating endpoint for remove cart
app.post("/removefromcart",fetchUser, async (req,res)=>{
    console.log("remove ",req.body.itemId);
    const userData = await Users.findOne({_id:req.user.id});
    if (userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId]-=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Remove")
})

// creating endpoint to get cart
app.post('/getcart',fetchUser,async (req,res)=>{
    console.log("get cart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})

app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on port "+ port);
    }else {
        console.log("Error : ",error);
    }
})