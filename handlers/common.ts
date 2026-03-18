import {Profile} from '../models/profile';

function rebootTimes() {
  const fmt = (d: Date) =>
      d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '.0');
  const now = Date.now();
  return {
    start: fmt(new Date(now + 6 * 3600 * 1000)),
    end: fmt(new Date(now + 7 * 3600 * 1000))
  };
}

function matchTimes() {
  const fmt = (d: Date) =>
      d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '.0');
  const now = Date.now();
  return {
    start: fmt(new Date(now + 8 * 3600 * 1000)),
    end: fmt(new Date(now + 16 * 3600 * 1000))
  };
}

function getHost(): string {
  const h = U.GetCoreConfig('sega_hostname');
  return (h && h.trim()) ? h.trim() : 'naominet.jp';
}

function getServerName(): string {
  return U.GetCoreConfig('server_name') || 'Asphyxia Arcade';
}

function getServerTag(): string {
  return U.GetCoreConfig('server_tag') || 'CORE';
}

export const GetGameSetting = async (data: any) => {
  const rb = rebootTimes();
  const mt = matchTimes();
  const host = getHost();
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

export const GetGameEvent = async (data: any) => {
  const events = await DB.Find({collection: 'event', enabled: true});
  if (!events || events.length === 0)
    return {type: data.type ?? 1, length: 0, gameEventList: []};

  const list = events.map((e: any) => ({
    id: e.eventId,
    type: e.type,
    startDate: e.startDate || '2017-12-05 07:00:00.0',
    endDate: '2099-12-31 00:00:00',
  }));

  return {type: data.type ?? 1, length: list.length, gameEventList: list};
};

export const GetGameMessage = async (data: any) => ({
  type: data.type ?? 1,
  length: 1,
  gameMessageList: [{
    id: 1,
    type: 1,
    message: `${getServerTag()} | ${getServerName()}`,
    startDate: '2017-12-05 07:00:00.0',
    endDate: '2099-12-31 00:00:00.0',
  }],
});

export const GetGameCharge = async (data: any) => {
  const charges = await DB.Find({collection: 'charge_def', enabled: true});
  if (!charges || charges.length === 0)
    return {length: 0, gameChargeList: []};

  const list = charges.map((c: any, i: number) => ({
    orderId: i,
    chargeId: c.chargeId,
    price: 1,
    startDate: '2017-12-05 07:00:00.0',
    endDate: '2099-12-31 00:00:00.0',
    salePrice: 1,
    saleStartDate: '2017-12-05 07:00:00.0',
    saleEndDate: '2099-12-31 00:00:00.0',
  }));

  return {length: list.length, gameChargeList: list};
};

export const GetGameIdlist  = async (data: any) =>
    ({type: data.type ?? 1, length: 0, gameIdlistList: []});
export const GetGameSale    = async (data: any) =>
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
export const GetGameRankingCount      = async (data: any) => ({rankingCount: 0});
export const GetGameUCCondition       = async (data: any) =>
    ({length: 0, gameUnlockChallengeConditionList: []});
export const GetGameLVConditionOpen   = async (data: any) =>
    ({length: 0, gameLinkedVerseConditionOpenList: []});
export const GetGameLVConditionUnlock = async (data: any) =>
    ({length: 0, gameLinkedVerseConditionUnlockList: []});

export const GetGameGacha = async (data: any) =>
    ({type: data.type ?? 1, length: 0, gameGachaList: [], registIdList: []});
export const GetGameGachaCardById = async (data: any) =>
    ({type: data.type ?? 1, length: 0, gameGachaCardList: []});
export const RollGacha = async (data: any) =>
    ({type: data.type ?? 1, length: 0, gameGachaCardList: []});

export const PrinterLogin  = async (data: any) => ({returnCode: '1'});
export const PrinterLogout = async (data: any) => ({returnCode: '1'});
export const CreateToken   = async (data: any) => ({returnCode: '1', userToken: ''});
export const DeleteToken   = async (data: any) => ({returnCode: '1'});
export const RemoveToken   = async (data: any) => ({returnCode: '1'});

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
export const UpsertClientDevelop     = async (data: any) => ({returnCode: '1'});
export const UpsertClientError       = async (data: any) => ({returnCode: '1'});
export const UpsertClientSetting     = async (data: any) => ({returnCode: '1'});
export const UpsertClientTestmode    = async (data: any) => ({returnCode: '1'});
export const UpsertClientUpload      = async (data: any) => ({returnCode: '1'});

export const Ping = async () => ({returnCode: 1});
