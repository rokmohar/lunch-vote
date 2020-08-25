import { Component } from '@angular/core';
import { VoterService } from '../services/voter.service';
import { Observable } from 'rxjs';
import { Restaurant } from '../models/restaurant.model';
import { map, mergeMap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { SnackService } from '../services/snack.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent {
  readonly displayedColumns: string[] = ['name', 'foodChoice'];
  readonly restaurants$: Observable<Restaurant[]>;

  constructor(private voterService: VoterService, private apiService: ApiService, private snackService: SnackService) {
    this.restaurants$ = this.voterService.getRestaurants();
  }

  publishFoodMenu(): void {
    if (!confirm('Publish Dobra Hiša Food Menu to Slack?')) {
      return;
    }
    this.apiService
      .getParsedFoodMenu()
      .pipe(
        map((foodMenu) => '*[DOBRA HIŠA]*\n' + '```' + foodMenu + '```\n'),
        mergeMap((text) => this.apiService.sendSlackMessage(text)),
      )
      .subscribe({
        complete: () => this.snackService.showMessage('Food Menu is published.'),
        error: (error) => this.snackService.processError(error),
      });
  }
}
