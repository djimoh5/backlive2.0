var defaultExt = 'ts';

var config = {
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
};

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

System.config(config);