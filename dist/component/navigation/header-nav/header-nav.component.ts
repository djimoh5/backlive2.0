import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService, UserService, RouterService} from 'backlive/service';

import {Route} from 'backlive/routes';
import {AppEvent} from '../../../service/model/app-event';
import {User} from '../../../service/model/user';

@Component({
    selector: 'header-nav',
    template: `
      <!--<h1>
          <img src="/images/logo.png" alt="" />
      </h1>
      <div class="mobile-nav" style="display:none">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".main-nav">
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
          </button>
      </div>
      <div class="main-nav">
          <ul class="nav backtest_research_toggle">
              <li class="item active" data-tab="research">
                  <a href="javascript:void(0)">Research</a>
              </li>
              <li id="nav-backtest" class="item" data-tab="backtest">
                  <a href="javascript:void(0)">Strategy</a>
              </li>
              <li class="item" data-tab="portfolio">
                  <a href="javascript:void(0)">Portfolio</a>
              </li>
              <li class="pull-right">
                  <button class="btn btn-secondary btn-show-contactus" style="margin:9px 10px 0 0;padding:3px 8px 4px 8px;" onclick="RM.showContactUs()">
                      <span class="glyphicon glyphicon-envelope"></span>
                  </button>
              </li>
              <li class="logged-in username">
                  <a href="javascript:RM.Account.init()"><span class="glyphicon glyphicon-user"></span></a>
              </li>
              <li class="chart_dates">
                  <div class="pull-left">
                      <div class="pull-left chart_btns hide" data-toggle="buttons-checkbox">
                          <button class="btn btn-primary chart_allow_mult"><i class="icon-random icon-white"></i></button>
                      </div>
                      <div class="pull-left">
                          <button class="btn_chart_ctrl btn btn-primary" onclick="RM.ui.showChartControl()"><i class="icon-wrench icon-white"></i></button>
                      </div>
                      <div class="pull-left">
                          <button class="btn_chart_clear btn btn-primary" onclick="RM.Charter.clear(false)"><i class="icon-ban-circle icon-white"></i></button>
                      </div>
                  </div>
                  <input id="chart_min_date" type="text" class="chart_date" />
                  <input id="chart_max_date" type="text" class="chart_date" />
              </li>
          </ul>
      </div>
      <div class="clearfix"></div>
      <div class="slide_out clearfix"></div>-->


      <nav class="navbar navbar-default">
          <div class="container-fluid">
              <!-- Brand and toggle get grouped for better mobile display -->
              <div class="navbar-header">
                  <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#headerNavCollapse"
                  aria-expanded="false">
                      <span class="sr-only">Toggle navigation</span>
                      <span class="icon-bar"></span>
                      <span class="icon-bar"></span>
                      <span class="icon-bar"></span>
                  </button>
                  <a class="navbar-brand" href="#">
                      <img src="/images/logo.png" alt="" />
                  </a>
              </div>

              <!-- Collect the nav links, forms, and other content for toggling -->
              <div class="collapse navbar-collapse" id="headerNavCollapse">
                  <ul class="nav navbar-nav navbar-right user-nav">
                      <li>
                          <a href="#" (click)="navigateTo()"><span class="glyphicon glyphicon-user" aria-hidden="true"></span></a>
                      </li>
                      <li>
                          <button class="btn btn-secondary btn-sm"><span class="glyphicon glyphicon-envelope" aria-hidden="true"></span></button>
                      </li>
                  </ul>
                  <ul class="nav navbar-nav navbar-right">
                      <li *ngFor="#item of items" [class.active]="routerService.isRouteActive(item.route)">
                          <a href="javascript:void(0)" (click)="navigateTo(item)">{{item.name}}</a>
                      </li>
                  </ul>
              </div>
              <!-- /.navbar-collapse -->
          </div>
          <!-- /.container-fluid -->
      </nav>
    `,
    directives: []
})
export class HeaderNavComponent extends BaseComponent {
    routerService: RouterService;
    userService: UserService;
    items: NavItem[];
    
    constructor(routerService: RouterService, appService: AppService, userService:UserService) {
        super(appService);
        this.userService = userService;
        this.routerService = routerService;

        this.items = [
            { name: "Dashboard", route: Route.Dashboard },
            { name: "Research", route: Route.Research },
            { name: "Backtest", route: Route.Backtest },
            { name: "Portfolio", route: Route.Portfolio }
        ];
    }
    
    logout() {
        this.userService.logout().then(() => this.logoutCompete());
    }
    
    logoutCompete() {
        if(!this.userService.user) {
            window.location.href = '/';
        }
    }
    
    navigateTo(navItem: NavItem) {
        this.appService.notify(AppEvent.Navigate, navItem.route);
    }
}


class NavItem {
    name: string;
    route: string[];
}