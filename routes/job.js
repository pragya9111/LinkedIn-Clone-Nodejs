const mongoose = require('mongoose')
const jobSchema= mongoose.Schema({
    postedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    jobTitle:String,
    location:String,
    experience:Number,
    jobDetail:String,
    noOfApplicants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }]
})
module.exports = mongoose.model('job', jobSchema);