// activate.cpp

#include <cmath>
#include <ctime>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <nan.h>
#include <stdexcept>

#define NPY_NO_DEPRECATED_API NPY_1_7_API_VERSION
#include "Python.h"
#include <numpy/arrayobject.h>

using namespace std;

wchar_t* CharToWChar(char* orig);
int importArray();

wchar_t* CharToWChar(char* orig) {
    size_t origsize = strlen(orig) + 1;
    const size_t newsize = 100;
    size_t convertedChars = 0;
    wchar_t wcstring[newsize];
    mbstowcs_s(&convertedChars, wcstring, origsize, orig, _TRUNCATE);
    wcscat_s(wcstring, L" (wchar_t *)");
    return wcstring;
}

int importArray() {
    import_array();
}

void Tensorflow(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    int index = 0;

    float* trainData = (float*) node::Buffer::Data(info[index++]->ToObject());
    float* trainLblData = (float*) node::Buffer::Data(info[index++]->ToObject());
    const int trainRows = info[index++]->IntegerValue();

    float* testData = (float*) node::Buffer::Data(info[index++]->ToObject());
    float* testLblData = (float*) node::Buffer::Data(info[index++]->ToObject());
    const int testRows = info[index++]->IntegerValue();

    const int numFeatures = info[index++]->IntegerValue();
    const int numClasses = info[index++]->IntegerValue();

    const double learningRate = info[index++]->NumberValue();
    const double epochs = info[index++]->IntegerValue();
    const double batchSize = info[index++]->IntegerValue();
    const double regParam = info[index++]->NumberValue();
    const double costFunctionType = info[index++]->IntegerValue();
    int* hiddenLayers = (int*) node::Buffer::Data(info[index]->ToObject());
    size_t hiddenLen = node::Buffer::Length(info[index++]->ToObject()) / sizeof(int);
    
    std::printf("train data: %d %d\n ", trainRows, numFeatures);
    std::printf("train lbl data: %d %d\n ", trainRows, numClasses);
    std::printf("test data: %d %d\n ", testRows, numFeatures);
    std::printf("test lbl data: %d %d\n ", testRows, numClasses);
    std::printf("network params: %f %f %f %f %f %d\n ", learningRate, epochs, batchSize, regParam, costFunctionType, hiddenLen);

    npy_intp trainDims[2] = { trainRows, numFeatures };
    npy_intp trainLblDims[2] = { trainRows, numClasses };
    npy_intp testDims[2] = { testRows, numFeatures };
    npy_intp testLblDims[2] = { testRows, numClasses };
    npy_intp hiddenDims[1] = { hiddenLen };
    int nd = 2;

    std::exception_ptr eptr;

    try {
        //initialize python
        wchar_t* argv[1];
        argv[0] = CharToWChar("mnist");

        Py_Initialize();
        Py_SetProgramName(argv[0]);
        PySys_SetArgv(1, argv);

        PyObject *sys = PyImport_ImportModule("sys");
        PyObject *path = PyObject_GetAttrString(sys, "path");
		PyList_Append(path, PyUnicode_FromString((char*)"."));
        //PyRun_SimpleString("import sys\nprint(sys.path)");
        
        //load python neural network module
        PyObject* pModuleString = PyUnicode_FromString((char*)"mnist");
        PyObject* pModule = PyImport_Import(pModuleString);
        Py_DECREF(pModuleString);

        cout << "imported module" << endl;

        if (!pModule) {
            cout << "module cannot be imported" << endl;
            PyErr_Print();
            return;
        }

        //import numpy and convert input buffer to numpy array
        importArray();

        cout << "imported numpy" << endl;

        PyObject* npTrain = PyArray_SimpleNewFromData(nd, trainDims, NPY_FLOAT32, trainData);
        PyObject* npTrainLbl = PyArray_SimpleNewFromData(nd, trainLblDims, NPY_FLOAT32, trainLblData);
        PyObject* npTest = PyArray_SimpleNewFromData(nd, testDims, NPY_FLOAT32, testData);
        PyObject* npTestLbl = PyArray_SimpleNewFromData(nd, testLblDims, NPY_FLOAT32, testLblData);
        PyObject* npHiddenLayers = PyArray_SimpleNewFromData(1, hiddenDims, NPY_INT32, hiddenLayers);

        cout << "converted pointers to numpy arrays" << endl;

        //run neural nertwork
        PyObject* pFunction = PyObject_GetAttrString(pModule, (char*)"run");
        cout << "loaded run function" << endl;

        if (!pFunction || !PyCallable_Check(pFunction)) 
        {
            cout << "not callable" << endl;
            PyErr_Print();
            Py_DECREF(pModule);
            return;
        }

        cout << "building function args" << endl;
        index = 0;

        PyObject *pArgs = PyTuple_New(10);
        PyTuple_SetItem(pArgs, index++, npTrain);
        PyTuple_SetItem(pArgs, index++, npTrainLbl);
        PyTuple_SetItem(pArgs, index++, npTest);
        PyTuple_SetItem(pArgs, index++, npTestLbl);
        PyTuple_SetItem(pArgs, index++, PyFloat_FromDouble(learningRate));
        PyTuple_SetItem(pArgs, index++, PyFloat_FromDouble(epochs));
        PyTuple_SetItem(pArgs, index++, PyFloat_FromDouble(batchSize));
        PyTuple_SetItem(pArgs, index++, PyFloat_FromDouble(regParam));
        PyTuple_SetItem(pArgs, index++, PyFloat_FromDouble(costFunctionType));
        PyTuple_SetItem(pArgs, index++, npHiddenLayers);
        
        cout << "function args set" << endl;

        PyObject *pReturn = PyObject_CallObject(pFunction, pArgs);
        Py_DECREF(pArgs);

        printf("Result of call: %ld\n", PyLong_AsLong(pReturn));
        //printf("Result of call: %f\n", PyFloat_AsDouble(pReturn));
        Py_DECREF(pReturn);
        Py_XDECREF(pFunction);
        Py_DECREF(pModule);
        
        Py_Finalize(); //crashes program
    }
    catch(const std::runtime_error& re)
    {
        std::cerr << "Runtime error: " << re.what() << std::endl;
    }
    catch(const std::exception& ex)
    {
        std::cerr << "Error occurred: " << ex.what() << std::endl;
    }
    catch(std::string &ex)
    {
        std::cerr << "String errors: " << ex << std::endl;
    }
    catch(...)
    {
        eptr = std::current_exception(); // capture
        std::cerr << "Unknown exception occurred.\n" << std::endl;
        PyErr_Occurred();
        PyErr_Print();
    }
}

void Init(v8::Local<v8::Object> exports) {
    exports->Set(Nan::New("tensorflow").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(Tensorflow)->GetFunction());
}

NODE_MODULE(tensorflow, Init)