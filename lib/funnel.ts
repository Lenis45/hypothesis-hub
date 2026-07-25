export function stageDeletionSummary(hypothesisCount: number) {
  const safeCount = Math.max(0, Math.trunc(hypothesisCount));
  return {
    hypothesisCount: safeCount,
    detachesHypotheses: safeCount > 0,
    message: safeCount > 0
      ? `На этом этапе ${safeCount} ${safeCount === 1 ? "гипотеза" : "гипотезы"}. Они останутся в реестре, но будут без этапа воронки.`
      : "На этапе нет гипотез. Его можно удалить без потери контекста."
  };
}
