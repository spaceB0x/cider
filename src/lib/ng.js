const log = console.log,
      fs = require('fs'),
      chalk = require('chalk'),
      inquirer = require('inquirer'),
      files = require('./files'),
      configdir = __dirname + '/../../configs',
      //Preferences = require('preferences'),
      Preferences = require(__dirname + '/preferences');

module.exports = {

  // Grabs ngrok 
  getNgrokToken: (callback) => {
    const questions = [{
      name: 'token',
      type: 'password',
      message: 'Enter your Ngrok token:',
      validate: function (value) {
        if (value.length) {
          return true;
        }
        else {
          return 'Please enter your Ngrok Token. It can be found by signing in to your Ngrok account.';
        }        
      }
    }];
    inquirer.prompt(questions).then(callback);
  },


  // checks for ngrok prefs and requests them if they don't exist
  // returns (err, token)
  ngrokAuth: (callback) => {
    if(!files.fileExists(`${configdir}/ngrok.pref`)){
      fs.openSync(`${configdir}/ngrok.pref`, 'a');
    }
    const prefs = new Preferences('ngrok');
    if (prefs.ngrok && prefs.ngrok.token) {
      log(chalk.green("Ngrok token found"));
      return callback(null, prefs.ngrok.token);
    }
    else {
      module.exports.getNgrokToken((creds) => {
        prefs.ngrok = {
          token: creds.token
        };
        return callback(null, creds.token);
      });
    }
  }
}