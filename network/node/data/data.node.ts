import { BaseNode } from '../base.node';
import { Node, NodeType } from '../../../core/service/model/node.model';
import { Activation } from '../../../core/service/model/node.model';
import { 
    ActivateNodeEvent, TrainDataEvent, ValidateDataEvent, BackpropagateCompleteEvent, EpochCompleteEvent, UpdateNodeWeightsEvent
} from '../../event/app.event';

export declare type ParamValues = { date: number; ticker: string; [key: string]: number | string };
export declare type DataResult = { [key: string]: ParamValues };
export declare type DateDataResult = { [key: number]: { [key: string]: ParamValues } };
export declare type DataCache = { [key: number]: DataResult }; //number = IndicatorParamType

export interface IDataNode {
    load(callback: (data: TrainingData) => void); //load any data from an external source, e.g. db, csv, api call
    train(); //starts training from beginnning of data set
    nextBatch(); //executes another batch of training
}

export abstract class BaseDataNode extends BaseNode<Node> implements IDataNode {
    trainingData: TrainingData;
    trainingDataKeys: string[];
    testData: TrainingData;
    testDataKeys: string[];
    
    validating: boolean;
    executeStartTime: number;

    currentRecord: number;
    batchSize: number;
    backPropDate: number;

    get numFeatures(): number { return this._numFeatures; }
    get numClasses(): number { return this._numClasses; }
    
    constructor(protected _numFeatures: number, protected _numClasses: number) {
        super(new Node(NodeType.Virtual));
        this.node.name = 'dataNode';

        this.subscribe(TrainDataEvent, event => {
            this.currentRecord = 0;
            this.validating = false;
            this.backPropDate = null;
            this.batchSize = event.data;
            this.train();
        });

        this.subscribe(BackpropagateCompleteEvent, event => {
            if(event.date !== this.backPropDate) {
                this.backPropDate = event.date;
                this.nextBatch();
            }
        });

        this.subscribe(ValidateDataEvent, event => {
            this.currentRecord = 0;
            this.validating = true;
            this.nextBatch();
        });
    }

    setDimensions(numFeatures: number, numClasses: number) {
        this._numFeatures = numFeatures;
        this._numClasses = numClasses;
    }
    
    abstract load(callback: (data: TrainingData) => void);

    train() {
        this.nextBatch();
    }

    nextBatch(date?: number) {
        var data = this.validating ? this.testData : this.trainingData;
        date = date || (this.validating ? (this.currentRecord + this.trainingData.input.length) : this.currentRecord);

        if(this.currentRecord < (data.input.length / this.numFeatures)) {
            if(this.currentRecord > 0) {
                this.notify(new UpdateNodeWeightsEvent(null));
            }

            var end = (this.currentRecord + this.batchSize) * this.numFeatures;
            var input = (<Float32Array>data.input).subarray(this.currentRecord * this.numFeatures,  end < data.input.length ? end : data.input.length);

            end = (this.currentRecord + this.batchSize) * this.numClasses;
            var output = (<Float32Array>data.output).subarray(this.currentRecord * this.numClasses, end < data.output.length ? end : data.output.length);
            
            var activation = new Activation([input.length / this.numFeatures, this.numFeatures], input, [output.length / this.numClasses, this.numClasses], output);
            
            if(this.trainingDataKeys) {
                activation.keys = (this.validating ? this.testDataKeys : this.trainingDataKeys).slice(this.currentRecord, this.currentRecord + this.batchSize);
            }

            this.currentRecord += this.batchSize;
            console.log(data.input.length, this.currentRecord)
            this.activate(new ActivateNodeEvent(activation, date));
        }
        else {
            console.log(data.input.length / this.numFeatures)
            this.notify(new EpochCompleteEvent(null));
        }
    }

    receive() {};
}

export interface TrainingData {
    input: number[] | Float32Array; //[][]
    output: number[] | Float32Array; //[][]
}