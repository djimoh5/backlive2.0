var Routes = [
    //Pages
	{ path: '/', controller: require('./controller/HomeController') },
    { path: '/strategy', controller: require('./controller/HomeController') },
    { path: '/dashboard', controller: require('./controller/HomeController') },
    { path: '/portfolio', controller: require('./controller/HomeController') },
    { path: '/research', controller: require('./controller/HomeController') },
    
    //API Endpoints
	{ path: '/api/user', controller: require('./controller/UserController') },
    { path: '/api/ticker', controller: require('./controller/TickerController') },
    { path: '/api/indicator', controller: require('./controller/IndicatorController') },
    { path: '/api/news', controller: require('./controller/NewsController') },
    { path: '/api/portfolio', controller: require('./controller/PortfolioController') },
    { path: '/api/strategy', controller: require('./controller/StrategyController') },
];

module.exports = Routes;