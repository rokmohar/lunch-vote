import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  readonly isAdmin$: Observable<boolean>;
  readonly isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
    map(result => result.matches),
    shareReplay()
  );

  constructor(private breakpointObserver: BreakpointObserver, public afAuth: AngularFireAuth, private userService: UserService) {
    this.isAdmin$ = this.userService.isAdmin();
  }

}
