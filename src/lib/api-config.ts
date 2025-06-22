/**
 * @fileoverview This file centralizes all API endpoints for the application.
 * It reads the base URL from environment variables and exports a structured
 * object of all API URLs. This makes it easy to manage and update API paths
 * from a single location.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const API_URLS = {
    // Auth
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
    ME: `${API_BASE_URL}/auth/me`,

    // Dashboard
    DASHBOARD_STATS: `${API_BASE_URL}/dashboard/stats`,
    REVENUE_CHART: `${API_BASE_URL}/dashboard/revenue-chart`,

    // Core
    PRODUCTS: `${API_BASE_URL}/products`,
    CATEGORIES: `${API_BASE_URL}/categories`,
    CUSTOMERS: `${API_BASE_URL}/customers`,
    ORDERS: `${API_BASE_URL}/orders`,
    SUPPLIERS: `${API_BASE_URL}/suppliers`,
    USERS: `${API_BASE_URL}/users`,
    
    // Additional features
    PURCHASES: `${API_BASE_URL}/purchases`,
    RETURNS: `${API_BASE_URL}/returns`,
    DEBTS: `${API_BASE_URL}/debts`,
    INSTALLMENTS: `${API_BASE_URL}/installments`,
    STOCK_ADJUSTMENTS: `${API_BASE_URL}/stock-adjustments`,
    REPORTS: `${API_BASE_URL}/reports`,
    SETTINGS: `${API_BASE_URL}/settings`,
};
