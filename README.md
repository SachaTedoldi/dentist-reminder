# Dentist Reminder

This project is a **Google Sheets + Google Apps Script** solution for sending **automated reminders** to patients about their dentist appointments.

Currently, the system:
- Collects patient data from a Google Sheet (name, date, email, phone, notes, consent).
- Sends automatic email reminders to patients before their appointments.

---

### 🛡 Privacy Note
- The dataset shown in this project is made up of **mock (fake) patient data**, used only for demonstration.  
- A single test row with **my real name (but not my real email/phone)** was temporarily used to confirm that reminders were correctly sent.  
- No sensitive or private patient information is included in this repository.

---

## 🚀 Planned Upgrades
- Add **QR code** support for easy confirmation or check-in.
- Add a **Telegram Bot** option for sending reminders, in addition to email.

---

## 📝 How to Use
1. Open the Google Sheet with patient data.  
2. Copy the script from `script.gs` into the Google Apps Script editor linked to your Sheet.  
3. Customize the email template as needed.  
4. Set up a time-based trigger in Google Apps Script to run the reminder automatically (e.g., daily).

---

## 📌 Roadmap
See [ROADMAP.md](ROADMAP.md) for a breakdown of upcoming improvements.