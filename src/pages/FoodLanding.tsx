import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Utensils, ShoppingBag, Truck, MapPin, Loader2, ChevronRight, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase, Table, Restaurant } from '@/lib/supabase'
import { toast } from 'sonner'

export default function FoodLanding() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const restaurantIdParam = searchParams.get('restaurant')
  
  const [selectedOption, setSelectedOption] = useState<'dinein' | 'takeout' | 'delivery' | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectingTable, setSelectingTable] = useState(false)
  const [restaurantId, setRestaurantId] = useState<string>('')
  const [availableTablesCount, setAvailableTablesCount] = useState(0)
  const [estimatedPickupTime, setEstimatedPickupTime] = useState('15-20 min')
  const [deliveryRadius] = useState('5km')

  useEffect(() => {
    const fetchData = async () => {
      try {
        let targetRestaurantId = restaurantIdParam
        
        // If no restaurant ID provided, fetch the first (or only) restaurant
        if (!targetRestaurantId) {
          console.log('No restaurant ID provided, fetching available restaurants...')
          const { data: restaurantsData, error: restaurantsError } = await supabase
            .from('restaurants')
            .select('*')
            .limit(1)
          
          if (restaurantsError) {
            console.error('Failed to fetch restaurants:', restaurantsError)
            throw restaurantsError
          }
          
          if (!restaurantsData || restaurantsData.length === 0) {
            console.error('No restaurants found in database')
            toast.error('No restaurants configured')
            setLoading(false)
            return
          }
          
          targetRestaurantId = restaurantsData[0].id
          console.log('Using restaurant:', restaurantsData[0].name, targetRestaurantId)
        }
        
        if (targetRestaurantId) {
          setRestaurantId(targetRestaurantId)
        }
        console.log('Fetching data for restaurant:', targetRestaurantId)
        
        // Fetch restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', targetRestaurantId)
          .single()

        if (restaurantError) {
          console.error('Restaurant fetch error:', restaurantError)
          throw restaurantError
        }
        
        console.log('Restaurant data:', restaurantData)
        if (restaurantData) {
          setRestaurant(restaurantData)
        }

        // Fetch tables for dine-in
        console.log('Fetching tables for restaurant:', targetRestaurantId)
        const { data: tablesData, error: tablesError } = await supabase
          .from('tables')
          .select('*')
          .eq('restaurant_id', targetRestaurantId)
          .order('table_number')

        if (tablesError) {
          console.error('Tables fetch error:', tablesError)
          throw tablesError
        }
        
        console.log('Tables data:', tablesData)
        console.log('Number of tables found:', tablesData?.length || 0)
        
        if (tablesData) {
          setTables(tablesData)
          // Count total tables
          setAvailableTablesCount(tablesData.length)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast.error('Failed to load restaurant information')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [restaurantIdParam])

  // Calculate estimated pickup time based on current time
  useEffect(() => {
    const hour = new Date().getHours()
    // Peak hours have longer wait times
    if ((hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20)) {
      setEstimatedPickupTime('25-30 min')
    } else {
      setEstimatedPickupTime('15-20 min')
    }
  }, [])

  const handleDineInSelect = (table: Table) => {
    setSelectingTable(true)
    setTimeout(() => {
      navigate(`/menu?restaurant=${restaurantId}&table=${table.id}`)
    }, 300)
  }

  const handleTakeoutClick = () => {
    navigate(`/delivery?restaurant=${restaurantId}&mode=takeout`)
  }

  const handleDeliveryClick = () => {
    navigate(`/delivery?restaurant=${restaurantId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] via-white to-[#F5F1EB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C47A3D]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] relative overflow-hidden" style={{
      backgroundImage: 'linear-gradient(#E2DDD5 1px, transparent 1px), linear-gradient(90deg, #E2DDD5 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      backgroundPosition: 'center center'
    }}>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Utensils className="w-6 h-6 text-[#C47A3D]" />
            <span className="text-sm font-semibold tracking-widest uppercase text-[#8A857B]">
              Welcome to
            </span>
          </div>
          
          <h1 
            className="font-bold text-[#0A0A0A] mb-4 leading-tight"
            style={{ 
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontStyle: 'italic',
              fontWeight: 600
            }}
          >
            {restaurant?.name || 'Our Restaurant'}
          </h1>
          
          <p className="text-lg text-[#5A554B] max-w-2xl mx-auto">
            Choose how you'd like to enjoy your meal today
          </p>
        </div>

        {/* Main Options - Three Cards */}
        {!selectedOption ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Dine In Option */}
            <Card 
              className="group cursor-pointer border border-[#E2DDD5] hover:border-[#0A0A0A] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4"
              style={{ 
                borderRadius: 0,
                animationDelay: '0ms'
              }}
              onClick={() => setSelectedOption('dinein')}
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-[#F5F1EB] group-hover:bg-[#C47A3D]/10 transition-colors duration-200 flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-[#C47A3D]" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Dine In
                </h3>
                <p className="text-sm text-[#8A857B] mb-6 leading-relaxed">
                  Enjoy your meal at our restaurant. Select your table and order directly.
                </p>
                <Badge variant="outline" className="mb-4 border-[#E2DDD5]">
                  {availableTablesCount} tables available
                </Badge>
                <div className="flex items-center justify-center gap-2 text-[#C47A3D] font-semibold group-hover:gap-3 transition-all">
                  <span>Select Table</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Takeout Option */}
            <Card 
              className="group cursor-pointer border border-[#E2DDD5] hover:border-[#0A0A0A] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4"
              style={{ 
                borderRadius: 0,
                animationDelay: '100ms'
              }}
              onClick={handleTakeoutClick}
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-[#F5F1EB] group-hover:bg-[#C47A3D]/10 transition-colors duration-200 flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-[#C47A3D]" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Takeout
                </h3>
                <p className="text-sm text-[#8A857B] mb-6 leading-relaxed">
                  Order ahead and pick up your food at your convenience.
                </p>
                <Badge variant="outline" className="mb-4 border-[#E2DDD5]">
                  <Clock className="w-3 h-3 mr-1" />
                  Ready in {estimatedPickupTime}
                </Badge>
                <div className="flex items-center justify-center gap-2 text-[#C47A3D] font-semibold group-hover:gap-3 transition-all">
                  <span>Start Order</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Option */}
            <Card 
              className="group cursor-pointer border border-[#E2DDD5] hover:border-[#0A0A0A] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4"
              style={{ 
                borderRadius: 0,
                animationDelay: '200ms'
              }}
              onClick={handleDeliveryClick}
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-[#F5F1EB] group-hover:bg-[#C47A3D]/10 transition-colors duration-200 flex items-center justify-center">
                  <Truck className="w-10 h-10 text-[#C47A3D]" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Delivery
                </h3>
                <p className="text-sm text-[#8A857B] mb-6 leading-relaxed">
                  Get your favorite meals delivered right to your doorstep.
                </p>
                <Badge variant="outline" className="mb-4 border-[#E2DDD5]">
                  <MapPin className="w-3 h-3 mr-1" />
                  Within {deliveryRadius}
                </Badge>
                <div className="flex items-center justify-center gap-2 text-[#C47A3D] font-semibold group-hover:gap-3 transition-all">
                  <span>Start Order</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : selectedOption === 'dinein' ? (
          /* Table Selection View */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setSelectedOption(null)}
              className="mb-6 text-[#8A857B] hover:text-[#0A0A0A] hover:bg-white border border-transparent hover:border-[#E2DDD5] transition-all duration-200"
              style={{ borderRadius: 0 }}
            >
              ← Back to Options
            </Button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 text-[#0A0A0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Select Your Table
              </h2>
              <p className="text-[#5A554B]">
                Choose a table to start your dining experience
              </p>
            </div>

            {tables.length === 0 ? (
              <Card className="border border-[#E2DDD5] p-12 text-center bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]" style={{ borderRadius: 0 }}>
                <MapPin className="w-16 h-16 mx-auto mb-4 text-[#8A857B] opacity-50" />
                <p className="text-lg text-[#8A857B]">No tables available at the moment</p>
                <p className="text-sm text-[#8A857B] mt-2">Please contact the restaurant for assistance</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tables.map((table, index) => (
                  <Card
                    key={table.id}
                    className={`group cursor-pointer border border-[#E2DDD5] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-[#0A0A0A] bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] animate-in fade-in zoom-in-95 ${
                      selectingTable ? 'pointer-events-none opacity-50' : ''
                    }`}
                    style={{ 
                      borderRadius: 0,
                      animationDelay: `${index * 50}ms`
                    }}
                    onClick={() => handleDineInSelect(table)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-[#F5F1EB] group-hover:bg-[#C47A3D]/10 transition-colors duration-200 flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#C47A3D]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          {table.table_number}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#8A857B] uppercase tracking-wide">
                        Table
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Footer Credit */}
        <div className="mt-16 text-center">
          <div className="inline-block px-4 py-2 bg-white border border-[#E2DDD5] shadow-[0_1px_4px_rgba(0,0,0,0.04)]" style={{ borderRadius: 0 }}>
            <p className="text-[9px] font-medium tracking-[0.15em] uppercase text-[#8A857B]">
              Designed & Developed by <span className="text-[#0A0A0A] font-semibold">sqadri</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
