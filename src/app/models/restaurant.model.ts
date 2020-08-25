import { Menu } from './menu.model';

export interface Restaurant {
  id: string;
  name: string;
  allowFoodChoice: boolean;
}

export type RestaurantDraft = Omit<Restaurant, 'id'>;

export interface RestaurantWithMenus extends Restaurant {
  menus: Menu[];
}
