// activate.cpp
#include <cmath>
#include <ctime>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <nan.h>

void Activate(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    float* activation = (float*) node::Buffer::Data(info[0]->ToObject());
    Nan::TypedArrayContents<float> inActivation(info[1]);
    Nan::TypedArrayContents<float> nodeWeights(info[2]);
    Nan::TypedArrayContents<float> bias(info[3]);
    const int nodeLen = info[4]->IntegerValue();
    const int featLen = info[5]->IntegerValue();

    bool useLinear = info[6]->BooleanValue();

    const size_t inputLen = inActivation.length() / featLen;
    //const size_t nodeLen = nodeWeights.length();
    //const size_t featLen = (*inActivation)[0].length();

    //std::printf("%d %d %d %d\n", nodeLen, featLen, inputLen, useLinear);

    for (size_t row = 0; row < inputLen; row++) {
        for(size_t nIndex = 0; nIndex < nodeLen; nIndex++) {
            float actTotal = 0;

            for(size_t featIndex = 0; featIndex < featLen; featIndex++) {
                actTotal += (*inActivation)[row*featLen + featIndex] * (*nodeWeights)[nIndex*featLen + featIndex];
            }

            //std::printf("%f\n", actTotal);
            activation[row*nodeLen + nIndex] = 1 / (1 + exp(-(actTotal + (*bias)[nIndex])));
            //activation[row*nodeLen + nIndex] = useLinear ? actTotal : Sigmoid(actTotal + (*bias)[nIndex]);
        }
    }
}

/*void Sigmoid(float x) {
    return Sigmoid(c, false);
}

void Sigmoid(float x, bool derivative) {
    float val = 1 / (1 + exp(-x));
    return derivative ? (val * (1 - val)) : val;
}*/

void Init(v8::Local<v8::Object> exports) {  
    exports->Set(Nan::New("activate").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(Activate)->GetFunction());
}

NODE_MODULE(pow, Init)