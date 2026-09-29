export const INSTALL_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const PRICING_PATH = "/extension/pricing.json";
export const STATS_PATH = "/extension/installs";
export const RAW_PRICING = "https://raw.githubusercontent.com/rkishony/Spendgeist/main/extension/pricing.json";

export function isInstallId(value) {
  return INSTALL_ID.test(String(value || ""));
}

export function recordInstall(prev, now) {
  return {
    first: prev && prev.first ? prev.first : now,
    last: now,
    n: (Number(prev && prev.n) || 0) + 1,
  };
}
