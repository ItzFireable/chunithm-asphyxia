import { Profile } from '../models/profile';
import { MusicRecord } from '../models/music';
import { Item, Character } from '../models/item';

async function getProfile(userId: number) {
  return await DB.FindOne<Profile>({ userId });
}

// -----------------------------------------------------------------------
// Profile preview — called on title screen card scan
// -----------------------------------------------------------------------

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
        isEnlightenance: false,
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
      isEnlightenance: false,
    },
    playerLevel: profile.level ?? 1,
    rating: profile.playerRating ?? 0,
    headphone: 0,
    chargeState: 1,
    userNameEx: profile.userName ?? 'PLAYER',
  };
};

export const CMGetUserPreview = GetUserPreview;

// -----------------------------------------------------------------------
// Core profile data
// -----------------------------------------------------------------------

export const GetUserData = async (data: any) => {
  const userId = data.userId;
  const profile = await getProfile(userId);
  if (!profile) return { userId, userData: {} };
  return { userId, userData: profile };
};

export const GetUserDataEx = async (data: any) => {
  const userId = data.userId;
  const profile = await getProfile(userId);
  if (!profile) return { userId, userDataEx: {} };
  return {
    userId,
    userDataEx: {
      compatibleCmRomVersion: profile.lastRomVersion ?? '2.40.00',
      medal: profile.medal ?? 0,
    },
  };
};

// -----------------------------------------------------------------------
// UpsertUserAll — main save endpoint called at end of every session
// -----------------------------------------------------------------------

export const UpsertUserAll = async (data: any) => {
  const userId = data.userId;
  const upsert = data.upsertUserAll ?? {};

  const updates: Partial<Profile> = { userId };

  if (upsert.userData?.[0]) Object.assign(updates, upsert.userData[0]);
  if (upsert.userDataEx?.[0]) Object.assign(updates, upsert.userDataEx[0]);

  if (upsert.userCharacterList) {
    for (const char of upsert.userCharacterList) {
      await DB.Upsert<Character>({ userId, characterId: char.characterId }, { $set: char });
    }
  }

  if (upsert.userMusicItemList) {
    for (const music of upsert.userMusicItemList) {
      await DB.Upsert<MusicRecord>(
        { userId, musicId: music.musicId, level: music.level },
        { $set: music }
      );
    }
  }

  if (upsert.userItemList) {
    for (const item of upsert.userItemList) {
      await DB.Upsert<Item>(
        { userId, itemType: item.itemType, itemId: item.itemId },
        { $set: item }
      );
    }
  }

  // Save game options if provided
  if (upsert.userGameOption?.[0]) {
    await DB.Upsert({ userId, collection: 'gameOption' }, { $set: { userId, ...upsert.userGameOption[0] } });
  }
  if (upsert.userGameOptionEx?.[0]) {
    await DB.Upsert({ userId, collection: 'gameOptionEx' }, { $set: { userId, ...upsert.userGameOptionEx[0] } });
  }

  // Save activity list (stamped play history shown in profile)
  if (upsert.userActivityList) {
    for (const activity of upsert.userActivityList) {
      await DB.Upsert(
        { userId, collection: 'activity', kind: activity.kind, id: activity.id },
        { $set: { userId, collection: 'activity', ...activity } }
      );
    }
  }

  // Save favorite items
  if (upsert.userFavoriteList) {
    for (const fav of upsert.userFavoriteList) {
      await DB.Upsert(
        { userId, collection: 'favorite', itemId: fav.itemId },
        { $set: { userId, collection: 'favorite', ...fav } }
      );
    }
  }

  // Save course data
  if (upsert.userCourseList) {
    for (const course of upsert.userCourseList) {
      await DB.Upsert(
        { userId, collection: 'course', courseId: course.courseId },
        { $set: { userId, collection: 'course', ...course } }
      );
    }
  }

  // Save playlog
  if (upsert.userPlaylogList) {
    for (const log of upsert.userPlaylogList) {
      await DB.Insert({ userId, collection: 'playlog', ...log });
    }
  }

  updates.lastPlayDate = new Date().toISOString().replace('T', ' ').split('.')[0] + '.0';
  await DB.Upsert<Profile>({ userId }, { $set: updates });

  return { returnCode: 1 };
};

