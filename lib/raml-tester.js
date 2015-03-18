const fs = require('fs');

module.exports = {
    stop: function (port) {
        const http = require('http');
        var req = http.request({port: port, path: '/@@@proxy/stop'});
        req.on('error', function (e) {
            //ignore
        });
        req.end();
    },
    reload: function (port) {
        const http = require('http');
        var req = http.request({port: port, path: '/@@@proxy/reload'});
        req.on('error', function (e) {
            console.log('could not reload');
        });
        req.end();
    },
    isSameParams: function (params, callback) {
        const http = require('http');
        var req = http.request({
            method: 'POST',
            port: this.findPort(params),
            path: '/@@@proxy/options'
        }, function (res) {
            res.on('data', function (chunk) {
                callback('' + chunk === 'same');
            });
        });

        req.on('error', function (e) {
            callback(false);
        });

        req.write(params.join(' '));
        req.end();
    },
    start: function (params, callback) {
        const path = require('path'),
            children = require('child_process'),
            tmp = require('tmp'),
            stream = require('stream');

        //var a=new stream.Duplex();
        //a.on('data',function(d){
        //   console.log(d);
        //});
        //a.write('bla');
        //a.write('blu');

        const bin = path.resolve(__dirname + '/../bin');
        params.unshift(bin + '/raml-tester-proxy.jar');
        params.unshift('-jar');

        this.stop(this.findPort(params));

        const out = tmp.fileSync();
        const proxy = children.spawn('java', params, {detached: true, stdio: ['ignore', out.fd, out.fd]});
        const watcher = [];
        const cleanup = function (ok) {
            if (watcher.length > 0) {
                watcher[0].unwatch();
                //watcher[0].close();
            }
            out.removeCallback();
            proxy.unref();
            callback(ok);
        };
        quickErrorHandler(proxy, out.name, cleanup);
        normalStartupHandler(watcher, out.name, cleanup, 500);
        globalTimeoutHandler(cleanup, 30000);
    },
    findPort: function (params) {
        var port = 8090;
        for (var i = 0; i < params.length; i++) {
            if (params[i].substring(0, 2) === '-p') {
                if (params[i].length > 2) {
                    port = params[i].substring(2);
                } else {
                    port = params[i + 1];
                }
            }
        }
        return port;
    }
};

function quickErrorHandler(proxy, file, cleanup) {
    proxy.on('exit', function (e) {
        cleanup(false);
    });
}

function normalStartupHandler(watcher, file, cleanup, timeout) {
    var Tail = require('tail').Tail;

    watcher[0] = new Tail(file);

    watcher[0].on("line", function (line) {
        console.log(line);
        if (line.substring(line.length - 7) === 'started') {
            cleanup(true);
        }
    });

    watcher[0].on("error", function (error) {
        console.log('ERROR: ', error);
    });

    //watcher[0] = fs.watch(file, function (event) {
    //    const log = fs.readFileSync(file, {encoding: 'utf-8'});
    //    const line = log.substring(log.lastIndexOf('\n', log.length - 2) + 1, log.length - 1);
    //    console.log('l',line);
    //    if (line.substring(line.length - 7) === 'started') {
    //        cleanup(true);
    //    }
    //});
}

function globalTimeoutHandler(cleanup, timeout) {
    setTimeout(function () {
        cleanup(false);
    }, timeout).unref();
}