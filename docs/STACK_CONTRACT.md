# Stack Contract

## Role

Audit Evidence Readiness Checker is the assurance/readiness layer. It evaluates evidence and control state; it is not the canonical evidence acquisition component.

## Upstream

1. `security-evidence-collector` acquires and normalizes evidence.
2. `security-control-mapper` maps evidence to controls and identifies coverage/gaps.
3. This repository evaluates audit readiness, assurance quality, ownership, freshness and operating-effectiveness testing.

## Canonical flow

```text
Evidence sources
  -> security-evidence-collector
  -> normalized Evidence Contract
  -> security-control-mapper
  -> control/evidence coverage + gaps
  -> audit-evidence-readiness-checker
  -> audit-readiness-result
  -> remediation / reporting
```

## Import adapter requirements

A future versioned adapter should accept normalized records while preserving, where supplied:

- evidence identifier and type;
- provenance/source;
- collection timestamp;
- freshness and validity period;
- evidence owner;
- asset/service relationship;
- collection scope;
- mapped control identifiers;
- integrity metadata.

The browser/manual workflow remains supported for the public standalone demo.

## Output contract target

The checker should expose a versioned `audit-readiness-result` containing at minimum:

- schema version;
- assessment timestamp;
- scope/reference;
- executive readiness score;
- evidence coverage;
- freshness status;
- ownership coverage;
- operating-effectiveness test coverage;
- findings with reason codes;
- remediation priority/owner/due date;
- residual-risk context;
- source evidence/control references.

## Boundary

Do not add cloud collectors, credentials, vulnerability scanning, CMDB ingestion or evidence acquisition APIs to this repository. Those concerns belong upstream or in adapters outside the readiness engine.
