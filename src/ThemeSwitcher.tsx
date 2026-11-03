import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Check, Palette, X } from "lucide-react";
import { appearance, themeOptions } from "./theme";
export default function ThemeSwitcher() {
  const store = appearance();
  const selected = useSyncExternalStore(store.subscribe, store.get);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div
      className="theme-switcher"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className="theme-trigger"
        aria-label="Colour theme"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        title="Change colour theme"
      >
        <Palette size={18} />
        <span>Theme</span>
      </button>
      {open && (
        <section
          id={id}
          className="theme-popover"
          aria-label="Choose your colour theme"
        >
          <div className="theme-popover-heading">
            <div>
              <span className="eyebrow">MAKE IT YOURS</span>
              <h2>Colour theme</h2>
            </div>
            <button
              aria-label="Close theme picker"
              className="icon-button"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <X size={18} />
            </button>
          </div>
          <fieldset>
            <legend className="sr-only">Choose a colour theme</legend>
            {themeOptions.map((theme) => (
              <label className="theme-option" key={theme.id}>
                <input
                  type="radio"
                  name={id + "-theme"}
                  value={theme.id}
                  checked={selected === theme.id}
                  onChange={() => store.set(theme.id)}
                />
                <span className="theme-swatches" aria-hidden="true">
                  {theme.swatches.map((colour) => (
                    <i key={colour} style={{ background: colour }} />
                  ))}
                </span>
                <span className="theme-option-copy">
                  <strong>{theme.name}</strong>
                  <small>{theme.note}</small>
                </span>
                {selected === theme.id && (
                  <Check size={17} aria-hidden="true" />
                )}
              </label>
            ))}
          </fieldset>
          <p className="theme-storage" role="status">
            {store.persistent()
              ? "Saved in this browser · applies across the app."
              : "Applies for this session. Browser storage is unavailable."}
          </p>
        </section>
      )}
    </div>
  );
}
