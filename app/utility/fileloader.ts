export class FileLoader {
	reader: FileReader;
	options: FileLoaderOptions;
	callback: Function;
	
	constructor(callback: Function, options: FileLoaderOptions) {
		if (!(window.File && window.FileReader && window.FileList && window.Blob) {
			alert('The File APIs are not fully supported in this browser.');
		}
		
		this.options = options;
		this.callback = callback;
	}
	
	read (evt: Event) {
		var files = evt.target.files;
		
		for (var i = 0, f; f = files[i]; i++) {
			console.log(f.type);
			
			//if (!f.type.match('image.*')) {
				//continue;
			//}
	
			this.reader = new FileReader();
			this.reader.onload = () => this.processFile();
			this.reader.readAsText(f);
		}
	}
	
	private processFile () {
		console.log(this.reader.result);
		
		if(this.options.fileTypes.indexOf(FileType.CSV) >= 0) {
			var data:any = [],
				lines = this.reader.result.split("\n");
			
			lines.forEach((line: string) => {
				var arr = line.split(',');
				
				if(arr.length > 1 || arr[0]) {
					if(this.options.fieldMap) {
						var obj: any = { _:[] }; //unmapped fields will appear in "underscore" array, kind of hacky so revisit
						
						for(var i = 0, len = arr.length; i < len; i++) {
							if(!this.options.fieldMap[i]) {
								obj._.push(arr[i].trim());
							}
							else {
								obj[this.options.fieldMap[i]] = arr[i].trim();
							}
						}
						
						if(obj._.length == 0) {
							delete obj._;
						}
						
						data.push(obj);
					}
					else {
						for(var i = 0, len = arr.length; i < len; i++) {
							arr[i] = arr[i].trim();
						}
						
						data.push(arr);
					}
				}
			});
			
			this.callback(data);
		}
		else {
			this.callback(this.reader.result);
		}
	}
}

export class FileLoaderOptions {
	fileTypes?: FileType[];
	fieldMap?: string[];
}

export enum FileType {
	CSV,
	XML,
	JSON,
	TXT
}