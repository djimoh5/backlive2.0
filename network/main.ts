require('./globals.js');

import { Config } from '../core/config/config';

import { Network } from './network';
import { DataLoaderNode } from './node/data/dataloader.node';
import { MNISTLoaderNode } from './node/data/mnist-loader.node';
import { BacktestExecutionNode } from './node/execution/backtest-execution.node';

if(Config.MONGO_DB === 'mnist') {
    var network = new Network(new MNISTLoaderNode(), new BacktestExecutionNode());
    network.onReady = () => {
        network.create(.5, 30, 100, 0, [100]);
    }
}
else {
    var network = new Network(new DataLoaderNode(), new BacktestExecutionNode());
}