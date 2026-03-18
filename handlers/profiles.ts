import {Character, Item} from '../models/item';
import {MusicRecord} from '../models/music';
import {Profile} from '../models/profile';

async function getProfile(userId: number) {
  return await DB.FindOne<Profile>({userId});
}

function readWtf8(src: string): string {
  try {
    return Buffer.from(src.split('').map(c => c.charCodeAt(0))).toString('utf-8');
  } catch {
    return src;
  }
}

export const GetUserPreview = async (data: any) => {
  const userId = data.userId;
  const profile = await getProfile(userId);

  if (!profile) {
    return {
      userId,
      isLogin: false,
      lastLoginDate: '2020-01-01 00:00:00.0',
      userName: 'PLAYER',
      reincarnationNum: 0,
      level: 1,
      exp: 0,
      playerRating: 0,
      lastGameId: 'SDBT',
      lastRomVersion: '2.40.00',
      lastDataVersion: '2.40.00',
      lastPlayDate: '2020-01-01 00:00:00.0',
      trophyId: 0,
      nameplateId: 0,
      userCharacter: {
        characterId: 10,
        level: 1,
        exp: 0,
        exValue: 0,
        playCount: 1,
        isNewMark: false,
        isEnlightenance: false
      },
      playerLevel: 1,
      rating: 0,
      headphone: 0,
      chargeState: 1,
      userNameEx: 'PLAYER',
    };
  }

  return {
    userId,
    isLogin: false,
    lastLoginDate: profile.lastPlayDate ?? '2020-01-01 00:00:00.0',
    userName: profile.userName ?? 'PLAYER',
    reincarnationNum: profile.reincarnationNum ?? 0,
    level: profile.level ?? 1,
    exp: profile.exp ?? 0,
    playerRating: profile.playerRating ?? 0,
    lastGameId: profile.lastGameId ?? 'SDBT',
    lastRomVersion: profile.lastRomVersion ?? '2.40.00',
    lastDataVersion: profile.lastDataVersion ?? '2.40.00',
    lastPlayDate: profile.lastPlayDate ?? '2020-01-01 00:00:00.0',
    trophyId: profile.trophyId ?? 0,
    nameplateId: profile.nameplateId ?? 0,
    userCharacter: {
      characterId: profile.characterId ?? 10,
      level: 1,
      exp: 0,
      exValue: 0,
      playCount: 1,
      isNewMark: false,
      isEnlightenance: false
    },
    playerLevel: profile.level ?? 1,
    rating: profile.playerRating ?? 0,
    headphone: 0,
    chargeState: 1,
    userNameEx: profile.userName ?? 'PLAYER',
  };
};

export const CMGetUserPreview = GetUserPreview;

export const GetUserData = async (data: any) => {
  const profile = await getProfile(data.userId);
  return profile ? {userId: data.userId, userData: profile} :
                   {userId: data.userId, userData: {}};
};

export const GetUserDataEx = async (data: any) => {
  const profile = await getProfile(data.userId);
  if (!profile) return {userId: data.userId, userDataEx: {}};
  return {
    userId: data.userId,
    userDataEx: {
      compatibleCmRomVersion: profile.lastRomVersion ?? '2.40.00',
      medal: (profile as any).medal ?? 0,
    },
  };
};

export const CMGetUserData = GetUserData;

export const GetUserOption = async (data: any) => {
  const opt = await DB.FindOne({userId: data.userId, collection: 'gameOption'}) as any;
  return {userId: data.userId, userGameOption: opt ?? {}};
};

export const GetUserOptionEx = async (data: any) => {
  const opt = await DB.FindOne({userId: data.userId, collection: 'gameOptionEx'}) as any;
  return {userId: data.userId, userGameOptionEx: opt ?? {}};
};

export const GetUserGameOption   = GetUserOption;
export const GetUserGameOptionEx = GetUserOptionEx;

export const GetUserMusic = async (data: any) => {
  const userId   = data.userId;
  const nextIdx  = parseInt(data.nextIndex ?? '0');
  const maxCount = parseInt(data.maxCount ?? '300');

  const records = await DB.Find<MusicRecord>({userId});
  if (!records || records.length === 0)
    return {userId, length: 0, nextIndex: -1, userMusicList: []};

  const grouped: Record<number, any[]> = {};
  for (const r of records) {
    if (!grouped[r.musicId]) grouped[r.musicId] = [];
    grouped[r.musicId].push(r);
  }

  const musicIds = Object.keys(grouped).map(Number).slice(nextIdx, nextIdx + maxCount + 1);
  const musicList: any[] = [];

  for (const musicId of musicIds.slice(0, maxCount)) {
    const details = grouped[musicId].map(({userId: _u, ...rest}) => rest);
    musicList.push({length: details.length, userMusicDetailList: details});
  }

  const newNextIdx = musicIds.length > maxCount ? nextIdx + maxCount : -1;
  return {userId, length: musicList.length, nextIndex: newNextIdx, userMusicList: musicList};
};

