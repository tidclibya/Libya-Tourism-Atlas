export const CONFIG = {
    GITHUB_REPO: 'tidclibya/Libya-Tourism-Atlas',
    BRANCH: 'main',
    DATA_FILES: {
        hotels: 'Inotels.json',    // اسم الملف كما هو في المستودع
        beaches: 'viligags.json',  // اسم الملف كما هو في المستودع
        restaurants: 'restaurants.json',
        culturalSites: 'cultural_sites.json'
    },
    USE_PROXY: true,  // استخدام proxy لتفادي مشاكل CORS
    FALLBACK_TO_LOCAL: true  // استخدام البيانات المحلية إذا فشل الاتصال
};