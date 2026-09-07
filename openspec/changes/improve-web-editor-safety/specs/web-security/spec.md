## ADDED Requirements

### Requirement: Untrusted DOM Content Boundary
The Web App MUST treat user, Google Drive, GAS, and network-derived strings as text unless they pass through an explicitly owned sanitizer for an intentional HTML rendering feature.

#### Scenario: Render untrusted metadata and messages
- **WHEN** Task metadata, Journal metadata, diagnostic output, or notification text contains HTML syntax or event-handler content
- **THEN** the system displays the value as inert text and does not create executable elements or attributes

#### Scenario: Bind actions to data records
- **WHEN** the system creates Task or Journal controls for a record whose identifier came from persisted data
- **THEN** the system binds the action with an event listener without interpolating the identifier into inline executable code

### Requirement: Centralized Safe Markdown Rendering
The Web App MUST route every Markdown-to-HTML conversion through one shared sanitizer boundary before inserting the result into the live or print DOM.

#### Scenario: Render Task and Journal Markdown
- **WHEN** the system renders Task details, a Task preview, or Journal print content
- **THEN** the shared renderer parses and sanitizes the Markdown before returning HTML for DOM insertion

#### Scenario: Sanitizer is unavailable or unsupported
- **WHEN** the Markdown parser or sanitizer is missing, unsupported, or throws an error
- **THEN** the shared renderer fails closed by returning escaped plain text without executable DOM content

#### Scenario: Reject active content consistently
- **WHEN** any supported Markdown surface receives scriptable HTML, event attributes, unsafe URL schemes, SVG/MathML payloads, active embeds, forms, or named-property clobbering content
- **THEN** every surface removes or neutralizes the unsafe content using the same policy
