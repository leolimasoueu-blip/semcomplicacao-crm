import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"

test.describe("Leads — listagem", () => {
  test("carrega tabela com leads mockados", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible()
    await expect(page.getByText("Rafael Oliveira")).toBeVisible()
    await expect(page.getByText("Fernanda Lima")).toBeVisible()
    await page.screenshot({ path: "tests/screenshots/leads-list.png", fullPage: true })
  })

  test("busca por nome filtra a tabela", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.getByPlaceholder("Buscar por nome ou empresa...").fill("Rafael")
    await expect(page.getByText("Rafael Oliveira")).toBeVisible()
    await expect(page.getByText("Fernanda Lima")).not.toBeVisible()
    await page.screenshot({ path: "tests/screenshots/leads-search-nome.png" })
  })

  test("busca por empresa filtra a tabela", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.getByPlaceholder("Buscar por nome ou empresa...").fill("FastLog")
    await expect(page.getByText("Thiago Mendes")).toBeVisible()
    await expect(page.getByText("Fernanda Lima")).not.toBeVisible()
  })

  test("filtro por status filtra corretamente", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.selectOption("select", "customer")
    await expect(page.getByText("Marcelo Santos")).toBeVisible()
    await expect(page.getByText("Roberto Campos")).toBeVisible()
    await expect(page.getByText("Rafael Oliveira")).not.toBeVisible()
    await page.screenshot({ path: "tests/screenshots/leads-filter-status.png" })
  })

  test("combinar busca + filtro de status", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.getByPlaceholder("Buscar por nome ou empresa...").fill("Mar")
    await page.selectOption("select", "customer")
    await expect(page.getByText("Marcelo Santos")).toBeVisible()
    await expect(page.getByText("Roberto Campos")).not.toBeVisible()
  })

  test("botão Limpar restaura filtros", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.getByPlaceholder("Buscar por nome ou empresa...").fill("Rafael")
    await page.getByRole("button", { name: /Limpar/i }).click()
    await expect(page.getByText("Rafael Oliveira")).toBeVisible()
    await expect(page.getByText("Fernanda Lima")).toBeVisible()
  })

  test("busca sem resultado mostra empty state", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.getByPlaceholder("Buscar por nome ou empresa...").fill("xyz999naoexiste")
    await expect(page.getByText("Nenhum lead encontrado")).toBeVisible()
    await page.screenshot({ path: "tests/screenshots/leads-empty-search.png" })
  })
})

test.describe("Leads — ordenação", () => {
  test("clica no cabeçalho Nome e ordena", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.getByRole("columnheader", { name: /Nome/i }).click()
    await page.screenshot({ path: "tests/screenshots/leads-sort-nome.png" })
    await page.getByRole("columnheader", { name: /Nome/i }).click()
    await page.screenshot({ path: "tests/screenshots/leads-sort-nome-desc.png" })
  })
})

test.describe("Leads — modal de criação", () => {
  test("abre modal ao clicar em Novo Lead", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.getByRole("button", { name: "Novo Lead" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Novo Lead" })).toBeVisible()
    await page.screenshot({ path: "tests/screenshots/leads-modal-open.png" })
  })

  test("valida nome obrigatório", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.getByRole("button", { name: "Novo Lead" }).click()
    await page.getByRole("button", { name: "Salvar" }).click()
    await expect(page.getByText("Nome é obrigatório")).toBeVisible()
    await page.screenshot({ path: "tests/screenshots/leads-modal-validation.png" })
  })

  test("valida formato de e-mail inválido", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.getByRole("button", { name: "Novo Lead" }).click()
    await page.getByLabel("Nome *").fill("Teste Lead")
    await page.getByLabel("E-mail").fill("email-invalido")
    await page.getByRole("button", { name: "Salvar" }).click()
    await expect(page.getByText("E-mail inválido")).toBeVisible()
    await page.screenshot({ path: "tests/screenshots/leads-modal-email-invalid.png" })
  })

  test("cria novo lead com sucesso e aparece na tabela", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.getByRole("button", { name: "Novo Lead" }).click()
    await page.getByLabel("Nome *").fill("João Teste")
    await page.getByLabel("E-mail").fill("joao@teste.com.br")
    await page.getByLabel("Telefone").fill("(11) 91234-5678")
    await page.getByLabel("Empresa").fill("Empresa Teste")
    await page.getByRole("button", { name: "Salvar" }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 })
    await expect(page.getByText("João Teste")).toBeVisible()
    await page.screenshot({ path: "tests/screenshots/leads-created.png" })
  })
})

