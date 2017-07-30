var chalk = require('chalk');
var readline = require('readline');
var path = require('path');
var menu = require(__dirname + '/menu');
var log = console.log;
var clear = require('clear');
var _ = require('lodash');
//var main_prompt = require(__dirname + '/prompt');
var github = require(__dirname + '/gh');
var repos = require(__dirname + '/repos');
var travis = require(__dirname + '/../modules/travis');
var expdir = path.resolve(__dirname + '/../exploits');
var exp = require(__dirname + '/exp')
var targets = require(__dirname + '/targets');
var ncserver = require(__dirname + '/server');
var ng = require(__dirname + '/ng');
var loaded_session;

var serv_arr = [];

function sessionPrompt(callback) {
    var add_prompt = '';
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: `SESSIONS${add_prompt} > `
    });

    rl.prompt();
    rl.on('line', (line) => {
        linearr = line.trim().split(" ");

        rl.pause();
        switch (linearr[0].trim()) {
            case 'help':
                printSessionHelp();
                rl.prompt();
                break;
            case 'clear':
                clear();
                rl.prompt();
                break;
            case 'back':
                rl.close();
                return callback(0);
                break;
            case 'list':
                clear();
                listSessions();
                rl.prompt();
                break;
            case 'select':
                rl.close();
                if (linearr[1] && isSession(linearr[1])) {
                    if (linearr[1].includes("/")) {
                        loadSession(linearr[1], () => {
                            return callback(1)
                        });
                    } else {
                        log(chalk.red("Invalid. Session does not exist."));
                        return callback(1);
                    }
                } else {
                    log(chalk.red("You must pick a valid session to select."));
                    return callback(1);
                }
                break;
            case 'test':
                log(loaded_session);
                break;
            default:
                log(chalk.red(`'${line.trim()}' is an unknown command`));
                log(chalk.yellow(`Type 'help' for a list of commands`));

                rl.prompt();
                break;
        }
    }).on('close', () => {

    })
}

function loadSession(session, callback) {
    clear();
    log(`SESSION [${chalk.red(session)}]`);
    loaded_session = session;
    let duplexIn = global.duplexInput_arr[_.indexOf(global.session_name_arr, session)];
    let duplexOut = global.duplexOutput_arr[_.indexOf(global.session_name_arr, session)];

    if (duplexIn.isPaused()) {
        duplexIn.resume();
    }
    if (duplexOut.isPaused()) {
        duplexOut.resume();
    }

    process.stdin.pipe(duplexIn);
    duplexOut.pipe(process.stdout);
    var rs = readline.createInterface({
        input: duplexIn,
        output: duplexOut,
        prompt: ''
    });


    rs.prompt()
    rs.on('line', (line) => {
        var d = line.toString('utf8').trim();
        rs.pause();
        switch (d) {
            case 'back':
                rs.close();
                log(chalk.blue("Jumping out of shell, back to sessions menu..."));
                process.stdin.unpipe(duplexIn);
                duplexOut.unpipe(process.stdout);
                return callback();
                break;
            default:
                rs.prompt();
                break;
        }
    });
}

function listSessions() {
    log(chalk.green("  Sessions  \n------------"));
    for (let s in global.shells_arr) {
        log(`${global.session_name_arr[s]}`);
    }
    return
}

function isSession(name) {
    for (let s in global.session_name_arr) {
        if (global.session_name_arr[s] == name) {
            return true
        }
    }
    return false
}

function printSessionHelp() {
    clear();
    log("\n-----------------\n  Sessions Help  \n-----------------\n");
    log(chalk.cyan('  help') + chalk.gray('\t\t\t  => Prints help menu for Sessions'));
    log(chalk.cyan('  back') + chalk.gray('\t\t\t  => Returns to the main CIDER prompt. Also exits out of a shell if in one'));
    log(chalk.cyan('  list') + chalk.gray('\t\t\t  => Lists existing shells'));
    log(chalk.cyan('  select [SESSION_NAME]') + chalk.gray('\t  => Selects an loads the session to jump into\n'));

}

//Module exports    
module.exports = {
    sessionPrompt: sessionPrompt
}