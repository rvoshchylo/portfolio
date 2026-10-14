import { describe, expect, it } from "vitest";
import { choreoFor, pickDevice } from "./devices";

describe("boot device", () => {
  it("picks phone / tablet / laptop by viewport width", () => {
    expect(pickDevice(390)).toBe("phone");
    expect(pickDevice(767)).toBe("phone");
    expect(pickDevice(768)).toBe("tablet");
    expect(pickDevice(1199)).toBe("tablet");
    expect(pickDevice(1200)).toBe("laptop");
  });

  it("orients the tablet like the viewport", () => {
    const portrait = choreoFor("tablet", 820, 1180).geometry;
    const landscape = choreoFor("tablet", 1024, 768).geometry;
    expect(portrait.h).toBeGreaterThan(portrait.w);
    expect(landscape.w).toBeGreaterThan(landscape.h);
  });

  it("keeps every device on screen at its smallest supported viewport", () => {
    const cases: [ReturnType<typeof pickDevice>, number, number][] = [
      ["phone", 360, 640],
      ["tablet", 768, 1024],
      ["tablet", 1024, 600],
      ["laptop", 1280, 720],
    ];
    for (const [kind, vw, vh] of cases) {
      const c = choreoFor(kind, vw, vh);
      const f = c.fit(vw, vh);
      expect(c.geometry.w * f).toBeLessThan(vw);
      expect(c.geometry.h * f).toBeLessThan(vh);
    }
  });
});
