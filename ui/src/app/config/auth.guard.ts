import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService, RouterService } from 'backlive/service';
import { User } from 'backlive/service/model';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private userService: UserService) {}
    
    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> | boolean {
        RouterService.activeRoute = route;

        return Observable.create(observer => {
            if (this.userService.user) {
                observer.next(true);
                observer.complete();
            }
            else {
                this.userService.userPromise.then((user: User) => {
                    if (user) {
                        observer.next(true);
                    }
                    else {
                        observer.next(false);
                    }

                    observer.complete();
                });
            }
        });
    }
}