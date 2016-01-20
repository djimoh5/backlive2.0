var BaseController = require("./BaseController.js");
var NewsService = require("../service/NewsService.js");

function NewsController() {
	BaseController.call(this, { newsService: NewsService });
	
	this.custom = function(req, res) {
        res.services.newsService.customFeed(req.query.rss).done(function(data) {
			res.send(data);
		});
	}
    
    this.market = function(req, res) {
        res.services.newsService.getMarketNews().done(function(data) {
			res.send(data);
		});
	}
    
    this.cnbc = function(req, res) {
        res.services.newsService.getCNBCNews().done(function(data) {
			res.send(data);
		});
	}
    
    this.bloombergRadio = function(req, res) {
        res.services.newsService.getBloombergRadio().done(function(data) {
			res.send(data);
		});
	}
    
    this.economist = function(req, res) {
        res.services.newsService.getEconomist().done(function(data) {
			res.send(data);
		});
	}
}

NewsController.inherits(BaseController);
module.exports = NewsController;