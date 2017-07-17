/// <reference path="../typings/index.d.ts" />

require('./globals.js');

import { Network } from './network';
import { DataLoaderNode } from './node/data/dataloader.node';
import { MNISTLoaderNode } from './node/data/mnist-loader.node';
import { BacktestExecutionNode } from './node/execution/backtest-execution.node';

var network = new Network(new DataLoaderNode(), new BacktestExecutionNode());
network.onReady = () => {
    //network.create(.5, 30, 100, 0, [100]);
};