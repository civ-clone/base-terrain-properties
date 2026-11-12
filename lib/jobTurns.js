"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multipleOf = exports.terrainJobTurns = void 0;
const terrainTable_1 = require("./terrainTable");
/**
 * The turns `job` keeps a unit busy on `terrain`, or `null` if `jobs` has no row for `job` or the job has no time on
 * that terrain. `jobs` is matched by identity on the job and by the first `instanceof` row on the terrain.
 *
 * One fewer than the figure in `jobs`, which counts the turn the order is given on: a delayed action started on turn T
 * finishes at the start of turn T + turns, so a job of 2 turns is done at the start of the next turn.
 */
const terrainJobTurns = (jobs, job, terrain) => {
    const row = jobs.find(([JobType]) => JobType === job);
    if (row === undefined) {
        return null;
    }
    const [, time] = row, turns = typeof time === 'function' ? time(terrain) : (0, terrainTable_1.terrainValue)(time, terrain);
    return turns === null ? null : turns - 1;
};
exports.terrainJobTurns = terrainJobTurns;
/**
 * A job time that is `factor` times another terrain property (a movement cost, say), or `null` where that is `null`.
 */
const multipleOf = (lookup, factor) => (terrain) => {
    const value = lookup(terrain);
    return value === null ? null : factor * value;
};
exports.multipleOf = multipleOf;
//# sourceMappingURL=jobTurns.js.map