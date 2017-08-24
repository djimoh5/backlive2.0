#from tensorflow.examples.tutorials.mnist import input_data
#mnist = input_data.read_data_sets('MNIST_data', one_hot=True)

import sys, json, math, numpy as np
import time

#print(np.get_include())

import tensorflow as tf
print(tf.__version__)
sess = tf.InteractiveSession()

print('python neural network started')
startTime = time.time()

class Network:
    def __init__(self, learningRate, epochs, batchSize, regParam, hiddenLayers):
        self.learningRate = learningRate
        self.epochs = int(epochs)
        self.batchSize = int(batchSize)
        self.regParam = regParam
        self.hiddenLayers = hiddenLayers

def shuffle(a, b):
    assert len(a) == len(b)
    p = np.random.permutation(len(a))
    return a[p], b[p]

def run(np_input, np_labels, np_input_test, np_labels_test, learningRate, epochs, batchSize, regParam, hiddenLayers):
    network = Network(learningRate, epochs, batchSize, regParam, hiddenLayers)
    print("{0} {1} {2} {3} {4}".format(network.learningRate, network.epochs, network.batchSize, network.regParam, network.hiddenLayers))

    num_feat = np_input.shape[1]
    num_cls = np_labels.shape[1]

    try:
        print(np_input.shape)
        print(np_labels.shape)
        print(np_input_test.shape)
        print(np_labels_test.shape)
        print(num_feat)
        print(num_cls)

        # build graph
        x = tf.placeholder(tf.float32, shape=[None, num_feat])
        y_ = tf.placeholder(tf.float32, shape=[None, num_cls])
        print("tensorflow graph defined")

        num_input_feat = num_feat
        layerWeights = []
        layerBiases = []

        for i in range(len(hiddenLayers)):
            layerWeights.append(tf.Variable(tf.random_normal([num_input_feat, hiddenLayers[i]], stddev=.035), name="h_weights" + str(i)))
            layerBiases.append(tf.Variable(tf.random_normal([hiddenLayers[i]], stddev=1.0), name="h_bias" + str(i)))
            num_input_feat = hiddenLayers[i]

        #output layer
        Wo = tf.Variable(tf.random_normal([num_input_feat, num_cls], stddev=.32), name="o_weights")
        bo = tf.Variable(tf.random_normal([num_cls], stddev=1.0), name="o_bias")

        print("layers created")
        sess.run(tf.global_variables_initializer())

        hx = x
        
        for i in range(len(layerWeights)):
            hx = tf.sigmoid(tf.matmul(hx,layerWeights[i]) + layerBiases[i])
            
        y = tf.matmul(hx,Wo) + bo

        cross_entropy = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(labels=y_, logits=y))
        print("created cross entropy cost function")

        train_step = tf.train.GradientDescentOptimizer(network.learningRate).minimize(cross_entropy)

        numInputs = len(np_input) #or np_input.shape[0]
        loops = math.ceil(numInputs / batchSize)
        epochs = network.epochs

        for _ in range(loops * epochs):
            start = (_ % loops) * network.batchSize
            end = start + network.batchSize
            end = end if end < numInputs else numInputs

            if start == 0:
                np_input, np_labels = shuffle(np_input, np_labels)
                print('epochs left: {}'.format(epochs))
                epochs = epochs - 1

            train_step.run(feed_dict={x: np_input[start:end:1], y_: np_labels[start:end:1]})

        correct_prediction = tf.equal(tf.argmax(y,1), tf.argmax(y_,1))

        accuracy = tf.reduce_mean(tf.cast(correct_prediction, tf.float32))

        print(time.time() - startTime)

        print(accuracy.eval(feed_dict={x: np_input_test, y_: np_labels_test}))

        return 1
    except OSError as err:
        print("OS error: {0}".format(err))
    except ValueError:
        print("Could not convert data to an integer.")
    except NameError as err:
        print("Name error: {0}".format(err))
    except:
        print("Unexpected error:", sys.exc_info()[0])
        raise

def run_mnist():
    print('running mnist')
    run(mnist.train.images, mnist.train.labels, mnist.test.images, mnist.test.labels, .5, 30, 100, 0, [100])
    return 1

#run_mnist()