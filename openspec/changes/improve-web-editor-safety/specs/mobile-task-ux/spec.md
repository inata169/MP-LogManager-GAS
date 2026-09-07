## ADDED Requirements

### Requirement: Task Editor Unsaved Change Protection
The Web App SHALL protect modified Task form values until the user saves them or explicitly confirms discarding them.

#### Scenario: Attempt to close a modified Task
- **WHEN** a user changes any Task form value and closes through the header button, Cancel button, modal overlay, or Escape key
- **THEN** the system asks whether to discard the unsaved changes before closing

#### Scenario: Continue editing after the warning
- **WHEN** the user declines to discard unsaved Task changes
- **THEN** the dialog remains open with the field values, scroll position, and Edit/Preview mode preserved

#### Scenario: Close an unchanged Task
- **WHEN** the current Task form matches its opening state
- **THEN** the dialog closes without an unsaved-change warning

#### Scenario: Task save fails
- **WHEN** Task persistence reports a failure
- **THEN** the dialog remains open, the current input remains available, and the form remains marked as unsaved

#### Scenario: Task save completes
- **WHEN** Task persistence completes according to the existing confirmed or accepted-request policy
- **THEN** the system marks the current form state as saved and closes the dialog without a discard warning
