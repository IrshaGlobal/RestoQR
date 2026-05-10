import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getSession, getStaffInfo } from '@/lib/supabase'
import { toast } from 'sonner'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'staff'
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession()
        
        if (!session) {
          toast.error('Please log in to access this page')
          navigate('/login', { replace: true })
          return
        }

        const staffInfo = await getStaffInfo(session.user.id)
        
        if (!staffInfo) {
          toast.error('No restaurant access found. Contact administrator.')
          navigate('/login', { replace: true })
          return
        }

        // Check if user has the required role
        if (requiredRole) {
          // Admins have access to all pages
          const isAdmin = staffInfo.role === 'admin'
          const hasRequiredRole = isAdmin || staffInfo.role === requiredRole
          
          if (!hasRequiredRole) {
            // User doesn't have required role, redirect to their appropriate dashboard
            toast.warning(`Access denied. ${requiredRole.toUpperCase()} access required.`)
            
            // Redirect based on their actual role
            if (staffInfo.role === 'admin') {
              navigate('/admin', { replace: true })
            } else {
              navigate('/staff', { replace: true })
            }
            return
          }
        }

        setAuthorized(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        toast.error('Authentication failed')
        navigate('/login', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [navigate, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
