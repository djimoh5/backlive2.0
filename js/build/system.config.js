var isWeb = true;
var dirPrefix = 'app';

if(typeof(defaultExt) === 'undefined') {
    var defaultExt = 'ts';
    dirPrefix = 'dist';
    isWeb = false;
}

var config = {
    transpiler: 'typescript',
    typescriptOptions: { emitDecoratorMetadata: true },
    packages: {
        'dist': {defaultExtension: defaultExt},
        'app': {defaultExtension: defaultExt},
        'app-marketing': {defaultExtension: defaultExt}
    },
    paths: {
        'backlive/marketing/*': dirPrefix + '-marketing/config/imports/*',
        'backlive/design/*': dirPrefix + '-design/config/imports/*',
        'backlive/*': dirPrefix + '/config/imports/*'
    },
    baseURL: '/'
};

if(!isWeb) {
    config.map = {
        typescript: 'node_modules/typescript/lib/typescript.js'
    };

    var nodeModulesMap = {
        angular2: 'node_modules/angular2',
        rxjs: 'node_modules/rxjs'
    }

    for (var key in nodeModulesMap) {
        config.map[key] = nodeModulesMap[key];
        config.packages[nodeModulesMap[key]] = { defaultExtension: 'js' };
    }
}

System.config(config);