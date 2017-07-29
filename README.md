# CIDER
## Continuous Integration and Deployment Exploiter

CIDER is a framework written in node js that aims to harness the functions necessary for exploiting Continuous Integration (CI) systems and their related infrastructure and build chain (eg. Travis-CI, Drone, Circle-CI). Most of the exploits in CIDER exploit CI build systems through open GitHub repositories via malicious Pull Requests. It is built modularly to encourage contributions, so more exploits, attack surfaces, and build chain services will be integrated in the future.


##Setup
###Prerequisites
1.) Node JS version 8. Node is cross platform for both Windows, Linux, and OSX. 
2.) Must also have the Node Package Manager installed (npm).
3.) A github account, with an Oauth application enabled.
4.) An ngrok account, which is free. You will need the authentication key from this

###Configuration
There has been effort put in to CIDER to make configuration as simple as possible. More convenience features may in future releases.

####NPM modules
Once node has been installed traverse to the root directory of the repository. To download the necessary dependencies you must run:
```
npm install --save
```
Which should find all of the necessary dependencies listed in the package.json file. You should now be able to fire up CIDER by typing:
```
node index.js


####GitHub configuration
You must have a GitHub account from which to launch these attacks. The idea being that your attacker account makes malicous pull requests against a target GitHub repository to test and exploit misconfigurations. Additionally you must have and OAuth application configured such that you can issue personal tokens from gitHub. CIDER will take care of generating a token for you, but the feature must be enabled in GitHub.

##`login <servicename>`
The login command takes two arguments. github or ngrok. It will then prompt you for your GitHub username and password, or your ngrok token respectively. It will store them in an encrypted manner locally and should retrieve them automatically from tha point on. 
```
login github
```

NOTE: to login to gitHub after you already have a token will fail. This is because you already have a 'personal token' issued in gitHub for the CIDER service. You will have to delete that token in GitHub before running the login again. This is to prevent you from generating a billion freaking tokens by accident. 

####Ngrok configuration
This is the same as above, however you will simply be prompted for your Ngrok auth token which can be grabbed from your account. 
```
login ngrok
```

###`help`

###`clear`

###`list`

###`add`

###`remove`
###`load`
###`unload`
###`info`
###`sessions

## Sessions menu
Once in the sessions menu there are only a handful of commands to run
###`list`
###`back`
###`select`

23719666
