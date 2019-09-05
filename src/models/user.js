const mongoose=require("mongoose")
const validator=require("validator")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true   //Trims extra spaces before or after
    },
    email:{
        type:String,
        unique:true,//So that an email should be unique..Your database needs to be empty after inserting this for the first time
        required:true,
        trim:true,
        lowercase:true,   
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is Invalid")      //throw: It generates an exception which stops the script from executing any further unless it's handled.

            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error('Password cannot contain "password" ')
            }
            if(value.length<7){
                throw new Error("Password is too short!")
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error("Age must be positive")
            }
        }

    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

// The localField represents the field you want to connect on the userSchema and the foreignField represents the field on the taskSchema. You can read it as:
// "Find Tasks where localField is equal to foreignField"
//The code below defines the relationship between the User and Task models
//This relation does not store the task in the individual user physically and hence is defined as "virtual"
userSchema.virtual("tasks",{
    ref:"Task",
    localField:"_id",
    foreignField:"owner"
})



//methods are accisible on instances of our Models(Also called as instance methods)
userSchema.methods.generateAuthToken= async function(){
    const user=this;
    const token=jwt.sign({ _id: user._id.toString() },process.env.JWT_SECRET)

    user.tokens=user.tokens.concat({token})
    await user.save()

    return token
}
//This function will always run even if we dont call this
//This hides the private data i.e. the password and the other existing tokens from the user
userSchema.methods.toJSON = function(){
    const user=this
    const userObject=user.toObject()
    
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar  //As sending binary data(avatar) back and forth makes the server slow
    //But we can still see the avatar in the browser at localhost:3000/users/:id/avatar

    return userObject
}

//WE can add functions to our models using this "statics" keyword as below
//Static methods are accisible on models(User in this case) (Also called as model methods)
userSchema.statics.findByCredentials= async (email,password)=>{
    const user= await User.findOne({email:email})
    if(!user){
        throw new Error("Unable to login")
    }
    const isMatch= await bcrypt.compare(password,user.password);

    if(!isMatch){
        throw new Error("Unable to login")
    }

    return user
}

//Hash the plain text password before saving
userSchema.pre('save',async function(next){
    //We did not use arrow functions as they do not bind the this keyword
    const user=this


    if(user.isModified("password")){
        user.password=await bcrypt.hash(user.password,8)
    }

    console.log("Jaust before saving");
    next()
})


//So far so good. We've got a schema with some properties eg. nameage,email,etc. The next step is compiling our schema into a Model.
//So User is a model which will follow the schema userSchema
const User=mongoose.model('User',userSchema)
//User.createIndexes();

module.exports=User;