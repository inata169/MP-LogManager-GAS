# web-accessibility Specification

## Purpose
Define accessible modal focus behavior and mobile page-zoom support for the Web App across phone, tablet, and desktop layouts.
## Requirements
### Requirement: Accessible Modal Lifecycle
The Web App SHALL provide a consistent keyboard and assistive-technology lifecycle for the Task and Settings dialogs.

#### Scenario: Open a dialog
- **WHEN** a user opens the Task or Settings dialog
- **THEN** the dialog has an accessible name, background content is not the active interaction target, and focus moves to an appropriate control inside the dialog

#### Scenario: Navigate within a dialog
- **WHEN** a keyboard user presses Tab or Shift+Tab while a dialog is open
- **THEN** focus cycles within the visible dialog without moving to background controls

#### Scenario: Close a dialog
- **WHEN** a dialog closes through its button, overlay, Escape key, or a completed save action
- **THEN** the same close policy runs and focus returns to the control that opened the dialog when that control is still available

### Requirement: User Page Zoom
The Web App SHALL allow browser and operating-system page zoom on mobile devices.

#### Scenario: Pinch zoom on iPhone or iPad
- **WHEN** a user uses browser zoom or pinch zoom
- **THEN** the viewport configuration does not prevent scaling and the primary navigation, editor, and save controls remain reachable
