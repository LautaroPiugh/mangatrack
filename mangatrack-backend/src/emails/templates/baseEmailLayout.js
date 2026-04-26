const getBaseEmailLayout = ({ appName, preheader, title, intro, buttonText, buttonUrl, buttonFallbackText, fallbackUrl, secondaryText, expirationText, footerText }) => `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appName}</title>
  </head>
  <body style="margin:0;padding:0;background:#06070b;color:#e2e8f0;font-family:Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <div style="width:100%;background:#06070b;padding:24px 0;">
      <div style="margin:0 auto;max-width:680px;padding:0 20px;">
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:24px;overflow:hidden;">
          <div style="padding:32px 28px 24px;">
            <span style="display:block;color:#38bdf8;font-size:14px;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:18px;">${appName}</span>
            <h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;color:#f8fafc;">${title}</h1>
            <p style="margin:0 0 24px;color:#cbd5e1;font-size:16px;line-height:1.8;">${intro}</p>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${buttonUrl}" style="display:inline-flex;align-items:center;justify-content:center;padding:14px 24px;background:#14b8a6;color:#020617;text-decoration:none;border-radius:14px;font-weight:700;box-shadow:0 12px 30px rgba(20,184,166,0.24);">${buttonText}</a>
            </div>
            <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;line-height:1.75;">Si el botón no funciona, copiá y pegá este enlace en tu navegador:</p>
            <p style="margin:0 0 24px;font-size:14px;word-break:break-all;color:#60a5fa;">${fallbackUrl}</p>
            ${expirationText ? `<p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.75;"><strong>${expirationText}</strong></p>` : ''}
            <p style="margin:0 0 20px;color:#cbd5e1;font-size:14px;line-height:1.75;">${secondaryText}</p>
          </div>
          <div style="background:#020617;border-top:1px solid #111827;padding:18px 28px;">
            <p style="margin:0;color:#64748b;font-size:13px;line-height:1.8;">${footerText}</p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;

module.exports = { getBaseEmailLayout };