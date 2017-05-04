import { 
    ActivateNodeEvent, InitializeDataEvent, ValidateDataEvent,
    BackpropagateEvent, BackpropagateCompleteEvent, EpochCompleteEvent
} from '../../event/app.event';
import { BaseDataNode, TrainingData } from './data.node';

import { Database } from '../../../core/lib/database';

export class MNISTLoaderNode extends BaseDataNode {
    trainingData: TrainingData;
    testData: TrainingData;
    validating: boolean;
    executeStartTime: number;

    currentRecord: number;

    constructor() {
        super();

        this.subscribe(InitializeDataEvent, event => this.init());

        this.subscribe(BackpropagateCompleteEvent, event => {
            this.execute();
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
            cursor.each((err, result: {}) => {
                if (result == null) {
                    callback(mnistData);
                }
                else {
                    var input = [], output = [], index = 1;

                    var key = 'x' + index++;
                    while(typeof(result[key]) !== 'undefined') {
                        input.push(result[key]);
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
        var data = this.validating ? this.testData : this.trainingData;
        var date = this.validating ? (this.currentRecord + this.trainingData.input.length) : this.currentRecord;

        if(this.currentRecord < data.input.length) {
            this.notify(new ActivateNodeEvent({ vals: [data.input[this.currentRecord++]] }, date));
        }
        else {
            this.notify(new EpochCompleteEvent(this.validating));
        }
    }
}

