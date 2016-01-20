var BaseController = require("./BaseController.js");
var IndicatorService = require("../service/IndicatorService.js");

function IndicatorController() {
	BaseController.call(this, { indicatorService: IndicatorService });
	
	this.index = function(req, res) {
        res.services.indicatorService.getIndicators().done(function(res) {
			res.send(res);
		});
	}
    
    this.post.index = function(req, res) {
        res.services.indicatorService.saveIndicator(res.body.indicator).done(function(res) {
			res.send(res);
		});
	}
    
    this.delete[':indicatorId'] = function(req, res) {
        res.services.indicatorService.removeIndicator(req.params.indicatorId).done(function(res) {
			res.send(res);
		});
	}
}

IndicatorController.inherits(BaseController);
module.exports = IndicatorController;