/**
 * Customer order history labels: Cancelled (the order) vs Refunded (the money) are always distinguishable.
 * Run: npx ts-node --transpile-only -O '{"module":"commonjs","moduleResolution":"node","jsx":"react-jsx"}' src/lib/orderDisplay.test.ts
 */
import assert from 'node:assert';
import { paymentBadge, refundNote } from './orderDisplay';

let checks = 0;
const eq = (a: unknown, b: unknown, m: string) => { assert.deepStrictEqual(a, b, m); checks++; };

eq(paymentBadge({ paymentStatus: 'completed', refund: null }), { label: 'Paid', tone: 'green' }, 'paid');
eq(paymentBadge({ paymentStatus: 'pending' }), { label: 'Payment pending', tone: 'amber' }, 'pending');
eq(paymentBadge({ paymentStatus: 'failed' }), { label: 'Payment failed', tone: 'red' }, 'failed');
eq(paymentBadge({ paymentStatus: 'completed', refund: { state: 'in_progress', amount: 340, refundedAt: null } }), { label: 'Refund in progress', tone: 'amber' }, 'refund due');
eq(paymentBadge({ paymentStatus: 'refunded', refund: { state: 'refunded', amount: 340, refundedAt: '2026-11-20T10:00:00.000Z' } }), { label: 'Refunded ₹340', tone: 'green' }, 'refunded');
eq(paymentBadge({ paymentStatus: 'refunded' }), { label: 'Refunded', tone: 'green' }, 'refunded, older data without summary');

eq(refundNote({ paymentStatus: 'completed', refund: null }), '', 'no refund, no note');
eq(refundNote({ paymentStatus: 'completed', refund: { state: 'in_progress', amount: 340, refundedAt: null } }), 'A refund of ₹340 is being processed to your original payment method.', 'in progress');
assert.match(refundNote({ paymentStatus: 'refunded', refund: { state: 'refunded', amount: 340, refundedAt: '2026-11-20T10:00:00.000Z' } }), /^₹340 was refunded to your original payment method on \d{2}\/11\/2026\./); checks++;
eq(refundNote({ paymentStatus: 'refunded', refund: { state: 'refunded', amount: 340, refundedAt: null } }).includes(' on '), false, 'no date when unknown');

// A cancelled-and-refunded order never reads as just "cancelled": the payment badge says Refunded
const cancelledRefunded = { orderStatus: 'cancelled', paymentStatus: 'refunded', refund: { state: 'refunded' as const, amount: 340, refundedAt: null } };
eq([cancelledRefunded.orderStatus, paymentBadge(cancelledRefunded).label], ['cancelled', 'Refunded ₹340'], 'cancelled + refunded are both shown');
const cancelledUnrefunded = { orderStatus: 'cancelled', paymentStatus: 'completed', refund: { state: 'in_progress' as const, amount: 340, refundedAt: null } };
eq(paymentBadge(cancelledUnrefunded).label, 'Refund in progress', 'cancelled, refund still due');

console.log(`✅ order history: payment/refund badge and note distinguish Cancelled from Refunded (${checks} checks)`);
