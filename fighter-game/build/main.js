import * as __import0 from "massa";
async function instantiate(module, imports = {}) {
  const __module0 = imports.massa;
  const adaptedImports = {
    env: Object.assign(Object.create(globalThis), imports.env || {}, {
      abort(message, fileName, lineNumber, columnNumber) {
        // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
        message = __liftString(message >>> 0);
        fileName = __liftString(fileName >>> 0);
        lineNumber = lineNumber >>> 0;
        columnNumber = columnNumber >>> 0;
        (() => {
          // @external.js
          throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
        })();
      },
    }),
    massa: Object.assign(Object.create(__module0), {
      assembly_script_has_data(key) {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.has(~lib/staticarray/StaticArray<u8>) => bool
        key = __liftStaticArray(__getU8, 0, key >>> 0);
        return __module0.assembly_script_has_data(key) ? 1 : 0;
      },
      assembly_script_get_data(key) {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.get(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
        key = __liftStaticArray(__getU8, 0, key >>> 0);
        return __lowerStaticArray(__setU8, 5, 0, __module0.assembly_script_get_data(key), Uint8Array) || __notnull();
      },
      assembly_script_set_data(key, value) {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.set(~lib/staticarray/StaticArray<u8>, ~lib/staticarray/StaticArray<u8>) => void
        key = __liftStaticArray(__getU8, 0, key >>> 0);
        value = __liftStaticArray(__getU8, 0, value >>> 0);
        __module0.assembly_script_set_data(key, value);
      },
      assembly_script_generate_event(event) {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.generateEvent(~lib/string/String) => void
        event = __liftString(event >>> 0);
        __module0.assembly_script_generate_event(event);
      },
      assembly_script_get_call_stack() {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.callStack() => ~lib/string/String
        return __lowerString(__module0.assembly_script_get_call_stack()) || __notnull();
      },
      assembly_script_get_call_coins() {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.callCoins() => u64
        return __module0.assembly_script_get_call_coins() || 0n;
      },
      assembly_script_transfer_coins(to, amount) {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.transferCoins(~lib/string/String, u64) => void
        to = __liftString(to >>> 0);
        amount = BigInt.asUintN(64, amount);
        __module0.assembly_script_transfer_coins(to, amount);
      },
      assembly_script_get_time() {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.time() => u64
        return __module0.assembly_script_get_time() || 0n;
      },
      assembly_script_get_balance() {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.balance() => u64
        return __module0.assembly_script_get_balance() || 0n;
      },
    }),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf({
    constructor(binaryArgs) {
      // assembly/contracts/main/constructor(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.constructor(binaryArgs);
    },
    game_pause(_) {
      // assembly/contracts/main/game_pause(~lib/staticarray/StaticArray<u8>) => void
      _ = __lowerStaticArray(__setU8, 5, 0, _, Uint8Array) || __notnull();
      exports.game_pause(_);
    },
    game_unpause(_) {
      // assembly/contracts/main/game_unpause(~lib/staticarray/StaticArray<u8>) => void
      _ = __lowerStaticArray(__setU8, 5, 0, _, Uint8Array) || __notnull();
      exports.game_unpause(_);
    },
    game_transferAdmin(binaryArgs) {
      // assembly/contracts/main/game_transferAdmin(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_transferAdmin(binaryArgs);
    },
    game_createCharacter(binaryArgs) {
      // assembly/contracts/main/game_createCharacter(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_createCharacter(binaryArgs) >>> 0);
    },
    game_readCharacter(binaryArgs) {
      // assembly/contracts/main/game_readCharacter(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_readCharacter(binaryArgs) >>> 0);
    },
    game_healCharacter(binaryArgs) {
      // assembly/contracts/main/game_healCharacter(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_healCharacter(binaryArgs);
    },
    game_upgradeCharacter(binaryArgs) {
      // assembly/contracts/main/game_upgradeCharacter(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_upgradeCharacter(binaryArgs);
    },
    game_grantXP(binaryArgs) {
      // assembly/contracts/main/game_grantXP(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_grantXP(binaryArgs);
    },
    game_createEquipment(binaryArgs) {
      // assembly/contracts/main/game_createEquipment(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_createEquipment(binaryArgs) >>> 0);
    },
    game_readEquipment(binaryArgs) {
      // assembly/contracts/main/game_readEquipment(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_readEquipment(binaryArgs) >>> 0);
    },
    game_transferEquipment(binaryArgs) {
      // assembly/contracts/main/game_transferEquipment(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_transferEquipment(binaryArgs);
    },
    game_equipItem(binaryArgs) {
      // assembly/contracts/main/game_equipItem(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_equipItem(binaryArgs);
    },
    game_unequipItem(binaryArgs) {
      // assembly/contracts/main/game_unequipItem(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_unequipItem(binaryArgs);
    },
    game_repairEquipment(binaryArgs) {
      // assembly/contracts/main/game_repairEquipment(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_repairEquipment(binaryArgs);
    },
    game_learnSkill(binaryArgs) {
      // assembly/contracts/main/game_learnSkill(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_learnSkill(binaryArgs);
    },
    game_equipSkill(binaryArgs) {
      // assembly/contracts/main/game_equipSkill(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_equipSkill(binaryArgs);
    },
    game_createBattle(binaryArgs) {
      // assembly/contracts/main/game_createBattle(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_createBattle(binaryArgs) >>> 0);
    },
    game_executeTurn(binaryArgs) {
      // assembly/contracts/main/game_executeTurn(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_executeTurn(binaryArgs);
    },
    game_decideWildcard(binaryArgs) {
      // assembly/contracts/main/game_decideWildcard(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_decideWildcard(binaryArgs);
    },
    game_finalizeBattle(binaryArgs) {
      // assembly/contracts/main/game_finalizeBattle(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_finalizeBattle(binaryArgs);
    },
    game_timeoutWildcard(binaryArgs) {
      // assembly/contracts/main/game_timeoutWildcard(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_timeoutWildcard(binaryArgs);
    },
    game_readBattle(binaryArgs) {
      // assembly/contracts/main/game_readBattle(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_readBattle(binaryArgs) >>> 0);
    },
    game_processBattleResults(binaryArgs) {
      // assembly/contracts/main/game_processBattleResults(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_processBattleResults(binaryArgs);
    },
    game_createTournament(binaryArgs) {
      // assembly/contracts/main/game_createTournament(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_createTournament(binaryArgs) >>> 0);
    },
    game_registerForTournament(binaryArgs) {
      // assembly/contracts/main/game_registerForTournament(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_registerForTournament(binaryArgs);
    },
    game_recordTournamentMatch(binaryArgs) {
      // assembly/contracts/main/game_recordTournamentMatch(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_recordTournamentMatch(binaryArgs);
    },
    game_advanceTournamentRound(binaryArgs) {
      // assembly/contracts/main/game_advanceTournamentRound(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_advanceTournamentRound(binaryArgs);
    },
    game_readTournament(binaryArgs) {
      // assembly/contracts/main/game_readTournament(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_readTournament(binaryArgs) >>> 0);
    },
    game_getLeaderboard(binaryArgs) {
      // assembly/contracts/main/game_getLeaderboard(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_getLeaderboard(binaryArgs) >>> 0);
    },
    game_getCharacterRank(binaryArgs) {
      // assembly/contracts/main/game_getCharacterRank(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_getCharacterRank(binaryArgs) >>> 0);
    },
    game_getMMRTier(binaryArgs) {
      // assembly/contracts/main/game_getMMRTier(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_getMMRTier(binaryArgs) >>> 0);
    },
    game_getAchievements(binaryArgs) {
      // assembly/contracts/main/game_getAchievements(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_getAchievements(binaryArgs) >>> 0);
    },
    game_checkAllAchievements(binaryArgs) {
      // assembly/contracts/main/game_checkAllAchievements(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_checkAllAchievements(binaryArgs);
    },
    game_getTreasuryBalance(_) {
      // assembly/contracts/main/game_getTreasuryBalance(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      _ = __lowerStaticArray(__setU8, 5, 0, _, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_getTreasuryBalance(_) >>> 0);
    },
    game_withdrawFromTreasury(binaryArgs) {
      // assembly/contracts/main/game_withdrawFromTreasury(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_withdrawFromTreasury(binaryArgs);
    },
    game_emergencyWithdraw(binaryArgs) {
      // assembly/contracts/main/game_emergencyWithdraw(~lib/staticarray/StaticArray<u8>) => void
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      exports.game_emergencyWithdraw(binaryArgs);
    },
    game_getFeeInfo(_) {
      // assembly/contracts/main/game_getFeeInfo(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      _ = __lowerStaticArray(__setU8, 5, 0, _, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_getFeeInfo(_) >>> 0);
    },
    game_isPaused(_) {
      // assembly/contracts/main/game_isPaused(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      _ = __lowerStaticArray(__setU8, 5, 0, _, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_isPaused(_) >>> 0);
    },
    game_getAdmin(_) {
      // assembly/contracts/main/game_getAdmin(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      _ = __lowerStaticArray(__setU8, 5, 0, _, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_getAdmin(_) >>> 0);
    },
    game_isBattleActive(binaryArgs) {
      // assembly/contracts/main/game_isBattleActive(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      binaryArgs = __lowerStaticArray(__setU8, 5, 0, binaryArgs, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.game_isBattleActive(binaryArgs) >>> 0);
    },
  }, exports);
  function __liftString(pointer) {
    if (!pointer) return null;
    const
      end = pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> 1,
      memoryU16 = new Uint16Array(memory.buffer);
    let
      start = pointer >>> 1,
      string = "";
    while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
    return string + String.fromCharCode(...memoryU16.subarray(start, end));
  }
  function __lowerString(value) {
    if (value == null) return 0;
    const
      length = value.length,
      pointer = exports.__new(length << 1, 2) >>> 0,
      memoryU16 = new Uint16Array(memory.buffer);
    for (let i = 0; i < length; ++i) memoryU16[(pointer >>> 1) + i] = value.charCodeAt(i);
    return pointer;
  }
  function __liftStaticArray(liftElement, align, pointer) {
    if (!pointer) return null;
    const
      length = __getU32(pointer - 4) >>> align,
      values = new Array(length);
    for (let i = 0; i < length; ++i) values[i] = liftElement(pointer + (i << align >>> 0));
    return values;
  }
  function __lowerStaticArray(lowerElement, id, align, values, typedConstructor) {
    if (values == null) return 0;
    const
      length = values.length,
      buffer = exports.__pin(exports.__new(length << align, id)) >>> 0;
    if (typedConstructor) {
      new typedConstructor(memory.buffer, buffer, length).set(values);
    } else {
      for (let i = 0; i < length; i++) lowerElement(buffer + (i << align >>> 0), values[i]);
    }
    exports.__unpin(buffer);
    return buffer;
  }
  function __notnull() {
    throw TypeError("value must not be null");
  }
  let __dataview = new DataView(memory.buffer);
  function __setU8(pointer, value) {
    try {
      __dataview.setUint8(pointer, value, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      __dataview.setUint8(pointer, value, true);
    }
  }
  function __getU8(pointer) {
    try {
      return __dataview.getUint8(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getUint8(pointer, true);
    }
  }
  function __getU32(pointer) {
    try {
      return __dataview.getUint32(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getUint32(pointer, true);
    }
  }
  return adaptedExports;
}
export const {
  memory,
  __new,
  __pin,
  __unpin,
  __collect,
  __rtti_base,
  constructor,
  game_pause,
  game_unpause,
  game_transferAdmin,
  game_createCharacter,
  game_readCharacter,
  game_healCharacter,
  game_upgradeCharacter,
  game_grantXP,
  game_createEquipment,
  game_readEquipment,
  game_transferEquipment,
  game_equipItem,
  game_unequipItem,
  game_repairEquipment,
  game_learnSkill,
  game_equipSkill,
  game_createBattle,
  game_executeTurn,
  game_decideWildcard,
  game_finalizeBattle,
  game_timeoutWildcard,
  game_readBattle,
  game_processBattleResults,
  game_createTournament,
  game_registerForTournament,
  game_recordTournamentMatch,
  game_advanceTournamentRound,
  game_readTournament,
  game_getLeaderboard,
  game_getCharacterRank,
  game_getMMRTier,
  game_getAchievements,
  game_checkAllAchievements,
  game_getTreasuryBalance,
  game_withdrawFromTreasury,
  game_emergencyWithdraw,
  game_getFeeInfo,
  game_isPaused,
  game_getAdmin,
  game_isBattleActive,
} = await (async url => instantiate(
  await (async () => {
    const isNodeOrBun = typeof process != "undefined" && process.versions != null && (process.versions.node != null || process.versions.bun != null);
    if (isNodeOrBun) { return globalThis.WebAssembly.compile(await (await import("node:fs/promises")).readFile(url)); }
    else { return await globalThis.WebAssembly.compileStreaming(globalThis.fetch(url)); }
  })(), {
    massa: __maybeDefault(__import0),
  }
))(new URL("main.wasm", import.meta.url));
function __maybeDefault(module) {
  return typeof module.default === "object" && Object.keys(module).length == 1
    ? module.default
    : module;
}
