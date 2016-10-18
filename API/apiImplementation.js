var USER = require('../model/userSchema');
var jwt = require('jsonwebtoken');
var SECRET = 'server secret';
var TOKENTIME = 60 * 60;



exports.addnewusr=function(req,res){

    var user = new USER({
        firstname    :req.body.fname,
        lastname     : req.body.lname,
        email  : req.body.email,
        country     : req.body.country,
        password : req.body.password
    });

    user.save(function (err,data){
        if (err) {
            if(err.code==11000){
                res.status(200).send({success:false,msg:'Oops! ,this data is already exists in database'});
                return;
            }            
            res.status(200).send({success:false,msg:'Somthing went wrong please try again'});
            return;
        }
        else {
            res.status(200).send({success:true,msg:'Hi ,'+data.firstname+' Congratulation , now you can login '});
            return;
        }
    })
	
}

exports.loginusr=function(req,res){
  req.token = jwt.sign({
    id: req.user.id,    
  }, SECRET, {
    expiresIn: TOKENTIME
  });
   res.send({ user: req.user, auth_token: req.token});
}

exports.fbLoginAuth =function(req,res){
  req.token = jwt.sign({
    id: req.user.id,    
  }, SECRET, {
    expiresIn: TOKENTIME
  });
   res.send({ user: req.user, auth_token: req.token});     
}

exports.profile=function(req,res){
  if(req.headers.authorization){
    var decoded = jwt.decode(req.headers.authorization.split(' ')[1], SECRET);
    if(decoded && decoded.id){
        USER.findById(decoded.id,function(err,usr){
            res.send(usr);
        });
    }
  }else{
    res.send({});
  }
}
   

exports.fbLogin=function(req,res){    
     
    // do something with req.user 
    res.send(req.user? 'a' : 'b');
   
}

exports.fbSignup=function(req,res){    
    if(!req.body.fb){
        res.send();
      }
    var d =  JSON.parse(req.body.fb);
    console.log(d);
    USER.find({facebookID:d.id},function(err,data){
        if(!err && data.length==0){
            var user = new USER({
                facebookID   :d.id,
                firstname    :d.first_name,
                lastname     :d.last_name,
                email        :d.email||d.id+'@facebook.com',
                country      :d.country||'US',
                password     :d.email?(d.email).split('@')[0]:'12345',
                coverPhoto   :d.cover?d.cover.source:'',
                profilePic    :'https://graph.facebook.com/'+d.id+'/picture?type=large'          
        });
        user.save(function (err,data){
            if (err) {
                if(err.code==11000){
                    res.send({success:false,msg:'Oops! ,this data is already exists in database'});
                    return;
                }            
                res.send({success:false,msg:'Somthing went wrong please try again'});
                return;
            }
            else {
                res.send({success:true,msg:'Hi ,'+data.firstname+' Congratulation , now you can login '});
                return;
        }
    })

        }else{
            res.send({success:true,msg:'Hi ,you are already registered'});
        }
    })
}

