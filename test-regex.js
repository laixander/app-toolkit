const emailHtml = `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: Helvetica, Arial, sans-serif; font-size:14px; color:#333;">
  <tr>
    <td align="left">
      <!-- Card -->
      <table cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#f5f6f8" style="max-width:600px; background-color:#f5f6f8;">
        <tr>
          <td style="padding:16px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="table-layout:fixed;">
              <tr valign="middle">
                <!-- Logo -->
                <td width="120" style="width:120px; min-width:120px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" height="110">
                    <tr>
                      <td align="center" valign="middle" bgcolor="#0B5CAB" style="background-color:#0B5CAB;">
                        <img 
                          src="https://centralizedinc.com/img/ccci-logo-colored.svg"
                          width="96"
                          alt="Company Logo"
                          style="display:block; width:96px; min-width:96px; max-width:96px;"
                        >
                      </td>
                    </tr>
                  </table>
                </td>
                <!-- Spacer -->
                <td width="16">&nbsp;</td>
                <!-- Details -->
                <td style="white-space:nowrap;">
                  <!-- Name -->
                  <div style="font-size:17px; font-weight:bold; color:#0B5CAB; line-height:1.2;">
                    Laixander Naguit
                  </div>
                  <!-- Title -->
                  <div style="font-size:11px; text-transform:uppercase; color:#666; margin-top:2px; letter-spacing:0.6px;">
                    UI/UX Designer
                  </div>
                  <!-- Divider -->
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px;">
                    <tr>
                      <td style="height:1px; background:#ddd; font-size:0; line-height:0;">&nbsp;</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

let html = emailHtml;
html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
html = html.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-neutral-400 italic">$1</span>');
html = html.replace(/(&lt;\/?)([a-zA-Z0-9]+)([\s\S]*?)(&gt;)/g, (match, p1, p2, p3, p4) => {
    let attrs = p3.replace(/([a-zA-Z0-9-]+)(=)(".*?"|'.*?'|[^\s&]+)/g, '<span class="text-blue-500 dark:text-blue-400">$1</span><span class="text-neutral-400">$2</span><span class="text-green-600 dark:text-green-400">$3</span>');
    return `<span class="text-neutral-400">${p1}</span><span class="text-pink-600 dark:text-pink-400">${p2}</span>${attrs}<span class="text-neutral-400">${p4}</span>`;
});

console.log(html.substring(0, 500));
