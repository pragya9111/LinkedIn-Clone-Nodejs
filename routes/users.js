const mongoose = require('mongoose');
const plm = require('passport-local-mongoose')
const url = "mongodb://localhost/linkedindb"
mongoose.connect(url)
const userSchema = mongoose.Schema({
   username:String,
   name:String,
   contact:Number,
   email:String,
   passowrd:String,
   aboutUs:String,
   isAdmin:{
     type:Boolean
   },
   profilepic:String,
   posts:[{
     type:mongoose.Schema.Types.ObjectId,
     ref:'posts'
   }],
   connectionsAccepted:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users'
   }],
   connectionsRequest:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users'
   }],
   connectionsRequestSend:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users'
   }],
   createdJob:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'job'
   }],
   noOfJobsApplied:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'job'
   }]
 })
 userSchema.plugin(plm);
 module.exports=  mongoose.model('users',userSchema);

