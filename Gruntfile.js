/* global global */
'use strict';

var path = require('path');
var fileSystem = require('fs');

global.PROJECT_ROOT_PATH = path.resolve('.');
global.PROJECT_SOURCE_ROOT_PATH = global.PROJECT_ROOT_PATH + '/src';

global.SOURCE_FILE_PATHS = ['./src'];
  
// Grunt is a JavaScript task runner, similar to Ant. 
// See http://gruntjs.com/ for details

var getStatusOf = function getStatusOf(path) {

   var exists = false;
   var isDirectory = false;
   
   try {
      
      var fileDescriptor = fileSystem.openSync(path, 'r');
      var stat = fileSystem.fstatSync(fileDescriptor);
      fileSystem.closeSync(fileDescriptor);
      exists = true;
      isDirectory = stat.isDirectory();
      
   } catch(e) {}
   
   return { exists: exists, isDirectory: isDirectory };
};

var whenFolderExists = function whenFolderExists(folderName) {
   return new Promise(function(fulfill, reject) {
      var status = getStatusOf(folderName);
      
      if(status.exists) {
         fulfill(folderName);
      } else {
         reject('"' + folderName + '" does not exist.');
      }
   });
};

var whenSubFolderDoesNotExist = function whenSubFolderDoesNotExist(subFolder) {
   return function(parentFolder) {
      return new Promise(function(fulfill, reject) {
         var totalSubFolder = parentFolder + '/' + subFolder;
         var status = getStatusOf(totalSubFolder);
         if(status.exists) {
            fulfill('');
         } else {
            fulfill(totalSubFolder);
         }
      });
   }
};

var makeDirectory = function makeDirectory(folderName) {
   return new Promise(function(fulfill, reject) {
      if (folderName === '') {
         fulfill();
      } else {
         fileSystem.mkdir(folderName, function(err) {
           if(err) {
              reject(err);
           } else {
              fulfill(folderName);
           }
         });
      }
   });
};

var ensureSubFolderExists = function ensureSubFolderExists(subFolder, parentFolder) {
   
   return whenSubFolderDoesNotExist(subFolder, parentFolder).then(makeDirectory);
};

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
   grunt.registerTask('createDatabaseFolder', 'creates the database folder if it does not exist', function() {
      var done = this.async();
      var failTask = function failTask(err) {
         grunt.log.error(err); done(false);
      };
      var completeTask = function completeTask() {
         done(true);
      };
      
      whenFolderExists(global.PROJECT_ROOT_PATH)
         .then(whenSubFolderDoesNotExist('database'))
         .then(makeDirectory)
         .then(completeTask, failTask);
   });
   
   grunt.registerTask('default', ['clean', 'lint', 'test', 'compile', 'copy']);
 };
