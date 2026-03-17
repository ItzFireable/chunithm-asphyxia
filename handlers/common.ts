import { Profile } from '../models/profile';

export const GetGameSetting = async (data: any) => ({
  gameSetting: {
    dataVersion: '2.40.00',
    isMaintenance: 'false',
    requestInterval: 10,
    rebootStartTime: '2020-01-01 07:00:00.0',
    rebootEndTime: '2020-01-01 08:00:00.0',
    isBackgroundDistribute: 'false',
    maxCountCharacter: 300, maxCountItem: 300, maxCountMusic: 300,
  },
  isDumpUpload: 'false',
  isAou: 'false',
});

export const GetGameEvent = async (data: any) => ({
  type: data.type ?? 1, length: 0, gameEventList: [],
});

export const GetGameMessage = async (data: any) => ({
  type: data.type ?? 1,
  length: 1,
  gameMessageList: [{
    id: 1, type: 1,
    message: 'Welcome to Asphyxia Arcade!',
    startDate: '2017-12-05 07:00:00.0',
    endDate: '2099-12-31 00:00:00.0',
  }],
});

export const GetGameCharge = async (data: any) => ({ length: 0, gameChargeList: [] });
export const GetGameIdlist = async (data: any) => ({ type: data.type ?? 1, length: 0, gameIdlistList: [] });

// artemis: handle_get_game_sale_api_request
export const GetGameSale = async (data: any) => ({ type: data.type ?? 1, length: 0, gameSaleList: [] });

// artemis: handle_get_game_ranking_api_request
export const GetGameRanking = async (data: any) => ({ type: data.type ?? 1, gameRankingList: [] });

export const GetGameGachaCardList = async (data: any) => ({
  length: 0, isUpdated: false, lastUpdatedDate: '2020-01-01 00:00:00.0', gameGachaCardList: [],
});

export const GetGameCourseLevel = async (data: any) => ({ length: 0, gameCourseLevelList: [] });

export const GetGameMapAreaCondition = async (data: any) => ({ length: 0, gameMapAreaConditionList: [] });

// artemis: handle_get_game_ranking_count_api_request (not in artemis, keep for compat)
export const GetGameRankingCount = async (data: any) => ({ rankingCount: 0 });

// Unlock Challenge conditions (VERSE) — artemis: handle_get_game_u_c_condition_api_request
export const GetGameUCCondition = async (data: any) => ({
  length: 0, gameUnlockChallengeConditionList: [],
});

// Linked VERSE conditions (X-VERSE) — artemis: handle_get_game_l_v_condition_open/unlock
export const GetGameLVConditionOpen = async (data: any) => ({
  length: 0, gameLinkedVerseConditionOpenList: [],
});

export const GetGameLVConditionUnlock = async (data: any) => ({
  length: 0, gameLinkedVerseConditionUnlockList: [],
});

// ── Session ───────────────────────────────────────────────────────────────────

export const GameLogin = async (data: any) => {
  const userId = data.userId;
  const profile = await DB.FindOne<Profile>({ userId });
  if (profile) {
    const now = new Date().toISOString().replace('T', ' ').split('.')[0] + '.0';
    await DB.Update({ userId }, { $inc: { playCount: 1 }, $set: { lastPlayDate: now } });
  }
  return { returnCode: 1 };
};

export const GameLogout = async (data: any) => ({ returnCode: 1 });

// ── Client upserts — fire and forget ─────────────────────────────────────────

export const UpsertClientBookkeeping = async (data: any) => ({ returnCode: 1 });
export const UpsertClientDevelop     = async (data: any) => ({ returnCode: 1 });
export const UpsertClientError       = async (data: any) => ({ returnCode: 1 });
export const UpsertClientSetting     = async (data: any) => ({ returnCode: 1 });
export const UpsertClientTestmode    = async (data: any) => ({ returnCode: 1 });
export const UpsertClientUpload      = async (data: any) => ({ returnCode: 1 });

// ── Matching ──────────────────────────────────────────────────────────────────

const matchingRooms: Record<string, any> = {};

export const BeginMatching = async (data: any) => {
  const roomId = `room_${data.userId}_${Date.now()}`;
  matchingRooms[roomId] = { roomId, userId: data.userId };
  return { returnCode: 1, roomId, matchingMemberInfoList: [{ userId: data.userId, memberState: 1 }], matchingWaitTime: 0 };
};

export const EndMatching = async (data: any) => {
  if (data.roomId) delete matchingRooms[data.roomId];
  return { returnCode: 1 };
};

export const GetMatchingState = async (data: any) => ({
  returnCode: 1, matchingMemberInfoList: [], matchingWaitTime: 0, roomId: data.roomId ?? '',
});

export const Ping = async () => ({ returnCode: 1 });