export const GetUserMusicItem = async (data: any) => {
  const records = await DB.Find<MusicRecord>({userId: data.userId});
  return {userId: data.userId, length: records.length, userMusicItemList: records};
};

export const GetUserMap = async (data: any) => {
  const maps = await DB.Find({userId: data.userId, collection: 'mapArea'});
  return {userId: data.userId, length: maps.length, userMapList: maps};
};

export const GetUserMapArea = async (data: any) => {
  const userId      = data.userId;
  const requested   = (data.mapAreaIdList ?? []).map((x: any) => parseInt(x.mapAreaId));
  let maps          = await DB.Find({userId, collection: 'mapArea'});

  if (requested.length > 0)
    maps = maps.filter((m: any) => requested.includes(m.mapAreaId));

  return {userId, length: maps.length, userMapAreaList: maps};
};

export const GetUserMapAreaCondition = async (data: any) =>
    ({userId: data.userId, length: 0, userMapAreaConditionList: []});

export const GetUserDuel = async (data: any) => {
  const duels = await DB.Find({userId: data.userId, collection: 'duel'});
  return {userId: data.userId, length: duels.length, userDuelList: duels};
};

export const GetUserDuelList = GetUserDuel;

export const GetUserTeam = async (data: any) =>
    ({userId: data.userId, teamId: 0});

export const GetTeamCourseSetting = async (data: any) => ({
  userId: data.userId,
  length: 0,
  nextIndex: -1,
  teamCourseSettingList: [],
});

export const GetTeamCourseRule = async (data: any) => ({
  userId: data.userId,
  length: 0,
  nextIndex: -1,
  teamCourseRuleList: [],
});

export const GetUserRecentPlayer = async (data: any) =>
    ({userId: data.userId, length: 0, userRecentPlayerList: []});

export const GetUserRegion = async (data: any) =>
    ({userId: data.userId, length: 0, userRegionList: []});

export const GetUserRivalData = async (data: any) =>
    ({userId: data.userId, userRivalData: {}});

export const GetUserRivalMusic = async (data: any) => ({
  userId: data.userId,
  rivalId: data.rivalId,
  length: 0,
  nextIndex: -1,
  userRivalMusicList: [],
});

export const GetUserSymbolChatSetting = async (data: any) =>
    ({userId: data.userId, symbolCharInfoList: []});

export const GetUserNetBattleData = async (data: any) => ({
  userId: data.userId,
  userNetBattleData: {recentNBSelectMusicList: []},
});

export const GetUserNetBattleRankingInfo = async (data: any) => {
  const nb = await DB.FindOne({userId: data.userId, collection: 'netBattle'}) as any;
  return {userId: data.userId, userNetBattleData: nb ?? {}};
};

export const GetUserCMission = async (data: any) => {
  const userId     = data.userId;
  const missionId  = data.missionId;
  const mission    = await DB.FindOne({userId, collection: 'cmission', missionId}) as any;
  const progresses = await DB.Find({userId, collection: 'cmissionProgress', missionId});

  return {
    userId,
    missionId,
    point: mission?.point ?? 0,
    userCMissionProgressList: progresses.map((p: any) => ({
      order: p.order,
      stage: p.stage,
      progress: p.progress,
    })),
  };
};

export const GetUserCMissionProgress = async (data: any) =>
    ({userId: data.userId, length: 0, userCMissionProgressList: []});

export const GetUserCMissionList = async (data: any) =>
    ({userId: data.userId, length: 0, userCMissionList: []});

export const GetUserUC = async (data: any) => {
  const challenges = await DB.Find({userId: data.userId, collection: 'unlockChallenge'});
  return {userId: data.userId, userUnlockChallengeList: challenges};
};

export const GetUserUCProgress = async (data: any) =>
    ({userId: data.userId, length: 0, userUCProgressList: []});

export const GetUserUnlockItem = async (data: any) =>
    ({userId: data.userId, length: 0, userUnlockItemList: []});

export const GetUserLV = async (data: any) => {
  const rows = await DB.Find({userId: data.userId, collection: 'linkedVerse'});
  return {userId: data.userId, userLinkedVerseList: rows};
};

