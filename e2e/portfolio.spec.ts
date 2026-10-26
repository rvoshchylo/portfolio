import { expect, test, type Page } from "@playwright/test";

const errorsOf = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
};

test("boot plays through the device intro and lands on the desktop", async ({ page, isMobile }) => {
  const errors = errorsOf(page);
  await page.goto("/?boot");
  const boot = page.getByTestId("boot");
  await expect(boot).toBeVisible();
  await expect(boot).toHaveAttribute("data-device", isMobile ? "phone" : "laptop");
  await expect(boot).toHaveAttribute("data-stage", "brand", { timeout: 4000 });
  await expect(boot).toHaveAttribute("data-stage", "login", { timeout: 4000 });
  await expect(page.getByTestId("boot").getByText("Ruslan Voshchylo")).toBeVisible();
  await expect(boot).toBeHidden({ timeout: 8000 });
  await expect(page.getByTestId("desktop")).toBeVisible();
  await expect(page.getByText("Ruslan.portfolio")).toBeVisible();
  expect(errors).toEqual([]);
});

for (const [name, viewport] of [
  ["landscape", { width: 1024, height: 768 }],
  ["portrait", { width: 820, height: 1180 }],
] as const) {
  test(`tablet-width screens get the tablet intro (${name})`, async ({ page, isMobile }) => {
    test.skip(isMobile, "viewport override only on the desktop project");
    const errors = errorsOf(page);
    await page.setViewportSize(viewport);
    await page.goto("/?boot");
    const boot = page.getByTestId("boot");
    await expect(boot).toHaveAttribute("data-device", "tablet");
    await expect(boot).toHaveAttribute("data-stage", "login", { timeout: 6000 });
    await expect(boot).toBeHidden({ timeout: 8000 });
    await expect(page.getByTestId("desktop")).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("any key skips the intro, and it is not replayed in the same session", async ({ page }) => {
  await page.goto("/?boot");
  await expect(page.getByTestId("boot")).toBeVisible();
  await page.waitForTimeout(400);
  await page.keyboard.press("Space");
  await expect(page.getByTestId("boot")).toBeHidden({ timeout: 2000 });
  await page.goto("/");
  await expect(page.getByTestId("desktop")).toBeVisible();
  await expect(page.getByTestId("boot")).toHaveCount(0);
});

test("every app opens from the dock with CV content", async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto("/?skip");
  const checks: [string, string, RegExp][] = [
    ["about", "about.exe", /DKK 280M\+/],
    ["experience", "experience.exe", /SoftKit/],
    ["projects", "projects.exe", /gogeta/],
    ["skills", "skills.exe", /NestJS/],
    ["contact", "contact.exe", /ruslan\.voshchylo2@gmail\.com/],
  ];
  for (const [id, title, text] of checks) {
    await page.click(`[data-dock="${id}"]`);
    const win = page.getByRole("dialog", { name: title });
    await expect(win).toBeVisible();
    await expect(win.getByText(text).first()).toBeVisible();
    await win.getByRole("button", { name: `close ${title}` }).click();
    await expect(win).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("project cards open a detail view and come back", async ({ page }) => {
  await page.goto("/?skip#projects");
  const win = page.getByRole("dialog", { name: "projects.exe" });
  await win.getByRole("button", { name: /aksel/ }).click();
  await expect(win.getByText(/PCI DSS-compliant car insurance/)).toBeVisible();
  await win.getByRole("button", { name: "Back to all projects" }).click();
  await expect(win.getByRole("button", { name: /teach-aid/ })).toBeVisible();
});

test("experience deep-links into projects", async ({ page }) => {
  await page.goto("/?skip#experience");
  await page.getByRole("dialog", { name: "experience.exe" }).getByRole("button", { name: /gogeta/ }).click();
  await expect(page.getByRole("dialog", { name: "projects.exe" }).getByText(/63 Mailgun transactional templates/)).toBeVisible();
});

test("terminal runs commands and can open windows", async ({ page }) => {
  await page.goto("/?skip#terminal");
  const input = page.getByLabel("terminal input");
  await input.fill("whoami");
  await input.press("Enter");
  await expect(page.getByTestId("terminal")).toContainText("Ruslan Voshchylo — Full-Stack Developer");
  await input.fill("open ski");
  await input.press("Tab");
  await expect(input).toHaveValue("open skills");
  await input.press("Enter");
  await expect(page.getByRole("dialog", { name: "skills.exe" })).toBeVisible();
});

test("contact form validates and builds a mailto draft", async ({ page }) => {
  await page.goto("/?skip#contact");
  const win = page.getByRole("dialog", { name: "contact.exe" });
  await win.getByRole("button", { name: "send →" }).click();
  await expect(win.getByText("name is required")).toBeVisible();
  await win.getByLabel("name").fill("Jane Recruiter");
  await win.getByLabel("email").fill("jane@company.com");
  await win.getByLabel("message").fill("We'd love to talk about a backend role.");
  await win.getByRole("button", { name: "send →" }).click();
  await expect(win.getByText("draft ready in your mail app")).toBeVisible();
});

test("windows drag, minimize to the dock and restore (desktop only)", async ({ page, isMobile }) => {
  test.skip(isMobile, "windows are full-screen on phones");
  await page.goto("/?skip#about");
  const win = page.getByRole("dialog", { name: "about.exe" });
  // let the spring-in animation finish so boundingBox is unscaled
  await win.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  const before = (await win.boundingBox())!;
  await page.mouse.move(before.x + 120, before.y + 16);
  await page.mouse.down();
  await page.mouse.move(before.x + 320, before.y + 116, { steps: 8 });
  await page.mouse.up();
  const after = (await win.boundingBox())!;
  expect(Math.round(after.x - before.x)).toBe(200);
  expect(Math.round(after.y - before.y)).toBe(100);

  await win.getByRole("button", { name: "minimize about.exe" }).click();
  await expect(win).toBeHidden();
  await page.click('[data-dock="about"]');
  await expect(win).toBeVisible();
});

test("desktop icons open on double-click (desktop) / tap (mobile)", async ({ page, isMobile }) => {
  await page.goto("/?skip");
  const icon = page.locator('[data-icon="skills"]');
  if (isMobile) await icon.tap();
  else await icon.dblclick();
  await expect(page.getByRole("dialog", { name: "skills.exe" })).toBeVisible();
});

test("résumé PDF is served", async ({ request }) => {
  const res = await request.get("/Ruslan_Voshchylo_CV.pdf");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("pdf");
});

test("no horizontal overflow on the desktop", async ({ page }) => {
  await page.goto("/?skip#about");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("references window shows the mentor letter and links the signed PDF", async ({ page, request }) => {
  const errors = errorsOf(page);
  await page.goto("/?skip#experience");
  await page.getByRole("dialog", { name: "experience.exe" }).getByRole("button", { name: /reference letter/ }).click();
  const win = page.getByRole("dialog", { name: "references.exe" });
  await expect(win.getByText("Vladimir Fedorchenko")).toBeVisible();
  await expect(win.getByText("8–9 / 10")).toBeVisible();
  await win.getByRole("button", { name: /read full letter/ }).click();
  await expect(win.getByText(/proven himself to be a responsible/)).toBeVisible();
  const pdf = await request.get("/Reference_Letter_Ruslan_Voshchylo.pdf");
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("pdf");
  expect(errors).toEqual([]);
});
