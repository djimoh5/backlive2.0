importScripts(
    "/node_modules/typescript/lib/typescript.js",
    "/node_modules/angular2/bundles/angular2-polyfills.js",
    "/node_modules/systemjs/dist/system.src.js",
    "/node_modules/rxjs/bundles/Rx.js");

var GLOBAL_CACHE_BUSTER = '', defaultExt;
var ENV = 'dev';

if(ENV == 'dev') {
    GLOBAL_CACHE_BUSTER = '?v=' + Math.round(Math.random() * 1000000000);
    defaultExt = 'ts' + GLOBAL_CACHE_BUSTER;
}
else {
    defaultExt = 'ts'; //TODO: change to js when we get npm system-builder in build process
}

this.onerror = function(err) {
    console.log(err);
}

System.config({
    transpiler: 'typescript',
    typescriptOptions: { emitDecoratorMetadata: true },
    packages: {
        'app': {defaultExtension: defaultExt},
        'app-marketing': {defaultExtension: defaultExt}
    },
    paths: {
        'backlive/marketing/*': 'app-marketing/config/imports/*',
        'backlive/design/*': 'app-design/config/imports/*',
        'backlive/*': 'app/config/imports/*'
    },
    baseURL: '/'
});

//angular libs must be imported after config changes, why, I have no clue and took forever to guess!
importScripts(
    "/node_modules/angular2/bundles/router.dev.js",
    "/node_modules/angular2/bundles/http.dev.js", 
    "/node_modules/angular2/bundles/web_worker/worker.dev.js");
    
System.import('./bootstrap');