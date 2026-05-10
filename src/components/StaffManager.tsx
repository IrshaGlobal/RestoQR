import { useState, useEffect } from 'react'
import { Plus, Trash2, Shield, User, Loader2, Mail, Edit2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import ConfirmDialog from './ConfirmDialog'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { toast } from 'sonner'

interface StaffMember {
  id: string
  user_id: string
  restaurant_id: string
  role: 'admin' | 'staff'
  created_at: string
  email?: string | null
  display_name?: string | null
}

interface StaffManagerProps {
  restaurantId: string
  currentUserId: string
}

export default function StaffManager({ restaurantId, currentUserId }: StaffManagerProps) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newStaffEmail, setNewStaffEmail] = useState('')
  const [newStaffDisplayName, setNewStaffDisplayName] = useState('')
  const [newStaffRole, setNewStaffRole] = useState<'admin' | 'staff'>('staff')
  const [removingStaffId, setRemovingStaffId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'staff' | null>(null)
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editRole, setEditRole] = useState<'admin' | 'staff'>('staff')
  const [showCreateAccountDialog, setShowCreateAccountDialog] = useState(false)
  const [createAccountEmail, setCreateAccountEmail] = useState('')
  const [createAccountDisplayName, setCreateAccountDisplayName] = useState('')
  const [createAccountRole, setCreateAccountRole] = useState<'admin' | 'staff'>('staff')
  const [createAccountPassword, setCreateAccountPassword] = useState('')
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true)

  // Helper function to get display name from staff member
  const getDisplayName = (member: StaffMember): string => {
    // Priority 1: Use display_name if set
    if (member.display_name) return member.display_name
    
    // Priority 2: Extract from email if available
    if (member.email) {
      const username = member.email.split('@')[0]
      return username
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    
    // Fallback: Show user ID (truncated)
    return `User ${member.user_id.slice(0, 8)}...`
  }

  // Fetch staff list and current user role
  useEffect(() => {
    if (!restaurantId) return
    fetchStaff()
  }, [restaurantId])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      
      // Get current user's role
      const user = await getCurrentUser()
      if (user) {
        const { data: currentUserData } = await supabase
          .from('restaurant_staff')
          .select('role')
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId)
          .single()
        
        if (currentUserData) {
          setCurrentUserRole(currentUserData.role as 'admin' | 'staff')
        }
      }

      // Fetch all staff members
      const { data: staffData, error } = await supabase
        .from('restaurant_staff')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setStaff(staffData || [])
    } catch (error) {
      console.error('Failed to fetch staff:', error)
      toast.error('Failed to load staff members')
    } finally {
      setLoading(false)
    }
  }

  // Generate a secure random password
  const generateSecurePassword = (length: number = 12): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
  }

  const createStaffAccount = async () => {
    if (!createAccountEmail.trim()) {
      toast.error('Email is required')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(createAccountEmail.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    const password = autoGeneratePassword ? generateSecurePassword() : createAccountPassword

    if (!password || password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      // Call the secure function to create staff user
      const { data, error } = await supabase.rpc('create_staff_user', {
        p_restaurant_id: restaurantId,
        p_email: createAccountEmail.trim().toLowerCase(),
        p_password: password,
        p_display_name: createAccountDisplayName.trim() || null,
        p_role: createAccountRole
      })

      if (error) {
        console.error('RPC error:', error)
        toast.error(error.message || 'Failed to create staff account')
        setLoading(false)
        return
      }

      if (data && data.length > 0) {
        const result = data[0]
        if (result.success) {
          // Create credential message
          const credentialMessage = `
            Account Created Successfully!
            
            Email: ${createAccountEmail}
            Password: ${password}
            
            Please share these credentials with the staff member.
            They can login at: ${window.location.origin}/login
          `.trim()
          
          if (autoGeneratePassword) {
            // Show the generated password to admin in a dialog
            toast.success(
              `Account created for ${createAccountEmail}. Check console for credentials.`,
              { duration: 5000 }
            )
            console.log(credentialMessage)
            
            // Also show in alert for immediate visibility
            setTimeout(() => {
              alert(credentialMessage)
            }, 500)
          } else {
            toast.success(`Account created for ${createAccountEmail}`)
          }
          
          setShowCreateAccountDialog(false)
          setCreateAccountEmail('')
          setCreateAccountDisplayName('')
          setCreateAccountRole('staff')
          setCreateAccountPassword('')
          setAutoGeneratePassword(true)
          await fetchStaff()
        } else {
          toast.error(result.error_message || 'Failed to create account')
        }
      }
    } catch (error: any) {
      console.error('Failed to create staff account:', error)
      toast.error(error.message || 'Failed to create staff account')
    } finally {
      setLoading(false)
    }
  }

  const addStaff = async () => {
    if (!newStaffEmail.trim()) {
      toast.error('Email is required')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newStaffEmail.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      // Try to find user by email in auth.users
      // Note: This requires the user to have signed up already
      const { data: users, error: searchError } = await supabase
        .rpc('get_user_id_by_email', { email_input: newStaffEmail.trim().toLowerCase() })

      if (searchError || !users || users.length === 0) {
        toast.error('User not found. They must sign up first at /login')
        setLoading(false)
        return
      }

      const userId = users[0].id

      // Check if already a member of this restaurant
      const { data: existingStaff } = await supabase
        .from('restaurant_staff')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .maybeSingle()

      if (existingStaff) {
        toast.error('This user is already a staff member')
        setLoading(false)
        return
      }

      // Add staff member with email and display name
      const { error } = await supabase
        .from('restaurant_staff')
        .insert({
          user_id: userId,
          restaurant_id: restaurantId,
          role: newStaffRole,
          email: newStaffEmail.trim().toLowerCase(),
          display_name: newStaffDisplayName.trim() || null
        })

      if (error) {
        if (error.code === '23505') {
          toast.error('This user is already a staff member')
        } else {
          throw error
        }
        return
      }

      toast.success(`${newStaffEmail} added as ${newStaffRole}`)
      setShowAddDialog(false)
      setNewStaffEmail('')
      setNewStaffDisplayName('')
      setNewStaffRole('staff')
      await fetchStaff()
    } catch (error: any) {
      console.error('Failed to add staff:', error)
      toast.error(error.message || 'Failed to add staff member')
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (member: StaffMember) => {
    setEditingStaffId(member.id)
    setEditDisplayName(member.display_name || '')
    setEditRole(member.role)
  }

  const updateStaff = async () => {
    if (!editingStaffId) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('restaurant_staff')
        .update({
          display_name: editDisplayName.trim() || null,
          role: editRole
        })
        .eq('id', editingStaffId)

      if (error) throw error

      toast.success('Staff member updated')
      setEditingStaffId(null)
      await fetchStaff()
    } catch (error: any) {
      console.error('Failed to update staff:', error)
      toast.error(error.message || 'Failed to update staff member')
    } finally {
      setLoading(false)
    }
  }

  // Reserved for future use - role changes now handled via Edit dialog
  // const changeRole = async (staffId: string, newRole: 'admin' | 'staff') => { ... }

  const removeStaff = async () => {
    if (!removingStaffId) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('restaurant_staff')
        .delete()
        .eq('id', removingStaffId)

      if (error) throw error

      toast.success('Staff member removed')
      await fetchStaff()
    } catch (error: any) {
      console.error('Failed to remove staff:', error)
      toast.error(error.message || 'Failed to remove staff member')
    } finally {
      setLoading(false)
      setRemovingStaffId(null)
    }
  }

  const canManageStaff = currentUserRole === 'admin'

  if (loading && staff.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Staff Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage your restaurant staff and their permissions
          </p>
        </div>
        {canManageStaff && (
          <div className="flex gap-2">
            <Dialog open={showCreateAccountDialog} onOpenChange={(open) => {
              setShowCreateAccountDialog(open)
              if (!open) {
                setCreateAccountEmail('')
                setCreateAccountDisplayName('')
                setCreateAccountRole('staff')
                setCreateAccountPassword('')
                setAutoGeneratePassword(true)
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Staff Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <Mail className="w-4 h-4 inline mr-2" />
                      This will create a new account and send credentials to the staff member.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="create-email">Email Address *</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={createAccountEmail}
                      onChange={(e) => setCreateAccountEmail(e.target.value)}
                      placeholder="staff@example.com"
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="create-display-name">Display Name (Optional)</Label>
                    <Input
                      id="create-display-name"
                      value={createAccountDisplayName}
                      onChange={(e) => setCreateAccountDisplayName(e.target.value)}
                      placeholder="John Doe"
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      If left blank, will be extracted from email
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="create-role">Role *</Label>
                    <select
                      id="create-role"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={createAccountRole}
                      onChange={(e) => setCreateAccountRole(e.target.value as 'admin' | 'staff')}
                      disabled={loading}
                    >
                      <option value="staff">Staff - Can manage orders and tables</option>
                      <option value="admin">Admin - Full access including staff management</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="auto-generate-password"
                        checked={autoGeneratePassword}
                        onChange={(e) => setAutoGeneratePassword(e.target.checked)}
                        disabled={loading}
                        className="rounded"
                      />
                      <Label htmlFor="auto-generate-password" className="cursor-pointer">
                        Auto-generate secure password
                      </Label>
                    </div>
                    
                    {!autoGeneratePassword && (
                      <div>
                        <Label htmlFor="create-password">Password *</Label>
                        <Input
                          id="create-password"
                          type="password"
                          value={createAccountPassword}
                          onChange={(e) => setCreateAccountPassword(e.target.value)}
                          placeholder="Enter password (min 8 characters)"
                          disabled={loading}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={createStaffAccount} disabled={loading || !createAccountEmail.trim()} className="flex-1">
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Account
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateAccountDialog(false)} disabled={loading}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showAddDialog} onOpenChange={(open) => {
              setShowAddDialog(open)
              if (!open) {
                setNewStaffEmail('')
                setNewStaffDisplayName('')
                setNewStaffRole('staff')
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Existing User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Existing Staff Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <Mail className="w-4 h-4 inline mr-2" />
                      The user must have an account. Ask them to sign up first at the login page.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      placeholder="staff@example.com"
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="display-name">Display Name (Optional)</Label>
                    <Input
                      id="display-name"
                      value={newStaffDisplayName}
                      onChange={(e) => setNewStaffDisplayName(e.target.value)}
                      placeholder="John Doe"
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      If left blank, will be extracted from email
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <select
                      id="role"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as 'admin' | 'staff')}
                      disabled={loading}
                    >
                      <option value="staff">Staff - Can manage orders and tables</option>
                      <option value="admin">Admin - Full access including staff management</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={addStaff} disabled={loading || !newStaffEmail.trim()} className="flex-1">
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Add Staff
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={loading}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Staff List */}
      <div className="space-y-2">
        {staff.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No staff members yet.</p>
              {canManageStaff && (
                <p className="text-sm mt-2">Add your first staff member above.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          staff.map((member) => {
            const isCurrentUser = member.user_id === currentUserId
            const isOnlyAdmin = member.role === 'admin' && staff.filter(s => s.role === 'admin').length === 1
            const displayName = getDisplayName(member)

            return (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {member.role === 'admin' ? (
                          <Shield className="w-5 h-5 text-primary" />
                        ) : (
                          <User className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{displayName}</p>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                            {member.role === 'admin' ? 'Admin' : 'Staff'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Added {new Date(member.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {canManageStaff && !isCurrentUser && (
                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(member)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        
                        {/* Remove Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRemovingStaffId(member.id)}
                          disabled={loading || (isOnlyAdmin && member.role === 'admin')}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!removingStaffId}
        onOpenChange={(open) => !open && setRemovingStaffId(null)}
        title="Remove Staff Member"
        description="Are you sure you want to remove this staff member? They will lose access to this restaurant."
        onConfirm={removeStaff}
        variant="destructive"
        confirmText="Remove"
        loading={loading}
      />

      {/* Edit Staff Dialog */}
      <Dialog open={!!editingStaffId} onOpenChange={(open) => !open && setEditingStaffId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-display-name">Display Name</Label>
              <Input
                id="edit-display-name"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                placeholder="John Doe"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This name will be shown in the staff list
              </p>
            </div>
            
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <select
                id="edit-role"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as 'admin' | 'staff')}
                disabled={loading}
              >
                <option value="staff">Staff - Can manage orders and tables</option>
                <option value="admin">Admin - Full access including staff management</option>
              </select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={updateStaff} disabled={loading} className="flex-1">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingStaffId(null)} disabled={loading}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
