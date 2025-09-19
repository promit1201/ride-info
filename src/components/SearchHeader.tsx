import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, ArrowRight } from 'lucide-react';

interface SearchHeaderProps {
  searchFrom: string;
  setSearchFrom: (value: string) => void;
  searchTo: string;
  setSearchTo: (value: string) => void;
  onSearch: () => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchFrom,
  setSearchFrom,
  searchTo,
  setSearchTo,
  onSearch
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* From Input */}
        <div className="relative flex-1 w-full">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-foreground/70" />
          <Input
            placeholder="From (e.g., Market Square)"
            value={searchFrom}
            onChange={(e) => setSearchFrom(e.target.value)}
            className="pl-10 bg-white/20 border-white/30 text-primary-foreground placeholder:text-primary-foreground/70 focus:bg-white/30"
          />
        </div>
        
        {/* Arrow Icon */}
        <div className="hidden md:block">
          <ArrowRight className="h-5 w-5 text-primary-foreground/70" />
        </div>
        
        {/* To Input */}
        <div className="relative flex-1 w-full">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-foreground/70" />
          <Input
            placeholder="To (e.g., University Campus)"
            value={searchTo}
            onChange={(e) => setSearchTo(e.target.value)}
            className="pl-10 bg-white/20 border-white/30 text-primary-foreground placeholder:text-primary-foreground/70 focus:bg-white/30"
          />
        </div>
        
        {/* Search Button */}
        <Button 
          onClick={onSearch}
          className="bg-white text-primary hover:bg-white/90 px-8"
          size="lg"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
      
      {/* Quick Suggestions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-primary-foreground/80">Popular:</span>
        {['Market → University', 'Station → Hospital', 'Airport → City Center'].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => {
              const [from, to] = suggestion.split(' → ');
              setSearchFrom(from);
              setSearchTo(to);
            }}
            className="text-xs bg-white/10 hover:bg-white/20 text-primary-foreground px-3 py-1 rounded-full border border-white/20 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchHeader;