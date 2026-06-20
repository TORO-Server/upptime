<script setup lang="ts">
// ぷろふぃーる(管理人紹介)。2列テーブルの定番フォーマット。
// 実メールは出さず、れんらくは掲示板(GitHub)へ。
import { computed } from "vue";

const props = defineProps<{ github?: string | null }>();
const discussions = computed(() =>
  props.github
    ? `${props.github}/discussions`
    : "https://github.com/TORO-Server/upptime/discussions"
);

const rows: { k: string; v: string }[] = [
  { k: "なまえ", v: "とろ (管理人)" },
  { k: "せいかく", v: "鯖が落ちてないか毎日ドキドキしてる小心者" },
  { k: "しゅみ", v: "鯖いじり / マイクラ建築 / ログ眺め" },
  { k: "さいきん", v: "10分おきに鯖の生死を見守るのが日課なのれす" },
  { k: "すきなもの", v: "稼働率100% / みどりのランプ / テレホタイム" },
];
</script>

<template>
  <div class="profile">
    <p class="profile__hello">
      はじめまして！当サイトの管理人「とろ」と もうします (^^)<br />
      ここは うちの サーバーたちを 毎日みまもる ヒミツの観測所です。
    </p>
    <table class="profile__table">
      <tbody>
        <tr v-for="(r, i) in rows" :key="i">
          <th>{{ r.k }}</th>
          <td>{{ r.v }}</td>
        </tr>
        <tr>
          <th>れんらく</th>
          <td>
            <a :href="discussions" target="_blank" rel="noopener">けいじばん(GitHub)</a>
            へどうぞ♪<br />
            <span class="profile__note">※直メールはやってません ごめんね m(_ _)m</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.profile {
  color: var(--ink);
  font-size: 0.9rem;
}
.profile__hello {
  margin: 0 0 8px;
}
.profile__table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--rule);
}
.profile__table th,
.profile__table td {
  border: 1px solid var(--rule-soft);
  padding: 5px 8px;
  text-align: left;
  vertical-align: top;
}
.profile__table th {
  width: 7em;
  white-space: nowrap;
  background: var(--paper-alt);
  color: var(--rule);
  font-weight: bold;
}
.profile__note {
  font-size: 0.76rem;
  color: var(--ink-soft);
}
</style>
