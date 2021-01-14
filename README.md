### UPDATE/ANNOUNCEMENT: 
I will be ending support for this framework, and likely will start working on a new implementation for an exploit and recond framework for CI/CD. I was convinced that I had announced this already, but I guess I had not. I will remain public, so as not to break any existing implementations or integrations. Much love. spaceB0x 

# CIDER
## Continuous Integration and Deployment Exploiter

CIDER is a framework written in node js that aims to harness the functions necessary for exploiting Continuous Integration (CI) systems and their related infrastructure and build chain (eg. Travis-CI, Drone, Circle-CI). Most of the exploits in CIDER exploit CI build systems through open GitHub repositories via malicious Pull Requests. It is built modularly to encourage contributions, so more exploits, attack surfaces, and build chain services will be integrated in the future.


## Setup
### Prerequisites 
* Node JS version 8.2.1 Node is cross platform for both Windows, Linux, and OSX. NOTE: For OSX I highly recommend downloading npm and    Node.js from the respective download links, instead of using brew. This can cause many frustrating problems. https://nodejs.org/en/
* Must also have the Node Package Manager installed (npm).
* A github account, with an Oauth application enabled.
* An ngrok account, which is free. You will need the authentication key from this. https://ngrok.com/

### Configuration
There has been effort put in to CIDER to make configuration as simple as possible. More convenience features may in future releases.

#### NPM modules
Once node has been installed traverse to the root directory of the repository. To download the necessary dependencies you must run:
```
npm install --save
```
Which should find all of the necessary dependencies listed in the package.json file. You should now be able to fire up CIDER by typing:
```
node index.js
```

## GitHub configuration
You must have a GitHub account from which to launch these attacks. The idea being that your attacker account makes malicous pull requests against a target GitHub repository to test and exploit misconfigurations. Additionally you must have and OAuth application configured such that you can issue personal tokens from gitHub. CIDER will take care of generating a token for you, but the feature must be enabled in GitHub.

### `login <servicename>`
The login command takes two arguments. `github` or `ngrok`. It will then prompt you for your GitHub username and password, or your ngrok token respectively. It will store them in an encrypted manner locally and should retrieve them automatically from tha point on. 
```
login github
```

__NOTE__: to login to gitHub after you already have a token will fail. This is because you already have a 'personal token' issued in gitHub for the CIDER service. You will have to delete that token in GitHub before running the login again. This is to prevent you from generating a billion freaking tokens by accident. 

__ANOTHER NOTE__: There is currently a bug with the login feature. Once you enter your credentials they will only retain once you exit CIDER and open it back up again. So currently the workaround for say the ngrok login; is to first do 
    1.) __login ngrok__
    2.) Enter Creds
    3.) __exit__
    4.) Reopen CIDER
Working on a fix for this

## Ngrok configuration
This is the same as above, however you will simply be prompted for your Ngrok auth token which can be grabbed from your account. 
```
login ngrok
```

## Main Commands
### `help`
Lists the help menu

### `clear`
Clears the screen

### `list`
Lists the following items which it takes as arguments
  - __targets__  *Lists all repositories that are in the targets list. These are what the will attempt to be exploited when running and exploit.
  - __exploits__ *Lists all available exploits. 

### `add`
This addes a target. Takes arguments 'target' and then the target repo name. Ex `add target <ownername>/<reponame>`

### `remove`
This removes a target. Takes arguments 'target' and then the target repo name. Ex `remove target <ownername>/<reponame>`

### `load`
Loads an exploit to be used. Ex. `load <exploitname>`. Available exploits can be found by `list exploits`

### `unload`
Unloads the currently loaded exploit.

### `info`
Lists info for the currently loaded exploits. Does not work if no exploit is loaded.

### `sessions`
This takes you to the sessions menu for managing live callback sessions.

## Sessions menu
Once in the sessions menu there are only a handful of commands to run
### `list`
Lists the available sessions.

### `back`
This serves two purposes. If you are in the base SESSIONS menu it will return you to the CIDER menu. If you are currently in a running session, it will retrun you to the SESSIONS menu.

### `select`
This selects a session shell to drop into. Takes the form `select <sessionname>`. 
