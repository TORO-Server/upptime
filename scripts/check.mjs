#!/usr/bin/env node
// TORO Status — custom uptime checker (no external dependencies)
//
// Runs every cron tick: performs a Minecraft Server List Ping (SLP) for
// `minecraft` sites and an HTTP request for `http` sites, appends the result to
// each site's rolling history, recomputes uptime / response-time aggregates, and
// writes the data the Vue front-end reads from `frontend/public/data/`.
//
// Usage: node scripts/check.mjs

import net from "node:net";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = path.join(ROOT, "config", "sites.json");
const DATA_DIR = path.join(ROOT, "frontend", "public", "data");
const HISTORY_DIR = path.join(DATA_DIR, "history");

const DAY = 86400; // seconds

// ---------------------------------------------------------------------------
// Minecraft Server List Ping (status) — gives up/down, latency, and players
// ---------------------------------------------------------------------------

function writeVarInt(value) {
  const bytes = [];
  let v = value;
  do {
    let temp = v & 0x7f;
    v >>>= 7;
    if (v !== 0) temp |= 0x80;
    bytes.push(temp);
  } while (v !== 0);
  return Buffer.from(bytes);
}

function readVarInt(buf, offset) {
  let numRead = 0;
  let result = 0;
  let byte;
  do {
    if (offset + numRead >= buf.length) return null; // need more bytes
    byte = buf[offset + numRead];
    result |= (byte & 0x7f) << (7 * numRead);
    numRead++;
    if (numRead > 5) throw new Error("VarInt too big");
  } while ((byte & 0x80) !== 0);
  return { value: result >>> 0, size: numRead };
}

function buildHandshake(host, port) {
  const hostBuf = Buffer.from(host, "utf8");
  const payload = Buffer.concat([
    Buffer.from([0x00]), // packet id: handshake
    writeVarInt(47), // protocol version (any; server reports its own)
    writeVarInt(hostBuf.length),
    hostBuf,
    Buffer.from([(port >> 8) & 0xff, port & 0xff]), // unsigned short, big-endian
    writeVarInt(1), // next state: status
  ]);
  return Buffer.concat([writeVarInt(payload.length), payload]);
}

const STATUS_REQUEST = Buffer.concat([writeVarInt(1), Buffer.from([0x00])]);

function parseStatusResponse(buf) {
  const lenField = readVarInt(buf, 0);
  if (!lenField) return null;
  const totalNeeded = lenField.size + lenField.value;
  if (buf.length < totalNeeded) return null; // wait for the full packet

  let off = lenField.size;
  const pid = readVarInt(buf, off);
  if (!pid) return null;
  off += pid.size;

  const strLen = readVarInt(buf, off);
  if (!strLen) return null;
  off += strLen.size;

  const jsonBytes = buf.subarray(off, off + strLen.value);
  if (jsonBytes.length < strLen.value) return null;

  try {
    const json = JSON.parse(jsonBytes.toString("utf8"));
    return {
      players: json.players
        ? { online: json.players.online ?? null, max: json.players.max ?? null }
        : null,
      version: json.version?.name ?? null,
    };
  } catch {
    return { players: null, version: null }; // responded, but odd payload — still up
  }
}

function minecraftPing(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const start = performance.now();
    let settled = false;
    let connected = false;
    let chunks = Buffer.alloc(0);

    const socket = net.createConnection({ host, port });
    socket.setTimeout(timeoutMs);

    const finish = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.on("connect", () => {
      connected = true;
      socket.write(Buffer.concat([buildHandshake(host, port), STATUS_REQUEST]));
    });

    socket.on("data", (d) => {
      chunks = Buffer.concat([chunks, d]);
      try {
        const parsed = parseStatusResponse(chunks);
        if (parsed) {
          finish({
            up: true,
            responseTime: Math.round(performance.now() - start),
            players: parsed.players,
            version: parsed.version,
          });
        }
      } catch (e) {
        finish({ up: false, responseTime: null, error: String(e.message || e) });
      }
    });

    socket.on("timeout", () =>
      finish({ up: false, responseTime: null, error: "timeout" })
    );
    socket.on("error", (e) =>
      finish({ up: false, responseTime: null, error: e.code || e.message })
    );
    socket.on("close", () => {
      // Connected but closed before a parseable status: treat as up (TCP reachable).
      if (connected) {
        finish({
          up: true,
          responseTime: Math.round(performance.now() - start),
          players: null,
          version: null,
        });
      } else {
        finish({ up: false, responseTime: null, error: "closed" });
      }
    });
  });
}

// ---------------------------------------------------------------------------
// HTTP check
// ---------------------------------------------------------------------------

async function httpCheck(url, timeoutMs) {
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "User-Agent": "TORO-Status/1.0 (+https://status.torosaba.net)",
      },
    });
    // Drain the body so the connection can close cleanly.
    await res.arrayBuffer().catch(() => {});
    const responseTime = Math.round(performance.now() - start);
    return {
      up: res.status >= 200 && res.status < 400,
      responseTime,
      code: res.status,
    };
  } catch (e) {
    return {
      up: false,
      responseTime: null,
      error: e.name === "TimeoutError" ? "timeout" : e.cause?.code || e.message,
    };
  }
}

