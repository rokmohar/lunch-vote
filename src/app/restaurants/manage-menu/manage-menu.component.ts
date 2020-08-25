import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Menu, MenuDraft, MenuType } from '../../models/menu.model';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { VoterService } from '../../services/voter.service';
import { SnackService } from '../../services/snack.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ApiService } from '../../services/api.service';
import { Restaurant } from '../../models/restaurant.model';

interface SelectOption<T> {
  label: string;
  value: T;
}

@UntilDestroy()
@Component({
  selector: 'app-manage-menu',
  templateUrl: './manage-menu.component.html',
  styleUrls: ['./manage-menu.component.scss']
})
export class ManageMenuComponent implements OnInit {
  readonly menuForm = new FormGroup({
    label: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    content: new FormControl('', Validators.required),
    detectedText: new FormControl({ value: '', disabled: true }),
    priority: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  readonly menuTypes: SelectOption<MenuType>[] = [
    { label: 'HTML', value: 'html' },
    { label: 'External Image', value: 'external_image' },
  ];

  readonly menuId$: BehaviorSubject<string | undefined>;
  readonly restaurantId$: BehaviorSubject<string>;

  readonly menu$: Observable<Menu | undefined>;
  readonly restaurant$: Observable<Restaurant | undefined>;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { restaurantId: string, menuId?: string },
    private dialogRef: MatDialogRef<ManageMenuComponent>,
    private voterService: VoterService,
    private snackService: SnackService,
    private apiService: ApiService,
  ) {
    this.menuId$ = new BehaviorSubject<string | undefined>(data.menuId);
    this.restaurantId$ = new BehaviorSubject<string>(data.restaurantId);

    this.menu$ = combineLatest([this.restaurantId$, this.menuId$]).pipe(switchMap(([restaurantId, menuId]) => {
      if (!menuId) {
        return of(undefined);
      }
      return this.voterService.getMenuById(restaurantId, menuId);
    }));
    this.restaurant$ = this.restaurantId$.pipe(switchMap((restaurantId) => this.voterService.getRestaurantById(restaurantId)));
  }

  ngOnInit(): void {
    this.menu$.pipe(untilDestroyed(this)).subscribe({
      next: (menu) => {
        this.menuForm.reset({
          label: menu && menu.label || '',
          type: menu && menu.type || '',
          content: menu && menu.content || '',
          detectedText: menu && menu.detectedText || '',
          priority: menu && menu.priority || 0,
        });
      },
    });

    this.menuId$.pipe(untilDestroyed(this)).subscribe({
      next: (menuId) => {
        if (menuId) {
          this.menuForm.controls.type.disable();
        } else {
          this.menuForm.controls.type.enable();
        }
      },
    })
  }

  async submitMenu(): Promise<void> {
    const menuId = this.menuId$.value;
    const restaurantId = this.restaurantId$.value;

    if (!this.menuForm.valid) {
      console.warn(this.menuForm);
      return;
    }

    const menuDraft: MenuDraft = {
      label: this.menuForm.controls.label.value,
      type: this.menuForm.controls.type.value,
      content: this.menuForm.controls.content.value,
      detectedText: this.menuForm.controls.detectedText.value,
      priority: this.menuForm.controls.priority.value,
    };

    // Clear detected text when Image URL is changed
    if (this.menuForm.controls.content.dirty) {
      menuDraft.detectedText = '';
    }

    if (menuId) {
      await this.voterService.updateMenu(restaurantId, menuId, menuDraft);
      this.snackService.showMessage('Menu updated successfully.');
    } else {
      await this.voterService.createMenu(restaurantId, menuDraft);
      this.snackService.showMessage('Menu created successfully.');
    }

    this.dialogRef.close();
  }

  async deleteMenu(menuId: string): Promise<void> {
    if (!confirm('Are you sure you want to delete Menu?')) {
      return;
    }

    await this.voterService.deleteMenu(this.restaurantId$.value, menuId);
    this.dialogRef.close();
  }

  async textDetection(menu: Menu): Promise<void> {
    if (menu.type !== 'external_image') {
      this.snackService.showMessage('Text Detection is only allowed for images.');
      return;
    }

    if (menu.detectedText) {
      this.snackService.showMessage('Text is already detected for this image.');
      return;
    }

    const text = await this.apiService.getTextFromImage(menu.content).toPromise();

    if (!text) {
      this.snackService.showMessage('Text was not detected on this image.');
      return;
    }

    this.menuForm.controls.detectedText.reset(text);
    await this.voterService.updateMenuDetectedText(this.restaurantId$.value, menu.id, text);
  }

  publishFoodMenu(restaurant: Restaurant, menu: Menu): void {
    if (!menu.detectedText) {
      this.snackService.showMessage('Food Menu does not have a detected text.');
      return;
    }

    if (!confirm('Publish Food Menu to Slack?')) {
      return;
    }

    let text = `*[${restaurant.name} - ${menu.label}]*\n` + '```' + menu.detectedText + '```\n';

    if (menu.type === 'external_image') {
      text += `Source: ${menu.content}`;
    }

    this.apiService.sendSlackMessage(text).subscribe({
      complete: () => this.snackService.showMessage('Food Menu is published.'),
      error: (error) => this.snackService.processError(error),
    });
  }
}
