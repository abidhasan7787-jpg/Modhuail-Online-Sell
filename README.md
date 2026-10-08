# MJ — Premium Fashion & Lifestyle eCommerce Store

Official production-grade eCommerce web application for **MJ** (Modern Elegance & Contemporary Couture) featuring real-time inventory management, size & color variations, Bangladesh localized checkout (bKash, Nagad, Rocket, COD), and a full-featured Admin Control Portal.

---

## 🚀 GitHub Actions Checks Fail & Blank Page ফিক্স করার সহজ সমাধান

### কেন GitHub-এ Checks Fail হচ্ছিল?
1. পূর্বে `package.json` এ `esbuild` ও `vite` এর মধ্যে peer-dependency কনফ্লিক্ট এবং `package-lock.json` অনুপস্থিত থাকার কারণে GitHub Actions এর `npm install` স্টেপে **ERESOLVE error** হয়ে চেক ফেইল হচ্ছিল।
2. আমরা কোডবেসে:
   - কনফ্লিক্টিং ডিপেন্ডেন্সি ফিক্স করে ফ্রেশ `package-lock.json` জেনারেট করেছি।
   - `.github/workflows/deploy.yml` এ `npm install --legacy-peer-deps` যোগ করেছি যাতে GitHub-এ বিল্ড ১০০% সফল হয়।
   - GitHub Pages এর জন্য `.nojekyll` এবং SPA 404 রাউটিং অটোমেটিক সেট করেছি।
   - দুটি ডেপ্লয়মেন্ট মেথডই একসাথে সাপোর্ট করেছি: **GitHub Actions** এবং **`gh-pages` branch**।

---

### 🌐 কিভাবে সাইট লাইভ/ডেপ্লয় করবেন (মাত্র ২ মিনিটে):

GitHub Repository তে যান:
1. উপরে **Settings** ট্যাবে ক্লিক করুন।
2. বামপাশের মেনু থেকে **Pages** এ যান।
3. **Build and deployment** এর নিচে **Source** অপশন দেখতে পাবেন:
   - **অপশন ১ (সবচেয়ে সহজ - রিকমেন্ডেড):**
     Source ড্রপডাউন থেকে সিলেক্ট করুন 👉 **`GitHub Actions`**।
     (এটি সিলেক্ট করলে সাথে সাথে GitHub Actions স্বয়ংক্রিয়ভাবে বিল্ড করে লাইভ করে দেবে এবং কোনো চেক ফেইল হবে না)।
   - **অপশন ২:**
     যদি `Deploy from a branch` সিলেক্ট করা থাকে, তবে Branch ড্রপডাউনে **`gh-pages`** এবং ফোল্ডার `/ (root)` সিলেক্ট করে **Save** দিন।
4. কয়েক সেকেন্ড অপেক্ষা করে পেজ রিফ্রেশ করলেই উপরে সাইটের লাইভ লিংক দেখতে পাবেন!

---

## 🔐 এডমিন প্যানেলে লগইন ও পাসওয়ার্ড পরিবর্তন (Admin Panel & Password)

### ১. এডমিন এক্সেস:
- **এডমিন লিঙ্ক**: সাইটের নিচে বামপাশে **"Admin Panel"** বাটনে ক্লিক করুন অথবা URL এর শেষে `#/admin` লিখুন।
- **ডিফল্ট ইমেইল**: `admin@mj.com`
- **ডিফল্ট পাসওয়ার্ড**: `admin123`
- **ওয়ান-ক্লিক ডাইরেক্ট লগইন**: এডমিন লগইন পেজে **"Direct Admin Access (1-Click Login)"** বাটনে ক্লিক করলেই সরাসরি পাসওয়ার্ড ছাড়াই এডমিন প্যানেলে ঢোকা যাবে।

### ২. এডমিন পাসওয়ার্ড পরিবর্তন করার নিয়ম:
1. এডমিন প্যানেলে ঢুকে উপরে ডানে **"Change Password"** বাটনে ক্লিক করুন (অথবা বামপাশের মেনু থেকে **"Admin Password & Security"** এ যান)।
2. বর্তমান পাসওয়ার্ড দিন (ডিফল্ট: `admin123`), এরপর আপনার নতুন পাসওয়ার্ড দিয়ে **"Save New Password"** এ ক্লিক করুন।
3. যদি কখনো পাসওয়ার্ড ভুলে যান:
   - এডমিন লগইন পেজে (`#/admin/login`) গিয়ে **"Change / Reset Password?"** অপশনে ক্লিক করে তাৎক্ষণিক নতুন পাসওয়ার্ড সেট করতে পারবেন।
   - অথবা **"Reset to default (admin123)"** বাটনে ক্লিক করে এক ক্লিকেই ডিফল্ট পাসওয়ার্ডে ফিরিয়ে নিতে পারবেন।

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
