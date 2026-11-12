import { TerrainJob, multipleOf, terrainJobTurns } from '../lib/jobTurns';
import {
  TerrainTable,
  cachedTerrainLookup,
  terrainRow,
  terrainValue,
} from '../lib/terrainTable';
import Terrain from '@civ-clone/core-terrain/Terrain';
import { expect } from 'chai';

class Flat extends Terrain {}
class Rough extends Terrain {}
class Steep extends Rough {}
class Wet extends Terrain {}

class Dig {}
class Pave {}
class Drain {}
class Survey {}

describe('terrainTable', (): void => {
  const table: TerrainTable = [
    [Flat, 1],
    [Rough, 2],
  ];

  it('finds the first row whose class the terrain is an instance of', (): void => {
    expect(terrainRow(table, new Flat())).to.equal(table[0]);
    expect(terrainRow(table, new Rough())).to.equal(table[1]);
  });

  it("matches a subclass to its parent's row, named after the parent", (): void => {
    const row = terrainRow(table, new Steep());

    expect(row).to.equal(table[1]);
    expect(row![0].name).to.equal('Rough');
    expect(terrainValue(table, new Steep())).to.equal(2);
  });

  it('prefers an earlier row', (): void => {
    expect(
      terrainValue(
        [
          [Steep, 3],
          [Rough, 2],
        ],
        new Steep()
      )
    ).to.equal(3);
    expect(
      terrainValue(
        [
          [Rough, 2],
          [Steep, 3],
        ],
        new Steep()
      )
    ).to.equal(2);
  });

  it('has no row or value for a terrain not in the table', (): void => {
    expect(terrainRow(table, new Wet())).to.be.undefined;
    expect(terrainValue(table, new Wet())).to.be.null;
  });

  it('keeps a value of 0', (): void => {
    expect(terrainValue([[Flat, 0]], new Flat())).to.equal(0);
  });

  it('reads the table on every call', (): void => {
    const growing: TerrainTable = [[Flat, 1]];

    expect(terrainValue(growing, new Wet())).to.be.null;

    growing.push([Wet, 4]);

    expect(terrainValue(growing, new Wet())).to.equal(4);
  });
});

describe('cachedTerrainLookup', (): void => {
  it('gives the same values as terrainValue', (): void => {
    const table: TerrainTable = [
        [Flat, 1],
        [Rough, 2],
      ],
      lookup = cachedTerrainLookup(table);

    [new Flat(), new Rough(), new Steep(), new Wet()].forEach(
      (terrain: Terrain): void =>
        expect(lookup(terrain)).to.equal(terrainValue(table, terrain))
    );
  });

  it('caches by constructor, misses included', (): void => {
    const table: TerrainTable = [[Flat, 1]],
      lookup = cachedTerrainLookup(table);

    expect(lookup(new Flat())).to.equal(1);
    expect(lookup(new Wet())).to.be.null;

    table.length = 0;
    table.push([Flat, 5], [Wet, 6]);

    expect(lookup(new Flat())).to.equal(1);
    expect(lookup(new Wet())).to.be.null;
    expect(lookup(new Rough())).to.be.null;
  });

  it('keeps a cache per lookup', (): void => {
    const table: TerrainTable = [[Flat, 1]],
      first = cachedTerrainLookup(table);

    expect(first(new Flat())).to.equal(1);

    table[0] = [Flat, 2];

    expect(first(new Flat())).to.equal(1);
    expect(cachedTerrainLookup(table)(new Flat())).to.equal(2);
  });
});

describe('terrainJobTurns', (): void => {
  const moveCost: TerrainTable = [
      [Flat, 1],
      [Rough, 2],
    ],
    jobs: TerrainJob<typeof Dig>[] = [
      [
        Dig,
        [
          [Flat, 5],
          [Rough, 10],
        ],
      ],
      [Pave, multipleOf((terrain) => terrainValue(moveCost, terrain), 2)],
      [Drain, (): number => 4],
    ];

  it('is one fewer than the table, which counts the turn the order is given on', (): void => {
    expect(terrainJobTurns(jobs, Dig, new Flat())).to.equal(4);
    expect(terrainJobTurns(jobs, Dig, new Rough())).to.equal(9);
    expect(terrainJobTurns(jobs, Dig, new Steep())).to.equal(9);
  });

  it('takes a function of the terrain', (): void => {
    expect(terrainJobTurns(jobs, Pave, new Flat())).to.equal(1);
    expect(terrainJobTurns(jobs, Pave, new Rough())).to.equal(3);
    expect(terrainJobTurns(jobs, Drain, new Wet())).to.equal(3);
  });

  it('is null for a terrain the job has no time on', (): void => {
    expect(terrainJobTurns(jobs, Dig, new Wet())).to.be.null;
    expect(terrainJobTurns(jobs, Pave, new Wet())).to.be.null;
  });

  it('is null for a job not in the table', (): void => {
    expect(terrainJobTurns(jobs, Survey, new Flat())).to.be.null;
  });

  it('matches the job by identity, not by subclass', (): void => {
    class DeepDig extends Dig {}

    expect(terrainJobTurns(jobs, DeepDig, new Flat())).to.be.null;
  });

  it('uses the first row for a job', (): void => {
    expect(
      terrainJobTurns(
        [
          [Dig, (): number => 2],
          [Dig, (): number => 7],
        ],
        Dig,
        new Flat()
      )
    ).to.equal(1);
  });
});

describe('multipleOf', (): void => {
  it('multiplies the lookup, keeping null', (): void => {
    const double = multipleOf(
      (terrain: Terrain): number | null => (terrain instanceof Flat ? 3 : null),
      2
    );

    expect(double(new Flat())).to.equal(6);
    expect(double(new Wet())).to.be.null;
  });
});
