#from tensorflow.examples.tutorials.mnist import input_data
#mnist = input_data.read_data_sets('MNIST_data', one_hot=True)

#batch = mnist.train.next_batch(100)
#print(batch)

import sys, json, numpy as np
import time

import tensorflow as tf
sess = tf.InteractiveSession()

print('boom')
startTime = time.time()

input = sys.stdin.readline()
output = sys.stdin.readline()

numInputs = 10000
np_input = np.array(json.loads(input)).reshape((numInputs, 784))
np_output = np.array(json.loads(output)).reshape((numInputs, 10))
#tf_input = tf.constant(np_input, dtype=tf.float32, shape=[1000, 784])
#tf_output = tf.constant(np_output, dtype=tf.float32, shape=[1000, 10])

#x = tf.reshape(data, [-1,728,1,1])
#print(tf_input.eval())
#print(tf_output.eval())

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

batchSize = 100
loops = int(numInputs / batchSize)
epochs = 30

for _ in range(loops * epochs):
    #batch = mnist.train.next_batch(100)
    #print(batch)
    #shuff = tf.random_shuffle(x)
    #batch = tf.slice(shuff, [0, 0], [100, 728])
    start = (_ % batchSize) * batchSize
    train_step.run(feed_dict={x: np_input[start:batchSize:1], y_: np_output[start:batchSize:1]})

    if start == 0:
        epochs = epochs - 1
        print(epochs)

correct_prediction = tf.equal(tf.argmax(y,1), tf.argmax(y_,1))

accuracy = tf.reduce_mean(tf.cast(correct_prediction, tf.float32))

print(time.time() - startTime)

print(accuracy.eval(feed_dict={x: np_input, y_: np_output}))

