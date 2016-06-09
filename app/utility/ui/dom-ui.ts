//TODO: import jQuery and move ALL app usage of it to this class!
declare var window:any, document: any, $:any;

import {Config} from 'backlive/config';
import {PlatformUI} from './platform-ui';

export class DomUI implements PlatformUI {
    reload(path: string = null) {
        window.location.href = Config.SITE_URL + (path ? ('/' + path) : '');
    }
    
    redirect(path: string = '') {
        window.location.href = '/' + path;
    }
    
    query(selector: any): any {
        return $(selector);
    }
    
    collapseHeader(isCollapsed: boolean) {
        if(isCollapsed) {
            $('#mainContainer').addClass('collapsed');
            $('header-nav').addClass('hide');
            
        }
        else {
            $('#mainContainer').removeClass('collapsed');
            $('header-nav').removeClass('hide');
        }
    }
    
    onResize(eventNamespace: string, callback: Function) {
        $(window).off('resize.' + eventNamespace);
        $(window).on('resize.' + eventNamespace, () => {
            callback($(window).width());
        });
        
        callback($(window).width());
    }
    
    onScroll(eventNamespace: string, callback: Function) {
        $(window).on('scroll.' + eventNamespace, () => {
            callback($(window).scrollTop());
        });
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
    
    scrollToTop(animationTime?:number) {
        if(animationTime) {
            $("html,body").animate({ scrollTop: 0}, animationTime)
        }
        else {
            $('html,body').scrollTop(0)
        }
    }
}