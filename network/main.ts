/// <reference path="../typings/index.d.ts" />

require('./globals.js');

import { Network } from './network';

new Network();

/*var aoM = require('./add-ons/build/Release/matrix');
var aoA = require('./add-ons/build/Release/activate');

// activation
var activation = new Float32Array(3000); //100x30
var inActivation = new Float32Array(72800); //100x728
var nodeWeights = new Float32Array(21840); //30x728
var biases = new Float32Array([30]); //30

for(var i = 0; i < 3000; i++) { activation[i] = 1.1; }
for(var i = 0; i < 72800; i++) { inActivation[i] = 1.1; }
for(var i = 0; i < 21840; i++) { nodeWeights[i] = 1.1; }
for(var i = 0; i < 30; i++) { biases[i] = 1.1; }

function activate() {
    var start = Date.now();
    aoA.activate(Buffer.from(activation.buffer), inActivation, nodeWeights, biases, 30, 728, true);
    //console.log('matrix', activation);
    console.log('run time:', Date.now() - start);
}

function jsActivate() {
    var start = Date.now();

    var nodeLen = 30;
    var featLen = 728;
    var inputLen = inActivation.length / featLen;

    for (var row = 0; row < inputLen; row++) {
        for(var nIndex = 0; nIndex < nodeLen; nIndex++) {
            var actTotal = 0;

            for(var featIndex = 0; featIndex < featLen; featIndex++) {
                actTotal += inActivation[row*featLen + featIndex] * nodeWeights[nIndex*featLen + featIndex];
            }

            activation[row*nodeLen + nIndex] = actTotal;//1 / (1 + exp(-(actTotal + (*bias)[nIndex])));
        }
    }

    //console.log(activation);
    console.log('run time:', Date.now() - start);
}

// general loop
var len = 2184000;
var a = new Float32Array(len);
var b = new Float32Array(len);
var c = new Float32Array(len);

for(var i = 0; i < len; i++) {
    a[i] = i; b[i] = i;
}

function matrix() {
    var start = Date.now();
    aoM.matrix(a, b, Buffer.from(c.buffer));
    console.log('run time:', Date.now() - start);
}

function jsMatrix() {
    var len = a.length;
    var start = Date.now();
    
    for(var i = 0; i < len; i++) {
        c[i] = a[i] + b[i];
    }

    console.log('run time:', Date.now() - start);
    //return c;
}

jsActivate();*/