export class PlatformUI {
    static canvas: { center: { x: number, y: number } };
    
    reload(_path: string = null, _event?: MouseEvent) { }
    open(_path: string = null) { }
    openExternal(_path: string = null) { }
    redirect(_path: string, _event?: MouseEvent) {}
    query(_selector: any): any {}
    
    onResize(_eventNamespace: string, _callback: (size: { width: number, height: number }) => void) {}
    endOnResize(_eventNamespace: string) { }

    onScroll(_eventNamespace: string, _callback: (scrollTop: number) => void) {}
    endOnScroll(_eventNamespace: string) { }

    infiniteScroll(_onMoreResults: Function, _scrollBuffer: number) {}
    endInfiniteScroll() { }

    scrollToTop(_animationTime?: number) { }
    scrollToItem(_tagId: string) { }

    addDocumentOffClick(_nativeElem: any, _thenDo: Function) { }
    endDocumentOffClick() { }
}