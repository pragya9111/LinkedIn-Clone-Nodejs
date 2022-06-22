const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
    image : String,
    caption:String,
    createdAt:{
        type:Date,
        default:Date.now()
    },
    username:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }
 })
 module.exports=  mongoose.model('posts',postSchema);