//TODO: import jQuery and move ALL app usage of it to this class!
declare var window:any, document: any, $:any;

import { Config } from 'backlive/config';
import { PlatformUI } from './platform-ui';

export class DomUI implements PlatformUI {
    reload(path: string = null, event?: MouseEvent) {
        if (!event || !(event.shiftKey || event.ctrlKey)) {
            window.location.href = Config.SITE_URL + (path ? (path.substring(0, 1) === '/' ? path : `/${path}`) : '');
        }
        else {
            this.open(path);
        }
    }

    open(path: string = null) {
        window.open(Config.SITE_URL + (path ? (path.substring(0, 1) === '/' ? path : `/${path}`) : ''), '_blank');
    }

    openExternal(path: string = null) {
        if (path) {
            if (path.substring(0, 1) === '/') {
                window.open(path, '_blank');
            }
            else if (path.substring(0, 4) === 'http') {
                window.open(path, '_blank');
            }
            else {
                window.open(`/${path}`, '_blank');
            }
        }
        else {
            window.open('', '_blank');
        }
    }
    
    redirect(path: string = '', event?: MouseEvent) {
        if (!event || !(event.shiftKey || event.ctrlKey)) {
            window.location.href = '/' + path;
        }
        else {
            window.open('/' + path, '_blank');
        }
    }
    
    query(selector: any): any {
        return $(selector);
    }
    
    onResize(eventNamespace: string, callback: (size: { width: number, height: number }) => void) {
        $(window).off('resize.' + eventNamespace);
        $(window).on('resize.' + eventNamespace, () => {
            callback({ width: $(window).width(), height: $(window).height() });
        });
        
        callback({ width: $(window).width(), height: $(window).height() });
    }

    endOnResize(eventNamespace: string) {
        $(window).off('resize.' + eventNamespace);
    }

    onScroll(eventNamespace: string, callback: (scrollTop: number) => void) {
        $(window).off('scroll.' + eventNamespace);
        $(window).on('scroll.' + eventNamespace, () => {
            callback($(window).scrollTop());
        });

        callback($(window).scrollTop());
    }

    endOnScroll(eventNamespace: string) {
        $(window).off('scroll.' + eventNamespace);
    }
    
	infiniteScroll(onMoreResults: Function, scrollBuffer: number) {
        var lastScrollTop: number = 0;
        
        $(window).off('scroll.paging');
        $(window).on('scroll.paging', () => {
            var scrollTop = $(window).height() + $(window).scrollTop();
            var documentHeight = $(document).height();
        
            if(scrollTop > (lastScrollTop && scrollBuffer) && scrollTop >= documentHeight) {
                lastScrollTop = scrollTop;
                onMoreResults();
            }
        });
    }
    
    endInfiniteScroll() {
        $(window).off('scroll.paging');
    }

    addDocumentOffClick(nativeElem: any, thenDo: Function) {
        var container = $(nativeElem);
        $(document).on('mouseup.menu-offclick', (e) => {
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                thenDo();
            }
        });
    }

    endDocumentOffClick() {
        $(document).off('mouseup.menu-offclick');
    }

    scrollToTop(animationTime?:number) {
        if(animationTime) {
            $('html,body').animate({ scrollTop: 0 }, animationTime);
        }
        else {
            $('html,body').scrollTop(0);
        }
    }

    scrollToItem(id: string) {
        let el = document.getElementById(id);

        if (el != null) {
            var top = el.getBoundingClientRect().top;
            $('html,body').scrollTop(top - 150);   
        }
    }
}