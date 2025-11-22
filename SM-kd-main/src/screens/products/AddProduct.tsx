import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useInventory } from '../../contexts/InventoryContext';
import { ProductCategory, UOM } from '../../types';
import { toast } from 'sonner@2.0.3';

export function AddProduct() {
  const navigate = useNavigate();
  const { addProduct, warehouses, updateStock } = useInventory();
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Electronics' as ProductCategory,
    uom: 'pcs' as UOM,
    reorderLevel: 0,
    description: '',
    initialStock: 0,
    warehouseId: warehouses[0]?.id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sku || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const { initialStock, warehouseId, ...productData } = formData;

    const newProduct = addProduct(productData);

    // Add initial stock if provided
    if (initialStock > 0 && warehouseId) {
      updateStock(newProduct.id, warehouseId, initialStock);
    }

    toast.success('Product created successfully!', {
      description: `${formData.name} has been added to inventory`,
    });

    navigate('/products');
  };

  return (
    <div>
      <Header title="Add Product" />
      
      <div className="p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <Button variant="ghost" onClick={() => navigate('/products')}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Products
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Enter the details of the new product</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      placeholder="e.g., ELC-001"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Wireless Mouse"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as ProductCategory })}>
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Clothing">Clothing</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Books">Books</SelectItem>
                        <SelectItem value="Tools">Tools</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uom">Unit of Measure</Label>
                    <Select value={formData.uom} onValueChange={(value) => setFormData({ ...formData, uom: value as UOM })}>
                      <SelectTrigger id="uom">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">Pieces</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="lbs">Pounds</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="carton">Carton</SelectItem>
                        <SelectItem value="dozen">Dozen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reorderLevel">Reorder Level</Label>
                    <Input
                      id="reorderLevel"
                      type="number"
                      min="0"
                      placeholder="e.g., 20"
                      value={formData.reorderLevel}
                      onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Alert when stock falls below this level</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initialStock">Initial Stock (Optional)</Label>
                    <Input
                      id="initialStock"
                      type="number"
                      min="0"
                      placeholder="e.g., 100"
                      value={formData.initialStock}
                      onChange={(e) => setFormData({ ...formData, initialStock: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  {formData.initialStock > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="warehouse">Warehouse</Label>
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
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter product description..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit">
                    <Save className="mr-2 size-4" />
                    Create Product
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/products')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
