import {Component, Input, AfterViewInit, ViewChild, OnInit, Type} from '@angular/core';

import {Path} from 'backlive/config';
import {PlatformUI} from 'backlive/utility/ui';
import {AppService} from 'backlive/service';
import {BaseComponent} from 'backlive/component/shared';
import {AppEvent} from 'backlive/service/model';

@Component({
    selector: 'backlive-audio',
    templateUrl: Path.ComponentView('shared/audio')
})
export class AudioComponent extends BaseComponent implements OnInit, AfterViewInit {
    @Input() showControls: boolean;
    @Input() src: string;
    @Input() loop: boolean = false;
    @Input() volume: number = 0.5;

    audio: Audio;

    @ViewChild('vnAudio') vnAudio: any;

    loopCallback: Function = () => { this.loopPlayback() };

    constructor(appService: AppService, private platformUI: PlatformUI) {
        super(appService);this.volume = 0;
    }

    ngOnInit() {
        this.subscribeEvent(AppEvent.Audio.Play, (src: string) => {
            this.audio.src = this.src;
            this.audio.play();
        });

        this.subscribeEvent(AppEvent.Audio.Pause, () => {
            this.audio.pause();
        });

        this.subscribeEvent(AppEvent.Audio.Volume, (volume: number) => {
            this.audio.volume = volume;
        });

        this.subscribeEvent(AppEvent.Audio.Volume, (show: boolean) => {
            this.audio.controls = show;
        });

        this.subscribeEvent(AppEvent.Audio.Loop, (loop: boolean) => {
            if (this.loop) {
                this.audio.removeEventListener(AudioEvent.onEnded, this.loopCallback);
            }

            this.loop = loop;

            if (this.loop) {
                this.audio.addEventListener(AudioEvent.onEnded, this.loopCallback);
            } else{
                this.audio.removeEventListener(AudioEvent.onEnded, this.loopCallback);
            }
        });
    }

    ngAfterViewInit() {
        this.audio = this.vnAudio.nativeElement;
        this.audio.src = this.src;
        this.audio.controls = this.showControls;
        this.audio.volume = this.volume;

        if (this.loop) {
            this.audio.addEventListener(AudioEvent.onEnded, this.loopCallback);
        }

        this.audio.addEventListener(AudioEvent.onPlay, () => this.played());
    }

    loopPlayback() {
        this.audio.currentTime = 0;
        this.audio.play();
    }

    played() {
        this.appService.notify(AppEvent.Audio.Played, {
            loop: this.loop,
            src: this.src,
        });
    }
}

export interface Audio {
    play: Function;
    load: Function;
    pause: Function;

    src: string;
    volume: number;
    loop: boolean;
    controls: boolean;
    duration: number;
    muted: boolean;
    currentTime: number;

    addEventListener: Function;
    removeEventListener: Function;
}

export class AudioEvent {
    static onPlay: string = 'play';
    static onPause: string = 'pause';
    static onEnded: string = 'ended';
    static onVolumeChange: string = 'volumechange';
}