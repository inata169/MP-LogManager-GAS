# Change: Add Compact Responsive Layout

## Why
Two months of real-world use showed that both PC browser and iPhone browser views waste too much screen area, especially in the Journal screen. Users need to see more journal text and task context without excessive scrolling.

## What Changes
- Add a high-density responsive layout for the Web App.
- Expand Journal and Tasks content width on PC browsers.
- Compact the mobile header, bottom navigation, Journal controls, and EasyMDE editor chrome.
- Prioritize Journal editor content on iPhone while keeping entry navigation usable.
- Compact the Tasks list, search/filter controls, and task metadata density on PC and iPhone.
- Update README screenshots to show the compact mobile Journal and Tasks layouts.

## Impact
- Affected specs: `journal-layout`
- Affected code: `web/css/style.css`, `web/index.html`, `web/js/journal.js`, `web/sw.js`, `README.md`, `docs/pics/*`
