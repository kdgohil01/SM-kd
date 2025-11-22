import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useInventory } from '../../contexts/InventoryContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, stockLocations, warehouses, movements, getTotalStock } = useInventory();

  const product = getProduct(id!);

  if (!product) {
    return (
      <div>
        <Header title="Product Not Found" />
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Product not found</p>
              <Button onClick={() => navigate('/products')}>
                <ArrowLeft className="mr-2 size-4" />
                Back to Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalStock = getTotalStock(product.id);
  const isLowStock = totalStock > 0 && totalStock < product.reorderLevel;
  const isOutOfStock = totalStock === 0;

  // Stock by location
  const stockByLocation = stockLocations
    .filter(sl => sl.productId === product.id && sl.quantity > 0)
    .map(sl => {
      const warehouse = warehouses.find(w => w.id === sl.warehouseId);
      return {
        warehouse: warehouse?.name || 'Unknown',
        quantity: sl.quantity,
      };
    });

  // Product movements
  const productMovements = movements
    .filter(m => m.productId === product.id)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  // Movement trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const movementTrend = movements
    .filter(m => m.productId === product.id && m.timestamp >= thirtyDaysAgo)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map(m => ({
      date: m.timestamp.toLocaleDateString(),
      stock: m.newStock,
    }));

  return (
    <div>
      <Header title="Product Details" />
      
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate('/products')}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Products
        </Button>

        {/* Product Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>SKU: {product.sku}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isOutOfStock && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="size-3" />
                    Out of Stock
                  </Badge>
                )}
                {isLowStock && (
                  <Badge variant="outline" className="gap-1 border-yellow-300 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                    <AlertTriangle className="size-3" />
                    Low Stock
                  </Badge>
                )}
                {!isOutOfStock && !isLowStock && (
                  <Badge variant="outline" className="gap-1 border-green-300 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                    In Stock
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="mt-1">{product.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit of Measure</p>
                <p className="mt-1">{product.uom}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="mt-1">{totalStock} {product.uom}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reorder Level</p>
                <p className="mt-1">{product.reorderLevel} {product.uom}</p>
              </div>
            </div>
            {product.description && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="mt-1">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock by Warehouse */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Stock by Warehouse</CardTitle>
              <CardDescription>Current stock distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {stockByLocation.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Package className="size-12 mb-2" />
                  <p>No stock available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stockByLocation}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="warehouse" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-2">
                    {stockByLocation.map((loc, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                        <span className="text-sm">{loc.warehouse}</span>
                        <span>{loc.quantity} {product.uom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Movement Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Trend (30 Days)</CardTitle>
              <CardDescription>Historical stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              {movementTrend.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <TrendingUp className="size-12 mb-2" />
                  <p>No movement data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={movementTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="stock" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Movements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
            <CardDescription>Latest stock transactions for this product</CardDescription>
          </CardHeader>
          <CardContent>
            {productMovements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Package className="size-12 mb-2" />
                <p>No movements recorded</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="pb-3 text-left">Date & Time</th>
                      <th className="pb-3 text-left">Type</th>
                      <th className="pb-3 text-left">Document</th>
                      <th className="pb-3 text-left">Warehouse</th>
                      <th className="pb-3 text-right">Quantity</th>
                      <th className="pb-3 text-right">New Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productMovements.map((movement) => {
                      const warehouse = warehouses.find(w => w.id === movement.warehouseId);
                      
                      return (
                        <tr key={movement.id} className="border-b">
                          <td className="py-3 text-sm">
                            {movement.timestamp.toLocaleDateString()} {movement.timestamp.toLocaleTimeString()}
                          </td>
                          <td className="py-3 text-sm">{movement.movementType}</td>
                          <td className="py-3 text-sm text-primary">{movement.documentNumber}</td>
                          <td className="py-3 text-sm">{warehouse?.name}</td>
                          <td className={`py-3 text-sm text-right ${movement.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.quantity >= 0 ? '+' : ''}{movement.quantity}
                          </td>
                          <td className="py-3 text-sm text-right">{movement.newStock}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
