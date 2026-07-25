import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { previewWorkbook } from "@/lib/importer";

function workbookBuffer() {
  const book = XLSX.utils.book_new();
  const ideas = XLSX.utils.aoa_to_sheet([
    ["Шаг 1", "Шаг 3"],
    ["Идея", "Баллы", "Охват", "Влияние", "Уверенность", "Усилия"],
    ["Понятная политика возврата", 50, "Около половины", "XL (>20%)", "Вероятно (50%)", "Меньше часа (XS)"],
    ["", "TBD"],
    ["#REF! сломанная строка", "TBD"]
  ]);
  XLSX.utils.book_append_sheet(book, ideas, "Идеи");
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([["Idea"], ["Demo"]]), "ICE");
  return XLSX.write(book, { type: "array", bookType: "xlsx" });
}

describe("table import", () => {
  it("imports real ideas and ignores TBD, #REF! and hidden ICE-like content", () => {
    const preview = previewWorkbook(workbookBuffer());
    expect(preview.hypotheses).toHaveLength(1);
    expect(preview.hypotheses[0]).toMatchObject({ title: "Понятная политика возврата", score: 50 });
    expect(preview.skipped).toBe(2);
  });

  it("moves duplicated normalized titles to the duplicate list", () => {
    const preview = previewWorkbook(workbookBuffer(), new Set(["понятная политика возврата"]));
    expect(preview.hypotheses).toHaveLength(0);
    expect(preview.duplicates).toHaveLength(1);
  });
});
