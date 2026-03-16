export interface MusicRecord {
  collection: 'music';
  userId: number;
  musicId: number;
  level: number; // difficulty level
  playCount: number;
  scoreMax: number;
  res9Score6Max?: number;
  res10Score6Max?: number;
  res11Score6Max?: number;
  res12Score6Max?: number;
  isFullCombo: boolean;
  isAllJustice: boolean;
  isFullBell: boolean;
  clearStatus: number;
  grade: number;
}
