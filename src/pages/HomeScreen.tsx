import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, IndianRupee, Navigation, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapViewComponent from '@/components/MapViewComponent';
import TransportCard from '@/components/TransportCard';
import SearchHeader from '@/components/SearchHeader';
import { apiService, type Vehicle } from '@/services/api';
import { authService } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';

const HomeScreen = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [nearbyVehicles, setNearbyVehicles] = useState<Vehicle[]>([]);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadVehicles();
    loadNearbyVehicles();
    checkAuth();
    
    // Subscribe to real-time updates
    const subscription = apiService.subscribeToVehicleUpdates((updatedVehicle) => {
      setVehicles(prev => 
        prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v)
      );
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const loadVehicles = async () => {
    try {
      const data = await apiService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to load transport data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyVehicles = async () => {
    // Get user location and load nearby vehicles
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const nearby = await apiService.getNearbyVehicles(latitude, longitude);
            setNearbyVehicles(nearby);
          } catch (error) {
            console.error('Error loading nearby vehicles:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Use default location (Bangalore city center)
          apiService.getNearbyVehicles(12.9716, 77.5946).then(setNearbyVehicles);
        }
      );
    }
  };

  const handleSearch = async () => {
    if (!searchFrom || !searchTo) {
      toast({
        title: "Search Error",
        description: "Please enter both source and destination",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const results = await apiService.searchVehicles({
        from: searchFrom,
        to: searchTo
      });
      setVehicles(results);
      
      toast({
        title: "Search Results",
        description: `Found ${results.length} transport options`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search transport options",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">CityMove</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {user && (
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            )}
            <Badge variant="secondary" className="text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Live
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Find Your Ride in Real-Time
            </h2>
            <p className="text-sm md:text-base text-primary-foreground/90">
              Live tracking • Best prices • Accurate ETAs
            </p>
          </div>
          
          <SearchHeader 
            searchFrom={searchFrom}
            setSearchFrom={setSearchFrom}
            searchTo={searchTo}
            setSearchTo={setSearchTo}
            onSearch={handleSearch}
          />
        </div>
      </section>

      {/* Live Map Section */}
      <section className="py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Live Vehicle Tracking
            </h3>
            <Badge variant="outline" className="text-xs">
              {nearbyVehicles.length} nearby
            </Badge>
          </div>
          
          <MapViewComponent 
            vehicles={nearbyVehicles}
            className="w-full h-64 md:h-80 rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Transport Options */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">Available Transport</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                <Clock className="h-4 w-4 mr-1" />
                Live Updates
              </Badge>
              <Badge variant="outline" className="text-sm">
                {vehicles.length} options
              </Badge>
            </div>
          </div>
          
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((transport) => (
                <TransportCard key={transport.id} transport={transport} />
              ))}
            </div>
          )}

          {!loading && vehicles.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">No transport found</p>
              <p className="text-muted-foreground">Try searching for different locations</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center pb-3">
                <CardTitle className="flex items-center justify-center space-x-2 text-base">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Real-time Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-muted-foreground">
                  Live location updates for all transport options
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center pb-3">
                <CardTitle className="flex items-center justify-center space-x-2 text-base">
                  <IndianRupee className="h-5 w-5 text-success" />
                  <span>Best Prices</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-muted-foreground">
                  Compare prices across different options
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center pb-3">
                <CardTitle className="flex items-center justify-center space-x-2 text-base">
                  <Clock className="h-5 w-5 text-warning" />
                  <span>Accurate ETAs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-muted-foreground">
                  Reliable arrival times for better planning
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;