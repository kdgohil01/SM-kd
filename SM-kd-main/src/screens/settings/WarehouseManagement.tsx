import { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Warehouse, Plus, Edit2 } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { toast } from 'sonner@2.0.3';

export function WarehouseManagement() {
  const { warehouses, addWarehouse, updateWarehouse } = useInventory();

  // Add warehouse dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit warehouse dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const resetAddForm = () => {
    setName('');
    setCode('');
    setAddress('');
  };

  const handleOpenEdit = (id: string) => {
    const wh = warehouses.find(w => w.id === id);
    if (!wh) return;
    setEditingId(id);
    setEditName(wh.name);
    setEditAddress(wh.address);
    setIsEditOpen(true);
  };

  const handleAddWarehouse = async () => {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedCode || !trimmedAddress) {
      toast.error('Please fill in name, code, and address');
      return;
    }

    if (!/^[-A-Z0-9]+$/i.test(trimmedCode)) {
      toast.error('Code must be alphanumeric/dashes only');
      return;
    }

    setIsAdding(true);
    try {
      addWarehouse({ name: trimmedName, code: trimmedCode.toUpperCase(), address: trimmedAddress });
      toast.success('Warehouse added');
      resetAddForm();
      setIsAddOpen(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add warehouse');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditWarehouse = async () => {
    if (!editingId) return;
    const trimmedName = editName.trim();
    const trimmedAddress = editAddress.trim();

    if (!trimmedName || !trimmedAddress) {
      toast.error('Please fill in both name and address');
      return;
    }

    setIsEditing(true);
    try {
      updateWarehouse(editingId, { name: trimmedName, address: trimmedAddress });
      toast.success('Warehouse updated');
      setIsEditOpen(false);
      setEditingId(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update warehouse');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div>
      <Header title="Settings - Warehouse Management" />
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Warehouses</CardTitle>
              <CardDescription>Manage your warehouse locations and structure</CardDescription>
            </div>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 size-4" /> Add Warehouse
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {warehouses.map(wh => (
                <Card key={wh.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Warehouse className="size-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="mb-1">{wh.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">Code: {wh.code}</p>
                            <p className="text-sm text-muted-foreground mb-4">{wh.address}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(wh.id)}>
                            <Edit2 className="mr-2 size-4" /> Edit
                          </Button>
                        </div>

                        {wh.racks.length > 0 && (
                          <div>
                            <p className="text-sm mb-2">Racks: {wh.racks.length}</p>
                            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                              {wh.racks.map(rack => (
                                <div key={rack.id} className="rounded-lg border p-3">
                                  <p className="text-sm">Rack {rack.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {rack.sections.length} section{rack.sections.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Warehouse Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Warehouse</DialogTitle>
            <DialogDescription>Provide basic details for the new warehouse</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="wh-name">Name</Label>
              <Input id="wh-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Central Warehouse" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-code">Code</Label>
              <Input id="wh-code" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g., CWH-01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-address">Address</Label>
              <Textarea id="wh-address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, City, State" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isAdding}>Cancel</Button>
            <Button onClick={handleAddWarehouse} disabled={isAdding}>{isAdding ? 'Adding...' : 'Add Warehouse'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Warehouse Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Warehouse</DialogTitle>
            <DialogDescription>Update the name or address</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea id="edit-address" value={editAddress} onChange={e => setEditAddress(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isEditing}>Cancel</Button>
            <Button onClick={handleEditWarehouse} disabled={isEditing}>{isEditing ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
