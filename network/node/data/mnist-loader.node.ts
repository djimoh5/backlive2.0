import { 
    ActivateNodeEvent, InitializeDataEvent, ValidateDataEvent,
    BackpropagateCompleteEvent, EpochCompleteEvent
} from '../../event/app.event';
import { BaseDataNode } from './data.node';

import { Common } from '../../../app/utility/common';

import { Database } from '../../../core/lib/database';

export class MNISTLoaderNode extends BaseDataNode {
    trainingData: { input: number[][], output: number[] };
    testData: { input: number[][], output: number[] };
    validating: boolean;
    executeStartTime: number;

    constructor() {
        super();

        this.subscribe(InitializeDataEvent, event => this.init());

        this.subscribe(BackpropagateCompleteEvent, event => {
            
        });

        this.subscribe(ValidateDataEvent, event => {
            this.validating = true;
            this.execute();
        });
    }

    init() {
        this.trainingData = { input: [], output: [] };
        this.testData = { input: [], output: [] };
        var cnt = 0;

        Database.mongo.collection('train').find({}, (err, cursor) => {
            cursor.each((err, result: {}) => {
                if (result == null) {
                    this.execute();
                }
                else {
                    var row = [], index = 1;

                    var key = 'x' + index++;
                    while(typeof(result[key]) !== 'undefined') {
                        row.push(result[key]);
                        key = 'x' + index++;
                    }

                    this.trainingData.input.push(row);
                    this.trainingData.output.push(result['y']);

                    if(++cnt % 1000 === 0) {
                        console.log(cnt);
                    }
                }
            });
        });
    }

    execute() {
        //console.log(this.trainingData);
        console.log(this.trainingData.input.length);
        console.log(this.trainingData.output.length);
    }
}

