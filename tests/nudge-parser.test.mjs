import test from'node:test';import assert from'node:assert/strict';import{parseNudgeText}from'../.test-dist/lib/core/nudge-parser.js';

test('natural dinner sentence becomes equal-split expense draft',()=>{const r=parseNudgeText('I went for dinner with Neha and Anjali and spent 1500','2026-09-08');assert.equal(r.intent,'expense');assert.equal(r.amount,1500);assert.equal(r.category,'Food');assert.deepEqual(r.friends,['Neha','Anjali'])});

test('repayment is classified as settlement, never income',()=>{const r=parseNudgeText('Neha returned 500 she owed me','2026-09-08');assert.equal(r.intent,'settlement');assert.equal(r.person,'Neha');assert.equal(r.amount,500)});

test('natural investment sentence is parsed without creating a valuation',()=>{const r=parseNudgeText('Invested 5000 in HDFC Nifty 50 Index Fund','2026-09-08');assert.equal(r.intent,'investment');assert.equal(r.amount,5000);assert.equal(r.assetName,'HDFC Nifty 50 Index Fund')});

test('questions stay read only',()=>{const r=parseNudgeText('Why did I spend more this month?','2026-09-08');assert.equal(r.intent,'question')});

test('relative yesterday date is respected',()=>{const r=parseNudgeText('Paid 280 for an auto yesterday','2026-09-08');assert.equal(r.intent,'expense');assert.equal(r.date,'2026-09-07');assert.equal(r.category,'Travel')});
