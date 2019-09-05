const mongoose=require("mongoose")


mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
})




//Creates an instance of me
// const me =new User({
//     name:" Mahesh",
//     age:19,
//     email:"chachAD@gmail.com    ",
//     password:"mypass123"
// })

// me.save().then((me) => {
//     //If things go well we get access to our model instance
//     console.log(me)
// }).catch((error) => {
//     console.log("Error",error)
// })




// const task=new Task({
//    description:" Go to the college ",
//     completed:false
// })

// task.save().then((task)=>{
//     console.log(task)
// }).catch((error)=>{
//     console.log(error)
// })



