from tensorflow.examples.tutorials.mnist import input_data
mnist = input_data.read_data_sets('MNIST_data', one_hot=True)

import sys, json, numpy as np
import time
import ctypes

import tensorflow as tf
sess = tf.InteractiveSession()

print('boom')
startTime = time.time()

np_input = mnist.train.images
np_output = mnist.train.labels
np_input_test = mnist.test.images
np_output_test = mnist.test.labels

# read input data

#line = sys.stdin.buffer.readline()
#print(len(line))

#line = sys.stdin.buffer.readline()
#print(len(line))

#for _ in range(len(line)):
#    print(line[_])

#arr = np.frombuffer(line, dtype=np.float32)
#print(len(arr))
'''
np_input = np.array(json.loads(line)).reshape((-1, 784))

line = sys.stdin.readline()
np_output = np.array(json.loads(line)).reshape((-1, 10))

line = sys.stdin.readline()
np_input_test = np.array(json.loads(line)).reshape((-1, 784))

line = sys.stdin.readline()
np_output_test = np.array(json.loads(line)).reshape((-1, 10))
'''

#print('{}, {}'.format(len(np_input), len(np_output))
#print('{}, {}'.format(len(np_input_test), len(np_output_test))

# build graph
x = tf.placeholder(tf.float32, shape=[None, 784])
y_ = tf.placeholder(tf.float32, shape=[None, 10])

Wh = tf.Variable(tf.random_normal([784, 10], stddev=.035), name="h_weights")
bh = tf.Variable(tf.random_normal([10], stddev=1.0), name="h_bias")

#Wo = tf.Variable(tf.random_normal([30, 10], stddev=.32), name="o_weights")
#bo = tf.Variable(tf.random_normal([10], stddev=1.0), name="o_bias")

sess.run(tf.global_variables_initializer())

y = tf.matmul(x,Wh) + bh

#hx = tf.sigmoid(tf.matmul(x,Wh) + bh)
#y = tf.matmul(hx,Wo) + bo

cross_entropy = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(labels=y_, logits=y))

train_step = tf.train.GradientDescentOptimizer(0.5).minimize(cross_entropy)

numInputs = len(np_input) #or np_input.shape[0]
batchSize = 100
loops = int(numInputs / batchSize) #TODO: convert to Math.ceil so we don't lose last set of values
epochs = 2

def shuffle(a, b):
    assert len(a) == len(b)
    p = np.random.permutation(len(a))
    return a[p], b[p]

for _ in range(loops * epochs):
    start = (_ % loops) * batchSize
    end = start + batchSize
    end = end if end < numInputs else numInputs

    if start == 0:
        np_input, np_output = shuffle(np_input, np_output)
        print('epochs left: {}'.format(epochs))
        epochs = epochs - 1

    train_step.run(feed_dict={x: np_input[start:end:1], y_: np_output[start:end:1]})

correct_prediction = tf.equal(tf.argmax(y,1), tf.argmax(y_,1))

accuracy = tf.reduce_mean(tf.cast(correct_prediction, tf.float32))

print(time.time() - startTime)

print(accuracy.eval(feed_dict={x: np_input_test, y_: np_output_test}))