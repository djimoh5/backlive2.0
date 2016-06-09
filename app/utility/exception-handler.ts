import {PLATFORM_DIRECTIVES, provide, enableProdMode, ExceptionHandler} from '@angular/core';
import {Config} from 'backlive/config';

declare var ga, $;

class _ArrayLogger { res = [];
  log(s: any): void {}
  logError(s: any): void {}
  logGroup(s: any): void {}
  logGroupEnd(){};
}

export class AppExceptionHandler extends ExceptionHandler {
    constructor() {
        super(new _ArrayLogger(), true);
    }

    call(exception: any, stackTrace?: any, reason?: string) {
        Config.APP_CRASHED = exception;
        var exceptionStr = ExceptionHandler.exceptionToString(exception, stackTrace, reason);
        console.error(exceptionStr);
        
        if (typeof (ga) !== 'undefined') {
            ga('send', { hitType: 'event', eventCategory: 'javascript', eventAction: 'exception', eventLabel: exceptionStr });
        }
        
        if(Config.SHOW_ERRORS) {
            //show error message
            $('#jsErrorMessageBar').removeClass('hide');
            setInterval(() => {
                $('#jsErrorMessageBar').toggleClass('magictime boingInUp');
            }, 1000);
        }

        super.call(exception, stackTrace, reason);
    }
}
