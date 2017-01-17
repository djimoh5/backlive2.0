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
        return (-target * Math.log(output)) - (1 - target) * Math.log(1 - output);
    }

    delta(output: number, target: number): number { 
        return output - target;
    }
}