export class PlatformUI {
    reload(path: string = null, event?: MouseEvent) { };
    open(path: string = null) {};
    redirect(path: string, event?: MouseEvent) {};
    query(selector: any): any {};
    hideHeader(isCollapsed: boolean) {};
    
    onResize(eventNamespace: string, callback: (size: { width: number, height: number }) => void) {};
    onScroll(eventNamespace: string, callback: Function) {};
    infiniteScroll(onMoreResults: Function, scrollBuffer: number) {};
    endInfiniteScroll() {};
    scrollToTop(animationTime?: number) { };
    scrollToItem(tagId: string) { };
    registerGlobalMethod(name: string, fn:any) { };
}