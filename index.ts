import * as common from './handlers/common';
import * as matching from './handlers/matching';
import * as profiles from './handlers/profiles';

export const register = async () => {
  R.GameCode('SDHD');

  R.Contributor('Fireable');
  R.Config('unlock_all_songs', {
    type: 'boolean',
    default: true,
    desc: 'Unlocks all songs for all players.'
  });
  R.Config('unlock_all_items', {
    type: 'boolean',
    default: false,
    desc: 'Unlocks all system items and characters.'
  });
  R.Config('infinite_tickets', {
    type: 'boolean',
    default: true,
    desc: 'Provides infinite event/map tickets.'
  });

  R.SegaMethodNames([
    'GetGameSetting',
    'GetGameEvent',
    'GetGameMessage',
    'GetGameCharge',
    'GetGameGachaCardList',
    'GetGameMapAreaCondition',
    'GetGameCourseLevel',
    'GetGameRankingApi',
    'GetGameSaleApi',
    'GetGameIdlist',
    'GetGameUCConditionApi',
    'GetGameLVConditionOpenApi',
    'GetGameLVConditionUnlockApi',

    'GameLogin',
    'GameLogout',

    'GetUserPreview',
    'GetUserData',
    'GetUserDataEx',
    'GetUserOptionApi',
    'GetUserOptionExApi',

    'GetUserMusicApi',

    'GetUserRecentRating',
    'GetUserBestRating',
    'GetUserRatinglog',

    'GetUserCharacterSelect',
    'GetUserItem',
    'GetUserItemEx',
    'GetUserCharacter',

    'GetUserMapApi',
    'GetUserMapArea',
    'GetUserMapAreaCondition',
    'GetUserCourse',

    'GetUserActivity',
    'GetUserCharge',

    'GetUserTeamApi',
    'GetTeamCourseSettingApi',
    'GetTeamCourseRuleApi',
    'GetUserRecentPlayerApi',
    'GetUserRegionApi',
    'GetUserRivalDataApi',
    'GetUserRivalMusicApi',

    'GetUserDuelApi',
    'GetUserFavoriteItem',
    'GetUserFavoriteMusic',
    'GetUserUnlockItem',
    'GetUserGacha',
    'GetUserMacDetail',

    'GetUserLoginBonus',
    'GetUserLoginBonusInfo',

    'GetUserPlaylog',
    'GetUserCtoCPlay',

    'GetUserNetBattleDataApi',
    'GetUserNetBattleRankingInfoApi',

    'GetUserCMissionApi',
    'GetUserCMissionProgress',
    'GetUserCMissionListApi',

    'GetUserUCApi',
    'GetUserUCProgressApi',

    'GetUserRecMusicApi',
    'GetUserRecRatingApi',

    'GetUserLVApi',

    'UpsertUserAll',
    'UpsertUserChargelogApi',
    'UpsertClientTestmode',
    'UpsertClientBookkeeping',
    'UpsertClientDevelop',
    'UpsertClientError',
    'UpsertClientSetting',
    'UpsertClientUpload',

    'BeginMatchingApi',
    'EndMatchingApi',
    'RemoveMatchingMemberApi',
    'GetMatchingStateApi',

    'CMGetUserCharacter',
    'CMGetUserPreview',
    'CMUpsertUserFavoriteItem',
    'CMUpsertUserGachaTicket',
    'CMUpsertUserPrintSubData',
    'CMUpsertUserPrint',
    'CMUpsertUserPrintCancel',

    'Ping',
  ]);

  R.SegaIterCounts({
    '9': 67,
    '10': 44,
    '11': 54,
    '12': 25,
    '13': 70,
    '14': 36,
    '15': 8,
    '16': 56,
    '17': 42,
    '18': 14,
  });

  R.SegaVersionMap((gameCode: string, version: number) => {
    if (gameCode === 'SDHD' || gameCode === 'SDBT') {
      if (version < 105) return 0;
      if (version < 110) return 1;
      if (version < 115) return 2;
      if (version < 120) return 3;
      if (version < 125) return 4;
      if (version < 130) return 5;
      if (version < 135) return 6;
      if (version < 140) return 7;
      if (version < 145) return 8;
      if (version < 150) return 9;
      if (version < 200) return 10;
      if (version < 205) return 11;
      if (version < 210) return 12;
      if (version < 215) return 13;
      if (version < 220) return 14;
      if (version < 225) return 15;
      if (version < 230) return 16;
      if (version < 240) return 17;
      return 18;
    }
    if (gameCode === 'SDGS') {
      if (version < 105) return 9;
      if (version < 110) return 10;
      if (version < 115) return 11;
      if (version < 120) return 12;
      if (version < 125) return 13;
      if (version < 130) return 14;
      if (version < 135) return 15;
      if (version < 140) return 16;
      if (version < 150) return 17;
      return 18;
    }
    if (gameCode === 'SDHJ') {
      if (version < 110) return 11;
      if (version < 120) return 12;
      if (version < 130) return 15;
      return 17;
    }
    return -1;
  });

  R.SegaCrypto({
    '15': [
      '259DAAA9A63F83C19F84F860A3815D89', '94165F8DE25CA432B94F3C8A08197771',
      '6FBE6300AE4D024B1277F70F0BF21DA9'
    ],
    '16': [
      '8D9C08D69A5D6B600508CEF6E4A836AF', '9890F098C220E7783D5C588B871BCC42',
      'C6C38A0FCDD0602F82718E349896792E'
    ],
    '17': [
      'B2A5AA6821A8BA52C7C83DBE262529C2', '960904E04907F6A08535A6AE8D3B3677',
      '91A8DD686FB1BE81E27B13AAF8FCB170'
    ],
    '18': [
      'CE7508AA82647703975C96A8386377AE', '91079F36CB17D9808332A69A8E2E3942',
      'C6C38A0FCDD0602F82718E349896792E'
    ],
  });
};

export const handleSega =
    async (gameCode: string, method: string, data: any) => {
  const cleanMethod = method.replace(/Api$/, '');

  const handler = (matching as any)[cleanMethod] ||
      (profiles as any)[cleanMethod] || (common as any)[cleanMethod];

  if (typeof handler === 'function') {
    return await handler(data);
  }

  console.warn(
      `[Chunithm] Unhandled method: ${method} (cleaned: ${cleanMethod})`);
  return {returnCode: 1};
};