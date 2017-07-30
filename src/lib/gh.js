var GitHubApi = require('github');
var git = require('simple-git')();
var github = new GitHubApi({
    version: '3.0.1'
});
var inquirer = require('inquirer');
var fs = require('fs');
var CLI = require('clui');
var Spinner = CLI.Spinner;
var Preferences = require(__dirname + '/preferences');
var _ = require('lodash');
var log = console.log;
var chalk = require('chalk');
var files = require('./files');
var configdir = __dirname + '/../../configs';
var repodir = __dirname + '/../../repos';



module.exports = {

    //Gets the GitHub credentials from the user through the prompt
    getGithubCredentials: (callback) => {
        var questions = [{
                name: 'username',
                type: 'input',
                message: 'Enter your Github username (not e-mail address):',
                validate: function (value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter your username or e-mail address';
                    }
                }
            },
            {
                name: 'password',
                type: 'password',
                message: 'Enter your password:',
                validate: function (value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter your password';
                    }
                }
            }
        ];
        inquirer.prompt(questions).then(callback);
    },

    //Gets the github token from a configuration if it exists. Otherwise it creates one and stores it.
    getGithubToken: (callback) => {
        var authStatus = new Spinner('Authenticating you, please wait...');
        var prefs = new Preferences('cider');
        //check if token cached in prefs
        if (prefs.github && prefs.github.token && prefs.github.username) {
            log(chalk.green("GitHub token found"))
            return callback(null, prefs.github.token, prefs.github.username);
        } else {
            // Fetch token
            module.exports.getGithubCredentials((credentials) => {
                var uname = credentials.username;
                var status = new Spinner('Authenticating you, please wait...');
                authStatus.start();
                github.authenticate(
                    _.extend({
                            type: 'basic',
                        },
                        credentials
                    )
                );

                github.authorization.create({
                    scopes: ['user', 'public_repo', 'repo', 'repo:status'],
                    note: 'cider'
                }, function (err, res) {
                    authStatus.stop();
                    if (err) {
                        log(`Error at github.authorization.create ${err}`)
                        return callback(err);
                    }
                    if (res.data.token) {
                        log(chalk.green("Success. Caching encrypted OAuth token"));
                        prefs.github = {
                            token: res.data.token,
                            username: uname
                        };
                        return callback(null, res.data.token, uname);
                    }
                    return callback();

                });
            });
        }
    },

    /*
    Uses the token to authenticate to github.
    Returns the token and the associated username
    */
    githubAuth: (callback) => {
        //check if prefs file exists and creat if it doesn't.
        // Solves a permissions issue with the Preferences library
        if(!files.fileExists(`${configdir}/cider.pref`)){
            fs.openSync(`${configdir}/cider.pref`, 'a');
        }
        module.exports.getGithubToken((err, token, username) => {
            if (err) {
                return callback(err);
            }
            github.authenticate({
                type: 'oauth',
                token: token
            });
            return callback(null, token, username);
        });
    },

    //Makes a single pull request
    makePullRequest: (token, type, reponame, branch, myowner, callback) => {
        // Target repo
        var repoarr = reponame.split("/");
        switch (type) {
            case "forked":
                git.cwd(`${repodir}/${myowner}/${repoarr[1]}`)
                    .checkoutLocalBranch(branch)
                    .add('./*', () => {})
                    .commit('Cider commit')
                    .push(['-u', 'origin', branch], (err) => {
                        if (err) {
                            log(chalk.red(`There was an error pushing the commits to master for ${myowner}:${branch}`))
                        }
                    })
                    .exec(() => {
                        var probj = {
                            headers: {
                                "Authorization": `token ${token}`
                            },
                            owner: repoarr[0],
                            repo: repoarr[1],
                            title: 'Cider-exploit-travis-test',
                            head: `${myowner}:${branch}`,
                            base: 'master'
                        }
                        github.pullRequests.create(probj).catch(e => {
                            log(chalk.red(`ERROR making pull request against the repo ${reponame} for user ${myowner}: \n ${e}`));
                        });
                        return callback();
                    });
                break;
            default:
                var push_promise = git.cwd(`${repodir}/${reponame}`)
                    .checkoutLocalBranch(branch)
                    .add('./*')
                    .commit('cider test message')
                    .push(['-u', 'origin', branch], () => {
                        var probj = {
                            headers: {
                                "Authorization": `token ${token}`
                            },
                            owner: repoarr[0],
                            repo: repoarr[1],
                            title: 'Cider-exploit-travis-test',
                            head: branch,
                            base: 'master'
                        }

                        github.pullRequests.create(probj).catch(e => {
                            log(chalk.red(`ERROR making pull Request: \n ${e}`));
                        });
                        return callback();
                    })
        }
    },

    checkRemoteBranchExists: () => {

    },

    resetRepo: (reponame) => {
        var repoarr = reponame.split("/");
        git.cwd(`${repodir}/${reponame}`)
            .checkoutLocalBranch("master")
            .pull()
    },
}