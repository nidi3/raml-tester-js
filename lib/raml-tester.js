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
    start: function (opts, out) {
        const path = require('path'),
            children = require('child_process');

        const bin = path.resolve(__dirname + '/../bin'),
            params = '-jar ' + bin + '/raml-tester-proxy.jar ' + this.renderServerCli(opts),
            proc = children.spawn('java', params.split(' '));

        proc.stdout.on('data', function (data) {
            out(('' + data).substring(0, data.length - 1));
        });
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
        var port = 8099;
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
    },
    parseCli: function (args) {
        if (args.length === 0) {
            return null;
        }
        return args[0].substring(0, 1) === '-' ? this.parseServerCli(args) : this.parseClientCli(args);
    },
    parseServerCli: function (args) {
        const res = {
            mode: 'server',
            port: 8099,
            mockDir: 'mock-files',
            format: 'text',
            ignoreX: false,
            async: false
        };
        parseOpts(args, function (opt, val) {
            switch (opt) {
            case 'p':
                res.port = parseInt(val);
                break;
            case 't':
                res.target = val;
                break;
            case 'm':
                res.mockDir = val;
                break;
            case 'r':
                res.raml = val;
                break;
            case 'b':
                res.baseUri = val;
                break;
            case 's':
                res.saveDir = val;
                break;
            case 'f':
                res.format = val;
                break;
            case 'i':
                res.ignoreX = true;
                break;
            case 'a':
                res.async = true;
                break;
            }
        });
        return res;
    },
    parseClientCli: function (args) {
        const res = {
            mode: 'client',
            port: 8099,
            command: args[0],
            clearReports: false,
            clearUsage: false
        };
        parseOpts(args, function (opt, val) {
            switch (opt) {
            case 'r':
                res.clearReports = true;
                break;
            case 'u':
                res.clearUsage = true;
                break;
            }
        });
        return res;
    },
    renderServerCli: function (opts) {
        var res = '';
        for (var prop in opts) {
            var val = opts[prop];
            switch (prop) {
            case 'port':
                res += ' -p' + val;
                break;
            case 'target':
                res += ' -t' + val;
                break;
            case 'mockDir':
                res += ' -m' + val;
                break;
            case 'raml':
                res += ' -r' + val;
                break;
            case 'baseUri':
                res += ' -b' + val;
                break;
            case 'saveDir':
                res += ' -s' + val;
                break;
            case 'format':
                res += ' -f' + val;
                break;
            case 'ignoreX':
                if (val) {
                    res += ' -i';
                }
                break;
            case 'async':
                if (val) {
                    res += ' -a';
                }
                break;
            }
        }
        return res.substring(1);
    }
};

function parseOpts(args, parseFunc) {
    for (var i = 0; i < args.length; i++) {
        var arg = args[i], opt = arg.substring(1, 2), val = arg.substring(2);
        if (arg.substring(0, 1) === '-') {
            parseFunc(opt, val);
        }
    }
}
