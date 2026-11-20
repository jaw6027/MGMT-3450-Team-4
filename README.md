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

Records marked `(sample)`, sample people, sample email addresses, initial outreach, and deal values are fictional. Sample follow-up dates are relative to the first saved session. Business names are marked `(sample)` and addresses use `example.com`. No actual customer outreach or sales are represented.

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

Asset paths support GitHub Pages project URLs. Committing the code alone does not enable Pages; an administrator must save the setting. The public site contains fictional initial data. Edits stay in each visitor’s browser, and no private records should be committed to the public repository.

## Researched California prospects

The dashboard adds four public-research prospect records to new and valid saved workspaces: Golden Gate Meat Company (Richmond), Golden Gate Wine Country Meats (Santa Rosa), Gelson’s Markets, and Bristol Farms. Richmond and Santa Rosa are related operations; coordinate purchasing research to avoid duplicate outreach. Records use stable IDs and business-name checks so reloads preserve edits and do not add duplicates. Existing samples, campaigns, and outreach remain intact. Unreadable or invalid browser storage is never overwritten by this addition.

Business websites were reviewed November 19, 2026 (Pacific). Each prospect’s Notes lists source URLs, evidence of category fit, limitations, and the research date. All start at New with zero estimated value, no campaign attribution, no follow-up date, no assigned owner, no named buyer, and no fabricated outreach. Product interest is Other until confirmed. Published phone numbers and generic business inboxes are included where verified; blank fields mean no contact detail was confirmed. These businesses are potential buyers, not customers or confirmed ostrich buyers. Reconfirm details and qualification before outreach.

Public sources: [Golden Gate](https://www.goldengatemeatcompany.com/), [game-meat program](https://www.goldengatemeatcompany.com/golden-gate-meat-company-wild-game-meats), [Gelson’s profile](https://www.gelsons.com/about-us/profile), [Gelson’s supplier submissions](https://www.gelsons.com/about-us/new-suppliers), and [Bristol Farms](https://www.bristolfarms.com/).

The app still uses browser localStorage, not a shared database. Loading the updated app populates that browser’s workspace automatically. This does not alter a previously downloaded standalone HTML file.
