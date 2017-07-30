var log = console.log;
var fs = require('fs');
var clear = require('clear');
var chalk = require('chalk');
var path = require('path');
var exdir = __dirname + '/../exploits';
var expath = path.resolve(exdir);
var files = require(__dirname + '/files');

module.exports = {

    //Prints list of exploits
    printExploits: () => {
        clear();
        log(chalk.green("-----------------", "\n Exploits", "\n-----------------"));
        var exlist = files.walkSync(exdir);
        var tlist = []
        exlist.forEach((item) => {
            if (item.includes("exploit.js")) {
                tlist.push(item);
                log(item.replace(`${expath}/`, '').replace('/exploit.js',''));
            }
        })
        log();
        return tlist;
    },

    //Checks if exploits exist
    exploitExists: (exploit) =>{
        return fs.existsSync(`${exdir}/${exploit}/exploit.js`);
    }
}