import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, IndianRupee, Navigation, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AuthModal from '@/components/AuthModal';
import TransportCard from '@/components/TransportCard';
import SearchHeader from '@/components/SearchHeader';
import { authService, type AuthUser } from '@/services/auth';
import { useNavigate } from 'react-router-dom';
import { Vehicle } from '@/services/api';

// Mock data for transport options
const transportOptions: Vehicle[] = [
  {
    id: '1',
    type: 'bus' as const,
    name: 'City Bus Route 42',
    route: 'Central Station → Market Square → Hospital Junction → University Campus',
    current_location: { lat: 12.9716, lng: 77.5946 },
    price: 15,
    duration: '25 mins',
    next_available: '5 mins',
    stands: ['Central Bus Stand', 'Market Square', 'Hospital Junction']
  },
  {
    id: '2',
    type: 'auto' as const,
    name: 'Auto Rickshaw',
    route: 'Market Square → Main Road → University Campus',
    current_location: { lat: 12.9742, lng: 77.5952 },
    price: 45,
    duration: '15 mins',
    next_available: '2 mins',
    stands: ['Market Auto Stand', 'Railway Station', 'Bus Stand']
  },
  {
    id: '3',
    type: 'cab' as const,
    name: 'Shared Taxi',
    route: 'Railway Station → Highway → University Gate',
    current_location: { lat: 12.9698, lng: 77.5938 },
    price: 35,
    duration: '20 mins',
    next_available: '8 mins',
    stands: ['Railway Taxi Stand', 'Airport Road', 'City Center']
  }
];

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const handleSearch = () => {
    if (!searchFrom || !searchTo) {
      alert('Please enter both source and destination');
      return;
    }
    navigate('/search');
  };

  const handleGetStarted = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">CityMove</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {!user ? (
              <Button onClick={() => setIsAuthOpen(true)}>
                Login
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-1" />
                  Profile
                </Button>
                <Button onClick={handleGetStarted}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-primary to-primary-hover text-primary-foreground py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Ride in the City
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/90">
            Real-time transport information for buses, autos, and cabs
          </p>
          
          <SearchHeader 
            searchFrom={searchFrom}
            setSearchFrom={setSearchFrom}
            searchTo={searchTo}
            setSearchTo={setSearchTo}
            onSearch={handleSearch}
          />
        </div>
      </section>

      {/* Transport Options */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground">Available Transport</h3>
            <Badge variant="secondary" className="text-sm">
              <Clock className="h-4 w-4 mr-1" />
              Live Updates
            </Badge>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {transportOptions.map((transport) => (
              <TransportCard key={transport.id} transport={transport} />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Real-time Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Live location updates for all transport options in your area
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <IndianRupee className="h-5 w-5 text-success" />
                  <span>Best Prices</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Compare prices across different transport options
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Clock className="h-5 w-5 text-warning" />
                  <span>Accurate ETAs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Get reliable arrival times for better trip planning
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={() => {
          checkAuth();
          setIsAuthOpen(false);
        }}
      />
    </div>
  );
};

export default Index;