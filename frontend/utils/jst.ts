// 日本時間(JST)での日付整形ヘルパー。
// summary.json の generatedAt / lastChecked は UTC(Z付き)なので、閲覧者の
// タイムゾーンに関わらず Asia/Tokyo で表示する。当時の個人サイト風に
// 「2026/06/19(金) 21:25」形式へ。

const TZ = "Asia/Tokyo";

interface JstParts {
  year: string;
  month: string;
  day: string;
  weekday: string; // 例: 金
  hour: string;
  minute: string;
}

function parts(d: Date): JstParts {
  const fmt = new Intl.DateTimeFormat("ja-JP", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(d)) map[p.type] = p.value;
  return {
    year: map["year"] ?? "----",
    month: map["month"] ?? "--",
    day: map["day"] ?? "--",
    weekday: map["weekday"] ?? "",
    // ja-JP の hour は稀に "24" を返すので丸める。
    hour: (map["hour"] === "24" ? "00" : map["hour"]) ?? "--",
    minute: map["minute"] ?? "--",
  };
}

function dateOf(iso: string | number | Date): Date {
  return iso instanceof Date ? iso : new Date(iso);
}

/** 2026/06/19(金) */
export function fmtDateJp(iso: string | number | Date): string {
  const p = parts(dateOf(iso));
  return `${p.year}/${p.month}/${p.day}(${p.weekday})`;
}

/** 2026/06/19(金) 21:25 */
export function fmtDateTimeJp(iso: string | number | Date): string {
  const p = parts(dateOf(iso));
  return `${p.year}/${p.month}/${p.day}(${p.weekday}) ${p.hour}:${p.minute}`;
}

/** 2026年6月19日(金) 21時25分 — 時計表示向けの和文 */
export function fmtClockJp(iso: string | number | Date): string {
  const p = parts(dateOf(iso));
  const m = String(Number(p.month));
  const day = String(Number(p.day));
  return `${p.year}年${m}月${day}日(${p.weekday}) ${Number(p.hour)}時${p.minute}分`;
}

/** JST基準の YYYY-MM-DD（カウンターの日別キー用） */
export function jstDayKey(iso: string | number | Date = new Date()): string {
  const p = parts(dateOf(iso));
  return `${p.year}-${p.month}-${p.day}`;
}

/** from から to までの経過日数（開設○日目の算出に使用） */
export function daysBetween(
  fromIso: string | number | Date,
  toIso: string | number | Date = new Date()
): number {
  const day = 86400000;
  const a = Math.floor(dateOf(fromIso).getTime() / day);
  const b = Math.floor(dateOf(toIso).getTime() / day);
  return Math.max(0, b - a);
}
