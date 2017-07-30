var inquirer = require('inquirer');
var touch = require('touch');
var fs = require('fs');
var files = require(__dirname + '/lib/files');
var menu = require(__dirname + '/lib/menu');
var prompt = require(__dirname + '/lib/prompt')
var chalk = require('chalk');


//print banner
menu.printBanner();

//main prompt loop
prompt.mainPrompt();


