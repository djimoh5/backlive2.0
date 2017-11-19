var gulp = require('gulp');
var replace = require('gulp-replace');
var change = require('gulp-change');
var eventStream = require('event-stream');

function getRelativePath(filePaths, absPath) {
    var replacePrefix = '';
    var absPaths = absPath.split('/');

    for(var i = 0; i < filePaths.length; i++) {
        if(filePaths[i] != absPaths[i]) {
            var dirLen = filePaths.length - i;
            for(var j = 0; j < dirLen; j++) {
                replacePrefix += '../';
            }

            var absPathLeft = absPaths.slice(i, absPaths.length).join('/');
            if(absPathLeft) {
                replacePrefix += absPathLeft + '/';
            }
            
            break;
        }
    }

    console.log(filePaths, absPaths, replacePrefix);
    return replacePrefix;
}

function convertTemplateUrls(content) {
    var viewPath = (/(Path\.ComponentView\(['"])(.*)(['"]\))/g).exec(content);
    var stylePath = (/(Path\.ComponentStyle\(['"])(.*)(['"]\))/g).exec(content);

    if(!stylePath && !viewPath) {
        return content;
    }

    if(viewPath) { viewPath = viewPath[2]; }
    if(stylePath) { stylePath = stylePath[2]; }

    var path = this.fname.replace(/(.*\\component\\)(.*)/, '$2');
    var paths = path.split('\\');
    paths = paths.slice(0, paths.length - 1); //last index is file name
    path = paths.join('/');
    
    if(stylePath) {
        var replacePrefix = stylePath != path ? getRelativePath(paths, stylePath) : '';
        content = content.replace(/(Path\.ComponentStyle\(['"])(.*\/)(.*)(['"]\))/g, "'" + replacePrefix + "$3.component.less'");
        content = content.replace(/(Path\.ComponentStyle\(['"])(.*)(['"]\))/g, "'" + replacePrefix + "$2.component.less'");
    }

    if(viewPath) {
        var replacePrefix = viewPath != path ? getRelativePath(paths, viewPath) : '';
        content = content.replace(/(Path\.ComponentView\(['"])(.*\/)(.*)(['"]\))/g, "'" + replacePrefix + "$3.component.html'");
        content = content.replace(/(Path\.ComponentView\(['"])(.*)(['"]\))/g, "'" + replacePrefix + "$2.component.html'");
    }

    return content;
}

gulp.task('migrate', function () { 
    console.log('starting migration');

    return eventStream.merge(
        gulp.src('./src/**/*.ts')
            .pipe(change(convertTemplateUrls))

            .pipe(replace(/(Path\.Component\(['"])(.*\/)(.*)(['"]\))/g, "'$3'"))
            .pipe(replace(/(Path\.Component\(['"])(.*)(['"]\))/g, "'$2'"))

            .pipe(replace(/\/images\//gi, '/assets/images/'))
            .pipe(gulp.dest('./src')),

        gulp.src('./src/**/*.html')
            .pipe(replace(/(currency:['"]USD['"]:)( ?true ?)(:)/g, "$1'symbol'$3"))
            .pipe(replace(/\/images\//gi, '/assets/images/'))
            .pipe(gulp.dest('./src')),

        gulp.src('./src/**/*.less')
            .pipe(replace(/(@import *['"])(css\/)/gi, '$1~styles/'))
            .pipe(replace(/\/images\//gi, '/assets/images/'))
            .pipe(gulp.dest('./src'))
    );
});

//create and start build!
gulp.task('build', ['migrate']);
gulp.start('build');