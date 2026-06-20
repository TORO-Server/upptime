// 訪問者カウンター（本日/昨日/累計）— 90年代個人サイトの定番。
// バックエンドが無いので localStorage で素朴に数える。複数コンポーネント
// (カウンター本体・キリ番通知) から参照するため、増加は初回読み込みの
// 一度きりになるようモジュールスコープのシングルトンにしている。

import { ref, type Ref } from "vue";
import { jstDayKey } from "../utils/jst.ts";

// 「あなたは○人目」を寂しくしないための下駄（あくまで雰囲気装置）。
const BASE_TOTAL = 13337;
const KEY_TOTAL = "toro-status-visits";
const KEY_DAYS = "toro-status-visit-days";

const total: Ref<number> = ref(BASE_TOTAL);
const today: Ref<number> = ref(0);
const yesterday: Ref<number> = ref(0);
let initialized = false;

function init(): void {
  initialized = true;
  try {
    const rawTotal = Number(localStorage.getItem(KEY_TOTAL) ?? "0") || 0;
    const nextTotal = rawTotal + 1;
    localStorage.setItem(KEY_TOTAL, String(nextTotal));
    total.value = BASE_TOTAL + nextTotal;

    const days = JSON.parse(localStorage.getItem(KEY_DAYS) ?? "{}") as Record<
      string,
      number
    >;
    const tk = jstDayKey();
    const yk = jstDayKey(new Date(Date.now() - 86400000));
    const todayCount = (days[tk] ?? 0) + 1;
    const yesterdayCount = days[yk] ?? 0;
    today.value = todayCount;
    yesterday.value = yesterdayCount;
    // 当日・前日だけ残して肥大化を防ぐ。
    localStorage.setItem(
      KEY_DAYS,
      JSON.stringify({ [tk]: todayCount, [yk]: yesterdayCount })
    );
  } catch {
    // localStorage 不可（プライベートモード等）でも表示は壊さない。
    total.value = BASE_TOTAL + 1;
    today.value = 1;
    yesterday.value = 0;
  }
}

export interface VisitorCount {
  total: Ref<number>;
  today: Ref<number>;
  yesterday: Ref<number>;
}

export function useVisitorCount(): VisitorCount {
  if (!initialized) init();
  return { total, today, yesterday };
}
