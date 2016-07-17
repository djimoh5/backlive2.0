import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute} from '@angular/router';
import {UserService, RouterService} from 'backlive/service';
import {User} from 'backlive/service/model';

import {Observable} from 'rxjs/Observable';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private userService: UserService) {}
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        RouterService.activeRoute = route;
        
        if (this.userService.user) {
            return true;
        }

        return Observable.create(observer => {
            this.userService.getUser().then((user: User) => {
                if (user) {
                    observer.next(true);
                }
                else {
                    observer.next(false);
                }

                observer.complete();
            });
        });
    }
}