var mongoose= require('mongoose');
const WordMeaningSchema= mongoose.Schema({
title:String,
meaning:String,
isRead: {
    type:Boolean,
    default:false,
    required: true
}
})
module.exports=mongoose.model('testwords',WordMeaningSchema)
