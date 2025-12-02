using Certus.Infrastructure.Configuration;
using Microsoft.Extensions.Options;

namespace Certus.Infrastructure.Services.Email;

/// <summary>
/// Modern Email Template Service
///
/// Design System aligned with Certus brand:
/// - Primary: #0066FF (Certus Blue)
/// - Success: #00D4AA (Teal)
/// - Warning: #FF6B35 (Orange)
/// - Danger: #EF4444 (Red)
/// - Typography: Inter/SF Pro stack
///
/// Best Practices implemented:
/// - Mobile-first responsive (600px max-width)
/// - Dark mode support via prefers-color-scheme
/// - WCAG 2.1 AA compliant contrast ratios
/// - Table-based layout for email client compatibility
/// - Inline styles for maximum compatibility
/// - Plain text fallbacks
/// </summary>
public partial class EmailTemplateService
{
    private readonly EmailOptions _options;
    private readonly Dictionary<string, EmailTemplate> _templates;

    // Brand Color System
    private const string ColorPrimary = "#0066FF";
    private const string ColorPrimaryDark = "#0052CC";
    private const string ColorPrimaryLight = "#E6F0FF";
    private const string ColorSuccess = "#00D4AA";
    private const string ColorSuccessLight = "#E6FBF7";
    private const string ColorSuccessDark = "#00A789";
    private const string ColorWarning = "#FF6B35";
    private const string ColorWarningLight = "#FFF3EE";
    private const string ColorWarningDark = "#CC5629";
    private const string ColorDanger = "#EF4444";
    private const string ColorDangerLight = "#FEF2F2";
    private const string ColorDangerDark = "#DC2626";
    private const string ColorTextPrimary = "#1A202C";
    private const string ColorTextSecondary = "#5B6B7D";
    private const string ColorTextMuted = "#8B95A5";
    private const string ColorBorder = "#E1E8F0";
    private const string ColorBackground = "#F7F9FC";
    private const string ColorWhite = "#FFFFFF";

    public EmailTemplateService(IOptions<EmailOptions> options)
    {
        _options = options.Value;
        _templates = InitializeTemplates();
    }

    /// <summary>
    /// Render a template with data
    /// </summary>
    public (string Subject, string HtmlBody, string TextBody) RenderTemplate(
        string templateName,
        Dictionary<string, object> data)
    {
        if (!_templates.TryGetValue(templateName, out var template))
        {
            throw new ArgumentException($"Template '{templateName}' not found", nameof(templateName));
        }

        // Add default variables
        data["CompanyName"] = _options.CompanyName;
        data["BaseUrl"] = _options.BaseUrl;
        data["SupportEmail"] = _options.SupportEmail;
        data["Year"] = DateTime.UtcNow.Year;

        var subject = ReplacePlaceholders(template.Subject, data);
        var htmlBody = WrapInLayout(ReplacePlaceholders(template.HtmlBody, data), data);
        var textBody = ReplacePlaceholders(template.TextBody, data);

        return (subject, htmlBody, textBody);
    }

    private static string ReplacePlaceholders(string content, Dictionary<string, object> data)
    {
        foreach (var kvp in data)
        {
            content = content.Replace($"{{{{{kvp.Key}}}}}", kvp.Value?.ToString() ?? string.Empty);
        }
        return content;
    }

    /// <summary>
    /// Modern responsive email layout with dark mode support
    /// </summary>
    private string WrapInLayout(string bodyContent, Dictionary<string, object> data)
    {
        var preheader = data.TryGetValue("Preheader", out var ph) ? ph?.ToString() ?? "" : "";

        return $@"<!DOCTYPE html>
<html lang=""es"" xmlns=""http://www.w3.org/1999/xhtml"" xmlns:v=""urn:schemas-microsoft-com:vml"" xmlns:o=""urn:schemas-microsoft-com:office:office"">
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <meta http-equiv=""X-UA-Compatible"" content=""IE=edge"">
    <meta name=""x-apple-disable-message-reformatting"">
    <meta name=""color-scheme"" content=""light dark"">
    <meta name=""supported-color-schemes"" content=""light dark"">
    <title>{_options.CompanyName}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        :root {{
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }}

        /* Reset styles */
        body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
        table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
        img {{ -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }}

        body {{
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background-color: {ColorBackground};
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }}

        /* Typography */
        h1, h2, h3, h4, h5, h6 {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-weight: 600;
            color: {ColorTextPrimary};
            margin: 0 0 16px 0;
        }}

