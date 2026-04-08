import { Order, Expense } from '@/constants';

const ORDERS_KEY = 'hot_kitchen_orders';
const EXPENSES_KEY = 'hot_kitchen_expenses';

export const storage = {
  getOrders: (): Order[] => {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveOrder: (order: Order) => {
    const orders = storage.getOrders();
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },
  deleteOrder: (id: string) => {
    const orders = storage.getOrders();
    const filtered = orders.filter(o => o.id !== id);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(filtered));
  },
  updateOrder: (updatedOrder: Order) => {
    const orders = storage.getOrders();
    const index = orders.findIndex(o => o.id === updatedOrder.id);
    if (index !== -1) {
      orders[index] = updatedOrder;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
  },
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveExpense: (expense: Expense) => {
    const expenses = storage.getExpenses();
    expenses.push(expense);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  },
  clearData: () => {
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem(EXPENSES_KEY);
  }
};
