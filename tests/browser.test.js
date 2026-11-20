import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { today } from "../src/model.js";
const port = 3107,
  base = `http://127.0.0.1:${port}`;
let browser, server;
const errors = [];
test.before(async () => {
  server = spawn(process.execPath, ["server.js"], {
    env: { ...process.env, PORT: String(port) },
    stdio: "pipe",
  });
  await new Promise((resolve, reject) => {
    server.stdout.once("data", resolve);
    server.once("error", reject);
    server.once("exit", (code) => reject(Error(`Server exited: ${code}`)));
  });
  const executablePath =
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
  browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox"],
  });
});
test.after(async () => {
  await browser?.close();
  server?.kill();
});
test("complete campaign → lead → outreach → won sale workflow persists and reports correctly", async () => {
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(base);
  await page
    .getByRole("heading", { name: "A little insight. A lot of potential." })
    .waitFor();
  await page.getByRole("link", { name: "Marketing", exact: true }).click();
  await page.getByRole("button", { name: "Add campaign" }).click();
  await page.getByLabel("Campaign name").fill("Test chef campaign");
  await page.getByLabel("Planned budget").fill("400");
  await page.getByRole("button", { name: "Save record" }).click();
  assert.equal(
    await page.getByRole("heading", { name: "Test chef campaign" }).count(),
    1,
  );
  await page
    .getByRole("link", { name: "Customers & leads", exact: true })
    .click();
  await page.getByRole("button", { name: "Add customer lead" }).click();
  await page.getByLabel("Business name").fill("Test Bistro");
  await page.getByLabel("Contact person").fill("Test Buyer");
  await page.getByLabel("Email", { exact: true }).fill("buyer@example.com");
  await page.getByLabel("Team owner").fill("Victoria");
  await page.getByLabel("Sales stage").selectOption("Qualified");
  await page.getByLabel("Estimated deal value").fill("1800");
  await page
    .getByLabel("Source campaign")
    .selectOption({ label: "Test chef campaign" });
  await page.getByLabel("Inquiry / lead source").fill("Website inquiry");
  await page
    .getByLabel("Next step", { exact: true })
    .fill("Discuss sample order");
  await page.getByLabel("Next follow-up").fill(today());
  await page.getByRole("button", { name: "Save record" }).click();
  await page.getByRole("searchbox").fill("Test Bistro");
  assert.equal(await page.locator("#contact-results tbody tr").count(), 1);
  await page.getByRole("button", { name: "Log outreach", exact: true }).click();
  await page
    .getByLabel("Conversation notes")
    .fill("Buyer asked about domestic supply.");
  await page.getByLabel("Result").selectOption("Interested");
  await page
    .getByLabel("Next step", { exact: true })
    .fill("Prepare supply discussion");
  await page.getByRole("button", { name: "Save record" }).click();
  await page.getByRole("button", { name: "Test Bistro", exact: true }).click();
  assert.equal(
    await page
      .getByText("Buyer asked about domestic supply.", { exact: true })
      .count(),
    1,
  );
  assert.equal(
    await page.getByText("Prepare supply discussion", { exact: true }).count(),
    1,
  );
  await page.getByRole("button", { name: "Edit customer lead" }).click();
  await page.getByLabel("Phone").fill("555-0100");
  await page.getByRole("button", { name: "Save record" }).click();
  await page.getByRole("link", { name: "Sales pipeline", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Stage for Test Bistro", exact: true })
    .selectOption("Won");
  await page.getByRole("link", { name: "Marketing", exact: true }).click();
  const card = page
    .locator(".campaign")
    .filter({
      has: page.getByRole("heading", {
        name: "Test chef campaign",
        exact: true,
      }),
    });
  assert.match(await card.textContent(), /1Leads1Opportunities1Won/);
  const attribution = page
    .getByRole("row")
    .filter({
      has: page.getByRole("button", { name: "Test Bistro", exact: true }),
    });
  assert.match(await attribution.textContent(), /\$1,800/);
  await page.reload();
  assert.match(
    await page
      .locator(".campaign")
      .filter({
        has: page.getByRole("heading", {
          name: "Test chef campaign",
          exact: true,
        }),
      })
      .textContent(),
    /1Won/,
  );
  await page
    .getByRole("link", { name: "Outreach & follow-ups", exact: true })
    .click();
  assert.equal(
    await page
      .locator("#followup-results")
      .getByRole("button", { name: "Test Bistro" })
      .count(),
    0,
  );
  await page
    .getByRole("combobox", { name: "Filter follow-ups" })
    .selectOption("due");
  assert.equal(await page.locator("#followup-results tbody tr").count(), 0);
  await page
    .getByRole("link", { name: "Customers & leads", exact: true })
    .click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup" }).click();
  assert.match((await download).suggestedFilename(), /^wishbones-backup-/);
  assert.deepEqual(errors, []);
  await page.close();
});
test("input is rendered as text, empty filters work, and mobile layout stays within viewport", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(base + "/#contacts");
  await page.getByRole("button", { name: "Add customer lead" }).click();
  await page.getByLabel("Business name").fill("<img src=x onerror=alert(1)>");
  await page.getByRole("button", { name: "Save record" }).click();
  assert.equal(await page.locator("#main img").count(), 0);
  await page
    .getByRole("button", { name: "<img src=x onerror=alert(1)>", exact: true })
    .waitFor();
  await page.getByRole("searchbox").fill("no matches");
  assert.match(
    await page.locator("#contact-results").textContent(),
    /No customer leads match/,
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await page.screenshot({ path: "/tmp/wishbones-mobile.png", fullPage: true });
  await page.close();
});
test("static server does not expose repository metadata or source-only files", async () => {
  for (const path of [
    "/.git/config",
    "/package.json",
    "/tests/model.test.js",
    "/server.js",
    "/src/../../package.json",
  ]) {
    assert.equal((await fetch(base + path)).status, 404, path);
  }
  assert.equal((await fetch(base + "/src/app.js")).status, 200);
});

test("dashboard loads under the GitHub Pages repository path", async () => {
  const page = await browser.newPage();
  const prefix = "/MGMT-3450-Team-4/";
  const missing = [];
  await page.route(base + "/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (!path.startsWith(prefix)) {
      missing.push(path);
      await route.fulfill({status: 404, body: "Outside the published project"});
      return;
    }
    const response = await route.fetch({url: base + path.slice(prefix.length - 1)});
    await route.fulfill({response});
  });
  await page.goto(base + prefix);
  await page.getByRole("heading", {name: "A little insight. A lot of potential."}).waitFor();
  assert.equal(await page.locator("body").evaluate(el => getComputedStyle(el).backgroundColor), "rgb(247, 246, 241)");
  await page.getByRole("link", {name: "Marketing", exact: true}).click();
  await page.getByRole("heading", {name: "Chef introduction series", exact: true}).waitFor();
  assert.deepEqual(missing, []);
  await page.close();
});

