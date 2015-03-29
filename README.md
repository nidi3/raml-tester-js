raml-tester-js
==============

A node.js and bower module for [raml-tester-proxy](https://github.com/nidi3/raml-tester-proxy).

## Node.js module

### Prerequisits
This module is a wrapper around [raml-tester-proxy](https://github.com/nidi3/raml-tester-proxy), therefore a java runtime must be installed on the target machine.

### Install
```
npm install -g raml-tester
```

### Usage
On the command line, just use it with
```
raml-tester <options>
```
where options are exactly the same as for [raml-tester-proxy](https://github.com/nidi3/raml-tester-proxy).

For the javascript API, see [raml-tester.js](src/raml-tester.js).


## Bower module

### Prerequisits
The bower module connects to a running proxy server, therefore, no java environment is needed.

### Install
```
bower install raml-tester
```

### Usage
The following functions are defined and exposed by the variable `RAML.tester`:

- setPort (port)
- reload (ok, fail)
- clearReports (ok, fail)
- clearUsage (ok, fail)
- ping (ok, fail)
- reports (ok, fail)
- usage (ok, fail)
 
They all expect a running proxy server at port 8099 (configurable with the `setPort` function).

For more details see [raml-tester-browser.js](src/raml-tester-browser.js).