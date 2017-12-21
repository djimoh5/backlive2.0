'use strict';
const gulp = require('gulp');
const gulp_tslint = require('gulp-tslint');
var exec = require('child_process').exec;

gulp.task('tslint', () => {
    return gulp.src(['**/*.ts', '!**/*.d.ts', '!node_modules/**'])
      .pipe(gulp_tslint())
      .pipe(gulp_tslint.report({ emitError: false }));
});

gulp.task('compileNetwork', (callback) => { 
    exec('tsc -p network/tsconfig.json', function (err, stdout) {
        console.log(stdout);
        callback(err);
    });
});