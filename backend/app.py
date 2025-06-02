from flask import Flask, request, jsonify, render_template, redirect, url_for, flash, session
from datetime import datetime, timedelta, date
import json
import os
import jdatetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
import sys # Import sys to use sys.exit()

app = Flask(__name__, template_folder='../templates', static_folder='../static')
app.secret_key = 'your_secret_key' # کلید مخفی برای مدیریت سشن ها و پیام های فلش

# MongoDB Configuration
MONGO_URI = "mongodb+srv://benyamincoach:ZAs0iLl2fveWChvC@cluster0.oj1ji2c.mongodb.net/music_bot_db?retryWrites=true&w=majority"
MONGO_DB_NAME = "music_bot_db"
MONGO_COLLECTION_NAME = "vip_users"

# MongoDB Connection variables
client = None
db = None
vips_collection = None

# Function to establish MongoDB connection
def connect_to_mongodb():
    global client, db, vips_collection
    try:
        # Connect to MongoDB Atlas
        # Set serverSelectionTimeoutMS to a reasonable value (e.g., 5000ms = 5 seconds)
        # to prevent the application from hanging indefinitely if the database is unreachable.
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # The ismaster command is cheap and does not require auth.
        client.admin.command('ismaster')
        db = client[MONGO_DB_NAME]
        vips_collection = db[MONGO_COLLECTION_NAME]
        print("Successfully connected to MongoDB!")
    except ConnectionFailure as e:
        print(f"Could not connect to MongoDB: {e}")
        # Handle connection error appropriately
        client = None # Ensure client is None if connection fails
        db = None
        vips_collection = None
    except Exception as e:
        print(f"An unexpected error occurred during MongoDB connection: {e}")
        client = None
        db = None
        vips_collection = None

# --- Helper Functions (Date Formatting) ---
# These functions remain the same as they format dates for display

# تابع کمکی برای تبدیل تاریخ میلادی به شمسی (با زمان)
def format_to_jalali(date_str):
    if not date_str:
        return "نامشخص"
    try:
        # فرض می کنیم تاریخ ورودی در فرمت ISO 8601 است
        gregorian_date = datetime.fromisoformat(date_str)
        jalali_date = jdatetime.datetime.fromgregorian(datetime=gregorian_date)
        # فرمت دلخواه شمسی
        return jalali_date.strftime('%Y/%m/%d %H:%M:%S')
    except (ValueError, TypeError):
        # اگر فرمت تاریخ اشتباه بود یا ورودی نوع نامناسبی داشت
        print(f"Warning: Could not format date string '{date_str}' to Jalali (with time).")
        return str(date_str) # همان رشته اصلی یا تبدیل به رشته را برگردان


# تابع کمکی برای تبدیل تاریخ میلادی (فقط تاریخ) به شمسی
def format_date_only_to_jalali(date_str):
     if not date_str:
        return "نامشخص"
     try:
        # فرض می کنیم تاریخ ورودی در فرمت YYYY-MM-DD است
        gregorian_date = datetime.strptime(date_str, '%Y-%m-%d').date() # تبدیل به date
        jalali_date = jdatetime.date.fromgregorian(date=gregorian_date)
        # فرمت دلخواه شمسی (فقط تاریخ)
        return jalali_date.strftime('%Y/%m/%d')
     except (ValueError, TypeError):
        # اگر فرمت تاریخ اشتباه بود یا ورودی نوع نامناسبی داشت
        print(f"Warning: Could not format date string '{date_str}' to Jalali (date only).")
        return str(date_str) # همان رشته اصلی یا تبدیل به رشته را برگردان

# --- Establish MongoDB Connection on App Load ---
# This code runs when Gunicorn loads the app object
connect_to_mongodb()

# Check if MongoDB connection was successful immediately after attempting to connect
if vips_collection is None:
    print("Failed to connect to MongoDB. Application will not be able to function.")
    # In a production environment managed by Systemd/Gunicorn,
    # raising an exception or exiting here will cause the service to fail,
    # which is the desired behavior if the database is essential.
    # Using sys.exit(1) is appropriate here.
    sys.exit(1) # Exit with a non-zero status code to indicate an error


# --- Flask Routes ---

# مسیر روت اصلی
@app.route('/')
def index():
    if 'logged_in' not in session:
        return redirect(url_for('login'))
    return render_template('index.html')

