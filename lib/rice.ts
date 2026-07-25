export type ScaleOption = { label: string; value: number };

export const DEFAULT_SCALES = {
  reach: [
    { label: "Большинство/Все", value: 10 },
    { label: "Около половины", value: 5 },
    { label: "Узкий сегмент", value: 2 }
  ],
  impact: [
    { label: "S (<5%)", value: 3 }, { label: "M (5-10%)", value: 5 },
    { label: "L (10-20%)", value: 10 }, { label: "XL (>20%)", value: 20 }
  ],
  confidence: [
    { label: "Гарантированно (80%)", value: 0.8 }, { label: "Вероятно (50%)", value: 0.5 },
    { label: "Возможно (25%)", value: 0.25 }, { label: "Рискованно (10%)", value: 0.1 }
  ],
  effort: [
    { label: "Меньше часа (XS)", value: 1 }, { label: "Несколько дней (S)", value: 2 },
    { label: "1-2 недели (M)", value: 5 }, { label: "месяц+ (L)", value: 20 },
    { label: "квартал+ (XL)", value: 60 }
  ]
} as const satisfies Record<string, readonly ScaleOption[]>;

export function calculateRice(reach?: number | null, impact?: number | null, confidence?: number | null, effort?: number | null) {
  if (![reach, impact, confidence, effort].every((value) => typeof value === "number") || !effort || effort <= 0) return null;
  return Number(((reach! * impact! * confidence!) / effort).toFixed(2));
}

export function riceExplanation(score: number | null) {
  if (score === null) return "Заполните все четыре критерия, чтобы увидеть приоритет.";
  if (score >= 25) return "Сильный кандидат: высокий ожидаемый эффект при разумных усилиях.";
  if (score >= 8) return "Перспективная гипотеза: сравните её с ближайшими альтернативами.";
  return "Низкий относительный приоритет: это не доказательство, а сигнал для обсуждения.";
}
