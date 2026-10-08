# MJ — Premium Fashion & Lifestyle eCommerce Store

Official production-grade eCommerce web application for **MJ** (Modern Elegance & Contemporary Couture) featuring real-time inventory management, size & color variations, Bangladesh localized checkout (bKash, Nagad, Rocket, COD), and a full-featured Admin Control Portal.

---

## 🚀 GitHub Pages এ ব্ল্যাঙ্ক পেজ (Blank Page) ফিক্স করার নিয়ম

GitHub এ কোড পুশ করার পর GitHub Pages এ ব্ল্যাঙ্ক পেজ দেখা গেলে নিচের সহজ ধাপগুলো অনুসরণ করুন:

1. **GitHub Repository** এর **Settings** ট্যাবে যান।
2. বাঁপাশের মেনু থেকে **Pages** এ ক্লিক করুন।
3. **Build and deployment** সেকশনে:
   - **Source**: `Deploy from a branch` এর পরিবর্তে সিলেক্ট করুন 👉 **`GitHub Actions`**।
4. ব্যস! `.github/workflows/deploy.yml` অটোমেটিক প্রজেক্ট বিল্ড করে কোনো ব্ল্যাঙ্ক পেজ ছাড়াই সাইট লাইভ করে দেবে।

---

## 🔐 এডমিন প্যানেলে লগইন ও পাসওয়ার্ড পরিবর্তন (Admin Panel & Password)

### ১. এডমিন এক্সেস:
- **এডমিন লগইন URL**: `#/admin` অথবা নিচের বামপাশের **"Admin Panel"** বাটনে ক্লিক করুন।
- **ডিফল্ট ইমেইল**: `admin@mj.com`
- **ডিফল্ট পাসওয়ার্ড**: `admin123`
- **ওয়ান-ক্লিক ডাইরেক্ট লগইন**: এডমিন লগইন পেজে **"Direct Admin Access (1-Click Login)"** বাটনে ক্লিক করলেই সাথে সাথে কোনো পাসওয়ার্ড ছাড়াই এডমিন প্যানেলে ঢোকা যাবে।

### ২. এডমিন পাসওয়ার্ড পরিবর্তন করার নিয়ম:
1. এডমিন প্যানেলে ঢুকে উপরে ডানে **"Change Password"** বাটনে ক্লিক করুন (অথবা বামপাশের মেনু থেকে **"Admin Password & Security"** এ যান)।
2. বর্তমান পাসওয়ার্ড দিন (ডিফল্ট: `admin123`), এরপর আপনার নতুন পাসওয়ার্ড দিয়ে **"Save New Password"** এ ক্লিক করুন।
3. যদি কখনো পাসওয়ার্ড ভুলে যান:
   - এডমিন লগইন পেজে (`#/admin/login`) গিয়ে **"Change / Reset Password?"** লিংকে ক্লিক করে সরাসরি নতুন পাসওয়ার্ড সেট করে লগইন করতে পারবেন।
   - অথবা **"Reset to admin123"** বাটনে ক্লিক করলেই পাসওয়ার্ড রিসেট হয়ে যাবে।

---

## 🛠️ Local Development & Build

```bash
# Install dependencies
npm install

# Run development server (Port 3000)
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```
