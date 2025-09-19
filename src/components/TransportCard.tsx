import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, IndianRupee, MapPin, Navigation, Bus, Car, Truck } from 'lucide-react';
import { Vehicle } from '@/services/api';

interface TransportCardProps {
  transport: Vehicle;
  showRoute?: boolean;
}

const TransportCard: React.FC<TransportCardProps> = ({ transport, showRoute = false }) => {
  const getTransportIcon = () => {
    switch (transport.type) {
      case 'bus':
        return <Bus className="h-5 w-5" />;
      case 'auto':
        return <Truck className="h-5 w-5" />;
      case 'cab':
        return <Car className="h-5 w-5" />;
      default:
        return <Navigation className="h-5 w-5" />;
    }
  };

  const getTransportColor = () => {
    switch (transport.type) {
      case 'bus':
        return 'bg-transport-bus text-white';
      case 'auto':
        return 'bg-transport-auto text-white';
      case 'cab':
        return 'bg-transport-cab text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const getAvailabilityColor = () => {
    const minutes = parseInt(transport.next_available);
    if (minutes <= 3) return 'text-success';
    if (minutes <= 8) return 'text-warning';
    return 'text-muted-foreground';
  };

  // Extract from and to locations from route
  const getRouteEndpoints = () => {
    const routeParts = transport.route.split('→');
    const from = routeParts[0]?.trim() || 'Unknown';
    const to = routeParts[routeParts.length - 1]?.trim() || 'Unknown';
    return { from, to };
  };

  const { from, to } = getRouteEndpoints();

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getTransportColor()}`}>
              {getTransportIcon()}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{transport.name}</h4>
              <p className="text-sm text-muted-foreground capitalize">{transport.type}</p>
            </div>
          </div>
          <Badge variant="outline" className={`${getAvailabilityColor()}`}>
            <Clock className="h-3 w-3 mr-1" />
            {transport.next_available}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Route Information */}
        <div className="flex items-start space-x-2">
          <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium">{from}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-medium">{to}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{transport.route}</p>
          </div>
        </div>
        
        {/* Price and Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-lg font-bold text-foreground">
            <IndianRupee className="h-4 w-4" />
            <span>{transport.price}</span>
          </div>
          <span className="text-sm text-muted-foreground">{transport.duration}</span>
        </div>
        
        {/* Available Stands */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Available at:</p>
          <div className="flex flex-wrap gap-1">
            {transport.stands.map((stand, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {stand}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Action Button */}
        <Button variant="outline" className="w-full" size="sm">
          <Navigation className="h-4 w-4 mr-2" />
          View Route Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default TransportCard;