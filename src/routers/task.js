const express=require("express");
const router=new express.Router();
const Task=require("../models/task");
const auth=require("../middleware/auth")


//Creating a new task
router.post("/tasks",auth,async (req,res)=>{
    //const task=new Task(req.body);
    const task=new Task({
        ...req.body,
        owner : req.user._id
    })

    try{
        await task.save();
        res.status(201).send(task);
    }catch(e){
        res.status(400).send()
    }

})


//For getting the tasks
// GET /tasks?completed=true
// GET /tasks?limit=5&skip=3
// GET /tasks?sortBy=createdAt:asc
//To sort it alphabetically /tasks?sortBy=description:asc
router.get("/tasks",auth,async(req,res)=>{

    const limit=parseInt(req.query.limit) 
    const skip=parseInt(req.query.skip)
    const sort={}
    if(req.query.sortBy)
    {
        const parts=req.query.sortBy.split(":")   //Splits a string into an array according to the character mentioned 
        sort[parts[0]] = parts[1] ==="desc" ? -1 : 1 //Ternary operator
    }
    try{
        if(req.query.completed==='true')
        {
            completed=true
            const task=await Task.find({owner:req.user._id,completed}).limit(limit).skip(skip).sort(sort)
            res.send(task).status(200)
        }
        else if(req.query.completed==='false')
        {   
            completed=false
            const task=await Task.find({owner:req.user._id,completed}).limit(limit).skip(skip).sort(sort)
            res.send(task).status(200)
        }
        else{
            const task=await Task.find({owner:req.user._id}).limit(limit).skip(skip).sort(sort)
            res.send(task).status(200)
        }
    }catch(e){
        res.send().status(500)
    }

})

//For getting a single task(6)
router.get("/tasks/:id",auth,async (req,res)=>{
    const _id=req.params.id;

    try{
        const task=await Task.findOne({ _id:_id , owner:req.user._id });

        if(!task){
            return res.status(404).send();
        }
        res.send(task).status(200);
    }catch(e){
        res.status(500).send()
    }

})


//Updating a task
router.patch("/tasks/:id",auth,async (req,res)=>{

    const updates=Object.keys(req.body);
    const allowedUpdates=['description','completed'];
    const isValidOperation=updates.every((update)=>allowedUpdates.includes(update));
    
    if(!isValidOperation){
        res.status(400).send({error:"Invalid Operation!"});
    }

    try{
        const task=await Task.findOne({_id:req.params.id , owner: req.user._id})

        if(!task){
            res.status(404).send("Task does not exist!")
        }
        
        updates.forEach((update)=>{ task[update] = req.body[update]})
        await task.save()
        res.send(task)

    }catch(e){
        res.status(400).send()
    }

})


router.delete("/tasks/:id",auth,async (req,res)=>{
    try{
        const task=await Task.findOneAndDelete({_id:req.params.id ,owner: req.user._id});
        if(!task){
            res.status(404).send("Task does not exist!")
        }
        res.send("Task deleted Successfully")

    }catch(e){
        res.status(500).send()
    }
})


module.exports=router