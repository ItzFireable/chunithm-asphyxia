interface MatchingMember {
  userId: string;
  userName: string;
  [key: string]: any;
}

interface MatchingRoom {
  roomId: number;
  version: number;
  user: number;
  restMSec: number;
  isFull: boolean;
  matchingMemberInfoList: MatchingMember[];
}

const rooms: Map<string, MatchingRoom> = new Map();

const roomKey = (version: number, roomId: number) => `${version}:${roomId}`;

function getOldestFreeRoom(version: number): MatchingRoom|null {
  let oldest: MatchingRoom|null = null;
  for (const room of rooms.values())
    if (room.version === version && !room.isFull)
      if (!oldest || room.roomId < oldest.roomId) oldest = room;
  return oldest;
}

function getNewestRoom(version: number): MatchingRoom|null {
  let newest: MatchingRoom|null = null;
  for (const room of rooms.values())
    if (room.version === version)
      if (!newest || room.roomId > newest.roomId) newest = room;
  return newest;
}

function getAllRooms(version: number): MatchingRoom[] {
  return [...rooms.values()].filter(r => r.version === version);
}

function getRoom(version: number, roomId: number): MatchingRoom|null {
  return rooms.get(roomKey(version, roomId)) ?? null;
}

function putRoom(room: MatchingRoom): void {
  rooms.set(roomKey(room.version, room.roomId), room);
}

function deleteRoom(version: number, roomId: number): void {
  rooms.delete(roomKey(version, roomId));
}

setInterval(() => {
  for (const [key, room] of rooms.entries())
    if (room.restMSec <= 0) rooms.delete(key);
}, 60_000);

function getHost(): string {
  const h = U.GetCoreConfig('sega_hostname');
  return (h && h.trim()) ? h.trim() : 'naominet.jp';
}

export const BeginMatching = async (data: any) => {
  const version = 18;
  let roomId = 1;
  let room = getOldestFreeRoom(version);
  const newMember: MatchingMember = {...data.matchingMemberInfo};

  if (room === null) {
    const newest = getNewestRoom(version);
    if (newest !== null) roomId = newest.roomId + 1;
    room = {
      roomId,
      version,
      user: parseInt(newMember.userId),
      restMSec: 60,
      isFull: false,
      matchingMemberInfoList: [newMember]
    };
    putRoom(room);
  } else {
    room.matchingMemberInfoList.push(newMember);
    room.isFull = room.matchingMemberInfoList.length >= 4;
    putRoom(room);
  }

  return {
    roomId: room.roomId,
    matchingWaitState: {
      isFinish: false,
      restMSec: room.restMSec,
      pollingInterval: 1,
      matchingMemberInfoList: room.matchingMemberInfoList,
    },
  };
};

export const EndMatching = async (data: any) => {
  const version = 18;
  const room = getRoom(version, data.roomId);
  if (!room)
    return {
      matchingResult: 1,
      matchingMemberInfoList: [],
      matchingMemberRoleList: [],
      reflectorUri: ''
    };

  const members = room.matchingMemberInfoList;
  const roleList =
      members.map(m => ({role: parseInt(m.userId) === room.user ? 1 : 0}));

  room.isFull = true;
  room.restMSec = 0;
  putRoom(room);

  return {
    matchingResult: 1,
    matchingMemberInfoList: members,
    matchingMemberRoleList: roleList,
    reflectorUri: getHost(),
  };
};

export const RemoveMatchingMember = async (data: any) => {
  const version = 18;
  for (const room of getAllRooms(version)) {
    const before = room.matchingMemberInfoList.length;
    room.matchingMemberInfoList =
        room.matchingMemberInfoList.filter(m => m.userId !== data.userId);
    if (room.matchingMemberInfoList.length === before) continue;
    if (room.matchingMemberInfoList.length <= 0)
      deleteRoom(version, room.roomId);
    else
      putRoom(room);
    break;
  }
  return {returnCode: '1'};
};

export const GetMatchingState = async (data: any) => {
  const version = 18;
  const pollingInterval = 1;
  const room = getRoom(version, data.roomId);

  if (!room) {
    return {
      roomId: data.roomId,
      matchingWaitState: {
        isFinish: true,
        restMSec: 0,
        pollingInterval,
        matchingMemberInfoList: []
      },
    };
  }

  const currentMember: MatchingMember = {...data.matchingMemberInfo};

  if (room.user === parseInt(currentMember.userId))
    room.restMSec = Math.max(0, room.restMSec - pollingInterval);

  const idx = room.matchingMemberInfoList.findIndex(
      m => m.userId === currentMember.userId);
  if (idx >= 0) room.matchingMemberInfoList[idx] = currentMember;

  putRoom(room);

  const diffMembers = room.matchingMemberInfoList.filter(
      m => m.userId !== currentMember.userId);

  return {
    roomId: data.roomId,
    matchingWaitState: {
      isFinish: room.restMSec === 0,
      restMSec: room.restMSec,
      pollingInterval,
      matchingMemberInfoList: [currentMember, ...diffMembers],
    },
  };
};