import React, { useState, useEffect } from 'react';
import { Expense } from '@/constants';
import { storage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    setExpenses(storage.getExpenses());
  }, []);

  const handleAddExpense = () => {
    if (!reason || !amount) {
      toast.error('Please enter reason and amount');
      return;
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      reason,
      amount: parseFloat(amount),
      timestamp: Date.now(),
    };

    storage.saveExpense(newExpense);
    setExpenses(storage.getExpenses());
    setReason('');
    setAmount('');
    toast.success('Expense added');
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 p-4">
      <Card className="border-2 border-orange-500/20 shadow-lg">
        <CardHeader className="bg-orange-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 font-display">
            <Receipt className="w-6 h-6" />
            Add Expense
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason / Item Name</Label>
            <Input
              id="reason"
              placeholder="e.g. Flour, Electricity, Rent"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (Tk)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12"
            />
          </div>
          <Button 
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 font-bold"
            onClick={handleAddExpense}
          >
            <Plus className="mr-2 w-5 h-5" /> ADD EXPENSE
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 text-white border-none">
        <CardContent className="p-6">
          <p className="text-sm text-slate-400 uppercase font-bold">Total Expenses Today</p>
          <p className="text-3xl font-black font-display text-orange-400">{totalExpenses} Tk</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Expense History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    No expenses recorded today.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.slice().reverse().map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.reason}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">{expense.amount} Tk</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
