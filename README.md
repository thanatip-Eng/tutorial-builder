# 📚 Tutorial Builder - ระบบสร้างคู่มือการใช้งาน

ระบบสร้างคู่มือสำหรับอาจารย์ รองรับการอัพโหลดภาพ/วิดีโอ สร้างสไลด์ และ Embed ลง Canvas/Notion

![Tutorial Builder](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2-61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-10.7-FFCA28)

## ✨ ฟีเจอร์หลัก

### 📷 การอัพโหลด
- **อัพโหลดภาพ** - รองรับ JPG, PNG, GIF หลายไฟล์พร้อมกัน
- **แยกเฟรมจากวิดีโอ** - อัพโหลดวิดีโอ เลือกเฟรมที่ต้องการ

### 🎯 การจัดการสไลด์
- เพิ่ม/ลบ/แก้ไขสไลด์
- ลากจัดลำดับสไลด์
- เพิ่ม Hotspot จุดไฮไลท์บนภาพ
- กำหนดเวลาแสดงแต่ละสไลด์

### 📁 การจัดระเบียบ
- สร้างโฟลเดอร์แยกตามวิชา
- ค้นหาและกรองคู่มือ

### 🔗 การแชร์
- สร้าง Embed Code (Fixed/Responsive)
- Direct Link สำหรับแชร์
- รองรับ Auto-play

### 🎨 อื่นๆ
- Dark Mode
- Mobile Responsive
- Keyboard Navigation (←→ เลื่อนสไลด์, Space เล่น/หยุด)

---

## 🚀 การติดตั้ง

### ขั้นตอนที่ 1: สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก **"Create a project"**
3. ตั้งชื่อโปรเจค เช่น `tutorial-builder-cmu`
4. เปิดใช้งาน **Google Analytics** (ถ้าต้องการ)

### ขั้นตอนที่ 2: ตั้งค่า Firestore Database

1. ในหน้า Firebase Console เลือก **"Build > Firestore Database"**
2. คลิก **"Create database"**
3. เลือก **"Start in production mode"**
4. เลือก Location: `asia-southeast1` (Singapore)
5. คลิก **"Enable"**

**ตั้งค่า Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // สำหรับทดสอบ
    }
  }
}
```

### ขั้นตอนที่ 3: ตั้งค่า Storage

1. เลือก **"Build > Storage"**
2. คลิก **"Get started"**
3. เลือก **"Start in production mode"**
4. เลือก Location เดียวกับ Firestore

**ตั้งค่า Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;  // สำหรับทดสอบ
    }
  }
}
```

### ขั้นตอนที่ 4: รับ Firebase Config

1. ไปที่ **Project settings** (ไอคอนเฟือง)
2. เลื่อนลงไปที่ **"Your apps"**
3. คลิก **"Web"** (</>)
4. ตั้งชื่อ App เช่น `tutorial-builder-web`
5. คัดลอก Config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### ขั้นตอนที่ 5: ตั้งค่าโปรเจค

1. **Clone หรือ Download โปรเจค**

2. **แก้ไขไฟล์ `src/firebase.config.js`**
   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",           // ← ใส่ค่าจริง
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

3. **ติดตั้ง Dependencies**
   ```bash
   npm install
   ```

4. **รันโปรเจค**
   ```bash
   npm run dev
   ```

5. **เปิดเบราว์เซอร์**
   ```
   http://localhost:5173
   ```

---

## 📤 การ Deploy ขึ้น GitHub Pages

### ขั้นตอนที่ 1: สร้าง GitHub Repository

1. ไปที่ [github.com/new](https://github.com/new)
2. ตั้งชื่อ repository เช่น `tutorial-builder`
3. เลือก **Public**
4. คลิก **"Create repository"**

### ขั้นตอนที่ 2: Push โค้ด

```bash
# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/tutorial-builder.git

# Push
git branch -M main
git push -u origin main
```

### ขั้นตอนที่ 3: Deploy

```bash
# Build และ Deploy
npm run deploy
```

### ขั้นตอนที่ 4: ตั้งค่า GitHub Pages

1. ไปที่ Repository > **Settings > Pages**
2. Source: เลือก **"Deploy from a branch"**
3. Branch: เลือก **"gh-pages"** และ **"/ (root)"**
4. คลิก **Save**

หลังจาก 1-2 นาที เว็บจะพร้อมใช้งานที่:
```
https://YOUR_USERNAME.github.io/tutorial-builder/
```

---

## 📖 วิธีใช้งาน

### สร้างคู่มือใหม่

1. คลิก **"สร้างคู่มือใหม่"**
2. ใส่ชื่อคู่มือ
3. เลือกโฟลเดอร์ (ถ้าต้องการ)
4. อัพโหลดภาพ หรือ แยกเฟรมจากวิดีโอ
5. แก้ไขคำอธิบายแต่ละสไลด์
6. กำหนดเวลาแสดง
7. เพิ่ม Hotspot (คลิกบนภาพ)
8. คลิก **"สร้างคู่มือ"**

### สร้าง Embed Code

1. คลิกไอคอน **</>** บนการ์ดคู่มือ
2. ปรับขนาด (กว้าง/สูง)
3. เลือก Auto-play (ถ้าต้องการ)
4. คัดลอก **Responsive Code**
5. วางใน Canvas หรือ Notion

### การวาง Embed ใน Canvas

1. ไปที่หน้า Page ใน Canvas
2. คลิก **Edit**
3. เลือก **Insert > Embed**
4. วาง **embed code**
5. คลิก **Submit**

### การวาง Embed ใน Notion

1. ไปที่หน้าที่ต้องการ
2. พิมพ์ `/embed`
3. วาง **Direct Link**
4. คลิก **Embed link**

---

## ⌨️ Keyboard Shortcuts

| ปุ่ม | การทำงาน |
|------|---------|
| ← | สไลด์ก่อนหน้า |
| → | สไลด์ถัดไป |
| Space | เล่น/หยุด |

---

## 🔧 การปรับแต่ง

### เปลี่ยนสีหลัก

แก้ไขไฟล์ `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#0ea5e9',  // ← เปลี่ยนสีที่นี่
    // ...
  }
}
```

### เพิ่มฟอนต์

แก้ไขไฟล์ `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=YOUR_FONT&display=swap" rel="stylesheet">
```

---

## 📁 โครงสร้างไฟล์

```
tutorial-builder/
├── public/
├── src/
│   ├── App.jsx           # Main component
│   ├── main.jsx          # Entry point
│   ├── index.css         # Styles
│   └── firebase.config.js # Firebase settings
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🛡️ Security Notes

สำหรับ Production ควรตั้งค่า Firebase Rules ให้รัดกุมมากขึ้น:

```javascript
// Firestore Rules (Production)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tutorials/{tutorialId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /folders/{folderId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📝 License

MIT License - ใช้งานได้อย่างอิสระ

---

## 🤝 Support

หากมีปัญหาหรือข้อเสนอแนะ สามารถ:
- เปิด Issue บน GitHub
- ติดต่อผ่าน Email

---

Made with ❤️ for CMU Faculty of Engineering
