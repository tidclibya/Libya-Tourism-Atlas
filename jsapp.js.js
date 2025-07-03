// العناصر الرئيسية في DOM
const DOM = {
    stats: {
        hotels: document.getElementById('hotelsCount'),
        beaches: document.getElementById('beachesCount'),
        restaurants: document.getElementById('restaurantsCount'),
        culturalSites: document.getElementById('culturalSitesCount')
    },
    activityTable: document.getElementById('activityTableBody'),
    searchInput: document.getElementById('searchInput'),
    viewAllActivities: document.getElementById('viewAllActivities'),
    loadingIndicator: document.querySelector('.loading-indicator'),
    errorContainer: document.querySelector('.error-container'),
    modals: {
        hotel: document.getElementById('hotelModal'),
        beach: document.getElementById('beachModal'),
        restaurant: document.getElementById('restaurantModal'),
        export: document.getElementById('exportModal')
    },
    forms: {
        hotel: document.getElementById('hotelForm'),
        beach: document.getElementById('beachForm'),
        restaurant: document.getElementById('restaurantForm'),
        export: document.getElementById('exportForm')
    }
};

// البيانات المخزنة
let appData = {
    hotels: [],
    beaches: [],
    restaurants: [],
    culturalSites: [],
    activities: []
};

// تهيئة التطبيق
function init() {
    setupEventListeners();
    loadData();
}

// جلب البيانات من GitHub
async function loadData() {
    showLoading();
    
    try {
        const [hotels, beaches, restaurants, culturalSites] = await Promise.all([
            fetchData('hotels.json'),
            fetchData('beaches.json'),
            fetchData('restaurants.json'),
            fetchData('cultural_sites.json')
        ]);
        
        appData = {
            hotels,
            beaches,
            restaurants,
            culturalSites,
            activities: prepareActivityData(hotels, beaches, restaurants, culturalSites)
        };
        
        updateDashboard();
    } catch (error) {
        showError('فشل تحميل البيانات. يرجى المحاولة لاحقًا.');
        console.error('Error loading data:', error);
    } finally {
        hideLoading();
    }
}

// جلب بيانات من ملف JSON
async function fetchData(filename) {
    const response = await fetch(`https://raw.githubusercontent.com/tidclibya/Libya-Tourism-Atlas/main/data/${filename}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${filename}`);
    }
    return await response.json();
}

// تحضير بيانات النشاطات
function prepareActivityData(hotels, beaches, restaurants, culturalSites) {
    const activities = [];
    
    // إضافة الفنادق
    if (hotels) {
        activities.push(...hotels.map(item => ({
            ...item,
            type: 'فندق',
            icon: 'fas fa-hotel',
            category: item.rating ? `${item.rating} نجوم` : 'غير مصنف'
        })));
    }
    
    // إضافة الشواطئ
    if (beaches) {
        activities.push(...beaches.map(item => ({
            ...item,
            type: 'شاطئ',
            icon: 'fas fa-umbrella-beach',
            category: item.type || 'شاطئ عام'
        })));
    }
    
    // إضافة المطاعم
    if (restaurants) {
        activities.push(...restaurants.map(item => ({
            ...item,
            type: 'مطعم',
            icon: 'fas fa-utensils',
            category: item.cuisine || 'متنوع'
        })));
    }
    
    // إضافة المواقع الثقافية
    if (culturalSites) {
        activities.push(...culturalSites.map(item => ({
            ...item,
            type: 'موقع ثقافي',
            icon: 'fas fa-landmark',
            category: item.type || 'موقع تاريخي'
        })));
    }
    
    // فرز حسب التاريخ
    return activities.sort((a, b) => {
        const dateA = new Date(a.date || '1970-01-01');
        const dateB = new Date(b.date || '1970-01-01');
        return dateB - dateA;
    });
}

// تحديث لوحة التحكم
function updateDashboard() {
    updateStatistics();
    updateActivityTable();
    createChart();
}

// تحديث الإحصائيات
function updateStatistics() {
    DOM.stats.hotels.textContent = appData.hotels?.length || 0;
    DOM.stats.beaches.textContent = appData.beaches?.length || 0;
    DOM.stats.restaurants.textContent = appData.restaurants?.length || 0;
    DOM.stats.culturalSites.textContent = appData.culturalSites?.length || 0;
}

