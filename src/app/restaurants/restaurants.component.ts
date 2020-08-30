import { Component } from '@angular/core';
import { VoterService } from '../services/voter.service';
import { Observable } from 'rxjs';
import { Restaurant } from '../models/restaurant.model';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent {
  readonly displayedColumns: string[] = ['name', 'foodChoice'];
  readonly restaurants$: Observable<Restaurant[]>;

  constructor(private voterService: VoterService) {
    this.restaurants$ = this.voterService.getRestaurants();
  }
}
