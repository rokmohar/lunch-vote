import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RestaurantsComponent } from './restaurants.component';
import { RestaurantsRoutingModule } from './restaurants-routing.module';
import { MatTableModule } from '@angular/material/table';
import { ManageRestaurantComponent } from './manage-restaurant/manage-restaurant.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OrderModule } from 'ngx-order-pipe';
import { ManageMenuComponent } from './manage-menu/manage-menu.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    RestaurantsComponent,
    ManageRestaurantComponent,
    ManageMenuComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RestaurantsRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule,
    OrderModule,
    MatSelectModule,
  ],
  entryComponents: [ManageRestaurantComponent, ManageMenuComponent],
})
export class RestaurantsModule {}
