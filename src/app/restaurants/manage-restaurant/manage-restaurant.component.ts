import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, concat, merge, Observable, of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VoterService } from '../../services/voter.service';
import { Restaurant, RestaurantDraft } from '../../models/restaurant.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SnackService } from '../../services/snack.service';
import { Menu } from '../../models/menu.model';
import { MatDialog } from '@angular/material/dialog';
import { ManageMenuComponent } from '../manage-menu/manage-menu.component';
import { ApiService } from '../../services/api.service';

@UntilDestroy()
@Component({
  selector: 'app-manage-restaurant',
  templateUrl: './manage-restaurant.component.html',
  styleUrls: ['./manage-restaurant.component.scss']
})
export class ManageRestaurantComponent implements OnInit {
  readonly displayedColumns: string[] = ['label', 'type', 'priority'];

  readonly restaurant$: Observable<Restaurant | undefined>;
  readonly restaurantMenus$: Observable<Menu[]>;

  readonly reset$ = new Subject<RestaurantDraft>();
  readonly restaurantId$ = new BehaviorSubject<string | undefined>(undefined);

  readonly restaurantForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    foodChoice: new FormControl(false),
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private voterService: VoterService,
    private snackService: SnackService,
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.restaurantMenus$ = this.restaurantId$.pipe(switchMap((restaurantId) => {
      if (!restaurantId) {
        return of([]);
      }
      return this.voterService.getMenusForRestaurant(restaurantId);
    }));
    this.restaurant$ = this.restaurantId$
      .pipe(
        switchMap((restaurantId) => {
          if (!restaurantId) {
            return of(undefined);
          }
          return this.voterService.getRestaurantById(restaurantId);
        })
      );
  }

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        untilDestroyed(this),
        map(({ restaurantId }) => restaurantId)
      )
      .subscribe({
        next: (restaurantId) => this.restaurantId$.next(restaurantId),
      });

    merge(this.reset$, this.restaurant$.pipe(filter(() => !this.restaurantForm.dirty)))
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (restaurant) => {
          this.restaurantForm.reset({
            name: restaurant && restaurant.name || '',
            foodChoice: restaurant && restaurant.allowFoodChoice || false,
          });
        },
      });
  }

  async submitRestaurant(): Promise<void> {
    if (!this.restaurantForm.valid) {
      console.warn(this.restaurantForm);
      return;
    }

    const restaurantDraft: RestaurantDraft = {
      name: this.restaurantForm.controls.name.value,
      allowFoodChoice: this.restaurantForm.controls.foodChoice.value,
    };
    const restaurantId = this.restaurantId$.value;

    if (restaurantId) {
      await this.voterService.updateRestaurant(restaurantId, restaurantDraft);
      this.snackService.showMessage('Restaurant updated successfully.');
      this.reset$.next(restaurantDraft);
    } else {
      const docRef = await this.voterService.createRestaurant(restaurantDraft);
      this.snackService.showMessage('Restaurant created successfully.');
      await this.router.navigate(['/restaurants/manage', docRef.id]);
    }
  }

  createMenu(restaurantId: string): void {
    this.dialog.open(ManageMenuComponent, {
      data: { restaurantId },
      maxWidth: 600,
      width: '100%',
    });
  }

  updateMenu(restaurantId: string, menuId: string): void {
    this.dialog.open(ManageMenuComponent, {
      data: { restaurantId, menuId },
      maxWidth: 600,
      width: '100%',
    });
  }

  publishAllMenus(restaurant: Restaurant, menus: Menu[]): void {
    const filteredMenus = menus.filter((menu) => !!menu.detectedText);

    if (filteredMenus.length === 0) {
      this.snackService.showMessage('Restaurant does not have Food Menus with a detected text.');
      return;
    }

    if (!confirm('Publish all Food Menus to Slack?')) {
      return;
    }

    const publishMenus$ = concat(...filteredMenus.map((menu) => {
      let text = `*[${restaurant.name} - ${menu.label}]*\n` + '```' + menu.detectedText + '```\n';

      if (menu.type === 'external_image') {
        text += `Source: ${menu.content}`;
      }

      return this.apiService.sendSlackMessage(text);
    }));

    publishMenus$.subscribe({
      complete: () => this.snackService.showMessage('Food Menus are published.'),
      error: (error) => this.snackService.processError(error),
    });
  }
}
