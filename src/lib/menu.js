const chalk = require('chalk'),
      clear = require('clear'),
      figlet = require('figlet'),
      log = console.log;


//
module.exports = {
  printBanner: () => {
    //Print banner
    clear();
    log(
      chalk.green(
        figlet.textSync('\nCIDER', {
          horizontalLayout: 'full'
        })
      )
    );
    log(chalk.yellow("Continuous Integration and Deployment Exploiter"));
    log(chalk.blue(
      "-----------------------------------------------",
      "\nMaintained by spaceB0x - Twitter: @spaceB0xx ",
      "\n-----------------------------------------------"
    ));
  },

  startSpinner: () => {
    authStatus.start();
  },

  stopSpinner: () => {
    authStatus.stop();
  },

  printHelp: () => {
    //Print help menu
    clear();
    log("------------------", "\n Basic Commands  |", "\n------------------\n");
    log(chalk.cyan('  help') + chalk.gray('\t\t\t=> Prints this very help menu'));
    log(chalk.cyan('  exit') + chalk.gray('\t\t\t=> Exits CIDER'));
    log(chalk.cyan('  login [SERVICE]') + chalk.gray('\t=> Login to GitHub or Ngrok'));
    log(chalk.cyan('     github'));
    log(chalk.cyan('     ngrok'));
    log(chalk.cyan('  clear') + chalk.gray('\t\t\t=> Clear screen'));
    log("\n");
    log("-----------------------", "\n Exploit Commands  |", "\n-----------------------\n");
    log(chalk.cyan('  list') + chalk.gray('\t\t\t=> Lists assets based on the options give'));
    log(chalk.cyan('     targets') + chalk.gray('\t\t=> Prints all targets in target list'));
    log(chalk.cyan('     repos') + chalk.gray('\t\t=> Prints repositories currently pulled down.'));
    log(chalk.cyan('     exploits') + chalk.gray('\t\t=> Prints available exploits.'));
    log(chalk.gray('  \t\t\t   These may or may not match targets list'));
    log(chalk.cyan('  load [EXPLOIT]') + chalk.gray('\t=> Load an exploit'));
    log(chalk.cyan('  unload') + chalk.gray('\t\t=> Unload currently loaded exploit. No paramaters necessary.'));
    log(chalk.cyan('  info') + chalk.gray('\t\t\t=> Provide information about a loaded exploit. Must have exploit loaded.'));
    log(chalk.cyan('  run') + chalk.gray('\t\t\t=> Use the currently loaded exploit against target list'));
    log(chalk.cyan('  sessions') + chalk.gray('\t\t=> Migrate to sessions mode to manage callback sessions/shells'));
    log(chalk.cyan('  add') + chalk.gray('\t\t\t=> Add a target by specifying so'));
    log(chalk.cyan('     target [TARGET]') + chalk.gray('\t=> Parameter to "add" command, in form repo_owner/repo_name'));
    log(chalk.cyan('  remove') + chalk.gray('\t\t=> Remove a target by specifying so'));
    log(chalk.cyan('     target [TARGET]') + chalk.gray('\t=> Parameter to "remove" command, in form repo_owner/repo_name'));
    log("\n");

  },

  clearScreen: () => {
    clear();
  },

  printListHelp: () => {
    clear();

  }
}