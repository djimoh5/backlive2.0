export class Path {
	static baseComponentUrl = 'app/component/';
	
	static Component(path: string) { return this.baseComponentUrl + path + GLOBAL_CACHE_BUSTER };
	static ComponentView(path: string) { return this.baseComponentUrl + path + '/' + this.lastPath(path) + '.component.html' + GLOBAL_CACHE_BUSTER };
	static ComponentStyle(path: string) { return this.baseComponentUrl + path + '/' + this.lastPath(path) + '.component.less' + GLOBAL_CACHE_BUSTER };
	
	static JSImports(path: string) { return 'Scripts/imports/' + path + GLOBAL_CACHE_BUSTER };
	
	private static lastPath(path: string) {
		var split = path.split('/');
		return split[split.length - 1];
	}
}