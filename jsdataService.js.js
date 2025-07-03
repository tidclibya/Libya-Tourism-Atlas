import { CONFIG } from './config.js';

// بيانات افتراضية للطوارئ
const DEFAULT_DATA = {
    hotels: [],
    beaches: [],
    restaurants: [],
    culturalSites: []
};

export async function fetchTourismData() {
    try {
        const dataRequests = Object.entries(CONFIG.DATA_FILES).map(async ([key, filename]) => {
            try {
                const data = await fetchData(filename);
                return { key, data };
            } catch (error) {
                console.warn(`Failed to load ${filename}:`, error);
                
                // جرب جلب البيانات من النسخة المحلية إذا كانت متاحة
                if (CONFIG.FALLBACK_TO_LOCAL) {
                    try {
                        const localData = await fetchLocalData(filename);
                        return { key, data: localData };
                    } catch (localError) {
                        console.warn(`Failed to load local ${filename}:`, localError);
                        return { key, data: DEFAULT_DATA[key] || [] };
                    }
                }
                
                return { key, data: DEFAULT_DATA[key] || [] };
            }
        });

        const results = await Promise.all(dataRequests);
        const data = results.reduce((acc, { key, data }) => {
            acc[key] = data;
            return acc;
        }, {});

        return {
            ...data,
            activities: prepareActivityData(data.hotels, data.beaches, data.restaurants, data.culturalSites)
        };
    } catch (error) {
        console.error('Error in fetchTourismData:', error);
        throw error;
    }
}

async function fetchData(filename) {
    const baseUrl = CONFIG.USE_PROXY 
        ? 'https://cors-anywhere.herokuapp.com/https://raw.githubusercontent.com'
        : 'https://raw.githubusercontent.com';

    const url = `${baseUrl}/${CONFIG.GITHUB_REPO}/${CONFIG.BRANCH}/${filename}`;
    
    const response = await fetch(url, {
        headers: CONFIG.USE_PROXY ? { 'X-Requested-With': 'XMLHttpRequest' } : {}
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

async function fetchLocalData(filename) {
    const response = await fetch(`data/${filename}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch local ${filename}`);
    }
    return await response.json();
}

export function prepareActivityData(hotels = [], beaches = [], restaurants = [], culturalSites = []) {
    const activities = [];
    
    // إضافة الفنادق
    activities.push(...hotels.map(item => ({
        ...item,
        type: 'فندق',
        icon: 'fas fa-hotel',
        category: item.rating ? `${item.rating} نجوم` : 'غير مصنف'
    })));
    
    // إضافة الشواطئ
    activities.push(...beaches.map(item => ({
        ...item,
        type: 'شاطئ',
        icon: 'fas fa-umbrella-beach',
        category: item.type || 'شاطئ عام'
    })));
    
    // إضافة المطاعم
    activities.push(...restaurants.map(item => ({
        ...item,
        type: 'مطعم',
        icon: 'fas fa-utensils',
        category: item.cuisine || 'متنوع'
    })));
    
    // إضافة المواقع الثقافية
    activities.push(...culturalSites.map(item => ({
        ...item,
        type: 'موقع ثقافي',
        icon: 'fas fa-landmark',
        category: item.type || 'موقع تاريخي'
    })));
    
    // فرز حسب التاريخ
    return activities.sort((a, b) => {
        const dateA = new Date(a.date || '1970-01-01');
        const dateB = new Date(b.date || '1970-01-01');
        return dateB - dateA;
    });
}