// activate.cpp

#include <cmath>
#include <ctime>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <nan.h>
#include <stdexcept>

using namespace std;

float Sigmoid(float x);
float Sigmoid(float x, bool derivative);
float CostFunctionCost(float output, float target);
float CostFunctionDelta(float output, float target);
void WeightError(float* totalError, float* totalBiasError, Nan::TypedArrayContents<float>& inActivation, size_t row, size_t featIndex, float featDelta, float featDelta1, float featDelta2, float featDelta3, size_t inputLen, size_t weightLen);

void Activate(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    float* activation = (float*) node::Buffer::Data(info[0]->ToObject());
    Nan::TypedArrayContents<float> inActivation(info[1]);
    Nan::TypedArrayContents<float> nodeWeights(info[2]);
    Nan::TypedArrayContents<float> bias(info[3]);
    const int batchSize = info[4]->IntegerValue();

    const size_t featLen = inActivation.length() / batchSize;
    const size_t nodeLen = nodeWeights.length() / featLen;
    const size_t inputLen = batchSize;

    //std::printf("%d %d %d %d\n", nodeLen, featLen, inputLen);
    int overCnt = inputLen % 4;
    bool isOver = false;

    for (size_t row = 0; row < inputLen; row += 4) {
        if(row + 4 > inputLen) isOver = true;

        for(size_t nIndex = 0; nIndex < nodeLen; nIndex++) {
            float actTotal = 0, actTotal1 = 0, actTotal2 = 0, actTotal3 = 0;

            for(size_t featIndex = 0; featIndex < featLen; featIndex++) {
                float weight = (*nodeWeights)[nIndex*featLen + featIndex];
                actTotal += (*inActivation)[row*featLen + featIndex] * weight;
                if(!isOver || overCnt > 1) actTotal1 += (*inActivation)[(row+1)*featLen + featIndex] * weight;
                if(!isOver || overCnt > 2) actTotal2 += (*inActivation)[(row+2)*featLen + featIndex] * weight;
                if(!isOver) actTotal3 += (*inActivation)[(row+3)*featLen + featIndex] * weight;
            }

            float b = (*bias)[nIndex];
            activation[row*nodeLen + nIndex] = Sigmoid(actTotal + b);
            if(!isOver || overCnt > 1) activation[(row+1)*nodeLen + nIndex] = Sigmoid(actTotal1 + b);
            if(!isOver || overCnt > 2) activation[(row+2)*nodeLen + nIndex] = Sigmoid(actTotal2 + b);
            if(!isOver) activation[(row+3)*nodeLen + nIndex] = Sigmoid(actTotal3 + b);
        }
    }
}

