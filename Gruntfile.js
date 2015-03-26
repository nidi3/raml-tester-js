/*global module*/

module.exports = function (grunt) {
    grunt.initConfig({
        clean: {
            clean: ['lib']
        },
        copy: {
            dist: {
                files: [
                    {
                        cwd: 'src/',
                        expand: true,
                        src: '*.js',
                        dest: 'lib'
                    }]
            }
        },
        mochacli: {
            all: ['test/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mocha-cli');

    grunt.registerTask('default', ['copy']);
    grunt.registerTask('test', ['mochacli']);
};
