declare var md5:any;

declare var $: any;

export class Cache {
	static set (key: string, data: any, expirationInSeconds: number, keyCategory: string = null, subKey: string = '_') {
        var encryptedKey = this.getEncryptedKey(key, keyCategory);
        var currentData = $.jStorage.get(encryptedKey);
        
        if(!currentData) {
            currentData = {};
        }
        
        currentData[md5(subKey)] = data;
        $.jStorage.set(encryptedKey, currentData, { TTL: expirationInSeconds * 1000 });
	}
	
    static get(key: string, keyCategory: string = null, subKey: string = '_') {
        var data = $.jStorage.get(this.getEncryptedKey(key, keyCategory));
        return data ? data[md5(subKey)] : null;
	}
	
    static remove(key: string, keyCategory: string = null) {
        $.jStorage.deleteKey(this.getEncryptedKey(key, keyCategory));
	}
	
    static flush(keyCategory: string = null, expirationThreshold: number = null) {
        if (keyCategory) {
            var keys = $.jStorage.index();
            keys.forEach(key => {
                if (key.substring(0, keyCategory.length) === keyCategory && 
                    (!expirationThreshold || $.jStorage.getTTL(key) < (expirationThreshold * 1000))) {
                    $.jStorage.deleteKey(key);
                }
            });
        }
        else {
            $.jStorage.flush();
        }
	}
	
	static size () {
		return $.jStorage.storageSize();
	}
	
	static free () {
		return $.jStorage.storageAvailable();
    }

    private static getEncryptedKey(key: string, keyCategory: string) {
        return keyCategory ? `${keyCategory}${md5(key)}` : md5(key);
    }
}