import {jStorage, MD5} from '../config/imports/js';
System.import(jStorage);
System.import(MD5);

export class Cache {
	static set (key: string, data: any, expirationInSeconds: number = 0) {
		var encryptedKey = md5(key);
		$.jStorage.set(encryptedKey, data);
		
		if(expirationInSeconds > 0) {
			$.jStorage.setTTL(encryptedKey, expirationInSeconds * 1000);
		}
	}
	
	static get (key: string) {
		return $.jStorage.get(md5(key));
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