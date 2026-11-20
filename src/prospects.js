// Public business information reviewed November 19, 2026 (Pacific).
// Prospects are uncontacted; no buying intent or sales are implied.
export const californiaProspects = [
  {
    "id": "ca-research-golden-gate-richmond",
    "business": "Golden Gate Meat Company — Richmond",
    "type": "Distributor",
    "person": "",
    "email": "GGMC@GGMeatCo.com",
    "phone": "415-861-3800",
    "location": "Richmond, CA",
    "product": "Other",
    "stage": "New",
    "value": 0,
    "owner": "",
    "campaignId": "",
    "source": "Public website research · California · 2026-11-19",
    "nextStep": "Ask the wholesale team who evaluates new game-meat suppliers; confirm ostrich demand, vendor requirements, cold-chain delivery, and minimum volumes.",
    "followUp": "",
    "notes": "RESEARCHED PROSPECT — not a customer; no contact made. Product fit is a hypothesis, not expressed interest.\nStrong category fit: official site describes game-meat distribution, small producers, vendor screening, and service to Bay Area chefs. No ostrich purchasing interest has been confirmed. Address: 803 Wright Ave, Richmond, CA 94804.\nReviewed: November 19, 2026 (Pacific). Public website information; reconfirm before outreach.\nSources:\nhttps://www.goldengatemeatcompany.com/\nhttps://www.goldengatemeatcompany.com/golden-gate-meat-company-wild-game-meats"
  },
  {
    "id": "ca-research-golden-gate-santa-rosa",
    "business": "Golden Gate Wine Country Meats — Santa Rosa",
    "type": "Distributor",
    "person": "",
    "email": "Info@GGWCMeatCo.com",
    "phone": "707-542-6200",
    "location": "Santa Rosa, CA",
    "product": "Other",
    "stage": "New",
    "value": 0,
    "owner": "",
    "campaignId": "",
    "source": "Public website research · California · 2026-11-19",
    "nextStep": "Confirm whether supplier purchasing is centralized with Richmond before approaching the Santa Rosa wholesale team.",
    "followUp": "",
    "notes": "RESEARCHED PROSPECT — not a customer; no contact made. Product fit is a hypothesis, not expressed interest.\nRegional branch prospect: the official Golden Gate site lists this Santa Rosa wholesale operation separately. Related to the Richmond prospect; coordinate qualification to avoid duplicate outreach. The group advertises game meats, but this branch’s ostrich requirements are unconfirmed. Address: 1095 South A Street, Santa Rosa, CA 95404.\nReviewed: November 19, 2026 (Pacific). Public website information; reconfirm before outreach.\nSources:\nhttps://www.goldengatemeatcompany.com/"
  },
  {
    "id": "ca-research-gelsons",
    "business": "Gelson’s Markets",
    "type": "Grocery",
    "person": "",
    "email": "",
    "phone": "818-906-5700",
    "location": "Encino, CA / Southern California",
    "product": "Other",
    "stage": "New",
    "value": 0,
    "owner": "",
    "campaignId": "",
    "source": "Public website research · California · 2026-11-19",
    "nextStep": "Review the official new-supplier survey and qualify refrigerated/frozen meat requirements, packaging, distribution, and buyer interest before preparing a submission.",
    "followUp": "",
    "notes": "RESEARCHED PROSPECT — not a customer; no contact made. Product fit is a hypothesis, not expressed interest.\nExploratory retail fit: official company profile describes premium meat and Southern California stores. Its New Suppliers page explicitly invites product submissions to the buying team. No ostrich listing or demand was verified. Phone is the published headquarters number, not a direct buyer.\nReviewed: November 19, 2026 (Pacific). Public website information; reconfirm before outreach.\nSources:\nhttps://www.gelsons.com/about-us/profile\nhttps://www.gelsons.com/about-us/new-suppliers"
  },
  {
    "id": "ca-research-bristol-farms",
    "business": "Bristol Farms",
    "type": "Grocery",
    "person": "",
    "email": "",
    "phone": "",
    "location": "Southern California",
    "product": "Other",
    "stage": "New",
    "value": 0,
    "owner": "",
    "campaignId": "",
    "source": "Public website research · California · 2026-11-19",
    "nextStep": "Identify the meat-category purchasing team through the public business contact route; qualify ostrich demand and supplier onboarding requirements.",
    "followUp": "",
    "notes": "RESEARCHED PROSPECT — not a customer; no contact made. Product fit is a hypothesis, not expressed interest.\nExploratory retail fit: official website describes a gourmet grocery business serving Southern California since 1982 and advertises meat products. No ostrich assortment, supplier acceptance, or buyer interest was verified. Use the public contact page; no direct purchasing email was confirmed.\nReviewed: November 19, 2026 (Pacific). Public website information; reconfirm before outreach.\nSources:\nhttps://www.bristolfarms.com/\nhttps://order.bristolfarms.com/stores/contact/"
  }
];

// Add only missing records. Preserve saved edits, campaigns, and activity history.
export function addCaliforniaProspects(state) {
  const names = new Set(state.contacts.map(c => c.business.trim().toLowerCase()));
  const ids = new Set(state.contacts.map(c => c.id));
  const additions = californiaProspects.filter(c => !ids.has(c.id) && !names.has(c.business.trim().toLowerCase()));
  if (!additions.length) return state;
  return { ...state, contacts: [...state.contacts, ...structuredClone(additions)] };
}
