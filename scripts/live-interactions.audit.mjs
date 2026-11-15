const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const results=[];
try {
 for(const width of [390,1440]) {
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  // This pass never sends form submissions or authentication emails.
  await page.route('**/*',r=>!['GET','HEAD','OPTIONS'].includes(r.request().method())?r.abort():r.continue());
  await page.goto('https://ticowild.com/',{waitUntil:'domcontentloaded'});
  if(width===390)await page.getByRole('button',{name:'Open navigation'}).click();
  await page.locator('header.site-nav').getByRole('link',{name:width===390?'Customer sign in / My account':'Sign in',exact:true}).click();
  await page.waitForURL('**/my/');
  await page.getByRole('textbox',{name:'Email address',exact:true}).waitFor();
  results.push({width,case:'Main website customer sign-in navigation',pass:true});
  await page.getByRole('button',{name:'Password',exact:true}).click();
  assert.ok(await page.locator('input[type=password]').isVisible());
  results.push({width,case:'Password login mode opens',pass:true});
  await page.goto('https://ticowild.com/activities',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/^Filters/}).click();
  await page.getByPlaceholder('Fishing, surf, waterfalls…').fill('zzzz-no-match-qa');
  await page.getByRole('heading',{name:'No experience fits those filters yet.'}).waitFor();
  await page.getByRole('button',{name:'Reset everything'}).click();
  assert.equal(await page.getByRole('heading',{name:'No experience fits those filters yet.'}).count(),0);
  results.push({width,case:'Activity search empty state and reset',pass:true});
  await page.goto('https://ticowild.com/plan',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/^Continue/}).click();
  await page.locator('select').first().selectOption('Manuel Antonio');
  await page.getByLabel('Arrival date',{exact:true}).fill('2027-01-10');
  await page.getByLabel('Departure date',{exact:true}).fill('2027-01-14');
  await page.getByRole('button',{name:/Final touches/}).click();
  await page.getByRole('button',{name:'Create my activity plan'}).click();
  await page.getByRole('heading',{name:'Want us to confirm this trip?'}).waitFor();
  results.push({width,case:'Three-step itinerary generation',pass:true});
  await page.getByPlaceholder('Your name',{exact:true}).fill('QA Browser Only');
  await page.getByPlaceholder('you@email.com',{exact:true}).fill('qa@example.test');
  await page.getByRole('button',{name:'Send my plan to TicoWild'}).click();
  await page.locator('.plan-contact-error').waitFor();
  assert.equal(await page.getByPlaceholder('Your name',{exact:true}).inputValue(),'QA Browser Only');
  assert.ok(await page.getByRole('button',{name:'Send my plan to TicoWild'}).isEnabled());
  assert.match(await page.locator('.plan-contact-error a').getAttribute('href'),/^mailto:info@ticowild\.com/);
  results.push({width,case:'Network-failed planning submission preserves input and offers company-email fallback; no request sent',pass:true});
  await page.goto('https://ticowild.com/partners/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Email me a secure link'}).click();
  await page.getByText('Enter your email first.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Apply',exact:true}).click();
  await page.getByLabel('Company name',{exact:true}).fill('QA Browser Only');
  await page.getByLabel('Email address',{exact:true}).fill('qa@example.test');
  await page.getByLabel('Password',{exact:true}).fill('short');
  await page.getByRole('button',{name:'Create partner account'}).click();
  await page.getByText('Use at least 8 characters for your password.',{exact:true}).waitFor();
  results.push({width,case:'Partner sign-in missing-email and application short-password validation',pass:true});
  await page.goto('https://ticowild.com/partners/?agreement=00000000-0000-0000-0000-000000000000',{waitUntil:'domcontentloaded'});
  await page.getByText(/You’re opening an operator agreement/).waitFor();
  assert.equal(await page.getByRole('button',{name:/sign agreement/i}).count(),0);
  results.push({width,case:'Agreement deep link retains authenticated-entry explanation; unsigned visitors cannot sign',pass:true});
  await page.goto('https://ticowild.com/admin/',{waitUntil:'domcontentloaded'});
  await page.locator('input[type=email]').waitFor();
  assert.equal(await page.getByRole('button',{name:'Disconnect mailbox',exact:true}).count(),0);
  results.push({width,case:'Fresh browser CRM requires authentication',pass:true});
  assert.equal(errors.length,0,errors.join('; '));
  await page.close();
 }
} finally {await browser.close();await writeFile('../../outputs/live-interaction-results.json',JSON.stringify(results,null,2));}
console.log(JSON.stringify(results));

