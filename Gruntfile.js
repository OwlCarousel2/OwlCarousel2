module.exports = function(grunt) {
  'use strict';
  
  var pkg = require('./package.json');

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  RegExp.quote = function (string) {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
            ' * <%= pkg.title %> <%= pkg.version %>\n' +
            ' * Copyright 2014 <%= pkg.author %>\n' +
            ' * Licensed under <%= pkg.license %>\n' +
            ' */\n',
    
    // Task configuration.
    clean: {
      dist: ['dist']
    },
    
    /*jshint: {
      options: {
        jshintrc: 'src/js/.jshintrc'
      },
      src: {
        src: 'src/js/*.js'
      }
    },*/

    /*jscs: {
      options: {
        config: 'src/js/.jscsrc'
      },
      src: {
        src: '<%= jshint.src.src %>'
      }
    },*/

    concat: {
      options: {
        banner: '<%= banner %>\n',
        stripBanners: false
      },
      src: {
        src: pkg.scripts,
        dest: 'dist/js/owl.carousel.js'
      }
    },

    uglify: {
      dist: {
        options: {
          banner: '<%= banner %>'
        },
        src: '<%= concat.src.dest %>',
        dest: 'dist/js/owl.carousel.min.js'
      }
    }
  });

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt, {scope: 'dependencies'});
  require('time-grunt')(grunt);

  // JS distribution task.
  grunt.registerTask('dist-js', ['concat:src', 'uglify:dist']);

  // Full distribution task.
  grunt.registerTask('dist', ['clean', 'dist-js']);

  // Default task.
  grunt.registerTask('default', ['dist']);
};
