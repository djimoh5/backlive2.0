declare var window: any;
declare var XLSX: any;

import { Common } from './common';

if (!FileReader.prototype.readAsBinaryString) {
    FileReader.prototype.readAsBinaryString = function (fileData) {
        var binary = "";
        var pt = this;
        var reader = new FileReader();
        reader.onload = function (e) {
            var bytes = new Uint8Array(reader.result);
            var length = bytes.byteLength;
            for (var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }

            pt.content = binary;
            pt.onload();
        };

        reader.readAsArrayBuffer(fileData);
    };
}

export class FileLoader {
	reader: FileReader;
	options: FileLoaderOptions;
    callback: Function;
    fileNames: string[];
	
	constructor(callback: Function, options: FileLoaderOptions) {
		if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
			alert('The File APIs are not fully supported in this browser.');
		}
		
        this.options = Common.clone({ startLineNumber: 0 }, options);
		this.callback = callback;
	}
	
    read(evt: Event) {
        var files = evt.target['files'];
        this.fileNames = [];
		
        for (var i = 0, f; f = files[i]; i++) {
            this.fileNames.push(f.name);
			this.reader = new FileReader();
            this.reader.onload = () => this.processFile(f);
            switch (this.options.fileType) {
                case FileType.XLSX:
                case FileType.Binary:
                    this.reader.readAsBinaryString(f);
                    break;
                case FileType.ArrayBuffer:
                    this.reader.readAsArrayBuffer(f);
                    break;
                default: this.reader.readAsText(f);
            }

            break;
        }
	}
	
    private processFile(f: any) {
        switch (this.options.fileType) {
            case FileType.CSV: this.processCSV();
                break;
            case FileType.XLSX: this.processXLSX();
                break;
            case FileType.Binary:
            case FileType.ArrayBuffer:
                this.processFileUpload(f);
                break;
            default: this.callback(this.reader.result);
        }
    }

    private processXLSX() {
        var output: { [key: string]: string }[] = [];
        var columnIndex: { [key: string]: number } = {};
        ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].forEach((letter, index) => { columnIndex[letter] = index; });

        var binaryData = this.reader.result ? this.reader.result : this.reader['content'];

        var workbook = XLSX.read(binaryData, { type: 'binary' });
        var worksheet = workbook.Sheets[workbook.SheetNames[0]];

        for (var c in worksheet) {
            if (c[0] !== '!') {
                var row = parseInt(c[1]);
                var column = columnIndex[c[0]];

                if (row >= this.options.startLineNumber) {
                    var field = this.options.fieldMap[column];
                    if (field) {
                        var dataRow = output[row - this.options.startLineNumber];

                        if (!dataRow) {
                            output[row - this.options.startLineNumber] = dataRow = {};
                        }

                        dataRow[field] = worksheet[c].w || worksheet[c].v;
                    }
                }
            }
        }
        this.callback(output);
    }

    private processFileUpload(f: any) {
        var contents = [].slice.call(new Uint8Array(this.reader.result ? this.reader.result : this.reader['content']));
        var data: FileUpload = { fileName: f.name, contents: contents };
        this.callback(data);
    }

    private processCSV() {
        var data: any = [],
            rowNum = 0,
            lines = this.reader.result.split("\n");

        lines.forEach((line: string) => {
            if (rowNum++ >= this.options.startLineNumber) {
                var arr = line.split(',');

                if (arr.length > 0) {
                    if (this.options.fieldMap) {
                        var obj: any = { _: [] }; //unmapped fields will appear in "underscore" array, kind of hacky so revisit

                        for (var i = 0, len = arr.length; i < len; i++) {
                            if (!this.options.fieldMap[i]) {
                                obj._.push(arr[i].trim());
                            }
                            else {
                                obj[this.options.fieldMap[i]] = arr[i].trim();
                            }
                        }

                        if (obj._.length == 0) {
                            delete obj._;
                        }

                        data.push(obj);
                    }
                    else {
                        for (var i = 0, len = arr.length; i < len; i++) {
                            arr[i] = arr[i].trim();
                        }

                        data.push(arr);
                    }
                }
            }
        });

        this.callback(data);
    }
}

export interface FileLoaderOptions {
    fileType: FileType;
    fieldMap?: string[];
    startLineNumber?: number;
}

export enum FileType {
    CSV,
    XLSX,
	XML,
	JSON,
    TXT,
    Binary,
    ArrayBuffer
}

interface FileUpload {
    fileName: string;
    contents: any[];
}