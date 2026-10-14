import { createContext, useContext } from "react";

export type AppParams = Record<string, unknown> & { nonce?: number };

export type DesktopApi = {
  open: (id: string, params?: AppParams) => void;
  close: (id: string) => void;
  openUrl: (href: string) => void;
  params: (id: string) => AppParams | undefined;
  restart: () => void;
};

export const DesktopContext = createContext<DesktopApi>({
  open: () => {},
  close: () => {},
  openUrl: () => {},
  params: () => undefined,
  restart: () => {},
});

export const useDesktop = () => useContext(DesktopContext);

export function openExternal(href: string) {
  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    window.location.href = href;
  } else {
    window.open(href, "_blank", "noopener,noreferrer");
  }
}
