const express=require("express");
const router=new express.Router();
const auth=require("../middleware/auth")
const multer=require("multer")
const sharp=require("sharp")
const User=require("../models/user")
const Task=require("../models/task")
const {sendWelcomeEmail ,sendDeleteEmail} = require("../emails/account")


//Creating a new user(1)
router.post("/users",async (req,res)=>{
    const user=new User(req.body); //The contents of req.body(i.e. the JSON data we are sending) isset to the user

    try{
        const token=await user.generateAuthToken()

        await user.save();
        sendWelcomeEmail(user.email,user.name)

        res.status(201).send({
            user:user,
            token:token
        });
    }catch(e){
        res.status(400).send(e);
    }
    
})

//Logging in users
router.post("/users/login",async (req,res)=>{
    try{
        const user=await User.findByCredentials(req.body.email,req.body.password)
        //WE use user below and not User because we are trying to generate a token for a very specific user
        const token=await user.generateAuthToken()
        res.send({
            user:user,
            token:token    
        })
    }catch(e){
        console.log(e)
        res.status(401).send(e)
    }
})

//Logout a user from a session/device
router.post("/users/logout",auth,async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.send()

    }catch(e){
        res.status(500).send(e)
    }
})

//LogoutAll
router.post("/users/logoutAll", auth , async(req,res)=>{
    try{
        req.user.tokens=[] 
        await req.user.save()
        res.status(200).send("Logged out from all routes")
    }catch(e){
        res.status(500).send()
    }
   
})


//For getting all Users(4)
router.get("/users/me",auth,async (req,res)=>{
    res.send(req.user)
})


//Update user
router.patch("/users/me",auth,async (req,res)=>{
    const updates=Object.keys(req.body);
    const allowedUpdates=['name','email','password','age'];
    const isValidOperation=updates.every((update)=>allowedUpdates.includes(update));

    if(!isValidOperation){
        res.status(400).send({error:"Invalid operation!"})
    }


    try{
        //We removed the commented line below and replaced it with the code below as some mongoose functions like findByIdAndUpdate bypass the middleware(hashing)
        //Hence we had to do this to ensure that the updated password(if any) is hashed
        //const user=await User.findByIdAndUpdate(req.params.id)
        const user=req.user
        updates.forEach((update)=>{ user[update]=req.body[update] })
        await user.save();
        res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
   
})

//Delete user
router.delete("/users/me",auth,async (req,res)=>{
    try{

        await User.findByIdAndDelete(req.user._id);
        await Task.deleteMany({owner: req.user._id})
        sendDeleteEmail(req.user.email,req.user.name)
        // await req.user.remove()
        res.send("User deleted Successfully")
    }catch(e){
        res.status(500).send()
    }
})

//Upload profile pic
const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.endsWith("jpg" || "jpeg" || "png")){
            return cb(new Error("Please upload an image!"))
        }
        else{
             cb(undefined,true)
        }
    }
})


router.post("/users/me/avatar" , auth, upload.single("avatar") , async(req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({ width : 250 , height : 250}).png().toBuffer()
    
    req.user.avatar= buffer
    await req.user.save()
    res.send()
},( error,req,res,next )=>{ 
    res.status(400).send({ error : error.message })
})


router.delete("/users/me/avatar", auth ,async (req,res)=>{
    if(!req.user.avatar){
        res.send("No profile photo exists!")
    }
    req.user.avatar = undefined
    await req.user.save()
    res.send("Deleted")
})

router.get("/users/:id/avatar",async (req, res)=>{
    try{
        const user=await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set("Content-Type","image/png")
        res.send(user.avatar)
    }catch(e){
        //console.log(e)
        res.status(404).send()
    }
})

module.exports=router