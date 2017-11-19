require('./globals.js');

var gl = require("gl")(1, 1, { antialias: false, preserveDrawingBuffer: true });

class HeadlessCanvas {
    nodeName: string = 'canvas';
    getContext(name: any): any {
        return gl;
    }
}

document.createElement = (name: string): any => { return new HeadlessCanvas(); };

require("./lib/gpu");
declare var GPU;
var gpu = new GPU();

console['warning'] = function(msg) { console.log(msg); };

var len = 3;//33554432;
var A = [], B = [], C = [];
for(var i = 0; i < len; i++) { 
    A[i] = new Float32Array(len); B[i] = new Float32Array(len);
    for(var j = 0; j < len; j++) { 
        A[i][j] = j; B[i][j] = j;
    }
};

var cnt = 0;
function gpuTest(mode: string) {
    var start = Date.now();

    var mat_mult = gpu.createKernel(function(A, B) {
        /*var sum = 0;
        for (var i=0; i<3; i++) {
            sum += A[this.thread.y][i] * B[i][this.thread.x];
        }
        return sum;*/
        return A[this.thread.x] + B[this.thread.x];
    }, { mode: mode }).dimensions([len, len]);

    var D = mat_mult(A, B);
    console.log(D);

    console.log(Date.now() - start, cnt);
}

function cpuTest() {
    var start = Date.now();

    for(var i = 0; i < len; i++) {
        C[i] = A[i] + B[i];
    }

    console.log(Date.now() - start);
}

gpuTest('gpu');
//gpuTest('cpu');
//cpuTest();