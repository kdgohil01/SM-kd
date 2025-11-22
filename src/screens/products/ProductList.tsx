import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Package, AlertTriangle, Eye } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { useInventory } from '../../contexts/InventoryContext';
import { ProductCategory } from '../../types';

export function ProductList() {
  const { products, stockLocations, warehouses, getTotalStock } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'All'>('All');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('All');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      
      if (!matchesSearch || !matchesCategory) return false;

      if (warehouseFilter === 'All') return true;
      
      return stockLocations.some(
        sl => sl.productId === product.id && sl.warehouseId === warehouseFilter && sl.quantity > 0
      );
    });
  }, [products, searchTerm, categoryFilter, warehouseFilter, stockLocations]);

  return (
    <div>
      <Header title="Products" />
      
      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by SKU or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <Link to="/products/add">
            <Button>
              <Plus className="mr-2 size-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm">Category</label>
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ProductCategory | 'All')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
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
                <label className="text-sm">Warehouse</label>
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Warehouses</SelectItem>
                    {warehouses.map(wh => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Results</label>
                <div className="flex h-10 items-center rounded-lg border bg-muted px-3">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No products found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first product'}
              </p>
              {!searchTerm && (
                <Link to="/products/add">
                  <Button>
                    <Plus className="mr-2 size-4" />
                    Add Product
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => {
              const totalStock = getTotalStock(product.id);
              const isLowStock = totalStock > 0 && totalStock < product.reorderLevel;
              const isOutOfStock = totalStock === 0;

              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Product Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-1">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>

                      {/* Stock Info */}
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

                      {/* Stock Details */}
                      <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Stock</p>
                          <p className="mt-1">{totalStock} {product.uom}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Reorder Level</p>
                          <p className="mt-1">{product.reorderLevel} {product.uom}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <Link to={`/products/${product.id}`}>
                        <Button variant="outline" className="w-full">
                          <Eye className="mr-2 size-4" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
