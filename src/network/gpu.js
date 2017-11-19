/*var a = SIMD.Float32x4(1, 2, 3, 4);
var b = SIMD.Float32x4(5, 6, 7, 8);
var c = SIMD.Float32x4.mul(a,b); // Float32x4[6,8,10,12]
var D = new Int32Array(4);

SIMD.Int32x4.store1(D, 0, c)*/
//console.log(D);

//node --harmony_simd gpu.js simd

var len = 33554432;
var a = new Float32Array(len), b = new Float32Array(len), c = new Float32Array(len);
for(var i = 0; i < len; i++) { a[i] = i; b[i] = i; };

//CPU
if(process.argv[2]) {
    switch(process.argv[2]) {
        case 'cpu': cpu(); break;
        case 'simd': simd(); break;
        case 'gpu': gpu(); break;
    }
}

function cpu() {
    var start3 = Date.now();

    for(var i = 0; i < len; i++) {
        c[i] = a[i] + b[i];
    }

    console.log(Date.now() - start3);
}

function simd() {
    var A = new Float32Array(len);
    var B = new Float32Array(len);
    var C = new Float32Array(len);

    //SIMD
    var start = Date.now();

    for (i = 0; i < len; i += 4)
    {
        var x = SIMD.Float32x4(a[i], a[i+1], a[i+2], a[i+3]);
        var y = SIMD.Float32x4(b[i], b[i+1], b[i+2], b[i+3]);
        var z = SIMD.Float32x4.add(x,y);
    /* load vector of four integers from A, starting at index i, into variable x */
    //var x = SIMD.Int32x4.load(a, i);

    /* load vector of four integers from B, starting at index i, into variable y */
    //var y = SIMD.Int32x4.load(b, i);

    /* SIMD addition operation on vectors x and y */
    //var z = SIMD.Int32x4.add(x, y);

    /* SIMD operation to store the vector z results in array C */
    //SIMD.Int32x4.store(C, i, z);
    }

    console.log(Date.now() - start);
}

//GPU
function gpu() {
    var monkeys = require("./lib/webmonkeys")();
    var start2 = Date.now();

    monkeys.set("a", a);//[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    monkeys.set("b", b);//[1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4]);
    monkeys.set("c", len);//16); // use a number to just alloc an array
    monkeys.work(16, "c(i) := a(i) + b(i);");

    console.log(Date.now() - start2);
    //console.log(monkeys.get("c"));
}