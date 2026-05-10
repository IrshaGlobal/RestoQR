import { useState, useEffect } from 'react'
import { QrCode, Plus, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { supabase, Table } from '@/lib/supabase'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import ConfirmDialog from '@/components/ConfirmDialog'
import { toast } from 'sonner'

interface TableManagementDialogProps {
  restaurantId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function TableManagementDialog({ restaurantId, open, onOpenChange }: TableManagementDialogProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [editingTableId, setEditingTableId] = useState<string | null>(null)
  const [editingTableNumber, setEditingTableNumber] = useState<number | null>(null)
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTableNumber, setNewTableNumber] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTables()
  }, [restaurantId])

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('table_number')

      if (error) throw error
      setTables(data || [])
    } catch (error) {
      console.error('Failed to fetch tables:', error)
      toast.error('Failed to load tables')
    } finally {
      setLoading(false)
    }
  }

  const addTable = async () => {
    const tableNum = parseInt(newTableNumber)
    if (!tableNum || tableNum < 1) {
      toast.error('Please enter a valid table number')
      return
    }

    // Check if table number already exists
    if (tables.some(t => t.table_number === tableNum)) {
      toast.error(`Table ${tableNum} already exists`)
      return
    }

    try {
      const { data, error } = await supabase
        .from('tables')
        .insert({
          restaurant_id: restaurantId,
          table_number: tableNum,
          qr_code_id: `table-${tableNum}`
        })
        .select()
        .single()

      if (error) throw error
      
      setTables([...tables, data])
      setNewTableNumber('')
      setShowAddDialog(false)
      toast.success('Table added successfully')
    } catch (error) {
      console.error('Failed to add table:', error)
      toast.error('Failed to add table')
    }
  }

  const deleteTable = async (tableId: string) => {
    try {
      // Check if table has active orders
      const { count: activeOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('table_id', tableId)
        .in('status', ['new', 'preparing', 'ready'])

      if (activeOrders && activeOrders > 0) {
        toast.error(`Cannot delete: ${activeOrders} active order(s) on this table`)
        return
      }

      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', tableId)

      if (error) throw error
      
      setTables(tables.filter(t => t.id !== tableId))
      if (selectedTable?.id === tableId) setSelectedTable(null)
      toast.success('Table deleted successfully')
    } catch (error: any) {
      console.error('Failed to delete table:', error)
      toast.error(error.message || 'Failed to delete table')
    }
  }

  const editTableNumber = async (tableId: string, newNumber: number) => {
    if (!newNumber || newNumber < 1) {
      toast.error('Please enter a valid table number')
      return
    }

    // Check if table number already exists (excluding current table)
    if (tables.some(t => t.table_number === newNumber && t.id !== tableId)) {
      toast.error(`Table ${newNumber} already exists`)
      return
    }

    try {
      const { error } = await supabase
        .from('tables')
        .update({ table_number: newNumber, qr_code_id: `table-${newNumber}` })
        .eq('id', tableId)

      if (error) throw error
      
      setTables(tables.map(t => 
        t.id === tableId ? { ...t, table_number: newNumber, qr_code_id: `table-${newNumber}` } : t
      ))
      setEditingTableId(null)
      setEditingTableNumber(null)
      toast.success('Table number updated successfully')
    } catch (error: any) {
      console.error('Failed to update table:', error)
      toast.error(error.message || 'Failed to update table')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-black border-2 border-[#00F0FF]/40 rounded-none shadow-2xl shadow-[#00F0FF]/20">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#00F0FF]" />
              <span className="text-[#00F0FF]">//</span> TABLE & QR CODE MANAGEMENT
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Stats and Add Table Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white/5 border border-white/10">
              <div className="font-mono">
                <div className="text-xs uppercase tracking-widest text-white/50 mb-1">TOTAL TABLES</div>
                <div className="text-3xl font-black text-[#00F0FF]">{tables.length}</div>
              </div>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="h-12 px-6 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-black uppercase tracking-wider shadow-lg shadow-[#00F0FF]/30 transition-all rounded-none border-2 border-[#00F0FF] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                ADD TABLE
              </Button>
            </div>

            {/* Tables Grid */}
            {loading ? (
              <div className="text-center py-12 font-mono">
                <div className="text-[#00F0FF] animate-pulse text-lg uppercase tracking-wider">Loading tables...</div>
              </div>
            ) : tables.length === 0 ? (
              <Card className="border-2 border-[#00F0FF]/20 bg-black rounded-none">
                <CardContent className="p-12 text-center">
                  <QrCode className="w-16 h-16 mx-auto mb-6 text-[#00F0FF]/30" />
                  <h3 className="text-xl font-black mb-3 text-white uppercase tracking-wider font-mono">NO TABLES YET</h3>
                  <p className="text-sm text-white/50 mb-6 font-mono max-w-md mx-auto">
                    Add your first table to start generating QR codes for customer ordering
                  </p>
                  <Button 
                    onClick={() => setShowAddDialog(true)}
                    className="h-12 px-6 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-black uppercase tracking-wider shadow-lg shadow-[#00F0FF]/30 transition-all rounded-none border-2 border-[#00F0FF]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    ADD FIRST TABLE
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map(table => (
                  <Card key={table.id} className={`overflow-hidden border-2 transition-all duration-300 rounded-none ${
                    selectedTable?.id === table.id ? 'border-[#00F0FF] bg-[#00F0FF]/5' : 'border-white/10 bg-[#1a1a1a] hover:border-white/20'
                  }`}>
                    <CardContent className="p-5">
                      {/* Table Header with Actions */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="font-mono">
                          <div className="text-xs uppercase tracking-widest text-white/40 mb-1">TABLE</div>
                          <h3 className="text-3xl font-black text-white tracking-tighter">#{table.table_number}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingTableId(table.id)
                              setEditingTableNumber(table.table_number)
                            }}
                            className="h-8 w-8 p-0 hover:bg-white/10 rounded-none border border-white/20 hover:border-[#00F0FF] transition-colors"
                            title="Edit table number"
                          >
                            <Edit2 className="w-4 h-4 text-white/70" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingTableId(table.id)}
                            className="h-8 w-8 p-0 hover:bg-[#FF006E]/10 rounded-none border border-white/20 hover:border-[#FF006E] transition-colors"
                            title="Delete table"
                          >
                            <Trash2 className="w-4 h-4 text-[#FF006E]" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Show/Hide QR Button */}
                      <Button
                        className="w-full h-12 font-black uppercase tracking-wider transition-all rounded-none border-2 mb-4"
                        variant={selectedTable?.id === table.id ? "default" : "outline"}
                        onClick={() => setSelectedTable(selectedTable?.id === table.id ? null : table)}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        {selectedTable?.id === table.id ? 'HIDE QR CODE' : 'SHOW QR CODE'}
                      </Button>
                      
                      {/* QR Code Display */}
                      {selectedTable?.id === table.id && (
                        <div className="mt-6 p-6 bg-gradient-to-br from-slate-900 to-black border-2 border-[#00F0FF]/30 rounded-none">
                          <div className="text-center mb-6">
                            <div className="text-xs uppercase tracking-widest text-white/40 mb-2 font-mono">SCAN TO ORDER</div>
                            <h4 className="text-2xl font-black text-white tracking-tighter font-mono">TABLE #{table.table_number}</h4>
                          </div>
                          <div className="flex justify-center">
                            <div className="bg-white p-6 rounded-none shadow-2xl shadow-[#00F0FF]/20 border-4 border-white">
                              <QRCodeGenerator
                                tableNumber={table.table_number}
                                tableId={table.id}
                                restaurantId={restaurantId}
                              />
                            </div>
                          </div>
                          <div className="mt-6 text-center">
                            <div className="text-xs uppercase tracking-widest text-white/30 mb-2 font-mono">TABLE ID</div>
                            <p className="text-xs text-[#00F0FF]/70 font-mono bg-white/5 px-3 py-2 inline-block rounded-none border border-[#00F0FF]/20">
                              {table.id.slice(0, 8).toUpperCase()}...
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Table Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md bg-black border-2 border-[#00F0FF]/40 rounded-none shadow-2xl shadow-[#00F0FF]/20">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-wider text-white font-mono">
              <span className="text-[#00F0FF]">//</span> ADD NEW TABLE
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-table-num" className="text-xs uppercase tracking-widest text-white/50 font-mono mb-2 block">Table Number</Label>
              <Input
                id="new-table-num"
                type="number"
                placeholder="e.g., 1, 2, 3..."
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                className="h-12 bg-white/5 border-2 border-white/20 text-white font-mono rounded-none focus:border-[#00F0FF] focus:ring-0 transition-colors"
                autoFocus
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                onClick={addTable} 
                className="flex-1 h-12 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-black uppercase tracking-wider shadow-lg shadow-[#00F0FF]/30 transition-all rounded-none border-2 border-[#00F0FF]"
              >
                ADD TABLE
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddDialog(false)} 
                className="flex-1 sm:flex-none h-12 sm:w-32 font-black uppercase tracking-wider rounded-none border-2 border-white/20 hover:border-white/40 transition-colors"
              >
                CANCEL
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={!!editingTableId} onOpenChange={(open) => !open && setEditingTableId(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md bg-black border-2 border-[#00F0FF]/40 rounded-none shadow-2xl shadow-[#00F0FF]/20">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-wider text-white font-mono">
              <span className="text-[#00F0FF]">//</span> EDIT TABLE NUMBER
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-table-num" className="text-xs uppercase tracking-widest text-white/50 font-mono mb-2 block">Table Number</Label>
              <Input
                id="edit-table-num"
                type="number"
                value={editingTableNumber || ''}
                onChange={(e) => setEditingTableNumber(parseInt(e.target.value))}
                className="h-12 bg-white/5 border-2 border-white/20 text-white font-mono rounded-none focus:border-[#00F0FF] focus:ring-0 transition-colors"
                autoFocus
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                onClick={() => {
                  if (editingTableId && editingTableNumber) {
                    editTableNumber(editingTableId, editingTableNumber)
                  }
                }}
                className="flex-1 h-12 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-black uppercase tracking-wider shadow-lg shadow-[#00F0FF]/30 transition-all rounded-none border-2 border-[#00F0FF]"
              >
                SAVE CHANGES
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingTableId(null)} 
                className="flex-1 sm:flex-none h-12 sm:w-32 font-black uppercase tracking-wider rounded-none border-2 border-white/20 hover:border-white/40 transition-colors"
              >
                CANCEL
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingTableId}
        onOpenChange={(open) => !open && setDeletingTableId(null)}
        title="Delete Table"
        description="Are you sure you want to delete this table? This will also remove all associated orders and cannot be undone."
        onConfirm={() => {
          if (deletingTableId) {
            deleteTable(deletingTableId)
            setDeletingTableId(null)
          }
        }}
        variant="destructive"
        confirmText="Delete Table"
      />
    </>
  )
}
