import React, { useState, useEffect } from 'react';
import { Order, Expense, MENU } from '@/constants';
import { storage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, ShoppingBag, DollarSign, Download, Trash2, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Edit state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editPizza, setEditPizza] = useState('');
  const [editSize, setEditSize] = useState('');
  const [editWater, setEditWater] = useState(0);
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(storage.getOrders());
    setExpenses(storage.getExpenses());
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.finalPrice, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const handleClearData = () => {
    if (orders.length === 0 && expenses.length === 0) {
      toast.error("No data to clear.");
      return;
    }

    if (window.confirm("Are you sure you want to end the day? This will download your daily report and then clear all data for today.")) {
      downloadPDF();
      storage.clearData();
      loadData();
      toast.success("Day ended. Report downloaded and data cleared.");
    }
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm("Delete this order?")) {
      storage.deleteOrder(id);
      loadData();
      toast.success("Order deleted");
    }
  };

  const startEditing = (order: Order) => {
    setEditingOrder(order);
    setEditPizza(order.pizzaName);
    setEditSize(order.size.toString());
    setEditWater(order.waterQuantity);
    setEditPrice(order.finalPrice.toString());
  };

  const handleUpdateOrder = () => {
    if (!editingOrder) return;

    const updated: Order = {
      ...editingOrder,
      pizzaName: editPizza,
      size: parseInt(editSize),
      waterQuantity: editWater,
      finalPrice: parseFloat(editPrice) || 0,
    };

    storage.updateOrder(updated);
    setEditingOrder(null);
    loadData();
    toast.success("Order updated");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();

    doc.setFontSize(20);
    doc.text('Hot Kitchen Live Pizza - Daily Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${today}`, 14, 30);

    // Summary
    doc.text('Summary:', 14, 45);
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Total Pizzas Sold', orders.length.toString()],
        ['Total Revenue', `${totalRevenue} Tk`],
        ['Total Expenses', `${totalExpenses} Tk`],
        ['Net Profit', `${netProfit} Tk`],
      ],
    });

    // Orders
    doc.text('Orders:', 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Time', 'Pizza', 'Size', 'Water', 'Price']],
      body: orders.map(o => [
        new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        o.pizzaName,
        `${o.size}"`,
        o.waterQuantity,
        `${o.finalPrice} Tk`
      ]),
    });

    // Expenses
    doc.text('Expenses:', 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Reason', 'Amount']],
      body: expenses.map(e => [e.reason, `${e.amount} Tk`]),
    });

    doc.save(`HotKitchen_Report_${today.replace(/\//g, '-')}.pdf`);
    toast.success("PDF Report downloaded!");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-brand-red text-white border-none shadow-md">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-xs uppercase tracking-wider font-bold">Pizzas Sold</p>
            <p className="text-3xl font-black font-display">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-brand-yellow text-brand-black border-none shadow-md">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <DollarSign className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-xs uppercase tracking-wider font-bold">Revenue</p>
            <p className="text-3xl font-black font-display">{totalRevenue} <span className="text-sm">Tk</span></p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-brand-black text-white border-none shadow-lg">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-400 uppercase font-bold">Net Profit</p>
            <p className={`text-4xl font-black font-display ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netProfit} <span className="text-xl">Tk</span>
            </p>
          </div>
          <TrendingUp className={`w-12 h-12 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'} opacity-50`} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={downloadPDF} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700">
          <Download className="mr-2 w-4 h-4" /> PDF Report
        </Button>
        <Button onClick={handleClearData} variant="destructive" className="flex-1 h-12">
          <Trash2 className="mr-2 w-4 h-4" /> End Day
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Today's Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Time</TableHead>
                  <TableHead>Pizza</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-[80px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No orders yet today.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.slice().reverse().map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-xs font-mono">
                        {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{order.pizzaName}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">
                          {order.size}" {order.waterQuantity > 0 && `+ ${order.waterQuantity} Water`}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">{order.finalPrice} Tk</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => startEditing(order)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDeleteOrder(order.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Pizza Name</Label>
              <Select onValueChange={setEditPizza} value={editPizza}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pizza" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">8" & 10"</div>
                  {Object.keys(MENU.eight_ten_inch).map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase mt-2">12"</div>
                  {Object.keys(MENU.twelve_inch).map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Size</Label>
                <Select onValueChange={setEditSize} value={editSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8"</SelectItem>
                    <SelectItem value="10">10"</SelectItem>
                    <SelectItem value="12">12"</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Water Qty</Label>
                <Input type="number" value={editWater} onChange={(e) => setEditWater(parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Final Price (Tk)</Label>
              <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOrder(null)}>Cancel</Button>
            <Button onClick={handleUpdateOrder} className="bg-brand-red">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