test.describe("Leads — modal de edição", () => {
  test("abre modal de edição ao clicar no ícone de lápis", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.locator("tr").filter({ hasText: "Rafael Oliveira" }).getByRole("button").click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Editar Lead" })).toBeVisible()
    await expect(page.getByLabel("Nome *")).toHaveValue("Rafael Oliveira")
    await page.screenshot({ path: "tests/screenshots/leads-modal-edit.png" })
  })

  test("edita e salva um lead", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.locator("tr").filter({ hasText: "Rafael Oliveira" }).getByRole("button").click()
    await page.getByLabel("Empresa").fill("Tech Solutions Updated")
    await page.getByRole("button", { name: "Salvar" }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 })
    await expect(page.getByText("Tech Solutions Updated")).toBeVisible()
  })

  test("exclui lead com confirmação em 2 cliques", async ({ page }) => {
    await page.goto(`${BASE}/leads`)
    await page.locator("tr").filter({ hasText: "Aline Ferreira" }).getByRole("button").click()
    await page.getByRole("button", { name: /Excluir/ }).click()
    await expect(page.getByText("Confirmar exclusão")).toBeVisible()
    await page.getByRole("button", { name: "Confirmar exclusão" }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 })
    await expect(page.getByText("Aline Ferreira")).not.toBeVisible()
    await page.screenshot({ path: "tests/screenshots/leads-deleted.png" })
  })
})

test.describe("Leads — página de detalhe", () => {
  test("carrega detalhe do lead l1 (Rafael Oliveira)", async ({ page }) => {
    await page.goto(`${BASE}/leads/l1`)
    await expect(page.locator("h1")).toContainText("Rafael Oliveira")
    await expect(page.getByText("Tech Solutions").first()).toBeVisible()
    await expect(page.getByText("CTO").first()).toBeVisible()
    await expect(page.getByText("rafael.oliveira@techsolutions.com.br")).toBeVisible()
    await page.screenshot({ path: "tests/screenshots/leads-detail-l1.png", fullPage: true })
  })

  test("mostra atividades na timeline", async ({ page }) => {
    await page.goto(`${BASE}/leads/l1`)
    await expect(page.getByText(/Ligação inicial para apresentação/)).toBeVisible()
    await expect(page.getByText(/Enviado material de apresentação/)).toBeVisible()
  })

  test("detalhe do lead l5 (Marcelo Santos — Cliente com 4 atividades)", async ({ page }) => {
    await page.goto(`${BASE}/leads/l5`)
    await expect(page.locator("h1")).toContainText("Marcelo Santos")
    await expect(page.getByText("BancoBR Financeira").first()).toBeVisible()
    await expect(page.getByText("Cliente", { exact: true }).first()).toBeVisible()
    await expect(page.getByText(/Contrato assinado/)).toBeVisible()
    await page.screenshot({ path: "tests/screenshots/leads-detail-l5.png", fullPage: true })
  })

  test("registra nova atividade no detalhe", async ({ page }) => {
    await page.goto(`${BASE}/leads/l1`)
    await page.getByPlaceholder("Descreva a atividade...").fill("Follow-up agendado para próxima semana.")
    await page.getByRole("button", { name: "Registrar atividade" }).click()
    await expect(page.getByText("Follow-up agendado para próxima semana.")).toBeVisible({ timeout: 3000 })
    await page.screenshot({ path: "tests/screenshots/leads-activity-added.png" })
  })

  test("formulário de atividade valida descrição vazia", async ({ page }) => {
    await page.goto(`${BASE}/leads/l1`)
    await page.getByRole("button", { name: "Registrar atividade" }).click()
    await expect(page.getByText("Descreva a atividade")).toBeVisible()
  })

  test("botão voltar retorna para /leads", async ({ page }) => {
    await page.goto(`${BASE}/leads/l1`)
    await page.getByRole("link", { name: "Voltar para Leads" }).click()
    await expect(page).toHaveURL(`${BASE}/leads`)
  })

  test("lead inexistente retorna 404", async ({ page }) => {
    const res = await page.goto(`${BASE}/leads/l999`)
    expect(res?.status()).toBe(404)
  })
})
