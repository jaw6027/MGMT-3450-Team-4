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
  assert.equal(populated.contacts.length, 10);
  assert.equal(californiaProspects.length, 4);
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
  assert.equal(populated.contacts.length, 10);
  assert.equal(populated.contacts.find(c => c.id === 'user-added').owner, 'Existing owner');
  populated.contacts.find(c => c.id === californiaProspects[1].id).business = 'Edited branch name';
  assert.equal(addCaliforniaProspects(populated), populated);
  assert.equal(populated.contacts.find(c => c.id === californiaProspects[1].id).business, 'Edited branch name');
});
