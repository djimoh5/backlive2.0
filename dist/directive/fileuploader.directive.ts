import {Directive, ElementRef, EventEmitter, Output, Input, OnInit} from 'angular2/core';
declare var Dropzone: any;

@Directive({
    selector: '[fileuploader]',
    inputs: ['fileuploader']
})
export class FileUploader implements OnInit {
    @Input() clickable: string;
    @Output() progress: EventEmitter<number> = new EventEmitter();
    @Output() done: EventEmitter<FileUploadResult> = new EventEmitter();
    
    elementRef: ElementRef;
    lastProgress: number = 0;
    
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    
    ngOnInit() {
        var options: Options = {};
        
        if(this.clickable) {
            options.clickable = this.clickable;
        }

        if(this.elementRef.nativeElement.dropZone) {
            this.elementRef.nativeElement.dropZone.destroy();
        }
        
        var dropZone = new Dropzone(this.elementRef.nativeElement, options);
        this.elementRef.nativeElement.dropZone = dropZone;
        dropZone.on("success", (file: any, response: boolean) => this.onSuccess(file, response));
        dropZone.on("error", (file: any, error: string) => this.onError(file, error));
        dropZone.on("uploadprogress", (file: any, progress: number, byteSent: number) => this.updateProgress(file, progress, byteSent));
    }
    
    updateProgress(file: any, progress: number, byteSent: number) {
        if(progress == 100 || Math.abs(this.lastProgress - progress) > 2) {
            this.lastProgress = Math.round(progress);
            this.progress.next(progress);
        }
    }
    
    onSuccess(file: any, response: any) {
        this.done.next({ file: file, response: response });
    }
    
    onError(file: any, error: string) {
        this.done.next({ file: file, error: error });
    }
}

interface Options {
    clickable?: string;
}

export interface FileUploadResult {
    file: any;
    response?: any;
    error?: string;
}