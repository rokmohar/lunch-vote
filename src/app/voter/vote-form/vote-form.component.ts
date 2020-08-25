import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, concat, merge, Observable, of, Subject } from 'rxjs';
import { VoterService } from '../../services/voter.service';
import { filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Vote, VoteDraft } from '../../models/vote.model';
import { Restaurant } from '../../models/restaurant.model';
import { SettingsService } from '../../services/settings.service';

const DEFAULT_TIME_SLOT = '12:30';

@UntilDestroy()
@Component({
  selector: 'app-vote-form',
  templateUrl: './vote-form.component.html',
  styleUrls: ['./vote-form.component.scss']
})
export class VoteFormComponent implements OnInit {
  readonly voteForm = new FormGroup({
    restaurant: new FormControl('', Validators.required),
    timeSlot: new FormControl(DEFAULT_TIME_SLOT, Validators.required),
    foodChoice: new FormControl(''),
  });

  readonly canChangeVote$: Observable<boolean>;
  readonly allowsFoodChoice$: Observable<boolean>;

  readonly reset$ = new Subject<Vote | undefined>();
  readonly voteByMe$ = new BehaviorSubject<Vote | undefined>(undefined);
  readonly restaurants$ = new BehaviorSubject<Restaurant[]>([]);

  constructor(private voterService: VoterService, private settingsService: SettingsService) {
    this.canChangeVote$ = this.settingsService.isLockedToday$.pipe(map((isLockedToday) => !isLockedToday));
    this.allowsFoodChoice$ = of(this.voteForm.controls.restaurant).pipe(
      mergeMap((control) => concat(of(control.value), control.valueChanges)),
      switchMap((restaurantId) => this.restaurants$.pipe(map((restaurants) =>
        restaurants.find((restaurant) => restaurant.id === restaurantId),
      ))),
      map((restaurant) => !!restaurant && !!restaurant.allowFoodChoice),
    );
  }

  ngOnInit() {
    this.voterService.getVoteByMe().pipe(untilDestroyed(this)).subscribe({
      next: (vote) => this.voteByMe$.next(vote),
    });

    merge(this.voteByMe$.pipe(filter(() => !this.voteForm.dirty)), this.reset$).pipe(untilDestroyed(this)).subscribe({
      next: (vote) => {
        this.voteForm.reset({
          restaurant: vote && vote.restaurantId || '',
          timeSlot: vote && vote.timeSlot || DEFAULT_TIME_SLOT,
          foodChoice: vote && vote.foodChoice || '',
        });
      },
    });

    this.voterService.getRestaurants().pipe(untilDestroyed(this)).subscribe({
      next: (restaurants) => this.restaurants$.next(restaurants),
    });
  }

  async clearVote(vote: Vote): Promise<void> {
    await this.voterService.deleteVote(vote.id);
    this.reset$.next();
  }

  async submitVote(): Promise<void> {
    if (!this.voteForm.valid) {
      console.warn(this.voteForm);
      return;
    }

    const restaurantId = this.voteForm.controls.restaurant.value;
    const timeSlot = this.voteForm.controls.timeSlot.value;

    const voteByMe = this.voteByMe$.value;
    const restaurant = this.restaurants$.value.find(({ id }) => id === restaurantId);

    const voteDraft: VoteDraft = { restaurantId, timeSlot, foodChoice: '' };

    if (restaurant && restaurant.allowFoodChoice) {
      voteDraft.foodChoice = this.voteForm.controls.foodChoice.value;
    }

    if (voteByMe) {
      await this.voterService.updateVote(voteByMe.id, voteDraft);
    } else {
      await this.voterService.createVote(voteDraft);
    }

    this.reset$.next({ ...this.voteByMe$.value, ...voteDraft })
  }
}
