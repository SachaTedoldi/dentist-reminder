/** CONFIG **/
const CONFIG = {
  sheetName: 'Agenda',
  tz: Session.getScriptTimeZone(), // usa il fuso del file
  windowHours: 1,                  // finestra di invio (tra 24h e 25h)
  fromName: 'Studio Dentistico Dr. Bianchi',  // personalizza
  replyTo: 'segreteria@tua-clinica.it',       // personalizza
  subjectPrefix: 'Promemoria appuntamento',
  consentYes: 'YES',
  logSheetName: 'Log'
};

// Esegue ogni ora: invia promemoria a chi ha un appuntamento tra 24h e 25h
function sendReminders() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(CONFIG.sheetName);
  const data = sh.getDataRange().getValues();
  const now = new Date();
  const start = new Date(now.getTime() + 24*60*60*1000);
  const end   = new Date(now.getTime() + (24 + CONFIG.windowHours)*60*60*1000);

  // preparazione log
  const logSh = getOrCreateLogSheet_(ss);

  for (let i = 1; i < data.length; i++) {
    const [dateTime, name, email, phone, consent, notes, status] = data[i];
    if (!(dateTime instanceof Date)) continue;      // salta righe vuote o non valide
    if (!email) continue;                           // serve la mail
    if ((consent || '').toString().toUpperCase() !== CONFIG.consentYes) continue; // no consenso, no invio

    // già inviato?
    if (status && status.toString().toUpperCase().indexOf('SENT') > -1) continue;

    // è nella finestra 24h–25h?
    if (dateTime >= start && dateTime < end) {
      try {
        sendEmail_(name, email, phone, dateTime, notes);
        // segna come inviato
        sh.getRange(i+1, 7).setValue('SENT');            // colonna G
        sh.getRange(i+1, 8).setValue(new Date());        // colonna H (LastSentAt)
        // log
        logSh.appendRow([new Date(), name, email, dateTime, 'SENT', '']);
      } catch (err) {
        sh.getRange(i+1, 7).setValue('ERROR');
        logSh.appendRow([new Date(), name, email, dateTime, 'ERROR', err.message]);
      }
    }
  }
}

// invio e-mail (HTML semplice)
function sendEmail_(name, email, phone, dateTime, notes) {
  const when = Utilities.formatDate(dateTime, CONFIG.tz, "EEEE d MMMM 'alle' HH:mm");
  const subject = `${CONFIG.subjectPrefix} — ${when}`;
  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2 style="margin:0 0 10px 0;">${CONFIG.fromName}</h2>
    <p>Ciao <b>${escapeHtml_(name)}</b>,</p>
    <p>ti ricordiamo l'appuntamento di <b>${when}</b>.</p>
    ${notes ? `<p><b>Note:</b> ${escapeHtml_(notes)}</p>` : ''}
    ${phone ? `<p>Se devi modificare, chiamaci al <b>${escapeHtml_(phone)}</b>.</p>` : ''}
    <p>Grazie!<br/>${CONFIG.fromName}</p>
    <hr/>
    <small>Ricevi questo promemoria perché hai dato il consenso in fase di prenotazione.</small>
  </div>`;

  MailApp.sendEmail({
    to: email,
    replyTo: CONFIG.replyTo,
    name: CONFIG.fromName,
    subject,
    htmlBody: html
  });
}

// Crea il foglio Log se non esiste
function getOrCreateLogSheet_(ss) {
  let sh = ss.getSheetByName(CONFIG.logSheetName);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.logSheetName);
    sh.appendRow(['Timestamp', 'PatientName', 'Email', 'Appointment', 'Action', 'Error']);
  }
  return sh;
}

// Utilità per sicurezza HTML
function escapeHtml_(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// Trigger orari (esegui una volta per crearli)
function createHourlyTrigger() {
  ScriptApp.newTrigger('sendReminders')
    .timeBased().everyHours(1).create();
}

// Test manuale: invia subito a chi ha appuntamento entro 10 minuti
function testSendNow() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(CONFIG.sheetName);
  const data = sh.getDataRange().getValues();
  const now = new Date();
  const soon = new Date(now.getTime() + 10*60*1000);

  const logSh = getOrCreateLogSheet_(ss);

  for (let i = 1; i < data.length; i++) {
    const [dateTime, name, email, phone, consent, notes, status] = data[i];
    if (!(dateTime instanceof Date)) continue;
    if (!email) continue;
    if ((consent || '').toString().toUpperCase() !== CONFIG.consentYes) continue;

    if (dateTime >= now && dateTime <= soon) {
      try {
        sendEmail_(name, email, phone, dateTime, notes);
        sh.getRange(i+1, 7).setValue('SENT (TEST)');
        sh.getRange(i+1, 8).setValue(new Date());
        logSh.appendRow([new Date(), name, email, dateTime, 'SENT (TEST)', '']);
      } catch (err) {
        sh.getRange(i+1, 7).setValue('ERROR (TEST)');
        logSh.appendRow([new Date(), name, email, dateTime, 'ERROR (TEST)', err.message]);
      }
    }
  }
}