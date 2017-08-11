const log = console.log;
      fs = require('fs'),
      clear = require('clear'),
      chalk = require('chalk'),
      path = require('path'),
      exdir = __dirname + '/../exploits',
      expath = path.resolve(exdir),
      files = require(__dirname + '/files'),

module.exports = {

  //Prints list of exploits
  printExploits: () => {
    clear();
    log(chalk.cyan("------------", "\n Exploits ", "\n------------"));
    const exlist = files.walkSync(exdir),
          tlist = [];
    exlist.forEach((item) => {
      if (item.includes("exploit.js")) {
          tlist.push(item);
          log(item.replace(`${expath}/`, '').replace('/exploit.js',''));
      }
    });
    log();
    return tlist;
  },

  //Checks if exploits exist
  exploitExists: (exploit) => {
      return fs.existsSync(`${exdir}/${exploit}/exploit.js`);
  },

  
}