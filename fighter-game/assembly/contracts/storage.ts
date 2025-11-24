/**
 * Storage helper functions for the Fighter Game Smart Contract
 * Handles all persistent state operations using Massa SDK v3 API
 */

import { Storage } from '@massalabs/massa-as-sdk';
import { Args, stringToBytes, bytesToString } from '@massalabs/as-types';
import {
  Character,
  Equipment,
  Battle,
  Tournament,
  LeaderboardEntry,
  AchievementTracker,
  KEY_CHARACTER,
  KEY_EQUIPMENT,
  KEY_BATTLE,
  KEY_TOURNAMENT,
  KEY_LEADERBOARD,
  KEY_ACHIEVEMENTS,
  KEY_ADMIN,
  KEY_TREASURY,
  KEY_PAUSED,
  KEY_REENTRANCY,
} from './types';

// ============================================================================
// Helper Functions for Key Conversion
// ============================================================================

function toKey(key: string): StaticArray<u8> {
  return stringToBytes(key);
}

function hasKey(key: string): bool {
  return Storage.has(toKey(key));
}

function setString(key: string, value: string): void {
  Storage.set(toKey(key), stringToBytes(value));
}

function getString(key: string): string {
  if (!hasKey(key)) return '';
  return bytesToString(Storage.get(toKey(key)));
}

function setBytes(key: string, value: StaticArray<u8>): void {
  Storage.set(toKey(key), value);
}

function getBytes(key: string): StaticArray<u8> {
  if (!hasKey(key)) return new StaticArray<u8>(0);
  return Storage.get(toKey(key));
}

function delKey(key: string): void {
  if (hasKey(key)) {
    Storage.del(toKey(key));
  }
}

// ============================================================================
// Admin & Security Storage
// ============================================================================

export function setAdmin(address: string): void {
  setString(KEY_ADMIN, address);
}

export function getAdmin(): string {
  return getString(KEY_ADMIN);
}

export function isAdmin(address: string): bool {
  return getAdmin() == address;
}

export function setPaused(paused: bool): void {
  setString(KEY_PAUSED, paused ? '1' : '0');
}

export function isPaused(): bool {
  return getString(KEY_PAUSED) == '1';
}

export function setReentrancyLock(locked: bool): void {
  setString(KEY_REENTRANCY, locked ? '1' : '0');
}

export function isReentrancyLocked(): bool {
  return getString(KEY_REENTRANCY) == '1';
}

// ============================================================================
// Treasury Storage
// ============================================================================

export function getTreasury(): u64 {
  const data = getBytes(KEY_TREASURY);
  if (data.length == 0) return 0;
  const args = new Args(data);
  const result = args.nextU64();
  if (result.isErr()) return 0;
  return result.unwrap();
}

export function setTreasury(amount: u64): void {
  const args = new Args();
  args.add(amount);
  setBytes(KEY_TREASURY, args.serialize());
}

export function addToTreasury(amount: u64): void {
  setTreasury(getTreasury() + amount);
}

// ============================================================================
// Character Storage
// ============================================================================

export function characterKey(id: string): string {
  return KEY_CHARACTER + id;
}

export function saveCharacter(character: Character): void {
  setBytes(characterKey(character.id), character.serialize());
}

export function loadCharacter(id: string): Character | null {
  const key = characterKey(id);
  if (!hasKey(key)) return null;
  const data = getBytes(key);
  if (data.length == 0) return null;
  const character = new Character();
  const result = character.deserialize(data);
  if (result.isErr()) return null;
  return character;
}

export function characterExists(id: string): bool {
  return hasKey(characterKey(id));
}

export function deleteCharacter(id: string): void {
  delKey(characterKey(id));
}

// ============================================================================
// Equipment Storage
// ============================================================================

export function equipmentKey(id: string): string {
  return KEY_EQUIPMENT + id;
}

export function saveEquipment(equipment: Equipment): void {
  setBytes(equipmentKey(equipment.id), equipment.serialize());
}

export function loadEquipment(id: string): Equipment | null {
  const key = equipmentKey(id);
  if (!hasKey(key)) return null;
  const data = getBytes(key);
  if (data.length == 0) return null;
  const equipment = new Equipment();
  const result = equipment.deserialize(data);
  if (result.isErr()) return null;
  return equipment;
}

export function equipmentExists(id: string): bool {
  return hasKey(equipmentKey(id));
}

export function deleteEquipment(id: string): void {
  delKey(equipmentKey(id));
}

// ============================================================================
// Battle Storage
// ============================================================================

export function battleKey(id: string): string {
  return KEY_BATTLE + id;
}

export function saveBattle(battle: Battle): void {
  setBytes(battleKey(battle.id), battle.serialize());
}

