// import all components that will be used as routes
import {HomeComponent} from '../component/home/home.component';
import {PricingComponent} from '../component/pricing/pricing.component';
import {AboutUsComponent} from '../component/aboutus/aboutus.component';
import {FaqComponent} from '../component/faq/faq.component';
import {TermsComponent} from '../component/terms/terms.component';

// define routes and map to components
import {RouteMap} from '../../app/service/router.service';

export class Route {
	static Home: string[] = ['/Home'];
	static Pricing: string[] = ['/Pricing'];
    static AboutUs: string[] = ['/Aboutus'];
	static Faq: string[] = ['/Faq'];
	static Terms: string[] = ['/Terms'];
}

export var RouteComponentMap: RouteMap[]  = [
	{ route: Route.Home, component: HomeComponent, isRoot: true, isPublic: true },
	{ route: Route.Pricing, component: PricingComponent, isPublic: true },
	{ route: Route.AboutUs, component: AboutUsComponent, isPublic: true },
	{ route: Route.Faq, component: FaqComponent, isPublic: true },
	{ route: Route.Terms, component: TermsComponent, isPublic: true }
];