// -----------------------------------------------------------------------
// Simple list getters — DB-backed
// -----------------------------------------------------------------------

const emptyList = (key: string) => async (data: any) => ({
  userId: data.userId,
  length: 0,
  [key]: [],
});

export const GetUserCharacterSelect = emptyList('userCharacterList');

export const GetUserItem = async (data: any) => {
  const items = await DB.Find<Item>({ userId: data.userId });
  return { userId: data.userId, length: items.length, userItemList: items };
};

// GetUserItemEx uses the same item collection, just an extended alias
export const GetUserItemEx = async (data: any) => {
  const items = await DB.Find<Item>({ userId: data.userId });
  return { userId: data.userId, length: items.length, userItemList: items };
};

export const GetUserMusicItem = async (data: any) => {
  const records = await DB.Find<MusicRecord>({ userId: data.userId });
  return { userId: data.userId, length: records.length, userMusicItemList: records };
};

export const GetUserCharacter = async (data: any) => {
  const chars = await DB.Find<Character>({ userId: data.userId });
  return { userId: data.userId, length: chars.length, userCharacterList: chars };
};

// GetUserCharacter alias used by Card Machine (CM) flow
export const CMGetUserCharacter = GetUserCharacter;

export const GetUserFavoriteItem = async (data: any) => {
  const favs = await DB.Find({ userId: data.userId, collection: 'favorite' });
  return { userId: data.userId, length: favs.length, userFavoriteItemList: favs };
};

export const GetUserFavoriteMusic = async (data: any) => {
  const favs = await DB.Find({ userId: data.userId, collection: 'favoriteMusic' });
  return { userId: data.userId, length: favs.length, userFavoriteMusicList: favs };
};

export const GetUserGameOption = async (data: any) => {
  const opt = await DB.FindOne({ userId: data.userId, collection: 'gameOption' });
  return { userId: data.userId, userGameOption: opt ?? {} };
};

export const GetUserGameOptionEx = async (data: any) => {
  const opt = await DB.FindOne({ userId: data.userId, collection: 'gameOptionEx' });
  return { userId: data.userId, userGameOptionEx: opt ?? {} };
};

export const GetUserActivity = async (data: any) => {
  const activities = await DB.Find({ userId: data.userId, collection: 'activity' });
  return { userId: data.userId, length: activities.length, userActivityList: activities };
};

export const GetUserCourse = async (data: any) => {
  const courses = await DB.Find({ userId: data.userId, collection: 'course' });
  return { userId: data.userId, length: courses.length, userCourseList: courses };
};

export const GetUserPlaylog = async (data: any) => {
  const logs = await DB.Find({ userId: data.userId, collection: 'playlog' });
  return { userId: data.userId, length: logs.length, userPlaylogList: logs };
};

// -----------------------------------------------------------------------
// Rating lists — DB-backed where applicable, empty stubs where not needed
// -----------------------------------------------------------------------

export const GetUserRecentRating = emptyList('userRecentRatingList');
export const GetUserBestRating = emptyList('userBestRatingList');
export const GetUserRatinglog = emptyList('userRatinglogList');
export const GetUserCharge = emptyList('userChargeList');
export const GetUserMapArea = emptyList('userMapAreaList');

// -----------------------------------------------------------------------
// Login bonus — must return a valid structure or the game shows an error
// on the attract/login screen and can softlock waiting for the response.
// Returning an empty list with isRewardEnd=true skips the bonus flow safely.
// -----------------------------------------------------------------------

export const GetUserLoginBonus = async (data: any) => {
  const bonuses = await DB.Find({ userId: data.userId, collection: 'loginBonus' });
  return {
    userId: data.userId,
    length: bonuses.length,
    userLoginBonusList: bonuses,
  };
};

