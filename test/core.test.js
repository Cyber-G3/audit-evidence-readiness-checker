import test from'node:test';import assert from'node:assert/strict';import{DOMAINS,assess,markdown}from'../core.js';
const blank={organisation:'Demo',framework:'NIS2',assessments:{}};const full=()=>Object.fromEntries(DOMAINS.map(d=>[d.id,{maturity:'assured',quality:'strong',freshness:'current',owner:'Owner',tested:true}]));
test('blank assessment is not audit-ready',()=>{const r=assess(blank);assert.equal(r.score,0);assert.equal(r.readiness,'Not audit-ready')});
test('fully assured evidence scores 100',()=>assert.equal(assess({...blank,assessments:full()}).score,100));
test('implemented control without evidence is not presented as ready',()=>{const assessments=full();assessments.gov={maturity:'implemented',quality:'none',freshness:'missing',owner:'Owner',tested:false};const row=assess({...blank,assessments}).rows[0];assert.ok(row.score<65);assert.ok(row.gaps.some(x=>x.includes('Evidence')))});
test('ownership and testing are distinct dimensions',()=>{const assessments=full();assessments.risk.owner='';assessments.risk.tested=false;const row=assess({...blank,assessments}).rows[1];assert.ok(row.gaps.some(x=>x.includes('owner')));assert.ok(row.gaps.some(x=>x.includes('tested')))});
test('framework mapping is retained in export',()=>{const r=assess({...blank,assessments:full()});assert.match(markdown(blank,r),/Art\. 21/)});
