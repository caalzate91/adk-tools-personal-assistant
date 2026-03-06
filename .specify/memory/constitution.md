<!--
SYNC IMPACT REPORT
==================
Version change: (unversioned template) → 1.0.0
Modified principles: N/A — initial ratification from blank template
Added sections:
  - Core Principles (I–IV): Code Quality, Testing Standards,
    User Experience Consistency, Performance Requirements
  - Quality Gates
  - Development Workflow
  - Governance
Removed sections: N/A (all placeholders replaced)
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gate examples updated
  ✅ .specify/templates/spec-template.md — Success Criteria examples aligned to perf/UX metrics
  ✅ .specify/templates/tasks-template.md — Test tasks marked as REQUIRED per Principle II
Deferred TODOs: None
-->

# ADK Personal Assistant Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

Every module, function, and tool in this codebase MUST be clean, readable, and maintainable
without requiring the reader to consult external documentation beyond inline docstrings.

- All Python functions exposed as ADK tools MUST include complete type hints on all parameters
  and return values, plus a docstring describing purpose, arguments, and return value.
- Each module MUST have a single, clearly stated responsibility; cross-cutting concerns MUST
  be extracted into shared utilities rather than duplicated.
- Code MUST conform to PEP 8. Linting (e.g., `ruff` or `flake8`) MUST pass before any
  change is merged.
- No unused imports, variables, or dead code paths are permitted in merged branches.
- Complexity is justified in writing. Any function exceeding a cyclomatic complexity of 10
  MUST include a comment explaining the necessity and why simpler alternatives were rejected.

**Rationale**: ADK `FunctionTool` relies on docstrings and type hints to generate tool
descriptions for the LLM. Poor code quality here directly degrades agent accuracy.

### II. Testing Standards (NON-NEGOTIABLE)

All testable logic MUST be covered by automated tests before the implementing PR is merged.

- **Unit tests** MUST cover every public function in `custom_functions.py` and all
  non-trivial helper logic.
- **Integration tests** MUST exist for every external API integration (Frankfurter, Google
  Search, Wikipedia) using mocked HTTP responses to avoid live network calls in CI.
- **End-to-end agent tests** MUST validate each user-facing capability (e.g., exchange rate
  query, search delegation, Wikipedia lookup) against expected agent response patterns.
- Test coverage for non-generated code MUST NOT drop below **80%** as measured by `pytest-cov`.
- Tests MUST be written before the implementation they cover (TDD). A failing test MUST exist
  and be committed before the implementation commit is made.
- Test files MUST mirror the source structure: `tests/unit/`, `tests/integration/`,
  `tests/e2e/`.

**Rationale**: Agent behaviour changes can be invisible without tests. Coverage gates prevent
regression in tool reliability, which directly impacts user trust.

### III. User Experience Consistency

The agent MUST provide a coherent, predictable, and respectful experience in every interaction
regardless of which tool or sub-agent handles the request.

- All agent responses MUST maintain a consistent, helpful, and professional tone. Casual or
  terse dismissals of user queries are NOT permitted.
- Error conditions MUST result in informative, actionable responses to the user. Internal
  exception messages or stack traces MUST never be surfaced directly.
- The agent MUST gracefully handle tool failures (timeouts, API errors, invalid inputs) by
  providing a meaningful fallback message and, where possible, suggesting an alternative.
- Responses involving structured data (e.g., exchange rates, lists) MUST be formatted
  consistently using Markdown or structured prose — not raw JSON dumps.
- Multilingual support: when the user communicates in Spanish, the agent MUST respond in
  Spanish. Language switching mid-session MUST be honoured within the same turn.
- New tools and sub-agents MUST define their `description` field precisely enough that the
  root agent selects them with high accuracy; ambiguous descriptions require a peer review
  before merging.

**Rationale**: Inconsistent UX erodes trust in the agent. Clean formatting and graceful
error handling are as important as correct functionality.

### IV. Performance Requirements

The agent MUST remain responsive under normal operating conditions and MUST NOT make
unnecessary or redundant external calls.

- Any single tool call MUST resolve within **5 seconds** under standard network conditions.
  Tools with higher latency MUST document the expected p95 latency and require explicit
  justification.
- The agent MUST NOT issue duplicate API calls for the same information within a single
  session turn. Caching or result reuse SHOULD be implemented where the ADK framework allows.
- LLM token usage MUST be tracked and logged when running in production mode. Prompts MUST
  be concise; verbose system instructions require a performance justification.
- Memory and external-call overhead MUST be evaluated before any major release. A profiling
  run (`cProfile` or equivalent) is REQUIRED for changes that introduce new network I/O.
- Streaming responses MUST be used whenever the ADK framework and model support it, to
  avoid blocking the user interface.

**Rationale**: A personal assistant that is slow or makes redundant calls is unusable in
practice. Performance is a first-class feature, not an afterthought.

## Quality Gates

All pull requests MUST satisfy the following gates before merge. Skipping any gate requires
explicit written justification from a reviewer.

- **QG-1 Lint**: `ruff check .` (or equivalent) returns zero violations.
- **QG-2 Type Check**: `mypy` (or `pyright`) passes with no errors on changed files.
- **QG-3 Tests Pass**: Full test suite passes with zero failures or errors.
- **QG-4 Coverage**: `pytest-cov` reports ≥ 80% line coverage on non-generated code.
- **QG-5 Constitution Check**: The PR description includes a section confirming compliance
  with all four Core Principles, or documents justified exceptions.
- **QG-6 Tool Description Review**: Any new or modified `FunctionTool`, `AgentTool`, or
  `LangchainTool` has had its description field peer-reviewed for LLM-selection accuracy.

## Development Workflow

- **Branch strategy**: One branch per feature/fix, named `###-short-description`. Direct
  commits to `main` are NOT permitted except for hotfixes with immediate post-commit review.
- **Constitution Check at planning**: `plan.md` for every feature MUST include a
  "Constitution Check" section that maps each Core Principle to compliance evidence or
  a documented exception.
- **Peer review**: At least one reviewer other than the author MUST approve changes to
  `agent.py`, `custom_agents.py`, or any file defining tool descriptions before merge.
- **Changelog**: Every merged PR MUST update `README.md` or a `CHANGELOG.md` with a one-line
  summary of the change.
- **Dependency updates**: New third-party dependencies MUST be evaluated for maintenance
  status, licence compatibility, and security advisories before being introduced.

## Governance

This Constitution supersedes all other development practices and implicit conventions in this
repository. When a conflict exists between this document and any other guide, this document
takes precedence.

**Amendment procedure**:
1. Propose the change in a PR that edits this file directly.
2. State the version bump type (MAJOR / MINOR / PATCH) and rationale in the PR description.
3. Obtain approval from at least one project maintainer.
4. Update `LAST_AMENDED_DATE` and `CONSTITUTION_VERSION` in the version line below.
5. Propagate any impacted template changes in the same PR (see Sync Impact Report format).

**Versioning policy** (semantic versioning):
- MAJOR: Backward-incompatible changes — removal or redefinition of a Core Principle.
- MINOR: New section or principle added, or materially expanded guidance.
- PATCH: Clarifications, wording fixes, or non-semantic refinements.

**Compliance review**: Constitution compliance MUST be verified during each PR review
(QG-5). A quarterly audit of all active features against this document is RECOMMENDED.

Use `README.md` and `.github/copilot-instructions.md` for runtime development guidance
and tooling setup references.

**Version**: 1.0.0 | **Ratified**: 2026-03-05 | **Last Amended**: 2026-03-05
