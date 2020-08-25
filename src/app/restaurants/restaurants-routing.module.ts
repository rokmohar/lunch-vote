import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RestaurantsComponent } from './restaurants.component';
import { ManageRestaurantComponent } from './manage-restaurant/manage-restaurant.component';

const routes: Routes = [
  { path: '', component: RestaurantsComponent },
  { path: 'create', component: ManageRestaurantComponent },
  { path: 'manage/:restaurantId', component: ManageRestaurantComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantsRoutingModule {}
