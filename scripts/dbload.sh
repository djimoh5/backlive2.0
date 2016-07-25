#!/bin/sh

#sudo /etc/init.d/mongod stop
#sudo mv ~/mongo/* /mnt/db
#sudo /etc/init.d/mongod start

mongo ./dbfload.js

#java -jar -Xms256m -Xmx2048m ../../../Loader.jar shortinterest
#java -jar -Xms256m -Xmx2048m ../../../Loader.jar pricing
#java -jar -Xms256m -Xmx2048m ../../../Loader.jar dividend
java -jar -Xms256m -Xmx2048m ../../../Loader.jar technicals

#update short interest
node run.js 2 shortInterest
node run.js 2 dividends

#cache sector and index data
node run.js 0 indices
node run.js 0 indices 01
node run.js 0 indices 02
node run.js 0 indices 03
node run.js 0 indices 04
node run.js 0 indices 05
node run.js 0 indices 06
node run.js 0 indices 07
node run.js 0 indices 08
node run.js 0 indices 09
node run.js 0 indices 10
node run.js 0 indices 11
node run.js 0 indices 12

#denorm and compress data for backtest
mongo ./indextech.js
node run.js 0 denormField is tickers dps
mongo ./denorm.js
mongo ./customindicators.js
node run.js 0 compress tickers
node run.js 0 compressETF

#update strategies
node run.js 3 update

#load macro data
node run.js 2 stlfed

java -jar -Xms256m -Xmx2048m ../../../Loader.jar sec
java -jar -Xms256m -Xmx2048m ../../../Loader.jar secXBRL
