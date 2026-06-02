/**
 * Auth flow verification
 * Run: node tests/verify-auth-flow.mjs
 */
import { chromium } from 'playwright'
import { randomBytes } from 'crypto'
import { mkdir } from 'fs/promises'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const BASE = 'http://localhost:3000'
const SHOTS = 'tests/screenshots'
await mkdir(SHOTS, { recursive: true })

const rnd = randomBytes(4).toString('hex')
const EMAIL = `test-${rnd}@semcomplicacao.test`
const PASSWORD = 'TestPass123!'
const NAME = `Verificação ${rnd}`
const WORKSPACE = `Workspace ${rnd}`

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const errors = []
const browserLogs = []
function log(emoji, msg) { console.log(`${emoji} ${msg}`) }
async function shot(page, name) {
  const path = `${SHOTS}/${name}.png`
  await page.screenshot({ path, fullPage: false })
  return path
}

// Wait for URL with progress logging
async function waitForDashboardOrOnboarding(page, timeoutMs = 20000) {
  try {
    await page.waitForURL(
      url => url.href.includes('/dashboard') || url.href.includes('/onboarding'),
      { timeout: timeoutMs }
    )
    return page.url()
  } catch {
    return page.url()
  }
}

// ─── 0. Create test user ──────────────────────────────────────────────────────
log('⚙️', `Creating test user ${EMAIL}`)
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  user_metadata: { full_name: NAME },
  email_confirm: true,
})
if (createErr || !created?.user) {
  console.error('❌ Failed to create test user:', createErr?.message)
  process.exit(1)
}
log('✅', `Test user created (id: ${created.user.id})`)

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()

// Capture browser console errors
page.on('console', msg => {
  if (msg.type() === 'error') browserLogs.push(`[browser error] ${msg.text()}`)
})
page.on('pageerror', err => {
  browserLogs.push(`[page error] ${err.message}`)
})

