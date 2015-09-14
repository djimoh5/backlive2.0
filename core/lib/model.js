Model = function(params, callback, session) {
	//model = this;
	data = null;
	
	this.params = params;
	this.callback = callback;
    this.session = session;
	
	//if(params != undefined)
		//console.log(params);
}

Model.prototype.finish = function(data) {
	if(this.callback)
		this.callback(data);
}