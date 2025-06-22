export const mockCustomers = [
  { id: 'CUST001', name: 'John Doe', email: 'john.doe@example.com', totalSpent: 1500, outstandingDebt: 200, joinDate: '2023-01-15' },
  { id: 'CUST002', name: 'Jane Smith', email: 'jane.smith@example.com', totalSpent: 2500, outstandingDebt: 0, joinDate: '2023-02-20' },
  { id: 'CUST003', name: 'Mike Johnson', email: 'mike.j@example.com', totalSpent: 800, outstandingDebt: 50, joinDate: '2023-03-10' },
  { id: 'CUST004', name: 'Emily Davis', email: 'emily.d@example.com', totalSpent: 3200, outstandingDebt: 0, joinDate: '2023-04-05' },
  { id: 'CUST005', name: 'Chris Lee', email: 'chris.lee@example.com', totalSpent: 500, outstandingDebt: 100, joinDate: '2023-05-12' },
];

export const mockProducts = [
  { id: 'PROD001', name: 'Compact Tractor', category: 'Tractors', price: 25000, stock: 10, unit: 'piece', imageUrl: 'https://placehold.co/300x300.png', hint: 'compact tractor' },
  { id: 'PROD002', name: 'Combine Harvester', category: 'Harvesters', price: 450000, stock: 3, unit: 'piece', imageUrl: 'https://placehold.co/300x300.png', hint: 'combine harvester' },
  { id: 'PROD003', name: 'Moldboard Plow', category: 'Tillage', price: 7500, stock: 25, unit: 'piece', imageUrl: 'https://placehold.co/300x300.png', hint: 'tractor plow' },
  { id: 'PROD004', name: 'Air Seeder', category: 'Seeding', price: 120000, stock: 5, unit: 'piece', imageUrl: 'https://placehold.co/300x300.png', hint: 'air seeder' },
  { id: 'PROD005', name: 'Farm Sprayer', category: 'Sprayers', price: 85000, stock: 8, unit: 'piece', imageUrl: 'https://placehold.co/300x300.png', hint: 'farm sprayer' },
  { id: 'PROD006', name: 'Hay Baler', category: 'Hay & Forage', price: 35000, stock: 15, unit: 'piece', imageUrl: 'https://placehold.co/300x300.png', hint: 'hay baler' },
  { id: 'PROD007', name: 'Skid Steer', category: 'Loaders', price: 45000, stock: 12, unit: 'piece', imageUrl: 'https://placehold.co/300x300.png', hint: 'skid steer' },
  { id: 'PROD008', name: 'Grain Auger', category: 'Grain Handling', price: 12500, stock: 30, unit: 'piece', imageUrl: 'https://placehold.co/300x300.png', hint: 'grain auger' },
];

export const mockOrders = [
  { id: 'ORD001', customerName: 'John Doe', date: '2024-07-20', status: 'Delivered', total: 75.50 },
  { id: 'ORD002', customerName: 'Jane Smith', date: '2024-07-21', status: 'Pending', total: 120.00 },
  { id: 'ORD003', customerName: 'Mike Johnson', date: '2024-07-21', status: 'Delivered', total: 45.20 },
  { id: 'ORD004', customerName: 'Emily Davis', date: '2024-07-22', status: 'Shipped', total: 200.00 },
  { id: 'ORD005', customerName: 'Chris Lee', date: '2024-07-23', status: 'Pending', total: 30.00 },
  { id: 'ORD006', customerName: 'John Doe', date: '2024-07-23', status: 'Cancelled', total: 55.00 },
];
