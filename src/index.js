const express=require("express");
const userRouter =require("./routers/user")
const taskRouter=require("./routers/task")
require('./db/mongoose')

const app=express();
const port= process.env.PORT


app.use(express.json());
app.use(userRouter);
app.use(taskRouter)

app.listen(port,()=>{
    console.log("Server is up on port"+ port)
})
















// const main=async ()=>{
//     // const task=await Task.findById("5d632ff185cf3218ccbaab52")
//     // console.log(task)
//     // await task.populate("owner").execPopulate()
//     // console.log(task.owner)
//     // // const user=await User.findById(task.owner)
//     // // console.log(user)


//     const user=await User.findById("5d632fe885cf3218ccbaab50")
//     await user.populate("tasks").execPopulate()
//     console.log(user)
//     console.log(user.tasks)
    
// }

// main()