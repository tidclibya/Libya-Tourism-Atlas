import { fetchTourismData, prepareActivityData } from './dataService.js';

// عناصر DOM
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

// جلب البيانات
async function loadData() {
    showLoading();
    
    try {
        const tourismData = await fetchTourismData();
        appData = {
            ...tourismData,
            activities: tourismData.activities || []
        };
        
        updateDashboard();
    } catch (error) {
        showError('تعذر تحميل البيانات. يرجى التحقق من اتصال الإنترنت والمحاولة لاحقاً.');
        console.error('Initialization error:', error);
    } finally {
        hideLoading();
    }
}

// ... (بقية الدوال كما هي في الكود السابق) ...

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', init);