# مسیر لاگین
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        # منطق احراز هویت ساده (مثال)
        if username == 'admin' and password == 'password': # این را با منطق امن تر جایگزین کنید
            session['logged_in'] = True
            flash('ورود موفقیت آمیز بود.', 'success')
            return redirect(url_for('index'))
        else:
            flash('نام کاربری یا رمز عبور اشتباه است.', 'danger')
            # در صورت خطا، دوباره صفحه لاگین را نمایش بده
            return render_template('login.html')
    # اگر متد GET بود، صفحه لاگین را نمایش بده
    return render_template('login.html')

# مسیر خروج
@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('شما از سیستم خارج شدید.', 'info')
    return redirect(url_for('login'))

# API برای دریافت لیست کاربران VIP (استفاده از MongoDB)
@app.route('/api/vips', methods=['GET'])
def get_vips():
    if 'logged_in' not in session:
        return jsonify({"data": [], "message": "Unauthorized", "status": "danger"}), 401

    # No need to check vips_collection is None here anymore,
    # as the app would have exited if connection failed on load.
    # However, adding a check for robustness in case of transient issues is fine,
    # but the primary connection failure is handled at startup.

    try:
        # Fetch all documents from the collection
        vips = list(vips_collection.find())

        # Remove MongoDB's default _id field if present, as it's not needed in the frontend
        for vip in vips:
            if '_id' in vip:
                del vip['_id']

        # Calculate status and format dates for each user
        now = datetime.now()
        formatted_vips = []
        active_count = 0
        expired_count = 0

        for vip in vips:
            end_date_str = vip.get('end_date')
            status = "نامشخص"
            if end_date_str:
                try:
                    # Assuming end_date is stored as 'YYYY-MM-DD' string in MongoDB
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                    # Compare date objects
                    if end_date >= now.date():
                        status = "فعال"
                        active_count += 1
                    else:
                        status = "منقضی شده"
                        expired_count += 1
                except (ValueError, TypeError):
                    status = "خطا در تاریخ"
                    print(f"Error parsing end_date '{end_date_str}' for user {vip.get('user_id')}: ValueError/TypeError") # لاگ خطا

            formatted_vip = vip.copy()
            # Format dates to Jalali for display
            formatted_vip['start_date'] = format_date_only_to_jalali(vip.get('start_date'))
            formatted_vip['end_date'] = format_date_only_to_jalali(vip.get('end_date'))
            formatted_vip['status'] = status # Add calculated status

            formatted_vips.append(formatted_vip)

        total_count = len(vips)
        stats = {
            "total": total_count,
            "active": active_count,
            "expired": expired_count
        }

        return jsonify({"data": formatted_vips, "stats": stats, "message": "VIP users fetched successfully", "status": "success"})

    except OperationFailure as e:
        print(f"MongoDB Operation Error in get_vips: {e}") # لاگ خطا
        return jsonify({"data": [], "message": "Database operation failed", "status": "danger"}), 500
    except Exception as e:
        print(f"An unexpected error occurred in get_vips: {e}") # لاگ خطا
        return jsonify({"data": [], "message": "An internal error occurred", "status": "danger"}), 500


