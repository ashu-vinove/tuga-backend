var API = require('../API/apiImplementation.js');

module.exports = function (app , passport , Strategy , authenticate) {
  
  app.get('/', function (req, res, next) {res.send('Working');  });//testing

  app.post('/addnewusr',API.addnewusr);  
  app.post('/loginusr', passport.initialize(), passport.authenticate('local', { session: false,scope: []}), API.loginusr);
  app.get('/pvtdata', authenticate, API.profile);
  app.post('/fbLogin',API.fbSignup);   
  app.post('/fbLoginAuth',passport.authenticate('facebook-token'),API.fbLoginAuth)
  app.post('/intWidFB',authenticate,API.intWidFB);
  app.post('/intWidIN',authenticate,API.intWidIN);
  app.post('/in_data',API.in_data);

}