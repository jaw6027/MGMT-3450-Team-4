import test from "node:test";
import assert from "node:assert/strict";
import {
  seed,
  validateState,
  metrics,
  campaignStats,
  isDue,
  today,
  shiftDate,
} from "../src/model.js";
test("sample workspace is internally consistent and clearly fictional", () => {
  const s = seed();
  assert.equal(validateState(s), true);
  assert.equal(s.contacts.length, 6);
  assert.ok(
    s.contacts.every(
      (c) =>
        c.business.includes("(sample)") && c.email.endsWith("@example.com"),
    ),
  );
  assert.equal(new Set(s.contacts.map((c) => c.type)).size, 4);
});
test("open pipeline excludes unqualified and closed deal values", () => {
  const s = seed();
  s.contacts.find((c) => c.stage === "New").value = 90000;
  assert.deepEqual(metrics(s), {
    leads: 6,
    open: 2,
    pipeline: 7200,
    won: 1250,
    due: 2,
  });
});
test("campaign attribution follows lead source and updated deal stages", () => {
  const s = seed();
  assert.deepEqual(campaignStats(s, "m1"), {
    leads: 2,
    opportunities: 2,
    won: 1,
    revenue: 1250,
  });
  s.contacts[0].stage = "Won";
  assert.deepEqual(campaignStats(s, "m1"), {
    leads: 2,
    opportunities: 2,
    won: 2,
    revenue: 3650,
  });
  assert.deepEqual(campaignStats(s, "missing"), {
    leads: 0,
    opportunities: 0,
    won: 0,
    revenue: 0,
  });
});
test("follow-ups include today and overdue, but exclude future and closed leads", () => {
  const c = { stage: "Contacted", followUp: today() };
  assert.equal(isDue(c), true);
  assert.equal(isDue({ ...c, followUp: shiftDate(-1) }), true);
  assert.equal(isDue({ ...c, followUp: shiftDate(1) }), false);
  assert.equal(isDue({ ...c, followUp: "" }), false);
  assert.equal(isDue({ ...c, stage: "Won" }), false);
  assert.equal(isDue({ ...c, stage: "Lost" }), false);
});
test("saved state validation rejects broken references and invalid values", () => {
  const s = seed();
  s.contacts[0].campaignId = "missing";
  assert.equal(validateState(s), false);
  s.contacts[0].campaignId = "m1";
  s.contacts[0].value = -1;
  assert.equal(validateState(s), false);
  s.contacts[0].value = 0;
  s.activities[0].contactId = "missing";
  assert.equal(validateState(s), false);
  assert.equal(validateState(null), false);
});

test("California prospects are valid uncontacted records and retain source evidence", async () => {
  const { addCaliforniaProspects, californiaProspects } = await import('../src/prospects.js');
  const populated = addCaliforniaProspects(seed());
  assert.equal(validateState(populated), true);
  assert.equal(populated.contacts.length, 106);
  assert.equal(californiaProspects.length, 100);
  for (const c of californiaProspects) {
    assert.equal(c.stage, 'New');
    assert.equal(c.value, 0);
    assert.equal(c.product, 'Other');
    assert.equal(c.campaignId, '');
    assert.equal(c.followUp, '');
    assert.match(c.notes, /https:\/\//);
    assert.match(c.notes, /not a customer; no contact made/);
  }
  assert.deepEqual(populated.activities, seed().activities);
});

test("California population is repeatable and preserves saved edits and matching businesses", async () => {
  const { addCaliforniaProspects, californiaProspects } = await import('../src/prospects.js');
  const original = seed();
  original.contacts.push({ ...californiaProspects[0], id: 'user-added', owner: 'Existing owner' });
  const populated = addCaliforniaProspects(original);
  assert.equal(original.contacts.length, 7);
  assert.equal(populated.contacts.length, 106);
  assert.equal(populated.contacts.find(c => c.id === 'user-added').owner, 'Existing owner');
  populated.contacts.find(c => c.id === californiaProspects[1].id).business = 'Edited branch name';
  assert.equal(addCaliforniaProspects(populated), populated);
  assert.equal(populated.contacts.find(c => c.id === californiaProspects[1].id).business, 'Edited branch name');
});

test("all 100 prospects have organized public sources, contact routes, and concise benefit explanations", async () => {
  const { californiaProspects } = await import('../src/prospects.js');
  const { PRODUCT_CATEGORIES, validRationale } = await import('../src/model.js');
  assert.equal(new Set(californiaProspects.map(c => c.id)).size, 100);
  assert.equal(new Set(californiaProspects.map(c => c.business.toLowerCase())).size, 100);
  for (const c of californiaProspects) {
    assert.equal(new URL(c.website).protocol, 'https:');
    assert.ok(c.email || c.phone || c.contactUrl, c.business);
    assert.ok(c.fitCategory && c.whyPotential && c.reviewedOn, c.business);
    assert.ok(PRODUCT_CATEGORIES.includes(c.productCategory), c.business);
    assert.equal(validRationale(c.whyPotential), true, c.business);
    assert.ok(c.sourceUrls.length > 0, c.business);
    for (const url of c.sourceUrls) assert.equal(new URL(url).protocol, 'https:');
  }
  assert.equal(californiaProspects.filter(c => ['Restaurant', 'Grocery', 'Specialty butcher', 'Distributor'].includes(c.type)).length, 80);
  assert.equal(validRationale('One sentence. Two sentences. Three sentences.'), false);
  assert.equal(validRationale('x'.repeat(601)), false);
});

test("catalog upgrades add research columns without replacing saved decisions or explicit edits", async () => {
  const { californiaProspects, addCaliforniaProspects } = await import('../src/prospects.js');
  const saved = seed();
  const prior = structuredClone(californiaProspects.slice(0, 9));
  for (const c of prior) {
    for (const key of ['website', 'contactUrl', 'productCategory', 'fitCategory', 'whyPotential', 'reviewedOn', 'sourceUrls']) delete c[key];
  }
  prior[0].stage = 'Contacted';
  prior[0].owner = 'Saved team owner';
  prior[0].notes = 'User research';
  prior[1].whyPotential = 'A saved rationale.';
  prior[1].website = '';
  saved.contacts.push(...prior);
  const upgraded = addCaliforniaProspects(saved);
  assert.equal(upgraded.contacts.length, 106);
  const c = upgraded.contacts.find(c => c.id === prior[0].id);
  assert.equal(c.owner, 'Saved team owner');
  assert.equal(c.stage, 'Contacted');
  assert.equal(c.notes, 'User research');
  assert.equal(c.website, californiaProspects[0].website);
  assert.equal(upgraded.contacts.find(c => c.id === prior[1].id).website, '');
  assert.equal(upgraded.contacts.find(c => c.id === prior[1].id).whyPotential, 'A saved rationale.');
  assert.equal(addCaliforniaProspects(upgraded), upgraded);
  assert.equal(saved.contacts.length, 15);
});
