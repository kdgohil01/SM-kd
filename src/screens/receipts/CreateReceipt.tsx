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
import { DocumentLine } from '../../types';
import { toast } from 'sonner@2.0.3';

export function CreateReceipt() {
  const navigate = useNavigate();
  const { addReceipt, products, warehouses } = useInventory();
  
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorContact: '',
    warehouseId: warehouses[0]?.id || '',
    notes: '',
  });

  const [lines, setLines] = useState<DocumentLine[]>([
    { id: '1', productId: '', quantity: 0 },
  ]);

  const addLine = () => {
    setLines([...lines, { id: `${Date.now()}`, productId: '', quantity: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(line => line.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof DocumentLine, value: any) => {
    setLines(lines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendorName || !formData.warehouseId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const validLines = lines.filter(line => line.productId && line.quantity > 0);
    if (validLines.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    const documentNumber = `REC-${Date.now().toString().slice(-6)}`;

    addReceipt({
      documentNumber,
      vendorName: formData.vendorName,
      vendorContact: formData.vendorContact,
      warehouseId: formData.warehouseId,
      status: 'Draft',
      lines: validLines,
      notes: formData.notes,
    });

    toast.success('Receipt created successfully!', {
      description: `${documentNumber} is now in Draft status`,
    });

    navigate('/receipts');
  };

  return (
    <div>
      <Header title="Create Receipt" />
      
      <div className="p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <Button variant="ghost" onClick={() => navigate('/receipts')}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Receipts
          </Button>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Receipt Information */}
            <Card>
              <CardHeader>
                <CardTitle>Receipt Information</CardTitle>
                <CardDescription>Enter vendor and warehouse details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vendorName">Vendor Name *</Label>
                    <Input
                      id="vendorName"
                      placeholder="e.g., Tech Supplies Inc."
                      value={formData.vendorName}
                      onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendorContact">Vendor Contact</Label>
                    <Input
                      id="vendorContact"
                      placeholder="e.g., vendor@email.com"
                      value={formData.vendorContact}
                      onChange={(e) => setFormData({ ...formData, vendorContact: e.target.value })}
                    />
                  </div>

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

            {/* Products */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Add products and quantities to receive</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addLine}>
                    <Plus className="mr-2 size-4" />
                    Add Line
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lines.map((line, index) => (
                    <div key={line.id} className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <Label>Product</Label>
                        <Select 
                          value={line.productId} 
                          onValueChange={(value) => updateLine(line.id, 'productId', value)}
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
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={line.quantity || ''}
                          onChange={(e) => updateLine(line.id, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLine(line.id)}
                          disabled={lines.length === 1}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit">
                <Save className="mr-2 size-4" />
                Create Receipt
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/receipts')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
