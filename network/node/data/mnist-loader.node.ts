import { 
    ActivateNodeEvent, InitializeDataEvent, ValidateDataEvent, BackpropagateCompleteEvent, EpochCompleteEvent
} from '../../event/app.event';
import { BaseDataNode, TrainingData } from './data.node';

import { Database } from '../../../core/lib/database';

export class MNISTLoaderNode extends BaseDataNode {
    trainingData: TrainingData;
    testData: TrainingData;
    validating: boolean;
    executeStartTime: number;

    currentRecord: number;
    backPropDate: number;

    constructor() {
        super();

        this.subscribe(InitializeDataEvent, event => {
            this.backPropDate = null;
            this.init()
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
                    var input = [], output = [], index = 1;

                    var key = 'x' + index++;
                    while(typeof(result[key]) !== 'undefined') {
                        input.push(result[key] / 255);
                        key = 'x' + index++;
                    }

                    mnistData.input.push(input);

                    for(var i = 0; i < 10; i++) {
                        output[i] = i == result['y'] ? 1 : 0;
                    }

                    mnistData.output.push(output);

                    if(++cnt % 1000 === 0) {
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
        var batchSize: number = 1000;
        var data = this.validating ? this.testData : this.trainingData;
        var date = this.validating ? (this.currentRecord + this.trainingData.input.length) : this.currentRecord;
        
        if(this.currentRecord < data.input.length) {
            this.activate(new ActivateNodeEvent({ 
                input: data.input.slice(this.currentRecord, this.currentRecord + batchSize), 
                output: data.output.slice(this.currentRecord, this.currentRecord + batchSize) 
            }, date));

            this.currentRecord += batchSize;
        }
        else {
            this.notify(new EpochCompleteEvent(null));
        }
    }
}

