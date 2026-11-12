import type Terrain from '@civ-clone/core-terrain/Terrain';

/**
 * A terrain property as a table: one row per terrain class, with that class's value (a movement cost, a defence
 * multiplier, the turns a job takes).
 */
export type TerrainTableRow<Value = number> = [typeof Terrain, Value];

export type TerrainTable<Value = number> = TerrainTableRow<Value>[];

/**
 * The first row of `table` whose class `terrain` is an instance of, or `undefined` if there's none.
 *
 * `instanceof` rather than an identity check on the constructor, so a subclass of a terrain in the table has that
 * terrain's value unless it has a row of its own ahead of it. The row is returned rather than its value so a caller can
 * name what matched (`row[0].name`), which for a subclass is the class in the table, not the terrain's own.
 *
 * Reads `table` on every call, so rows added to it later are seen.
 */
export const terrainRow = <Value>(
  table: TerrainTable<Value>,
  terrain: Terrain
): TerrainTableRow<Value> | undefined =>
  table.find(
    ([TerrainType]: TerrainTableRow<Value>): boolean =>
      terrain instanceof TerrainType
  );

/**
 * The value of `terrain`'s row in `table` (see `terrainRow`), or `null` if it has none.
 */
export const terrainValue = <Value>(
  table: TerrainTable<Value>,
  terrain: Terrain
): Value | null => terrainRow(table, terrain)?.[1] ?? null;

/**
 * A lookup of `table` (see `terrainValue`), cached by the terrain's own constructor, misses included.
 *
 * For a property read on a hot path, such as a movement cost the path finder asks for every tile it considers. Each
 * call makes its own cache, so the cache lives as long as the lookup. The table's rows are read once per terrain class:
 * a row added after a class was looked up isn't seen for that class.
 */
export const cachedTerrainLookup = <Value>(
  table: TerrainTable<Value>
): ((terrain: Terrain) => Value | null) => {
  const cache = new Map<Function, Value | null>();

  return (terrain: Terrain): Value | null => {
    const cached = cache.get(terrain.constructor);

    if (cached !== undefined) {
      return cached;
    }

    const value = terrainValue(table, terrain);

    cache.set(terrain.constructor, value);

    return value;
  };
};
