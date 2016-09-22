/* global global */
'use strict';

var path = require('path');

global.PROJECT_ROOT_PATH = path.resolve('.');
global.PROJECT_SOURCE_ROOT_PATH = global.PROJECT_ROOT_PATH + '/src';

global.SOURCE_FILE_PATHS = ['./src'];
  
// Grunt is a JavaScript task runner, similar to Ant. 
// See http://gruntjs.com/ for details

module.exports = function(grunt) {

   var jsFiles = ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'];
   
   grunt.initConfig({
   pkg: grunt.file.readJSON('package.json'),

    // Run JSHint on all sources. JSHint is a linter that checks for specific
    // formatting rules and/or coarse syntax checks. The file '.jshintrc'
    // contains the settings.
    // See http://jshint.org/about/ for details
   jshint: {
      allButNotSettings : {
         options: {
            jshintrc: '.jshintrc'
         },
         src: jsFiles,
         filter: function filter(path) { var index = path.indexOf('settings.js'); return index === -1; }
      }
   },

   // Run tests using mocha. Mocha is one of the more commonly used test
   // frameworks.
   // See http://visionmedia.github.io/mocha/ for details
   mochaTest: {
   libRaw: {
     options: {
       require: ['./test/testGlobals.js', './test/testStandard.js'],
       reporter: 'spec'
     },
     src: ['test/**/*Test.js']
   }
   },
	
   concat: {
      options: {},
      dist: {
         src: ['settings/settings.js', 'src/webserver/*.js', 'settings/registerStartupHandler.js', 'settings/start.js'],
         dest: 'javascript/webserver.js'
      }
   },

   copy: {
      main: {
         expand: true,
         flatten: false,
         cwd: 'src',
         src: '**/*.js',
         dest: 'webroot/javascripts'
      }
   },

   clean: ['webroot/javascripts']
   });

   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-mocha-test');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-clean');

   grunt.registerTask('lint', ['jshint']);
   grunt.registerTask('format', ['jsbeautifier']);
   grunt.registerTask('test', ['mochaTest:libRaw']);
   grunt.registerTask('compile', []);

   grunt.registerTask('default', ['clean', 'lint', 'test', 'compile', 'copy']);
 };