# API برای افزودن کاربر VIP جدید (استفاده از MongoDB)
@app.route('/api/vip/add', methods=['POST'])
def add_vip():
    if 'logged_in' not in session:
        return jsonify({"message": "Unauthorized", "status": "danger"}), 401

    # No need to check vips_collection is None here anymore

    user_id = request.form.get('user_id')
    duration = request.form.get('duration') # مدت به ماه (رشته)

    if not user_id or not duration:
        return jsonify({"message": "آیدی کاربر و مدت اشتراک الزامی هستند.", "status": "danger"}), 400

    try:
        # Check for existing user by user_id
        existing_user = vips_collection.find_one({"user_id": user_id})
        if existing_user:
            return jsonify({"message": f"کاربر با آیدی {user_id} قبلاً وجود دارد.", "status": "warning"}), 409 # 409 Conflict

        duration_months = int(duration)
        if duration_months <= 0:
             return jsonify({"message": "مدت اشتراک باید مثبت باشد.", "status": "danger"}), 400

        now = datetime.now()
        start_date = now.date()
        # Calculate end date (simple approximation)
        end_date = start_date + timedelta(days=duration_months * 30)

        new_vip = {
            "user_id": user_id,
            "start_date": start_date.isoformat(), # Store date as ISO 8601 string
            "end_date": end_date.isoformat(),     # Store date as ISO 8601 string
            "duration": duration_months,          # Store duration as number
            "created_at": now.isoformat(),        # Store creation date/time as ISO 8601 string
            "renewal_history": []                 # Initialize renewal history
        }

        # Insert the new document into the collection
        insert_result = vips_collection.insert_one(new_vip)
        print(f"Inserted user with id: {insert_result.inserted_id}") # Log inserted ID

        return jsonify({"message": f"کاربر با آیدی {user_id} با موفقیت اضافه شد.", "status": "success"}), 201 # 201 Created

    except ValueError:
        return jsonify({"message": "مدت اشتراک نامعتبر است.", "status": "danger"}), 400
    except OperationFailure as e:
        print(f"MongoDB Operation Error in add_vip: {e}") # لاگ خطا
        return jsonify({"message": "Database operation failed", "status": "danger"}), 500
    except Exception as e:
        print(f"An unexpected error occurred in add_vip: {e}") # لاگ خطا
        return jsonify({"message": "An internal error occurred", "status": "danger"}), 500


# API برای تمدید اشتراک کاربر VIP (استفاده از MongoDB)
@app.route('/api/vip/extend/<user_id>', methods=['POST'])
def extend_vip(user_id):
    if 'logged_in' not in session:
        return jsonify({"message": "Unauthorized", "status": "danger"}), 401

    # No need to check vips_collection is None here anymore

    duration = request.form.get('duration') # مدت تمدید به ماه (رشته)

    if not duration:
         return jsonify({"message": "مدت تمدید الزامی است.", "status": "danger"}), 400

    try:
        duration_months = int(duration)
        if duration_months <= 0:
             return jsonify({"message": "مدت تمدید باید مثبت باشد.", "status": "danger"}), 400

        # Find the user document
        vip_found = vips_collection.find_one({"user_id": user_id})

        if not vip_found:
            return jsonify({"message": f"کاربر با آیدی {user_id} یافت نشد.", "status": "danger"}), 404 # 404 Not Found

        # Calculate new end date
        current_end_date_str = vip_found.get('end_date')
        now = datetime.now()
        # Convert current end date string to date object
        current_end_date = datetime.strptime(current_end_date_str, '%Y-%m-%d').date() if current_end_date_str else now.date()

        # If current end date is in the past, extend from today, otherwise extend from current end date
        start_date_for_extension = max(current_end_date, now.date())

        # Calculate the new end date (result is a date object)
        new_end_date = start_date_for_extension + timedelta(days=duration_months * 30) # Simple approximation

        # Create renewal history entry
        renewal_entry = {
            "date": now.isoformat(), # Store renewal date/time as ISO 8601 string
            "duration": duration_months,
            "new_end_date": new_end_date.isoformat() # Store new end date as ISO 8601 string
        }

        # Update the document in MongoDB
        update_result = vips_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {"end_date": new_end_date.isoformat()}, # Update main end_date field
                "$push": {"renewal_history": renewal_entry} # Add entry to renewal_history array
            }
        )

        if update_result.modified_count == 0:
             print(f"Warning: Update operation for user {user_id} modified 0 documents.")
             # This might indicate an issue, but could also happen if the data was already correct.
             # For now, we'll treat it as a success if the user was found.

        return jsonify({"message": f"اشتراک کاربر با آیدی {user_id} به مدت {duration_months} ماه تمدید شد.", "status": "success"})

    except ValueError:
        return jsonify({"message": "مدت تمدید نامعتبر است.", "status": "danger"}), 400
    except OperationFailure as e:
        print(f"MongoDB Operation Error in extend_vip: {e}") # لاگ خطا
        return jsonify({"message": "Database operation failed", "status": "danger"}), 500
    except Exception as e:
        print(f"An unexpected error occurred in extend_vip: {e}") # لاگ خطا
        return jsonify({"message": "An internal error occurred", "status": "danger"}), 500


