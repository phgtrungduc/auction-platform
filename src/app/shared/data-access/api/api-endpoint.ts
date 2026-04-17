export const API_ENDPOINTS = {
    ASSET: {
        GET_LIST: '/marketplace/assets',
        GET_DETAIL: '/marketplace',
        ADVANCED_SEARCH: '/marketplace/advanced-search'
    },
    USER_FAVORITES: {
        GET_LIST: '/user-favorites',
        CREATE: '/user-favorites',
        DELETE: '/user-favorites'
    },
    CATEGORY: {
        GET_ASSET_CATEGORIES: '/categories/assets',
        GET_LEGAL_CATEGORIES: '/categories/legal'
    },
    DVHC: {
        GET_WARDS: '/dvhcs/wards',
        GET_DISTRICTS: '/dvhcs/districts',
        GET_PROVINCES: '/dvhcs/provinces',
    }
}