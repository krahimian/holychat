/* global module, require */

module.exports = function (grunt) {

    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	clean: {
	    options: {
		force: true
	    },
	    index: {
		src: ['www/*.html']
	    },
	    css: {
		src: ['tmp/*.css', 'www/*.css']
	    },
	    js: {
		src: ['tmp/*.js', 'www/*.js']
	    },
	    tmp: {
		src: ['tmp/**/*']
	    }
	},

	/********************* STYLE *********************/
	stylus: {
	    options: {
		compress: true,
		'include css': true
	    },
	    compile: {
		files: {
		    'tmp/app.css': 'src/css/*.styl'
		}
	    }
	},
	cssmin: {
	    compress: {
		files: {
		    'tmp/app.css': 'tmp/app.css'
		}
	    }
	},
	staticinline: {
	    main: {
		files: {
		    'www/index.html': 'www/index.html'
		}
	    }
	},

	/********************* JAVASCRIPT *********************/
	concat: {
	    vendor: {
		files: {
		    'tmp/vendor.js': [
			//libraries
			'components/angular/angular.min.js',
			'components/socket.io-client/socket.io.js',
			'components/fastclick/lib/fastclick.js',

			//ngModules
			'components/angular-socket-io/socket.min.js'
		    ]
		}
	    },
	    js: {
		files: {
		    'tmp/app.js' : ['src/ngApp.js', 'src/js/**/*.js', 'src/main.js']
		}
	    }
	},
	uglify: {
	    options: {
		beautify: {
		    ascii_only: true,
		    inline_script: true
		}
	    },
	    vendor: {
		files: {
		    'tmp/vendor.js': ['tmp/vendor.js']
		}
	    },
	    js: {
		files: {
		    'tmp/app.js': ['tmp/app.js']
		}
	    }
	},
	inline: {
	    index: {
		src: [ 'www/index.html' ]
	    }
	},

	/********************* HTML *********************/
	jade: {
	    index: {
		files: [{
		    'tmp/index.html': ['src/views/index.jade']
		}]
	    },
	    partials: {
		files: [{
		    expand: true,
		    src: ['partials/**/*.jade', 'layouts/*.jade'],
		    dest: 'tmp/',
		    cwd: 'src/views/',
		    ext: '.html'
		}]
	    }
	},
	inline_angular_templates: {
	    index: {
		options: {
		    base: 'tmp',
		    prefix: '/',
		    selector: 'body',
		    method: 'prepend'
		},
		files: {
		    'tmp/index.html': ['tmp/partials/**/*.html', 'tmp/layouts/*.html']
		}
	    }
	},
	htmlmin: {
	    index: {
		options: {
		    collapseWhitespace: true,
		    removeComments: true
		},
		files: {
		    'www/index.html': 'www/index.html'
		}
	    }
	},
	
	/********************* ASSETS *********************/
	copy: {
	    html: {
		files: [
		    {
			expand: true,
			flatten: true,
			src: 'tmp/index.html',
			dest: 'www/'
		    }
		]
	    },
	    js: {
		files: [
		    {
			expand: true,
			flatten: true,
			src: ['tmp/app.js', 'tmp/vendor.js'],
			dest: 'www/'
		    }
		]
	    },
	    css: {
		files: [
		    {
			expand: true,
			flatten: true,
			src: 'tmp/app.css',
			dest: 'www/'
		    }
		]
	    }
	},
	/********************* UTILITIES *********************/
	jshint: {
	    options: {
		curly: false,
		undef: true,
		unused: true,
		bitwise: true,
		freeze: true,
		smarttabs: true,
		immed: true,
		latedef: true,
		newcap: true,
		noempty: true,
		nonew: true,
		trailing: true,
		forin: true,
		eqeqeq: true,
		eqnull: true,
		force: true,
		quotmark: 'single',
		expr: true
	    },
	    main: [
		'src/**/*.js',
		'server.js'
	    ]
	},
	watch: {
	    index: {
		files: 'src/views/**/*.jade',
		tasks: ['clean:index', 'jade', 'inline_angular_templates', 'copy:html', 'staticinline', 'inline', 'cordovacli']
	    },
	    css: {
		files: 'src/css/*.styl',
		tasks: ['clean:css', 'stylus', 'cssmin', 'copy:css', 'copy:html', 'staticinline', 'inline', 'cordovacli']
	    },
	    js: {
		files: ['components/**/*.js', 'src/**/*.js'],
		tasks: ['clean:js', 'concat:vendor', 'concat:js', 'copy:js', 'copy:html', 'staticinline', 'inline', 'cordovacli']
	    }
	},
	cordovacli: {
	    build: {
		options: {
		    id: 'io.chat',
		    name: 'Chat',
		    path: './',
 		    command: 'build',
		    platforms: [ 'ios', 'android' ]
		}
	    }
	},
	jshint: {
	    options: {
		curly: false,
		undef: true,
		unused: true,
		bitwise: true,
		freeze: true,
		smarttabs: true,
		immed: true,
		latedef: true,
		newcap: true,
		noempty: true,
		nonew: true,
		trailing: true,
		forin: true,
		eqeqeq: true,
		eqnull: true,
		force: true,
		quotmark: 'single',
		expr: true
	    },
	    main: [
		'src/**/*.js'
	    ]
	}	
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-jshint');    
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-inline-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-inline');
    grunt.loadNpmTasks('grunt-static-inline');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-cordovacli');

    grunt.registerTask('build', [
	'clean',

	'stylus',
	'cssmin',
	
	'concat:vendor',
	'concat:js',
	'uglify',	

	'jade',
	'inline_angular_templates',

	'copy',

	'staticinline',
	'inline',

	'htmlmin',

	'cordovacli'

    ]);

    grunt.registerTask('default', ['build']);
};