# API برای حذف کاربر VIP (استفاده از MongoDB)
@app.route('/api/vip/delete/<user_id>', methods=['DELETE'])
def delete_vip(user_id):
    if 'logged_in' not in session:
        return jsonify({"message": "Unauthorized", "status": "danger"}), 401

    # No need to check vips_collection is None here anymore

    try:
        # Delete the document by user_id
        delete_result = vips_collection.delete_one({"user_id": user_id})

        if delete_result.deleted_count == 0:
            return jsonify({"message": f"کاربر با آیدی {user_id} یافت نشد.", "status": "danger"}), 404 # 404 Not Found

        return jsonify({"message": f"کاربر با آیدی {user_id} با موفقیت حذف شد.", "status": "success"})

    except OperationFailure as e:
        print(f"MongoDB Operation Error in delete_vip: {e}") # لاگ خطا
        return jsonify({"message": "Database operation failed", "status": "danger"}), 500
    except Exception as e:
        print(f"An unexpected error occurred in delete_vip: {e}") # لاگ خطا
        return jsonify({"message": "An internal error occurred", "status": "danger"}), 500


# API برای دریافت جزئیات یک کاربر VIP خاص (استفاده از MongoDB)
@app.route('/api/vip/<user_id>', methods=['GET'])
def get_vip_details(user_id):
    if 'logged_in' not in session:
        return jsonify({"message": "Unauthorized", "status": "danger"}), 401

    # No need to check vips_collection is None here anymore

    try:
        # Find the user document
        vip_found = vips_collection.find_one({"user_id": user_id})

        if not vip_found:
            return jsonify({"message": f"کاربر با آیدی {user_id} یافت نشد.", "status": "danger"}), 404 # 404 Not Found

        # Remove MongoDB's default _id field
        if '_id' in vip_found:
            del vip_found['_id']

        # Calculate status and format dates
        now = datetime.now()
        end_date_str = vip_found.get('end_date')
        status = "نامشخص"
        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                if end_date >= now.date():
                    status = "فعال"
                else:
                    status = "منقضی شده"
            except (ValueError, TypeError):
                status = "خطا در تاریخ"
                print(f"Error parsing end_date '{end_date_str}' for user {vip_found.get('user_id')} in details API: ValueError/TypeError") # لاگ خطا


        detailed_vip = vip_found.copy()
        # Format dates to Jalali for display
        detailed_vip['start_date'] = format_date_only_to_jalali(vip_found.get('start_date'))
        detailed_vip['end_date'] = format_date_only_to_jalali(vip_found.get('end_date'))
        detailed_vip['created_at'] = format_to_jalali(vip_found.get('created_at')) # Format full creation date/time
        detailed_vip['status'] = status

        # Format renewal history dates
        formatted_renewal_history = []
        if 'renewal_history' in vip_found:
            for entry in vip_found['renewal_history']:
                formatted_entry = entry.copy()
                # Use Jalali formatting for history dates
                formatted_entry['date'] = format_to_jalali(entry.get('date'))
                formatted_entry['new_end_date'] = format_date_only_to_jalali(entry.get('new_end_date'))
                formatted_renewal_history.append(formatted_entry)
        detailed_vip['renewal_history'] = formatted_renewal_history


        return jsonify(detailed_vip) # Return all user details

    except OperationFailure as e:
        print(f"MongoDB Operation Error in get_vip_details: {e}") # لاگ خطا
        return jsonify({"message": "Database operation failed", "status": "danger"}), 500
    except Exception as e:
        print(f"An unexpected error occurred in get_vip_details: {e}") # لاگ خطا
        return jsonify({"message": "An internal error occurred", "status": "danger"}), 500


# --- Main Execution Block (for local development only) ---
if __name__ == '__main__':
    # Ensure static/fonts directory exists (if still needed for static files)
    fonts_dir = os.path.join(app.static_folder, 'fonts')
    if not os.path.exists(fonts_dir):
        try:
            os.makedirs(fonts_dir)
            print(f"Created directory: {fonts_dir}")
        except OSError as e:
            print(f"Error creating directory {fonts_dir}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred while creating {fonts_dir}: {e}")

    # Run the Flask application
    # This block is only for running the app directly (e.g., python app.py)
    # In production, use a production WSGI server like Gunicorn or uWSGI
    print("Running Flask app in development mode...")
    app.run(debug=True, host='0.0.0.0', port=5000)