export const GetUserLoginBonusInfo = async (data: any) => {
  return {
    userId: data.userId,
    length: 0,
    userLoginBonusInfoList: [],
  };
};

// -----------------------------------------------------------------------
// Gacha — return empty pool; no gacha functionality on private servers
// -----------------------------------------------------------------------

export const GetUserGacha = async (data: any) => {
  return {
    userId: data.userId,
    length: 0,
    userGachaList: [],
  };
};

// -----------------------------------------------------------------------
// Map area and unlock conditions
// -----------------------------------------------------------------------

export const GetUserMapAreaCondition = async (data: any) => {
  return {
    userId: data.userId,
    length: 0,
    userMapAreaConditionList: [],
  };
};

export const GetUserUnlockItem = async (data: any) => {
  return {
    userId: data.userId,
    length: 0,
    userUnlockItemList: [],
  };
};

// -----------------------------------------------------------------------
// Duel list — used for the Chunithm Duel feature
// -----------------------------------------------------------------------

export const GetUserDuelList = async (data: any) => {
  return {
    userId: data.userId,
    length: 0,
    userDuelList: [],
  };
};

// -----------------------------------------------------------------------
// Recommend lists — used for song recommendation UI
// Empty lists are safe; the game just shows no suggestions.
// -----------------------------------------------------------------------

export const GetUserRecommendMusicList = async (data: any) => {
  return {
    userId: data.userId,
    length: 0,
    userRecommendMusicDetailList: [],
  };
};

export const GetUserRecommendRateMusicList = async (data: any) => {
  return {
    userId: data.userId,
    length: 0,
    userRecommendMusicDetailList: [],
  };
};

// -----------------------------------------------------------------------
// MAC detail — hardware identifier info, empty is safe
// -----------------------------------------------------------------------

export const GetUserMacDetail = async (data: any) => {
  return {
    userId: data.userId,
    userMacDetailList: [],
  };
};

// -----------------------------------------------------------------------
// C-to-C play — cabinet-to-cabinet local link play status
// -----------------------------------------------------------------------

export const GetUserCtoCPlay = async (data: any) => {
  return {
    userId: data.userId,
    orderBy: 0,
    orderCount: 0,
    userCtoCPlayList: [],
  };
};

// -----------------------------------------------------------------------
// Mission progress — CHUNITHM MISSION system (verse+)
// -----------------------------------------------------------------------

export const GetUserCMissionProgress = async (data: any) => {
  return {
    userId: data.userId,
    length: 0,
    userCMissionProgressList: [],
  };
};

// -----------------------------------------------------------------------
// UC (Ultimate Chain) progress
// -----------------------------------------------------------------------

export const GetUserUCProgress = async (data: any) => {
  return {
    userId: data.userId,
    length: 0,
    userUCProgressList: [],
  };
};

// -----------------------------------------------------------------------
// Card Machine (CM) upserts — used during the physical card print flow.
// These must return returnCode 1 or the CM flow will hang.
// -----------------------------------------------------------------------

export const CMUpsertUserFavoriteItem = async (data: any) => {
  // Persist if possible, otherwise just ack
  const userId = data.userId;
  if (data.userFavoriteItem) {
    await DB.Upsert(
      { userId, collection: 'favorite', itemId: data.userFavoriteItem.itemId },
      { $set: { userId, collection: 'favorite', ...data.userFavoriteItem } }
    );
  }
  return { returnCode: 1 };
};

export const CMUpsertUserGachaTicket = async (data: any) => {
  return { returnCode: 1 };
};

export const CMUpsertUserPrint = async (data: any) => {
  return {
    returnCode: 1,
    orderId: data.orderId ?? 1,
    serialId: data.serialId ?? 'ASPHYXIA0001',
    printState: 1,
  };
};

export const CMUpsertUserPrintSubData = async (data: any) => {
  return { returnCode: 1 };
};

export const CMUpsertUserPrintCancel = async (data: any) => {
  return { returnCode: 1 };
};