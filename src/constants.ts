export interface PizzaSizePrices {
  8?: number;
  10?: number;
  12?: number;
}

export interface Menu {
  eight_ten_inch: Record<string, PizzaSizePrices>;
  twelve_inch: Record<string, number>;
}

export const MENU: Menu = {
  eight_ten_inch: {
    "Hot Lover Pizza": { 8: 180, 10: 260 },
    "Meat Hot & Spicy Chicken Pizza": { 8: 200, 10: 270 },
    "Hot BBQ Pizza": { 8: 220, 10: 320 },
    "Sausoge & Chicken Louded Pizza": { 8: 200, 10: 270 },
    "Meatball Special Pizza": { 8: 200, 10: 270 },
    "Over Load Chesse Pizza": { 8: 240, 10: 340 },
    "Over Load Chicken Pizza": { 8: 250, 10: 350 },
    "Hot Kitchen Special Live Pizza": { 8: 280, 10: 380 }
  },
  twelve_inch: {
    "Mexican Hot Pizza": 450,
    "Naga Special Hot Pizza": 450,
    "Hot BBQ Pizza": 480,
    "Four Season Pizza": 480,
    "Hot Pepperoni Pizza": 500,
    "Over Louded Cheese Pizza": 550,
    "Hot Special Chicken Pizza": 550,
    "Hot Italian Pizza": 600,
    "Hot Kitchen Special Live Pizza": 650
  }
};

export interface Order {
  id: string;
  pizzaName: string;
  size: number;
  waterQuantity: number;
  basePrice: number;
  finalPrice: number;
  timestamp: number;
}

export interface Expense {
  id: string;
  reason: string;
  amount: number;
  timestamp: number;
}
