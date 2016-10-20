var USER = require('../model/userSchema');
var jwt = require('jsonwebtoken');
var config = require('./config')



/***********************************************************************************
    Getting the details of user , if user send valid token in header 
***********************************************************************************/

exports.profile = function(req, res) {
    if (req.headers.authorization) {
        var decoded = jwt.decode(req.headers.authorization.split(' ')[1], config.SECRET);
        if (decoded && decoded.id) {
            USER.findById(decoded.id, function(err, usr) {
                res.send(usr);
            });
        }
    } else {
        res.send({});
    }
}

/***********************************************************************************
    Normal signup for user , adding his details in database 
***********************************************************************************/

exports.addnewusr = function(req, res) {

    var user = new USER({
        firstname: req.body.fname,
        lastname: req.body.lname,
        email: req.body.email,
        country: req.body.country,
        password: req.body.password,
        facebookID: '',
        coverPhoto: '',
        profilePic: '',
        INid: '',
        INdp: ''
    });

    user.save(function(err, data) {
        if (err) {
            if (err.code == 11000) {
                res.status(200).send({
                    success: false,
                    msg: 'Oops! ,this data is already exists in database'
                });
                return;
            }
            res.status(200).send({
                success: false,
                msg: 'Somthing went wrong please try again'
            });
            return;
        } else {
            res.status(200).send({
                success: true,
                msg: 'Hi ,' + data.firstname + ' Congratulation , now you can login '
            });
            return;
        }
    })

}

/***********************************************************************************
                Login user after passport-local strategy pass
***********************************************************************************/

exports.loginusr = function(req, res) {
    req.token = jwt.sign({
        id: req.user.id,
    }, config.SECRET, {
        expiresIn: config.TOKENTIME
    });
    res.send({
        user: req.user,
        auth_token: req.token
    });
}


/*==========Facebook===========*/


/***********************************************************************************
            Add a user in database with the data fetch from facebook
***********************************************************************************/

exports.fbSignup = function(req, res) {
    if (!req.body.fb) {
        res.send();
    }
    var d = JSON.parse(req.body.fb);
    // console.log(d);
    USER.find({
        facebookID: d.id
    }, function(err, data) {
        if (!err && data.length == 0) {
            var user = new USER({
                facebookID: d.id,
                firstname: d.first_name,
                lastname: d.last_name,
                email: d.email || d.id + '@facebook.com',
                country: d.country || 'US',
                password: d.email ? (d.email).split('@')[0] : '12345',
                coverPhoto: d.cover ? d.cover.source : '',
                profilePic: 'https://graph.facebook.com/' + d.id + '/picture?type=large',
                INid: '',
                INdp: ''
            });
            user.save(function(err, data) {
                if (err) {
                    if (err.code == 11000) {
                        res.send({
                            success: false,
                            msg: 'Oops! ,this data is already exists in database'
                        });
                        return;
                    }
                    res.send({
                        success: false,
                        msg: 'Somthing went wrong please try again'
                    });
                    return;
                } else {
                    res.send({
                        success: true,
                        msg: 'Hi ,' + data.firstname + ' Congratulation , now you can login '
                    });
                    return;
                }
            })

        } else {
            res.send({
                success: true,
                msg: 'You are already registered , login now'
            });
        }
    })
}


/***********************************************************************************
    Login from facebok , user need to send his access tokenin header
***********************************************************************************/

exports.fbLoginAuth = function(req, res) {
    req.token = jwt.sign({
        id: req.user.id,
    }, config.SECRET, {
        expiresIn: config.TOKENTIME
    });
    res.send({
        user: req.user,
        auth_token: req.token
    });
}


/***********************************************************************************
    If user already has an account and he wants to integrate same with FB
***********************************************************************************/

exports.intWidFB = function(req, res) {
    var d = JSON.parse(req.body.fb);
    setTimeout(function() {
        if (req.headers.authorization) {
        var decoded = jwt.decode(req.headers.authorization.split(' ')[1], config.SECRET);
        if (decoded && decoded.id) {            
            USER.findByIdAndUpdate(decoded.id, {
                $set: {
                    facebookID: d.id,
                    coverPhoto: d.cover ? d.cover.source : '',
                    profilePic: 'https://graph.facebook.com/' + d.id + '/picture?type=large'
                }
            }, function(err, usr) {
                res.send({
                    err: err,
                    usr: usr
                });
            });
        } else {
            res.send({
                err: true,
                usr: null
            });
        }
    } else {
        res.send({
            err: true,
            usr: null
        });
    }
        
    }, 2000);    
}


/*=======Linkedin======*/

/***********************************************************************************
             Add a user in database with the data fetch from facebook
***********************************************************************************/

exports.in_data = function(req, res) {
    var d = JSON.parse(req.body.in);
    USER.find({
        INid: d.id
    }, function(e, usr) {
        if (e) res.send({
            success: false,
            msg: 'Somthing went wrong please try again',
            err: e
        })
        else if (usr.length == 0) {
            //insert new data and send with jwt
            var user = new USER({
                firstname: d.firstName,
                lastname: d.lastName,
                email: d.emailAddress || d.id + "@linkedin.com",
                country: d.location.country.name || 'US',
                password: '12345',
                facebookID: undefined,
                coverPhoto: '',
                profilePic: '',
                INid: d.id,
                INdp: d.pictureUrl
            });


            user.save(function(err, data) {
                if (err) {
                    if (err.code == 11000) {
                        res.send({
                            success: false,
                            msg: 'Oops! ,this data is already exists in database',
                            e: err
                        });
                        return;
                    }
                    res.send({
                        success: false,
                        msg: 'Somthing went wrong please try again',
                        err: err
                    });
                    return;
                } else {
                    req.token = jwt.sign({
                        id: data._id,
                    }, config.SECRET, {
                        expiresIn: config.TOKENTIME
                    });
                    res.send({
                        success: true,
                        auth_token: req.token
                    });
                }
            })
        } else {
            //login with jwt
            console.log(usr);
            req.token = jwt.sign({
                id: usr[0]._id,
            }, config.SECRET, {
                expiresIn: config.TOKENTIME
            });
            res.send({
                success: true,
                auth_token: req.token
            });
        }
    })
}


/***********************************************************************************
           If user already has an account and he wants to integrate same with IN
***********************************************************************************/

exports.intWidIN = function(req, res) {
    var d = JSON.parse(req.body.in);
    if (req.headers.authorization) {
        var decoded = jwt.decode(req.headers.authorization.split(' ')[1], config.SECRET);
        if (decoded && decoded.id) {
            USER.findByIdAndUpdate(decoded.id, {
                $set: {
                    INid: d.id,
                    INdp: d.pictureUrl ? d.pictureUrl : ''
                }
            }, function(err, usr) {
                res.send({
                    err: err,
                    usr: usr
                });
            });
        } else {
            res.send({
                err: true,
                usr: null
            });
        }
    } else {
        res.send({
            err: true,
            usr: null
        });
    }
}