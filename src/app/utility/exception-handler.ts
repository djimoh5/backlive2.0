import { ErrorHandler } from '@angular/core';
import { RouterService } from '../service/router.service';
import { Config } from 'backlive/config';

declare var ga, $;

export class AppExceptionHandler extends ErrorHandler {
    constructor() {
        super();
    }

    handleError(error: any) {
        try {
            var exceptionStr = error;

            if (typeof (ga) !== 'undefined') {
                ga('send', {
                    hitType: 'event',
                    eventCategory: 'javascript',
                    eventAction: 'exception',
                    eventLabel: JSON.stringify({
                        url: RouterService.activeUrl,
                        description: exceptionStr
                    })
                });
            }

            if (exceptionStr === 'EXCEPTION: TypeError: Permission denied') { //ignore permission denied (IE)
                return;
            }

            Config.APP_CRASHED = error;

            if (Config.SHOW_ERRORS) {
                //show error message
                $('#jsErrorMessageBar').removeClass('hide');
                setInterval(() => {
                    $('#jsErrorMessageBar').toggleClass('magictime boingInUp');
                }, 1000);
            }
        } catch (e) { }

        super.handleError(error);
    }
}
