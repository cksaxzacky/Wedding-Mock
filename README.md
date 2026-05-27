# Sax & Noon — Wedding Website

เว็บไซต์งานแต่ง 2 ภาษา (ไทย/อังกฤษ) สไตล์ Minimal & Modern

## โครงสร้างไฟล์

```
Wedding/
├── index.html          ← หน้าแรก + countdown
├── story.html          ← เรื่องราวของเรา (timeline)
├── gallery.html        ← อัลบั้มภาพ + lightbox
├── details.html        ← กำหนดการ + แผนที่ + FAQ
├── rsvp.html           ← ฟอร์มตอบรับ
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── i18n.js     ← ข้อความ TH/EN ทั้งหมด แก้ที่ไฟล์เดียว
│       ├── main.js     ← language toggle, countdown, nav, gallery
│       └── rsvp.js     ← ส่งฟอร์มไป Google Sheet
└── README.md
```

## วิธีแก้ข้อมูล

### 1. ชื่อบ่าวสาว / วันที่ / ตัวอักษรย่อ
- ชื่อแสดงในส่วน hero และ footer ใช้ i18n — แก้ที่ `assets/js/i18n.js` (keys: `names.first`, `names.second`, `footer.line`)
- เปลี่ยน `S & N` (ตัวย่อมุมซ้ายบน) ในทุกไฟล์ HTML ถ้าต้องการเปลี่ยนเป็นชื่ออื่น
- countdown: ใน `index.html` มี `data-target="2026-12-25T17:00:00+07:00"` — แก้เป็นวันเวลาจริง (ISO 8601 + timezone)

### 2. ข้อความ TH/EN
แก้ที่ `assets/js/i18n.js` เท่านั้น มี 2 object: `th` และ `en` ที่ key เหมือนกัน

### 3. ภาพในอัลบั้ม
ตอนนี้ใช้ภาพ placeholder จาก `picsum.photos` ให้แทนที่ `<img src="...">` ใน `gallery.html` ด้วยภาพจริง เช่น `assets/img/photo1.jpg`

### 4. แผนที่
ใน `details.html` แก้พารามิเตอร์ `q=` ใน 2 จุด (iframe และปุ่ม Open in Google Maps) เป็นชื่อสถานที่จริง

## ตั้งค่า RSVP → Google Sheet

### ขั้นที่ 1 สร้าง Google Sheet
1. สร้าง Google Sheet ใหม่
2. แถวที่ 1 ใส่หัวคอลัมน์: `timestamp | name | email | phone | attending | guests | diet | message`

### ขั้นที่ 2 ใส่ Apps Script
- ใน Sheet → เมนู `Extensions` → `Apps Script`
- ลบโค้ดเดิม วางโค้ดนี้:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name      || '',
      data.email     || '',
      data.phone     || '',
      data.attending || '',
      data.guests    || '',
      data.diet      || '',
      data.message   || ''
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### ขั้นที่ 3 Deploy
- กด `Deploy` → `New deployment`
- เลือก type = `Web app`
- Execute as: `Me`
- Who has access: `Anyone`
- กด `Deploy` → คัดลอก **Web app URL** (ลงท้ายด้วย `/exec`)

### ขั้นที่ 4 ใส่ URL ในเว็บ
เปิด `assets/js/rsvp.js` แล้วใส่ URL ที่บรรทัด:

```javascript
const RSVP_ENDPOINT = 'https://script.google.com/.../exec';
```

ตอนนี้ฟอร์ม RSVP ทุกคำตอบจะถูกเขียนลง Google Sheet โดยอัตโนมัติ

> ถ้ายังไม่ใส่ URL ฟอร์มจะทำงานในโหมด demo (log ไป console เฉยๆ ไม่ส่งจริง)

## วิธี Deploy เว็บ

### ทางเลือก A — Netlify (ง่ายที่สุด)
1. ไปที่ [app.netlify.com/drop](https://app.netlify.com/drop)
2. ลากโฟลเดอร์ `Wedding/` ทั้งโฟลเดอร์เข้าไป
3. ได้ URL ทันที (เช่น `alex-sam.netlify.app`) ปรับ subdomain ฟรีได้

### ทางเลือก B — GitHub Pages
1. สร้าง repo ใหม่ใน GitHub
2. push โค้ดทั้งหมดขึ้นไป
3. Settings → Pages → Source = `main` branch / root
4. ได้ URL `https://username.github.io/repo-name/`

### ทางเลือก C — โดเมนของตัวเอง
ทั้ง Netlify และ GitHub Pages รองรับ custom domain ฟรี — ซื้อโดเมน (เช่น `alex-sam.com`) แล้วชี้ DNS ตามคู่มือของแต่ละบริการ

## ทดสอบในเครื่อง

เปิด `index.html` ใน browser ได้เลย (ไม่ต้อง dev server) แต่ถ้าอยากใช้ local server:

```powershell
# Python
python -m http.server 8080
# หรือ Node
npx serve .
```

แล้วเปิด `http://localhost:8080`
