export type MenuType = 'html' | 'external_image';

export interface Menu {
  id: string;
  label: string;
  type: MenuType;
  content: string;
  priority: number;
  detectedText: string;
  httpParseUrl?: string;
  httpParseSelector?: string;
}

export type MenuDraft = Omit<Menu, 'id'>;
