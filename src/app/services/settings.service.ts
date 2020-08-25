import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneralSettings } from '../models/settings.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  readonly isLockedToday$: Observable<boolean>;

  constructor(private db: AngularFirestore) {
    this.isLockedToday$ = this.getGeneralSettings().pipe(map(({ lockedDate }) => moment().isSame(lockedDate, 'day')));
  }

  getGeneralSettings(): Observable<GeneralSettings> {
    return this.db.doc<GeneralSettings>('settings/general').valueChanges();
  }

  async setLockedDate(lockedDate: string): Promise<void> {
    return this.db
      .doc<GeneralSettings>('settings/general')
      .update({ lockedDate });
  }
}
