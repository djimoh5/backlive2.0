declare var md5:any;

declare var $: any;

export class Cache {
	static set (key: string, data: any, expirationInSeconds: number, subKey: string = '_') {
		var encryptedKey = md5(key);
        var currentData = $.jStorage.get(encryptedKey);
        
        if(!currentData || $.type(currentData) == 'string') {
            currentData = {};
        }
        
        currentData[md5(subKey)] = data;
        $.jStorage.set(encryptedKey, currentData, { TTL: expirationInSeconds * 1000 });
	}
	
	static get (key: string, subKey: string = '_') {
		var data = $.jStorage.get(md5(key));
        return data ? data[md5(subKey)] : null;
	}
	
	static remove (key: string) {
		$.jStorage.deleteKey(md5(key));
	}
	
	static flush () {
		$.jStorage.flush();
	}
	
	static size () {
		return $.jStorage.storageSize();
	}
	
	static free () {
		return $.jStorage.storageAvailable();
	}
}