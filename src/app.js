import { addCaliforniaProspects } from "./prospects.js";
import {
  TYPES,
  STAGES,
  PRODUCTS,
  money,
  today,
  dateLabel,
  metrics,
  campaignStats,
  seed,
  validateState,
  isDue,
} from "./model.js";
const KEY = "wishbones.workspace.v1";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
const $ = (s) => document.querySelector(s);
let state,
  storageError = false;
try {
  const saved = localStorage.getItem(KEY);
  state = saved ? JSON.parse(saved) : seed();
  if (!validateState(state)) throw Error("Invalid saved data");
} catch {
  storageError = true;
  state = seed();
}
let page = "overview",
  search = "",
  typeFilter = "",
  stageFilter = "",
  followFilter = "",
  toastTimer;
const names = {
  overview: "Overview",
  contacts: "Customers & leads",
  pipeline: "Sales pipeline",
  outreach: "Outreach & follow-ups",
  marketing: "Marketing",
};
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 4500);
}
function commit(next) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    state = next;
    return true;
  } catch {
    toast(
      "Could not save. Browser storage may be full or disabled. No changes were applied.",
    );
    return false;
  }
}
const badge = (stage) =>
  `<span class="badge ${esc(stage.toLowerCase())}">${esc(stage)}</span>`;
const empty = (text = "No records yet. Add one to get started.") =>
  `<div class="empty">${esc(text)}</div>`;
const contactButton = (c) =>
  `<button class="business-button" data-detail="${esc(c.id)}">${esc(c.business)}</button>`;
function heading(title, subtitle, actions = "") {
  return `<div class="page-heading"><div><p class="eyebrow">WISHBONES · GROWTH WORKSPACE</p><h1>${title}</h1><p class="subtitle">${subtitle}</p></div><div class="heading-actions">${actions}</div></div>`;
}
const addContactButton =
  '<button class="button" data-add="contact">＋ Add customer lead</button>';
const addActivityButton =
  '<button class="button" data-add="activity">＋ Log outreach</button>';