        p {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: {ColorTextSecondary};
            margin: 0 0 16px 0;
        }}

        a {{
            color: {ColorPrimary};
            text-decoration: none;
        }}

        a:hover {{
            text-decoration: underline;
        }}

        /* Button styles */
        .button {{
            display: inline-block;
            background-color: {ColorPrimary};
            color: {ColorWhite} !important;
            padding: 14px 32px;
            text-decoration: none !important;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            text-align: center;
            transition: background-color 0.2s ease;
        }}

        .button:hover {{
            background-color: {ColorPrimaryDark};
        }}

        .button-secondary {{
            background-color: transparent;
            border: 2px solid {ColorPrimary};
            color: {ColorPrimary} !important;
        }}

        /* Alert/Status boxes */
        .status-box {{
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
        }}

        .status-success {{
            background-color: {ColorSuccessLight};
            border-left: 4px solid {ColorSuccess};
        }}

        .status-warning {{
            background-color: {ColorWarningLight};
            border-left: 4px solid {ColorWarning};
        }}

        .status-danger {{
            background-color: {ColorDangerLight};
            border-left: 4px solid {ColorDanger};
        }}

        .status-info {{
            background-color: {ColorPrimaryLight};
            border-left: 4px solid {ColorPrimary};
        }}

        /* Data table */
        .data-table {{
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 20px 0;
        }}

        .data-table td {{
            padding: 14px 16px;
            border-bottom: 1px solid {ColorBorder};
            font-size: 14px;
        }}

        .data-table td:first-child {{
            font-weight: 500;
            color: {ColorTextMuted};
            width: 35%;
        }}

        .data-table td:last-child {{
            color: {ColorTextPrimary};
        }}

        .data-table tr:last-child td {{
            border-bottom: none;
        }}

        /* Responsive */
        @media screen and (max-width: 600px) {{
            .email-container {{
                width: 100% !important;
                max-width: 100% !important;
            }}
            .content-padding {{
                padding: 24px 20px !important;
            }}
            .mobile-padding {{
                padding-left: 16px !important;
                padding-right: 16px !important;
            }}
            h1 {{
                font-size: 24px !important;
            }}
            h2 {{
                font-size: 20px !important;
            }}
            .button {{
                display: block !important;
                width: 100% !important;
                padding: 16px 24px !important;
            }}
        }}

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {{
            body {{
                background-color: #0F1419 !important;
            }}
            .email-wrapper {{
                background-color: #0F1419 !important;
            }}
            .email-container {{
                background-color: #1A202C !important;
            }}
            h1, h2, h3, h4, h5, h6 {{
                color: #F7F9FC !important;
            }}
            p, .text-content {{
                color: #C7D2E0 !important;
            }}
            .data-table td:first-child {{
                color: #8B95A5 !important;
            }}
            .data-table td:last-child {{
                color: #F7F9FC !important;
            }}
            .data-table td {{
                border-bottom-color: #2D3748 !important;
            }}
            .footer-text {{
                color: #5B6B7D !important;
            }}
            .divider {{
                border-color: #2D3748 !important;
            }}
        }}

        /* Outlook Dark Mode */
        [data-ogsc] h1, [data-ogsc] h2, [data-ogsc] h3 {{
            color: #F7F9FC !important;
        }}
        [data-ogsc] p {{
            color: #C7D2E0 !important;
        }}
    </style>
