export interface ICostFunction {
    cost(output: number, target: number): number;
    delta(output: number, target: number): number;
}

export class QuadraticCost implements ICostFunction {
    cost(output: number, target: number): number {
        return .5 * Math.pow(output - target, 2);
    }

    delta(output: number, target: number): number { 
        //cost derivative * sigmoid_prime
        return (output - target) * (output * (1 - output)); //this implementation assumes output is a sigmoid
    }
}

export class CrossEntropyCost implements ICostFunction {
    cost(output: number, target: number): number {
        var val = (-target * Math.log(output)) - (1 - target) * Math.log(1 - output);
        if(isNaN(val)) {
            console.log(target, output, val, Math.log(output), Math.log(1 - output));
            return 0;
        }
        else if(!isFinite(val)) {
            console.log(target, output, val, Math.log(output), Math.log(1 - output));
        }

        return val;
    }

    delta(output: number, target: number): number { 
        return output - target;
    }
}

export class CostFunctionFactory {
    static create(type: CostFunctionType) {
        switch(type) {
            case CostFunctionType.Quadratic: return new QuadraticCost();
            case CostFunctionType.CrossEntropy: return new CrossEntropyCost();
        }
    }
}

export enum CostFunctionType {
    Quadratic = 1,
    CrossEntropy = 2
}