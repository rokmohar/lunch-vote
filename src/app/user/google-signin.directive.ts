import { Directive, HostListener } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { UserService } from '../services/user.service';
import { Dictionary } from '../models/dictionary.model';

@Directive({
  selector: '[appGoogleSignin]'
})
export class GoogleSigninDirective {
  constructor(private afAuth: AngularFireAuth, private userService: UserService) {}

  @HostListener('click')
  async onclick(): Promise<void> {
    const userCredential = await this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    const { additionalUserInfo } = userCredential;

    if (additionalUserInfo.isNewUser && additionalUserInfo.profile) {
      const profile: Dictionary = additionalUserInfo.profile;

      await this.userService.createUser(userCredential.user.uid, {
        email: profile.email,
        name: profile.name,
        role: 'user',
      });
    }
  }
}
