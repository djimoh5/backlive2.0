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
    def __init__(self, learningRate, epochs, batchSize, regParam, hiddenLayers, costFunctionType):
        self.learningRate = learningRate
        self.epochs = int(epochs)
        self.batchSize = int(batchSize)
        self.regParam = regParam
        self.hiddenLayers = hiddenLayers
        self.costFunctionType = costFunctionType

def shuffle(a, b):
    assert len(a) == len(b)
    p = np.random.permutation(len(a))
    return a[p], b[p]

def variable_summaries(var):
    """Attach a lot of summaries to a Tensor (for TensorBoard visualization)."""
    '''
    with tf.name_scope('summaries'):
      mean = tf.reduce_mean(var)
      tf.summary.scalar('mean', mean)
      stddev = tf.sqrt(tf.reduce_mean(tf.square(var - mean)))
      tf.summary.scalar('stddev', stddev)
      #tf.summary.scalar('max', tf.reduce_max(var))
      #tf.summary.scalar('min', tf.reduce_min(var))
      tf.summary.histogram('histogram', var)
    '''

def get_cost_function(y_, y):
    if network.costFunctionType == 1:
        return tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(labels=y_, logits=y)) #softmax cross entrophy
    if network.costFunctionType == 2:
        return tf.reduce_mean(tf.nn.sigmoid_cross_entropy_with_logits(labels=y_, logits=y)) #sigmoid cross entrophy, 1 class only
    if network.costFunctionType == 3:
        return tf.reduce_mean(tf.square(y_ - y)) #linear regression

def get_accuracy_function(y_, y):
    if network.costFunctionType == 1:
        correct_prediction = tf.equal(tf.argmax(y,1), tf.argmax(y_,1))
        return tf.reduce_mean(tf.cast(correct_prediction, tf.float32))
    else:
        error_percentage = tf.abs(tf.divide(tf.subtract(y_, y), y_)) #MAPE accuracy, mean absolute percentage error
        return 1 - tf.reduce_mean(error_percentage)

def create_weights(num_inputs, num_nodes, name):
    weights = tf.Variable(tf.random_normal([num_inputs, num_nodes], stddev=(1/math.sqrt(num_inputs))), name=('weights_' + name))
    with tf.name_scope('weights'):
        variable_summaries(weights)
    return weights

def create_bias(num_nodes, name):
    bias = tf.Variable(tf.random_normal([num_nodes], stddev=1.0), name=('bias_' + name))
    with tf.name_scope('biases'):
        variable_summaries(bias)
    return bias

def create_layer(input_layer, num_nodes, name, is_output_layer=None):
    with tf.name_scope("layer_" + name):
        num_inputs = int(input_layer.shape[1]) #needed because input layer shape must be casted
        weights = create_weights(num_inputs, num_nodes, name)
        bias = create_bias(num_nodes, name)

        with tf.name_scope("activation_" + name):
            layer = tf.matmul(input_layer, weights) + bias

            if is_output_layer is None:
                layer = tf.nn.relu(layer)
            else:
                if network.costFunctionType != 3:
                    layer = tf.sigmoid(layer)

            variable_summaries(layer)

    return layer

def run(np_input, np_labels, np_input_test, np_labels_test, learningRate, epochs, batchSize, regParam, hiddenLayers, costFunctionType=1):
    global network
    network = Network(learningRate, epochs, batchSize, regParam, hiddenLayers, costFunctionType)
    print("{0} {1} {2} {3} {4} {5}".format(network.learningRate, network.epochs, network.batchSize, network.regParam, network.hiddenLayers, network.costFunctionType))

    num_feat = np_input.shape[1]
    num_cls = np_labels.shape[1]

    try:
        print(np_input.shape)
        print(np_labels.shape)
        print(np_input_test.shape)
        print(np_labels_test.shape)

        #with tf.name_scope('input'):
        #    tf.summary.image('input', np_input, 10)

        # build graph
        x = tf.placeholder(tf.float32, shape=[None, num_feat])
        y_ = tf.placeholder(tf.float32, shape=[None, num_cls])
        print("tensorflow graph defined")

        with tf.name_scope("input"):
            variable_summaries(x)

        input_layer = x

        for i in range(len(hiddenLayers)):
            input_layer = create_layer(input_layer, hiddenLayers[i], str(i))

        y = create_layer(input_layer, num_cls, 'output', True)

        print("layers created")
        #sess.run(tf.global_variables_initializer())
        
        with tf.name_scope('cost_function'):
            cost_function = get_cost_function(y_, y)
            tf.summary.scalar('cost_function', cost_function)

        train_step = tf.train.GradientDescentOptimizer(network.learningRate).minimize(cost_function)

        numInputs = len(np_input) #or np_input.shape[0]
        loops = math.ceil(numInputs / batchSize)
        epochs = network.epochs

        with tf.name_scope('accuracy'):
            accuracy = get_accuracy_function(y_, y)
            tf.summary.scalar('accuracy', accuracy)

        merged = tf.summary.merge_all()
        train_writer = tf.summary.FileWriter('./nn/train', sess.graph)
        test_writer = tf.summary.FileWriter('./nn/test')
        tf.global_variables_initializer().run()

        for i in range(loops * epochs):
            start = (i % loops) * network.batchSize
            end = start + network.batchSize
            end = end if end < numInputs else numInputs

            if start == 0:
                np_input, np_labels = shuffle(np_input, np_labels)
                print('epochs left: {}'.format(epochs))
                epochs = epochs - 1

            #train_step.run(feed_dict={x: np_input[start:end:1], y_: np_labels[start:end:1]})

            if i % 1000 == 0:
                summary, acc = sess.run([merged, accuracy], feed_dict={x: np_input_test, y_: np_labels_test})
                print('Accuracy at step ' + str(i) + ': ' + str(acc))
                test_writer.add_summary(summary, i)
            else:
                summary, _ = sess.run([merged, train_step], feed_dict={x: np_input[start:end:1], y_: np_labels[start:end:1]})
                train_writer.add_summary(summary, i)

        print('time: ' + str(time.time() - startTime))

        #print(accuracy.eval(feed_dict={x: np_input_test, y_: np_labels_test}))
        summary, acc = sess.run([merged, accuracy], feed_dict={x: np_input_test, y_: np_labels_test})
        print('Accuracy: ' + str(acc))
        #test_writer.add_summary(summary, 0)

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
    run(mnist.train.images, mnist.train.labels, mnist.test.images, mnist.test.labels, .5, 30, 100, 0, [100], 1)
    return 1

#run_mnist()