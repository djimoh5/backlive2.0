var gulp = require('gulp');
var tsc = require('gulp-tsc');
var inlineNg2Template = require('gulp-inline-ng2-template');

var Path = {
    Component: function(path) {
        return 'app/component/' + path
    },
    ComponentView: function(path) {
        return 'app/component/' + path + '/' + Path.lastPath(path) + '.component.html'
    },
    ComponentStyle: function(path) {
        return 'app/component/' + path + '/' + Path.lastPath(path) + '.component.less'
    },
    lastPath: function(path) {
		var split = path.split('/');
		return split[split.length - 1];
	}
}

gulp.src('../../app/component/dashboard/dashboard.component.ts')
  .pipe(inlineNg2Template({ base: '../../', templateFunction: Path.Component }))
  .pipe(gulp.dest('./app'));

/*var Builder = require('systemjs-builder');
var builder = new Builder("../../", "./system.config.js");

builder.buildStatic("app/bootstrap.ts", "./app.js", { minify: true, mangle: false })
    .then(function (output) {
        gulp.src('./app.js')
            .pipe(inlineNg2Template({ base: '../../', templateFunction: Path.Component }))
            .pipe(gulp.dest('./'));
    })
    .catch(function (err) {
        console.log(err);
    });*/