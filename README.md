# Spottrak-VIP-Dashboard
A Flask-based web dashboard for managing VIP users of the Spottrak Telegram bot. (یک داشبورد وب مبتنی بر Flask برای مدیریت کاربران VIP ربات تلگرام اسپات‌ترک.)
# داشبورد مدیریت کاربران VIP ربات اسپات‌ترک

## 🚀 معرفی پروژه

این پروژه یک پنل مدیریت تحت وب قدرتمند و کاربرپسند است که به طور خاص برای مدیریت کاربران VIP ربات تلگرام اسپات‌ترک (Spottrak) طراحی و توسعه یافته بود. این داشبورد با استفاده از فریم‌ورک Flask پایتون در سمت بک‌اند و ترکیبی از HTML، CSS، JavaScript، Bootstrap، DataTables و Chart.js در سمت فرانت‌اند پیاده‌سازی شده است.

هدف اصلی این پنل، فراهم کردن ابزاری بصری و کارآمد برای مدیر جهت مشاهده، افزودن، تمدید و حذف کاربران VIP و همچنین نمایش آمارهای کلیدی مربوط به آن‌ها بوده است.

این پروژه نتیجه **چندین ماه تلاش مستمر و توسعه فنی دقیق** برای ارائه یک راهکار مدیریتی پایدار و کارآمد بوده است. **سورس کد این پروژه کاملاً سالم، تمیز و آماده استفاده است.** با وجود عملکرد فنی بی‌نقص، به دلیل محدودیت‌های اعمال شده از سوی پلتفرم اسپاتیفای و همچنین تمرکز تیم توسعه بر **رونمایی از ربات همه‌کاره موزیک جدیدمان**، فعالیت سرویس‌های مرتبط متوقف گردید. اکنون کد منبع آن جهت استفاده، مطالعه و یادگیری جامعه توسعه‌دهندگان و علاقه‌مندان منتشر می‌شود.

## ✨ ویژگی‌ها

*   **مدیریت جامع کاربران VIP:** امکان افزودن کاربران جدید، تمدید اشتراک‌های موجود و حذف کاربران.
*   **جدول تعاملی کاربران:** نمایش لیست کامل کاربران VIP در یک جدول پیشرفته با قابلیت‌های جستجو، مرتب‌سازی، صفحه‌بندی و فیلترینگ (با استفاده از DataTables).
*   **مشاهده جزئیات کاربر:** دسترسی به اطلاعات کامل هر کاربر VIP، شامل آیدی، تاریخ شروع و پایان اشتراک (به تاریخ شمسی)، مدت اشتراک، تاریخ ایجاد و تاریخچه دقیق تمدیدها.
*   **نمایش آمارهای کلیدی:** ارائه خلاصه‌ای از وضعیت کاربران (تعداد کل، فعال و منقضی شده) در قالب کارت‌های اطلاعاتی برجسته.
*   **نمودارهای بصری:** نمایش توزیع وضعیت کاربران (فعال/منقضی شده) و توزیع مدت اشتراک‌ها در قالب نمودارهای دایره‌ای و ستونی (با استفاده از Chart.js).
*   **رابط کاربری مدرن و واکنش‌گرا:** طراحی زیبا و کاربرپسند با استفاده از Bootstrap 5.3 RTL که در تمامی دستگاه‌ها به خوبی نمایش داده می‌شود.
*   **پشتیبانی کامل از زبان فارسی:** استفاده از فونت محبوب وزیرمتن و تنظیمات RTL برای تجربه کاربری بهتر.
*   **خروجی داده‌ها:** امکان خروجی گرفتن آسان از لیست کاربران در فرمت‌های رایج مانند Excel، CSV و همچنین قابلیت چاپ مستقیم.
*   **پایگاه داده قدرتمند:** استفاده از پایگاه داده NoSQL MongoDB برای ذخیره و مدیریت اطلاعات کاربران با انعطاف‌پذیری بالا.

## 🛠️ تکنولوژی‌های استفاده شده

*   **بک‌اند:**
    *   Python
    *   Flask
    *   PyMongo (برای ارتباط با MongoDB)
    *   jdatetime (برای کار با تاریخ شمسی)
    *   Gunicorn (برای استقرار در محیط پروداکشن)
*   **فرانت‌اند:**
    *   HTML5
    *   CSS3 (با استفاده از Bootstrap 5.3 RTL)
    *   JavaScript
    *   jQuery
    *   DataTables (برای جدول تعاملی)
    *   Chart.js (برای نمودارها)
    *   Bootstrap Icons
    *   فونت وزیرمتن

## 📂 ساختار پروژه

📁 vip_panel/
📄 requirements.txt # لیست وابستگی های پایتون
📁 backend/
📄 app.py # کد اصلی بک اند (Flask)
📄 vips.json # فایل JSON (در حال حاضر استفاده نمی شود)
📁 pycache/ # فایل های کامپایل شده پایتون
📁 static/ # فایل های استاتیک (CSS, JS, Fonts)
📄 fa.json # فایل زبان فارسی برای DataTables
📁 css/
📄 style.css # استایل های سفارشی
📁 fonts/ # فایل های فونت وزیرمتن
📄 Vazirmatn-*.ttf
📄 Vazirmatn-Regular.woff2
📁 js/
📄 script.js # کد جاوااسکریپت فرانت اند
📁 templates/ # فایل های قالب HTML (Jinja2)
📄 base.html # قالب پایه
📄 index.html # صفحه داشبورد اصلی
📄 login.html # صفحه ورود


