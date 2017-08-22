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
    float* trainData = (float*) node::Buffer::Data(info[0]->ToObject());
    float* trainLblData = (float*) node::Buffer::Data(info[1]->ToObject());
    const int trainRows = info[2]->IntegerValue();
    const int trainCols = info[3]->IntegerValue();

    float* testData = (float*) node::Buffer::Data(info[4]->ToObject());
    float* testLblData = (float*) node::Buffer::Data(info[5]->ToObject());
    const int testRows = info[6]->IntegerValue();
    const int testCols = info[7]->IntegerValue();

    const int numClasses = info[8]->IntegerValue();

    std::printf("train data: %f %d %d\n ", trainData[155], trainRows, trainCols);
    std::printf("train lbl data: %f %d %d\n ", trainLblData[155], trainRows, numClasses);
    std::printf("test data: %f %d %d\n ", testData[155], testRows, testCols);
    std::printf("test lbl data: %f %d %d\n ", testLblData[155], testRows, numClasses);

    npy_intp trainDims[2] = { trainRows, trainCols };
    npy_intp trainLblDims[2] = { trainRows, numClasses };
    npy_intp testDims[2] = { testRows, testCols };
    npy_intp testLblDims[2] = { testRows, numClasses };
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

        PyObject *pArgs = PyTuple_New(4);
        PyTuple_SetItem(pArgs, 0, npTrain);
        PyTuple_SetItem(pArgs, 1, npTrainLbl);
        PyTuple_SetItem(pArgs, 2, npTest);
        PyTuple_SetItem(pArgs, 3, npTestLbl);

        cout << "function args set" << endl;

        PyObject *pReturn = PyObject_CallObject(pFunction, pArgs);
        Py_DECREF(pArgs);

        printf("Result of call: %ld\n", PyLong_AsLong(pReturn));
        //printf("Result of call: %f\n", PyFloat_AsDouble(pReturn));
        Py_DECREF(pReturn);
        Py_XDECREF(pFunction);
        Py_DECREF(pModule);
        
        //Py_Finalize(); crashes program
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