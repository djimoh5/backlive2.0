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

    get classSize(): number { return this.numClasses; }
    
    constructor(protected numFeatures: number, protected numClasses: number) {
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
        this.numFeatures = numFeatures;
        this.numClasses = numClasses;
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

            var input = (<Float32Array>data.input).subarray(this.currentRecord * this.numFeatures,  (this.currentRecord + this.batchSize) * this.numFeatures);
            var output = (<Float32Array>data.output).subarray(this.currentRecord * this.numClasses, (this.currentRecord + this.batchSize) * this.numClasses);
            
            var activation = new Activation([this.batchSize, this.numFeatures], input, [this.batchSize, this.numClasses], output);
            
            if(this.trainingDataKeys) {
                activation.keys = (this.validating ? this.testDataKeys : this.trainingDataKeys).slice(this.currentRecord, this.currentRecord + this.batchSize);
            }

            this.currentRecord += this.batchSize;
            this.activate(new ActivateNodeEvent(activation, date));
        }
        else {
            this.notify(new EpochCompleteEvent(null));
        }
    }

    receive() {};
}

export interface TrainingData {
    input: number[] | Float32Array; //[][]
    output: number[] | Float32Array; //[][]
}