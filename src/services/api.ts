import { supabase } from '@/lib/supabase';

export interface Vehicle {
  id: string;
  type: 'bus' | 'auto' | 'cab';
  name: string;
  route: string;
  current_location: { lat: number; lng: number };
  stands: string[];
  price: number;
  duration: string;
  next_available: string;
}

export interface SearchParams {
  from: string;
  to: string;
  type?: 'bus' | 'auto' | 'cab';
}

class ApiService {
  // Get all vehicles
  async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching vehicles:', error);
      return this.getMockVehicles(); // Fallback to mock data
    }

    return data || this.getMockVehicles();
  }

  // Search vehicles by route
  async searchVehicles(params: SearchParams): Promise<Vehicle[]> {
    let query = supabase
      .from('vehicles')
      .select('*');

    if (params.type) {
      query = query.eq('type', params.type);
    }

    // Simple text search in route field
    if (params.from || params.to) {
      const searchTerm = `${params.from} ${params.to}`.trim();
      query = query.ilike('route', `%${searchTerm}%`);
    }

    const { data, error } = await query.order('price', { ascending: true });

    if (error) {
      console.error('Error searching vehicles:', error);
      return this.getMockVehicles();
    }

    return data || [];
  }

  // Get nearby vehicles (mock implementation)
  async getNearbyVehicles(lat: number, lng: number, radius: number = 5): Promise<Vehicle[]> {
    // In a real implementation, you'd use PostGIS or similar for geospatial queries
    // For now, return mock data based on proximity to Bangalore city center
    const vehicles = await this.getVehicles();
    
    return vehicles.filter(vehicle => {
      const distance = this.calculateDistance(
        lat, lng,
        vehicle.current_location.lat,
        vehicle.current_location.lng
      );
      return distance <= radius;
    });
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Mock data for development
  private getMockVehicles(): Vehicle[] {
    return [
      {
        id: '1',
        type: 'bus',
        name: 'City Bus Route 42',
        route: 'Central Station → Market Square → Hospital Junction → University Campus',
        current_location: { lat: 12.9716, lng: 77.5946 },
        stands: ['Central Bus Stand', 'Market Square', 'Hospital Junction'],
        price: 15,
        duration: '25 mins',
        next_available: '5 mins'
      },
      {
        id: '2',
        type: 'auto',
        name: 'Auto Rickshaw',
        route: 'Market Square → Main Road → University Campus',
        current_location: { lat: 12.9742, lng: 77.5952 },
        stands: ['Market Auto Stand', 'Railway Station', 'Bus Stand'],
        price: 45,
        duration: '15 mins',
        next_available: '2 mins'
      },
      {
        id: '3',
        type: 'cab',
        name: 'Shared Taxi',
        route: 'Railway Station → Highway → University Gate',
        current_location: { lat: 12.9698, lng: 77.5938 },
        stands: ['Railway Taxi Stand', 'Airport Road', 'City Center'],
        price: 35,
        duration: '20 mins',
        next_available: '8 mins'
      },
      {
        id: '4',
        type: 'bus',
        name: 'Express Bus 101',
        route: 'IT Park → Commercial Street → Brigade Road',
        current_location: { lat: 12.9780, lng: 77.5960 },
        stands: ['IT Park Terminal', 'Commercial Complex', 'Brigade Bus Stop'],
        price: 20,
        duration: '30 mins',
        next_available: '12 mins'
      },
      {
        id: '5',
        type: 'auto',
        name: 'Quick Auto',
        route: 'MG Road → Brigade Road → Commercial Street',
        current_location: { lat: 12.9750, lng: 77.6040 },
        stands: ['MG Road Metro', 'Brigade Road Corner', 'Commercial Street Auto Stand'],
        price: 55,
        duration: '18 mins',
        next_available: '3 mins'
      }
    ];
  }

  // Subscribe to real-time vehicle updates
  subscribeToVehicleUpdates(callback: (vehicle: Vehicle) => void) {
    return supabase
      .channel('vehicle-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'vehicles' 
        }, 
        (payload) => {
          if (payload.new) {
            callback(payload.new as Vehicle);
          }
        }
      )
      .subscribe();
  }
}

export const apiService = new ApiService();