/**
 * @fileoverview This file centralizes all API endpoints for the application.
 * It reads the base URL from environment variables and exports a structured
 * object of all API URLs. This makes it easy to manage and update API paths
 * from a single location.
 * 
 * Some endpoints are tenant-specific and require a storeId. For these,
 * the config exports a function that takes the storeId and returns the URL.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://farmhub-5huw.onrender.com';

const tenantUrl = (storeId: string, path: string) => `${API_BASE_URL}/tenant/${storeId}/${path}`;

export const API_URLS = {
    // Global Endpoints (do not require storeId)
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
        ME: `${API_BASE_URL}/auth/me`,
    },
    USERS: `${API_BASE_URL}/users`, // For GET all, POST new, etc. Individual user is /users/:id
    STORES: `${API_BASE_URL}/stores`, // For GET all, POST new, etc. Individual store is /stores/:id. Used for settings.

    // Tenant-Specific Endpoint Functions (require a storeId)
    DASHBOARD: (storeId: string) => ({
        STATS: tenantUrl(storeId, 'dashboard/stats'),
        REVENUE_CHART: tenantUrl(storeId, 'dashboard/revenue-chart'),
    }),
    PRODUCTS: (storeId: string) => tenantUrl(storeId, 'products'),
    CATEGORIES: (storeId: string) => tenantUrl(storeId, 'categories'),
    CUSTOMERS: (storeId: string) => tenantUrl(storeId, 'customers'),
    ORDERS: (storeId: string) => tenantUrl(storeId, 'orders'),
    SUPPLIERS: (storeId: string) => tenantUrl(storeId, 'suppliers'),
    PURCHASES: (storeId: string) => tenantUrl(storeId, 'purchases'),
    RETURNS: (storeId: string) => tenantUrl(storeId, 'returns'),
    DEBTS: (storeId: string) => tenantUrl(storeId, 'debts'),
    INSTALLMENTS: (storeId: string) => tenantUrl(storeId, 'installments'),
    STOCK_ADJUSTMENTS: (storeId: string) => tenantUrl(storeId, 'stock-adjustments'),
    REPORTS: (storeId: string) => tenantUrl(storeId, 'reports'),
};
