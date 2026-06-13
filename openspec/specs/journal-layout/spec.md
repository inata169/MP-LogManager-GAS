# journal-layout Specification

## Purpose
TBD - created by archiving change add-compact-responsive-layout. Update Purpose after archive.
## Requirements
### Requirement: Compact Responsive Journal Layout
The Web App SHALL provide a compact responsive Journal layout that increases visible working content on both PC browsers and iPhone browser/PWA views.

#### Scenario: iPhone journal editing
- **WHEN** a user opens or edits a Journal entry on an iPhone-sized viewport
- **THEN** the header, navigation, controls, entry card, and editor chrome are compact enough to prioritize visible journal body content.

#### Scenario: PC journal editing
- **WHEN** a user opens the Journal view on a PC browser viewport
- **THEN** the layout uses the available horizontal space for the entry list and editor instead of keeping the content narrowly centered.

#### Scenario: Mobile editor toolbar
- **WHEN** the EasyMDE toolbar is shown on an iPhone-sized viewport
- **THEN** toolbar controls remain reachable without consuming multiple large rows of vertical space.

