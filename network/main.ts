/// <reference path="../typings/index.d.ts" />

require('./globals.js');

import { Network } from './network';

//new Network();

/*var ffi = require('ffi');

var libm = ffi.Librar('libm', {  
    'pow': [ 'double', [ 'double', 'double' ] ]
});

console.log(libm.pow(4, 2)); */

var m = require('./add-ons/build/Release/matrix');

var len = 1000000;
var a = new Float32Array(len);
var b = new Float32Array(len);
var c = new Float32Array(len);

for(var i = 0; i < len; i++) {
    a[i] = i; b[i] = i;
}

var start = Date.now();
console.log('matrix', m.matrix(a, b, Buffer.from(c.buffer)));
//test(a, b);
console.log('run time:', Date.now() - start);

function test(a: Float32Array, b: Float32Array) {
    var len = a.length;
    var c = new Float32Array(len);
    for(var i = 0; i < len; i++) {
        c[i] = a[i] + b[i];
    }

    return c;
}