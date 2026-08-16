import test from"node:test";import assert from"node:assert/strict";import{evaluateMetadata,csv}from"../workbench-core.js";
test("identifies overdue remediation and expired evidence",()=>{const r=evaluateMetadata([{domain:"Risk",expiry:"2026-01-01",actionDue:"2026-02-01",actionStatus:"open",testResult:"fail"}],new Date("2026-08-16T00:00:00Z"));assert.equal(r.expired,1);assert.equal(r.overdue,1);assert.equal(r.failed,1)});
test("closed actions are not overdue",()=>{const r=evaluateMetadata([{actionDue:"2026-01-01",actionStatus:"closed"}],new Date("2026-08-16T00:00:00Z"));assert.equal(r.overdue,0)});
test("CSV escapes quotes and retains remediation data",()=>{const out=csv([{domain:"A",action:'Fix "now"'}]);assert.match(out,/Fix ""now""/)});
