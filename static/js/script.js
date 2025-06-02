// Custom JavaScript for the VIP Dashboard

let vipUsersTable; // متغیری برای نگهداری نمونه DataTables
let vipStatusChart; // متغیری برای نگهداری نمونه Chart.js
let vipDurationChart; // متغیری برای نگهداری نمونه Chart.js برای توزیع مدت

document.addEventListener('DOMContentLoaded', function() {
    // بستن خودکار پیام های فلش بعد از چند ثانیه
    const flashMessages = document.querySelectorAll('.alert');
    flashMessages.forEach(alert => {
         // فقط پیام هایی که دکمه بستن ندارند را خودکار ببند
         if (!alert.classList.contains('alert-dismissible') || alert.querySelector('.btn-close') === null) {
             setTimeout(() => {
                const bootstrapAlert = bootstrap.Alert.getOrCreateInstance(alert);
                bootstrapAlert.close();
            }, 5000); // 5 ثانیه
        }
    });

    // تابع برای نمایش نشانگر بارگذاری سراسری
    function showGlobalLoading() {
        $('#global-loading-indicator').removeClass('d-none');
    }

    // تابع برای پنهان کردن نشانگر بارگذاری سراسری
    function hideGlobalLoading() {
        $('#global-loading-indicator').addClass('d-none');
    }

     // تابع برای نمایش نشانگر بارگذاری در Modal جزئیات
    function showModalLoading() {
        $('#userDetailsContent .modal-loading-indicator').removeClass('d-none');
        $('#userDetailsData').addClass('d-none'); // پنهان کردن محتوای قبلی
    }

    // تابع برای پنهان کردن نشانگر بارگذاری در Modal جزئیات
    function hideModalLoading() {
        $('#userDetailsContent .modal-loading-indicator').addClass('d-none');
        $('#userDetailsData').removeClass('d-none'); // نمایش محتوای جدید
    }


    // مقداردهی اولیه DataTables
    vipUsersTable = $('#vipUsersTable').DataTable({
        "processing": true, // نمایش پیام "در حال پردازش..."
        "serverSide": false, // ما داده ها را یکجا از API می گیریم و DataTables در سمت کلاینت مدیریت می کند
        "ajax": {
            "url": "/api/vips", // آدرس API برای دریافت داده ها
            "dataSrc": "data", // نام کلیدی که لیست داده ها در پاسخ JSON قرار دارد
            "beforeSend": function() {
                showGlobalLoading(); // نمایش نشانگر قبل از ارسال درخواست
            },
            "complete": function() {
                hideGlobalLoading(); // پنهان کردن نشانگر بعد از اتمام درخواست
            }
        },
        "columns": [
            { "data": "user_id" },
            { "data": "start_date" },
            { "data": "end_date" },
            { "data": "duration" },
            { // ستون وضعیت با استایل دهی
                "data": "status",
                "render": function(data, type, row) {
                    let statusClass = 'status-unknown';
                    if (data === 'فعال') {
                        statusClass = 'status-active';
                    } else if (data === 'منقضی شده') {
                        statusClass = 'status-expired';
                    }
                    return `<span class="${statusClass}">${data}</span>`;
                }
            },
            { // ستون عملیات (تمدید و حذف)
                "data": null, // این ستون داده مستقیمی از منبع ندارد
                "render": function(data, type, row) {
                    // row شامل تمام داده های مربوط به سطر فعلی است
                    const userId = row.user_id;
                    return `
                        <div class="action-buttons">
                            <button type="button" class="btn btn-sm btn-primary extend-btn" data-bs-toggle="modal" data-bs-target="#extendModal" data-user-id="${userId}">تمدید</button>
                            <button type="button" class="btn btn-sm btn-danger delete-btn" data-user-id="${userId}">حذف</button>
                        </div>
                    `;
                },
                "orderable": false // غیرفعال کردن مرتب سازی برای این ستون
            }
        ],
        "language": {
            // مسیر جدید برای فایل زبان فارسی محلی
            "url": "/static/fa.json"
        },
        "dom": 'lBfrtip', // چیدمان عناصر DataTables: Length, Buttons, Filtering, Table, Info, Pagination
        "buttons": [
            {
                extend: 'copy',
                text: 'کپی',
                className: 'btn btn-secondary btn-sm'
            },
            {
                extend: 'excelHtml5',
                text: 'اکسل',
                className: 'btn btn-success btn-sm'
            },
            {
                extend: 'csvHtml5',
                text: 'CSV',
                className: 'btn btn-info btn-sm',
                bom: true // اضافه کردن BOM برای پشتیبانی از UTF-8 در اکسل و برنامه های دیگر
            },
            // دکمه PDF حذف شد
            {
                extend: 'print',
                text: 'چاپ',
                className: 'btn btn-secondary btn-sm'
            },
             {
                extend: 'colvis',
                text: 'نمایش/پنهان کردن ستون',
                className: 'btn btn-secondary btn-sm'
            }
        ],
        "initComplete": function(settings, json) {
            // این تابع پس از بارگذاری اولیه داده ها و رسم جدول اجرا می شود
            // می توانیم آمار را از پاسخ JSON دریافت و به روز کنیم
            if (json && json.stats) {
                updateStats(json.stats);
            } else {
                 // اگر آمار در پاسخ JSON نبود، خودمان از داده های جدول محاسبه می کنیم
                 const calculatedStats = calculateStatsFromTable();
                 updateStats(calculatedStats);
            }
             // همیشه نمودارها را پس از بارگذاری اولیه یا رفرش جدول به روز رسانی کنید
             updateCharts();
        }
    });

    // تابع برای محاسبه آمار از داده های فعلی جدول
    function calculateStatsFromTable() {
         let activeCount = 0;
         let expiredCount = 0;
         const data = vipUsersTable.rows().data(); // دریافت تمام داده های جدول

         data.each(function(row) {
             if (row.status === 'فعال') {
                 activeCount++;
             } else if (row.status === 'منقضی شده') {
                 expiredCount++;
             }
         });

         return {
             total: data.length,
             active: activeCount,
             expired: expiredCount
         };
    }

     // تابع برای محاسبه توزیع مدت اشتراک از داده های فعلی جدول
    function calculateDurationDistributionFromTable() {
        // اطمینان از اینکه کلیدها رشته هستند مطابق با مقادیر duration در داده ها
        const distribution = { '1': 0, '3': 0, '6': 0, '12': 0 };
        const data = vipUsersTable.rows().data(); // دریافت تمام داده های جدول

        // لاگ های دیباگ حذف شدند
        data.each(function(row) {
            // اطمینان از اینکه duration وجود دارد و به رشته تبدیل شده
            const duration = row.duration !== undefined && row.duration !== null ? String(row.duration) : 'unknown';

            if (distribution.hasOwnProperty(duration)) {
                distribution[duration]++;
            }
        });
        return distribution;
    }


    // تابع برای به روز رسانی نمایش آمار در کارت ها
    function updateStats(stats) {
        $('#total-vips-count').text(stats.total);
        $('#active-vips-count').text(stats.active);
        $('#expired-vips-count').text(stats.expired);
    }

    // تابع اصلی برای به روز رسانی همه نمودارها
    function updateCharts() {
        const stats = calculateStatsFromTable();
        updateStatusChart(stats);

        const durationDistribution = calculateDurationDistributionFromTable();
        updateDurationChart(durationDistribution);
    }


    // تابع برای مقداردهی اولیه یا به روز رسانی نمودار وضعیت
    function updateStatusChart(stats) {
        const ctx = document.getElementById('vipStatusChart').getContext('2d');

        // اگر نمودار قبلا وجود دارد، آن را نابود کنید
        if (vipStatusChart) {
            vipStatusChart.destroy();
        }

        vipStatusChart = new Chart(ctx, {
            type: 'pie', // نوع نمودار: دایره ای
            data: {
                labels: ['فعال', 'منقضی شده'], // برچسب ها
                datasets: [{
                    label: 'تعداد کاربران',
                    data: [stats.active, stats.expired], // داده ها
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)', // سبز برای فعال
                        'rgba(220, 53, 69, 0.8)' // قرمز برای منقضی شده
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(220, 53, 69, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                 responsive: true,
                 maintainAspectRatio: false, // اجازه می دهد ارتفاع ثابت chart-container اعمال شود
                 plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: 'Vazirmatn', // اعمال فونت وزیر برای برچسب های نمودار
                            }
                        }
                    },
                    title: {
                        display: false, // عنوان نمودار را پنهان می کنیم چون در کارت داریم
                        text: 'وضعیت کاربران VIP'
                    }
                 }
            }
        });
    }

     // تابع برای مقداردهی اولیه یا به روز رسانی نمودار توزیع مدت اشتراک
    function updateDurationChart(distribution) {
        const ctx = document.getElementById('vipDurationChart').getContext('2d');

        // اگر نمودار قبلا وجود دارد، آن را نابود کنید
        if (vipDurationChart) {
            vipDurationChart.destroy();
        }

        vipDurationChart = new Chart(ctx, {
            type: 'bar', // نوع نمودار: ستونی
            data: {
                labels: ['۱ ماهه', '۳ ماهه', '۶ ماهه', '۱۲ ماهه'], // برچسب ها
                datasets: [{
                    label: 'تعداد کاربران',
                    data: [distribution['1'], distribution['3'], distribution['6'], distribution['12']], // داده ها
                    backgroundColor: [
                        'rgba(0, 123, 255, 0.8)', // آبی
                        'rgba(255, 193, 7, 0.8)',  // زرد
                        'rgba(23, 162, 184, 0.8)', // فیروزه ای
                        'rgba(108, 117, 125, 0.8)' // خاکستری
                    ],
                     borderColor: [
                        'rgba(0, 123, 255, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(23, 162, 184, 1)',
                        'rgba(108, 117, 125, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                 responsive: true,
                 maintainAspectRatio: false,
                 plugins: {
                    legend: {
                        display: false // افسانه (Legend) را پنهان می کنیم چون یک مجموعه داده داریم
                    },
                    title: {
                        display: false, // عنوان نمودار را پنهان می کنیم
                        text: 'توزیع مدت اشتراک'
                    }
                 },
                 scales: {
                    y: {
                        beginAtZero: true, // شروع محور Y از صفر
                        ticks: {
                            font: {
                                family: 'Vazirmatn'
                            },
                             stepSize: 1 // گام های محور Y یک واحدی
                        }
                    },
                    x: {
                         ticks: {
                            font: {
                                family: 'Vazirmatn' // اعمال فونت وزیر برای برچسب های محور X
                            }
                        }
                    }
                 }
            }
        });
    }


    // مدیریت ارسال فرم افزودن کاربر با AJAX
    $('#addVipForm').on('submit', function(event) {
        event.preventDefault(); // جلوگیری از ارسال معمولی فرم

        const form = $(this);
        const formData = form.serialize(); // دریافت داده های فرم

        $.ajax({
            url: '/api/vip/add',
            method: 'POST',
            data: formData,
            dataType: 'json', // انتظار پاسخ JSON
            beforeSend: function() {
                showGlobalLoading(); // نمایش نشانگر قبل از ارسال درخواست
            },
            success: function(response) {
                // نمایش پیام موفقیت
                showFlashMessage(response.message, response.status);
                // رفرش کردن جدول DataTables برای نمایش کاربر جدید
                vipUsersTable.ajax.reload(function(json) {
                     // پس از رفرش جدول، آمار و نمودارها را به روز رسانی کنید
                     if (json && json.stats) {
                         updateStats(json.stats);
                     } else {
                         const calculatedStats = calculateStatsFromTable();
                         updateStats(calculatedStats);
                     }
                     updateCharts(); // به روز رسانی هر دو نمودار
                     hideGlobalLoading(); // پنهان کردن نشانگر بعد از رفرش جدول
                });
                // پاک کردن فرم
                form[0].reset();
            },
            error: function(xhr) {
                // نمایش پیام خطا
                const errorResponse = xhr.responseJSON || { message: 'خطا در افزودن کاربر.' };
                showFlashMessage(errorResponse.message, errorResponse.status || 'danger');
                hideGlobalLoading(); // پنهان کردن نشانگر در صورت خطا
            }
        });
    });

    // مدیریت باز شدن Modal تمدید و پر کردن اطلاعات
    $('#extendModal').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget); // دکمه ای که Modal را فعال کرده
        const userId = button.data('user-id'); // استخراج آیدی کاربر از data-user-id

        const modal = $(this);
        modal.find('#extendUserId').text(userId); // نمایش آیدی کاربر در Modal
        modal.find('#modalUserId').val(userId); // قرار دادن آیدی کاربر در فیلد مخفی فرم
        modal.find('#extendMessage').addClass('d-none').text('').removeClass('alert-success alert-danger alert-warning alert-info'); // پاک کردن پیام قبلی
    });

    // مدیریت ارسال فرم تمدید با AJAX
    $('#extendForm').on('submit', function(event) {
        event.preventDefault(); // جلوگیری از ارسال معمولی فرم

        const form = $(this);
        const userId = form.find('#modalUserId').val(); // دریافت آیدی کاربر از فیلد مخفی
        const duration = form.find('#modalDurationSelect').val(); // دریافت مدت تمدید

        $.ajax({
            url: `/api/vip/extend/${userId}`, // استفاده از آیدی کاربر در URL
            method: 'POST',
            data: { duration: duration }, // ارسال مدت تمدید
            dataType: 'json',
             beforeSend: function() {
                showGlobalLoading();
            },
            success: function(response) {
                // نمایش پیام موفقیت در Modal
                const messageElement = $('#extendMessage');
                messageElement.text(response.message).removeClass('d-none').addClass('alert-success');

                // رفرش کردن جدول DataTables پس از موفقیت
                 setTimeout(() => {
                     $('#extendModal').modal('hide'); // بستن Modal
                     vipUsersTable.ajax.reload(function(json) {
                         // پس از رفرش جدول، آمار و نمودارها را به روز رسانی کنید
                         if (json && json.stats) {
                             updateStats(json.stats);
                         } else {
                             const calculatedStats = calculateStatsFromTable();
                             updateStats(calculatedStats);
                         }
                         updateCharts(); // به روز رسانی هر دو نمودار
                         hideGlobalLoading(); // پنهان کردن نشانگر
                     });
                 }, 1500); // بستن Modal بعد از 1.5 ثانیه

            },
            error: function(xhr) {
                // نمایش پیام خطا در Modal
                const errorResponse = xhr.responseJSON || { message: 'خطا در تمدید اشتراک.' };
                const messageElement = $('#extendMessage');
                messageElement.text(errorResponse.message).removeClass('d-none').addClass('alert-danger');
                hideGlobalLoading(); // پنهان کردن نشانگر
            }
        });
    });

    // مدیریت کلیک روی دکمه حذف با AJAX
    // از event delegation استفاده می کنیم چون دکمه ها به صورت پویا اضافه می شوند
    $('#vipUsersTable tbody').on('click', '.delete-btn', function(e) {
        e.stopPropagation(); // جلوگیری از انتشار رویداد کلیک به سطر (برای باز شدن Modal جزئیات)
        const userId = $(this).data('user-id'); // استخراج آیدی کاربر

        // نمایش پنجره تایید
        if (confirm(`آیا از حذف کاربر با آیدی ${userId} مطمئن هستید؟`)) {
            // ارسال درخواست DELETE با AJAX
            $.ajax({
                url: `/api/vip/delete/${userId}`, // استفاده از آیدی کاربر در URL
                method: 'DELETE', // استفاده از متد DELETE
                dataType: 'json',
                 beforeSend: function() {
                    showGlobalLoading(); // نمایش نشانگر
                },
                success: function(response) {
                    // نمایش پیام موفقیت
                    showFlashMessage(response.message, response.status);
                    // رفرش کردن جدول DataTables
                    vipUsersTable.ajax.reload(function(json) {
                         // پس از رفرش جدول، آمار و نمودارها را به روز رسانی کنید
                         if (json && json.stats) {
                             updateStats(json.stats);
                         } else {
                             const calculatedStats = calculateStatsFromTable();
                             updateStats(calculatedStats);
                         }
                         updateCharts(); // به روز رسانی هر دو نمودار
                         hideGlobalLoading(); // پنهان کردن نشانگر
                    });
                },
                error: function(xhr) {
                    // نمایش پیام خطا
                    const errorResponse = xhr.responseJSON || { message: 'خطا در حذف کاربر.' };
                    showFlashMessage(errorResponse.message, errorResponse.status || 'danger');
                    hideGlobalLoading(); // پنهان کردن نشانگر
                }
            });
        }
    });

    // مدیریت کلیک روی سطر جدول برای نمایش جزئیات کاربر
    $('#vipUsersTable tbody').on('click', 'tr', function() {
        const rowData = vipUsersTable.row(this).data(); // دریافت داده های سطر کلیک شده
        // اطمینان از اینکه روی دکمه های عملیات کلیک نشده است
        if ($(event.target).closest('.action-buttons').length === 0) {
             if (rowData && rowData.user_id) {
                const userId = rowData.user_id;
                // نمایش Modal جزئیات
                const userDetailsModal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
                userDetailsModal.show();

                // واکشی جزئیات کامل کاربر با AJAX
                fetchUserDetails(userId);
            }
        }
    });

    // تابع برای واکشی جزئیات کاربر با AJAX
    function fetchUserDetails(userId) {
        showModalLoading(); // نمایش نشانگر بارگذاری در Modal

        $.ajax({
            url: `/api/vip/${userId}`,
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                // پر کردن Modal با داده های کاربر
                // تاریخ ها و زمان ها از بک اند به صورت شمسی فرمت شده اند
                $('#detailUserId').text(data.user_id);
                $('#detailStartDate').text(data.start_date);
                $('#detailEndDate').text(data.end_date);
                $('#detailDuration').text(data.duration);
                $('#detailStatus').text(data.status).removeClass().addClass(`status-${data.status === 'فعال' ? 'active' : data.status === 'منقضی شده' ? 'expired' : 'unknown'}`); // اعمال کلاس وضعیت
                $('#detailCreatedAt').text(data.created_at); // استفاده مستقیم از تاریخ فرمت شده از بک اند

                // پر کردن تاریخچه تمدیدها
                const historyList = $('#renewalHistoryList');
                historyList.empty(); // پاک کردن لیست قبلی

                if (data.renewal_history && data.renewal_history.length > 0) {
                    $('#noRenewalHistory').addClass('d-none');
                    data.renewal_history.forEach(item => {
                        // تاریخ ها در item از بک اند به صورت شمسی فرمت شده اند
                        const listItem = `
                            <li>
                                <strong>تاریخ تمدید:</strong> <span>${item.date}</span> -
                                <strong>مدت:</strong> <span>${item.duration} ماهه</span> -
                                <strong>تاریخ پایان جدید:</strong> <span>${item.new_end_date}</span>
                            </li>
                        `;
                        historyList.append(listItem);
                    });
                } else {
                    $('#noRenewalHistory').removeClass('d-none');
                }

                hideModalLoading(); // پنهان کردن نشانگر و نمایش داده ها
            },
            error: function(xhr) {
                // نمایش پیام خطا در Modal
                const errorResponse = xhr.responseJSON || { message: 'خطا در بارگذاری جزئیات کاربر.' };
                $('#userDetailsContent').html(`<div class="alert alert-danger">${errorResponse.message}</div>`); // نمایش خطا به جای محتوا
                 hideModalLoading(); // پنهان کردن نشانگر (اگرچه محتوا جایگزین شده)
            }
        });
    }


    // تابع کمکی برای نمایش پیام های فلش (مشابه Flask)
    function showFlashMessage(message, category) {
        const container = $('#flash-messages-container');
        const alertHtml = `
            <div class="alert alert-dismissible fade show alert-${category}" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        container.append(alertHtml);

        // بستن خودکار پیام بعد از چند ثانیه (فقط برای پیام هایی که دکمه بستن ندارند)
        const newAlert = container.children().last();
         if (!newAlert.hasClass('alert-dismissible') || newAlert.find('.btn-close').length === 0) {
             setTimeout(() => {
                const bootstrapAlert = bootstrap.Alert.getOrCreateInstance(newAlert[0]);
                bootstrapAlert.close();
            }, 5000); // 5 ثانیه
        }
    }

    // تنظیمات فونت برای PDFMake (مورد نیاز DataTables Buttons PDF)
    // این بخش دیگر نیازی نیست چون دکمه PDF حذف شده است.
    // با این حال، اگر در آینده نیاز شد، باید مطمئن شوید که مسیر فونت صحیح است
    // و pdfMake به درستی بارگذاری شده است.
    /*
    if (typeof pdfMake !== 'undefined') {
        pdfMake.fonts = {
            Vazirmatn: {
                normal: '{{ url_for("static", filename="fonts/Vazirmatn-Regular.ttf") }}', // مسیر فایل فونت در پوشه static
                bold: '{{ url_for("static", filename="fonts/Vazirmatn-Bold.ttf") }}',
                italics: '{{ url_for("static", filename="fonts/Vazirmatn-Regular.ttf") }}', // فونت ایتالیک نداریم، از نرمال استفاده می کنیم
                bolditalics: '{{ url_for("static", filename="fonts/Vazirmatn-Bold.ttf") }}'
            }
        };
    } else {
        console.error("PDFMake is not loaded. PDF export will not work.");
    }
    */


});