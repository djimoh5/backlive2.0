export class PlatformUI {
    reload(path: string = null) {};
    redirect(path: string) {};
    query(selector: any): any {};
    collapseHeader(isCollapsed: boolean) {};
    
    onResize(eventNamespace: string, callback: Function) {};
    onScroll(eventNamespace: string, callback: Function) {};
    infiniteScroll(onMoreResults: Function, scrollBuffer: number) {};
    endInfiniteScroll() {};
    scrollToTop(animationTime?:number) {};
}