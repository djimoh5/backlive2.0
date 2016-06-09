export class AppEvent {
	public static get SearchKeyUp(): string { return 'Event.SearchKeyUp' };
    public static ReloadApp: string = 'Event.ReloadApp';
	
	//UI
	public static get SlidingNavVisible(): string { return 'Event.SlidingNavVisible' };
	public static get SlidingNavItems(): string { return 'Event.SlidingNavItems' };
	public static get PageLoading(): string { return 'Event.PageLoading' };
	public static get OpenModal(): string { return 'Event.OpenModal' };
	public static get CloseModal(): string { return 'Event.CloseModal' };
}