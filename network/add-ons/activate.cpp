// activate.cpp
#include <cmath>
#include <ctime>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <nan.h>
#include <stdexcept>

float Sigmoid(float x);
float Sigmoid(float x, bool derivative);
float CostFunctionCost(float output, float target);
float CostFunctionDelta(float output, float target);
void WeightError(float* totalError, float* totalBiasError, Nan::TypedArrayContents<float>& inActivation, size_t row, size_t featIndex, float featDelta, float featDelta1, float featDelta2, float featDelta3, size_t inputLen);

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

    for (size_t row = 0; row < inputLen; row += 4) {
        for(size_t nIndex = 0; nIndex < nodeLen; nIndex++) {
            float actTotal = 0, actTotal1 = 0, actTotal2 = 0, actTotal3 = 0;

            for(size_t featIndex = 0; featIndex < featLen; featIndex++) {
                float weight = (*nodeWeights)[nIndex*featLen + featIndex];
                actTotal += (*inActivation)[row*featLen + featIndex] * weight;
                actTotal1 += (*inActivation)[(row+1)*featLen + featIndex] * weight;
                actTotal2 += (*inActivation)[(row+2)*featLen + featIndex] * weight;
                actTotal3 += (*inActivation)[(row+3)*featLen + featIndex] * weight;
            }

            float b = (*bias)[nIndex];
            activation[row*nodeLen + nIndex] = Sigmoid(actTotal + b);
            activation[(row+1)*nodeLen + nIndex] = Sigmoid(actTotal1 + b);
            activation[(row+2)*nodeLen + nIndex] = Sigmoid(actTotal2 + b);
            activation[(row+3)*nodeLen + nIndex] = Sigmoid(actTotal3 + b);
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

    float totalCost = 0;

    for(size_t row = 0; row < inputLen; row += 4) {
        for(size_t oIndex = 0; oIndex < outputLen; oIndex++) {
            float output = (*activation)[row*outputLen + oIndex];
            float expected = (*expectedOutput)[row*outputLen + oIndex];
            float deltaVal = CostFunctionDelta(output, expected);
            totalCost += CostFunctionCost(output, expected);
            delta[row*outputLen + oIndex] = deltaVal;

            output = (*activation)[(row+1)*outputLen + oIndex];
            expected = (*expectedOutput)[(row+1)*outputLen + oIndex];
            float deltaVal1 = CostFunctionDelta(output, expected);
            totalCost += CostFunctionCost(output, expected);
            delta[(row+1)*outputLen + oIndex] = deltaVal1;

            output = (*activation)[(row+2)*outputLen + oIndex];
            expected = (*expectedOutput)[(row+2)*outputLen + oIndex];
            float deltaVal2 = CostFunctionDelta(output, expected);
            totalCost += CostFunctionCost(output, expected);
            delta[(row+2)*outputLen + oIndex] = deltaVal2;

            output = (*activation)[(row+3)*outputLen + oIndex];
            expected = (*expectedOutput)[(row+3)*outputLen + oIndex];
            float deltaVal3 = CostFunctionDelta(output, expected);
            totalCost += CostFunctionCost(output, expected);
            delta[(row+3)*outputLen + oIndex] = deltaVal3;

            //if(Network.isLearning) {
                WeightError(totalError, totalBiasError, inActivation, row, oIndex, deltaVal, deltaVal1, deltaVal2, deltaVal3, inputLen);
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

    for(size_t row = 0; row < inputLen; row += 4) { //loop through each input
        for(size_t featIndex = 0; featIndex < featLen; featIndex++) { //loop through each feature (node)
            float feature = (*activation)[row*featLen + featIndex];
            float sigPrime = feature * (1 - feature);
            float deltaVal = 0;

            feature = (*activation)[(row+1)*featLen + featIndex];
            float sigPrime1 = feature * (1 - feature);
            float deltaVal1 = 0;

            feature = (*activation)[(row+2)*featLen + featIndex];
            float sigPrime2 = feature * (1 - feature);
            float deltaVal2 = 0;

            feature = (*activation)[(row+3)*featLen + featIndex];
            float sigPrime3 = feature * (1 - feature);
            float deltaVal3 = 0;

            for(size_t oIndex = 0; oIndex < outputLen; oIndex++) { //loop through each output error node
                float weight = (*outputWeights)[oIndex*featLen + featIndex];
                deltaVal += (*outputError)[row*outputLen + oIndex] * weight * sigPrime;
                deltaVal1 += (*outputError)[(row+1)*outputLen + oIndex] * weight * sigPrime1;
                deltaVal2 += (*outputError)[(row+2)*outputLen + oIndex] * weight * sigPrime2;
                deltaVal3 += (*outputError)[(row+3)*outputLen + oIndex] * weight * sigPrime3;
            }

            delta[row*featLen + featIndex] = deltaVal;
            WeightError(totalError, totalBiasError, inActivation, row, featIndex, deltaVal, deltaVal1, deltaVal2, deltaVal3, inputLen);
        }
    }
}

void WeightError(float* totalError, float* totalBiasError, Nan::TypedArrayContents<float>& inActivation, 
        size_t row, size_t featIndex, float featDelta, float featDelta1, float featDelta2, float featDelta3, size_t inputLen) {

    totalBiasError[featIndex] += featDelta + featDelta1 + featDelta2 + featDelta3;
    size_t weightLen = inActivation.length() / inputLen;

    for(size_t wIndex = 0; wIndex < weightLen; wIndex++) {
        totalError[featIndex*weightLen + wIndex] += featDelta * (*inActivation)[row*weightLen + wIndex]
            + featDelta1 * (*inActivation)[(row+1)*weightLen + wIndex]
            + featDelta2 * (*inActivation)[(row+2)*weightLen + wIndex]
            + featDelta3 * (*inActivation)[(row+3)*weightLen + wIndex];
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

    for(size_t nIndex = 0; nIndex < numNodes; nIndex++) {
        for(size_t wIndex = 0; wIndex < wlen; wIndex++) {
            weights[nIndex*wlen + wIndex] = weights[nIndex*wlen + wIndex] - (learningRate * (*totalError)[nIndex*wlen + wIndex] / trainingCount);
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