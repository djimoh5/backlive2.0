import { BaseDataNode, TrainingData } from './data.node';
import { Database } from '../../../core/lib/database';

export class MNISTLoaderNode extends BaseDataNode {
    constructor() {
        super(784, 10);  
    }

    load(callback: (data: TrainingData) => void) {
        this.loadHelper('train', (data) => {
            this.trainingData = data;

            this.loadHelper('test', (data) => {
                this.testData = data;
                callback(this.trainingData);
            });
        });
    }

    private loadHelper(dataType: string, callback: (data: TrainingData) => void) {
        var limit = dataType === 'train' ? 20000 : 10000;
        var mnistData = { input: new Float32Array(this.numFeatures * limit), output: new Float32Array(this.numClasses * limit) };
        var cnt = 0;
        var xInd = 0;
        var yInd = 0;

        Database.mongo.collection(dataType).find({}, (err, cursor) => {
            cursor.limit(limit);
            cursor.each((err, result: {}) => {
                if (result == null) {
                    callback(mnistData);
                }
                else {
                    //var input = [], output = [], index = 1;
                    var index = 1;

                    var key = 'x' + index++;
                    while(typeof(result[key]) !== 'undefined') {
                        mnistData.input[xInd++] = result[key] / 255;
                        key = 'x' + index++;
                    }

                    for(var i = 0; i < 10; i++) {
                        mnistData.output[yInd++] = i == result['y'] ? 1 : 0;
                    }

                    if(++cnt % 5000 === 0) {
                        console.log(cnt);
                    }
                }
            });
        });
    }
}

