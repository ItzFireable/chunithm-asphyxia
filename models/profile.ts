export interface Profile {
  collection: 'profile';
  userId: number;
  userName: string;
  level: number;
  exp: number;
  playerRating: number;
  highestRating: number;
  reincarnationNum: number;
  lastLoginDate: string;
  lastPlayDate: string;
  lastGameId: string;
  lastRomVersion: string;
  lastDataVersion: string;
  trophyId: number;
  nameplateId: number;
  characterId: number;
  medal: number;
  playCount: number;
}