export const GetUserRecMusic = async (data: any) =>
    ({length: 0, userRecMusicList: []});

export const GetUserRecRating = async (data: any) =>
    ({length: 0, userRecRatingList: []});

export const GetUserCharacterSelect = async (data: any) =>
    ({userId: data.userId, length: 0, nextIndex: -1, userCharacterList: []});

export const GetUserItem = async (data: any) => {
  const userId   = data.userId;
  const nextIdx  = parseInt(data.nextIndex ?? '0');
  const maxCount = parseInt(data.maxCount ?? '300');
  const kind     = Math.floor(nextIdx / 10000000000);
  const offset   = nextIdx % 10000000000;

  const items    = await DB.Find<Item>({userId, itemKind: kind});
  const page     = items.slice(offset, offset + maxCount);
  const newNextIdx = items.length > offset + maxCount ?
      kind * 10000000000 + offset + maxCount :
      -1;

  return {userId, nextIndex: newNextIdx, itemKind: kind, length: page.length, userItemList: page};
};

export const GetUserItemEx = GetUserItem;
export const CMGetUserItem = GetUserItem;

export const GetUserCharacter = async (data: any) => {
  const userId   = data.userId;
  const nextIdx  = parseInt(data.nextIndex ?? '0');
  const maxCount = parseInt(data.maxCount ?? '300');
  const chars    = await DB.Find<Character>({userId});
  const page     = chars.slice(nextIdx, nextIdx + maxCount);
  const newNextIdx = chars.length > nextIdx + maxCount ? nextIdx + maxCount : -1;
  return {userId, length: page.length, nextIndex: newNextIdx, userCharacterList: page};
};

export const CMGetUserCharacter = GetUserCharacter;

export const GetUserFavoriteItem = async (data: any) => {
  const userId   = data.userId;
  const nextIdx  = parseInt(data.nextIndex ?? '0');
  const maxCount = parseInt(data.maxCount ?? '300');
  const kind     = parseInt(data.kind ?? '0');
  const favs     = await DB.Find({userId, collection: 'favorite', kind});
  const page     = favs.slice(nextIdx, nextIdx + maxCount);
  const newNextIdx = favs.length > nextIdx + maxCount ? nextIdx + maxCount : -1;
  return {
    userId,
    length: page.length,
    kind,
    nextIndex: newNextIdx,
    userFavoriteItemList: page.map((f: any) => ({id: f.itemId}))
  };
};

export const GetUserFavoriteMusic = async (data: any) =>
    ({userId: data.userId, length: 0, userFavoriteMusicList: []});

export const GetUserRecentRating = async (data: any) => {
  const r = await DB.FindOne({userId: data.userId, collection: 'recentRating'}) as any;
  const list = r?.recentRating ?? [];
  return {userId: data.userId, length: list.length, userRecentRatingList: list};
};

export const GetUserBestRating   = async (data: any) =>
    ({userId: data.userId, length: 0, userBestRatingList: []});
export const GetUserRatinglog    = async (data: any) =>
    ({userId: data.userId, length: 0, userRatinglogList: []});

export const GetUserCourse = async (data: any) => {
  const userId   = data.userId;
  const nextIdx  = parseInt(data.nextIndex ?? '0');
  const maxCount = parseInt(data.maxCount ?? '300');
  const courses  = await DB.Find({userId, collection: 'course'});
  const page     = courses.slice(nextIdx, nextIdx + maxCount);
  const newNextIdx = courses.length > nextIdx + maxCount ? nextIdx + maxCount : -1;
  return {userId, length: page.length, nextIndex: newNextIdx, userCourseList: page};
};

export const GetUserPlaylog = async (data: any) => {
  const logs = await DB.Find({userId: data.userId, collection: 'playlog'});
  return {userId: data.userId, length: logs.length, nextIndex: -1, userPlaylogList: logs};
};

export const GetUserActivity = async (data: any) => {
  const activities = await DB.Find({userId: data.userId, collection: 'activity', kind: data.kind});
  return {
    userId: data.userId,
    length: activities.length,
    kind: parseInt(data.kind),
    userActivityList: activities
  };
};

export const GetUserCharge = async (data: any) => {
  const charges = await DB.Find({userId: data.userId, collection: 'charge'});
  return {userId: data.userId, length: charges.length, userChargeList: charges};
};

export const GetUserGacha      = async (data: any) =>
    ({userId: data.userId, length: 0, userGachaList: []});
export const GetUserMacDetail  = async (data: any) =>
    ({userId: data.userId, userMacDetailList: []});
