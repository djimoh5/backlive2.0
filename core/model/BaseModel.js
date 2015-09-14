var BaseModel = function(params, callback, session) {
	this.params = params;
	this.callback = callback;
    this.session = session;
}

BaseModel.prototype.finish = function(data) {
	if(this.callback)
		this.callback(data);
}

module.exports = BaseModel;