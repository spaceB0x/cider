var log = console.log;
var chalk = require('chalk');
var ngrok = require('ngrok');
const stream = require('stream');
var Duplex = stream.Duplex;
const util = require('util');
const NetcatServer = require('netcat/server');
const nc = new NetcatServer();
const base_port = 4444;

module.exports = {
    //start a single netcat listener given a port
    // return the nc server and associated duplex stream
    startNetcatListener: async(port, callback) => {
        // Establish reader/writer streams
        var duplexIn = createDuplexStream();
        var duplexOut = createDuplexStream();
        var nc = new NetcatServer()
        await nc.port(port)
            .listen()
            .k()
            .serve(duplexIn)
            .on('ready', () => {
                log(chalk.green(`Netcat listening locally on port ${port}`));
                return callback(nc, duplexIn, duplexOut);
            })
            .on('connection', () => {
                log(chalk.green("The eagle has landed!"));
            })
            .on('end', () => {
                log(chalk.red("Client ended the connection..."));
            })
            .pipe(duplexOut);

        return nc
    },

    // Starts a netcat instance for each 
    // returns two arrays, one of the netcat listeners and one for respective ports
    startNetcatAll: (targets, callback) => {
        let dupIn_arr = [];
        let dupOut_arr = [];
        let nc_arr = [];
        let ports_arr = [];
        let promises = [];
        let startport = base_port + module.exports.getNumberOfShells();
        for (let s = 0; s < targets.length; s++) {
            promises.push(new Promise((resolve, reject) => {
                module.exports.startNetcatListener((startport + s), (nc, din, dout) => {
                    ports_arr[s] = startport + s;
                    dupIn_arr[s] = din;
                    dupOut_arr[s] = dout
                    nc_arr[s] = nc;
                    resolve();
                })
            }).catch(err => {
                log(err);
            }))
        }
        Promise.all(promises)
            .then(c => {
                return callback(nc_arr, ports_arr, dupIn_arr, dupOut_arr);
            })
    },

    startNetcatTempListener: async(callback) => {
        // Establish reader/writer streams
        let port = base_port + module.exports.getNumberOfShells() + 1000
        var duplex = createDuplexStream();
        var nc = new NetcatServer()
        await nc.port(port)
            .listen()
            .k()
            .serve(null)
            .on('ready', () => {
                log(chalk.green(`Netcat listening locally on port ${port}`));
                return callback(nc, duplex, port);
            })
            .on('connection', () => {
                log(chalk.green("The eagle has landed!"));
            })
            .pipe(duplex);
        return nc
    },

    startNgrokConnect: (port, token, callback) => {
        var server = ngrok.connect({
            proto: 'tcp',
            addr: port,
            authtoken: token
        }, (err, url) => {
            if (err) {
                log(chalk.red(`Error with startNgrokConnect: ${err}`))
                return callback(err);
            } else {
                let host_port_arr = url.replace("tcp://", "").split(':');
                let h = host_port_arr[0];
                let p = host_port_arr[1];
                return callback(null, h, p, server, url);
            }
        })
    },

    /*returns arrays of all of all of the same
     values that startNgrokConnect returns
     Determines how many instances of ngrok to start based on the number of netcat ports */
    startNgrokAll: (portslist, token, callback) => {
        let promises = [],
            err_arr = [],
            hosts_arr = [],
            ports_arr = [],
            server_arr = [],
            url_arr = [];
        for (let s = 0; s < portslist.length; s++) {
            promises.push(new Promise((resolve, reject) => {
                module.exports.startNgrokConnect(portslist[s], token, (err, host, port, server, url) => {
                    if (err) {
                        reject(err);
                    }
                    hosts_arr[s] = host;
                    ports_arr[s] = port;
                    server_arr[s] = server;
                    url_arr[s] = url;
                    resolve();
                })
            }))
        }
        Promise.all(promises)
            .then(c => {
                return callback(null, hosts_arr, ports_arr, server_arr, url_arr);
            })
            .catch(e => {
                log(chalk.red(`Error with startNgrokAll ${e}`))
                return callback(e)
            })
    },

    attachSession: (name, callback) => {

    },

    pause: (milliseconds) => {
        var dt = new Date();
        while ((new Date()) - dt <= milliseconds) {}
    },

    getNumberOfShells: () => {
        if (!global.shells_arr) {
            return 0
        } else {
            return global.shells_arr.length;
        }
    },
}

/* Creates and returns a duplex stream */
function createDuplexStream() {
    function duplexFunc() {
        if (!(this instanceof duplexFunc)) {
            return new duplexFunc();
        }
        Duplex.call(this);
    }
    util.inherits(duplexFunc, Duplex);
    duplexFunc.prototype._write = (chunk, enc, cb) => {
        duplex.push(chunk);
        cb();
    };
    duplexFunc.prototype._read = (x) => {};
    var duplex = new duplexFunc();
    return duplex;
}