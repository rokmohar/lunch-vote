import { Component } from '@angular/core';
import { VoterService } from '../services/voter.service';
import { Observable } from 'rxjs';
import { RestaurantWithMenus } from '../models/restaurant.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  readonly restaurantsWithMenus$: Observable<RestaurantWithMenus[]>;

  constructor(private voterService: VoterService) {
    this.restaurantsWithMenus$ = this.voterService.getRestaurantsWithMenus();
  }
}
