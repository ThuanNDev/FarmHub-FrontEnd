
'use server';

import {
  mockProducts,
  mockCategories,
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
} from '@/lib/data';
import type { Product, Category, Customer, Order, Supplier, PurchaseOrder, ReturnOrder, StockAdjustment, User } from '@/types';
import { slugify } from '@/lib/utils';


// --- SIMULATE API LATENCY ---
const simulateDelay = (ms: number = 50) => new Promise(resolve => setTimeout(resolve, ms));

// --- PRODUCTS API ---
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


// --- CATEGORIES API ---
export const getCategories = async (): Promise<Category[]> => {
  await simulateDelay();
  return mockCategories.filter(c => !c.isDeleted);
};

export const getCategoryById = async (id: string): Promise<Category | undefined> => {
    await simulateDelay();
    return mockCategories.find(c => c.categoryId === id && !c.isDeleted);
};

export const getCategoryBySlug = async (slug: string): Promise<Category | undefined> => {
    await simulateDelay();
    return mockCategories.find(c => c.slug === slug && !c.isDeleted);
};

export const addCategory = async (data: Omit<Category, 'categoryId' | 'slug' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Category> => {
    await simulateDelay();
    const newCategory: Category = {
      ...data,
      categoryId: `cate-${Date.now()}`,
      slug: slugify(data.name),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    };
    mockCategories.unshift(newCategory);
    return newCategory;
};

export const updateCategory = async (id: string, data: Partial<Omit<Category, 'categoryId' | 'createdAt'>>): Promise<Category> => {
    await simulateDelay();
    const index = mockCategories.findIndex(c => c.categoryId === id);
    if (index === -1) throw new Error('Category not found');
    const updatedCategory = {
      ...mockCategories[index],
      ...data,
      slug: data.name ? slugify(data.name) : mockCategories[index].slug,
      updatedAt: new Date().toISOString()
    };
    mockCategories[index] = updatedCategory;
    return updatedCategory;
};

export const deleteCategory = async (id: string): Promise<void> => {
    await simulateDelay();
    const index = mockCategories.findIndex(c => c.categoryId === id);
    if (index !== -1) {
      mockCategories[index].isDeleted = true;
    }
};


// --- CUSTOMERS API ---
export const getCustomers = async (): Promise<Customer[]> => {
  await simulateDelay();
  return mockCustomers.filter(c => !c.isDeleted);
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
    await simulateDelay();
    return mockCustomers.find(c => c.customerId === id && !c.isDeleted);
};

// ... Add similar CRUD operations for other entities as needed ...

// --- ORDERS API ---
export const getOrders = async (): Promise<Order[]> => {
  await simulateDelay();
  return mockOrders;
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
    await simulateDelay();
    return mockOrders.find(o => o.orderId === id);
};

// --- SUPPLIERS API ---
export const getSuppliers = async (): Promise<Supplier[]> => {
  await simulateDelay();
  return mockSuppliers.filter(s => !s.isDeleted);
};

// --- And so on for all other data types...
// This layer isolates the data access logic from the UI components.
// When you switch to a real backend, you only need to change the implementation inside these functions.
