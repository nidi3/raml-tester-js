var RAML = RAML || {};
RAML.tester = RAML.tester || (function () {
    function request(url, options, ok, fail) {
        var http = new XMLHttpRequest();
        options = options || {};
        options.method = options.method || 'GET';
        options.timeout = options.timeout || 3000;

        http.timeout = options.timeout;
        http.onreadystatechange = function () {
            if (http.readyState === 4) {
                if (200 <= http.status && http.status < 300) {
                    ok(http.responseText);
                } else {
                    !fail || fail(http);
                }
            }
        };
        http.open(options.method, url, true);
        http.send();
    }

    function trim(s, maxLen) {
        return s.length > maxLen ? (s.substring(0, maxLen - 3) + '...') : s;
    }

    var port = 8090;

    return {
        setPort: function (p) {
            port = p;
        },
        reload: function (ok, fail) {
            request('http://localhost:' + port + '/@@@proxy/reload?clear-reports=true&clear-usage=true', {}, ok, fail);
        },
        clearReports: function (ok, fail) {
            request('http://localhost:' + port + '/@@@proxy/reports/clear', {}, ok, fail);
        },
        clearUsage: function (ok, fail) {
            request('http://localhost:' + port + '/@@@proxy/usage/clear', {}, ok, fail);
        },
        ping: function (ok, fail) {
            request('http://localhost:' + port + '/@@@proxy/ping', {}, ok, fail);
        },
        reports: function (ok, fail) {
            request('http://localhost:' + port + '/@@@proxy/reports', {}, function (res) {
                ok(JSON.parse(res));
            }, fail);
        },
        usage: function (ok, fail) {
            request('http://localhost:' + port + '/@@@proxy/usage', {}, function (res) {
                ok(JSON.parse(res));
            }, fail);
        },
        request: function (url, options, ok, fail) {
            request(url, options, ok, fail);
        },
        logReports: function (reports, elements) {
            if (reports) {
                for (var i = 0; i < reports.length; i++) {

                }
            }
        },
        reportToString: function (reports, i, elements) {
            var res = '';
            for (var j = 0; j < elements.length; j++) {
                res += i + ' ' + elements[j] + ': ' + trim(JSON.stringify(reports[i][elements[j]]), 400) + '\n';
            }
            return res;
        },
        dirtyReports: function (reports) {
            var res = '';
            if (reports !== undefined) {
                for (var i = 0; i < reports.length; i++) {
                    if (reports[i]['request violations'].length > 0 || reports[i]['response violations'].length > 0) {
                        res += RAML.tester.reportToString(reports, i, ['request violations', 'response violations']);
                    }
                }
            }
            return res;
        },
        addJasmineMatchers: function () {
            jasmine.addMatchers({
                toHaveNoViolations: function (util, customEqualityTesters) {
                    return {
                        compare: function (actual) {
                            var dirty = RAML.tester.dirtyReports(actual),
                                res = {message: '\nFound these violations:\n' + dirty};
                            res.pass = util.equals(dirty, '', customEqualityTesters);
                            return res;
                        },
                        negativeCompare: function (actual) {
                            return {message: "'Not' not supported."};
                        }
                    };
                }
            });
        }
    };
}());

