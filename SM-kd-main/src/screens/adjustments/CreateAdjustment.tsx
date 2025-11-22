import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useInventory } from '../../contexts/InventoryContext';
import { AdjustmentLine } from '../../types';
import { toast } from 'sonner@2.0.3';

export function CreateAdjustment() {
  const navigate = useNavigate();
  const { addAdjustment, products, warehouses, getStockByProductAndWarehouse } = useInventory();
  
  const [formData, setFormData] = useState({
    warehouseId: warehouses[0]?.id || '',
    adjustmentType: 'Physical Count' as 'Physical Count' | 'Damage' | 'Loss' | 'Other',
    notes: '',
  });

  const [lines, setLines] = useState<Omit<AdjustmentLine, 'id' | 'difference'>[]>([
    { productId: '', recordedQuantity: 0, physicalQuantity: 0 },
  ]);

  const addLine = () => {
    setLines([...lines, { productId: '', recordedQuantity: 0, physicalQuantity: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, field: 'productId' | 'recordedQuantity' | 'physicalQuantity', value: any) => {
    setLines(lines.map((line, i) => {
      if (i === index) {
        return { ...line, [field]: value };
      }
      return line;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.warehouseId) {
      toast.error('Please select a warehouse');
      return;
    }

    const validLines: AdjustmentLine[] = lines
      .map((line, index) => {
        if (!line.productId) return null;
        
        const recordedQty = line.recordedQuantity || 0;
        const physicalQty = line.physicalQuantity || 0;
        const difference = physicalQty - recordedQty;
        
        return {
          id: `${index + 1}`,
          productId: line.productId,
          quantity: difference,
          recordedQuantity: recordedQty,
          physicalQuantity: physicalQty,
          difference: difference,
        } as AdjustmentLine;
      })
      .filter((line): line is AdjustmentLine => line !== null);

    if (validLines.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    // Check stock availability for negative adjustments
    for (const line of validLines) {
      if (line.difference < 0) {
        const availableStock = getStockByProductAndWarehouse(line.productId, formData.warehouseId);
        const requiredStock = Math.abs(line.difference);
        if (availableStock < requiredStock) {
          const product = products.find(p => p.id === line.productId);
          toast.error(`Insufficient stock for ${product?.name || 'product'}. Available: ${availableStock}, Required: ${requiredStock}`);
          return;
        }
      }
    }

    const documentNumber = `ADJ-${Date.now().toString().slice(-6)}`;

    addAdjustment({
      documentNumber,
      warehouseId: formData.warehouseId,
      status: 'Draft',
      adjustmentType: formData.adjustmentType,
      lines: validLines,
      notes: formData.notes,
    });

    toast.success('Adjustment created successfully!', {
      description: `${documentNumber} is now in Draft status`,
    });

    navigate('/adjustments');
  };

  return (
    <div>
      <Header title="Create Inventory Adjustment" />
      
      <div className="p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <Button variant="ghost" onClick={() => navigate('/adjustments')}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Adjustments
          </Button>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adjustment Information</CardTitle>
                <CardDescription>Enter adjustment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="warehouse">Warehouse *</Label>
                    <Select value={formData.warehouseId} onValueChange={(value) => setFormData({ ...formData, warehouseId: value })}>
                      <SelectTrigger id="warehouse">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map(wh => (
                          <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adjustmentType">Adjustment Type *</Label>
                    <Select value={formData.adjustmentType} onValueChange={(value) => setFormData({ ...formData, adjustmentType: value as typeof formData.adjustmentType })}>
                      <SelectTrigger id="adjustmentType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Physical Count">Physical Count</SelectItem>
                        <SelectItem value="Damage">Damage</SelectItem>
                        <SelectItem value="Loss">Loss</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Add any additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Enter recorded and physical quantities</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addLine}>
                    <Plus className="mr-2 size-4" />
                    Add Line
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lines.map((line, index) => {
                    const product = products.find(p => p.id === line.productId);
                    const recordedQty = line.recordedQuantity || 0;
                    const physicalQty = line.physicalQuantity || 0;
                    const difference = physicalQty - recordedQty;
                    
                    return (
                      <div key={index} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                          <Label>Product</Label>
                          <Select 
                            value={line.productId} 
                            onValueChange={(value) => {
                              const product = products.find(p => p.id === value);
                              const currentStock = product ? getStockByProductAndWarehouse(value, formData.warehouseId) : 0;
                              updateLine(index, 'productId', value);
                              updateLine(index, 'recordedQuantity', currentStock);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.sku})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="w-32 space-y-2">
                          <Label>Recorded Qty</Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={recordedQty}
                            onChange={(e) => updateLine(index, 'recordedQuantity', parseInt(e.target.value) || 0)}
                          />
                        </div>

                        <div className="w-32 space-y-2">
                          <Label>Physical Qty</Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={physicalQty}
                            onChange={(e) => updateLine(index, 'physicalQuantity', parseInt(e.target.value) || 0)}
                          />
                        </div>

                        <div className="w-32 space-y-2">
                          <Label>Difference</Label>
                          <div className={`flex h-10 items-center rounded-lg border bg-muted px-3 ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {difference >= 0 ? '+' : ''}{difference}
                          </div>
                        </div>

                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLine(index)}
                            disabled={lines.length === 1}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit">
                <Save className="mr-2 size-4" />
                Create Adjustment
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/adjustments')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

