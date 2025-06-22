export const mockCustomers = [
  { id: 'CUST001', name: 'John Doe', email: 'john.doe@example.com', totalSpent: 1500, outstandingDebt: 200, joinDate: '2023-01-15' },
  { id: 'CUST002', name: 'Jane Smith', email: 'jane.smith@example.com', totalSpent: 2500, outstandingDebt: 0, joinDate: '2023-02-20' },
  { id: 'CUST003', name: 'Mike Johnson', email: 'mike.j@example.com', totalSpent: 800, outstandingDebt: 50, joinDate: '2023-03-10' },
  { id: 'CUST004', name: 'Emily Davis', email: 'emily.d@example.com', totalSpent: 3200, outstandingDebt: 0, joinDate: '2023-04-05' },
  { id: 'CUST005', name: 'Chris Lee', email: 'chris.lee@example.com', totalSpent: 500, outstandingDebt: 100, joinDate: '2023-05-12' },
];

export const mockProducts = [
  { id: 'PROD001', name: 'Organic Apples', category: 'Fruits', price: 2.99, stock: 150, unit: 'kg', imageUrl: 'https://placehold.co/300x300.png', hint: 'green apple' },
  { id: 'PROD002', name: 'Carrots', category: 'Vegetables', price: 1.49, stock: 200, unit: 'kg', imageUrl: 'https://placehold.co/300x300.png', hint: 'fresh carrots' },
  { id: 'PROD003', name: 'Whole Wheat Bread', category: 'Bakery', price: 3.99, stock: 80, unit: 'loaf', imageUrl: 'https://placehold.co/300x300.png', hint: 'artisan bread' },
  { id: 'PROD004', name: 'Free-Range Eggs', category: 'Dairy & Eggs', price: 4.99, stock: 120, unit: 'dozen', imageUrl: 'https://placehold.co/300x300.png', hint: 'egg carton' },
  { id: 'PROD005', name: 'Organic Milk', category: 'Dairy & Eggs', price: 3.50, stock: 100, unit: 'gallon', imageUrl: 'https://placehold.co/300x300.png', hint: 'milk bottle' },
  { id: 'PROD006', name: 'Tomatoes', category: 'Vegetables', price: 2.29, stock: 180, unit: 'kg', imageUrl: 'https://placehold.co/300x300.png', hint: 'ripe tomatoes' },
  { id: 'PROD007', name: 'Bananas', category: 'Fruits', price: 0.99, stock: 250, unit: 'kg', imageUrl: 'https://placehold.co/300x300.png', hint: 'banana bunch' },
  { id: 'PROD008', name: 'Croissants', category: 'Bakery', price: 2.50, stock: 60, unit: 'piece', imageUrl: 'https://placehold.co/300x300.png', hint: 'buttery croissant' },
];

export const mockOrders = [
  { id: 'ORD001', customerName: 'John Doe', date: '2024-07-20', status: 'Delivered', total: 75.50 },
  { id: 'ORD002', customerName: 'Jane Smith', date: '2024-07-21', status: 'Pending', total: 120.00 },
  { id: 'ORD003', customerName: 'Mike Johnson', date: '2024-07-21', status: 'Delivered', total: 45.20 },
  { id: 'ORD004', customerName: 'Emily Davis', date: '2024-07-22', status: 'Shipped', total: 200.00 },
  { id: 'ORD005', customerName: 'Chris Lee', date: '2024-07-23', status: 'Pending', total: 30.00 },
  { id: 'ORD006', customerName: 'John Doe', date: '2024-07-23', status: 'Cancelled', total: 55.00 },
];
