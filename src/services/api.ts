

import {
  mockProducts,
  mockCustomers,
  mockOrders,
  mockOrderItems,
  mockSuppliers,
  mockPurchaseOrders,
  mockPurchaseOrderItems,
  mockReturnOrders,
  mockReturnOrderItems,
  mockStockAdjustments,
  mockUsers,
  mockCategories,
} from '@/lib/data';
import type { Product, Category, Customer, Order, Supplier, PurchaseOrder, ReturnOrder, StockAdjustment, User, ApiUser } from '@/types';
import { UserRole } from '@/types';
import { slugify } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { API_URLS } from '@/lib/api-config';


// --- SIMULATE API LATENCY ---
const simulateDelay = (ms: number = 50) => new Promise(resolve => setTimeout(resolve, ms));

// --- AUTH API ---
export const getUserIdFromToken = async (): Promise<string> => {
  const res = await apiClient<{ userId: string }>(API_URLS.AUTH.ME);
  // apiClient already unwraps the .data property
  return res.userId;
};

export const getUserDetail = async (userId: string): Promise<User> => {
  const res = await apiClient<User>(`${API_URLS.USERS}/${userId}`);
  // apiClient already unwraps the .data property
  return res;
};

export const getMe = async (): Promise<User | null> => {
  try {
    const { userId } = await apiClient<{ userId: string }>(API_URLS.AUTH.ME);
    if (!userId) return null;
    
    const userDetail = await apiClient<User>(`${API_URLS.USERS}/${userId}`);
    return userDetail;
  } catch (error) {
    console.error('❌ Error fetching current user data:', error);
    return null;
  }
};

// --- PRODUCTS API (Uses mock data) ---
export const getProducts = async (): Promise<Product[]> => {
  await simulateDelay();
  return mockProducts.filter(p => !p.isDeleted);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
    await simulateDelay();
    return mockProducts.find(p => p.productId === id && !p.isDeleted);
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    await simulateDelay();
    return mockProducts.find(p => p.slug === slug && !p.isDeleted);
};

export const getProductsByCategoryId = async (categoryId: string): Promise<Product[]> => {
    await simulateDelay();
    return mockProducts.filter(p => p.categoryId === categoryId && !p.isDeleted);
};


// --- CATEGORIES API (Uses real API) ---
// NOTE: GET and DELETE endpoints are assumed based on REST principles as they are not in the docs.
export const getCategories = async (storeId: string): Promise<Category[]> => {
  return apiClient<Category[]>(API_URLS.CATEGORIES(storeId));
};

export const getCategoryBySlug = async (slug: string): Promise<Category | undefined> => {
    // This function is used on a detail page. For now, we keep it using mock data
    // to avoid cascading changes. A real implementation would need a `storeId`
    // and a `GET /.../categories/slug/{slug}` endpoint.
    await simulateDelay();
    return mockCategories.find(c => c.slug === slug && !c.isDeleted);
};

export const addCategory = async (storeId: string, data: Partial<Category>): Promise<Category> => {
    return apiClient<Category>(API_URLS.CATEGORIES(storeId), {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateCategory = async (storeId: string, categoryId: string, data: Partial<Category>): Promise<Category> => {
    const url = `${API_URLS.CATEGORIES(storeId)}/${categoryId}`;
    return apiClient<Category>(url, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const deleteCategory = async (storeId: string, categoryId: string): Promise<void> => {
    const url = `${API_URLS.CATEGORIES(storeId)}/${categoryId}`;
    await apiClient<void>(url, { method: 'DELETE' });
};


// --- CUSTOMERS API (Uses real API) ---
// NOTE: GET and DELETE endpoints are assumed based on REST principles as they are not in the docs.
export const getCustomers = async (storeId: string): Promise<Customer[]> => {
  return apiClient<Customer[]>(API_URLS.CUSTOMERS(storeId));
};

export const getCustomerById = async (storeId: string, customerId: string): Promise<Customer | undefined> => {
  const url = `${API_URLS.CUSTOMERS(storeId)}/${customerId}`;
  return apiClient<Customer>(url);
};

export const addCustomer = async (storeId: string, data: Partial<Customer>): Promise<Customer> => {
  return apiClient<Customer>(API_URLS.CUSTOMERS(storeId), {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCustomer = async (storeId: string, customerId: string, data: Partial<Customer>): Promise<Customer> => {
  const url = `${API_URLS.CUSTOMERS(storeId)}/${customerId}`;
  return apiClient<Customer>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCustomer = async (storeId: string, customerId: string): Promise<void> => {
    const url = `${API_URLS.CUSTOMERS(storeId)}/${customerId}`;
    await apiClient<void>(url, { method: 'DELETE' });
};


// --- ORDERS API (Uses mock data) ---
export const getOrders = async (): Promise<Order[]> => {
  await simulateDelay();
  return mockOrders;
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
    await simulateDelay();
    return mockOrders.find(o => o.orderId === id);
};

// --- SUPPLIERS API (Uses mock data) ---
export const getSuppliers = async (): Promise<Supplier[]> => {
  await simulateDelay();
  return mockSuppliers.filter(s => !s.isDeleted);
};

// --- STORES API ---
export const addStore = async (data: Partial<Store>): Promise<Store> => {
  return apiClient<Store>(API_URLS.STORES, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
