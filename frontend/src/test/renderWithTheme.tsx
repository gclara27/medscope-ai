import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";

import { ThemeProvider } from "@/context/ThemeProvider";

export function renderWithTheme(ui: ReactElement, options?: RenderOptions) {
  return render(<ThemeProvider>{ui}</ThemeProvider>, options);
}
