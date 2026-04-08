import React, { useState, useEffect } from 'react';
import { MENU, Order } from '@/constants';
import { storage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Pizza, Droplets, Plus, Minus, Save } from 'lucide-react';
import { toast } from 'sonner';

interface NewOrderProps {
  onOrderSaved: () => void;
}

export default function NewOrder({ onOrderSaved }: NewOrderProps) {
  const [selectedPizza, setSelectedPizza] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [waterQuantity, setWaterQuantity] = useState<number>(0);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [isWaterChecked, setIsWaterChecked] = useState(false);

  // Derived state
  const isTwelveInchOnly = selectedPizza in MENU.twelve_inch;
  const isEightTenInchOnly = selectedPizza in MENU.eight_ten_inch;

  const getAutoPrice = () => {
    if (!selectedPizza || !selectedSize) return 0;
    
    let price = 0;
    if (isTwelveInchOnly && selectedSize === '12') {
      price = MENU.twelve_inch[selectedPizza];
    } else if (isEightTenInchOnly) {
      const sizes = MENU.eight_ten_inch[selectedPizza];
      price = sizes[parseInt(selectedSize) as keyof typeof sizes] || 0;
    }
    return price;
  };

  const autoPrice = getAutoPrice();
  const waterPrice = waterQuantity * 20;
  const totalPrice = (customPrice ? parseFloat(customPrice) : autoPrice) + waterPrice;

  const handleSaveOrder = () => {
    if (!selectedPizza || !selectedSize) {
      toast.error('Please select pizza and size');
      return;
    }

    const order: Order = {
      id: crypto.randomUUID(),
      pizzaName: selectedPizza,
      size: parseInt(selectedSize),
      waterQuantity,
      basePrice: autoPrice,
      finalPrice: totalPrice,
      timestamp: Date.now(),
    };

    storage.saveOrder(order);
    toast.success('Order saved successfully!');
    
    // Reset form
    setSelectedPizza('');
    setSelectedSize('');
    setWaterQuantity(0);
    setCustomPrice('');
    setIsWaterChecked(false);
    onOrderSaved();
  };

  return (
    <div className="space-y-6 p-4">
      <Card className="border-2 border-brand-red/20 shadow-lg">
        <CardHeader className="bg-brand-red text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 font-display">
            <Pizza className="w-6 h-6" />
            New Pizza Order
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pizza-select">Select Pizza</Label>
            <Select onValueChange={setSelectedPizza} value={selectedPizza}>
              <SelectTrigger id="pizza-select" className="h-12 text-lg">
                <SelectValue placeholder="Choose a pizza..." />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">8" & 10" Options</div>
                {Object.keys(MENU.eight_ten_inch).map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase mt-2">12" Options</div>
                {Object.keys(MENU.twelve_inch).map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Size</Label>
            <div className="grid grid-cols-3 gap-3">
              {[8, 10, 12].map(size => {
                const disabled = (size === 12 && isEightTenInchOnly) || (size !== 12 && isTwelveInchOnly);
                const active = selectedSize === size.toString();
                return (
                  <Button
                    key={size}
                    type="button"
                    variant={active ? "default" : "outline"}
                    className={`h-14 text-lg font-bold ${active ? 'bg-brand-red hover:bg-brand-red/90' : ''}`}
                    disabled={disabled || !selectedPizza}
                    onClick={() => setSelectedSize(size.toString())}
                  >
                    {size}"
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Checkbox 
                id="water" 
                checked={isWaterChecked} 
                onCheckedChange={(checked) => {
                  setIsWaterChecked(!!checked);
                  if (checked) setWaterQuantity(1);
                  else setWaterQuantity(0);
                }}
              />
              <Label htmlFor="water" className="flex items-center gap-2 cursor-pointer">
                <Droplets className="w-5 h-5 text-blue-500" />
                Add Water (+20 Tk)
              </Label>
            </div>
            {isWaterChecked && (
              <div className="flex items-center gap-3">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => setWaterQuantity(Math.max(1, waterQuantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-bold w-4 text-center">{waterQuantity}</span>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => setWaterQuantity(waterQuantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-price">Custom Price Override (Tk)</Label>
            <Input
              id="custom-price"
              type="number"
              placeholder={`Auto: ${autoPrice} Tk`}
              className="h-12 text-lg"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
            />
            <p className="text-xs text-muted-foreground italic">Leave empty to use menu price.</p>
          </div>

          <div className="pt-4 border-t border-dashed border-slate-300">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-4xl font-black text-brand-red font-display">{totalPrice} <span className="text-xl">Tk</span></p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {autoPrice > 0 && <div>Pizza: {customPrice ? customPrice : autoPrice} Tk</div>}
                {waterQuantity > 0 && <div>Water: {waterPrice} Tk</div>}
              </div>
            </div>

            <Button 
              className="w-full h-16 text-xl font-bold bg-brand-yellow hover:bg-brand-yellow/90 text-brand-black shadow-lg shadow-brand-yellow/20"
              onClick={handleSaveOrder}
            >
              <Save className="mr-2 w-6 h-6" />
              SAVE ORDER
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