## ⚙️ راه‌اندازی و نصب

برای راه‌اندازی و اجرای این پروژه به موارد زیر نیاز دارید:

*   Python 3.6 یا بالاتر
*   pip (مدیر بسته پایتون)
*   یک پایگاه داده MongoDB (می‌توانید از MongoDB Atlas برای یک دیتابیس رایگان استفاده کنید یا آن را به صورت لوکال نصب کنید).

مراحل نصب و راه‌اندازی:

1.  **کلون کردن مخزن گیت‌هاب:**
    ```bash
    git clone (https://github.com/MohammadHNdev/Spottrak-VIP-Dashboard)
    cd vip_panel
    ```
    *(**توجه:** لطفاً `(https://github.com/MohammadHNdev/Spottrak-VIP-Dashboard)` 
2.  **ایجاد و فعال‌سازی محیط مجازی پایتون (اختیاری اما توصیه می‌شود):**
    ```bash
    python -m venv venv
    # برای ویندوز:
    # venv\Scripts\activate
    # برای لینوکس/مک:
    source venv/bin/activate
    ```
3.  **نصب وابستگی‌های پروژه:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **پیکربندی اتصال به MongoDB:**
    *   یک پایگاه داده MongoDB راه‌اندازی کنید و رشته اتصال (Connection String) آن را دریافت نمایید.
    *   فایل `backend/app.py` را باز کنید.
    *   رشته اتصال خود را در متغیر `MONGO_URI` جایگزین کنید:
        
python
Copy Code
MONGO_URI = "YOUR_MONGODB_CONNECTION_STRING"
*   نام دیتابیس و کالکشن را نیز در صورت نیاز در متغیرهای `MONGO_DB_NAME` و `MONGO_COLLECTION_NAME` تنظیم کنید.
5. تنظیم کلید مخفی Flask:
* در فایل backend/app.py، متغیر app.secret_key را به یک رشته تصادفی و امن تغییر دهید. این برای امنیت سشن‌ها ضروری است:

python
Copy Code
app.secret_key = 'یک_کلید_مخفی_بسیار_امن_و_تصادفی_اینجا_قرار_دهید'
تنظیم اطلاعات ورود ادمین (هشدار امنیتی):
توجه: اطلاعات ورود پیش‌فرض ('admin', 'password') در فایل backend/app.py فقط برای تست محلی هستند و بسیار ناامن می‌باشند.
برای استفاده واقعی، اکیداً توصیه می‌شود این منطق را با یک روش احراز هویت امن‌تر (مانند ذخیره هش رمز عبور در دیتابیس و بررسی آن) جایگزین کنید.
اگر صرفاً برای تست موقت از کد استفاده می‌کنید، حداقل رمز عبور پیش‌فرض را در خط زیر به یک مقدار قوی تغییر دهید:
python
Copy Code
if username == 'admin' and password == 'password': # این را با منطق امن تر جایگزین کنید
اجرای برنامه:
حالت توسعه (برای تست محلی):
bash
Copy Code
python backend/app.py
برنامه در آدرس http://127.0.0.1:5000 (یا پورتی که در کد تنظیم شده) قابل دسترسی خواهد بود.
حالت پروداکشن (با Gunicorn):
bash
Copy Code
gunicorn -w 4 app:app -b 0.0.0.0:5000
(تعداد workerها (-w) را می‌توانید بر اساس منابع سرور تنظیم کنید. مطمئن شوید که در پوشه backend هستید یا مسیر app:app را به درستی تنظیم کنید.)
💡 نحوه استفاده
پس از راه‌اندازی موفقیت‌آمیز برنامه، به آدرس پنل در مرورگر خود بروید. ابتدا باید با استفاده از اطلاعات ورود ادمین وارد شوید. پس از ورود، به صفحه داشبورد هدایت می‌شوید که می‌توانید لیست کاربران VIP را مشاهده کرده و عملیات افزودن، تمدید و حذف را انجام دهید.

📄 مجوز (License)
این پروژه تحت مجوز MIT منتشر شده است. این مجوز به شما اجازه می‌دهد تا کد را مشاهده، تغییر داده و توزیع کنید، حتی برای مقاصد تجاری، به شرطی که شامل اعلامیه کپی‌رایت و متن مجوز اصلی باشید.

MIT License

Copyright (c) 2025 Mohammad Hossein Norouzi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
در صورت استفاده یا ارجاع به این کد منبع، خواهشمند است منبع اصلی (لینک مخزن گیت‌هاب) و نام توسعه‌دهنده (محمدحسین نوروزی) را ذکر نمایید.

👤 توسعه‌دهنده
این پروژه توسط محمدحسین نوروزی توسعه یافته است.
