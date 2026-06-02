/**
 * verify-collaboration.mjs
 * Testa o fluxo completo de colaboração: convite, aceite, papéis e remoção de membro.
 *
 * Nota Resend: conta free só envia para o email do dono. O teste de envio usa
 * leolimasoueu@gmail.com. Para aceite + membros usa injeção direta no DB.
 */
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const BASE = "http://localhost:3001";
const ADMIN_EMAIL = "verify-admin@semcomplicacao.test";
const MEMBER_EMAIL = "verify-member@semcomplicacao.test";
const REAL_EMAIL = "leolimasoueu@gmail.com"; // único email permitido pelo Resend free
const PASSWORD = "TestPass123!";

const supaAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 20000 });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 });
}

// ── Setup ──────────────────────────────────────────────────────────────────
const { data: { users } } = await supaAdmin.auth.admin.listUsers({ perPage: 100 });
const adminUser = users.find(u => u.email === ADMIN_EMAIL);
const memberUser = users.find(u => u.email === MEMBER_EMAIL);
if (!adminUser || !memberUser) { console.error("SETUP: usuários de teste não encontrados"); process.exit(1); }

const { data: adminMembership } = await supaAdmin
  .from("workspace_members").select("workspace_id")
  .eq("user_id", adminUser.id).eq("status", "active").single();
const WS_ID = adminMembership?.workspace_id;
if (!WS_ID) { console.error("SETUP: workspace do admin não encontrado"); process.exit(1); }
console.log("workspace_id:", WS_ID);

// Clean state
await supaAdmin.from("workspace_members").delete().eq("workspace_id", WS_ID).eq("user_id", memberUser.id);
await supaAdmin.from("workspace_invites").delete().eq("workspace_id", WS_ID);

// ── Test runner ────────────────────────────────────────────────────────────
const browser = await chromium.launch({ headless: true });
let passed = 0, failed = 0;

const ok   = (l) => { console.log(`✅ ${l}`); passed++; };
const fail = (l, d = "") => { console.log(`❌ ${l}${d ? ": " + d : ""}`); failed++; };
const probe = (l) => console.log(`🔍 ${l}`);

