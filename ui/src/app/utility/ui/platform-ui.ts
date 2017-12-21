export class PlatformUI {
    static canvas: { center: { x: number, y: number } };
    
    reload(path: string = null, event?: MouseEvent) { };
    open(path: string = null) { };
    openExternal(path: string = null) { };
    redirect(path: string, event?: MouseEvent) {};
    query(selector: any): any {};
    
    onResize(eventNamespace: string, callback: (size: { width: number, height: number }) => void) {};
    endOnResize(eventNamespace: string) { };

    onScroll(eventNamespace: string, callback: (scrollTop: number) => void) {};
    endOnScroll(eventNamespace: string) { };

    infiniteScroll(onMoreResults: Function, scrollBuffer: number) {};
    endInfiniteScroll() { };

    scrollToTop(animationTime?: number) { };
    scrollToItem(tagId: string) { };

    addDocumentOffClick(nativeElem: any, thenDo: Function) { };
    endDocumentOffClick() { };

    registerGlobalMethod(name: string, fn:any) { };
}