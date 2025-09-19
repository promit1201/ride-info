import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, IndianRupee, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import TransportCard from '@/components/TransportCard';
import MapViewComponent from '@/components/MapViewComponent';
import { apiService, type Vehicle, type SearchParams } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SearchScreen = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    from: '',
    to: ''
  });
  const [filters, setFilters] = useState({
    type: 'all',
    maxPrice: 100,
    sortBy: 'price'
  });
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadAllVehicles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vehicles, filters]);

  const loadAllVehicles = async () => {
    try {
      setLoading(true);
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

  const handleSearch = async () => {
    if (!searchParams.from || !searchParams.to) {
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
        ...searchParams,
        type: filters.type !== 'all' ? filters.type as 'bus' | 'auto' | 'cab' : undefined
      });
      setVehicles(results);
      
      toast({
        title: "Search Complete",
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

  const applyFilters = () => {
    let filtered = [...vehicles];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(v => v.type === filters.type);
    }

    // Filter by price
    filtered = filtered.filter(v => v.price <= filters.maxPrice);

    // Sort
    switch (filters.sortBy) {
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'duration':
        filtered.sort((a, b) => {
          const durationA = parseInt(a.duration.split(' ')[0]);
          const durationB = parseInt(b.duration.split(' ')[0]);
          return durationA - durationB;
        });
        break;
      case 'next_available':
        filtered.sort((a, b) => {
          const timeA = parseInt(a.next_available.split(' ')[0]);
          const timeB = parseInt(b.next_available.split(' ')[0]);
          return timeA - timeB;
        });
        break;
    }

    setFilteredVehicles(filtered);
  };

  const getRouteCoordinates = (vehicles: Vehicle[]): [number, number][] => {
    // Simple route approximation based on vehicle locations
    return vehicles.map(v => [v.current_location.lng, v.current_location.lat]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Search Transport</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={showMap ? "default" : "outline"}
              size="sm"
              onClick={() => setShowMap(!showMap)}
            >
              <MapPin className="h-4 w-4 mr-1" />
              Map
            </Button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <Input
                placeholder="Enter pickup location"
                value={searchParams.from}
                onChange={(e) => setSearchParams(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Input
                placeholder="Enter destination"
                value={searchParams.to}
                onChange={(e) => setSearchParams(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch} 
                className="w-full"
                disabled={loading}
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <div className="flex items-center space-x-2 min-w-fit">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="cab">Cab</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2 min-w-fit">
              <span className="text-sm">Max ₹{filters.maxPrice}</span>
              <Slider
                value={[filters.maxPrice]}
                onValueChange={([value]) => setFilters(prev => ({ ...prev, maxPrice: value }))}
                max={200}
                min={10}
                step={5}
                className="w-20"
              />
            </div>

            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="next_available">Availability</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="secondary" className="text-xs">
              {filteredVehicles.length} results
            </Badge>
          </div>
        </div>
      </section>

      {/* Map View */}
      {showMap && (
        <section className="border-b">
          <MapViewComponent 
            vehicles={filteredVehicles}
            showRoute={filteredVehicles.length > 0}
            routeCoordinates={getRouteCoordinates(filteredVehicles)}
            className="w-full h-80"
          />
        </section>
      )}

      {/* Results */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredVehicles.length > 0 ? (
            <div className="space-y-4">
              {filteredVehicles.map((transport) => (
                <TransportCard 
                  key={transport.id} 
                  transport={transport}
                  showRoute={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transport found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button variant="outline" onClick={loadAllVehicles}>
                  Show All Available
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchScreen;