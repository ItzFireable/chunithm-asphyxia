import {Profile} from '../models/profile';

function rebootTimes(): {start: string; end: string} {
  const fmt = (d: Date) =>
      d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '.0');
  const now = Date.now();
  return {
    start: fmt(new Date(now + 6 * 3600 * 1000)),
    end: fmt(new Date(now + 7 * 3600 * 1000)),
  };
}

function matchTimes(): {start: string; end: string} {
  const fmt = (d: Date) =>
      d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '.0');
  const now = Date.now();
  return {
    start: fmt(new Date(now + 8 * 3600 * 1000)),
    end: fmt(new Date(now + 16 * 3600 * 1000)),
  };
}

export const GetGameSetting = async (data: any) => {
  const rb = rebootTimes();
  const mt = matchTimes();
  const host = 'naominet.jp';
  const base = `http://${host}/SDHD/240/ChuniServlet/`;
  return {
    gameSetting: {
      isMaintenance: false,
      requestInterval: 10,
      rebootStartTime: rb.start,
      rebootEndTime: rb.end,
      isBackgroundDistribute: false,
      maxCountCharacter: 300,
      maxCountItem: 300,
      maxCountMusic: 300,
      matchStartTime: mt.start,
      matchEndTime: mt.end,
      matchTimeLimit: 60,
      matchErrorLimit: 9999,
      romVersion: '2.40.00',
      dataVersion: '2.40.00',
      matchingUri: base,
      matchingUriX: base,
      udpHolePunchUri: base,
      reflectorUri: base,
    },
    isDumpUpload: false,
    isAou: false,
  };
};

export const GetGameEvent = async (data: any) => ({
  type: data.type ?? 1,
  length: 0,
  gameEventList: [],
});

export const GetGameMessage = async (data: any) => ({
  type: data.type ?? 1,
  length: 1,
  gameMessageList: [{
    id: 1,
    type: 1,
    message: 'Welcome to Asphyxia Arcade!',
    startDate: '2017-12-05 07:00:00.0',
    endDate: '2099-12-31 00:00:00.0',
  }],
});

export const GetGameCharge = async (data: any) =>
    ({length: 0, gameChargeList: []});
export const GetGameIdlist = async (data: any) =>
    ({type: data.type ?? 1, length: 0, gameIdlistList: []});
export const GetGameSale = async (data: any) =>
    ({type: data.type ?? 1, length: 0, gameSaleList: []});
export const GetGameRanking = async (data: any) =>
    ({type: data.type ?? 1, gameRankingList: []});

export const GetGameGachaCardList = async (data: any) => ({
  length: 0,
  isUpdated: false,
  lastUpdatedDate: '2020-01-01 00:00:00.0',
  gameGachaCardList: [],
});

export const GetGameCourseLevel = async (data: any) =>
    ({length: 0, gameCourseLevelList: []});
export const GetGameMapAreaCondition = async (data: any) =>
    ({length: 0, gameMapAreaConditionList: []});
export const GetGameRankingCount = async (data: any) => ({rankingCount: 0});
export const GetGameUCCondition = async (data: any) =>
    ({length: 0, gameUnlockChallengeConditionList: []});
export const GetGameLVConditionOpen = async (data: any) =>
    ({length: 0, gameLinkedVerseConditionOpenList: []});
export const GetGameLVConditionUnlock = async (data: any) =>
    ({length: 0, gameLinkedVerseConditionUnlockList: []});

export const GameLogin = async (data: any) => {
  const userId = data.userId;
  const profile = await DB.FindOne<Profile>({userId});
  if (profile) {
    const now = new Date().toISOString().replace('T', ' ').split('.')[0] + '.0';
    await DB.Update(
        {userId}, {$inc: {playCount: 1}, $set: {lastPlayDate: now}});
  }
  return {returnCode: 1};
};

export const GameLogout = async (data: any) => ({returnCode: 1});

export const UpsertClientBookkeeping = async (data: any) => ({returnCode: '1'});
export const UpsertClientDevelop = async (data: any) => ({returnCode: '1'});
export const UpsertClientError = async (data: any) => ({returnCode: '1'});
export const UpsertClientSetting = async (data: any) => ({returnCode: '1'});
export const UpsertClientTestmode = async (data: any) => ({returnCode: '1'});
export const UpsertClientUpload = async (data: any) => ({returnCode: '1'});

const matchingRooms: Record<string, any> = {};

export const BeginMatching = async (data: any) => {
  const roomId = `room_${data.userId}_${Date.now()}`;
  matchingRooms[roomId] = {roomId, userId: data.userId};
  return {
    returnCode: 1,
    roomId,
    matchingMemberInfoList: [{userId: data.userId, memberState: 1}],
    matchingWaitTime: 0,
  };
};

export const EndMatching = async (data: any) => {
  if (data.roomId) delete matchingRooms[data.roomId];
  return {returnCode: 1};
};

export const GetMatchingState = async (data: any) => ({
  returnCode: 1,
  matchingMemberInfoList: [],
  matchingWaitTime: 0,
  roomId: data.roomId ?? '',
});

export const Ping = async () => ({returnCode: 1});