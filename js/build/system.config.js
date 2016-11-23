if (typeof System != 'undefined') {
    var webContext = true;
    var dirPrefix = 'app';

    if (typeof WEB_CONFIG == 'undefined') {
        WEB_CONFIG = { ComponentExtension: 'ts', BaseUrl: '/' };
        webContext = false;
        dirPrefix = 'dist';
    }

    var config = {
        baseURL: WEB_CONFIG.BaseUrl,
        transpiler: 'typescript',
        typescriptOptions: { emitDecoratorMetadata: true },
        packages: {
            'dist': {defaultExtension: WEB_CONFIG.ComponentExtension },
            'app': { defaultExtension: WEB_CONFIG.ComponentExtension },
            'network': { defaultExtension: WEB_CONFIG.ComponentExtension },
            'core/service/model': { defaultExtension: WEB_CONFIG.ComponentExtension },
            'node_modules/backlive': { defaultExtension: 'ts' },
            'node_modules/backlive-dist': { defaultExtension: 'ts' },
            'rxjs': { defaultExtension: 'js' }
        },
        map: {
            'backlive': 'node_modules/backlive',
            'rxjs': 'node_modules/rxjs',
            '@angular': 'node_modules/@angular'
        }
    };
    
    var packageNames = [
        '@angular/common',
        '@angular/compiler',
        '@angular/core',
        '@angular/http',
        '@angular/platform-browser',
        '@angular/platform-browser-dynamic',
        '@angular/router',
        '@angular/forms',
        '@angular/testing'
    ];
    
    packageNames.forEach(function(pkgName) {
        var umdBundle = webContext ? 'bundles/' + (pkgName.split('/')[1] + '.umd.min.js') : 'index';
        config.packages[pkgName] = { main: umdBundle, defaultExtension: 'js' };
    });

    if (!webContext) {
        config.map.typescript = 'node_modules/typescript/lib/typescript.js';
        config.map.backlive = 'node_modules/backlive-dist';
    }

    if(System.config) {
        System.config(config);
    }
}