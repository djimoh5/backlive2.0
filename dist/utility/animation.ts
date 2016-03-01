export class Animation {
	private static get Hide(): string { return 'vn-animate-hide' };
	private static get Delay(): string { return 'vn-animate-delay' };
	
	public static get Rotate3d(): string { return 'vn-animate-rotate3d' };
    public static get FadeIn(): string { return 'vn-animate-fade-in' };
	public static get SlideInLeft(): string { return 'vn-animate-slide-in-left' };
	public static get SlideInDown(): string { return 'vn-animate-slide-in-down' };

	static hide(animation: string) {
		return animation + ' ' + this.Hide;
	}
	
	static delay(animation: string) {
		return animation + ' ' + this.Delay;
	}
}