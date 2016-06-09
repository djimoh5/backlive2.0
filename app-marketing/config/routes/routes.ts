import {RouteInfo} from '../../../app/service/router.service';

// import all components that will be used as routes
import {HomeComponent} from '../../component/home/home.component';
import {PricingComponent} from '../../component/pricing/pricing.component';
import {AboutUsComponent} from '../../component/aboutus/aboutus.component';
import {FaqComponent} from '../../component/faq/faq.component';
import {TermsComponent} from '../../component/terms/terms.component';

export class Route {
	static Home: RouteInfo = {
        link: ['/Home'], component: HomeComponent, isRoot: true, isPublic: true
    }
    static Pricing: RouteInfo = {
        link: ['/Pricing'], component: PricingComponent, isPublic: true
    }
    static AboutUs: RouteInfo = {
        link: ['/Aboutus'], component: AboutUsComponent, isPublic: true
    }
    static Faq: RouteInfo = {
        link: ['/Faq'], component: FaqComponent, isPublic: true
    }
    static Terms: RouteInfo = {
        link: ['/Terms'], component: TermsComponent, isPublic: true
    }
}