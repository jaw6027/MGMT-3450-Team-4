# Wishbones growth dashboard

A working marketing and customer relationship management prototype for Wishbones Ostrich Farm. It focuses on restaurant, specialty butcher, grocery, and distribution prospects, including domestic supply and private-label opportunities.

## Run the dashboard

Requires Node.js 22 or newer. No runtime dependencies, account, API key, or database are needed.

```sh
cd MGMT-3450-Team-4
npm start
```

Open `http://localhost:3000` in a browser on the same computer. Use `PORT=4000 npm start` if port 3000 is occupied. The server binds to `0.0.0.0` for development environments. In a managed environment, use its supported browser access or port forwarding. This is a development server, not a production hosting setup.

## What to try

1. Open **Marketing** and add a campaign, including channel and planned budget.
2. Open **Customers & leads** and add a prospect. Choose the campaign as its source, enter the inquiry source, and assign a team owner and next step.
3. Use **Log outreach** to record a conversation, result, and next follow-up. This records activity; it does **not** send email, make calls, or contact prospects.
4. Open a business name to view its details and full activity history, or edit the lead.
5. Use **Sales pipeline** to move a lead through New, Contacted, Qualified, Proposal, Won, or Lost.
6. Return to **Marketing** to see the campaign's attributed leads and opportunities. The overview and follow-up planner update from the same records.

The initial marketing campaigns are illustrative. The six former Ohio sample businesses and their linked outreach have been removed; new workspaces start with researched California prospects and no recorded outreach or sales.

## Data and reporting

- Records are saved in `localStorage` in the current browser, under `wishbones.workspace.v1`, after an edit. Refreshing preserves saved edits. Tabs on the same origin synchronize saved changes; an open edit dialog closes when another tab changes the data.
- Different browsers, devices, and hosted addresses do **not** share data. Clearing browser storage removes saved records. There is no login, backend database, or automatic cloud backup.
- **Export backup** on the customer directory downloads the workspace as JSON for manual safekeeping or a future migration. There is no in-app import yet. Do not commit an export containing private information to GitHub.
- A lead can have one source campaign. Source and inquiry details are entered manually; there are no advertising, email, e-commerce, or analytics integrations.
- **Open opportunities** are leads in Qualified or Proposal. **Open pipeline value** is the sum of their estimated USD values.
- Campaign opportunity counts include Qualified, Proposal, and Won. **Won value** is the sum of recorded Won deal values, not verified revenue, payments, or profit.
- Campaign budgets are planned amounts, not recorded expenditure. The dashboard does not claim marketing ROI.
- Due reminders include today and overdue dates in the browser's local calendar, excluding Won and Lost leads.

Before entering live nonpublic information, agree on confidentiality and access with Jessica and add authentication, authorization, secure shared storage, backup/restore, and an appropriate hosting arrangement. Keep private customer data and credentials out of this repository. Public research and fictional data are sufficient for reviewing this prototype.

## Tests

Model tests use Node's built-in runner and require no installation:

```sh
npm test
```

Browser tests use Playwright with Chromium:

```sh
npm ci
npx playwright install chromium
npm run test:e2e
```

If Chromium is installed at `/usr/bin/chromium`, the tests automatically use it and the browser download is unnecessary. Alternatively set `CHROMIUM_PATH` to the Chromium executable. The browser tests start their own isolated server on port 3107 and use fresh browser contexts without altering a user's saved workspace.

Tests cover campaign attribution, pipeline calculations, date reminders, complete lead/outreach/campaign editing and persistence, backup download, input escaping, empty search results, mobile overflow, and development-server file restrictions.

## Team development

Read [AGENTS.md](AGENTS.md) before making changes. Fetch and incorporate the latest shared work, preserve other students' changes, test, commit, and fetch again before pushing. Never force-push. Each cloud task is already isolated; use the existing checkout instead of creating a worktree unless requested.

Application files:

- `index.html`: accessible application shell and form dialog
- `src/app.js`: screens, interactions, browser storage, and forms
- `src/model.js`: sample records and reporting rules
- `src/style.css`: responsive Wishbones-inspired visual design
- `server.js`: dependency-free local development server

## View online with GitHub Pages

