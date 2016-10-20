var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
 
var User = new Schema({
    firstname    :String,
    lastname     : String,
    email  : {type:String,unique:true},
    country     : String,
    password : String,
	facebookID   :{type:String},
    coverPhoto   :String,
    profilePic:String,
    INid:String,
    INdp:String
});

module.exports=mongoose.model('user',User,'user');