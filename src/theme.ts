export const themeOptions = [
  {
    id: "signature",
    name: "Signature Plum",
    note: "Plum, warm paper & citrus",
    swatches: ["#42295e", "#f7f5ef", "#dbed84"],
  },
  {
    id: "forest",
    name: "Forest & Sand",
    note: "Evergreen, ivory & warm gold",
    swatches: ["#174d3e", "#f7f4eb", "#e7ca83"],
  },
  {
    id: "atlantic",
    name: "Atlantic Blue",
    note: "Deep blue, cool white & sky",
    swatches: ["#173e69", "#f2f6fa", "#b6ddf3"],
  },
  {
    id: "midnight",
    name: "Midnight",
    note: "Dark ink, lilac & soft lime",
    swatches: ["#17151f", "#cabbf1", "#dbe8a2"],
  },
  {
    id: "system",
    name: "Follow device",
    note: "Light or dark, automatically",
    swatches: ["#f7f5ef", "#17151f"],
  },
] as const;
export type ThemePreference = (typeof themeOptions)[number]["id"];
const storageKey = "pm-appearance-v1";
const changeEvent = "pm-appearance-change";
type Appearance = {
  get: () => ThemePreference;
  set: (value: ThemePreference) => void;
  subscribe: (listener: () => void) => () => void;
  persistent: () => boolean;
};
declare global {
  interface Window {
    PMAppearance?: Appearance;
  }
}
function valid(value: unknown): value is ThemePreference {
  return themeOptions.some((theme) => theme.id === value);
}
export function appearance(): Appearance {
  if (window.PMAppearance) return window.PMAppearance;
  let preference: ThemePreference = "signature",
    saved = true;
  try {
    const stored = localStorage.getItem(storageKey);
    if (valid(stored)) preference = stored;
  } catch {
    saved = false;
  }
  const device = window.matchMedia("(prefers-color-scheme: dark)");
  function apply() {
    const resolved =
      preference === "system"
        ? device.matches
          ? "midnight"
          : "signature"
        : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = preference;
    document.documentElement.style.colorScheme =
      resolved === "midnight" ? "dark" : "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute(
      "content",
      {
        signature: "#42295e",
        forest: "#174d3e",
        atlantic: "#173e69",
        midnight: "#17151f",
      }[resolved],
    );
    window.dispatchEvent(new Event(changeEvent));
  }
  const store: Appearance = {
    get: () => preference,
    persistent: () => saved,
    set: (value) => {
      if (!valid(value)) return;
      preference = value;
      try {
        localStorage.setItem(storageKey, value);
        saved = true;
      } catch {
        saved = false;
      }
      apply();
    },
    subscribe: (listener) => {
      window.addEventListener(changeEvent, listener);
      return () => window.removeEventListener(changeEvent, listener);
    },
  };
  window.PMAppearance = store;
  device.addEventListener("change", () => {
    if (preference === "system") apply();
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = valid(event.newValue) ? event.newValue : "signature";
    apply();
  });
  apply();
  return store;
}
if (typeof window !== "undefined") appearance();
