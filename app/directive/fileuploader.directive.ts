import {Directive, ElementRef, EventEmitter, Output, Input, OnInit, NgZone} from '@angular/core';
import {ApiService} from 'backlive/service';
import {PlatformUI} from 'backlive/utility/ui';

declare var Dropzone:any;

@Directive({
    selector: '[fileuploader]',
    inputs: ['fileuploader']
})
export class FileUploaderDirective implements OnInit {
    @Input() action: string;
    @Input() clickable: string;
    @Input() headers: { [key: string] : string };
    @Input() preventClickThru: boolean;
    @Output() progress: EventEmitter<number> = new EventEmitter<number>();
    @Output() done: EventEmitter<FileUploadResult> = new EventEmitter<FileUploadResult>();

    platformUI: PlatformUI;
    
    elementRef: ElementRef;
    apiService: ApiService;
    lastProgress: number = 0;
    
    ngZone: NgZone;

    constructor(elementRef: ElementRef, apiService: ApiService, platformUI: PlatformUI, ngZone: NgZone) {
        this.elementRef = elementRef;
        this.apiService = apiService;
        this.platformUI = platformUI;
        
        this.ngZone = ngZone;
    }

    ngOnInit() {
        var options: Options = { url: this.action, uploadMultiple: true, maxFiles: 50, parallelUploads: 50, headers: this.apiService.AuthorizationHeader };

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
        dropZone.on("totaluploadprogress", (uploadProgress : number, totalBytes : number, totalBytesSent: number) => this.updateProgress(uploadProgress, totalBytes, totalBytesSent));
        dropZone.on("complete", (file: any) => dropZone.removeFile(file));
        
        if (this.preventClickThru) {
            this.platformUI.query(this.elementRef.nativeElement).click(function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
        }
    }

    updateProgress(progress : number, totalBytes : number, totalBytesSent: number) {
        if(progress == 100 || Math.abs(this.lastProgress - progress) > 2) {
            this.lastProgress = Math.round(progress);
            
            this.ngZone.run(() => {
                this.progress.emit(Math.floor(progress));
            });
        }
    }

    onSuccess(file: any, response: any) {
        this.done.emit({ file: file, response: response });
    }

    onError(file: any, error: string) {
        this.done.emit({ file: file, error: error });
    }
}

interface Options {
    url: string;
    uploadMultiple?: boolean;
    parallelUploads?: number;
    maxFiles?: number;
    clickable?: string;
    headers?: { [key: string] : string };
}

export interface FileUploadResult {
    file: any;
    response?: any;
    error?: string;
}