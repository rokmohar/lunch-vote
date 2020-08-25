import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { map, switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import { combineLatest, Observable, of } from 'rxjs';
import { CreateVoteDraft, Vote, VoteDraft } from '../models/vote.model';
import { Restaurant, RestaurantDraft, RestaurantWithMenus } from '../models/restaurant.model';
import { Menu, MenuDraft } from '../models/menu.model';

@Injectable({
  providedIn: 'root',
})
export class VoterService {
  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore) {}

  dateForToday(): string {
    return moment().format('YYYY-MM-DD');
  }

  async createVote(data: VoteDraft): Promise<DocumentReference> {
    const user = await this.afAuth.auth.currentUser;
    return this.db.collection<CreateVoteDraft>('votes').add({
      ...data,
      dayOfMonth: this.dateForToday(),
      createdAt: (new Date()).toDateString(),
      userId: user.uid,
    });
  }

  async updateVote(voteId: string, { restaurantId, timeSlot, foodChoice }: VoteDraft): Promise<void> {
    return this.db
      .doc<Vote>(`votes/${voteId}`)
      .update({ restaurantId, timeSlot, foodChoice });
  }

  async deleteVote(voteId: string): Promise<void> {
    return this.db
      .doc<Vote>(`votes/${voteId}`)
      .delete();
  }

  getVoteByMe(): Observable<Vote | undefined> {
    return combineLatest([this.getVotesForToday(), this.afAuth.authState]).pipe(
      map(([votes, user]) => votes.find((vote) => vote.userId === user.uid)),
    );
  }

  getVotesForToday(): Observable<Vote[]> {
    return this.getVotesForDate(this.dateForToday());
  }

  getVotesForDate(date: string): Observable<Vote[]> {
    return this.afAuth.authState.pipe(switchMap((user) => {
      if (user) {
        return this.db
          .collection<Vote>('votes', ref => ref.where('dayOfMonth', '==', date).orderBy('createdAt'))
          .valueChanges({ idField: 'id' });
      }
      return of([]);
    }));
  }

  getRestaurants(): Observable<Restaurant[]> {
    return this.db
      .collection<Restaurant>('restaurants', ref => ref.orderBy('name'))
      .valueChanges({ idField: 'id' });
  }

  getRestaurantsWithMenus(): Observable<RestaurantWithMenus[]> {
    return this.getRestaurants().pipe(
      switchMap((restaurants) => combineLatest(restaurants.map((restaurant) =>
        this.getMenusForRestaurant(restaurant.id).pipe(map((menus) => ({ ...restaurant, menus }))),
      ))),
    );
  }

  getRestaurantById(restaurantId: string): Observable<Restaurant | undefined> {
    return this.db
      .doc<Omit<Restaurant, 'id'>>(`restaurants/${restaurantId}`)
      .valueChanges()
      .pipe(map((restaurant) => restaurant ? { ...restaurant, id: restaurantId } : undefined));
  }

  getMenusForRestaurant(restaurantId: string): Observable<Menu[]> {
    return this.db
      .collection<Menu>(`restaurants/${restaurantId}/menus`, ref => ref.orderBy('priority'))
      .valueChanges({ idField: 'id' });
  }

  getMenuById(restaurantId: string, menuId: string): Observable<Menu | undefined> {
    return this.db
      .doc<Omit<Menu, 'id'>>(`restaurants/${restaurantId}/menus/${menuId}`)
      .valueChanges()
      .pipe(map((menu) => menu ? { ...menu, id: menuId } : undefined));
  }

  getAllMenus(): Observable<Menu[]> {
    return this.getRestaurants().pipe(
      switchMap((restaurants) => combineLatest(restaurants.map((restaurant) => this.getMenusForRestaurant(restaurant.id)))),
      map((menuGroups) => menuGroups.reduce((a, b) => [...a, ...b], [])),
    );
  }

  async createRestaurant(data: RestaurantDraft): Promise<DocumentReference> {
    return this.db
      .collection<RestaurantDraft>('restaurants')
      .add(data);
  }

  async updateRestaurant(restaurantId: string, { name, allowFoodChoice }: RestaurantDraft): Promise<void> {
    return this.db
      .doc<Restaurant>(`restaurants/${restaurantId}`)
      .update({ name, allowFoodChoice });
  }

  async createMenu(restaurantId: string, data: MenuDraft): Promise<DocumentReference> {
    return this.db
      .collection<MenuDraft>(`restaurants/${restaurantId}/menus`)
      .add(data);
  }

  async updateMenu(restaurantId: string, menuId: string, { label, type, content, priority }: MenuDraft): Promise<void> {
    return this.db
      .doc<Menu>(`restaurants/${restaurantId}/menus/${menuId}`)
      .update({ label, type, content, priority });
  }

  async deleteMenu(restaurantId: string, menuId: string): Promise<void> {
    return this.db
      .doc<Menu>(`restaurants/${restaurantId}/menus/${menuId}`)
      .delete();
  }

  async updateMenuDetectedText(restaurantId: string, menuId: string, detectedText: string): Promise<void> {
    return this.db
      .doc<Menu>(`restaurants/${restaurantId}/menus/${menuId}`)
      .update({ detectedText });
  }
}
