# base-terrain-properties

Terrain properties as tables keyed by terrain class, as a library for a ruleset's rules. The ruleset owns the tables
(its numbers) and the rules that read them; this package has the lookups, so rulesets share them.

- `lib/terrainTable`:
  - `TerrainTable<Value>`, rows of `[TerrainClass, value]`: a movement cost, a defence multiplier and so on.
  - `terrainRow(table, terrain)`, the first row whose class `terrain` is an instance of (a subclass gets its parent's
    row), or `undefined`. The row, so a caller can name the class that matched.
  - `terrainValue(table, terrain)`, that row's value, or `null`.
  - `cachedTerrainLookup(table)`, a `terrainValue` lookup cached by the terrain's constructor, for hot paths such as
    movement costs.
- `lib/jobTurns`:
  - `TerrainJob<Job>`, a row of `[job, time]`, where `time` is a `TerrainTable` of turns or a function of the terrain.
    The turns count the turn the order is given on.
  - `terrainJobTurns(jobs, job, terrain)`, the turns `job` keeps a unit busy on `terrain`: one fewer than the table's
    figure, because a delayed action started on turn T is done at the start of turn T + turns. `null` where the job has
    no time.
  - `multipleOf(lookup, factor)`, a job time that is a multiple of another property, such as twice the movement cost.

A library: it registers no rules and has no `main`. See `civ1-unit` for Civilization's tables.