// ---------------------------------------------------------------------------
// Aggregation helpers
// ---------------------------------------------------------------------------

function uptimeOf(points, sinceSec) {
  const within = sinceSec ? points.filter((p) => p.t >= sinceSec) : points;
  if (within.length === 0) return null;
  const available = within.filter((p) => p.s !== "down").length;
  return Math.round((available / within.length) * 10000) / 100; // 2 decimals
}

function avgRtOf(points, sinceSec) {
  const within = (sinceSec ? points.filter((p) => p.t >= sinceSec) : points).filter(
    (p) => typeof p.r === "number"
  );
  if (within.length === 0) return null;
  return Math.round(within.reduce((s, p) => s + p.r, 0) / within.length);
}

function dailyBars(points, days, nowSec) {
  // Per-UTC-day uptime fraction for the last `days` days (oldest -> newest).
  const bars = [];
  const todayStart = Math.floor(nowSec / DAY) * DAY;
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = todayStart - i * DAY;
    const dayEnd = dayStart + DAY;
    const inDay = points.filter((p) => p.t >= dayStart && p.t < dayEnd);
    bars.push({
      date: new Date(dayStart * 1000).toISOString().slice(0, 10),
      uptime: inDay.length
        ? Math.round((inDay.filter((p) => p.s !== "down").length / inDay.length) * 10000) / 100
        : null,
    });
  }
  return bars;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function main() {
  const config = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));
  const settings = config.settings ?? {};
  const timeoutMs = settings.timeoutMs ?? 10000;
  const retentionDays = settings.retentionDays ?? 30;
  const degradedMs = settings.degradedThresholdMs ?? 3000;

  await fs.mkdir(HISTORY_DIR, { recursive: true });

  const nowSec = Math.floor(Date.now() / 1000);
  const cutoff = nowSec - retentionDays * DAY;

  const summarySites = await Promise.all(
    config.sites.map(async (site) => {
      const check =
        site.type === "minecraft"
          ? await minecraftPing(site.host, site.port, timeoutMs)
          : await httpCheck(site.url, timeoutMs);

      let status = "down";
      if (check.up) {
        status =
          typeof check.responseTime === "number" && check.responseTime > degradedMs
            ? "degraded"
            : "up";
      }

      const point = { t: nowSec, s: status, r: check.responseTime ?? null };
      if (site.type === "minecraft" && check.players) {
        point.p = check.players.online;
      }

      // Load + update rolling history for this site.
      const historyFile = path.join(HISTORY_DIR, `${site.slug}.json`);
      const prev = await readJson(historyFile, { slug: site.slug, points: [] });
      const points = (prev.points || []).filter((p) => p.t >= cutoff);
      points.push(point);

      await fs.writeFile(
        historyFile,
        JSON.stringify({ slug: site.slug, name: site.name, points }),
        "utf8"
      );

      const target =
        site.type === "minecraft" ? `${site.host}:${site.port}` : site.url;

      return {
        slug: site.slug,
        name: site.name,
        type: site.type,
        icon: site.icon ?? null,
        target,
        url: site.type === "http" ? site.url : null,
        status,
        responseTime: check.responseTime ?? null,
        players: site.type === "minecraft" ? check.players : null,
        version: check.version ?? null,
        lastChecked: new Date(nowSec * 1000).toISOString(),
        error: check.up ? null : check.error ?? null,
        uptime: {
          "24h": uptimeOf(points, nowSec - DAY),
          "7d": uptimeOf(points, nowSec - 7 * DAY),
          "30d": uptimeOf(points, nowSec - 30 * DAY),
          all: uptimeOf(points, null),
        },
        avgResponseTime: {
          "24h": avgRtOf(points, nowSec - DAY),
          "7d": avgRtOf(points, nowSec - 7 * DAY),
          "30d": avgRtOf(points, nowSec - 30 * DAY),
          all: avgRtOf(points, null),
        },
        // Embedded views so the front-end only needs summary.json.
        sparkline: points.slice(-48).map((p) => (p.s === "down" ? null : p.r)),
        bars: dailyBars(points, 30, nowSec),
      };
    })
  );

  const summary = {
    name: config.name,
    intro: config.intro ?? null,
    logoUrl: config.logoUrl ?? null,
    github: config.github ?? null,
    generatedAt: new Date(nowSec * 1000).toISOString(),
    sites: summarySites,
  };

  await fs.writeFile(
    path.join(DATA_DIR, "summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8"
  );

  // Console report for CI logs.
  for (const s of summarySites) {
    const extra =
      s.type === "minecraft" && s.players
        ? ` players=${s.players.online}/${s.players.max}`
        : "";
    console.log(
      `${s.status === "up" ? "🟩" : s.status === "degraded" ? "🟨" : "🟥"} ${s.name} — ${s.status} ${
        s.responseTime != null ? s.responseTime + "ms" : "-"
      }${extra}${s.error ? ` (${s.error})` : ""}`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
