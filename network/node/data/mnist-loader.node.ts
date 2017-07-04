import { 
    ActivateNodeEvent, InitializeDataEvent, ValidateDataEvent, BackpropagateCompleteEvent, EpochCompleteEvent, UpdateNodeWeightsEvent
} from '../../event/app.event';
import { BaseDataNode, TrainingData } from './data.node';
import { Activation } from '../../../core/service/model/node.model';

import { Database } from '../../../core/lib/database';

export class MNISTLoaderNode extends BaseDataNode {
    trainingData: TrainingData;
    testData: TrainingData;
    validating: boolean;
    executeStartTime: number;

    currentRecord: number;
    backPropDate: number;
    numFeatures: number = 784;
    numClasses: number = 10;

    constructor() {
        super();

        this.subscribe(InitializeDataEvent, event => {
            this.backPropDate = null;
            this.init();
        });

        this.subscribe(BackpropagateCompleteEvent, event => {
            if(event.date !== this.backPropDate) {
                this.backPropDate = event.date;
                this.execute();
            }
        });

        this.subscribe(ValidateDataEvent, event => {
            this.currentRecord = 0;
            this.validating = true;
            this.execute();
        });
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
        var mnistData = { input: [], output: [] };
        var cnt = 0;

        Database.mongo.collection(dataType).find({}, (err, cursor) => {
            cursor.limit(10000);
            cursor.each((err, result: {}) => {
                if (result == null) {
                    callback(mnistData);
                }
                else {
                    //var input = [], output = [], index = 1;
                    var index = 1;

                    var key = 'x' + index++;
                    while(typeof(result[key]) !== 'undefined') {
                        mnistData.input.push(result[key] / 255);
                        key = 'x' + index++;
                    }

                    for(var i = 0; i < 10; i++) {
                        mnistData.output.push(i == result['y'] ? 1 : 0);
                    }

                    if(++cnt % 5000 === 0) {
                        console.log(cnt);
                    }
                }
            });
        });
    }

    init() {
        this.currentRecord = 0;
        this.execute();
    }

    execute() {
        var batchSize: number = 100;
        var data = this.validating ? this.testData : this.trainingData;
        var date = this.validating ? (this.currentRecord + this.trainingData.input.length) : this.currentRecord;
        
        if(this.currentRecord < (data.input.length / this.numFeatures)) {
            if(this.currentRecord > 0) {
                this.notify(new UpdateNodeWeightsEvent(.5));
            }

            var input = data.input.slice(this.currentRecord * this.numFeatures,  (this.currentRecord + batchSize) * this.numFeatures);
            var output = data.output.slice(this.currentRecord * this.numClasses, (this.currentRecord + batchSize) * this.numClasses);
            this.currentRecord += batchSize;
            
            var activation = new Activation([batchSize, this.numFeatures], input, [batchSize, this.numClasses], output);
            this.activate(new ActivateNodeEvent(activation, date));
        }
        else {
            this.notify(new EpochCompleteEvent(null));
        }
    }
}

