import { Component } from '@angular/core';
import { VoterService } from '../../services/voter.service';
import { combineLatest, Observable } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Vote, VotesByRestaurant, VoteWithUser } from '../../models/vote.model';
import { Restaurant } from '../../models/restaurant.model';
import { SnackService } from '../../services/snack.service';
import { ApiService } from '../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { VotesSummaryComponent } from '../votes-summary/votes-summary.component';
import { SettingsService } from '../../services/settings.service';
import * as moment from 'moment';

@Component({
  selector: 'app-votes-list',
  templateUrl: './votes-list.component.html',
  styleUrls: ['./votes-list.component.scss']
})
export class VotesListComponent {
  readonly users$: Observable<User[]>;
  readonly votes$: Observable<Vote[]>;
  readonly isAdmin$: Observable<boolean>;
  readonly restaurants$: Observable<Restaurant[]>;
  readonly isLockedToday$: Observable<boolean>;
  readonly votesWithUsers$: Observable<VoteWithUser[]>;
  readonly votesByRestaurants$: Observable<VotesByRestaurant[]>;

  constructor(
    private apiService: ApiService,
    private voterService: VoterService,
    private userService: UserService,
    private snackService: SnackService,
    private settingsService: SettingsService,
    private dialog: MatDialog,
  ) {
    this.users$ = this.userService.getUsers();
    this.votes$ = this.voterService.getVotesForToday();
    this.isAdmin$ = this.userService.isAdmin();
    this.restaurants$ = this.voterService.getRestaurants();
    this.isLockedToday$ = this.settingsService.isLockedToday$;
    this.votesWithUsers$ = combineLatest([this.users$, this.votes$]).pipe(
      map(([users, votes]) => votes.map((vote) => ({ ...vote, user: users.find((user) => user.id === vote.userId ) }))),
      map((votes) => votes.filter((vote) => !!vote.user)),
    );
    this.votesByRestaurants$ = combineLatest([this.votesWithUsers$, this.restaurants$]).pipe(
      map(([votes, restaurants]) =>
        restaurants.map((restaurant) => ({
          restaurant,
          votes: votes.filter((vote) => vote.restaurantId === restaurant.id),
        })),
      ),
    );
  }

  showSummary(votesByRestaurant: VotesByRestaurant): void {
    this.dialog.open(VotesSummaryComponent, {
      data: { votesByRestaurant },
      minWidth: 400,
    });
  }

  async setLockedToday(locked: boolean): Promise<void> {
    if (locked) {
      await this.settingsService.setLockedDate(moment().format('YYYY-MM-DD'));
    } else {
      await this.settingsService.setLockedDate('');
    }
  }

  publishResults(): void {
    if (!confirm('Publish Results to Slack?')) {
      return;
    }

    this.votesByRestaurants$
      .pipe(
        take(1),
        map((votesByRestaurants) => {
          let text = '*[ebiLunch] Vote Results*\n```';

          votesByRestaurants.forEach((votesByRestaurant) => {
            text += `» ${votesByRestaurant.restaurant.name}: ${votesByRestaurant.votes.length} votes\n`;

            votesByRestaurant.votes.forEach((vote) => {
              text += `    ${vote.user.name} @ ${vote.timeSlot}`;

              if (votesByRestaurant.restaurant.allowFoodChoice) {
                text += ` // Food Choice: ${vote.foodChoice}`;
              }

              text += '\n';
            });

            text += '\n';
          });

          return text.replace(/\n+$/, '\n') + '```';
        }),
        mergeMap((text) => this.apiService.sendSlackMessage(text))
      )
      .subscribe({
        complete: () => this.snackService.showMessage('Results are published.'),
        error: (error) => this.snackService.processError(error),
      });
  }
}
