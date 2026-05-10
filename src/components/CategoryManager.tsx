import { useState } from 'react'
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import ConfirmDialog from './ConfirmDialog'
import { supabase, Category } from '@/lib/supabase'
import { toast } from 'sonner'

interface CategoryManagerProps {
  restaurantId: string
  categories: Category[]
  onCategoriesChange: (categories: Category[]) => void
}

export default function CategoryManager({
  restaurantId,
  categories,
  onCategoriesChange,
}: CategoryManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [loading, setLoading] = useState(false)
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)

  const resetForm = () => {
    setCategoryName('')
    setSortOrder(0)
    setEditingCategory(null)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setSortOrder(category.sort_order)
    setShowAddDialog(true)
  }

  const saveCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('Category name is required')
      return
    }

    setLoading(true)
    try {
      if (editingCategory) {
        // Update existing
        const { error } = await supabase
          .from('categories')
          .update({
            name: categoryName.trim(),
            sort_order: sortOrder,
          })
          .eq('id', editingCategory.id)

        if (error) throw error
        toast.success('Category updated')
      } else {
        // Create new
        const maxSortOrder = Math.max(...categories.map(c => c.sort_order), 0)
        const { error } = await supabase
          .from('categories')
          .insert({
            restaurant_id: restaurantId,
            name: categoryName.trim(),
            sort_order: sortOrder || maxSortOrder + 1,
          })

        if (error) throw error
        toast.success('Category added')
      }

      // Refresh categories
      const { data: updatedCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order')

      if (updatedCategories) {
        onCategoriesChange(updatedCategories)
      }

      setShowAddDialog(false)
      resetForm()
    } catch (error) {
      console.error('Failed to save category:', error)
      toast.error('Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async () => {
    if (!deleteCategoryId) return

    setLoading(true)
    try {
      // Check if category has items
      const { count } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', deleteCategoryId)

      if (count && count > 0) {
        toast.error(`Cannot delete: ${count} menu items use this category`)
        return
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deleteCategoryId)

      if (error) throw error

      toast.success('Category deleted')

      // Refresh categories
      const { data: updatedCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order')

      if (updatedCategories) {
        onCategoriesChange(updatedCategories)
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.error('Failed to delete category')
    } finally {
      setLoading(false)
      setDeleteCategoryId(null)
    }
  }

  const moveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(c => c.id === categoryId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= categories.length) return

    const currentCategory = categories[index]
    const swapCategory = categories[newIndex]

    setLoading(true)
    try {
      // Update both categories' sort orders
      await Promise.all([
        supabase
          .from('categories')
          .update({ sort_order: swapCategory.sort_order })
          .eq('id', currentCategory.id),
        supabase
          .from('categories')
          .update({ sort_order: currentCategory.sort_order })
          .eq('id', swapCategory.id)
      ])

      // Refresh categories
      const { data: updatedCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order')

      if (updatedCategories) {
        onCategoriesChange(updatedCategories)
      }
    } catch (error) {
      console.error('Failed to reorder categories:', error)
      toast.error('Failed to reorder categories')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Categories</h3>
          <p className="text-sm text-muted-foreground">
            Manage menu categories and their order
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="category-name">Category Name *</Label>
                <Input
                  id="category-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Appetizers"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="sort-order">Sort Order</Label>
                <Input
                  id="sort-order"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={saveCategory} disabled={loading} className="flex-1">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingCategory ? 'Update' : 'Add'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowAddDialog(false)
                  resetForm()
                }} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No categories yet. Add your first category above.
            </CardContent>
          </Card>
        ) : (
          categories.map((category, index) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="font-medium text-lg">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Order: {category.sort_order}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveCategory(category.id, 'up')}
                      disabled={index === 0 || loading}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveCategory(category.id, 'down')}
                      disabled={index === categories.length - 1 || loading}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(category)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteCategoryId(category.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteCategoryId}
        onOpenChange={(open) => !open && setDeleteCategoryId(null)}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={deleteCategory}
        variant="destructive"
        confirmText="Delete"
        loading={loading}
      />
    </div>
  )
}
