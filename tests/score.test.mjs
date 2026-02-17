import assert from "node:assert/strict";
import test from "node:test";

import {
  createScoreState,
  updateScoreProgress,
  finalizeRunScore,
  startNewRun,
} from "../src/score.mjs";

test("score increases with runner distance traveled", () => {
  const scoreState = createScoreState({ pointsPerMeter: 10 });

  const first = updateScoreProgress(scoreState, 0.5, 14);
  const second = updateScoreProgress(scoreState, 0.5, 14);

  assert.equal(first, 70);
  assert.equal(second, 140);
  assert.equal(scoreState.value, 140);
});

test("score does not increase after finalize", () => {
  const scoreState = createScoreState({ pointsPerMeter: 5 });

  updateScoreProgress(scoreState, 1, 10);
  finalizeRunScore(scoreState);
  const afterGameOver = updateScoreProgress(scoreState, 1, 10);

  assert.equal(afterGameOver, 50);
  assert.equal(scoreState.value, 50);
});

test("best score tracks highest completed run", () => {
  const scoreState = createScoreState({ pointsPerMeter: 1 });

  updateScoreProgress(scoreState, 2, 10);
  finalizeRunScore(scoreState);
  assert.equal(scoreState.bestValue, 20);
  assert.equal(scoreState.value, 20);

  startNewRun(scoreState);
  updateScoreProgress(scoreState, 1.2, 10);
  finalizeRunScore(scoreState);

  assert.equal(scoreState.bestValue, 20);
  assert.equal(scoreState.value, 12);
});
