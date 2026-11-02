import { createRoot, type Root } from "react-dom/client";
import LearningHub, { type LearningSection } from "./LearningHub";
let root: Root | null = null;
let current: Parameters<typeof LearningHub>[0] | null = null;
export function mount(
  node: HTMLElement,
  props: Parameters<typeof LearningHub>[0],
) {
  unmount();
  current = props;
  root = createRoot(node);
  root.render(<LearningHub {...props} />);
}
export function showSection(section: LearningSection) {
  if (root && current) {
    current = { ...current, section };
    root.render(<LearningHub {...current} />);
  }
}
export function unmount() {
  root?.unmount();
  root = null;
  current = null;
}
