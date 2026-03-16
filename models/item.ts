export interface Item {
  collection: 'item';
  userId: number;
  itemType: number;
  itemId: number;
  itemNum: number;
  isValid: boolean;
  stock?: number;
}

export interface Character {
  collection: 'character';
  userId: number;
  characterId: number;
  level: number;
  exp: number;
  playCount: number;
  exValue: number;
  isNewMark: boolean;
  isEnlightenance: boolean;
}
