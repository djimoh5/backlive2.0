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
void WeightError(float* totalError, float* totalBiasError, Nan::TypedArrayContents<float>& inActivation, size_t row, size_t featIndex, float featDelta, size_t inputLen);

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

    for (size_t row = 0; row < inputLen; row++) {
        for(size_t nIndex = 0; nIndex < nodeLen; nIndex++) {
            float actTotal = 0;

            for(size_t featIndex = 0; featIndex < featLen; featIndex++) {
                actTotal += (*inActivation)[row*featLen + featIndex] * (*nodeWeights)[nIndex*featLen + featIndex];
            }

            //std::printf("%f\n", actTotal);
            activation[row*nodeLen + nIndex] = Sigmoid(actTotal + (*bias)[nIndex]);
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

    for(size_t row = 0; row < inputLen; row++) {
        for(size_t oIndex = 0; oIndex < outputLen; oIndex++) {
            float output = (*activation)[row*outputLen + oIndex];
            float expected = (*expectedOutput)[row*outputLen + oIndex];
            
            float deltaVal = CostFunctionDelta(output, expected);
            totalCost += CostFunctionCost(output, expected);

            delta[row*outputLen + oIndex] = deltaVal;
            
            //if(Network.isLearning) {
                WeightError(totalError, totalBiasError, inActivation, row, oIndex, deltaVal, inputLen);
            //}             
        }
    }

    info.GetReturnValue().Set(Nan::New(totalCost));
}

float CostFunctionCost(float output, float target) {
    float val = (-target * log(output)) - (1 - target) * log(1 - output);
    if(val != val) { //NaN
        std::printf("%f %f %f %f %f", target, output, val, log(output), log(1 - output));
        return 0;
    }
    else if(!isfinite(val)) {
        std::printf("%f %f %f %f %f", target, output, val, log(output), log(1 - output));
        throw std::invalid_argument("cost value is infinite");
    }

    return val;
}

float CostFunctionDelta(float output, float target) {
    return output - target;
}

void Backpropagate(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    float* delta = (float*) node::Buffer::Data(info[0]->ToObject());
    Nan::TypedArrayContents<float> activation(info[1]);
    Nan::TypedArrayContents<float> outputError(info[2]);
    Nan::TypedArrayContents<float> outputWeights(info[3]);
    const int batchSize = info[4]->IntegerValue();

    //for WeightError function
    float* totalError = (float*) node::Buffer::Data(info[4]->ToObject());
    float* totalBiasError = (float*) node::Buffer::Data(info[5]->ToObject());
    Nan::TypedArrayContents<float> inActivation(info[6]);

    const size_t featLen = activation.length() / batchSize;
    const size_t outputLen = outputError.length() / featLen;
    const size_t inputLen = batchSize;

    for(size_t row = 0; row < inputLen; row++) { //loop through each input
        for(size_t featIndex = 0; featIndex < featLen; featIndex++) { //loop through each feature (node)
            float feature = (*activation)[row*featLen + featIndex];
            float sigPrime = feature * (1 - feature);
            float deltaTotal = 0;

            for(size_t oIndex = 0; oIndex < outputLen; oIndex++) { //loop through each output error node
                deltaTotal += (*outputError)[row*outputLen + oIndex] * (*outputWeights)[oIndex*featLen + featIndex] * sigPrime;
            }

            delta[row*featLen + featIndex] = deltaTotal;
            WeightError(totalError, totalBiasError, inActivation, row, featIndex, deltaTotal, inputLen);
        }
    }
}

void WeightError(float* totalError, float* totalBiasError, Nan::TypedArrayContents<float>& inActivation, 
        size_t row, size_t featIndex, float featDelta, size_t inputLen) {

    totalBiasError[featIndex] += featDelta;
    size_t weightLen = inActivation.length() / inputLen;

    for(size_t wIndex = 0; wIndex < weightLen; wIndex++) {
        totalError[featIndex*weightLen + wIndex] += featDelta * (*inActivation)[row*weightLen + wIndex];
    }
}

float Sigmoid(float x) {
    return Sigmoid(x, false);
}

float Sigmoid(float x, bool derivative) {
    float val = 1 / (1 + exp(-x));
    return derivative ? (val * (1 - val)) : val;
}

void Init(v8::Local<v8::Object> exports) {  
    exports->Set(Nan::New("activate").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(Activate)->GetFunction());
    exports->Set(Nan::New("outputDelta").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(OutputDelta)->GetFunction());
    exports->Set(Nan::New("backpropagate").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(Backpropagate)->GetFunction());
}

NODE_MODULE(activate, Init)