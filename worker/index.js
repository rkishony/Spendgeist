import { PRICING_PATH, RAW_PRICING, STATS_PATH, isInstallId, recordInstall } from "./installs.mjs";

async function listInstalls(kv) {
  const installs = [];
  let cursor;
  do {
    const page = await kv.list({ cursor, limit: 1000 });
    for (const key of page.keys) {
      const rec = await kv.get(key.name, "json");
      if (rec) installs.push({ id: key.name, first: rec.first, last: rec.last, n: rec.n });
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  installs.sort((a, b) => String(a.first).localeCompare(String(b.first)));
  return installs;
}

async function remember(kv, iid) {
  const prev = await kv.get(iid, "json");
  const next = recordInstall(prev, new Date().toISOString());
  await kv.put(iid, JSON.stringify(next));
  return next;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === STATS_PATH) {
      if (!env.ADMIN_TOKEN || request.headers.get("Authorization") !== `Bearer ${env.ADMIN_TOKEN}`) {
        return new Response("unauthorized", { status: 401 });
      }
      const installs = await listInstalls(env.INSTALLS);
      return Response.json({ unique: installs.length, installs });
    }
    if (url.pathname !== PRICING_PATH) {
      return new Response("not found", { status: 404 });
    }
    const iid = url.searchParams.get("iid");
    if (isInstallId(iid)) {
      try {
        await remember(env.INSTALLS, iid);
      } catch (error) {
        console.log(`install record failed: ${error && error.message}`);
      }
    }
    const upstream = await fetch(RAW_PRICING, { cf: { cacheTtl: 300 } });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=300",
        "access-control-allow-origin": "*",
      },
    });
  },
};
