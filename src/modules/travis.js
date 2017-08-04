const log = console.log,
      chalk = require('chalk'),
      readline = require('readline'),
      repodir = __dirname + '/../../repos',
      exdir = __dirname + '/../exploits',
      repolist = __dirname + '/../../configs/repos',
      files = require(__dirname + '/../lib/files'),
      targets = require(__dirname + '/../lib/targets'),
      fs = require('fs');

module.exports = {

  // Checks checks repo to see if it contains Travis-ci content
  isTravisRepo: (reponame) => {
    return fs.existsSync(`${repodir}/${reponame}/.travis.yml`);
  },

  //Loads an exploit into said repo
  loadTravisConfig: (exploit, authed_user, repo_name, callback) => {
    if (module.exports.isTravisRepo(repo_name)) {
      fs.createReadStream(`${exdir}/${exploit}/.travis.yml`).pipe(fs.createWriteStream(`${repodir}/${repo_name}/.travis.yml`).on('close', () => {
        log(chalk.green(`Travis config for ${repo_name} successfully overwritten`));
        return callback();
      }));
    }
    else {
      log(chalk.yellow(`Tried to load ${exploit}, but ${repo_name} does not appear to be a Travis-Repository`));
      return callback();
    }
  },

  loadTravisConfigAll: (exploit, authed_user, travis_targets, callback) => {
    const promises = [];
    for(let target in travis_targets) {
      promises.push(new Promise((resolve, reject) => {
        module.exports.loadTravisConfig(exploit, authed_user, travis_targets[target], () => {
          resolve();
        });
      }));
    }
    Promise.all(promises)
      .then(c => {
        return callback();
      }).catch(e => {
        log(chalk.red(`ERROR with function loadTravisConfigAll: ... ${e}`));
        return callback();
      });
    // var rd = readline.createInterface({
    //     input: fs.createReadStream(repolist)
    // });
    // rd.on('line', (line) => {
    //     promises.push(new Promise((resolve, reject) => {
    //         module.exports.loadTravisConfig(exploit, type, authed_user, line, () => {
    //             resolve();
    //         })

    //     }));
    //     //module.exports.loadTravisConfig(exploit, type, authed_user, line)
    // }).on('close', () => {
    //     Promise.all(promises)
    //         .then(c => {
    //             return callback();
    //         }).catch(e => {
    //             log(chalk.red(`ERROR with function loadTravisConfigAll: ... ${e}`));
    //             return callback();
    //         })
    //return callback();
    //});
  },

  //Get a list of cloned repos that contain .travis.yml files
  getForkedTravisRepos: (callback) => {
    const flist = files.walkSync(repodir),
          tlist = [];
    flist.forEach((item) => {
      if (item.includes(".travis.yml") && !item.includes("node_modules")) {
        tlist.push(item);
      }
    });
    return callback(tlist);
  },

  //Append line to travis config
  appendTravisConfig: (file, line) => {
    fs.appendFileSync(file, line, 'utf-8');
  },

  appendTravisConfigAll: (line, callback) => {
    const flist = files.walkSync(repodir),
          promises = [];
    for (let f in flist) {
      if (flist[f].includes('.travis.yml')) {
        promises.push(new Promise((resolve, reject) => {
          module.exports.appendTravisConfig(flist[f], line, () => {
            resolve();
          });
        }).catch(err => {
          log(err);
        }));
      }
    }
    //.on('close', () => {
    Promise.all(promises)
      .then(c => {
        return callback();
      }).catch(e => {
        log(chalk.red(`ERROR with function appendTravisConfigAll: ... ${e}`));
        return callback();
      });
  }
}