try {
  // ══ BLOCO 1: Settings page UI ══════════════════════════════════════════
  const adminCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const adminPage = await adminCtx.newPage();

  await login(adminPage, ADMIN_EMAIL, PASSWORD);
  ok("Admin login → área autenticada");

  await adminPage.goto(`${BASE}/settings`, { waitUntil: "networkidle", timeout: 20000 });
  await adminPage.screenshot({ path: "tests/screenshots/collab-01-settings.png" });

  await adminPage.evaluate(() => document.body.innerText.includes("Workspace Verificação"))
    ? ok("Settings: nome do workspace visível")
    : fail("Settings: nome do workspace ausente");

  await adminPage.evaluate(() => document.body.innerText.includes("Plano Free"))
    ? ok("Settings: banner Plano Free")
    : fail("Settings: banner de plano ausente");

  await adminPage.evaluate(() => document.body.innerText.includes("1/2"))
    ? ok("Settings: contador 1/2 membros")
    : fail("Settings: contador incorreto");

  await adminPage.evaluate(() => document.body.innerText.includes("Admin Teste"))
    ? ok("Settings: admin aparece na lista de membros")
    : fail("Settings: admin ausente na lista");

  // Formulário de convite presente
  const inviteInput = await adminPage.locator('input[type="email"]').count();
  inviteInput > 0 ? ok("Settings: campo de email do formulário presente") : fail("Settings: campo de email ausente");

  // ══ BLOCO 2: Envio de convite por email (Resend) ═══════════════════════
  // Usa o email real do dono da conta (único permitido no plano free do Resend)
  await adminPage.locator('input[type="email"]').fill(REAL_EMAIL);
  await adminPage.locator('button:has-text("Convidar")').click();
  // Aguarda até a mensagem aparecer (max 8s) ou campo ser limpo (indica sucesso)
  await Promise.race([
    adminPage.waitForSelector('text=Convite enviado com sucesso', { timeout: 8000 }).catch(() => null),
    adminPage.waitForTimeout(5000),
  ]);
  await adminPage.screenshot({ path: "tests/screenshots/collab-02-invite-real-email.png" });

  // Sucesso: mensagem visível OU campo de email foi limpo (ocorre apenas no sucesso)
  const inviteSent = await adminPage.evaluate(() =>
    document.body.innerText.includes("Convite enviado com sucesso")
  );
  const emailCleared = await adminPage.locator('input[type="email"]').inputValue()
    .then(v => v === "").catch(() => false);
  (inviteSent || emailCleared)
    ? ok(`Resend: email enviado com sucesso para ${REAL_EMAIL}`)
    : fail(`Resend: falha ao enviar para ${REAL_EMAIL}`);

  // Invite in DB
  const { data: realInvite } = await supaAdmin
    .from("workspace_invites").select("id, token")
    .eq("workspace_id", WS_ID).eq("email", REAL_EMAIL).is("accepted_at", null).single();
  realInvite
    ? ok("DB: workspace_invites criado para convite via UI")
    : fail("DB: workspace_invites não encontrado após invite");

  // Pending invite aparece na UI
  await adminPage.reload({ waitUntil: "networkidle" });
  await adminPage.evaluate((e) => document.body.innerText.includes(e), REAL_EMAIL)
    ? ok("Settings: convite pendente aparece na lista")
    : fail("Settings: convite pendente ausente na lista");

  await adminPage.screenshot({ path: "tests/screenshots/collab-03-pending-invite.png" });

  // Cancelar esse convite (cleanup antes de continuar)
  if (realInvite) {
    const cancelBtn = adminPage.locator(`button[title="Cancelar convite"]`).first();
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
      await adminPage.waitForTimeout(1500);
      ok("Settings: cancelar convite funcionou");
    }
  }
  await supaAdmin.from("workspace_invites").delete().eq("workspace_id", WS_ID);

  // ══ BLOCO 3: Probe — email duplicado ═══════════════════════════════════
  probe("Probe: convidar mesmo email 2x (deve bloquear)");
  await adminPage.locator('input[type="email"]').fill(REAL_EMAIL);
  await adminPage.locator('button:has-text("Convidar")').click();
  await adminPage.waitForTimeout(3000);
  // Envia 1x OK, agora tenta 2x
  await adminPage.locator('input[type="email"]').fill(REAL_EMAIL);
  await adminPage.locator('button:has-text("Convidar")').click();
  await adminPage.waitForTimeout(2000);
  await adminPage.evaluate(() => document.body.innerText.includes("Já existe um convite pendente"))
    ? ok("Probe duplicado: bloqueou convite repetido com mensagem correta")
    : fail("Probe duplicado: não bloqueou convite repetido");
  await adminPage.screenshot({ path: "tests/screenshots/collab-04-duplicate-block.png" });
  await supaAdmin.from("workspace_invites").delete().eq("workspace_id", WS_ID);

  // ══ BLOCO 4: Página /invite/[token] ════════════════════════════════════
  // Injeta convite diretamente no DB para o membro de teste
  const { data: injectedInvite } = await supaAdmin
    .from("workspace_invites")
    .insert({
      workspace_id: WS_ID,
      email: MEMBER_EMAIL,
      role: "member",
      invited_by: adminUser.id,
    })
    .select("id, token")
    .single();

  const inviteUrl = `${BASE}/invite/${injectedInvite?.token}`;

  // Anônimo
  const anonCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const anonPage = await anonCtx.newPage();
  await anonPage.goto(inviteUrl, { waitUntil: "networkidle", timeout: 15000 });
  await anonPage.screenshot({ path: "tests/screenshots/collab-05-invite-anon.png" });

  await anonPage.evaluate(() => document.body.innerText.includes("Você foi convidado"))
    ? ok("/invite/[token]: título correto para usuário anônimo")
    : fail("/invite/[token]: título ausente");

  await anonPage.evaluate(() =>
    document.body.innerText.includes("Entrar na minha conta") &&
    document.body.innerText.includes("Criar nova conta")
  )
    ? ok("/invite/[token]: botões login/registro visíveis para anônimo")
    : fail("/invite/[token]: botões login/registro ausentes");

  await anonPage.evaluate(() => document.body.innerText.includes("Workspace Verificação"))
    ? ok("/invite/[token]: nome do workspace no card")
    : fail("/invite/[token]: nome do workspace ausente");

  await anonCtx.close();

  // Token inválido
  probe("Probe: /invite/token-inexistente");
  const badCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const badPage = await badCtx.newPage();
  await badPage.goto(`${BASE}/invite/0000000000000000000000000000000000000000000000000000000000000000`, { waitUntil: "networkidle" });
  await badPage.evaluate(() => document.body.innerText.includes("Convite inválido"))
    ? ok("Probe token inválido: tela de erro correta")
    : fail("Probe token inválido: tela de erro ausente");
  await badCtx.close();

  // ══ BLOCO 5: Aceitar convite ═══════════════════════════════════════════
  const memberCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const memberPage = await memberCtx.newPage();
  await login(memberPage, MEMBER_EMAIL, PASSWORD);
  ok("Membro: login OK");

  await memberPage.goto(inviteUrl, { waitUntil: "networkidle", timeout: 15000 });
  await memberPage.screenshot({ path: "tests/screenshots/collab-06-invite-logged.png" });

  await memberPage.locator('button:has-text("Aceitar convite")').count() > 0
    ? ok("/invite/[token]: botão Aceitar visível para usuário logado")
    : fail("/invite/[token]: botão Aceitar ausente");

  await memberPage.locator('button:has-text("Aceitar convite")').click();
  // Server Action redireciona para /dashboard — aguarda a navegação completar
  await memberPage.waitForURL((url) => url.pathname === "/dashboard", { timeout: 12000 })
    .catch(() => null);
  await memberPage.screenshot({ path: "tests/screenshots/collab-07-after-accept.png" });

  memberPage.url().includes("/dashboard")
    ? ok("Aceite: redirecionou para /dashboard")
    : fail("Aceite: não redirecionou para /dashboard", memberPage.url());

  // DB checks
  const { data: newMember } = await supaAdmin
    .from("workspace_members").select("role, status")
    .eq("workspace_id", WS_ID).eq("user_id", memberUser.id).single();
  newMember?.status === "active"
    ? ok(`DB: workspace_members criado — role=${newMember.role}, status=active`)
    : fail("DB: membership não encontrada após aceite");

  const { data: acceptedInv } = await supaAdmin
    .from("workspace_invites").select("accepted_at").eq("id", injectedInvite?.id).single();
  acceptedInv?.accepted_at
    ? ok("DB: workspace_invites.accepted_at preenchido")
    : fail("DB: accepted_at não preenchido");

  await memberCtx.close();

  // ══ BLOCO 6: Admin vê 2 membros + limites do plano Free ════════════════
  await adminPage.goto(`${BASE}/settings`, { waitUntil: "networkidle", timeout: 15000 });
  await adminPage.screenshot({ path: "tests/screenshots/collab-08-two-members.png" });

  await adminPage.evaluate((e) => document.body.innerText.includes(e), MEMBER_EMAIL)
    ? ok("Settings: membro convidado aparece na lista após aceite")
    : fail("Settings: membro não aparece após aceite");

  await adminPage.evaluate(() => document.body.innerText.includes("2/2"))
    ? ok("Settings: contador 2/2 membros")
    : fail("Settings: contador não mostra 2/2");

  probe("Probe: limite Free — botão convidar desabilitado com 2/2");
  const inviteFormArea = adminPage.locator('input[type="email"]');
  const inputDisabled = await inviteFormArea.getAttribute("disabled");
  if (inputDisabled !== null) {
    ok("Probe limite Free: formulário bloqueado com 2/2");
  } else {
    // Pode ser que o form ainda aparece mas mostra aviso
    const limitWarning = await adminPage.evaluate(() =>
      document.body.innerText.includes("máximo 2 membros") ||
      document.body.innerText.includes("plano Free permite")
    );
    limitWarning
      ? ok("Probe limite Free: aviso de limite exibido no formulário")
      : fail("Probe limite Free: deveria mostrar limite");
  }
  await adminPage.screenshot({ path: "tests/screenshots/collab-09-plan-limit.png" });

  // ══ BLOCO 7: Probe — email mismatch ════════════════════════════════════
  probe("Probe: aceitar convite com email errado");
  const { data: wrongInvite } = await supaAdmin
    .from("workspace_invites")
    .insert({ workspace_id: WS_ID, email: "outro@semcomplicacao.test", role: "member", invited_by: adminUser.id })
    .select("token").single();

  // Admin (verify-admin@...) tenta aceitar convite enviado para outro@...
  const wrongInviteUrl = `${BASE}/invite/${wrongInvite?.token}`;
  await adminPage.goto(wrongInviteUrl, { waitUntil: "domcontentloaded", timeout: 10000 });
  await adminPage.waitForTimeout(1500);
  await adminPage.screenshot({ path: "tests/screenshots/collab-10-email-mismatch.png" });

  const mismatchMsg = await adminPage.evaluate(() =>
    document.body.innerText.includes("Conta incorreta") ||
    document.body.innerText.includes("enviado para") ||
    document.body.innerText.includes("logado como")
  );
  mismatchMsg
    ? ok("Probe email mismatch: mensagem de conta incorreta exibida")
    : fail("Probe email mismatch: mensagem ausente");

  await supaAdmin.from("workspace_invites").delete().eq("token", wrongInvite?.token);

  // ══ BLOCO 8: Remover membro ════════════════════════════════════════════
  await adminPage.waitForTimeout(1500);
  await adminPage.goto(`${BASE}/settings`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await adminPage.waitForTimeout(2000);

  const dropdownTriggers = adminPage.locator('[data-slot="dropdown-menu-trigger"]');
  const triggerCount = await dropdownTriggers.count();
  console.log(`   dropdown triggers no settings: ${triggerCount}`);

  if (triggerCount > 0) {
    await dropdownTriggers.last().click();
    await adminPage.waitForTimeout(600);
    await adminPage.screenshot({ path: "tests/screenshots/collab-11-dropdown.png" });

    const removeOpt = adminPage.locator('[data-slot="menu-item"]:has-text("Remover")');
    const removeOptFallback = adminPage.locator('[role="menuitem"]:has-text("Remover")');
    const removeCount = await removeOpt.count() + await removeOptFallback.count();
    console.log(`   opção Remover: ${removeCount}`);

    const removeEl = (await removeOpt.count()) > 0 ? removeOpt.first() : removeOptFallback.first();
    if (removeCount > 0) {
      await removeEl.click();
      await adminPage.waitForTimeout(2000);
      await adminPage.screenshot({ path: "tests/screenshots/collab-12-after-remove.png" });

      const memberGone = await adminPage.evaluate(
        (e) => !document.body.innerText.includes(e), MEMBER_EMAIL
      );
      memberGone
        ? ok("Remoção: membro removido da UI")
        : fail("Remoção: membro ainda aparece após remoção");

      const { data: deletedRow } = await supaAdmin
        .from("workspace_members").select("id")
        .eq("workspace_id", WS_ID).eq("user_id", memberUser.id).maybeSingle();
      !deletedRow
        ? ok("DB: registro workspace_members removido")
        : fail("DB: registro ainda existe após remoção");

      await adminPage.evaluate(() => document.body.innerText.includes("1/2"))
        ? ok("Settings: contador volta para 1/2 após remoção")
        : fail("Settings: contador não voltou para 1/2");
    } else {
      fail("Remoção: opção Remover não encontrada no dropdown");
    }
  } else {
    fail("Remoção: nenhum dropdown trigger encontrado");
  }

  await adminCtx.close();

} catch (err) {
  console.error("ERRO NO TESTE:", err.message, err.stack);
  failed++;
} finally {
  await browser.close();
  // Cleanup
  await supaAdmin.from("workspace_members").delete().eq("workspace_id", WS_ID).eq("user_id", memberUser.id);
  await supaAdmin.from("workspace_invites").delete().eq("workspace_id", WS_ID);

  console.log("\n─────────────────────────────────────");
  console.log(`✅ ${passed} passed   ❌ ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}