// تحديث جدول النشاطات
function updateActivityTable() {
    DOM.activityTable.innerHTML = '';
    
    const activitiesToShow = appData.activities.slice(0, 5);
    
    activitiesToShow.forEach(activity => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><i class="${activity.icon}"></i> ${activity.type}</td>
            <td>${activity.name}</td>
            <td>${activity.city || 'غير محدد'}</td>
            <td>${activity.category}</td>
            <td><span class="status ${getStatusClass(activity.status)}">${getStatusText(activity.status)}</span></td>
            <td>${activity.date || 'غير محدد'}</td>
        `;
        DOM.activityTable.appendChild(row);
    });
}

// إنشاء الرسم البياني
function createChart() {
    const ctx = document.getElementById('statsChart').getContext('2d');
    
    if (window.statsChart) {
        window.statsChart.destroy();
    }
    
    window.statsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['الفنادق', 'الشواطئ', 'المطاعم', 'المواقع الثقافية'],
            datasets: [{
                data: [
                    appData.hotels?.length || 0,
                    appData.beaches?.length || 0,
                    appData.restaurants?.length || 0,
                    appData.culturalSites?.length || 0
                ],
                backgroundColor: [
                    '#1a5276',
                    '#2980b9',
                    '#f39c12',
                    '#27ae60'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    rtl: true
                }
            }
        }
    });
}

// إعداد معالجات الأحداث
function setupEventListeners() {
    // البحث
    DOM.searchInput.addEventListener('input', (e) => {
        filterTable(e.target.value.toLowerCase());
    });
    
    // عرض كل النشاطات
    DOM.viewAllActivities.addEventListener('click', (e) => {
        e.preventDefault();
        showAllActivities();
    });
    
    // الأزرار السريعة
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', () => {
            const action = card.getAttribute('data-action');
            handleQuickAction(action);
        });
    });
    
    // إغلاق النماذج
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // معالجة إرسال النماذج
    DOM.forms.hotel.addEventListener('submit', (e) => {
        e.preventDefault();
        addNewHotel();
    });
    
    DOM.forms.beach.addEventListener('submit', (e) => {
        e.preventDefault();
        addNewBeach();
    });
    
    DOM.forms.restaurant.addEventListener('submit', (e) => {
        e.preventDefault();
        addNewRestaurant();
    });
    
    DOM.forms.export.addEventListener('submit', (e) => {
        e.preventDefault();
        exportReport();
    });
}

// تصفية الجدول حسب البحث
function filterTable(term) {
    const rows = DOM.activityTable.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

// عرض كل النشاطات
function showAllActivities() {
    DOM.activityTable.innerHTML = '';
    
    appData.activities.forEach(activity => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><i class="${activity.icon}"></i> ${activity.type}</td>
            <td>${activity.name}</td>
            <td>${activity.city || 'غير محدد'}</td>
            <td>${activity.category}</td>
            <td><span class="status ${getStatusClass(activity.status)}">${getStatusText(activity.status)}</span></td>
            <td>${activity.date || 'غير محدد'}</td>
        `;
        DOM.activityTable.appendChild(row);
    });
}

// معالجة الأزرار السريعة
function handleQuickAction(action) {
    switch(action) {
        case 'add-hotel':
            openModal('hotel');
            break;
        case 'add-beach':
            openModal('beach');
            break;
        case 'add-restaurant':
            openModal('restaurant');
            break;
        case 'export-report':
            openModal('export');
            break;
    }
}

// فتح النموذج المطلوب
function openModal(modalType) {
    closeAllModals();
    DOM.modals[modalType].style.display = 'flex';
}

// إغلاق كل النماذج
function closeAllModals() {
    Object.values(DOM.modals).forEach(modal => {
        modal.style.display = 'none';
    });
}

