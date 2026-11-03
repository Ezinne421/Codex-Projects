import { appearance, themeOptions } from "./theme";
function mount() {
  const header = document.querySelector("header .buttons");
  if (!header) return;
  const store = appearance(),
    label = document.createElement("label"),
    select = document.createElement("select");
  label.className = "offline-theme";
  label.append("Theme ");
  select.setAttribute("aria-label", "Colour theme");
  for (const theme of themeOptions) {
    const option = document.createElement("option");
    option.value = theme.id;
    option.textContent = theme.name;
    select.append(option);
  }
  select.value = store.get();
  select.addEventListener("change", () => {
    const choice = themeOptions.find((t) => t.id === select.value);
    if (choice) store.set(choice.id);
  });
  store.subscribe(() => {
    select.value = store.get();
  });
  label.append(select);
  header.prepend(label);
}
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", mount, { once: true });
else mount();