function stat(label, value, note, icon = "→", emphasis = false) {
  return `<div class="stat"><span class="stat-label">${label}</span><span class="stat-icon" aria-hidden="true">${icon}</span><strong class="stat-value">${value}</strong><span class="stat-note ${emphasis ? "emphasis" : ""}">${note}</span></div>`;
}
function panel(title, subtitle, body, link = "") {
  return `<section class="panel"><div class="panel-head"><div><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ""}</div>${link}</div>${body}</section>`;
}
function contactTable(contacts, compact = false) {
  if (!contacts.length)
    return empty("No customer leads match. Add a lead or change your filters.");
  return `<div class="table-wrap"><table><thead><tr><th>Business / contact</th><th>Customer type</th><th>Stage</th>${compact ? "" : "<th>Owner</th>"}<th>Next follow-up</th><th>Action</th></tr></thead><tbody>${contacts.map((c) => `<tr><td>${contactButton(c)}<small>${esc(c.person || "Contact not identified")}</small></td><td>${esc(c.type)}</td><td>${badge(c.stage)}</td>${compact ? "" : `<td>${esc(c.owner || "Unassigned")}</td>`}<td class="${isDue(c) ? "due" : ""}">${esc(dateLabel(c.followUp))}${isDue(c) ? "<small>Due for follow-up</small>" : ""}</td><td><button class="row-action" data-log="${esc(c.id)}">Log outreach</button></td></tr>`).join("")}</tbody></table></div>`;
}
function overview() {
  const m = metrics(state),
    total = state.contacts.length;
  const followups = state.contacts
    .filter((c) => c.followUp && !["Won", "Lost"].includes(c.stage))
    .sort((a, b) => a.followUp.localeCompare(b.followUp))
    .slice(0, 4);
  const bars = STAGES.map((s) => ({
    stage: s,
    count: state.contacts.filter((c) => c.stage === s).length,
  }));
  const max = Math.max(...bars.map((b) => b.count), 1);
  return (
    heading(
      "A little insight. A lot of potential.",
      "Your relationships, next steps, and growth opportunities — in one place.",
      addContactButton,
    ) +
    `<div class="stat-grid">${stat("Customer leads", m.leads, "Across four target customer groups", "♧")}${stat("Open pipeline", money(m.pipeline), `${m.open} qualified or proposal opportunities`, "▥")}${stat("Follow-ups due", m.due, "Due today or overdue", "◷", true)}${stat("Won opportunity value", money(m.won), "Sample closed sales · not payments", "◎")}</div>` +
    `<div class="two-col">${panel("Your sales pipeline", "A snapshot of every stage of the conversation.", `<div class="panel-body"><div class="pipeline-bars" role="img" aria-label="${esc(bars.map((b) => b.stage + ": " + b.count).join(", "))}">${bars.map((b) => `<div class="pipeline-bar"><strong>${b.count}</strong><div class="bar" data-height="${Math.max((b.count / max) * 110, 5)}"></div><small>${b.stage}</small></div>`).join("")}</div><div class="panel-summary"><span>From first hello to a lasting partnership</span><strong>${m.open} open opportunities</strong></div></div>`, '<a href="#pipeline" class="subtle-link">View pipeline →</a>')}${panel(
      "Who you’re connecting with",
      "Customer leads by business type.",
      `<div class="panel-body">${TYPES.map((t) => {
        const count = state.contacts.filter((c) => c.type === t).length;
        return `<div class="segment"><div class="segment-label"><span>${t}</span><strong>${count}</strong></div><div class="track"><div data-width="${total ? (count / total) * 100 : 0}"></div></div></div>`;
      }).join("")}</div>`,
    )}</div>` +
    panel(
      "Next on your list",
      "Upcoming and overdue follow-ups, ordered by date.",
      contactTable(followups, true),
      '<a href="#outreach" class="subtle-link">All follow-ups →</a>',
    ) +
    panel(
      "Recent conversations",
      "The latest activity recorded by your team.",
      activityList(
        state.activities
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 3),
      ),
      '<button class="text-button" data-add="activity">Log outreach →</button>',
    )
  );
}
function filteredContacts() {
  return state.contacts.filter(
    (c) =>
      (!search ||
        [c.business, c.person, c.email, c.location, c.owner, c.product]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (!typeFilter || c.type === typeFilter) &&
      (!stageFilter || c.stage === stageFilter),
  );
}
function contacts() {
  return (
    heading(
      "Good relationships start here.",
      "Keep every prospect, contact, and next step connected.",
      `<button class="button secondary" id="export-data">↓ Export backup</button>${addContactButton}`,
    ) +
    `<div class="toolbar"><input id="search" type="search" aria-label="Search customer leads" placeholder="Search business, contact, location…" value="${esc(search)}"><select id="type-filter" aria-label="Filter by customer type"><option value="">All customer types</option>${options(TYPES, typeFilter)}</select><select id="stage-filter" aria-label="Filter by stage"><option value="">All stages</option>${options(STAGES, stageFilter)}</select></div><section class="panel"><div class="panel-head"><h2>Customer directory</h2><span class="subtitle" id="contact-count">${filteredContacts().length} leads</span></div><div id="contact-results">${contactTable(filteredContacts())}</div></section><div class="callout">A lead is a potential customer. An opportunity is a qualified sales discussion. Use the sales stage to show how each relationship is progressing.</div>`
  );
}
function pipeline() {
  const m = metrics(state);
  return (
    heading(
      "From first hello to opportunity.",
      "Track each relationship as it moves toward a potential sale.",
      addContactButton,
    ) +
    `<div class="stat-grid">${stat("Open opportunities", m.open, "Qualified and proposal stages")}${stat("Potential value", money(m.pipeline), "Estimated open opportunity value")}${stat("Won value", money(m.won), "Recorded deal values; not booked revenue")}${stat("Closed deals", state.contacts.filter((c) => c.stage === "Won").length, "Opportunities marked won")}</div><div class="board">${STAGES.map(
      (s) => {
        const cs = state.contacts.filter((c) => c.stage === s);
        return `<section class="column"><div class="column-title">${s}<span>${cs.length}</span></div><div class="column-total">${money(cs.reduce((n, c) => n + c.value, 0))} estimated value</div>${cs.map((c) => `<article class="deal-card">${contactButton(c)}<p>${esc(c.type)} · ${esc(c.product)}</p><strong>${money(c.value)}</strong><p>${esc(c.owner || "Unassigned")}</p><label>Sales stage<select data-stage="${esc(c.id)}" aria-label="Stage for ${esc(c.business)}">${options(STAGES, c.stage)}</select></label></article>`).join("")}${cs.length ? "" : '<p class="subtitle">No leads at this stage</p>'}</section>`;
      },
    ).join(
      "",
    )}</div><div class="callout">Values are planning estimates in USD. A won opportunity does not confirm payment, fulfillment, or available supply.</div>`
  );
}
function activityList(activities) {
  if (!activities.length)
    return empty(
      "No outreach recorded yet. Log a conversation to start a history.",
    );
  return `<div class="activity-list">${activities
    .map((a) => {
      const c = state.contacts.find((c) => c.id === a.contactId);
      return `<article class="activity"><span class="avatar" aria-hidden="true">${esc((a.owner || "W").slice(0, 1))}</span><div class="activity-content"><div class="activity-title"><strong>${c ? contactButton(c) : "Unknown customer"}</strong><span class="activity-meta">${esc(dateLabel(a.date))}</span></div><p>${esc(a.notes)}</p><span class="activity-meta">${esc(a.channel)} · ${esc(a.result)} · ${esc(a.owner || "Unassigned")}</span></div></article>`;
    })
    .join("")}</div>`;
}
function followups() {
  let cs = state.contacts.filter(
    (c) => c.followUp && !["Won", "Lost"].includes(c.stage),
  );
  if (followFilter === "due") cs = cs.filter((c) => isDue(c));
  return cs.sort((a, b) => a.followUp.localeCompare(b.followUp));
}
function outreach() {
  return (
    heading(
      "Every conversation counts.",
      "Keep a record of what happened — and what happens next.",
      addActivityButton,
    ) +
    `<div class="toolbar"><select id="follow-filter" aria-label="Filter follow-ups"><option value="">All scheduled follow-ups</option><option value="due" ${followFilter === "due" ? "selected" : ""}>Due today & overdue</option></select></div><div id="followup-results">${panel("Follow-up planner", "Won and lost leads are excluded from reminders.", contactTable(followups()))}</div>` +
    panel(
      "Outreach history",
      "Recording activity does not send messages or contact anyone.",
      activityList(
        state.activities.slice().sort((a, b) => b.date.localeCompare(a.date)),
      ),
    )
  );
}
function marketing() {
  const attributed = state.contacts.filter((c) => c.campaignId),
    opportunities = attributed.filter((c) =>
      ["Qualified", "Proposal", "Won"].includes(c.stage),
    ),
    budget = state.campaigns.reduce((n, c) => n + c.budget, 0);
  return (
    heading(
      "Turn interest into opportunity.",
      "Connect marketing campaigns to customer inquiries and sales conversations.",
      '<button class="button" data-add="campaign">＋ Add campaign</button>',
    ) +
    `<div class="stat-grid">${stat("Campaigns", state.campaigns.length, `${state.campaigns.filter((c) => c.status === "Active").length} active campaigns`)}${stat("Attributed leads", attributed.length, "Leads linked to a campaign")}${stat("Sales opportunities", opportunities.length, "Qualified, proposal, and won leads")}${stat("Planned budget", money(budget), "Campaign budgets; not actual spend")}</div><div class="campaign-grid">${state.campaigns
      .map((c) => {
        const stats = campaignStats(state, c.id);
        return `<article class="campaign"><div class="campaign-top"><span class="badge">${esc(c.channel)}</span><span class="subtitle">${esc(c.status)}</span></div><h2>${esc(c.name)}</h2><p>Start: ${esc(dateLabel(c.start))}</p><div class="campaign-numbers"><div><strong>${stats.leads}</strong><small>Leads</small></div><div><strong>${stats.opportunities}</strong><small>Opportunities</small></div><div><strong>${stats.won}</strong><small>Won</small></div></div><p>${esc(c.notes || "No campaign notes yet.")}</p><div class="campaign-foot"><span>Budget ${money(c.budget)}</span><button class="text-button" data-edit-campaign="${esc(c.id)}">Edit campaign</button></div></article>`;
      })
      .join("")}</div>` +
    panel(
      "Campaign attribution",
      "One source campaign per lead; attribution reflects team-entered records.",
      `<div class="table-wrap"><table><thead><tr><th>Customer lead</th><th>Campaign</th><th>Inquiry / source</th><th>Stage</th><th>Won value</th></tr></thead><tbody>${state.contacts.map((c) => `<tr><td>${contactButton(c)}</td><td>${esc(state.campaigns.find((m) => m.id === c.campaignId)?.name || "Unattributed")}</td><td>${esc(c.source || "Not recorded")}</td><td>${badge(c.stage)}</td><td>${c.stage === "Won" ? money(c.value) : "—"}</td></tr>`).join("")}</tbody></table></div>`,
    ) +
    `<div class="callout">Link a campaign when adding or editing a customer lead. These reports show attributed leads and deal values, not advertising-platform analytics or verified return on investment.</div>`
  );
}
function render() {
  $("#breadcrumb").textContent = names[page];
  document.title = `${names[page]} · Wishbones`;
  document.querySelectorAll("nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.page === page);
    if (a.dataset.page === page) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $("#main").innerHTML = { overview, contacts, pipeline, outreach, marketing }[
    page
  ]();
  document
    .querySelectorAll("[data-height]")
    .forEach((el) => (el.style.height = el.dataset.height + "px"));
  document
    .querySelectorAll("[data-width]")
    .forEach((el) => (el.style.width = el.dataset.width + "%"));
}
function navigate() {
  page = Object.hasOwn(names, location.hash.slice(1))
    ? location.hash.slice(1)
    : "overview";
  render();
}
function options(values, selected = "") {
  return values
    .map(
      (v) =>
        `<option value="${esc(v)}" ${v === selected ? "selected" : ""}>${esc(v)}</option>`,
    )
    .join("");
}
function field(
  label,
  name,
  value = "",
  type = "text",
  required = false,
  full = false,
) {
  return `<label class="field ${full ? "full" : ""}">${label}${required ? " *" : ""}<input name="${name}" type="${type}" value="${esc(value)}" ${required ? "required" : ""} ${type === "number" ? 'min="0" step="0.01" max="1000000000"' : ""} ${["text", "email", "tel"].includes(type) ? 'maxlength="300"' : ""}></label>`;
}
function select(label, name, values, value = "", required = false) {
  return `<label class="field">${label}${required ? " *" : ""}<select name="${name}" ${required ? "required" : ""}>${options(values, value)}</select></label>`;
}
function notes(value = "", label = "Notes", name = "notes") {
  return `<label class="field full">${label}<textarea name="${name}" maxlength="5000">${esc(value)}</textarea></label>`;
}
function campaignsSelect(value = "") {
  return `<label class="field">Source campaign<select name="campaignId"><option value="">No campaign / unattributed</option>${state.campaigns.map((m) => `<option value="${esc(m.id)}" ${value === m.id ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select></label>`;
}
let formMode = "",
  editId = "",
  logContactId = "";
function openForm(mode, id = "") {
  formMode = mode;
  editId = id;
  logContactId = "";
  $("#form-error").textContent = "";
  $("#editor-form .dialog-actions").classList.remove("hidden");
  let fields = "";
  if (mode === "contact") {
    const c = state.contacts.find((c) => c.id === id) || {};
    $("#dialog-title").textContent = id
      ? "Edit customer lead"
      : "Add customer lead";
    fields =
      field("Business name", "business", c.business, "text", true, true) +
      select("Customer type", "type", TYPES, c.type) +
      field("Contact person", "person", c.person) +
      field("Email", "email", c.email, "email") +
      field("Phone", "phone", c.phone, "tel") +
      field("Location", "location", c.location) +
      field("Team owner", "owner", c.owner) +
      select("Product interest", "product", PRODUCTS, c.product) +
      select("Sales stage", "stage", STAGES, c.stage) +
      field("Estimated deal value (USD)", "value", c.value ?? 0, "number") +
      campaignsSelect(c.campaignId) +
      field("Inquiry / lead source", "source", c.source) +
      field("Next follow-up", "followUp", c.followUp, "date") +
      field("Next step", "nextStep", c.nextStep, "text", false, true) +
      notes(c.notes);
  } else if (mode === "campaign") {
    const c = state.campaigns.find((c) => c.id === id) || {};
    $("#dialog-title").textContent = id ? "Edit campaign" : "Add campaign";
    fields =
      field("Campaign name", "name", c.name, "text", true, true) +
      select(
        "Channel",
        "channel",
        [
          "Email",
          "Social media",
          "Website",
          "Trade event",
          "Referral",
          "Other",
        ],
        c.channel,
      ) +
      select("Status", "status", ["Planned", "Active", "Completed"], c.status) +
      field("Planned budget (USD)", "budget", c.budget ?? 0, "number") +
      field("Start date", "start", c.start || today(), "date", true) +
      notes(c.notes);
  } else {
    if (!state.contacts.length) {
      toast("Add a customer lead before logging outreach.");
      return;
    }
    logContactId = id;
    const c = state.contacts.find((c) => c.id === id) || state.contacts[0];
    $("#dialog-title").textContent = "Log outreach";
    fields =
      `<label class="field full">Customer lead *<select name="contactId" required>${state.contacts.map((x) => `<option value="${esc(x.id)}" ${c.id === x.id ? "selected" : ""}>${esc(x.business)}</option>`).join("")}</select></label>` +
      field("Activity date", "date", today(), "date", true) +
      select("Contact method", "channel", [
        "Email",
        "Call",
        "Meeting",
        "Website inquiry",
        "Trade event",
        "Other",
      ]) +
      select("Result", "result", [
        "Awaiting reply",
        "Interested",
        "Meeting scheduled",
        "Not a fit",
        "Inquiry received",
        "Other",
      ]) +
      field("Team owner", "owner", c.owner) +
      notes("", "Conversation notes *") +
      `<div class="full callout">Update this customer’s next step and reminder below. To complete a follow-up without another reminder, clear the date.</div>` +
      field("Next step", "nextStep", c.nextStep, "text", false, true) +
      field("Next follow-up", "followUp", c.followUp, "date");
  }
  $("#form-fields").innerHTML =
    `<p class="help-text">* Required. Use fictional or approved business data. Saved to this browser only.</p><div class="form-grid">${fields}</div>`;
  if (mode === "activity") $("#form-fields textarea").required = true;
  $("#editor-form button[type=submit]").textContent = "Save record";
  if (!$("#editor").open) $("#editor").showModal();
}
function showDetail(id) {
  const c = state.contacts.find((c) => c.id === id);
  if (!c) return;
  $("#dialog-title").textContent = c.business;
  $("#form-error").textContent = "";
  $("#editor-form .dialog-actions").classList.add("hidden");
  const attrs = [
    ["Contact person", c.person],
    ["Customer type", c.type],
    ["Email", c.email],
    ["Phone", c.phone],
    ["Location", c.location],
    ["Team owner", c.owner],
    ["Product interest", c.product],
    ["Stage", c.stage],
    ["Estimated deal value", money(c.value)],
    [
      "Source campaign",
      state.campaigns.find((m) => m.id === c.campaignId)?.name ||
        "Unattributed",
    ],
    ["Inquiry / lead source", c.source],
    ["Next follow-up", dateLabel(c.followUp)],
    ["Next step", c.nextStep],
    ["Notes", c.notes],
  ];
  $("#form-fields").innerHTML =
    `${badge(c.stage)}<div class="details-grid">${attrs.map(([k, v]) => `<div class="detail-item ${["Notes", "Next step"].includes(k) ? "detail-wide" : ""}"><small>${k}</small><span>${esc(v || "Not recorded")}</span></div>`).join("")}</div><div class="detail-actions"><button type="button" class="button secondary" data-edit-contact="${esc(id)}">Edit customer lead</button><button type="button" class="button" data-log="${esc(id)}">＋ Log outreach</button></div><div class="detail-activity"><h3>Outreach history</h3>${activityList(state.activities.filter((a) => a.contactId === id).sort((a, b) => b.date.localeCompare(a.date)))}</div>`;
  if (!$("#editor").open) $("#editor").showModal();
}
$("#editor-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form));
  Object.keys(values).forEach((k) => (values[k] = values[k].trim()));
  if (
    (formMode === "contact" && !values.business) ||
    (formMode === "campaign" && !values.name) ||
    (formMode === "activity" && !values.notes)
  ) {
    $("#form-error").textContent =
      "Please complete all required fields with text.";
    return;
  }
  const next = structuredClone(state);
  if (formMode === "contact") {
    values.value = Number(values.value);
    if (!Number.isFinite(values.value) || values.value < 0) return;
    const record = { ...values, id: editId || crypto.randomUUID() };
    const index = next.contacts.findIndex((c) => c.id === editId);
    if (index >= 0) next.contacts[index] = record;
    else next.contacts.push(record);
  } else if (formMode === "campaign") {
    values.budget = Number(values.budget);
    const record = { ...values, id: editId || crypto.randomUUID() };
    const index = next.campaigns.findIndex((c) => c.id === editId);
    if (index >= 0) next.campaigns[index] = record;
    else next.campaigns.push(record);
  } else {
    const { followUp, nextStep, ...activity } = values;
    const c = next.contacts.find((c) => c.id === values.contactId);
    if (!c) {
      $("#form-error").textContent = "Choose an existing customer lead.";
      return;
    }
    next.activities.push({ ...activity, id: crypto.randomUUID() });
    c.followUp = followUp;
    c.nextStep = nextStep;
  }
  if (!validateState(next)) {
    $("#form-error").textContent =
      "The record could not be validated. Please check the fields.";
    return;
  }
  if (commit(next)) {
    $("#editor").close();
    render();
    toast("Record saved to this browser.");
  }
});
$("#editor-form").addEventListener("change", (e) => {
  if (formMode === "activity" && e.target.name === "contactId") {
    const c = state.contacts.find((c) => c.id === e.target.value);
    if (c) {
      const f = $("#editor-form");
      f.elements.owner.value = c.owner;
      f.elements.nextStep.value = c.nextStep;
      f.elements.followUp.value = c.followUp;
    }
  }
});
$("#close-dialog").onclick = $("#cancel-dialog").onclick = () =>
  $("#editor").close();
$("#about-demo").onclick = () => {
  $("#dialog-title").textContent = "About this prototype";
  $("#form-error").textContent = "";
  $("#editor-form .dialog-actions").classList.add("hidden");
  $("#form-fields").innerHTML =
    "<p>This is a student-built sales and marketing prototype for Wishbones Ostrich Farm. Records marked (sample), initial campaigns, activity, and sales are fictional. California records labeled Public website research are real, uncontacted business prospects with source URLs and qualification notes. Their interest and purchasing requirements are unconfirmed.</p><p>Edits are saved only in this browser on this device. There are no shared accounts, shared database, email delivery, advertising integrations, or payment records. Clearing browser data removes saved edits.</p><p>Use the customer directory’s <strong>Export backup</strong> button to download a JSON copy of your records. Keep nonpublic business and customer details out of the GitHub repository. Before using live data, agree on access and confidentiality and add a secure shared backend.</p><p>Refresh the page to see saved changes. No outreach is sent when an activity is logged.</p>";
  $("#editor").showModal();
};
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.add) openForm(b.dataset.add);
  if (b.dataset.detail) showDetail(b.dataset.detail);
  if (b.dataset.log) openForm("activity", b.dataset.log);
  if (b.dataset.editContact) openForm("contact", b.dataset.editContact);
  if (b.dataset.editCampaign) openForm("campaign", b.dataset.editCampaign);
  if (b.id === "export-data") {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wishbones-backup-${today()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(
      "Backup exported. Store it securely; it may include contact details.",
    );
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "search") {
    search = e.target.value;
    updateContacts();
  }
});
function updateContacts() {
  $("#contact-results").innerHTML = contactTable(filteredContacts());
  $("#contact-count").textContent = `${filteredContacts().length} leads`;
}
document.addEventListener("change", (e) => {
  if (e.target.id === "type-filter") {
    typeFilter = e.target.value;
    updateContacts();
  }
  if (e.target.id === "stage-filter") {
    stageFilter = e.target.value;
    updateContacts();
  }
  if (e.target.id === "follow-filter") {
    followFilter = e.target.value;
    $("#followup-results").innerHTML = panel(
      "Follow-up planner",
      "Won and lost leads are excluded from reminders.",
      contactTable(followups()),
    );
  }
  if (e.target.dataset.stage) {
    const next = structuredClone(state);
    next.contacts.find((c) => c.id === e.target.dataset.stage).stage =
      e.target.value;
    if (commit(next)) {
      render();
      toast("Sales stage updated.");
    } else render();
  }
});
window.addEventListener("hashchange", navigate);
window.addEventListener("storage", (e) => {
  if (e.key === KEY) {
    try {
      const next = JSON.parse(e.newValue);
      if (validateState(next)) {
        state = next;
        render();
        if ($("#editor").open) $("#editor").close();
        toast("Workspace updated from another tab.");
      }
    } catch {
      /* Keep the last valid state. */
    }
  }
});
// Do not write over storage that could not be read or validated.
if (!storageError) {
  const populated = addCaliforniaProspects(state);
  if (populated !== state) commit(populated);
}
navigate();
if (storageError)
  toast(
    "Saved data could not be loaded. Showing sample data; existing storage has not been changed.",
  );
