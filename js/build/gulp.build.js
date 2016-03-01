var gulp = require('gulp');
var tsc = require('gulp-tsc');
var less = require('less');
var inlineNg2Template = require('gulp-inline-ng2-template');

var Path = {
    Component: function(path, type) {
        if(path.indexOf('.html') > 0) {
            return 'app/component/' + path;
        }
        else if(type === 'html') {
            return 'app/component/' + path + '/' + Path.lastPath(path) + '.component.html'
        }
        else if(type === 'css') {
            return 'app/component/' + path + '/' + Path.lastPath(path) + '.component.less'
        }
    },
    lastPath: function(path) {
		var split = path.split('/');
		return split[split.length - 1];
	}
}

function CssToLess(lessTxt, callback) {
    less.render(lessTxt, { paths: ['../../'], compress: true }, function (e, output) {
        if(e) {
            console.log('less error:', e);
        }
        
        callback(output.css);
    });
}
    
gulp.task('inline-template', function() {
    console.log('inlining html and css...');
    return gulp.src('../../app/**/*.ts')
        .pipe(inlineNg2Template({ 
                base: '../../', templateExtension: '', templateFunction: Path.Component,
                styleProcessor: function(ext, file, callback) {
                    CssToLess(file, callback);
                }
            })
        )
        .pipe(gulp.dest('../../dist'));
});

gulp.task('bundle', ['inline-template'], function() {
    console.log('systemjs transpile and bundling...');
    var Builder = require('systemjs-builder');
    var builder = new Builder("../../", "./system.config.js");
    builder.buildStatic("dist/bootstrap.ts", "./app.js", { minify: true, mangle: false });
    return;
});
  
gulp.task('build', ['inline-template', 'bundle']);

gulp.start('build');