export const GetUserCtoCPlay   = async (data: any) =>
    ({userId: data.userId, orderBy: 0, orderCount: 0, userCtoCPlayList: []});

export const GetUserLoginBonus = async (data: any) => {
  const bonuses = await DB.Find({userId: data.userId, collection: 'loginBonus'});
  return {userId: data.userId, length: bonuses.length, userLoginBonusList: bonuses};
};

export const GetUserLoginBonusInfo = async (data: any) =>
    ({userId: data.userId, length: 0, userLoginBonusInfoList: []});

export const GetUserPrintedCard = async (data: any) =>
    ({userId: data.userId, length: 0, userPrintedCardList: []});

export const GetUserCardPrintError = async (data: any) =>
    ({userId: data.userId, length: 0, userCardPrintErrorList: []});

export const UpsertUserAll = async (data: any) => {
  const userId = data.userId;
  const upsert = data.upsertUserAll ?? {};

  if ((BigInt(userId) & BigInt('0x1000000000001')) === BigInt('0x1000000000001'))
    return {returnCode: '1'};

  const updates: Partial<Profile> = {userId};

  if (upsert.userData?.[0]) {
    try {
      upsert.userData[0].userName = readWtf8(upsert.userData[0].userName);
    } catch {}
    Object.assign(updates, upsert.userData[0]);
  }
  if (upsert.userDataEx?.[0]) Object.assign(updates, upsert.userDataEx[0]);
  updates.lastPlayDate =
      new Date().toISOString().replace('T', ' ').split('.')[0] + '.0';
  await DB.Upsert<Profile>({userId}, {$set: updates});

  if (upsert.userGameOption?.[0])
    await DB.Upsert(
        {userId, collection: 'gameOption'},
        {$set: {userId, collection: 'gameOption', ...upsert.userGameOption[0]}});
  if (upsert.userGameOptionEx?.[0])
    await DB.Upsert(
        {userId, collection: 'gameOptionEx'},
        {$set: {userId, collection: 'gameOptionEx', ...upsert.userGameOptionEx[0]}});

  if (upsert.userRecentRatingList)
    await DB.Upsert(
        {userId, collection: 'recentRating'},
        {$set: {userId, collection: 'recentRating', recentRating: upsert.userRecentRatingList}});

  if (upsert.userCharacterList)
    for (const char of upsert.userCharacterList)
      await DB.Upsert<Character>(
          {userId, characterId: char.characterId}, {$set: char});

  for (const key of ['userMusicDetailList', 'userMusicItemList'])
    if (upsert[key])
      for (const music of upsert[key])
        await DB.Upsert<MusicRecord>(
            {userId, musicId: music.musicId, level: music.level}, {$set: music});

  if (upsert.userItemList)
    for (const item of upsert.userItemList)
      await DB.Upsert<Item>(
          {userId, itemType: item.itemType ?? item.itemKind, itemId: item.itemId},
          {$set: item});

  if (upsert.userMapList)
    for (const map of upsert.userMapList)
      await DB.Upsert(
          {userId, collection: 'mapArea', mapAreaId: map.mapAreaId},
          {$set: {userId, collection: 'mapArea', ...map}});

  if (upsert.userCourseList)
    for (const course of upsert.userCourseList)
      await DB.Upsert(
          {userId, collection: 'course', courseId: course.courseId},
          {$set: {userId, collection: 'course', ...course}});

  if (upsert.userDuelList)
    for (const duel of upsert.userDuelList)
      await DB.Upsert(
          {userId, collection: 'duel', duelId: duel.duelId},
          {$set: {userId, collection: 'duel', ...duel}});

  if (upsert.userActivityList)
    for (const activity of upsert.userActivityList)
      await DB.Upsert(
          {userId, collection: 'activity', kind: activity.kind, id: activity.id},
          {$set: {userId, collection: 'activity', ...activity}});

  if (upsert.userChargeList)
    for (const charge of upsert.userChargeList)
      await DB.Upsert(
          {userId, collection: 'charge', chargeId: charge.chargeId},
          {$set: {userId, collection: 'charge', ...charge}});

  if (upsert.userPlaylogList)
    for (const log of upsert.userPlaylogList) {
      for (const key of ['playedUserName1', 'playedUserName2', 'playedUserName3'])
        if (log[key]) try { log[key] = readWtf8(log[key]); } catch {}
      await DB.Insert({userId, collection: 'playlog', ...log});
    }

  if (upsert.userFavoriteItemList)
    for (const fav of upsert.userFavoriteItemList)
      await DB.Upsert(
          {userId, collection: 'favorite', itemId: fav.id ?? fav.itemId},
          {$set: {userId, collection: 'favorite', kind: fav.kind ?? 1, itemId: fav.id ?? fav.itemId}});

  if (upsert.userFavoriteMusicList)
    for (const fav of upsert.userFavoriteMusicList)
      if (fav.musicId !== '-1' && fav.musicId !== -1)
        await DB.Upsert(
            {userId, collection: 'favoriteMusic', musicId: fav.musicId},
            {$set: {userId, collection: 'favoriteMusic', musicId: fav.musicId, orderId: fav.orderId}});

  if (upsert.userMapAreaList)
    for (const ma of upsert.userMapAreaList)
      await DB.Upsert(
          {userId, collection: 'mapArea', mapAreaId: ma.mapAreaId},
          {$set: {userId, collection: 'mapArea', ...ma}});

  for (const ratingType of ['userRatingBaseList', 'userRatingBaseHotList', 'userRatingBaseNextList'])
    if (upsert[ratingType])
      await DB.Upsert(
          {userId, collection: ratingType},
          {$set: {userId, collection: ratingType, data: upsert[ratingType]}});

  if (upsert.userCMissionList)
    for (const cm of upsert.userCMissionList) {
      await DB.Upsert(
          {userId, collection: 'cmission', missionId: cm.missionId},
          {$set: {userId, collection: 'cmission', missionId: cm.missionId, point: cm.point}});
      if (cm.userCMissionProgressList)
        for (const prog of cm.userCMissionProgressList)
          await DB.Upsert(
              {userId, collection: 'cmissionProgress', missionId: cm.missionId, order: prog.order},
              {$set: {userId, collection: 'cmissionProgress', missionId: cm.missionId, ...prog}});
    }

  if (upsert.userNetBattleData) {
    const nb = Array.isArray(upsert.userNetBattleData) ?
        upsert.userNetBattleData[0] :
        upsert.userNetBattleData;
    if (nb) {
      nb.isRankUpChallengeFailed = nb.isRankUpChallengeFailed === 'false' ? false : Boolean(nb.isRankUpChallengeFailed);
      await DB.Upsert(
          {userId, collection: 'netBattle'},
          {$set: {userId, collection: 'netBattle', ...nb}});
    }
  }

  if (upsert.userLoginBonusList)
    for (const lb of upsert.userLoginBonusList)
      await DB.Upsert(
          {userId, collection: 'loginBonus', presetId: lb.presetId},
          {$set: {userId, collection: 'loginBonus', presetId: lb.presetId, isWatched: true}});

  if (upsert.userUnlockChallengeList)
    for (const uc of upsert.userUnlockChallengeList)
      await DB.Upsert(
          {userId, collection: 'unlockChallenge', unlockChallengeId: uc.unlockChallengeId},
          {$set: {userId, collection: 'unlockChallenge', ...uc}});

  if (upsert.userLinkedVerseList)
    for (const lv of upsert.userLinkedVerseList)
      await DB.Upsert(
          {userId, collection: 'linkedVerse', linkedVerseId: lv.linkedVerseId},
          {$set: {userId, collection: 'linkedVerse', ...lv}});

  return {returnCode: '1'};
};

