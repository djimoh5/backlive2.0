// matrix.cpp
#include <cmath>
#include <ctime>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <nan.h>

void Matrix(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    //const clock_t start = clock();
    
    //std::printf("Welcome to v8\n");
    if(!info[0]->IsFloat32Array() || !info[1]->IsFloat32Array()) {
        throw "Arguments must be Float32Arrays";
    }

    Nan::TypedArrayContents<float> activation(info[0]);
    Nan::TypedArrayContents<float> inActivation(info[1]);
    float* buffer = (float*) node::Buffer::Data(info[2]->ToObject());

    const size_t len  = activation.length();
    
    //float *result;
    //result = (float *) malloc(len * sizeof(float));
    //v8::Local<v8::Array> results = Nan::New<v8::Array>(len);

    for (size_t i = 0; i < len; i++) {
        buffer[i] = (*activation)[i] + (*inActivation)[i];
        //result[i] = (*activation)[i] + (*inActivation)[i];
        //Nan::Set(results, i, Nan::New<v8::Number>((*activation)[i] + (*inActivation)[i]));
    }

    //std::printf("c++ time: %f ms\n", float(clock() - start));

    //info.GetReturnValue().Set(result);
    //free(result);
}

void Init(v8::Local<v8::Object> exports) {  
    exports->Set(Nan::New("matrix").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(Matrix)->GetFunction());
}

NODE_MODULE(matrix, Init)