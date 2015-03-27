/*global module*/

var version = '0.0.4-SNAPSHOT';

module.exports = function (grunt) {
    grunt.initConfig({
        clean: {
            clean: ['bin','lib']
        },
        copy: {
            dist: {
                files: [
                    {
                        src: process.env['HOME'] + '/.m2/repository/guru/nidi/raml/raml-tester-proxy/' + version + '/raml-tester-proxy-' + version + '.jar',
                        dest: 'bin/raml-tester-proxy.jar'
                    }, {
                        cwd: 'src/',
                        expand: true,
                        src: 'raml-tester.js',
                        dest: 'lib'
                    },{
                        cwd: 'src/',
                        expand: true,
                        src: 'raml-tester-cli',
                        dest: 'bin'
                    }]
            }
        },
        mochacli:{
            all: ['test/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mocha-cli');

    grunt.registerTask('default', ['copy']);
    grunt.registerTask('test', ['mochacli']);
};
