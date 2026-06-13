## ADDED Requirements

### Requirement: Calendar Sync Diagnostics
The Web App SHALL distinguish basic GAS connectivity from actual Google Calendar synchronization success.

#### Scenario: Connection test succeeds but Calendar sync is not verified
- **WHEN** the GAS connection test succeeds
- **THEN** the app does not claim Calendar synchronization is working unless an actual sync request has succeeded.

#### Scenario: Manual Calendar sync completes
- **WHEN** the user runs manual Google Calendar sync
- **THEN** the app shows how many tasks were sent and how many were skipped before the existing sync request.

#### Scenario: Task skipped due to missing due date
- **WHEN** a task has Calendar sync enabled but no due date
- **THEN** the app reports that the task was skipped because Calendar events require a due date.
