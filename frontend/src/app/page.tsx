'use client';

import { useState } from 'react';
import { HeroBanner } from '@/components/home/HeroBanner';
import { LocationFilter } from '@/components/home/LocationFilter';
import { ShowsSection } from '@/components/home/ShowsSection';
import { StagesSection } from '@/components/home/StagesSection';
import { ToursSection } from '@/components/home/ToursSection';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);

  const handleLocationChange = (slug: string | null) => {
    setSelectedLocation(slug ?? undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-50/30 to-brand-100/50">
      {/* Hero Banner Carousel */}
      <HeroBanner />

      {/* Quick Location Filter Bar */}
      <div className="px-4 sm:px-6 lg:px-8">
        <LocationFilter
          selectedLocation={selectedLocation}
          onLocationChange={handleLocationChange}
        />
      </div>

      {/* Shows Section - Primary Sales Block */}
      <ShowsSection locationFilter={selectedLocation} />

      {/* Stages/Venues Section */}
      <StagesSection />

      {/* Tours Section */}
      <ToursSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