test("researched prospects expose product fit, official contacts, sources, and enforce two-sentence explanations", async () => {
  const page = await browser.newPage();
  await page.goto(base + '/#contacts');
  assert.equal(await page.locator('#contact-results tbody tr').count(), 100);
  await page.getByRole('combobox', { name: 'Filter by customer type' }).selectOption('Design & events');
  assert.equal(await page.locator('#contact-results tbody tr').count(), 4);
  await page.getByRole('combobox', { name: 'Filter by product category' }).selectOption('Feathers & Design');
  await page.getByRole('button', { name: 'Moonlight Feather', exact: true }).click();
  await page.getByRole('heading', { name: 'Public research sources' }).waitFor();
  assert.ok(await page.locator('#editor a[href="https://moonlightfeather.com/policies/contact-information"]').count());
  assert.match(await page.locator('#editor').textContent(), /supplementary feather source/);
  await page.getByRole('button', { name: 'Edit customer lead', exact: true }).click();
  const rationale = page.getByLabel('Why this business could be a customer (max 2 sentences)');
  await rationale.fill('First sentence. Second sentence. Third sentence.');
  await page.getByRole('button', { name: 'Save record', exact: true }).click();
  assert.match(await page.locator('#form-error').textContent(), /no more than two sentences/);
  await rationale.fill('It sells craft feathers. Wishbones could offer an additional supply option.');
  await page.getByLabel('Team owner').fill('Research team');
  await page.getByRole('button', { name: 'Save record', exact: true }).click();
  await page.reload();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('wishbones.workspace.v1')));
  const prospect = saved.contacts.find(c => c.business === 'Moonlight Feather');
  assert.equal(prospect.owner, 'Research team');
  assert.equal(prospect.whyPotential, 'It sells craft feathers. Wishbones could offer an additional supply option.');
  assert.ok(prospect.sourceUrls.length);
  assert.equal(saved.contacts.length, 100);
  // URL fields are user-editable; unsupported protocols must never create executable links.
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('wishbones.workspace.v1'));
    state.contacts.find(c => c.business === 'Moonlight Feather').website = 'javascript:alert(1)';
    localStorage.setItem('wishbones.workspace.v1', JSON.stringify(state));
  });
  await page.reload();
  assert.equal(await page.locator('a[href^="javascript:"]').count(), 0);
  await page.close();
});

test("saved Ohio businesses are removed while California edits and outreach survive reload", async () => {
  const { sampleWorkspace } = await import('./fixtures/sample-workspace.js');
  const { californiaProspects } = await import('../src/prospects.js');
  const old = sampleWorkspace();
  const retained = { ...californiaProspects[0], owner: 'Saved California owner' };
  old.contacts.push(retained);
  old.activities.push({ id: 'saved-ca-activity', contactId: retained.id, date: '2026-11-19', channel: 'Other', result: 'Awaiting reply', notes: 'Saved California activity', owner: 'Saved California owner' });
  const page = await browser.newPage();
  await page.addInitScript(state => {
    if (!localStorage.getItem('wishbones.workspace.v1')) localStorage.setItem('wishbones.workspace.v1', JSON.stringify(state));
  }, old);
  await page.goto(base + '/#contacts');
  assert.equal(await page.locator('#contact-results tbody tr').count(), 100);
  await page.reload();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('wishbones.workspace.v1')));
  assert.equal(saved.contacts.length, 100);
  assert.equal(saved.contacts.find(c => c.id === retained.id).owner, 'Saved California owner');
  assert.deepEqual(saved.activities.map(a => a.id), ['saved-ca-activity']);
  assert.ok(saved.contacts.every(c => !old.contacts.slice(0, 6).some(o => o.id === c.id)));
  await page.close();
});
