var API = require('../API/apiImplementation.js');


module.exports = function (app , passport , Strategy , authenticate) {
  app.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
  });

  app.post('/addnewusr',API.addnewusr);
  app.post('/loginusr', passport.initialize(), passport.authenticate('local', { session: false,scope: []}), API.loginusr);
  app.get('/pvtdata', authenticate, API.profile);
  app.post('/fbLogin',API.fbSignup);  
  // app.post('/fbLogin',passport.authenticate('facebook-token'),API.fbLogin);  
  // app.get('/fb',API.fbLogin);  
  app.post('/fbLoginAuth',passport.authenticate('facebook-token'),API.fbLoginAuth)
}