const chalk = require('chalk'),
      readline = require('readline'),
      path = require('path'),
      util = require('util'),
      menu = require(__dirname + '/menu'),
      stream = require('stream'),
      log = console.log,
      clear = require('clear'),
      github = require(__dirname + '/gh'),
      repos = require(__dirname + '/repos'),
      travis = require(__dirname + '/../modules/travis'),
      expdir = path.resolve(__dirname + '/../exploits'),
      exp = require(__dirname + '/exp'),
      targets = require(__dirname + '/targets'),
      ncserver = require(__dirname + '/server'),
      sessions = require(__dirname + '/sessions'),
      ng = require(__dirname + '/ng');

let loaded_exploit;

// Define some pivotal global arrays
global.shells_arr = [];
global.duplexInput_arr = [];
global.duplexOutput_arr = [];
global.session_name_arr = [];
global.session_exploit_arr = [];

/* Main Prompt function. The central nervous system of CIDER */

function mainPrompt() {
  let add_prompt;
  if (loaded_exploit) {
    add_prompt = ` [${chalk.red(loaded_exploit.name())}]`;
  } 
  else {
    add_prompt = '';
  }

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `CIDER${add_prompt} > `
  });

  rl.prompt();
  rl.on('line', (line) => {
    linearr = line.trim().split(" ");

    rl.pause();
    switch (linearr[0].trim()) {
      case 'help':
        menu.printHelp();
        rl.prompt();
        break;
      case 'exit':
        log('Thanks for using CIDER. Goodbye!');
        process.exit(0);
        break;
      case 'login':
        rl.close();
        if (linearr[1] == "github") {
          github.githubAuth((err, authed, username) => {
            mainPrompt();
          });
          break;
        } else if (linearr[1] == "ngrok") {
          ng.ngrokAuth((err, token) => {
            mainPrompt();
          });
          break;
        } else {
          log(chalk.red("Please specify which service to provide credentials for"));
          log(chalk.yellow("Examples: 'login github' or 'login ngrok'"));
          mainPrompt();
          break;
        }
      case 'clear':
        menu.clearScreen();
        rl.prompt();
        break;
      case 'add':
        rl.close();
        if (linearr[1] == "target") {
          if (linearr[2]) {
            targets.addTarget(linearr[2], () => {
              mainPrompt();
            });
            break;
          } else {
            log(chalk.red("Must provide a target to add to list"));
            mainPrompt();
            break;
          }
        } else if (linearr[1]) {
          log(chalk.red(`${linearr[1]} is not recognized as something to add`));
          mainPrompt();
          break;
        } else {
          log(chalk.red("Please provide something to add (like a target). eg. 'add target <target_repo_name>'"));
          mainPrompt();
          break;
        }

      case 'remove':
        rl.close();
        if (linearr[1] == "target") {
          if (linearr[2]) {
            targets.removeTarget(linearr[2], () => {
              mainPrompt();
            });
            break;
          } else {
            log(chalk.red("Must provide a target to remove from target list"));
            mainPrompt();
            break;
          }
        } else if (linearr[1]) {
          log(chalk.red(`${linearr[1]} is not recognized as something to remove`));
          mainPrompt();
          break;
        } else {
          log(chalk.red("Please provide something to remove (like a target). eg. 'remove target <target_repo_name>'"));
          mainPrompt();
          break;
        }
      case 'list':
        rl.close();
        if (linearr[1] == "targets") {
          targets.printTargets(() => {
            mainPrompt();
          });
          break;
        } else if (linearr[1] == "exploits") {
          exp.printExploits();
          mainPrompt();
          break;
        } else {
          mainPrompt();
          break;
        }
      case 'run':
        rl.close();
        if (loaded_exploit) {
          if (exp.exploitExists(loaded_exploit.name())) {
            loaded_exploit.run(() => {
              mainPrompt();
            });
            break;
          } else {
            log(chalk.red(`Exploit ${loaded_exploit.name()} does not exist`));
            mainPrompt();
            break;
          }
        } else {
          log(chalk.red("No exploit module provided"));
          mainPrompt();
          break;
        }
      case 'load':
        rl.close();
        if (linearr[1]) {
          if (exp.exploitExists(linearr[1])) {
            loaded_exploit = require(`${expdir}/${linearr[1]}/exploit.js`);
            mainPrompt();
            break;
          } else {
            log(chalk.red(`Exploit ${linearr[1]} does not exist`));
          }
          //code to load exploit
        } else {
          log(chalk.red("No exploit module provided"));
          mainPrompt();
          break;
        }
      case 'unload':
        rl.close();
        loaded_exploit = null;
        mainPrompt();
        break;
      case 'info':
        rl.close();
        if (loaded_exploit) {
          clear();
          loaded_exploit.info(() => {
            mainPrompt();
          });
          break;
        } else {
          log(chalk.red("No exploit loaded. Load an exploit to get information about it"));
          mainPrompt();
          break;
        }
      case 'sessions':
        rl.close();
        clear();
        sessions.sessionPrompt((num) => {
          if (num) {
            sessionLoop();
          } else {
            mainPrompt();
          }
        });
        break;
      case 'test':
        rl.close();
        const a = targets.isTarget("spacetesterson/cidertest8");
        log(a);

        break;
      default:
        log(chalk.red(`'${line.trim()}' is an unknown command`));
        log(chalk.yellow(`Type 'help' for a list of commands`));
        rl.prompt();
        break;
    }
  }).on('close', () => {});
}

function sessionLoop() {
  sessions.sessionPrompt(sessionCB);
}

function sessionCB(num) {
  if (num) {
    sessionLoop();
  } 
  else {
    mainPrompt();
  }
}

//Module exports    
module.exports = {
  mainPrompt: mainPrompt
}