const mongoose=require("mongoose")
const validator=require("validator")

const task_schema=new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"  //This line references the User model
        //Establishes relation between task and user so now we can use fuctions like exexPopulate to make our work easy!!
    }
},{
    timestamps:true
})
const Task=mongoose.model('Task',task_schema);

module.exports=Task;