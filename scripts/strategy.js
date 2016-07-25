DIR_ROOT = "."
require(DIR_ROOT + './core/config');
require(DIR_ROOT + DIR_LIB + "model.js");

u = require(DIR_ROOT + DIR_JS_LIB + 'common');
require('./scraper.js');
require(DIR_ROOT + DIR_LIB + 'backtest'); //change to backtest once live
require(DIR_ROOT + DIR_LIB + 'calculation');

var mandrill = require('mandrill-api/mandrill');
var mandrillClient = new mandrill.Mandrill(MANDRILL_API_KEY);

DB_WRITE_CONCERN = 0;

process.on('message', function(m) {
    console.log("processing strategy", m);
    db = require(DIR_ROOT + DIR_LIB + 'db');	
    db.open(function() {
        Strategy.update(m.bt_id);
    });
});

Strategy = {
    dates:null,
    weeks:null,
    strats:[],
    update: function(stratId) {
        u.getDates(function(results, weeks) {
            Strategy.dates = results;
            Strategy.weeks = weeks;
            var query = { active:1 };
            
            if(stratId)
                query.bt_id = stratId;
                
			db.mongo.collection("user_stgy", function(err, collection) {
                collection.find(query).toArray(function(err, results) {
                    Strategy.strats = results;
                    Strategy.run();
				});
			});
		}, -1);
    },
    
    run: function() {
        if(Strategy.strats.length > 0) {
            var strat = Strategy.strats.shift();
            
            db.mongo.collection("log_bt", function(err, collection) {
                var oid = new db.bson.ObjectID(strat.bt_id);
            
                collection.findOne({ _id:oid }, function(err, result) {
                    Strategy.process(strat, result);
			    });
		    });
        }
        else {
            setTimeout(function() {
                console.log('exiting');
                process.exit();    
            }, 2000)
        }
    },
    
    process: function(strat, bt) {
        db.mongo.collection("user_stgy_tr", function(err, collection) {
            collection.find({ id:strat._id.toString() }).sort({"_id":-1}).limit(1).toArray(function(err, results) {
                var endDate = Strategy.dates[Strategy.dates.length - 1];
                var startDate;
                var basket = {}, oldBasket = {}, lastDate, capt;
                
                if(results.length > 0) {
                    startDate = (new Date(results[0].date)).format();
                    lastDate = startDate;
                    capt = results[0].capt;

                    if(startDate == endDate) {
                        console.log(bt.name, "strategy already up to date");
                        Strategy.run();
                        return; //already processed strategy for this date
                    }
                    else {
                        var bsk = results[0].basket;
                        for(var tkr in bsk) {
                            oldBasket[tkr.replace("-", ".")] = bsk[tkr]; //need this reference since basket we pass is mutable
                            basket[tkr.replace("-", ".")] = bsk[tkr];
                        }
                    }
                }
                else
                    startDate = (new Date(strat.date)).format();
    
                //set start to first date AFTER start date
                for(var i = Strategy.dates.length - 1; i > 0; i--) {
                    if(startDate >= Strategy.dates[i - 1] && (lastDate || Strategy.weeks[i] == 1)) {
                        startDate = Strategy.dates[i];
                        break;
                    }
                }
                
                bt.data.startYr = startDate; 
                bt.data.endYr = endDate;
                bt.data.initCapt = strat.capt;
                
                console.log(bt.name, startDate, endDate);
                (new Backtest()).run(strat._id.toString(), bt.data, { basket:basket, capt:capt, date:lastDate, 
                    callback:function(newBasket, currPrices, basketPrices) {
                        Strategy.finish(strat, bt, oldBasket, newBasket, currPrices, basketPrices);
                    } 
                });
			});
		});
    },
    
    finish: function(strat, bt, oldb, newb, currPrices, basketPrices) {
        //find difference between new and old basket to determine trades to be made
        var buy = {}, sell = {}, tradesMade = false;
        
        console.log('old:', oldb);
        console.log('new:', newb);
    
        for(var tkr in newb) {
            if(oldb && oldb[tkr]) {
                var shares = (newb[tkr].shares * (newb[tkr].short ? -1 : 1)) - (oldb[tkr].shares * (oldb[tkr].short ? -1 : 1));
                
                if(shares != 0) {
                    if(shares > 0)
                        buy[tkr] = shares;
                    else if(shares < 0)
                        sell[tkr] = Math.abs(shares);
                        
                    tradesMade = true;
                }

                delete oldb[tkr]; //remove ticker from old basket so its not processed later
            }
            else if(newb[tkr].short) {
                sell[tkr] = newb[tkr].shares;
                tradesMade = true;
            }
            else {
                buy[tkr] = newb[tkr].shares;
                tradesMade = true;
            }
        }
        
        //exit any positions left in old basket
        if(oldb) {
            for(var tkr in oldb) {
                if(oldb[tkr].short)
                    buy[tkr] = oldb[tkr].shares;
                else
                    sell[tkr] = oldb[tkr].shares;
                    
                tradesMade = true;
            }
        }
        
        var msg = '', msgs = ['', ''];
        
        if(tradesMade) {
            msg = "Positions in your portfolio have changed for your strategy " + bt.name + "<br/><br/>";
            msg += "The following trades need to be made:<br/>";

            var trades = [buy, sell];
            
            //console.log(buy, sell);
            
            for(var i = 0; i < 2; i++) {
                msgs[i] += "<table border=\"1\" cellspacing=\"0\" cellpadding=\"5\"><tr><td colspan=\"4\"><b>" + (i == 0 ? "Buy" : "Sell") + "</b></td></tr>";
                msgs[i] += "<tr><td>Ticker</td><td>Shares</td><td>Last Price</td><td>Position Size</td></tr>"
                for(var tkr in trades[i]) {
                    var price = basketPrices[tkr] ? basketPrices[tkr] : (currPrices[tkr].price ? currPrices[tkr].price : oldb[tkr].price);
                    msgs[i] += '<tr><td>' + tkr + '</td><td>' + trades[i][tkr] + '</td><td>$' + price + '</td>' + '<td>$' + u.addCommas(u.round(price * trades[i][tkr], 2)) + '</td></tr>';
                }
                
                msgs[i] += "</table><br/>";
            }
        }
        else
            msg = "Your strategy " + bt.name + " does not currently require any position changes.";
        
        //send email with trade details
        db.mongo.collection("user", function(err, collection) {
            var oid = new db.bson.ObjectID(strat.uid);
            
            collection.findOne({ _id:oid }, function(err, user) {
                var emailList = [{ email: user.e, type: 'to' }, { email: 'deji@backlivelabs.com', type: 'bcc' }];
                
                mandrillClient.messages.sendTemplate({
                    template_name: "backlive-main-template",
	        		template_content: [{ name:'header', content:"Hi " + user.u + "," }, { name:'main', content:msg }, { name:'main-left', content:msgs[0] }, { name:'main-right', content:msgs[1] }, { name:'action-button', content:"Authenticate Trades" }],
                    message: {
		                to: emailList,
		                subject: "BackLive Strategy Notification: " + bt.name,
		                merge_vars: [{
		                    rcpt: user.e,
                            vars: [{ name:'LINK_ACTION', content:'strategy_' + strat.bt_id }],
		    		    }]
                    }
                }, function(result) {
                }, function(e) {
                    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                });
            });
        });
        
        Strategy.run();
    }
}