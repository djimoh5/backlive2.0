import { AppEvent, BaseEvent } from 'backlive/network/event';
import { SlidingNavItem } from 'backlive/component/navigation';
//import { ModalOptions } from 'backlive/component/shared';

@AppEvent('Event.PageLoading')
export class PageLoadingEvent extends BaseEvent {
    constructor(data: boolean) { super(data); }
}

@AppEvent('Event.RouterLoading')
export class RouterLoadingEvent extends BaseEvent {
    constructor(data: boolean) { super(data); }
}

@AppEvent('Event.Alert')
export class AlertEvent extends BaseEvent {
    constructor(data: string) { super(data); }
}

@AppEvent('Event.ReloadApp')
export class ReloadAppEvent extends BaseEvent {
    constructor() { super(null); }
}

@AppEvent('Event.SearchKeyUp')
export class SearchKeyUpEvent extends BaseEvent {
    constructor(data: string) { super(data); }
}

@AppEvent('Event.SlidingNavVisible')
export class SlidingNavVisibleEvent extends BaseEvent {
    constructor(data: boolean) { super(data); }
}

@AppEvent('Event.SlidingNavItems')
export class SlidingNavItemsEvent extends BaseEvent {
    constructor(data: SlidingNavItem[]) { super(data); }
}

@AppEvent('Event.OpenModal')
export class OpenModalEvent extends BaseEvent {
    constructor(data: ModalOptions) { super(data); }
}

@AppEvent('Event.CloseModal')
export class CloseModalEvent extends BaseEvent {
    constructor() { super(null); }
}

@AppEvent('Event.MessageBar')
export class MessageBarEvent extends BaseEvent {
    constructor(data: string) { super(data); }
}