void OutputDelta(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    float* delta = (float*) node::Buffer::Data(info[0]->ToObject());
    Nan::TypedArrayContents<float> activation(info[1]);
    Nan::TypedArrayContents<float> expectedOutput(info[2]);
    const int batchSize = info[3]->IntegerValue();

    //for WeightError function
    float* totalError = (float*) node::Buffer::Data(info[4]->ToObject());
    float* totalBiasError = (float*) node::Buffer::Data(info[5]->ToObject());
    Nan::TypedArrayContents<float> inActivation(info[6]);

    const size_t outputLen = activation.length() / batchSize;
    const size_t inputLen = batchSize;
    const size_t weightLen = inActivation.length() / inputLen;

    float totalCost = 0;

    int overCnt = inputLen % 4;
    bool isOver = false;

    for(size_t row = 0; row < inputLen; row += 4) {
        if(row + 4 > inputLen) isOver = true;

        for(size_t oIndex = 0; oIndex < outputLen; oIndex++) {
            float output = (*activation)[row*outputLen + oIndex];
            float expected = (*expectedOutput)[row*outputLen + oIndex];
            float deltaVal = CostFunctionDelta(output, expected);
            totalCost += CostFunctionCost(output, expected);
            delta[row*outputLen + oIndex] = deltaVal;

            float deltaVal1;
            if(!isOver || overCnt > 1) {
                output = (*activation)[(row+1)*outputLen + oIndex];
                expected = (*expectedOutput)[(row+1)*outputLen + oIndex];
                deltaVal1 = CostFunctionDelta(output, expected);
                totalCost += CostFunctionCost(output, expected);
                delta[(row+1)*outputLen + oIndex] = deltaVal1;
            }
            else {
                deltaVal1 = 0;
            }

            float deltaVal2;
            if(!isOver || overCnt > 2) {
                output = (*activation)[(row+2)*outputLen + oIndex];
                expected = (*expectedOutput)[(row+2)*outputLen + oIndex];
                deltaVal2 = CostFunctionDelta(output, expected);
                totalCost += CostFunctionCost(output, expected);
                delta[(row+2)*outputLen + oIndex] = deltaVal2;
            }
            else {
                deltaVal2 = 0;
            }

            float deltaVal3;
            if(!isOver) {
                output = (*activation)[(row+3)*outputLen + oIndex];
                expected = (*expectedOutput)[(row+3)*outputLen + oIndex];
                deltaVal3 = CostFunctionDelta(output, expected);
                totalCost += CostFunctionCost(output, expected);
                delta[(row+3)*outputLen + oIndex] = deltaVal3;
            }
            else {
                deltaVal3 = 0;
            }

            //if(Network.isLearning) {
                WeightError(totalError, totalBiasError, inActivation, row, oIndex, deltaVal, deltaVal1, deltaVal2, deltaVal3, inputLen, weightLen);
            //}             
        }
    }

    info.GetReturnValue().Set(Nan::New(totalCost));
}

void Backpropagate(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    float* delta = (float*) node::Buffer::Data(info[0]->ToObject());
    Nan::TypedArrayContents<float> activation(info[1]);
    Nan::TypedArrayContents<float> outputError(info[2]);
    Nan::TypedArrayContents<float> outputWeights(info[3]);
    const int batchSize = info[4]->IntegerValue();

    //for WeightError function
    float* totalError = (float*) node::Buffer::Data(info[5]->ToObject());
    float* totalBiasError = (float*) node::Buffer::Data(info[6]->ToObject());
    Nan::TypedArrayContents<float> inActivation(info[7]);

    const size_t featLen = activation.length() / batchSize;
    const size_t outputLen = outputError.length() / batchSize;
    const size_t inputLen = batchSize;
    const size_t weightLen = inActivation.length() / inputLen;

    int overCnt = inputLen % 4;
    bool isOver = false;

    for(size_t row = 0; row < inputLen; row += 4) { //loop through each input
        if(row + 4 > inputLen) isOver = true;

        for(size_t featIndex = 0; featIndex < featLen; featIndex++) { //loop through each feature (node)
            float deltaVal = 0;
            float feature = (*activation)[row*featLen + featIndex];
            float sigPrime = feature * (1 - feature);

            float deltaVal1 = 0, sigPrime1;
            if(!isOver || overCnt > 1) {
                feature = (*activation)[(row+1)*featLen + featIndex];
                sigPrime1 = feature * (1 - feature);
            }

            float deltaVal2 = 0, sigPrime2;
            if(!isOver || overCnt > 2) {
                feature = (*activation)[(row+2)*featLen + featIndex];
                sigPrime2 = feature * (1 - feature);
            }

            float deltaVal3 = 0, sigPrime3;
            if(!isOver) {
                feature = (*activation)[(row+3)*featLen + featIndex];
                sigPrime3 = feature * (1 - feature);
            }

            for(size_t oIndex = 0; oIndex < outputLen; oIndex++) { //loop through each output error node
                float weight = (*outputWeights)[oIndex*featLen + featIndex];
                deltaVal += (*outputError)[row*outputLen + oIndex] * weight * sigPrime;
                if(!isOver || overCnt > 1) deltaVal1 += (*outputError)[(row+1)*outputLen + oIndex] * weight * sigPrime1;
                if(!isOver || overCnt > 2) deltaVal2 += (*outputError)[(row+2)*outputLen + oIndex] * weight * sigPrime2;
                if(!isOver) deltaVal3 += (*outputError)[(row+3)*outputLen + oIndex] * weight * sigPrime3;
            }

            delta[row*featLen + featIndex] = deltaVal;
            if(!isOver || overCnt > 1) delta[(row+1)*featLen + featIndex] = deltaVal;
            if(!isOver || overCnt > 2) delta[(row+2)*featLen + featIndex] = deltaVal;
            if(!isOver) delta[(row+3)*featLen + featIndex] = deltaVal;

            WeightError(totalError, totalBiasError, inActivation, row, featIndex, deltaVal, deltaVal1, deltaVal2, deltaVal3, inputLen, weightLen);
        }
    }
}