try {
  // ── 1. Route protection: unauthenticated /dashboard → /login ─────────────────
  log('🔍', 'Probe: GET /dashboard unauthenticated')
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' })
  await page.waitForURL(url => url.href.includes('/login'), { timeout: 5000 }).catch(() => {})
  const url1 = page.url()
  if (url1.includes('/login')) {
    log('✅', `Unauthenticated /dashboard → /login`)
  } else {
    errors.push(`❌ Route protection FAILED — stayed on ${url1}`)
  }
  await shot(page, '01-route-protection')

  // ── 2. Register page: UI validation ──────────────────────────────────────────
  log('🔍', 'Register page validation UI')
  await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' })
  await shot(page, '02-register-page')

  // Empty submit
  await page.click('button[type="submit"]')
  await page.waitForTimeout(500)
  const allTextAfterEmpty = await page.$$eval('p', els =>
    els.map(e => e.textContent?.trim()).filter(Boolean)
  )
  const requiredMessages = ['Nome é obrigatório', 'E-mail é obrigatório', 'Senha é obrigatória']
  const foundRequired = requiredMessages.filter(m => allTextAfterEmpty.some(t => t?.includes(m)))
  log(foundRequired.length === 3 ? '✅' : '⚠️',
    `Register empty validation (${foundRequired.length}/3): ${foundRequired.join(', ')}`)
  if (foundRequired.length < 3) errors.push(`❌ Missing validation: ${requiredMessages.filter(m => !foundRequired.includes(m)).join(', ')}`)
  await shot(page, '03-register-validation')

  // Password mismatch
  await page.fill('input[id="name"]', 'Test User')
  await page.fill('input[id="email"]', 'test@test.com')
  await page.fill('input[id="password"]', 'Pass1234!')
  await page.fill('input[id="confirm-password"]', 'Different!')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(500)
  const mismatchText = await page.textContent('body')
  log(mismatchText?.includes('não coincidem') ? '✅' : '❌', 'Password mismatch validation')
  if (!mismatchText?.includes('não coincidem')) errors.push('❌ Password mismatch not validated')
  await shot(page, '04-register-mismatch')

  // ── 3. Login with wrong password (probe) — fresh browser context to avoid cooldown ──
  log('🔍', 'Probe: login with wrong password (isolated context)')
  const ctxWrong = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const pageWrong = await ctxWrong.newPage()
  await pageWrong.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await pageWrong.fill('input[id="email"]', EMAIL)
  await pageWrong.fill('input[id="password"]', 'wrongpassword')
  await pageWrong.click('button[type="submit"]')
  await pageWrong.waitForFunction(
    () => document.body.textContent?.includes('incorretos') || document.body.textContent?.includes('inválid'),
    { timeout: 12000 }
  ).catch(() => {})
  const wrongPwBody = await pageWrong.textContent('body')
  const hasWrongPwErr = wrongPwBody?.includes('incorretos') || wrongPwBody?.includes('inválid')
  log(hasWrongPwErr ? '✅' : '❌', `Wrong password error shown: ${hasWrongPwErr}`)
  if (!hasWrongPwErr) errors.push('❌ Wrong password error not shown')
  await shot(pageWrong, '05-login-wrong-password')
  await ctxWrong.close()

  // ── 4. Login with correct credentials (fresh context — no cooldown from wrong password) ──
  log('🔍', `Login as ${EMAIL}`)
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.fill('input[id="email"]', EMAIL)
  await page.fill('input[id="password"]', PASSWORD)
  await shot(page, '06-login-filled')
  await page.click('button[type="submit"]')

  log('  ', 'Waiting for post-login navigation (up to 20s for Supabase cold start)...')
  const afterLogin = await waitForDashboardOrOnboarding(page, 20000)
  await shot(page, '07-after-login')

  if (afterLogin.includes('/dashboard') || afterLogin.includes('/onboarding')) {
    log('✅', `Login → ${afterLogin}`)
  } else {
    errors.push(`❌ After login: expected /dashboard or /onboarding — got ${afterLogin}`)
    // Capture what the page shows
    const loginPageText = await page.textContent('body')
    const loginErr = loginPageText?.match(/[A-ZÁÉÍÓÚ][^.!?]{5,60}[.!?]/g)?.slice(0, 3)
    log('  ', `Page content snippets: ${loginErr?.join(' | ')}`)
  }

  // ── 5. Authenticated user hitting /login redirects away ───────────────────────
  const currentUrl = page.url()
  if (currentUrl.includes('/dashboard') || currentUrl.includes('/onboarding')) {
    log('🔍', 'Probe: authenticated GET /login → should redirect')
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
    await page.waitForURL(url => url.href.includes('/dashboard') || url.href.includes('/onboarding'), { timeout: 5000 }).catch(() => {})
    const authLoginUrl = page.url()
    if (authLoginUrl.includes('/dashboard') || authLoginUrl.includes('/onboarding')) {
      log('✅', `Authenticated /login → ${authLoginUrl}`)
    } else {
      errors.push(`❌ Authenticated /login did not redirect — got ${authLoginUrl}`)
    }
    await shot(page, '08-auth-login-redirect')
  }

  // ── 6. Onboarding ────────────────────────────────────────────────────────────
  const preOnboardUrl = page.url()
  if (!preOnboardUrl.includes('/onboarding')) {
    await page.goto(`${BASE}/onboarding`, { waitUntil: 'networkidle' })
  }

  const onboardCurrentUrl = page.url()
  if (onboardCurrentUrl.includes('/login')) {
    errors.push(`❌ /onboarding redirected to /login (not authenticated?)`)
  } else {
    log('✅', `Onboarding at: ${onboardCurrentUrl}`)
    await shot(page, '09-onboarding')

    // Empty workspace name
    await page.click('button[type="submit"]')
    await page.waitForTimeout(400)
    const onboardBody = await page.textContent('body')
    log(onboardBody?.includes('obrigatório') ? '✅' : '❌', 'Empty workspace name rejected')
    if (!onboardBody?.includes('obrigatório')) errors.push('❌ Empty workspace name not validated')

    // Too short (2 chars)
    await page.fill('input[id="workspace-name"]', 'AB')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(400)
    const shortBody = await page.textContent('body')
    log(shortBody?.includes('mínimo') ? '✅' : '⚠️', 'Too-short workspace name (2 chars)')

    // Valid name
    await page.fill('input[id="workspace-name"]', WORKSPACE)
    await shot(page, '10-onboarding-filled')
    await page.click('button[type="submit"]')

    // Wait specifically for /dashboard (NOT /onboarding — we're already there)
    log('  ', 'Waiting for redirect to /dashboard (up to 25s)...')
    try {
      await page.waitForURL(url => url.href.includes('/dashboard'), { timeout: 25000 })
    } catch { /* screenshot will show what happened */ }
    const afterOnboard = page.url()
    await shot(page, '11-after-onboarding')

    if (afterOnboard.includes('/dashboard')) {
      log('✅', `Onboarding → /dashboard`)
    } else {
      errors.push(`❌ After onboarding: expected /dashboard — got ${afterOnboard}`)
    }
  }

  // ── 7. Dashboard content ─────────────────────────────────────────────────────
  if (page.url().includes('/dashboard')) {
    const hasSidebar = (await page.$('aside')) !== null
    const dashBody = await page.textContent('body')
    const hasDashContent = dashBody?.includes('Dashboard') || dashBody?.includes('Lead')
    const hasWorkspace = dashBody?.includes(WORKSPACE)

    log(hasSidebar ? '✅' : '❌', `Sidebar present`)
    log(hasDashContent ? '✅' : '❌', `Dashboard content visible`)
    log(hasWorkspace ? '✅' : '⚠️', `Workspace "${WORKSPACE}" visible in sidebar`)
    if (!hasSidebar) errors.push('❌ Sidebar not rendered')
    if (!hasDashContent) errors.push('❌ Dashboard content missing')
    await shot(page, '12-dashboard')
  }

  // ── 8. Logout ────────────────────────────────────────────────────────────────
  if (page.url().includes('/dashboard')) {
    log('🔍', 'Logout via header dropdown')

    // Click the Avatar in the header (it's a DropdownMenuTrigger with outline-none)
    const avatarTrigger = page.locator('header').locator('[class*="DropdownMenuTrigger"], [tabindex="0"]').last()
    await avatarTrigger.click()
    await page.waitForTimeout(600)
    await shot(page, '13-header-dropdown')

    const logoutBtn = page.getByRole('menuitem', { name: /sair/i })
    const logoutVisible = await logoutBtn.isVisible().catch(() => false)

    if (logoutVisible) {
      await logoutBtn.click()
      await page.waitForURL(url => url.href.includes('/login'), { timeout: 8000 }).catch(() => {})
      const afterLogout = page.url()
      await shot(page, '14-after-logout')
      log(afterLogout.includes('/login') ? '✅' : '❌', `Logout → ${afterLogout}`)
      if (!afterLogout.includes('/login')) errors.push(`❌ After logout expected /login — got ${afterLogout}`)
    } else {
      errors.push('❌ Logout button "Sair" not visible in dropdown')
      await shot(page, '13b-logout-missing')
    }

    // Post-logout route protection
    log('🔍', 'Probe: POST logout GET /dashboard')
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' })
    await page.waitForURL(url => url.href.includes('/login'), { timeout: 5000 }).catch(() => {})
    const postLogout = page.url()
    log(postLogout.includes('/login') ? '✅' : '❌', `Post-logout /dashboard → ${postLogout}`)
    if (!postLogout.includes('/login')) errors.push(`❌ Post-logout /dashboard not protected`)
    await shot(page, '15-post-logout-protect')
  }

  // ── 9. Check Supabase DB records ─────────────────────────────────────────────
  log('🔍', 'Check Supabase: workspace + member + subscription records')
  const { data: members } = await admin
    .from('workspace_members')
    .select('workspace_id, role, status')
    .eq('user_id', created.user.id)

  if (members && members.length > 0) {
    log('✅', `workspace_members: role=${members[0].role}, status=${members[0].status}`)

    const { data: ws } = await admin
      .from('workspaces')
      .select('name, slug')
      .eq('id', members[0].workspace_id)
      .single()
    log(ws ? '✅' : '❌', `workspace: name="${ws?.name}", slug="${ws?.slug}"`)
    if (!ws) errors.push('❌ workspace row missing')

    const { data: sub } = await admin
      .from('subscriptions')
      .select('plan, status')
      .eq('workspace_id', members[0].workspace_id)
      .single()
    log(sub ? '✅' : '❌', `subscription: plan="${sub?.plan}", status="${sub?.status}"`)
    if (!sub) errors.push('❌ subscription row missing after onboarding')
  } else {
    if (errors.some(e => e.includes('onboarding'))) {
      log('⚠️', 'Skipping DB check — onboarding did not complete')
    } else {
      errors.push('❌ No workspace_members row found in DB for test user')
    }
  }

} catch (err) {
  errors.push(`❌ Unexpected exception: ${err.message}`)
  console.error(err)
  await shot(page, 'error-state').catch(() => {})
} finally {
  await browser.close()
  await admin.auth.admin.deleteUser(created.user.id)
  log('🧹', `Test user deleted`)
}

// Print browser errors if any
if (browserLogs.length > 0) {
  console.log('\n--- Browser Console Errors ---')
  browserLogs.forEach(l => console.log(l))
}

console.log('\n=== VERIFICATION SUMMARY ===')
if (errors.length === 0) {
  console.log('✅ ALL CHECKS PASSED')
} else {
  console.log(`FAILED — ${errors.length} issue(s):`)
  errors.forEach(e => console.log(` ${e}`))
  process.exit(1)
}