A repository administrator can publish this static prototype without installing anything:

1. Open the repository on GitHub and select **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose **main** and **/ (root)**, then select **Save**.
4. Wait for the Pages deployment to finish. Refresh the Pages settings and select **Visit site** using the URL GitHub displays.

Asset paths support GitHub Pages project URLs. Committing the code alone does not enable Pages; an administrator must save the setting. The public site contains publicly researched prospect records and illustrative marketing campaigns. Edits stay in each visitor’s browser, and no private records should be committed to the public repository.

## Researched California prospects

The dashboard includes **100 public-research prospect records**: 80 food-related prospects and 20 nonfood prospects, with no Ohio sample businesses. The list includes the previous nine records. Some records represent related brands or regional operations, including the two Golden Gate operations; these are 100 business/venue prospects, not a claim of 100 unrelated corporate purchasing teams. Check for centralized purchasing before outreach.

| Business category | Prospects |
| --- | ---: |
| Restaurants | 50 |
| Specialty butcher shops | 13 |
| Grocery stores | 10 |
| Food distributors | 7 |
| Pet retailers / pet-food businesses | 8 |
| Leather-goods makers | 2 |
| Feather suppliers / event design | 4 |
| Body-care manufacturers | 3 |
| Gift and décor retailers | 3 |

Each record has an official website, location, public business contact route (phone, inbox, or contact page), potential product category, business fit category, and a separate **Why this business could be a customer** field. Explanations are limited to two sentences and explain a proposed benefit; they do not claim the business wants to buy. Website and source links are clickable in the directory and detail dialog. The customer directory groups leads under customer-type headings with counts and alphabetizes businesses within each group. Search includes category and fit explanations; filters support business type, potential product category, and sales stage, and update the groups and counts. The explanation field also enforces the two-sentence / 600-character limit when edited.

Product proposals cover premium ostrich meats (72 records), culinary eggs (8), pet products (8), leather goods (2), feathers and design (4), oils and body care (3), and decorative eggshells (3). The screenshot's research/commercial line and coming-soon merchandise do not have assigned buyers: no unsupported research demand or live merchandise availability is implied. Manufacturers are conditional leads; check whether Wishbones can supply the required ingredient or material format rather than assuming it offers raw leather or cosmetic-grade oil.

Public websites were reviewed **November 19, 2026 (Pacific)**. Source URLs and limitations appear in Notes and the source list. Pages returning access errors, unrelated parked domains, and explicit closure notices were excluded from new additions. A working website is evidence of the published business offering, not an independent confirmation of current operations, buyer identity, available budget, or acceptance of new suppliers. Public telephone numbers, generic inboxes, and forms are general business routes and may need to refer you to purchasing; no messages were sent and forms were not submitted. Blank email/phone fields mean that detail was not confirmed; use the linked public contact page where provided. Some official pages disagree on details, which is noted rather than silently resolved.

All researched records start at **New**, with zero estimated value and no invented outreach, owner, follow-up, campaign attribution, or named buyer. Product interest remains **Other**; **Potential product category** records the research hypothesis separately. Check sourcing eligibility first, especially the California Foodshed policy at Marin Sun Farms and local/organic standards at other businesses. Pet, cosmetic, leather, and feather products require appropriate specifications and buyer approval; the catalog does not assess therapeutic effects or promise product suitability.

The app continues to use browser localStorage, not a shared database. Loading the updated app adds missing prospects by stable ID or matching business name, and fills only previously absent research fields on existing researched records. It preserves retained businesses’ saved decisions, edits, explicit blank research fields, campaigns, and activity. Ohio business records (locations ending in OH or Ohio, optionally with a ZIP code/country) and only their linked outreach are removed when a valid saved workspace is loaded. Matching uses the current location rather than old sample IDs, so a business relocated outside Ohio is preserved. Unreadable or invalid browser storage is not overwritten. A previously downloaded standalone demo must be downloaded again to receive catalog and interface changes.

The public prospect spreadsheet is [data/california-prospects.csv](data/california-prospects.csv). It contains the 100 researched California records, ordered by customer type and then business name. Opening or editing that spreadsheet does not update browser storage automatically.
