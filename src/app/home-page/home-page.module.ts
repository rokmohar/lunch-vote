import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HomePageComponent } from './home-page.component';
import { HomePageRoutingModule } from './home-page-routing.module';
import { SharedPipesModule } from '../pipes/shared-pipes.module';
import { OrderModule } from 'ngx-order-pipe';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [
    HomePageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    HomePageRoutingModule,
    SharedPipesModule,
    OrderModule,
    MatTabsModule,
  ],
  entryComponents: [],
})
export class HomePageModule {}