export const UpsertUserChargelog = async (data: any) => {
  const charge = data.userCharge;
  if (charge)
    await DB.Upsert(
        {userId: data.userId, collection: 'charge', chargeId: charge.chargeId},
        {$set: {userId: data.userId, collection: 'charge', ...charge}});
  return {returnCode: '1'};
};

export const CMUpsertUserFavoriteItem = async (data: any) => {
  if (data.userFavoriteItem) {
    const fav = data.userFavoriteItem;
    await DB.Upsert(
        {userId: data.userId, collection: 'favorite', itemId: fav.itemId},
        {$set: {userId: data.userId, collection: 'favorite', ...fav}});
  }
  return {returnCode: 1};
};

export const CMUpsertUserGachaTicket    = async (data: any) => ({returnCode: 1});
export const CMUpsertUserGacha          = async (data: any) => ({returnCode: 1});
export const CMUpsertUserPrint          = async (data: any) => ({
  returnCode: 1,
  orderId: data.orderId ?? 1,
  serialId: data.serialId ?? 'ASPHYXIA0001',
  printState: 1
});
export const CMUpsertUserPrintSubData   = async (data: any) => ({returnCode: 1});
export const CMUpsertUserPrintCancel    = async (data: any) => ({returnCode: 1});
export const CMUpsertUserPrintSubtract  = async (data: any) => ({returnCode: 1});
export const CMUpsertUserPrintlog       = async (data: any) => ({returnCode: 1});
