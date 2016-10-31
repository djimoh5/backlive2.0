export class Config {
    /*** directories ***/
    static BASE_DIR = __dirname;
    static DIR_CORE = './core/';
    static DIR_LIB = Config.DIR_CORE + 'lib/';
    static DIR_UTILITY = Config.DIR_CORE + 'utility/';
    static DIR_VIEW = Config.BASE_DIR + '/view/';
    static DIR_HOME = Config.BASE_DIR + '/home/';
    static DIR_JS = './js/';

    /*** databases ***/
    static MONGO_DB = 'btif';
    static MONGO_PRICING_DB = 'pricing';
    
    /*** email ***/
    static MANDRILL_API_KEY = 'oweoS4RQJE2pOx2s8MXVhQ';

    static REVISION = 63;
}