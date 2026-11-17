export const TYPES = [
  "Restaurant",
  "Specialty butcher",
  "Grocery",
  "Distributor",
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
    contacts: [
      {
        id: "c1",
        business: "Juniper Table (sample)",
        type: "Restaurant",
        person: "Alex Morgan",
        email: "alex@example.com",
        phone: "",
        location: "Columbus, OH",
        product: "Premium ostrich meat",
        stage: "Qualified",
        value: 2400,
        owner: "Javier",
        campaignId: "m1",
        source: "Email inquiry",
        nextStep: "Discuss menu fit and potential order volume",
        followUp: shiftDate(0),
        notes:
          "Fictional prospect. Interested in learning about available cuts.",
      },
      {
        id: "c2",
        business: "Oak & Cleaver (sample)",
        type: "Specialty butcher",
        person: "Taylor Reed",
        email: "taylor@example.com",
        phone: "",
        location: "Cincinnati, OH",
        product: "Domestic supply",
        stage: "Proposal",
        value: 4800,
        owner: "Dalia",
        campaignId: "m2",
        source: "Trade event inquiry",
        nextStep: "Prepare sample pricing discussion",
        followUp: shiftDate(2),
        notes:
          "Fictional prospect. Confirm supply capacity before making commitments.",
      },
      {
        id: "c3",
        business: "Meadow Market (sample)",
        type: "Grocery",
        person: "Jordan Lee",
        email: "jordan@example.com",
        phone: "",
        location: "Dayton, OH",
        product: "Private-label products",
        stage: "Contacted",
        value: 0,
        owner: "Victoria",
        campaignId: "m2",
        source: "Website inquiry",
        nextStep: "Ask about retail packaging requirements",
        followUp: shiftDate(-2),
        notes: "Fictional prospect. Exploring specialty grocery placement.",
      },
      {
        id: "c4",
        business: "Northfield Foods (sample)",
        type: "Distributor",
        person: "Casey Ellis",
        email: "casey@example.com",
        phone: "",
        location: "Cleveland, OH",
        product: "Domestic supply",
        stage: "New",
        value: 0,
        owner: "Sabrina",
        campaignId: "m3",
        source: "Public research",
        nextStep: "Research territory and buyer requirements",
        followUp: shiftDate(4),
        notes: "Fictional prospect; no contact has been made.",
      },
      {
        id: "c5",
        business: "Ember Kitchen (sample)",
        type: "Restaurant",
        person: "Riley Quinn",
        email: "riley@example.com",
        phone: "",
        location: "Columbus, OH",
        product: "Premium ostrich meat",
        stage: "Won",
        value: 1250,
        owner: "Javier",
        campaignId: "m1",
        source: "Email inquiry",
        nextStep: "",
        followUp: "",
        notes:
          "Fictional closed opportunity for demonstration only; no actual sale.",
      },
      {
        id: "c6",
        business: "Harvest Lane (sample)",
        type: "Grocery",
        person: "Sam Parker",
        email: "sam@example.com",
        phone: "",
        location: "Athens, OH",
        product: "Premium ostrich meat",
        stage: "New",
        value: 0,
        owner: "Dalia",
        campaignId: "",
        source: "Public research",
        nextStep: "Identify the appropriate purchasing contact",
        followUp: shiftDate(5),
        notes: "Fictional prospect.",
      },
    ],
    activities: [
      {
        id: "a1",
        contactId: "c1",
        date: shiftDate(-2),
        channel: "Email",
        result: "Interested",
        notes: "Sample activity: buyer asked about cuts and availability.",
        owner: "Javier",
      },
      {
        id: "a2",
        contactId: "c2",
        date: shiftDate(-3),
        channel: "Call",
        result: "Meeting scheduled",
        notes: "Sample activity: arrange an introductory supply discussion.",
        owner: "Dalia",
      },
      {
        id: "a3",
        contactId: "c3",
        date: shiftDate(-4),
        channel: "Email",
        result: "Awaiting reply",
        notes:
          "Sample activity: introduction drafted and recorded for demonstration.",
        owner: "Victoria",
      },
    ],
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
