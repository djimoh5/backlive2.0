import {Directive, ElementRef, EventEmitter, Output, Input, OnInit} from 'angular2/angular2';

@Directive({
    selector: '[fileuploader]',
    inputs: [
        'callback: fileuploader'
    ]
})
export class FileUploader implements OnInit {
    callback: Function;
    elementRef: ElementRef;
    progress: number = 0;
    
    @Input() clickable: string;
    @Output() onSelect:EventEmitter = new EventEmitter();
    @Output() onProgress:EventEmitter = new EventEmitter();
    
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    
    onInit() {
        var options: Options = {};
        
        if(this.clickable) {
            options.clickable = this.clickable;
        }

        if(this.elementRef.nativeElement.dropZone) {
            this.elementRef.nativeElement.dropZone.destroy();
        }
        
        var dropZone = new Dropzone(this.elementRef.nativeElement, options);
        this.elementRef.nativeElement.dropZone = dropZone;
        dropZone.on("success", this.callback);
        dropZone.on("uploadprogress", (file: any, progress: number, byteSent: number) => this.updateProgress(file, progress, byteSent));
    }
    
    updateProgress(file: any, progress: number, byteSent: number) {
        if(progress == 100 || Math.abs(this.progress - progress) > 2) {
            this.progress = Math.round(progress);
            this.onProgress.next(progress);
        }
    }
}

interface Options {
    clickable?: string;
}