import { TerrainTable, terrainValue } from './terrainTable';
import type Terrain from '@civ-clone/core-terrain/Terrain';

/**
 * How long a job takes on a terrain: a table of turns by terrain class, or a function of the terrain (`null` where the
 * job has no time).
 */
export type TerrainJobTime =
  | TerrainTable<number>
  | ((terrain: Terrain) => number | null);

/**
 * A job (usually a unit action class) and how many turns it takes, counting the turn the order is given on.
 */
export type TerrainJob<Job> = [Job, TerrainJobTime];

/**
 * The turns `job` keeps a unit busy on `terrain`, or `null` if `jobs` has no row for `job` or the job has no time on
 * that terrain. `jobs` is matched by identity on the job and by the first `instanceof` row on the terrain.
 *
 * One fewer than the figure in `jobs`, which counts the turn the order is given on: a delayed action started on turn T
 * finishes at the start of turn T + turns, so a job of 2 turns is done at the start of the next turn.
 */
export const terrainJobTurns = <Job>(
  jobs: TerrainJob<Job>[],
  job: Job,
  terrain: Terrain
): number | null => {
  const row = jobs.find(
    ([JobType]: TerrainJob<Job>): boolean => JobType === job
  );

  if (row === undefined) {
    return null;
  }

  const [, time] = row,
    turns =
      typeof time === 'function' ? time(terrain) : terrainValue(time, terrain);

  return turns === null ? null : turns - 1;
};

/**
 * A job time that is `factor` times another terrain property (a movement cost, say), or `null` where that is `null`.
 */
export const multipleOf =
  (
    lookup: (terrain: Terrain) => number | null,
    factor: number
  ): ((terrain: Terrain) => number | null) =>
  (terrain: Terrain): number | null => {
    const value = lookup(terrain);

    return value === null ? null : factor * value;
  };
