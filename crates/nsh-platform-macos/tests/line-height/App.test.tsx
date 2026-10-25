// Run on AppKit: nsh test <this directory> --target macos.
import { expect, open, test } from "nsh/test";
import type { App } from "nsh/test";

function metric(app: App, name: string): number {
  return Number(app.texts().find((text) => text.startsWith(`${name}: `))?.split(": ")[1]);
}

function expectLine(app: App, height: number) {
  // AppKit's caret rect excludes part of the font's descent. Check its
  // native geometry, allowing that difference from the paragraph height.
  expect(Math.abs(metric(app, "Caret height") - height) <= 4).toBe(true);
  expect(Math.abs(metric(app, "Caret center") - 32) <= 2).toBe(true);
}

test("single-line height changes preserve focus, selection and input events", async () => {
  const app = await open("./App.tsx");
  await app.type("id:line", "");
  expectLine(app, 32);
  await app.type("id:line", "abc");
  expectLine(app, 32);
  await app.press("id:height48");
  expect(app.texts()).toContain("Focus: true");
  expectLine(app, 48);
  expect(app.texts()).toContain("Selection: 3-3");
  await app.press("id:height16");
  expectLine(app, 16);
  await app.press("id:natural");
  expectLine(app, 19);
  await app.press("id:height32");
  expectLine(app, 32);
  expect(app.texts()).toContain("Changes: 3");
});

test("programmatic values, password toggles and shared field editors keep their line height", async () => {
  const app = await open("./App.tsx");
  await app.type("id:line", "abc");
  await app.press("id:replace");
  expect(app.value("id:line")).toBe("Replaced");
  expect(app.texts()).toContain("Changes: 3");
  expectLine(app, 32);
  await app.type("id:other", "");
  expect(Math.abs(metric(app, "Other caret height") - 19) <= 2).toBe(true);
  await app.type("id:line", "");
  expectLine(app, 32);
  await app.press("id:mask");
  expect(app.value("id:line")).toBe("Replaced");
  expect(app.texts()).toContain("Focus: true");
  expectLine(app, 32);
  await app.type("id:line", "x");
  expect(app.value("id:line")).toBe("Replacedx");
  expectLine(app, 32);
  await app.press("id:mask");
  expect(app.value("id:line")).toBe("Replacedx");
  expectLine(app, 32);
});

test("pasting and clearing preserve styling and multiline paragraphs still use their line height", async () => {
  const app = await open("./App.tsx");
  await app.paste("id:line", { text: "First\nSecond" });
  expect(app.value("id:line")).toBe("First Second");
  expectLine(app, 32);
  await app.clear("id:line");
  expect(app.value("id:line")).toBe("");
  expectLine(app, 32);
  await app.paste("id:line", { text: "你好🙂" });
  expect(app.value("id:line")).toBe("你好🙂");
  expectLine(app, 32);
  await app.clear("id:line");
  await app.type("id:multiline", "First");
  const firstLine = metric(app, "Multiline caret y");
  await app.type("id:multiline", "\nSecond");
  const secondLine = metric(app, "Multiline caret y");
  expect(Math.abs(secondLine - firstLine - 32) <= 1).toBe(true);
  await app.type("id:multiline", "\nThird");
  expect(app.value("id:multiline")).toBe("First\nSecond\nThird");
  const lastLine = metric(app, "Multiline caret y");
  expect(Math.abs(lastLine - secondLine - 32) <= 1).toBe(true);
  await app.press("id:height48");
  expect(metric(app, "Multiline caret y") > lastLine + 20).toBe(true);
  expect(app.texts()).toContain("Multiline changes: 18");
});

test("unfocused values and styles are restored when editing starts", async () => {
  const app = await open("./App.tsx");
  await app.press("id:replace");
  await app.press("id:height48");
  expect(app.texts()).toContain("Focus: false");
  expect(app.texts()).toContain("Changes: 0");
  await app.type("id:line", "x");
  expect(app.value("id:line")).toBe("Replacedx");
  expectLine(app, 48);
  expect(app.texts()).toContain("Changes: 1");
});


test("multiline wrapping and trailing empty lines keep native paragraph heights", async () => {
  const app = await open("./App.tsx");
  await app.setViewport(200, 1000);
  await app.type("id:multiline", "First line");
  const firstLine = metric(app, "Multiline caret y");
  await app.type("id:multiline", " Second line Third line");
  expect(Math.abs(metric(app, "Multiline caret y") - firstLine - 32) <= 1).toBe(true);
  await app.clear("id:multiline");
  await app.type("id:multiline", "First");
  const beforeNewline = metric(app, "Multiline caret y");
  await app.type("id:multiline", "\n");
  expect(app.value("id:multiline")).toBe("First\n");
  expect(Math.abs(metric(app, "Multiline caret y") - beforeNewline - 32) <= 1).toBe(true);
  await app.press("id:height24");
  await app.clear("id:multiline");
  await app.type("id:multiline", "First");
  const resizedFirst = metric(app, "Multiline caret y");
  await app.type("id:multiline", "\nSecond");
  expect(Math.abs(metric(app, "Multiline caret y") - resizedFirst - 24) <= 1).toBe(true);
});
