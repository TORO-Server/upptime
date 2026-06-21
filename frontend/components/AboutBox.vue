<script setup lang="ts">
// このサイトについて（運営者情報・監視方式）。企業公式として中立・敬体。
const props = defineProps<{ github?: string | null }>();
const discussions = computed(() =>
  props.github
    ? `${props.github}/discussions`
    : "https://github.com/TORO-Server/upptime/discussions"
);

const rows: { k: string; v: string }[] = [
  { k: "目的", v: "TORO サーバーで提供する各サービスの稼働状況の公開" },
  { k: "監視間隔", v: "10分間隔での自動チェック（GitHub Actions）" },
  {
    k: "監視方式",
    v: "Minecraft Server List Ping ／ HTTP ヘルスチェック",
  },
  { k: "運営", v: "TORO サーバー運営チーム" },
];
</script>

<template>
  <div class="about">
    <p class="about__lead">
      本ページは、TORO サーバーで提供する各サービスの稼働状況をリアルタイムに監視・公開する公式ステータスページです。障害や遅延が発生した場合は、本ページに反映されます。
    </p>
    <table class="about__table">
      <tbody>
        <tr v-for="(r, i) in rows" :key="i">
          <th>{{ r.k }}</th>
          <td>{{ r.v }}</td>
        </tr>
        <tr>
          <th>お問い合わせ</th>
          <td>
            <a :href="discussions" target="_blank" rel="noopener">GitHub Discussions</a>
            よりお願いいたします。
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.about {
  color: var(--ink);
  font-size: 0.9rem;
}
.about__lead {
  margin: 0 0 8px;
  line-height: 1.8;
}
.about__table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--rule);
}
.about__table th,
.about__table td {
  border: 1px solid var(--rule-soft);
  padding: 5px 8px;
  text-align: left;
  vertical-align: top;
}
.about__table th {
  width: 8em;
  white-space: nowrap;
  background: var(--paper-alt);
  color: var(--rule);
  font-weight: bold;
}

@media (max-width: 540px) {
  .about__table,
  .about__table tbody,
  .about__table tr,
  .about__table th,
  .about__table td {
    display: block;
    width: 100%;
  }
  .about__table tr {
    border-bottom: 2px solid var(--rule);
  }
  .about__table tr:last-child {
    border-bottom: 0;
  }
  .about__table th {
    background: var(--paper-alt);
    border-bottom: 0;
    padding-bottom: 2px;
  }
  .about__table td {
    border-top: 0;
    padding-top: 2px;
    padding-bottom: 8px;
  }
}
</style>
