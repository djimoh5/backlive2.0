var gulp = require('gulp');
var replace = require('gulp-replace');
var less = require('less');
var inlineNg2Template = require('gulp-inline-ng2-template');
var Builder = require('systemjs-builder');

var currentProject;

var Path = {
    Component: function(path, type) {
        if(path.indexOf('.html') > 0) {
            return 'app' + currentProject + '/component/' + path;
        }
        else if(type === 'html') {
            return 'app' + currentProject + '/component/' + path + '/' + Path.lastPath(path) + '.component.html'
        }
        else if(type === 'css') {
            return 'app' + currentProject + '/component/' + path + '/' + Path.lastPath(path) + '.component.less'
        }
    },
    lastPath: function(path) {
		var split = path.split('/');
		return split[split.length - 1];
	}
}

function CssToLess(lessTxt, callback) {
    less.render(lessTxt, { paths: ['./'], compress: true }, function (e, output) {
        if(e) {
            console.log('less error:', e);
        }
        
        callback(output.css);
    });
}

function inlineTemplate(project) {
    console.log(project + ' inlining html and css...');
    currentProject = project;
    
    return gulp.src('./app' + project + '/**/*.ts')
        .pipe(inlineNg2Template({ 
                base: './', templateExtension: '', 
                removeLineBreaks: true,
                templateFunction: Path.Component,
                styleProcessor: function(ext, file, callback) {
                    CssToLess(file, callback);
                }
            })
        )
        .pipe(gulp.dest('./dist' + project));
}

//inline css and html
gulp.task('inline-template', function() { return inlineTemplate(''); });

//convert relative path namespace file to point to new dist build
gulp.task('dist-relative-path', function() {
    console.log("converting node_modules/chodreunion to node_modules/chodreunion-dist")
    return gulp.src('./node_modules/chodreunion/**/*.ts')
        .pipe(replace('/app/', '/dist/'))
        .pipe(gulp.dest('./node_modules/chodreunion-dist'));
});

//bundle task, depened on inline-template and dist-relative-path completing first
gulp.task('bundle', ['inline-template', 'dist-relative-path'], function() {
    var builder = new Builder("./", "./js/build/system.config.js");
    var mangled = false;
    
    console.log('app - systemjs transpile and bundling...');
    builder.buildStatic("dist/bootstrap.ts", "./js/build/app.js", { minify: true, mangle: mangled }).catch(function(err) {
        console.log(err);
        process.exit(1);
    });
    
    return;
});
  
//create and start build!
gulp.task('build', ['inline-template', 'dist-relative-path', 'bundle']);
gulp.start('build');