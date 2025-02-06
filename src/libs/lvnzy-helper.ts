import posthog from "posthog-js";
import { env } from "./constants";
import { useLocation } from "react-router-dom";

export const nestedPropertyAccessor = (
  record: any,
  keys: string | string[]
) => {
  if (Array.isArray(keys)) {
    return keys.reduce(
      (obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined),
      record
    );
  } else {
    return record[keys];
  }
};

export function useUrlParams() {
  return new URLSearchParams(useLocation().search);
}

export const capitalize = (input: string) => {
  if (!input) {
    return "";
  }
  return input.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export const rupeeAmountFormat = (amt: string) => {
  const amtNum = parseInt(amt);
  if (!amtNum || isNaN(amtNum)) {
    return amt;
  }
  const val = Math.abs(amtNum);
  if (val >= 10000000) return `${(amtNum / 10000000).toFixed(2)} Crs`;
  if (val >= 100000) return `${(amtNum / 100000).toFixed(2)} Lacs`;
  return amtNum;
};

export const captureAnalyticsEvent = (event: string, props: any) => {
  if (env == "production") {
    try {
      posthog.capture(event, props || {});
    } catch (err: any) {
      console.warn("error while logging posthog event: ", err);
    }
  }
};
