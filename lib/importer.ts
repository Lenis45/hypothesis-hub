import * as XLSX from "xlsx";
import { DEFAULT_SCALES, calculateRice } from "@/lib/rice";
import { normalizeTitle } from "@/lib/hypotheses";

export type ImportIssue = { sheetName: string; rowNumber: number; reason: string; title?: string };
export type ImportedHypothesis = {
  title: string; normalizedTitle: string; hypothesis?: string; actions?: string; dataMethod?: string;
  expectedUpside?: string; expectedDownside?: string; reachLabel?: string; reachValue?: number;
  impactLabel?: string; impactValue?: number; confidenceLabel?: string; confidenceValue?: number;
  effortLabel?: string; effortValue?: number; score: number | null;
};
export type ImportPreview = { hypotheses: ImportedHypothesis[]; duplicates: ImportedHypothesis[]; issues: ImportIssue[]; skipped: number };

const supportedSheets = new Set(["Идеи", "Идеи этапа воронки 1", "Гипотезы+приоритеты"]);
const byLabel = (options: readonly { label: string; value: number }[], label: unknown) => options.find((item) => item.label === String(label ?? ""));
const text = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : undefined;

export function previewWorkbook(buffer: ArrayBuffer, existingTitles = new Set<string>()): ImportPreview {
  const workbook = XLSX.read(buffer, { type: "array" });
  const hypotheses: ImportedHypothesis[] = [], duplicates: ImportedHypothesis[] = [], issues: ImportIssue[] = [];
  let skipped = 0;
  for (const sheetName of workbook.SheetNames.filter((name) => supportedSheets.has(name))) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], { defval: "", range: sheetName === "Гипотезы+приоритеты" ? 2 : 1 });
    rows.forEach((row, index) => {
      const title = text(row["Идея"]);
      const rowNumber = (sheetName === "Гипотезы+приоритеты" ? 4 : 3) + index;
      if (!title || title === "TBD" || title.includes("#REF!")) { skipped++; return; }
      const reach = byLabel(DEFAULT_SCALES.reach, row["Охват"]);
      const impact = byLabel(DEFAULT_SCALES.impact, row["Влияние"]);
      const confidence = byLabel(DEFAULT_SCALES.confidence, row["Уверенность"]);
      const effort = byLabel(DEFAULT_SCALES.effort, row["Усилия"]);
      const hypothesis: ImportedHypothesis = {
        title, normalizedTitle: normalizeTitle(title), hypothesis: text(row["H (Гипотеза)"]) ?? text(row["Гипотеза"]),
        actions: text(row["A (Список действий)"]), dataMethod: text(row["D (Данные)"]),
        expectedUpside: text(row["I+"]), expectedDownside: text(row["I-"]),
        reachLabel: reach?.label, reachValue: reach?.value, impactLabel: impact?.label, impactValue: impact?.value,
        confidenceLabel: confidence?.label, confidenceValue: confidence?.value, effortLabel: effort?.label, effortValue: effort?.value,
        score: calculateRice(reach?.value, impact?.value, confidence?.value, effort?.value)
      };
      if ([row["Охват"], row["Влияние"], row["Уверенность"], row["Усилия"]].some((value) => text(value)) && (!reach || !impact || !confidence || !effort)) {
        issues.push({ sheetName, rowNumber, reason: "Не удалось распознать одну или несколько RICE-оценок", title });
      }
      if (existingTitles.has(hypothesis.normalizedTitle) || hypotheses.some((item) => item.normalizedTitle === hypothesis.normalizedTitle)) duplicates.push(hypothesis);
      else hypotheses.push(hypothesis);
    });
  }
  return { hypotheses, duplicates, issues, skipped };
}
