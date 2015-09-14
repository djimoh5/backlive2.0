var Routes = [
	{ path: '/', controller: require('./controller/HomeController') },
	{ path: '/api/user', controller: require('./controller/UserController') },
	/*{ path: '/api/backtest', controller: require('./controller/backtest') },
	{ path: '/api/portfolio', controller: require('./controller/portfolio') },
	{ path: '/api/autocomplete', controller: require('./controller/autocomplete') },
	{ path: '/api/trader', controller: require('./controller/trader') },
	{ path: '/api/rss', controller: require('./controller/rss') }*/
];

module.exports = Routes;