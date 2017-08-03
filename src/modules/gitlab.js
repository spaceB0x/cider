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

  // Checks checks repo to see if it contains GitLab-ci content
  isGitLabRepo: (reponame) => {
    return fs.existsSync(`${repodir}/${reponame}/.gitlab-ci.yml`);
  },

  //Loads an exploit into said repo
  loadGitLabConfig: (exploit, authed_user, repo_name, callback) => {
    if (module.exports.isGitLabRepo(repo_name)) {
      fs.createReadStream(`${exdir}/${exploit}/.gitlab-ci.yml`).pipe(fs.createWriteStream(`${repodir}/${repo_name}/.gitlab-ci.yml`).on('close', () => {
        log(chalk.green(`GitLab config for ${repo_name} successfully overwritten`));
        return callback();
      }));
    }
    else {
      log(chalk.yellow(`Tried to load ${exploit}, but ${repo_name} does not appear to be a GitLab-Repository`));
      return callback();
    }
  },

  loadGitLabConfigAll: (exploit, authed_user, gitlab_targets, callback) => {
    const promises = [];
    for(let target in gitlab_targets) {
      promises.push(new Promise((resolve, reject) => {
        module.exports.loadGitLabConfig(exploit, authed_user, gitlab_targets[target], () => {
          resolve();
        });
      }));
    }
    Promise.all(promises)
      .then(c => {
        return callback();
      }).catch(e => {
        log(chalk.red(`ERROR with function loadGitLabConfigAll: ... ${e}`));
        return callback();
      });
    // var rd = readline.createInterface({
    //     input: fs.createReadStream(repolist)
    // });
    // rd.on('line', (line) => {
    //     promises.push(new Promise((resolve, reject) => {
    //         module.exports.loadGitLabConfig(exploit, type, authed_user, line, () => {
    //             resolve();
    //         })

    //     }));
    //     //module.exports.loadGitLabConfig(exploit, type, authed_user, line)
    // }).on('close', () => {
    //     Promise.all(promises)
    //         .then(c => {
    //             return callback();
    //         }).catch(e => {
    //             log(chalk.red(`ERROR with function loadGitLabConfigAll: ... ${e}`));
    //             return callback();
    //         })
    //return callback();
    //});
  },

  //Get a list of cloned repos that contain .gitlab-ci.yml files
  getForkedGitLabRepos: (callback) => {
    const flist = files.walkSync(repodir),
          tlist = [];
    flist.forEach((item) => {
      if (item.includes(".gitlab-ci.yml") && !item.includes("node_modules")) {
        tlist.push(item);
      }
    });
    return callback(tlist);
  },

  //Append line to GitLab config
  appendGitLabConfig: (file, line) => {
    fs.appendFileSync(file, line, 'utf-8');
  },

  appendGitLabConfigAll: (line, callback) => {
    const flist = files.walkSync(repodir),
          promises = [];
    for (let f in flist) {
      if (flist[f].includes('.gitlab-ci.yml')) {
        promises.push(new Promise((resolve, reject) => {
          module.exports.appendGitLabConfig(flist[f], line, () => {
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
        log(chalk.red(`ERROR with function appendGitLabConfigAll: ... ${e}`));
        return callback();
      });
  }
}