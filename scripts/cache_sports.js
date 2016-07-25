Cache = {
	index:-1,
    model:require("../core/model/data.js").model,
	
	backtestFields: function() {
        //retrieve valid fields
		db.mongo.collection('fields', function(error, collection) {
			collection.remove({}, function(err, result) {
				Cache.cacheFields(['nba_team', 'NBA Team', 100], 'nba', 1);
				Cache.cacheFields(['nba_player', 'NBA Player', 101], 'nba', 2);
				Cache.cacheFields(['nba_bet', 'NBA Betting', 102], 'nba', 3);
				
				Cache.cacheFields(['mlb_team', 'MLB Team', 100], 'mlb', 1);
				Cache.cacheFields(['mlb_player', 'MLB Player', 101], 'mlb', 2);
				Cache.cacheFields(['mlb_bet', 'MLB Betting', 102], 'mlb', 3);
			});
		});
	},
	
	cacheData: function(tbl, data) {
		console.log(u.sprintf("Caching ticker %s for year %d", data.ticker, data.date));
		
		db.mongo.collection(tbl + "_c", function(error, collection) {
			collection.insert(data, function(err) {});
		});
	},
	
	cacheFields: function(data, sport, sortOrder) {
		console.log('caching fields for ' + data[0]);
		var fields = { name:data[1], type:data[2], sort:sortOrder, sport:sport, fields:[] };
		
		//retrieve valid fields
		db.mongo.collection(data[0], function(error, collection) {
			collection.findOne({ $or:[{ pts:{ $exists:1 } }, { score:{ $exists:1 } }, { RBI:{ $exists:1 }, IP:{ $exists:1 } }] }, function(err, result) {
				for(var key in result) {
                    var excl = ['date', '_id', 'tm_id', 'gm_id', 'vs_id', 'team_id', 'updated'];
					if(!u.inArray(key, excl) && !(data[0].indexOf('_bet') >= 0 && key == 'score')) {
                        fields.fields.push(key);
					}
				}
				
				fields.fields.sort();
				
				db.mongo.collection('fields', function(error, collection) {
					collection.insert(fields, function(err) {});
				});
			});
		});
	},
	
    exit: function() {
        setTimeout(function() {
            process.exit();
        }, 5000);
    }
}