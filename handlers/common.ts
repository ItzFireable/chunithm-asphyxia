import { Profile } from '../models/profile';

export const GetGameSetting = async (data: any) => {
  return {
    gameSetting: {
      dataVersion: '2.40.00',
      isMaintenance: 'false',
      requestInterval: 10,
      rebootStartTime: '2020-01-01 07:00:00.0',
      rebootEndTime: '2020-01-01 08:00:00.0',
      isBackgroundDistribute: 'false',
      maxCountCharacter: 300,
      maxCountItem: 300,
      maxCountMusic: 300,
    },
    isDumpUpload: 'false',
    isAou: 'false',
  };
};

export const GetGameEvent = async (data: any) => {
  return {
    type: data.type ?? 1,
    length: 0,
    gameEventList: [],
  };
};

export const GetGameMessage = async (data: any) => {
  return {
    type: data.type ?? 1,
    length: 1,
    gameMessageList: [
      {
        id: 1,
        type: 1,
        message: 'Welcome to Asphyxia Arcade!',
        startDate: '2017-12-05 07:00:00.0',
        endDate: '2099-12-31 00:00:00.0',
      },
    ],
  };
};

export const GameLogin = async (data: any) => {
  const userId = data.userId;
  const profile = await DB.FindOne<Profile>({ userId });
  if (profile) {
    const now = new Date().toISOString().replace('T', ' ').split('.')[0] + '.0';
    await DB.Update({ userId }, { $inc: { playCount: 1 }, $set: { lastPlayDate: now } });
  }
  return { returnCode: 1 };
};

export const GameLogout = async (data: any) => {
  return { returnCode: 1 };
};

export const GetGameIdlist = async (data: any) => {
  return {
    type: data.type ?? 1,
    length: 0,
    gameIdlistList: [],
  };
};

export const GetGameCharge = async (data: any) => {
  return {
    length: 0,
    gameChargeList: [],
  };
};

// Game supplies the gacha card pool list. Empty is safe, no gacha shown.
export const GetGameGachaCardList = async (data: any) => {
  return {
    length: 0,
    isUpdated: false,
    lastUpdatedDate: '2020-01-01 00:00:00.0',
    gameGachaCardList: [],
  };
};

// Challenge chart course definitions. Empty is safe.
export const GetGameCourseLevel = async (data: any) => {
  return {
    length: 0,
    gameCourseList: [],
  };
};

// Map area unlock conditions. Empty is safe.
export const GetGameMapAreaCondition = async (data: any) => {
  return {
    length: 0,
    gameMapAreaConditionList: [],
  };
};

// Online ranking player count. 0 is fine for a private server.
export const GetGameRankingCount = async (data: any) => {
  return {
    rankingCount: 0,
  };
};

// -----------------------------------------------------------------------
// Client diagnostic upserts — fire-and-forget from the game client.
// The game does NOT inspect the response body beyond returnCode.
// Missing these causes boot loops on some versions.
// -----------------------------------------------------------------------

export const UpsertClientBookkeeping = async (data: any) => ({ returnCode: 1 });
export const UpsertClientDevelop = async (data: any) => ({ returnCode: 1 });
export const UpsertClientError = async (data: any) => ({ returnCode: 1 });
export const UpsertClientSetting = async (data: any) => ({ returnCode: 1 });
export const UpsertClientTestmode = async (data: any) => ({ returnCode: 1 });
export const UpsertClientUpload = async (data: any) => ({ returnCode: 1 });

// -----------------------------------------------------------------------
// Matching endpoints
// Returning a safe "no match found" state prevents hangs in solo play.
// Uses an in-memory map — resets on server restart, fine for private use.
// -----------------------------------------------------------------------

const matchingRooms: Record<string, any> = {};

export const BeginMatching = async (data: any) => {
  const roomId = `room_${data.userId}_${Date.now()}`;
  matchingRooms[roomId] = { roomId, userId: data.userId };
  return {
    returnCode: 1,
    roomId,
    matchingMemberInfoList: [{ userId: data.userId, memberState: 1 }],
    matchingWaitTime: 0,
  };
};

export const EndMatching = async (data: any) => {
  if (data.roomId) delete matchingRooms[data.roomId];
  return { returnCode: 1 };
};

export const GetMatchingState = async (data: any) => {
  return {
    returnCode: 1,
    matchingMemberInfoList: [],
    matchingWaitTime: 0,
    roomId: data.roomId ?? '',
  };
};

export const Ping = async () => ({ returnCode: 1 });