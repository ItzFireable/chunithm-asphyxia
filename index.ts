import * as common from './handlers/common';
import * as profiles from './handlers/profiles';

/**
 * Chunithm X-VERSE-X Plugin for Asphyxia CORE
 *
 * Ported/Authored by: Fireable
 * Special thanks to: Asphyxia Team, Artemis Devs
 */
export const register = async () => {
  R.GameCode('SDBT');
  R.GameCode('SDHD');
  R.GameCode('SDGS');
  R.GameCode('SDHJ');

  R.Contributor('Fireable');
  R.Config('unlock_all_songs', { type: 'boolean', default: true,  desc: 'Unlocks all songs for all players.' });
  R.Config('unlock_all_items',  { type: 'boolean', default: false, desc: 'Unlocks all system items and characters.' });
  R.Config('infinite_tickets',  { type: 'boolean', default: true,  desc: 'Provides infinite event/map tickets.' });

  // ── SEGA Metadata ────────────────────────────────────────────────────────
  // Method names must EXACTLY match what the game hashes.
  // Derived from artemis: inflection.camelize(handle_X_api_request)[6:-7] + "Api"
  // Any name mismatch means the PBKDF2 hash won't resolve and the endpoint is silently dropped.
  R.SegaMethodNames([
    // game / server meta
    'GetGameSetting', 'GetGameEvent', 'GetGameMessage', 'GetGameCharge',
    'GetGameGachaCardList', 'GetGameMapAreaCondition', 'GetGameCourseLevel',
    'GetGameRankingApi',    // artemis: handle_get_game_ranking_api_request
    'GetGameSaleApi',       // artemis: handle_get_game_sale_api_request
    'GetGameIdlist',
    'GetGameUCConditionApi',          // VERSE: unlock challenge conditions
    'GetGameLVConditionOpenApi',      // X-VERSE: linked verse open conditions
    'GetGameLVConditionUnlockApi',    // X-VERSE: linked verse unlock conditions

    // session
    'GameLogin', 'GameLogout',

    // user profile
    'GetUserPreview',
    'GetUserData', 'GetUserDataEx',
    'GetUserOptionApi',   // artemis: handle_get_user_option_api_request → userGameOption
    'GetUserOptionExApi', // artemis: handle_get_user_option_ex_api_request → userGameOptionEx

    // scores / music
    'GetUserMusicApi',    // artemis: handle_get_user_music_api_request → userMusicList (grouped)

    // ratings
    'GetUserRecentRating', 'GetUserBestRating', 'GetUserRatinglog',

    // characters / items
    'GetUserCharacterSelect',
    'GetUserItem', 'GetUserItemEx',
    'GetUserCharacter',

    // maps / courses
    'GetUserMapApi',      // artemis: handle_get_user_map_api_request → userMapList
    'GetUserMapArea', 'GetUserMapAreaCondition',
    'GetUserCourse',

    // activities / charges
    'GetUserActivity', 'GetUserCharge',

    // social
    'GetUserTeamApi',           // artemis: handle_get_user_team_api_request
    'GetTeamCourseSettingApi',  // artemis: handle_get_team_course_setting_api_request
    'GetTeamCourseRuleApi',     // artemis: handle_get_team_course_rule_api_request
    'GetUserRecentPlayerApi',   // artemis: handle_get_user_recent_player_api_request
    'GetUserRegionApi',         // artemis: handle_get_user_region_api_request
    'GetUserRivalDataApi',      // artemis: handle_get_user_rival_data_api_request
    'GetUserRivalMusicApi',     // artemis: handle_get_user_rival_music_api_request

    // duels / favorites
    'GetUserDuelApi',         // artemis: handle_get_user_duel_api_request → userDuelList
    'GetUserFavoriteItem', 'GetUserFavoriteMusic',
    'GetUserUnlockItem',

    // gacha / billing
    'GetUserGacha',
    'GetUserMacDetail',

    // login bonus
    'GetUserLoginBonus', 'GetUserLoginBonusInfo',

    // play history
    'GetUserPlaylog',

    // CtoC / UC Progress
    'GetUserCtoCPlay',
    'GetUserUCProgressApi',   // old name kept for compat

    // net battle (LUMINOUS+)
    'GetUserNetBattleDataApi',          // artemis: handle_get_user_net_battle_data_api_request
    'GetUserNetBattleRankingInfoApi',   // artemis: handle_get_user_net_battle_ranking_info_api_request

    // C-Mission (LUMINOUS)
    'GetUserCMissionApi',               // artemis: handle_get_user_c_mission_api_request
    'GetUserCMissionProgress',          // older name used in some versions
    'GetUserCMissionListApi',           // list variant

    // Unlock Challenge (VERSE)
    'GetUserUCApi',                     // artemis: handle_get_user_u_c_api_request

    // Recommendations (VERSE)
    'GetUserRecMusicApi',               // artemis: handle_get_user_rec_music_api_request
    'GetUserRecRatingApi',              // artemis: handle_get_user_rec_rating_api_request

    // Linked VERSE (X-VERSE)
    'GetUserLVApi',                     // artemis: handle_get_user_l_v_api_request

    // upsert
    'UpsertUserAll',
    'UpsertUserChargelogApi',           // artemis: handle_upsert_user_chargelog_api_request
    'UpsertClientTestmode', 'UpsertClientBookkeeping', 'UpsertClientDevelop',
    'UpsertClientError', 'UpsertClientSetting', 'UpsertClientUpload',

    // matching
    'BeginMatching', 'EndMatching', 'GetMatchingState',

    // card machine
    'CMGetUserCharacter', 'CMGetUserPreview',
    'CMUpsertUserFavoriteItem', 'CMUpsertUserGachaTicket',
    'CMUpsertUserPrintSubData', 'CMUpsertUserPrint', 'CMUpsertUserPrintCancel',

    'Ping',
  ]);

  R.SegaIterCounts({
    '9':  67, '10': 44, '11': 54, '12': 25, '13': 70, '14': 36,
    '15': 8,  '16': 56, '17': 42, '18': 14,
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
    '15': ['259DAAA9A63F83C19F84F860A3815D89', '94165F8DE25CA432B94F3C8A08197771', '6FBE6300AE4D024B1277F70F0BF21DA9'],
    '16': ['8D9C08D69A5D6B600508CEF6E4A836AF', '9890F098C220E7783D5C588B871BCC42', 'C6C38A0FCDD0602F82718E349896792E'],
    '17': ['B2A5AA6821A8BA52C7C83DBE262529C2', '960904E04907F6A08535A6AE8D3B3677', '91A8DD686FB1BE81E27B13AAF8FCB170'],
    '18': ['CE7508AA82647703975C96A8386377AE', '91079F36CB17D9808332A69A8E2E3942', 'C6C38A0FCDD0602F82718E349896792E'],
  });
};

export const handleSega = async (gameCode: string, method: string, data: any) => {
  // Strip "Api" suffix — game sends "GetUserMusicApi", we store handler as "GetUserMusic"
  // Also strip legacy "Api" variants
  const cleanMethod = method.replace(/Api$/, '');

  const handler = (profiles as any)[cleanMethod] || (common as any)[cleanMethod];

  if (typeof handler === 'function') {
    return await handler(data);
  }

  console.warn(`[Chunithm] Unhandled method: ${method} (cleaned: ${cleanMethod})`);
  return { returnCode: 1 };
};
