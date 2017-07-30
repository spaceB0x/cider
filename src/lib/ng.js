var log = console.log;
var fs = require('fs');
var chalk = require('chalk');
var inquirer = require('inquirer');
var files = require('./files');
var configdir = __dirname + '/../../configs';
//var Preferences = require('preferences');
var Preferences = require(__dirname + '/preferences');
module.exports = {

    // Grabs ngrok 
    getNgrokToken: (callback) => {
        var questions = [{
            name: 'token',
            type: 'password',
            message: 'Enter your Ngrok token:',
            validate: function (value) {
                if (value.length) {
                    return true;
                } else {
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
        var prefs = new Preferences('ngrok');
        if (prefs.ngrok && prefs.ngrok.token) {
            log(chalk.green("Ngrok token found"))
            return callback(null, prefs.ngrok.token);
        } else {
            module.exports.getNgrokToken((creds) => {
                prefs.ngrok = {
                    token: creds.token
                };
                return callback(null, creds.token);
            });
        }
    }
}