import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SnackService } from '../services/snack.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService, private snack: SnackService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.userService.getMyUser().pipe(map((user) => {
      const hasAdminRole = !!user && user.role === 'admin';

      if (!hasAdminRole) {
        this.snack.adminError();
      }

      return hasAdminRole;
    }));
  }
}