// إضافة فندق جديد
function addNewHotel() {
    const newHotel = {
        name: document.getElementById('hotelName').value,
        city: document.getElementById('hotelCity').value,
        rating: document.getElementById('hotelRating').value,
        status: document.getElementById('hotelStatus').value,
        description: document.getElementById('hotelDescription').value,
        date: new Date().toISOString().split('T')[0]
    };
    
    appData.hotels.unshift(newHotel);
    appData.activities = prepareActivityData(
        appData.hotels, 
        appData.beaches, 
        appData.restaurants, 
        appData.culturalSites
    );
    
    updateDashboard();
    closeAllModals();
    DOM.forms.hotel.reset();
}

// إضافة شاطئ جديد
function addNewBeach() {
    const newBeach = {
        name: document.getElementById('beachName').value,
        city: document.getElementById('beachCity').value,
        type: document.getElementById('beachType').value,
        status: document.getElementById('beachStatus').value,
        description: document.getElementById('beachDescription').value,
        date: new Date().toISOString().split('T')[0]
    };
    
    appData.beaches.unshift(newBeach);
    appData.activities = prepareActivityData(
        appData.hotels, 
        appData.beaches, 
        appData.restaurants, 
        appData.culturalSites
    );
    
    updateDashboard();
    closeAllModals();
    DOM.forms.beach.reset();
}

// إضافة مطعم جديد
function addNewRestaurant() {
    const newRestaurant = {
        name: document.getElementById('restaurantName').value,
        city: document.getElementById('restaurantCity').value,
        cuisine: document.getElementById('restaurantCuisine').value,
        status: document.getElementById('restaurantStatus').value,
        description: document.getElementById('restaurantDescription').value,
        date: new Date().toISOString().split('T')[0]
    };
    
    appData.restaurants.unshift(newRestaurant);
    appData.activities = prepareActivityData(
        appData.hotels, 
        appData.beaches, 
        appData.restaurants, 
        appData.culturalSites
    );
    
    updateDashboard();
    closeAllModals();
    DOM.forms.restaurant.reset();
}

// تصدير التقرير
function exportReport() {
    const type = document.getElementById('exportType').value;
    const format = document.getElementById('exportFormat').value;
    
    let dataToExport = [];
    let fileName = 'تقرير_أطلس_ليبيا_السياحي';
    
    switch(type) {
        case 'hotels':
            dataToExport = appData.hotels;
            fileName += '_الفنادق';
            break;
        case 'beaches':
            dataToExport = appData.beaches;
            fileName += '_الشواطئ';
            break;
        case 'restaurants':
            dataToExport = appData.restaurants;
            fileName += '_المطاعم';
            break;
        case 'cultural':
            dataToExport = appData.culturalSites;
            fileName += '_المواقع_الثقافية';
            break;
        default:
            dataToExport = appData.activities;
    }
    
    fileName += `_${new Date().toISOString().split('T')[0]}`;
    
    // هنا يمكنك إضافة منطق التصدير الفعلي حسب الصيغة المطلوبة
    console.log(`تصدير بيانات ${type} بصيغة ${format}:`, dataToExport);
    
    alert(`تم تجهيز بيانات التقرير للتصدير بصيغة ${format}`);
    closeAllModals();
    DOM.forms.export.reset();
}

// عرض مؤشر التحميل
function showLoading() {
    DOM.loadingIndicator.style.display = 'flex';
}

// إخفاء مؤشر التحميل
function hideLoading() {
    DOM.loadingIndicator.style.display = 'none';
}

// عرض رسالة خطأ
function showError(message) {
    DOM.errorContainer.innerHTML = `
        <div class="error-alert">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button class="retry-btn">إعادة المحاولة</button>
        </div>
    `;
    
    DOM.errorContainer.style.display = 'block';
    
    document.querySelector('.retry-btn').addEventListener('click', () => {
        DOM.errorContainer.style.display = 'none';
        loadData();
    });
}

// تحويل حالة النشاط إلى كلاس CSS
function getStatusClass(status) {
    const statusMap = {
        active: 'active',
        pending: 'pending',
        inactive: 'inactive'
    };
    return statusMap[status] || 'pending';
}

// تحويل حالة النشاط إلى نص
function getStatusText(status) {
    const statusTextMap = {
        active: 'نشط',
        pending: 'قيد المراجعة',
        inactive: 'غير نشط'
    };
    return statusTextMap[status] || 'قيد المراجعة';
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', init);