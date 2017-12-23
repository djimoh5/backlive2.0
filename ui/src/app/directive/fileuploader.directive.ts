import {Directive, ElementRef, EventEmitter, Output, Input, OnInit, NgZone} from '@angular/core';
import {ApiService} from 'backlive/service';
import {PlatformUI} from 'backlive/utility/ui';

declare var Dropzone:any;

@Directive({
    selector: '[fileuploader]'
})
export class FileUploaderDirective implements OnInit {
    @Input() fileuploader;
    @Input() action: string;
    @Input() clickable: string;
    @Input() uploadMultiple: boolean = true;
    @Input() headers: { [key: string] : string };
    @Input() preventClickThru: boolean;
    @Input() autoUpload: boolean = true;
    @Input() allowMultiple: boolean = true;
    @Input() addRemoveLinks: boolean = false;
    @Output() progress: EventEmitter<number> = new EventEmitter<number>();
    @Output() done: EventEmitter<FileUploadResult> = new EventEmitter<FileUploadResult>();

    platformUI: PlatformUI;
    
    elementRef: ElementRef;
    apiService: ApiService;
    lastProgress: number = 0;
    parallelUploads: number = 50;
    
    ngZone: NgZone;

    constructor(elementRef: ElementRef, apiService: ApiService, platformUI: PlatformUI, ngZone: NgZone) {
        this.elementRef = elementRef;
        this.apiService = apiService;
        this.platformUI = platformUI;
        
        this.ngZone = ngZone;
    }

    ngOnInit() {
        if (!this.uploadMultiple) {
            this.parallelUploads = 1;
        }

		var options: Options = {
            url: this.action,
            uploadMultiple: this.allowMultiple,
			maxFiles: this.parallelUploads, 
			parallelUploads: this.parallelUploads,
            autoProcessQueue: this.autoUpload,
            headers: this.apiService.AuthorizationHeader,
            addRemoveLinks: this.addRemoveLinks
        };

        if (this.clickable) {
            options.clickable = this.clickable;
        }

        if(this.elementRef.nativeElement.dropZone) {
            this.elementRef.nativeElement.dropZone.destroy();
        }

        var dropZone = new Dropzone(this.elementRef.nativeElement, options);
        this.elementRef.nativeElement.dropZone = dropZone;
        dropZone.on('success', (file: any, response: boolean) => this.onSuccess(file, response));
        dropZone.on('error', (file: any, error: string) => this.onError(file, error));
        dropZone.on('totaluploadprogress', (uploadProgress: number) => this.updateProgress(uploadProgress));
        dropZone.on('totaluploadprogress', (uploadProgress: number) => this.updateProgress(uploadProgress));
        dropZone.on('complete', (file: any) => {
            dropZone.removeFile(file);
            dropZone.setupEventListeners();
            this.platformUI.query('.header-fileuploader').removeClass('disabled');
        });
        dropZone.on('addedfile', () => {
            dropZone.removeEventListeners();
            this.platformUI.query('.header-fileuploader').addClass('disabled');
        });

        if (this.preventClickThru) {
            this.platformUI.query(this.elementRef.nativeElement).click(e => {
                e.preventDefault();
                e.stopPropagation();
            });
        }
    }

    doUpload() {
        this.elementRef.nativeElement.dropZone.processQueue();
    }

    updateProgress(progress : number) {
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

    removeAllFiles() {
        this.elementRef.nativeElement.dropZone.removeAllFiles();
    }
}

interface Options {
    url: string;
    autoProcessQueue?: boolean;
    uploadMultiple?: boolean;
    parallelUploads?: number;
    maxFiles?: number;
    clickable?: string;
    addRemoveLinks?: boolean;
    headers?: { [key: string] : string };
}

export interface FileUploadResult {
    file: any;
    response?: any;
    error?: string;
}