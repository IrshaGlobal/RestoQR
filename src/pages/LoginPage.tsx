import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn, getSession, getStaffInfo } from '@/lib/supabase'
import { isValidEmail } from '@/lib/security'
import { toast } from 'sonner'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      const session = await getSession()
      if (session) {
        try {
          const staffInfo = await getStaffInfo(session.user.id)
          if (staffInfo) {
            // Already logged in, redirect to appropriate dashboard
            if (staffInfo.role === 'admin') {
              navigate('/admin', { replace: true })
            } else {
              navigate('/staff', { replace: true })
            }
          }
        } catch (error) {
          console.error('Failed to get staff info:', error)
        }
      }
    }
    
    checkExistingSession()
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email format
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Validate password length
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await signIn(email, password)
      
      if (error) {
        console.error('Login error:', error)
        // Don't reveal whether email exists or not for security
        toast.error('Invalid email or password')
        return
      }

      if (data.user) {
        toast.success('Logged in successfully!')
        
        // Get staff info to determine role
        try {
          console.log('Fetching staff info for user:', data.user.id)
          const staffInfo = await getStaffInfo(data.user.id)
          console.log('Staff info received:', staffInfo)
          
          if (!staffInfo) {
            console.error('User not found in restaurant_staff table')
            toast.error('No restaurant access found. Contact administrator.')
            return
          }
          
          // Redirect based on role
          console.log('Redirecting to', staffInfo.role === 'admin' ? '/admin' : '/staff')
          if (staffInfo.role === 'admin') {
            navigate('/admin')
          } else {
            navigate('/staff')
          }
        } catch (error) {
          console.error('Failed to get staff info:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          toast.error(`Failed to load user profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md animate-enter">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Staff Login</CardTitle>
          <CardDescription>
            Sign in to access the staff dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Security Notice</p>
                <p>This is a staff-only login. Contact your restaurant administrator for access credentials.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