export function loadBattle(id: string): Battle | null {
  const key = battleKey(id);
  if (!hasKey(key)) return null;
  const data = getBytes(key);
  if (data.length == 0) return null;
  const battle = new Battle();
  const result = battle.deserialize(data);
  if (result.isErr()) return null;
  return battle;
}

export function battleExists(id: string): bool {
  return hasKey(battleKey(id));
}

export function deleteBattle(id: string): void {
  delKey(battleKey(id));
}

// ============================================================================
// Tournament Storage
// ============================================================================

export function tournamentKey(id: string): string {
  return KEY_TOURNAMENT + id;
}

export function saveTournament(tournament: Tournament): void {
  setBytes(tournamentKey(tournament.id), tournament.serialize());
}

export function loadTournament(id: string): Tournament | null {
  const key = tournamentKey(id);
  if (!hasKey(key)) return null;
  const data = getBytes(key);
  if (data.length == 0) return null;
  const tournament = new Tournament();
  const result = tournament.deserialize(data);
  if (result.isErr()) return null;
  return tournament;
}

export function tournamentExists(id: string): bool {
  return hasKey(tournamentKey(id));
}

// ============================================================================
// Leaderboard Storage
// ============================================================================

export function leaderboardKey(rank: u32): string {
  return KEY_LEADERBOARD + rank.toString();
}

export function leaderboardCountKey(): string {
  return KEY_LEADERBOARD + 'count';
}

export function saveLeaderboardEntry(rank: u32, entry: LeaderboardEntry): void {
  setBytes(leaderboardKey(rank), entry.serialize());
}

export function loadLeaderboardEntry(rank: u32): LeaderboardEntry | null {
  const key = leaderboardKey(rank);
  if (!hasKey(key)) return null;
  const data = getBytes(key);
  if (data.length == 0) return null;
  const entry = new LeaderboardEntry();
  const result = entry.deserialize(data);
  if (result.isErr()) return null;
  return entry;
}

export function getLeaderboardCount(): u32 {
  const data = getBytes(leaderboardCountKey());
  if (data.length == 0) return 0;
  const args = new Args(data);
  const result = args.nextU32();
  if (result.isErr()) return 0;
  return result.unwrap();
}

export function setLeaderboardCount(count: u32): void {
  const args = new Args();
  args.add(count);
  setBytes(leaderboardCountKey(), args.serialize());
}

// ============================================================================
// Achievement Storage
// ============================================================================

export function achievementKey(address: string): string {
  return KEY_ACHIEVEMENTS + address;
}

export function saveAchievements(tracker: AchievementTracker): void {
  setBytes(achievementKey(tracker.ownerAddress), tracker.serialize());
}

export function loadAchievements(address: string): AchievementTracker | null {
  const key = achievementKey(address);
  if (!hasKey(key)) return null;
  const data = getBytes(key);
  if (data.length == 0) return null;
  const tracker = new AchievementTracker();
  const result = tracker.deserialize(data);
  if (result.isErr()) return null;
  return tracker;
}

export function getOrCreateAchievements(address: string): AchievementTracker {
  let tracker = loadAchievements(address);
  if (tracker == null) {
    tracker = new AchievementTracker(address);
  }
  return tracker;
}

// ============================================================================
// Helper: Character Owner Index (for lookups by owner)
// ============================================================================

const KEY_OWNER_CHARS: string = 'owner_chars_';

export function ownerCharsKey(owner: string): string {
  return KEY_OWNER_CHARS + owner;
}

export function addCharacterToOwner(owner: string, charId: string): void {
  const key = ownerCharsKey(owner);
  let chars = getString(key);
  if (chars.length > 0) {
    chars += ',';
  }
  chars += charId;
  setString(key, chars);
}

export function getOwnerCharacters(owner: string): string[] {
  const chars = getString(ownerCharsKey(owner));
  if (chars.length == 0) return [];
  return chars.split(',');
}

// ============================================================================
// Helper: Equipment Owner Index
// ============================================================================

const KEY_OWNER_EQUIPS: string = 'owner_equips_';

export function ownerEquipsKey(owner: string): string {
  return KEY_OWNER_EQUIPS + owner;
}

export function addEquipmentToOwner(owner: string, equipId: string): void {
  const key = ownerEquipsKey(owner);
  let equips = getString(key);
  if (equips.length > 0) {
    equips += ',';
  }
  equips += equipId;
  setString(key, equips);
}

export function removeEquipmentFromOwner(owner: string, equipId: string): void {
  const equips = getString(ownerEquipsKey(owner)).split(',');
  const newEquips: string[] = [];
  for (let i = 0; i < equips.length; i++) {
    if (equips[i] != equipId) {
      newEquips.push(equips[i]);
    }
  }
  setString(ownerEquipsKey(owner), newEquips.join(','));
}

export function getOwnerEquipment(owner: string): string[] {
  const equips = getString(ownerEquipsKey(owner));
  if (equips.length == 0) return [];
  return equips.split(',');
}
