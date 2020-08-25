import { User } from './user.model';
import { Restaurant } from './restaurant.model';

export interface Vote {
  id: string;
  dayOfMonth: string;
  userId: string;
  restaurantId: string;
  timeSlot: string;
  foodChoice: string;
  createdAt: string;
}

export type CreateVoteDraft = Omit<Vote, 'id'>;

export interface VoteDraft {
  restaurantId: string;
  timeSlot: string;
  foodChoice: string;
}

export type VoteWithUser = Vote & { user: User };

export interface VotesByRestaurant {
  restaurant: Restaurant;
  votes: VoteWithUser[];
}