</head>
<body style=""margin: 0; padding: 0; background-color: {ColorBackground};"">
    <!-- Preheader text (hidden but shows in email preview) -->
    <div style=""display: none; max-height: 0; overflow: hidden; mso-hide: all;"">
        {preheader}
        &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>

    <!-- Email wrapper -->
    <table role=""presentation"" class=""email-wrapper"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: {ColorBackground};"">
        <tr>
            <td align=""center"" style=""padding: 40px 16px;"">

                <!-- Email container -->
                <table role=""presentation"" class=""email-container"" width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background-color: {ColorWhite}; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); max-width: 600px;"">

                    <!-- Header with Logo -->
                    <tr>
                        <td class=""content-padding"" style=""padding: 32px 40px 24px 40px; text-align: center;"">
                            <!-- Logo -->
                            <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td align=""center"">
                                        <div style=""display: inline-block; background: linear-gradient(135deg, {ColorPrimary} 0%, {ColorPrimaryDark} 100%); border-radius: 12px; padding: 12px 20px;"">
                                            <span style=""font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 24px; font-weight: 700; color: {ColorWhite}; letter-spacing: -0.5px;"">{_options.CompanyName}</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style=""padding: 0 40px;"">
                            <div class=""divider"" style=""border-bottom: 1px solid {ColorBorder};""></div>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td class=""content-padding"" style=""padding: 32px 40px;"">
                            {bodyContent}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style=""padding: 0 40px;"">
                            <div class=""divider"" style=""border-bottom: 1px solid {ColorBorder};""></div>
                        </td>
                    </tr>
                    <tr>
                        <td class=""content-padding"" style=""padding: 24px 40px 32px 40px;"">
                            <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td align=""center"">
                                        <p class=""footer-text"" style=""font-size: 13px; color: {ColorTextMuted}; margin: 0 0 8px 0;"">
                                            &copy; {DateTime.UtcNow.Year} {_options.CompanyName}. Todos los derechos reservados.
                                        </p>
                                        <p class=""footer-text"" style=""font-size: 13px; color: {ColorTextMuted}; margin: 0 0 16px 0;"">
                                            Plataforma de Validación CONSAR
                                        </p>
                                        <p class=""footer-text"" style=""font-size: 12px; color: {ColorTextMuted}; margin: 0;"">
                                            ¿Necesitas ayuda? <a href=""mailto:{_options.SupportEmail}"" style=""color: {ColorPrimary}; text-decoration: none;"">{_options.SupportEmail}</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
                <!-- End email container -->

                <!-- Security note -->
                <table role=""presentation"" width=""600"" cellpadding=""0"" cellspacing=""0"" style=""max-width: 600px;"">
                    <tr>
                        <td align=""center"" style=""padding: 24px 40px;"">
                            <p style=""font-size: 11px; color: {ColorTextMuted}; margin: 0; line-height: 1.5;"">
                                Este correo fue enviado desde un sistema automatizado. Por favor no responda directamente a este mensaje.
                                <br>
                                Si no esperabas este correo, puedes ignorarlo de forma segura.
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>";
    }

    /// <summary>
    /// Generate a styled button HTML
    /// </summary>
    private static string GenerateButton(string text, string url, string variant = "primary")
    {
        var bgColor = variant == "secondary" ? "transparent" : ColorPrimary;
        var textColor = variant == "secondary" ? ColorPrimary : ColorWhite;
        var border = variant == "secondary" ? $"border: 2px solid {ColorPrimary};" : "";

        return $@"
        <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
            <tr>
                <td align=""center"" style=""padding: 8px 0;"">
                    <!--[if mso]>
                    <v:roundrect xmlns:v=""urn:schemas-microsoft-com:vml"" xmlns:w=""urn:schemas-microsoft-com:office:word"" href=""{url}"" style=""height:48px;v-text-anchor:middle;width:200px;"" arcsize=""17%"" strokecolor=""{ColorPrimary}"" fillcolor=""{bgColor}"">
                    <w:anchorlock/>
                    <center style=""color:{textColor};font-family:'Inter',sans-serif;font-size:15px;font-weight:600;"">{text}</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href=""{url}"" style=""display: inline-block; background-color: {bgColor}; color: {textColor}; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; {border}"">{text}</a>
                    <!--<![endif]-->
                </td>
            </tr>
        </table>";
    }

    /// <summary>
    /// Generate a status/alert box
    /// </summary>
    private static string GenerateStatusBox(string content, string type = "info")
    {
        var (bgColor, borderColor, textColor) = type switch
        {
            "success" => (ColorSuccessLight, ColorSuccess, ColorSuccessDark),
            "warning" => (ColorWarningLight, ColorWarning, ColorWarningDark),
            "danger" => (ColorDangerLight, ColorDanger, ColorDangerDark),
            _ => (ColorPrimaryLight, ColorPrimary, ColorPrimaryDark)
        };

        return $@"
        <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""margin: 24px 0;"">
            <tr>
                <td style=""background-color: {bgColor}; border-left: 4px solid {borderColor}; border-radius: 8px; padding: 16px 20px;"">
                    <p style=""margin: 0; font-size: 14px; font-weight: 500; color: {textColor};"">{content}</p>
                </td>
            </tr>
        </table>";
    }

    /// <summary>
    /// Generate a data table row
    /// </summary>
    private static string GenerateTableRow(string label, string value, bool isLast = false)
    {
        var borderStyle = isLast ? "none" : $"1px solid {ColorBorder}";
        return $@"
        <tr>
            <td style=""padding: 14px 16px; border-bottom: {borderStyle}; font-size: 14px; font-weight: 500; color: {ColorTextMuted}; width: 35%;"">{label}</td>
            <td style=""padding: 14px 16px; border-bottom: {borderStyle}; font-size: 14px; color: {ColorTextPrimary};"">{value}</td>
        </tr>";
    }

    private Dictionary<string, EmailTemplate> InitializeTemplates()
    {
        return new Dictionary<string, EmailTemplate>
        {
            // ========================================
            // WELCOME - Onboarding new users
            // ========================================
            ["welcome"] = new EmailTemplate
            {
                Subject = "Bienvenido a {{CompanyName}} - Tu cuenta está lista",
                HtmlBody = $@"
                    <h1 style=""font-size: 28px; font-weight: 700; color: {ColorTextPrimary}; margin: 0 0 8px 0;"">¡Bienvenido a {{{{CompanyName}}}}!</h1>
                    <p style=""font-size: 18px; color: {ColorTextSecondary}; margin: 0 0 32px 0;"">Tu cuenta ha sido creada exitosamente</p>

                    <p style=""font-size: 16px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 24px 0;"">
                        Hola <strong style=""color: {ColorTextPrimary};"">{{{{Name}}}}</strong>,
                    </p>

                    <p style=""font-size: 16px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 24px 0;"">
                        Gracias por unirte a {{{{CompanyName}}}}. Tu cuenta está configurada y lista para usar. Ahora puedes comenzar a validar tus archivos CONSAR con nuestra plataforma automatizada.
                    </p>

                    {GenerateStatusBox("<strong>Cuenta activa</strong> — Ya puedes acceder a todas las funcionalidades de la plataforma.", "success")}

                    <p style=""font-size: 16px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 8px 0;"">
                        <strong style=""color: {ColorTextPrimary};"">¿Qué puedes hacer?</strong>
                    </p>
                    <ul style=""font-size: 15px; color: {ColorTextSecondary}; line-height: 1.8; margin: 0 0 32px 0; padding-left: 20px;"">
                        <li>Subir y validar archivos CONSAR automáticamente</li>
                        <li>Recibir alertas de cambios normativos</li>
                        <li>Generar reportes de cumplimiento</li>
                        <li>Gestionar aprobaciones de documentos</li>
                    </ul>

                    {GenerateButton("Iniciar Sesión", "{{BaseUrl}}/login")}

                    <p style=""font-size: 14px; color: {ColorTextMuted}; margin: 32px 0 0 0;"">
                        Si tienes alguna pregunta, nuestro equipo está aquí para ayudarte.
                    </p>",
                TextBody = @"¡Bienvenido a {{CompanyName}}!

Hola {{Name}},

Tu cuenta ha sido creada exitosamente. Gracias por unirte a {{CompanyName}}.

Tu cuenta está configurada y lista para usar. Ahora puedes comenzar a validar tus archivos CONSAR con nuestra plataforma automatizada.

¿Qué puedes hacer?
- Subir y validar archivos CONSAR automáticamente
- Recibir alertas de cambios normativos
- Generar reportes de cumplimiento
- Gestionar aprobaciones de documentos

Inicia sesión en: {{BaseUrl}}/login

Si tienes alguna pregunta, contáctanos en {{SupportEmail}}."
            },

            // ========================================
            // PASSWORD RESET - Security
            // ========================================
            ["password_reset"] = new EmailTemplate
            {
                Subject = "Restablecer tu contraseña - {{CompanyName}}",
                HtmlBody = $@"
                    <h1 style=""font-size: 28px; font-weight: 700; color: {ColorTextPrimary}; margin: 0 0 8px 0;"">Restablecer Contraseña</h1>
                    <p style=""font-size: 18px; color: {ColorTextSecondary}; margin: 0 0 32px 0;"">Solicitud de cambio de contraseña</p>

                    <p style=""font-size: 16px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 24px 0;"">
                        Hola <strong style=""color: {ColorTextPrimary};"">{{{{Name}}}}</strong>,
                    </p>

                    <p style=""font-size: 16px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 24px 0;"">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta en {{{{CompanyName}}}}. Si realizaste esta solicitud, haz clic en el botón de abajo.
                    </p>

                    {GenerateStatusBox("<strong>Este enlace expirará en {{ExpirationHours}} horas</strong> por razones de seguridad.", "warning")}

                    {GenerateButton("Restablecer Contraseña", "{{ResetUrl}}")}

                    <p style=""font-size: 14px; color: {ColorTextMuted}; margin: 32px 0 16px 0; padding: 16px; background-color: {ColorBackground}; border-radius: 8px;"">
                        <strong style=""color: {ColorTextSecondary};"">¿No solicitaste este cambio?</strong><br>
                        Puedes ignorar este correo de forma segura. Tu contraseña no será modificada.
                    </p>

                    <p style=""font-size: 13px; color: {ColorTextMuted}; margin: 16px 0 0 0;"">
                        Por seguridad, nunca compartas este enlace con nadie.
                    </p>",
                TextBody = @"Restablecer Contraseña

Hola {{Name}},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en {{CompanyName}}.

Para restablecer tu contraseña, visita:
{{ResetUrl}}

Este enlace expirará en {{ExpirationHours}} horas por razones de seguridad.

¿No solicitaste este cambio?
Puedes ignorar este correo de forma segura. Tu contraseña no será modificada.

Por seguridad, nunca compartas este enlace con nadie."
            },

            // ========================================
            // VALIDATION COMPLETED - Core feature
            // ========================================
            ["validation_completed"] = new EmailTemplate
            {
                Subject = "{{Result}} - Validación {{FileName}}",
                HtmlBody = $@"
                    <h1 style=""font-size: 28px; font-weight: 700; color: {ColorTextPrimary}; margin: 0 0 8px 0;"">Validación Completada</h1>
                    <p style=""font-size: 18px; color: {ColorTextSecondary}; margin: 0 0 32px 0;"">{{{{FileName}}}}</p>

                    {{{{StatusBox}}}}

                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: {ColorBackground}; border-radius: 12px; margin: 24px 0;"">
                        <tr><td style=""padding: 20px;"">
                            <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Archivo</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{FileName}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Registros procesados</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{TotalRecords}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Errores encontrados</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {{{{ErrorColor}}}};"">{{{{ErrorCount}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0;"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Duración</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{Duration}}}}</span>
                                    </td>
                                </tr>
                            </table>
                        </td></tr>
                    </table>

                    {GenerateButton("Ver Detalles Completos", "{{ValidationUrl}}")}",
                TextBody = @"Validación Completada

Archivo: {{FileName}}
Resultado: {{Result}}

Detalles:
- Registros procesados: {{TotalRecords}}
- Errores encontrados: {{ErrorCount}}
- Duración: {{Duration}}

Ver detalles en: {{ValidationUrl}}"
            },

            // ========================================
            // APPROVAL REQUIRED - Workflow
            // ========================================
            ["approval_required"] = new EmailTemplate
            {
                Subject = "Acción requerida: Aprobar {{ItemTitle}}",
                HtmlBody = $@"
                    <h1 style=""font-size: 28px; font-weight: 700; color: {ColorTextPrimary}; margin: 0 0 8px 0;"">Aprobación Pendiente</h1>
                    <p style=""font-size: 18px; color: {ColorTextSecondary}; margin: 0 0 32px 0;"">Se requiere tu revisión</p>

                    <p style=""font-size: 16px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 24px 0;"">
                        Hola <strong style=""color: {ColorTextPrimary};"">{{{{ApproverName}}}}</strong>,
                    </p>

                    <p style=""font-size: 16px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 24px 0;"">
                        <strong style=""color: {ColorTextPrimary};"">{{{{RequesterName}}}}</strong> ha enviado un elemento para tu aprobación.
                    </p>

                    {GenerateStatusBox("<strong>Fecha límite:</strong> {{DueDate}}", "warning")}

                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: {ColorBackground}; border-radius: 12px; margin: 24px 0;"">
                        <tr><td style=""padding: 20px;"">
                            <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Elemento</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{ItemTitle}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Tipo</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{ItemType}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0;"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Solicitante</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{RequesterName}}}}</span>
                                    </td>
                                </tr>
                            </table>
                        </td></tr>
                    </table>

                    {GenerateButton("Revisar y Aprobar", "{{ApprovalUrl}}")}",
                TextBody = @"Aprobación Pendiente

Hola {{ApproverName}},

{{RequesterName}} ha enviado un elemento para tu aprobación.

Detalles:
- Elemento: {{ItemTitle}}
- Tipo: {{ItemType}}
- Solicitante: {{RequesterName}}
- Fecha límite: {{DueDate}}

Revisar y aprobar en: {{ApprovalUrl}}"
            },

            // ========================================
            // APPROVAL GRANTED - Success notification
            // ========================================
            ["approval_granted"] = new EmailTemplate
            {
                Subject = "Aprobado: {{ItemTitle}}",
                HtmlBody = $@"
                    <h1 style=""font-size: 28px; font-weight: 700; color: {ColorTextPrimary}; margin: 0 0 8px 0;"">Solicitud Aprobada</h1>
                    <p style=""font-size: 18px; color: {ColorTextSecondary}; margin: 0 0 32px 0;"">{{{{ItemTitle}}}}</p>

                    {GenerateStatusBox("<strong>Estado:</strong> Aprobado", "success")}

                    <p style=""font-size: 16px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 24px 0;"">
                        Tu solicitud ha sido revisada y aprobada por <strong style=""color: {ColorTextPrimary};"">{{{{ApproverName}}}}</strong>.
                    </p>

                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: {ColorBackground}; border-radius: 12px; margin: 24px 0;"">
                        <tr><td style=""padding: 20px;"">
                            <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Aprobador</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{ApproverName}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0;"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Comentarios</span>
                                        <span style=""font-size: 15px; color: {ColorTextPrimary};"">{{{{Comments}}}}</span>
                                    </td>
                                </tr>
                            </table>
                        </td></tr>
                    </table>

                    {GenerateButton("Ver Detalles", "{{ItemUrl}}")}",
                TextBody = @"Solicitud Aprobada

Tu solicitud {{ItemTitle}} ha sido aprobada.

- Aprobador: {{ApproverName}}
- Comentarios: {{Comments}}

Ver detalles en: {{ItemUrl}}"
            },

            // ========================================
            // APPROVAL REJECTED - Rejection notification
            // ========================================
            ["approval_rejected"] = new EmailTemplate
            {
                Subject = "Rechazado: {{ItemTitle}}",
                HtmlBody = $@"
                    <h1 style=""font-size: 28px; font-weight: 700; color: {ColorTextPrimary}; margin: 0 0 8px 0;"">Solicitud Rechazada</h1>
                    <p style=""font-size: 18px; color: {ColorTextSecondary}; margin: 0 0 32px 0;"">{{{{ItemTitle}}}}</p>

                    {GenerateStatusBox("<strong>Estado:</strong> Rechazado", "danger")}

                    <p style=""font-size: 16px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 24px 0;"">
                        Tu solicitud ha sido revisada por <strong style=""color: {ColorTextPrimary};"">{{{{ApproverName}}}}</strong> y no fue aprobada.
                    </p>

                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: {ColorDangerLight}; border-radius: 12px; margin: 24px 0; border-left: 4px solid {ColorDanger};"">
                        <tr><td style=""padding: 20px;"">
                            <span style=""font-size: 13px; color: {ColorDanger}; display: block; font-weight: 600; margin-bottom: 8px;"">Motivo del rechazo</span>
                            <span style=""font-size: 15px; color: {ColorTextPrimary}; line-height: 1.5;"">{{{{RejectionReason}}}}</span>
                        </td></tr>
                    </table>

                    <p style=""font-size: 14px; color: {ColorTextMuted}; margin: 24px 0;"">
                        Puedes corregir los problemas indicados y enviar una nueva solicitud.
                    </p>

                    {GenerateButton("Ver Detalles", "{{ItemUrl}}")}",
                TextBody = @"Solicitud Rechazada

Tu solicitud {{ItemTitle}} ha sido rechazada.

- Revisor: {{ApproverName}}
- Motivo: {{RejectionReason}}

Puedes corregir los problemas indicados y enviar una nueva solicitud.

Ver detalles en: {{ItemUrl}}"
            },

            // ========================================
            // NORMATIVE CHANGE ALERT - Compliance
            // ========================================
            ["normative_change_alert"] = new EmailTemplate
            {
                Subject = "Cambio normativo: {{Title}}",
                HtmlBody = $@"
                    <h1 style=""font-size: 28px; font-weight: 700; color: {ColorTextPrimary}; margin: 0 0 8px 0;"">Cambio Normativo Detectado</h1>
                    <p style=""font-size: 18px; color: {ColorTextSecondary}; margin: 0 0 32px 0;"">Requiere tu atención</p>

                    {GenerateStatusBox("<strong>Nuevo cambio normativo</strong> — Revisa este documento para mantener el cumplimiento regulatorio.", "warning")}

                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: {ColorBackground}; border-radius: 12px; margin: 24px 0;"">
                        <tr><td style=""padding: 20px;"">
                            <h3 style=""font-size: 18px; font-weight: 600; color: {ColorTextPrimary}; margin: 0 0 16px 0;"">{{{{Title}}}}</h3>
                            <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Fuente</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{Source}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Fecha de publicación</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{PublishedDate}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0;"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Nivel de impacto</span>
                                        <span style=""font-size: 15px; font-weight: 600; color: {ColorWarning};"">{{{{Impact}}}}</span>
                                    </td>
                                </tr>
                            </table>
                        </td></tr>
                    </table>

                    <p style=""font-size: 15px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 24px 0; padding: 16px; background-color: {ColorBackground}; border-radius: 8px;"">
                        {{{{Summary}}}}
                    </p>

                    {GenerateButton("Revisar Cambio Normativo", "{{ChangeUrl}}")}",
                TextBody = @"Cambio Normativo Detectado

Se ha detectado un nuevo cambio normativo que requiere tu atención.

{{Title}}

- Fuente: {{Source}}
- Fecha de publicación: {{PublishedDate}}
- Nivel de impacto: {{Impact}}

Resumen:
{{Summary}}

Revisar en: {{ChangeUrl}}"
            },

            // ========================================
            // SLA WARNING - Deadline alert
            // ========================================
            ["sla_warning"] = new EmailTemplate
            {
                Subject = "SLA próximo a vencer: {{ItemTitle}}",
                HtmlBody = $@"
                    <h1 style=""font-size: 28px; font-weight: 700; color: {ColorTextPrimary}; margin: 0 0 8px 0;"">Alerta de SLA</h1>
                    <p style=""font-size: 18px; color: {ColorTextSecondary}; margin: 0 0 32px 0;"">Un elemento está por vencer</p>

                    {GenerateStatusBox("<strong>¡Atención!</strong> El plazo está próximo a expirar: <strong>{{TimeRemaining}}</strong> restantes", "danger")}

                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: {ColorBackground}; border-radius: 12px; margin: 24px 0;"">
                        <tr><td style=""padding: 20px;"">
                            <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Elemento</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{ItemTitle}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Tipo</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{ItemType}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0;"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Fecha límite</span>
                                        <span style=""font-size: 15px; font-weight: 600; color: {ColorDanger};"">{{{{DueDate}}}}</span>
                                    </td>
                                </tr>
                            </table>
                        </td></tr>
                    </table>

                    {GenerateButton("Atender Ahora", "{{ItemUrl}}")}",
                TextBody = @"Alerta de SLA

¡Atención! Un elemento está próximo a vencer su plazo.

- Elemento: {{ItemTitle}}
- Tipo: {{ItemType}}
- Tiempo restante: {{TimeRemaining}}
- Fecha límite: {{DueDate}}

Atender en: {{ItemUrl}}"
            },

            // ========================================
            // INVITATION - Team onboarding
            // ========================================
            ["invitation"] = new EmailTemplate
            {
                Subject = "{{InviterName}} te invita a {{OrganizationName}}",
                HtmlBody = $@"
                    <h1 style=""font-size: 28px; font-weight: 700; color: {ColorTextPrimary}; margin: 0 0 8px 0;"">Has sido invitado</h1>
                    <p style=""font-size: 18px; color: {ColorTextSecondary}; margin: 0 0 32px 0;"">Únete al equipo de {{{{OrganizationName}}}}</p>

                    <p style=""font-size: 16px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 24px 0;"">
                        Hola <strong style=""color: {ColorTextPrimary};"">{{{{Name}}}}</strong>,
                    </p>

                    <p style=""font-size: 16px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 24px 0;"">
                        <strong style=""color: {ColorTextPrimary};"">{{{{InviterName}}}}</strong> te ha invitado a unirte a <strong style=""color: {ColorTextPrimary};"">{{{{OrganizationName}}}}</strong> en {{{{CompanyName}}}}, la plataforma de validación CONSAR.
                    </p>

                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: {ColorPrimaryLight}; border-radius: 12px; margin: 24px 0; border-left: 4px solid {ColorPrimary};"">
                        <tr><td style=""padding: 20px;"">
                            <span style=""font-size: 13px; color: {ColorPrimary}; display: block; font-weight: 600; margin-bottom: 4px;"">Tu rol asignado</span>
                            <span style=""font-size: 20px; font-weight: 700; color: {ColorPrimaryDark};"">{{{{RoleName}}}}</span>
                        </td></tr>
                    </table>

                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: {ColorBackground}; border-radius: 12px; margin: 24px 0;"">
                        <tr><td style=""padding: 20px;"">
                            <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Organización</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{OrganizationName}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Permisos</span>
                                        <span style=""font-size: 15px; color: {ColorTextPrimary};"">{{{{Permissions}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0;"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Válido hasta</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{ExpiresAt}}}}</span>
                                    </td>
                                </tr>
                            </table>
                        </td></tr>
                    </table>

                    {GenerateButton("Aceptar Invitación", "{{AcceptUrl}}")}

                    <p style=""font-size: 13px; color: {ColorTextMuted}; margin: 24px 0 0 0; padding: 16px; background-color: {ColorBackground}; border-radius: 8px;"">
                        Esta invitación expirará en <strong>{{{{ExpirationDays}}}} días</strong>. Si no esperabas esta invitación, puedes ignorar este correo de forma segura.
                    </p>",
                TextBody = @"Has sido invitado

Hola {{Name}},

{{InviterName}} te ha invitado a unirte a {{OrganizationName}} en {{CompanyName}}.

Tu rol asignado: {{RoleName}}

Detalles:
- Organización: {{OrganizationName}}
- Permisos: {{Permissions}}
- Válido hasta: {{ExpiresAt}}

Para aceptar la invitación, visita:
{{AcceptUrl}}

Esta invitación expirará en {{ExpirationDays}} días.

Si no esperabas esta invitación, puedes ignorar este correo."
            },

            // ========================================
            // INVITATION ACCEPTED - Confirmation
            // ========================================
            ["invitation_accepted"] = new EmailTemplate
            {
                Subject = "{{Name}} se unió a tu equipo",
                HtmlBody = $@"
                    <h1 style=""font-size: 28px; font-weight: 700; color: {ColorTextPrimary}; margin: 0 0 8px 0;"">Nuevo miembro en el equipo</h1>
                    <p style=""font-size: 18px; color: {ColorTextSecondary}; margin: 0 0 32px 0;"">Tu invitación fue aceptada</p>

                    <p style=""font-size: 16px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 24px 0;"">
                        Hola <strong style=""color: {ColorTextPrimary};"">{{{{InviterName}}}}</strong>,
                    </p>

                    {GenerateStatusBox("<strong>{{Name}}</strong> aceptó tu invitación y ahora es parte de <strong>{{OrganizationName}}</strong>.", "success")}

                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: {ColorBackground}; border-radius: 12px; margin: 24px 0;"">
                        <tr><td style=""padding: 20px;"">
                            <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Nuevo usuario</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{Name}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Email</span>
                                        <span style=""font-size: 15px; color: {ColorTextPrimary};"">{{{{Email}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0; border-bottom: 1px solid {ColorBorder};"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Rol</span>
                                        <span style=""font-size: 15px; font-weight: 500; color: {ColorTextPrimary};"">{{{{RoleName}}}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 12px 0;"">
                                        <span style=""font-size: 13px; color: {ColorTextMuted}; display: block;"">Aceptado</span>
                                        <span style=""font-size: 15px; color: {ColorTextPrimary};"">{{{{AcceptedAt}}}}</span>
                                    </td>
                                </tr>
                            </table>
                        </td></tr>
                    </table>

                    {GenerateButton("Ver Equipo", "{{UsersUrl}}")}",
                TextBody = @"Nuevo miembro en el equipo

Hola {{InviterName}},

{{Name}} ({{Email}}) aceptó tu invitación y ahora es parte de {{OrganizationName}}.

Detalles:
- Usuario: {{Name}}
- Email: {{Email}}
- Rol: {{RoleName}}
- Aceptado: {{AcceptedAt}}

Ver equipo en: {{UsersUrl}}"
            },

            // ========================================
            // DAILY DIGEST - Summary
            // ========================================
            ["daily_digest"] = new EmailTemplate
            {
                Subject = "Resumen diario - {{Date}} | {{CompanyName}}",
                HtmlBody = $@"
                    <h1 style=""font-size: 28px; font-weight: 700; color: {ColorTextPrimary}; margin: 0 0 8px 0;"">Resumen Diario</h1>
                    <p style=""font-size: 18px; color: {ColorTextSecondary}; margin: 0 0 32px 0;"">{{{{Date}}}}</p>

                    <p style=""font-size: 16px; color: {ColorTextSecondary}; line-height: 1.6; margin: 0 0 24px 0;"">
                        Hola <strong style=""color: {ColorTextPrimary};"">{{{{Name}}}}</strong>, aquí está tu resumen de actividad del día.
                    </p>

                    <!-- Stats Grid -->
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""margin: 24px 0;"">
                        <tr>
                            <td width=""48%"" style=""background-color: {ColorSuccessLight}; border-radius: 12px; padding: 20px; text-align: center;"">
                                <span style=""font-size: 32px; font-weight: 700; color: {ColorSuccess}; display: block;"">{{{{ValidationsCount}}}}</span>
                                <span style=""font-size: 13px; color: {ColorSuccessDark};"">Validaciones</span>
                            </td>
                            <td width=""4%""></td>
                            <td width=""48%"" style=""background-color: {ColorWarningLight}; border-radius: 12px; padding: 20px; text-align: center;"">
                                <span style=""font-size: 32px; font-weight: 700; color: {ColorWarning}; display: block;"">{{{{PendingApprovals}}}}</span>
                                <span style=""font-size: 13px; color: {ColorWarningDark};"">Pendientes</span>
                            </td>
                        </tr>
                    </table>

                    {{{{DigestContent}}}}

                    {GenerateButton("Ver Dashboard", "{{BaseUrl}}/dashboard")}",
                TextBody = @"Resumen Diario - {{Date}}

Hola {{Name}}, aquí está tu resumen de actividad del día.

Estadísticas:
- Validaciones: {{ValidationsCount}}
- Pendientes de aprobación: {{PendingApprovals}}

{{DigestContentText}}

Ver dashboard en: {{BaseUrl}}/dashboard"
            }
        };
    }
}

/// <summary>
/// Email template definition
/// </summary>
public class EmailTemplate
{
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string TextBody { get; set; } = string.Empty;
}
