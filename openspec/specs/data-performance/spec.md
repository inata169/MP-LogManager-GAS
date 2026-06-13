# data-performance Specification

## Purpose
Describe diagnostic save/load visibility and non-blocking save feedback for growing Tasks and Journal data.
## Requirements
### Requirement: Save and Load Performance Visibility
The Web App SHALL provide diagnostic-only local metrics to understand save/load performance as user data grows.

#### Scenario: Measuring task save
- **WHEN** the user saves Tasks data
- **THEN** the app records the operation type, item count, approximate JSON payload size, timing, status, and timestamp without changing save return values, control flow, persistence format, or error semantics.

#### Scenario: Measuring journal load
- **WHEN** the user loads Journal data
- **THEN** the app records diagnostic timing and payload information without changing load return values, control flow, persistence format, or error semantics.

### Requirement: Large Data Save Warning
The Web App SHALL warn the user after Tasks or Journal save attempts when the serialized payload size may cause slow persistence behavior.

#### Scenario: Save payload exceeds warning threshold
- **WHEN** a Tasks or Journal save records a payload size at or above a configured byte threshold
- **THEN** the app informs the user that save/load may slow down without blocking the operation or changing persistence semantics.

### Requirement: Non-blocking Save Feedback
The Web App SHALL show clear save progress and results without changing persistence semantics.

#### Scenario: Save begins
- **WHEN** the user saves a task or journal entry
- **THEN** the app indicates that remote persistence is in progress.

#### Scenario: Save completes
- **WHEN** the GAS persistence request succeeds or fails
- **THEN** the app shows a success or failure message while preserving the existing save behavior.
