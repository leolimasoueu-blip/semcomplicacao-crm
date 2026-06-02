export interface InviteEmailData {
  workspaceName: string
  inviterEmail: string
  inviteUrl: string
}

export function inviteEmailHtml({ workspaceName, inviterEmail, inviteUrl }: InviteEmailData): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Convite para ${workspaceName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;padding:24px 32px;">
              <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">
                SemComplicação CRM
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">
                Você foi convidado!
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                <strong style="color:#0f172a;">${inviterEmail}</strong> convidou você para colaborar no workspace
                <strong style="color:#0f172a;">${workspaceName}</strong> no SemComplicação CRM.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#0ea5e9;border-radius:8px;">
                    <a href="${inviteUrl}"
                       style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                      Aceitar convite
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">
                Ou copie e cole o link abaixo no seu navegador:
              </p>
              <p style="margin:0 0 24px;font-size:13px;color:#0ea5e9;word-break:break-all;">
                ${inviteUrl}
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;" />

              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                Este convite expira em <strong>7 dias</strong>. Se você não esperava receber este e-mail, pode ignorá-lo com segurança.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                © ${new Date().getFullYear()} SemComplicação CRM. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
