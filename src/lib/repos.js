const log = console.log,
      https = require('http'),
      chalk = require('chalk'),
      clear = require('clear'),
      crypto = require('crypto'),
      fs = require('fs'),
      files = require(__dirname + '/files'),
      readline = require('readline'),
      repolist = __dirname + '/../../configs/repos',
      repodir = __dirname + '/../../repos',
      GitHubApi = require('github'),
      github = new GitHubApi({version: '3.0.1'}),
      git = require('simple-git')(),
      gh = require(__dirname + '/gh'),
      path = require('path'),
      Preferences = require('preferences'),
      _ = require('lodash');


module.exports = {

  /* ---------------------
    CLONE METHODS
  ------------------------*/

  // Clone a single repository
  // type - is either 'direct' or 'fork'.
  // If type is the string `fork`, then it will supplement the target repo
  //     owner name, with that of the authed user. This should only be used
  //     after checks further upthe stack have been perfomed to make sure the 
  //     forks exist. 
  cloneRepo: (type, repo_name, authed_user, callback) => {

    dirs_arr = repo_name.split('/');
    var reponame;
    if (type == "forked") {
      reponame = `${authed_user}/${dirs_arr[1]}`;
    } 
    else {
      reponame = repo_name;
    }

    //Check if repo has been cloned
    if (module.exports.repoIsCloned(reponame)) {
      log(chalk.yellow(`Repo ${reponame} is already cloned`));
      return callback();
    }
    // If organization folder exists
    else if (files.directoryExists(`${repodir}/${dirs_arr[0]}`)) {
      // If git repo found
      if (!files.directoryExists(`${repodir}/${reponame}/.git`) && !files.directoryExists(`${repodir}/${reponame}`)) {
        log(chalk.green(`Cloning github.com/${reponame}.git`))
        git.clone(`https://github.com/${reponame}.git`, `${repodir}/${reponame}`, () => {
          log(chalk.green(`https://github.com/${reponame}.git cloned successfully`));
          return callback();
        });
      } 
      else {
        log(chalk.yellow(`The repo ${reponame} already exists`));
        return callback();
      }
      

    } 
    else {
      // Make org folder, and clone repo
      fs.mkdirSync(`${repodir}/${dirs_arr[0]}`);
      fs.mkdirSync(`${repodir}/${reponame}`)
      git.clone(`https://github.com/${reponame}.git`, `${repodir}/${reponame}`, () => {
        log(chalk.green(`https://github.com/${reponame}.git cloned successfully`));
        return callback();
      });
    }
  },

  //Clone all repositories in targets list
  // type - is either 'direct' or 'fork'.
  cloneAllRepos: (type, authed_user, callback) => {
    const rd = readline.createInterface({
          input: fs.createReadStream(repolist)
    });

    const promises = [];
    rd.on('line', (line) => {
      promises.push(new Promise((resolve, reject) => {
        module.exports.cloneRepo(type, line, authed_user, () => {
          resolve();
        });
      }));
    }).on('close', () => {
      Promise.all(promises)
        .then(c => {
          return callback();
        }).catch(e => {
          log(`${e}`);
          return callback();
        });
    });
  },

  // Check if repo has been cloned
  repoIsCloned: (reponame) => {
    return (fs.existsSync(`${repodir}/${reponame}`) && fs.existsSync(`${repodir}/${reponame}/.git`));
  },


  /* ------------------------
    PULL REQUEST METHODS
  --------------------------*/

  // Make pull request for all targets
  pullRequestAll: (token, type, authed_user, list, callback) => {

    const hexstring = crypto.randomBytes(Math.ceil(12 / 2)).toString('hex').slice(0, 12),
          branch = `cider-${hexstring}`;

    const promises = [];
    for (let line in list) {
      promises.push(new Promise((resolve, reject) => {
        gh.makePullRequest(token, type, list[line], branch, authed_user, () => {
          resolve();
        });
      }).catch(err => {
        reject();
        log(err);
      }));
    }
    Promise.all(promises)
      .then(c => {
        return callback();
      })
      .catch(e =>{
        if(e){
          log(chalk.red(`Error with pullRequestAll ${e}`));
        }
      });
    // var rd = readline.createInterface({
    //     input: fs.createReadStream(repolist)
    // });
    // rd.on('line', (line) => {
    //     //promises.push(module.exports.loadTravisConfig(exploit, type, authed_user, line).catch("Test"))
    //     promises.push(new Promise((resolve, reject) => {
    //         gh.makePullRequest(token, type, line, branch, authed_user, () => {
    //             resolve();
    //         });
    //     }).catch(err => {
    //         log(err);
    //     }))
    // }).on('close', () => {
    //     Promise.all(promises)
    //         .then(c => {
    //             status.stop();
    //             return callback();
    //         })
    // });
  },

  /* ---------------------
    FORK METHODS
  ------------------------*/
  // Checks if forked repo exists and is .git repo
  forkedRepoIsCloned: (reponame) => {
    return (fs.existsSync(`${repodir}/forked/${reponame}`) && fs.existsSync(`${repodir}/forked/${reponame}/.git`));
  },

  //Check if fork exists in authenticated user's repo
  forkExists: (reponame, token, authed_user, callback) => {
    var repo_arr = reponame.split("/");
    github.repos.getForks({
      headers: {
        "Authorization": `token ${token}`
      },
      owner: repo_arr[0],
      repo: repo_arr[1],
    }, (err, res) => {
      if (err) {
        log(err);
        return callback(false);
      } 
      else if (res) {
        const data_arr = res.data,
              full_name_array = _.map(data_arr, 'full_name');
        if (err) {
          log(err);
          return callback(false);
        }
        else if (full_name_array.includes(`${authed_user}/${repo_arr[1]}`)) {
          return callback(true);
        } 
        else {
          return callback(false);
        }
      }
      else {
        log(chalk.red("Could not find a response to the request for forks"));
        return callback(false);
      }
    });
  },

  // Fork the target repo for the authenticated user
  requestFork: (reponame, token, callback) => {
    repo_arr = reponame.split("/");

    github.repos.fork({
      headers: {
        "Authorization": `token ${token}`
      },
      owner: repo_arr[0],
      repo: repo_arr[1],
    }, (err, res) => {
      if (err) {
        log(chalk.red(`There was a problem forking the repo: ${err}`));
        return callback();
      }
      else {
        return callback();
      }
    });
  },

  // Fork a single repo
  forkRepo: (reponame, token, authed_user, callback) => {
    dirs_arr = reponame.split('/');

    //Check if repo already forked
    module.exports.forkExists(reponame, token, authed_user, (exists) => {
      if (exists) {
        log(chalk.yellow(`Repo ${reponame} already forked for user ${authed_user}`));
        return callback();
      }
      else {
        // If organization folder exists
        module.exports.requestFork(reponame, token, () => {
          log(chalk.green(`https://github.com/${reponame}.git forked successfully`));
          return callback();
        });
      }
    });
  },

  // Fork all targets
  forkAll: (token, authed_user, callback) => {
    //Read targets into array
    const rd = readline.createInterface({
          input: fs.createReadStream(repolist)
    });

    // Readlines, call forkRepo for each line
    // must wrap these in a Promise wrapper to deal with race conditions
    const promises = [];
    rd.on('line', (line) => {
      promises.push(new Promise((resolve, reject) => {
        module.exports.forkRepo(line, token, authed_user, () => {
          resolve();
        });
      }));
    }).on('close', () => {
      Promise.all(promises)
        .then(c => {
          return callback();
        });
    });
  },
}