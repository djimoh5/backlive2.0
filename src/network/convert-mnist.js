db = db.getSiblingDB("mnist");
var docs = db.test.find();
print("test: " + docs.count());

docs.forEach(function(result) { 
    var xInd = 0;
    var yInd = 0;
    var index = 1;
    var key = 'x' + index++;
    var mnistData = { input: [], output: [] };

    while(typeof(result[key]) !== 'undefined') {
        mnistData.input[xInd++] = result[key] / 255;
        key = 'x' + index++;
    }

    for(var i = 0; i < 10; i++) {
        mnistData.output[yInd++] = i == result['y'] ? 1 : 0;
    }

    db.test1.insert(mnistData);
});