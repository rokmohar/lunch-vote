import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VotesByRestaurant } from '../../models/vote.model';

interface VotesByFood {
  foodChoice: string;
  count: number;
}

interface VotesByTimeSlot {
  timeSlot: string;
  count: number;
}

@Component({
  selector: 'app-votes-summary',
  templateUrl: './votes-summary.component.html',
  styleUrls: ['./votes-summary.component.scss']
})
export class VotesSummaryComponent {
  votesByFoods: VotesByFood[];
  votesByTimeSlots: VotesByTimeSlot[];

  constructor(@Inject(MAT_DIALOG_DATA) private data: { votesByRestaurant: VotesByRestaurant }) {
    const timeSlotCount = data.votesByRestaurant.votes
      .reduce<{ [key: string]: number }>((summary, { timeSlot }) => {
        if (summary[timeSlot] === undefined) {
          summary[timeSlot] = 1;
        } else {
          summary[timeSlot]++;
        }

        return summary;
      }, {});

    this.votesByTimeSlots = Object
      .keys(timeSlotCount)
      .map((timeSlot) => ({ timeSlot, count: timeSlotCount[timeSlot] }));

    if (data.votesByRestaurant.restaurant.allowFoodChoice) {
      const foodChoiceCount = data.votesByRestaurant.votes
        .reduce<{ [key: string]: number }>((summary, vote) => {
          const foodChoice = this.normalizeText(vote.foodChoice);

          if (foodChoice) {
            if (summary[foodChoice] === undefined) {
              summary[foodChoice] = 1;
            } else {
              summary[foodChoice]++;
            }
          }

          return summary;
        }, {});

      this.votesByFoods = Object
        .keys(foodChoiceCount)
        .map((foodChoice) => ({ foodChoice, count: foodChoiceCount[foodChoice] }));
    } else {
      this.votesByFoods = [];
    }
  }

  private normalizeText(value: string): string {
    return value.substring(0, 1).toLocaleUpperCase() + value.substring(1).toLocaleLowerCase();
  }
}
