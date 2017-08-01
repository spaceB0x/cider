const log = console.log,
      readline = require('readline'),
      fs = require('fs'),
      chalk = require('chalk'),
      files = require(__dirname + '/files'),
      targetlist = __dirname + '/../../configs/repos',
      repodir = __dirname + '/../../repos',
      clear = require('clear');

module.exports = {
  // print all repositories in current target list
  printTargets: (callback) => {
    const rd = readline.createInterface({
      input: fs.createReadStream(targetlist)
    });

    clear();
    log(chalk.green("-----------------", "\n GitHub Targets", "\n-----------------"));
    rd.on('line', (line) => {
      log(chalk.green(`${line}`));
    }).on('close', () => {
      return callback();
    });
  },

  /* Returns an array of targets in targetlist */
  getTargetArray: (callback) => {
    const rd = readline.createInterface({
      input: fs.createReadStream(targetlist)
    });
    let tarr = [];
    rd.on('line', (line) => {
      if (line.includes('/')) {
        tarr.push(line);
      }
    }).on('close', () => {
      return callback(tarr);
    });

  },


  /* Returns an array of targets of a certain type (eg. travis, drone, etc.) */
  getTargetType: (type, callback) => {
    let f,
        typearr = [];
    switch (type) {
      case 'travis':
        f = ".travis.yml";
        break;
      default:
        return callback();
    }
    module.exports.getTargetArray((arr) => {
      for (let line in arr) {
        if (files.fileExists(`${repodir}/${arr[line]}/${f}`)) {
          typearr.push(arr[line]);
        }
      }
      return callback(typearr);
    });
  },

  /* Returns two arrays 
     1.) The first being an array of targets
     2.) The 2nd being an array of forked targets (basically the owner name switched to attackers)
  */
  getForkedTargetArray: (username, callback) => {
    const rd = readline.createInterface({
      input: fs.createReadStream(targetlist)
    });
    let ftarr = [],
        tarr = [];
    rd.on('line', (line) => {
      if (line.includes('/')) {
        let rarr = line.split('/');
        tarr.push(line);
        ftarr.push(`${username}/${rarr[1]}`);
      }
    }).on('close', () => {
      return callback(tarr, ftarr);
    });

  },


  /* Returns two arrays
    1.) The first  of targets of a certain type (eg. travis, drone, etc.) */
  getForkedTargetType: (type, username, callback) => {
    let f,
        typearr = [],
        ftypearr = [];
    switch (type) {
      case 'travis':
        f = ".travis.yml";
        break;
      case 'drone':
        f = ".drone.yml";
        break;
      case 'circle':
        f = ".circleci/config.yml";
        break;
      default:
        return callback();
    }
    module.exports.getForkedTargetArray(username, (tarr, ftarr) => {
      for (let line in ftarr) {
        if (files.fileExists(`${repodir}/${ftarr[line]}/${f}`)) {
          typearr.push(tarr[line]);
          ftypearr.push(ftarr[line]);
        }
      }
      return callback(typearr, ftypearr);
    });
  },

  addTarget: (target, callback) => {
    if (target.includes("/")) {
      fs.readFile(targetlist, 'utf8', (err, data) => {
        if (err) {
          log(chalk.red(err));
        }
        const lines = data.split('\n');
        lines.push(`${target}`);

        fs.writeFile(targetlist, lines.join('\n'), () => {
          return callback();
        });
      });
    } 
    log(chalk.red("Invalid target. Target repos must be in the format 'owner/reponame'"));
    return callback();
    
  },

  removeTarget: (target, callback) => {
    fs.readFile(targetlist, 'utf8', function (err, data) {
      if (err) {
        log(chalk.red(err));
        return callback();
      }
      const lines = data.split('\n'),
            index = lines.indexOf(target);
      if (index != -1) {
        lines.splice(index, 1);
        fs.writeFile(targetlist, lines.join('\n'), () => {
          return callback();
        });
      } 
      log(chalk.red(`Target ${target}not found`));
      return callback();
      
    });
  },
  getNumTargets: () => {
    let lines = fs.readFileSync(targetlist, 'utf8').split('\n'),
        count = 0;
    for (let x in lines) {
      if (lines[x].includes("/")) {
        count++;
      }
    }
    return count;
  },

  isTarget: (target) => {
    let lines = fs.readFileSync(targetlist, 'utf8').split('\n'),
        count = 0;
    for (let x in lines) {
      if (target == lines[x] && target.includes("/")) {
        return true;
      }
    }
    log(chalk.red("Invalid. Session does not exist or is not a valid session name."));
    return false;
  }
}