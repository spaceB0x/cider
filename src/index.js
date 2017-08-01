const inquirer = require('inquirer'),
      touch = require('touch'),
      fs = require('fs'),
      files = require(__dirname + '/lib/files'),
      menu = require(__dirname + '/lib/menu'),
      prompt = require(__dirname + '/lib/prompt'),
      chalk = require('chalk');


//print banner
menu.printBanner();

//main prompt loop
prompt.mainPrompt();


