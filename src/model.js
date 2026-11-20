export const TYPES = [
  "Restaurant",
  "Specialty butcher",
  "Grocery",
  "Distributor",
  "Pet retailer",
  "Leather goods",
  "Design & events",
  "Body care",
  "Gifts & decor",
];
export const STAGES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Won",
  "Lost",
];
export const PRODUCTS = [
  "Premium ostrich meat",
  "Private-label products",
  "Domestic supply",
  "Other",
];
export const PRODUCT_CATEGORIES = [
  "Premium Ostrich Meats", "Culinary Ostrich Eggs", "Leather & Luxury Goods",
  "Oils & Body Care", "Feathers & Design", "Decorative Eggshells",
  "Pet & Specialty Products", "Research & Commercial",
];
export function validRationale(value) {
  if (typeof value !== "string" || value.length > 600) return false;
  return [...new Intl.Segmenter("en", { granularity: "sentence" }).segment(value)]
    .filter(part => part.segment.trim()).length <= 2;
}
export const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function shiftDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function dateLabel(value) {
  return value
    ? new Date(value + "T12:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not scheduled";
}
export const isOpportunity = (c) =>
  ["Qualified", "Proposal", "Won"].includes(c.stage);
export const isOpen = (c) => ["Qualified", "Proposal"].includes(c.stage);
export const isDue = (c, date = today()) =>
  Boolean(
    c.followUp && c.followUp <= date && !["Won", "Lost"].includes(c.stage),
  );
export function metrics(state) {
  return {
    leads: state.contacts.length,
    open: state.contacts.filter(isOpen).length,
    pipeline: state.contacts.filter(isOpen).reduce((n, c) => n + c.value, 0),
    won: state.contacts
      .filter((c) => c.stage === "Won")
      .reduce((n, c) => n + c.value, 0),
    due: state.contacts.filter((c) => isDue(c)).length,
  };
}
export function campaignStats(state, id) {
  const contacts = state.contacts.filter((c) => c.campaignId === id);
  return {
    leads: contacts.length,
    opportunities: contacts.filter(isOpportunity).length,
    won: contacts.filter((c) => c.stage === "Won").length,
    revenue: contacts
      .filter((c) => c.stage === "Won")
      .reduce((n, c) => n + c.value, 0),
  };
}
export function seed() {
  return {
    version: 1,
    campaigns: [
      {
        id: "m1",
        name: "Chef introduction series",
        channel: "Email",
        status: "Active",
        budget: 250,
        start: shiftDate(-20),
        notes:
          "Sample outreach introducing premium ostrich meat to independent kitchens.",
      },
      {
        id: "m2",
        name: "Specialty retail discovery",
        channel: "Trade event",
        status: "Active",
        budget: 600,
        start: shiftDate(-14),
        notes:
          "Sample campaign for specialty food retailers and butcher shops.",
      },
      {
        id: "m3",
        name: "Distribution partner search",
        channel: "Referral",
        status: "Planned",
        budget: 0,
        start: shiftDate(7),
        notes: "Explore domestic supply and private-label partnerships.",
      },
    ],
    contacts: [],
    activities: [],
  };
}
export function validateState(s) {
  const str = (v) => typeof v === "string";
  if (
    !s ||
    s.version !== 1 ||
    !Array.isArray(s.contacts) ||
    !Array.isArray(s.campaigns) ||
    !Array.isArray(s.activities)
  )
    return false;
  if (
    !s.campaigns.every(
      (m) =>
        ["id", "name", "channel", "status", "start", "notes"].every((k) =>
          str(m[k]),
        ) &&
        Number.isFinite(m.budget) &&
        m.budget >= 0,
    )
  )
    return false;
  if (
    !s.contacts.every(
      (c) =>
        [
          "id",
          "business",
          "person",
          "email",
          "phone",
          "location",
          "product",
          "owner",
          "campaignId",
          "source",
          "nextStep",
          "followUp",
          "notes",
        ].every((k) => str(c[k])) &&
        ["website", "contactUrl", "productCategory", "fitCategory", "whyPotential", "reviewedOn"].every(k => c[k] === undefined || str(c[k])) &&
        (c.whyPotential === undefined || validRationale(c.whyPotential)) &&
        (c.sourceUrls === undefined || (Array.isArray(c.sourceUrls) && c.sourceUrls.every(str))) &&
        TYPES.includes(c.type) &&
        STAGES.includes(c.stage) &&
        Number.isFinite(c.value) &&
        c.value >= 0 &&
        (!c.campaignId || s.campaigns.some((m) => m.id === c.campaignId)),
    )
  )
    return false;
  return s.activities.every(
    (a) =>
      ["id", "contactId", "date", "channel", "result", "notes", "owner"].every(
        (k) => str(a[k]),
      ) && s.contacts.some((c) => c.id === a.contactId),
  );
}
