import { AppEvent, BaseEvent } from 'backlive/network/event';
import { SlidingNavItem } from 'backlive/component/navigation';
import { ModalOptions } from '../component/shared/modal/modal.component';

@AppEvent('Event.PageLoading')
export class PageLoadingEvent extends BaseEvent<boolean> {}

@AppEvent('Event.RouterLoading')
export class RouterLoadingEvent extends BaseEvent<boolean> {}

@AppEvent('Event.Alert')
export class AlertEvent extends BaseEvent<string> {}

@AppEvent('Event.ReloadApp')
export class ReloadAppEvent extends BaseEvent<null> {}

@AppEvent('Event.SearchKeyUp')
export class SearchKeyUpEvent extends BaseEvent<string> {}

@AppEvent('Event.SlidingNavVisible')
export class SlidingNavVisibleEvent extends BaseEvent<boolean> {}

@AppEvent('Event.SlidingNavItems')
export class SlidingNavItemsEvent extends BaseEvent<SlidingNavItem[]> {}

@AppEvent('Event.OpenModal')
export class OpenModalEvent extends BaseEvent<ModalOptions> {}

@AppEvent('Event.CloseModal')
export class CloseModalEvent extends BaseEvent<null> {}

@AppEvent('Event.OpenFooterModal')
export class OpenFooterModalEvent extends BaseEvent<ModalOptions> {}

@AppEvent('Event.CloseFooterModal')
export class CloseFooterModalEvent extends BaseEvent<null> {}

@AppEvent('Event.MessageBar')
export class MessageBarEvent extends BaseEvent<string> {}