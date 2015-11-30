// import all components that will be used as routes
import {HomeComponent} from '../component/marketing/home';
import {PricingComponent} from '../component/marketing/pricing';
import {AboutUsComponent} from '../component/marketing/aboutus';
import {FaqComponent} from '../component/marketing/faq';
import {TermsComponent} from '../component/marketing/terms';

// define routes and map to components
import {RouteMap} from '../service/router';

export class Route {
	public static get Home(): string[] { return ['/Home'] };
	public static get Pricing(): string[] { return ['/Pricing'] };
    public static get AboutUs(): string[] { return ['/Aboutus'] };
	public static get Faq(): string[] { return ['/Faq'] };
	public static get Terms(): string[] { return ['/Terms'] };
}

export var RouteComponentMap: RouteMap[]  = [
	{ route: Route.Home, component: HomeComponent, isRoot: true, isPublic: true },
	{ route: Route.Pricing, component: PricingComponent, isPublic: true },
	{ route: Route.AboutUs, component: AboutUsComponent, isPublic: true },
	{ route: Route.Faq, component: FaqComponent, isPublic: true },
	{ route: Route.Terms, component: TermsComponent, isPublic: true }
];