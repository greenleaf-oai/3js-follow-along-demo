export function createScoreState({ pointsPerMeter = 1 } = {}) {
  return {
    distanceTravelled: 0,
    value: 0,
    isFinished: false,
    bestValue: 0,
    pointsPerMeter,
  };
}

export function updateScoreProgress(scoreState, deltaTime, forwardSpeed) {
  if (scoreState.isFinished) {
    return scoreState.value;
  }

  const safeDelta = Math.max(0, Number(deltaTime) || 0);
  const safeSpeed = Math.max(0, Number(forwardSpeed) || 0);
  scoreState.distanceTravelled += safeDelta * safeSpeed;

  const nextScore = Math.floor(scoreState.distanceTravelled * scoreState.pointsPerMeter);
  if (nextScore > scoreState.value) {
    scoreState.value = nextScore;
  }

  return scoreState.value;
}

export function finalizeRunScore(scoreState) {
  scoreState.isFinished = true;
  if (scoreState.value > scoreState.bestValue) {
    scoreState.bestValue = scoreState.value;
  }

  return scoreState.value;
}

export function startNewRun(scoreState) {
  scoreState.distanceTravelled = 0;
  scoreState.value = 0;
  scoreState.isFinished = false;
}
