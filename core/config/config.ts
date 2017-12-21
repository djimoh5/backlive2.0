declare var __dirname: any;

export class Config {
    /*** directories ***/
    static BASE_DIR = __dirname + '/../../';
    static CORE_DIR = __dirname + '/../';
    static DIR_LIB = Config.CORE_DIR + 'lib/';
    static DIR_UTILITY = Config.CORE_DIR + 'utility/';

    /*** databases ***/
    static MONGO_IP = '127.0.0.1'; //127.0.0.1 //34.230.238.122
    static MONGO_DB = 'btif';//Config.MONGO_IP === '127.0.0.1' ? 'mnist' : 'btif';
    static MONGO_PRICING_DB = 'pricing';
    
    /*** email ***/
    static MANDRILL_API_KEY = 'oweoS4RQJE2pOx2s8MXVhQ';

    static REVISION = 63;
}