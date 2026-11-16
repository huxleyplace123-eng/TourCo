import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import assert from 'node:assert/strict';
import {PaymentDocument} from '../src/payments/PaymentRehearsal.jsx';
import {newRehearsal} from '../src/payments/rehearsal-model.js';
export function run(){
 const b=newRehearsal().bookings[0];Object.assign(b,{paidMinor:20000,refundedMinor:10000,receipts:[{reference:'SAMPLE-RECEIPT',amountMinor:10000,at:'2026-11-15T20:00:00Z'}]});
 const invoice=renderToStaticMarkup(<PaymentDocument booking={b} kind="invoice"/>);
 assert.match(invoice,/Original amount paid to TicoWild<\/span><b>\$100\.00/);
 assert.match(invoice,/Remaining due directly to operator<\/span><b>\$400\.00/);
 assert.match(invoice,/SAMPLE DOCUMENT/);assert.match(invoice,/Not a tax invoice/);
 const statement=renderToStaticMarkup(<PaymentDocument booking={b}/>);assert.match(statement,/Full excursion price<\/span><b>\$500\.00/);
 b.status='Cancelled';const cancelled=renderToStaticMarkup(<PaymentDocument booking={b}/>);assert.match(cancelled,/Operator amount currently due \(cancelled\)<\/span><b>\$0\.00/);
 b.customerName='<script>unsafe</script>';assert.ok(!renderToStaticMarkup(<PaymentDocument booking={b}/>).includes('<script>unsafe</script>'));
 console.log('PASS: sample statement/invoice separate totals, original receipt amount, cancellation balance and escaped customer text.');
}
