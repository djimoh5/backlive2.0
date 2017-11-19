import { BaseDataNode, TrainingData } from './data.node';
import { Database } from '../../../core/lib/database';

export class MNISTLoaderNode extends BaseDataNode {
    trainCnt: number = 60000;
    testCnt: number = 10000;

    constructor() {
        super(784, 10);  
    }

    load(callback: (data: TrainingData) => void) {
        this.trainingData = { 
            input: new Float32Array(this.numFeatures * (this.trainCnt + this.testCnt)), 
            labels: new Float32Array(this.numClasses * (this.trainCnt + this.testCnt)) 
        };

        this.loadHelper('train', () => {
            callback(this.trainingData);
        });
    }

    private loadHelper(dataType: string, callback: () => void) {
        this.loadFromCache('mnist_' + dataType, 0, (err, result) => {
            if(result) {
                this.trainingData = { input: new Float32Array(result.input), labels: new Float32Array(result.labels) };
                callback();
            }
            else {
                var limit = dataType === 'train' ? this.trainCnt : this.testCnt;
                var cnt = 0;
                var xInd = 0;
                var yInd = 0;

                Database.mongo.collection(dataType).find({}, (err, cursor) => {
                    cursor.limit(limit);
                    cursor.each((err, result: {}) => {
                        if (result == null) {
                            /*for(var i = 0, len = mnist.input; i < (limit / 10000); i++) {
                                this.cacheData('mnist_' + dataType, 0, 
                                    Array.prototype.slice.call(mnistData.input.subarray(i * limit + 10000)), 
                                    Array.prototype.slice.call(mnistData.labels));
                            }*/
                            callback();
                        }
                        else {
                            //var input = [], output = [], index = 1;
                            var index = 1;

                            var key = 'x' + index++;
                            while(typeof(result[key]) !== 'undefined') {
                                this.trainingData.input[xInd++] = result[key] / 255;
                                key = 'x' + index++;
                            }

                            for(var i = 0; i < 10; i++) {
                                this.trainingData.labels[yInd++] = i == result['y'] ? 1 : 0;
                            }

                            if(++cnt % 5000 === 0) {
                                console.log(cnt);
                            }
                        }
                    });
                });
            }
        });
    }
}

