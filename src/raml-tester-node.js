const fs = require('fs'),
    http = require('http');

module.exports = {
    stop: function (port) {
        var req = http.request({port: port, path: '/@@@proxy/stop'});
        req.on('error', function (e) {
            //ignore
        });
        req.end();
    },
    isSameParams: function (params, callback) {
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
            tmp = require('tmp');

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
            }
            out.removeCallback();
            proxy.unref();
            callback(ok);
        };
        proxyErrorHandler(proxy, cleanup);
        proxyStartupHandler(watcher, out.name, cleanup, 30000);
    },
    reload: function (config, ok, fail) {
        this.request('reload', ok, fail);
    },
    reports: function (config, ok, fail) {
        this.request('reports', ok, fail);
    },
    usage: function (config, ok, fail) {
        this.request('usage', ok, fail);
    },
    request: function (url, config, ok, fail) {
        var req = http.request({
            port: config.port,
            path: '/@@@proxy/' + url + '?' + (config.clearReports ? 'clear-reports=true' : '') + (config.clearUsage ? '&clear-usage=true' : '')
        }, function (res) {
            res.on('data', function (chunk) {
                ok('' + chunk);
            });
        });
        req.on('error', function (e) {
            fail(e);
        });
        req.end();
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

function proxyErrorHandler(proxy, cleanup) {
    proxy.on('exit', function (e) {
        cleanup(false);
    });
}

function proxyStartupHandler(watcher, file, cleanup, timeout) {
    const tail = require('tail');

    watcher[0] = new tail.Tail(file);
    watcher[0].on("line", function (line) {
        console.log(line);
        if (line.substring(line.length - 7) === 'started') {
            cleanup(true);
        }
    });

    watcher[0].on("error", function (error) {
        console.log('ERROR: ', error);
        cleanup(false);
    });

    setTimeout(function () {
        cleanup(false);
    }, timeout).unref();
}

