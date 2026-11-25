/**
 * Pay Now double-click protection: takePayLock as checkout/page.tsx uses it, with a mocked ICICI initiate.
 * Run: npx ts-node --transpile-only -O '{"module":"commonjs","moduleResolution":"node","jsx":"react-jsx"}' src/lib/checkoutQuote.test.ts
 */
import assert from 'node:assert';
import { takePayLock, sharedRefusal, startPayment, paymentPageUrl, checkPaymentPage, PayStage, PAGE_URL_REFUSED } from './checkoutQuote';

/** The same shape as handleCheckout: lock before the request, release only when the start fails. */
const makeCheckout = (initiate: () => Promise<string>) => {
  const payLock = { current: false }; // what useRef(false) gives the page
  const redirects: string[] = [];
  const handleCheckout = async () => {
    try {
      if (!takePayLock(payLock)) return;
      redirects.push(await initiate());
    } catch {
      payLock.current = false;
    }
  };
  return { payLock, redirects, handleCheckout };
};

const run = async () => {
  // Double click (and a third tap) in the same moment: one initiate request, one redirect
  let calls = 0;
  const ok = makeCheckout(async () => { calls++; await new Promise((r) => setTimeout(r, 20)); return 'https://pg/authRedirect?tranCtx=A'; });
  await Promise.all([ok.handleCheckout(), ok.handleCheckout(), ok.handleCheckout()]);
  assert.strictEqual(calls, 1, 'only the first click starts a payment');
  assert.deepStrictEqual(ok.redirects, ['https://pg/authRedirect?tranCtx=A']);
  // After a successful start the page is leaving for ICICI: further clicks stay ignored
  await ok.handleCheckout();
  assert.strictEqual(calls, 1);

  // A failed start (502 / timeout) releases the lock, so the customer can retry once; never two at a time
  let attempts = 0;
  const flaky = makeCheckout(async () => { attempts++; await new Promise((r) => setTimeout(r, 5)); if (attempts === 1) throw new Error('502'); return 'https://pg/authRedirect?tranCtx=B'; });
  await Promise.all([flaky.handleCheckout(), flaky.handleCheckout()]);
  assert.deepStrictEqual([attempts, flaky.payLock.current, flaky.redirects.length], [1, false, 0], 'failed: released, nothing redirected');
  await Promise.all([flaky.handleCheckout(), flaky.handleCheckout()]);
  assert.deepStrictEqual([attempts, flaky.redirects], [2, ['https://pg/authRedirect?tranCtx=B']], 'retry: exactly one more request');

  // The lock itself
  const lock = { current: false };
  assert.deepStrictEqual([takePayLock(lock), takePayLock(lock), lock.current], [true, false, true]);
  console.log('✅ Pay Now lock: one initiate per click burst, released only on failure (3 checks)');

  // Missing product weight: the server gives Road and Air the same refusal -> shown once for the group, not twice
  const weight = 'Delivery charge cannot be calculated: no weight is set for Nestlé KitKat 4 Finger Milk Chocolate Bar 41.5g. Choose store pickup or contact the store.';
  assert.strictEqual(sharedRefusal([{ allowed: false, reason: weight }, { allowed: false, reason: weight }]), weight, 'same reason on both: said once');
  assert.strictEqual(sharedRefusal([{ allowed: false, reason: weight }, { allowed: false, reason: 'Air shipping is not available for this destination' }]), '', 'different reasons: each stays with its option');
  assert.strictEqual(sharedRefusal([{ allowed: false, reason: weight }]), '', 'one refused option: shown on that option');
  assert.strictEqual(sharedRefusal([{ allowed: true, reason: '' }, { allowed: false, reason: weight }]), '', 'an available option: no group refusal');
  assert.strictEqual(sharedRefusal([]), '');
  console.log('✅ shared delivery refusal (e.g. missing weight) is shown once, never duplicated per method (5 checks)');

  // ---- startPayment: what the Secure Checkout button runs (mocked ICICI initiate, mocked navigation)
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const harness = (initiate: () => Promise<unknown>, navigate: (url: string) => void = () => {}) => {
    const h = { lock: { current: false }, watchdog: { current: undefined as ReturnType<typeof setTimeout> | undefined },
      stages: [] as PayStage[], navigated: [] as string[], errors: [] as unknown[], stuck: 0, initiateCalls: 0 };
    const click = () => startPayment({ lock: h.lock, watchdog: h.watchdog, setStage: (st) => h.stages.push(st),
      initiate: () => { h.initiateCalls++; return initiate(); }, navigate: (u) => { navigate(u); h.navigated.push(u); },
      onError: (e) => h.errors.push(e), onStuck: () => h.stuck++, stuckAfterMs: 30 });
    return { h, click };
  };
  const PAGE = 'https://pgpayuat.icicibank.com/tsp/pg/api/v2/authRedirect?tranCtx=AB';
  const reply = (redirectUrl: unknown) => async () => ({ success: true, data: { redirectUrl, merchantTxnNo: 'T1' } });

  {
    const { h, click } = harness(reply(PAGE));
    await Promise.all([click(), click(), click()]);
    assert.deepStrictEqual([h.initiateCalls, h.navigated, h.stages, h.errors.length], [1, [PAGE], ['connecting', 'redirecting'], 0], 'success: one start, one redirect');
    clearTimeout(h.watchdog.current); // the page unloads here in a browser
  }
  {
    const LIVE = 'https://pgpay.icicibank.com/pg/api/v2/authRedirect?tranCtx=LIVE';
    const { h, click } = harness(reply(LIVE));
    await click();
    assert.deepStrictEqual([h.navigated, h.stages, h.errors.length], [[LIVE], ['connecting', 'redirecting'], 0], 'live ICICI host: redirect');
    clearTimeout(h.watchdog.current);
  }
  for (const [label, bad] of [
    ['missing', undefined], ['plain http', 'http://pgpayuat.icicibank.com/tsp/pg/api/v2/authRedirect?tranCtx=AB'],
    ['unknown host', 'https://evil.example/authRedirect'], ['lookalike host', 'https://pgpayuat.icicibank.com.evil.example/authRedirect'],
    ['suffix lookalike', 'https://noticicibank.com/authRedirect'], ['icici.com lookalike', 'https://icici.com.evil.example/x'], ['http on icici.com', 'http://pay.icici.com/x'],
    ['credentials', 'https://user:pass@pgpay.icicibank.com/authRedirect'], ['malformed', 'https://'], ['not a URL', 'nonsense'],
    ['javascript:', 'javascript:alert(1)'], ['not a string', 42],
  ] as const) {
    const { h, click } = harness(reply(bad));
    await click();
    assert.deepStrictEqual([h.navigated.length, h.stages, h.lock.current, h.errors.length], [0, ['connecting', ''], false, 1], `${label} redirect URL: no navigation, loading cleared, retry allowed`);
    assert.strictEqual(paymentPageUrl({ data: { redirectUrl: bad } }), '', `${label}: refused`);
  }
  for (const [label, err] of [['backend 502', Object.assign(new Error('502'), { response: { status: 502 } })], ['timeout', Object.assign(new Error('timeout'), { code: 'ECONNABORTED' })]] as const) {
    const { h, click } = harness(async () => { await sleep(5); throw err; });
    await click();
    assert.deepStrictEqual([h.navigated.length, h.stages, h.lock.current, h.errors], [0, ['connecting', ''], false, [err]], `${label}: loading cleared, error shown once`);
    await click();
    assert.strictEqual(h.initiateCalls, 2, `${label}: the customer can retry`);
  }
  {
    const { h, click } = harness(reply(PAGE), () => { throw new Error('navigation blocked'); });
    await click();
    assert.deepStrictEqual([h.stages, h.lock.current, h.errors.length], [['connecting', 'redirecting', ''], false, 1], 'navigation that throws: loading cleared, retry allowed');
  }
  {
    // Navigation started but the page never left (cancelled / ICICI not answering): the watchdog unsticks the button
    const { h, click } = harness(reply(PAGE));
    await click();
    await click(); // while "redirecting": ignored, no second payment
    assert.deepStrictEqual([h.initiateCalls, h.stuck, h.lock.current], [1, 0, true]);
    await sleep(60);
    assert.deepStrictEqual([h.stuck, h.stages.at(-1), h.lock.current], [1, '', false], 'stuck navigation: released after the timeout');
    await click();
    assert.strictEqual(h.initiateCalls, 2, 'retry after the watchdog');
    clearTimeout(h.watchdog.current);
  }
  assert.strictEqual(paymentPageUrl({ data: { redirectUrl: PAGE } }), PAGE);
  assert.strictEqual(paymentPageUrl(null), '');
  // Any ICICI Bank host over https is accepted (live, UAT, a new subdomain, an explicit port)
  for (const ok of ['https://pgpay.icicibank.com:8443/pg?tranCtx=X', 'https://secure.pgpay.icicibank.com/x', 'https://icicibank.com/x', 'https://pay.icici.com/x', 'https://icici.com/x'])
    assert.strictEqual(paymentPageUrl({ data: { redirectUrl: ok } }), new URL(ok).toString(), `${ok} accepted`);
  assert.match(checkPaymentPage({ data: { redirectUrl: 'https://evil.example/x?tranCtx=SECRET' } }).reason, /evil\.example is not an ICICI/, 'reason names the host');
  assert.ok(!checkPaymentPage({ data: { redirectUrl: 'https://evil.example/x?tranCtx=SECRET' } }).reason.includes('SECRET'), 'reason never includes the token');
  assert.strictEqual(paymentPageUrl({ data: { redirectUrl: 'https://PGPAY.icicibank.com:443/pg?tranCtx=X' } }), 'https://pgpay.icicibank.com/pg?tranCtx=X', 'normalised (case, default port)');
  console.log('✅ ICICI start: success (UAT and live hosts), untrusted/bad/missing URL, 502, timeout, blocked or stuck navigation, repeated clicks (35 checks)');

  // ---- Local ICICI mock (backend npm run dev:icici-mock): a loopback page only while the storefront itself is on loopback
  const g = globalThis as { window?: unknown };
  const openOn = (host: string | undefined) => { if (host === undefined) delete g.window; else g.window = { location: { hostname: host } }; };
  const at = (u: unknown) => paymentPageUrl({ data: { redirectUrl: u } });
  const HTTP_MOCK = 'http://localhost:8443/tsp/pg/api/v2/authRedirect?tranCtx=CTX-LG2';
  let mockChecks = 0;
  const check = (actual: string, expected: string, label: string) => { assert.strictEqual(actual, expected, label); mockChecks++; };
  try {
    for (const host of ['localhost', '127.0.0.1']) {
      openOn(host);
      check(at(HTTP_MOCK), HTTP_MOCK, `http mock accepted on ${host}`);
      check(at('https://localhost:8443/x?tranCtx=A'), 'https://localhost:8443/x?tranCtx=A', `https mock accepted on ${host}`);
      check(at('http://127.0.0.1:9000/x'), 'http://127.0.0.1:9000/x', `127.0.0.1 mock on another port accepted on ${host}`);
      check(at(PAGE), PAGE, `real ICICI still accepted on ${host}`);
    }
    for (const host of ['luxygalleria.com', 'www.luxygalleria.com', 'localhost.evil.example', undefined]) {
      openOn(host);
      check(at(HTTP_MOCK), '', `deployed/unknown page (${host}): localhost refused`);
      check(at(PAGE), PAGE, `deployed/unknown page (${host}): real ICICI accepted`);
    }
    openOn('localhost');
    for (const [label, bad] of [
      ['external host', 'https://evil.example/authRedirect'], ['lookalike', 'http://localhost.evil.example:8443/x'], ['credentials', 'http://user:pass@localhost:8443/x'],
      ['ICICI over http', 'http://pgpay.icicibank.com/authRedirect'], ['javascript:', 'javascript:alert(1)'], ['not a string', 8443],
    ] as const) check(at(bad), '', `on localhost, ${label}: refused`);
    { const { h, click } = harness(reply(HTTP_MOCK)); await click(); clearTimeout(h.watchdog.current);
      check(h.navigated.join(), HTTP_MOCK, 'startPayment navigates to the mock page on localhost'); }
    openOn('luxygalleria.com');
    { const { h, click } = harness(reply(HTTP_MOCK)); await click();
      assert.deepStrictEqual([h.navigated.length, h.stages, h.lock.current, (h.errors[0] as Error)?.message.startsWith(PAGE_URL_REFUSED), /localhost:8443/.test((h.errors[0] as Error)?.message)], [0, ['connecting', ''], false, true, true], 'deployed: no navigation, released, clear error naming the host'); mockChecks++; }
  } finally { openOn(undefined); }
  console.log(`✅ local ICICI mock redirect: loopback page only while the storefront is on loopback; deployed sites refuse it (${mockChecks} checks)`);
};

run().catch((e) => { console.error('❌', e); process.exit(1); });
