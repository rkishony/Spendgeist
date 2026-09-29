import assert from "node:assert/strict";
import test from "node:test";
import { isInstallId, recordInstall } from "./installs.mjs";

test("recordInstall keeps the first time and counts fetches", () => {
  const first = recordInstall(null, "2026-09-29T10:00:00.000Z");
  assert.deepEqual(first, { first: "2026-09-29T10:00:00.000Z", last: "2026-09-29T10:00:00.000Z", n: 1 });
  const next = recordInstall(first, "2026-09-29T12:00:00.000Z");
  assert.deepEqual(next, { first: "2026-09-29T10:00:00.000Z", last: "2026-09-29T12:00:00.000Z", n: 2 });
});

test("isInstallId accepts a uuid", () => {
  assert.equal(isInstallId("018f6b2e-7b4a-7c3d-8e9f-0a1b2c3d4e5f"), true);
  assert.equal(isInstallId("nope"), false);
});
