const inquirer = require('inquirer'),
      touch = require('touch'),
      fs = require('fs'),
      files = require(__dirname + '/lib/files'),
      menu = require(__dirname + '/lib/menu'),
      prompt = require(__dirname + '/lib/prompt'),
      targetlist = __dirname + '/../configs/repos',
      chalk = require('chalk');

fs.exists(targetlist, (exists) => { 
  if (!exists) { 
    fs.openSync(targetlist, 'w');
    //fs.writeFile(targetlist, { flag: 'wx' }, (err) => {
        //if (err) throw err;
    //});
  }
});

//print banner
menu.printBanner();

//main prompt loop
prompt.mainPrompt();