void WeightError(float* totalError, float* totalBiasError, Nan::TypedArrayContents<float>& inActivation, 
        size_t row, size_t featIndex, float featDelta, float featDelta1, float featDelta2, float featDelta3, size_t inputLen, size_t weightLen) {

    totalBiasError[featIndex] += featDelta + featDelta1 + featDelta2 + featDelta3;

    for(size_t wIndex = 0; wIndex < weightLen; wIndex++) {
        totalError[featIndex*weightLen + wIndex] += featDelta * (*inActivation)[row*weightLen + wIndex]
            + (featDelta1 != 0 ? featDelta1 * (*inActivation)[(row+1)*weightLen + wIndex] : 0)
            + (featDelta2 != 0 ? featDelta2 * (*inActivation)[(row+2)*weightLen + wIndex] : 0)
            + (featDelta3 != 0 ? featDelta3 * (*inActivation)[(row+3)*weightLen + wIndex] : 0);
    }
}

void UpdateWeights(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    const double learningRate = info[0]->NumberValue();
    const int trainingCount = info[1]->IntegerValue();
    const int numNodes = info[2]->IntegerValue();
    const int wlen = info[3]->IntegerValue();
    float* weights = (float*) node::Buffer::Data(info[4]->ToObject());
    float* bias = (float*) node::Buffer::Data(info[5]->ToObject());
    Nan::TypedArrayContents<float> totalError(info[6]);
    Nan::TypedArrayContents<float> totalBiasError(info[7]);
    const double regParamLambda = info[8]->NumberValue();

    float regParam = 1;//regParamLambda == 0 ? 1 : (1 - learningRate*(regParamLambda/60000));

    for(size_t nIndex = 0; nIndex < numNodes; nIndex++) {
        for(size_t wIndex = 0; wIndex < wlen; wIndex++) {
            weights[nIndex*wlen + wIndex] = (regParam * weights[nIndex*wlen + wIndex]) - (learningRate * (*totalError)[nIndex*wlen + wIndex] / trainingCount);
        }

        bias[nIndex] -= learningRate * (*totalBiasError)[nIndex] / trainingCount;
    }
}

float Sigmoid(float x) {
    return Sigmoid(x, false);
}

float Sigmoid(float x, bool derivative) {
    float val = 1 / (1 + exp(-x));
    return derivative ? (val * (1 - val)) : val;
}

float CostFunctionCost(float output, float target) {
    float val = (-target * log(output)) - (1 - target) * log(1 - output);
    if(val != val) { //NaN
        std::printf("Error  - NaN: %f %f %f %f %f\n", target, output, val, log(output), log(1 - output));
        return 0;
    }
    else if(!isfinite(val)) {
        std::printf("Error - Not Finite: %f %f %f %f %f\n", target, output, val, log(output), log(1 - output));
        throw std::invalid_argument("cost value is infinite");
    }

    return val;
}

float CostFunctionDelta(float output, float target) {
    return output - target;
}

void Init(v8::Local<v8::Object> exports) {
    exports->Set(Nan::New("activate").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(Activate)->GetFunction());
    exports->Set(Nan::New("outputDelta").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(OutputDelta)->GetFunction());
    exports->Set(Nan::New("backpropagate").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(Backpropagate)->GetFunction());
    exports->Set(Nan::New("updateWeights").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(UpdateWeights)->GetFunction());
}

NODE_MODULE(activate, Init)