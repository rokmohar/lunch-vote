import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User, UserDraft } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore) {}

  isAdmin(): Observable<boolean> {
    return this.getMyUser().pipe(map((user) => !!user && user.role === 'admin'));
  }

  getMyUser(): Observable<User | undefined> {
    return this.afAuth.authState.pipe(switchMap((user) => {
      if (user) {
        return this.db
          .doc<Omit<User, 'id'>>(`users/${user.uid}`)
          .valueChanges()
          .pipe(map((myUser) => myUser ? { ...myUser, id: user.uid } : undefined));
      }
      return of(undefined);
    }));
  }

  getUsers(): Observable<User[]> {
    return this.afAuth.authState.pipe(switchMap((user) => {
      if (user) {
        return this.db
          .collection<User>('users', ref => ref.orderBy('name'))
          .valueChanges({ idField: 'id' });
      }
      return of([]);
    }));
  }

  async createUser(userId: string, data: UserDraft): Promise<void> {
    return this.db.collection<User>('users').doc<UserDraft>(userId).set(data);
  }
}
