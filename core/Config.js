/*** directories ***/
DIR_CORE = "./core/";
DIR_LIB = DIR_CORE + "lib/";
DIR_MODEL = DIR_CORE + "model/";
DIR_VIEW = "./view/";
DIR_CSS = "./css/";
DIR_JS = "./js/";
DIR_JS_LIB = DIR_JS + "lib/";
DIR_JS_INCLUDE = DIR_JS + "include/";
DIR_JS_PLUGINS = DIR_JS +  "plugins/";

/*** databases ***/
MONGO_DB = "btif";
MONGO_PRICING_DB = "pricing";

/*** startup ***/
STARTUP_PAGE = 'page.html';

REVISION = 63;

Function.prototype.inherits = function (parentClassOrObject) {
    if (parentClassOrObject.constructor == Function) {
        //Normal Inheritance 
        var tmp = function () { };
        tmp.prototype = parentClassOrObject.prototype; //clone parent's prototype

        this.prototype = new tmp(); //new parentClassOrObject; if we used parent here instead of using clone, it would call constructor which we want to do in actual class to pass parameters
        this.prototype.constructor = this;
        this.prototype.parent = tmp.prototype; //parentClassOrObject.prototype;
    }
    else {
        //Pure Virtual Inheritance 
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
};

