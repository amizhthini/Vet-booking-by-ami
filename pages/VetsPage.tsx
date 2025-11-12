import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import VetCard from '../components/VetCard';
import BookingModal from '../components/BookingModal';
import { getVets } from '../services/mockDataService';
import type { Vet, Appointment } from '../types';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const VetsPage: React.FC = () => {
  const [vets, setVets] = useState<Vet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVet, setSelectedVet] = useState<Vet | null>(null);
  const [filters, setFilters] = useState({
    location: '',
    specialty: 'All Specialties',
    availability: '',
  });

  useEffect(() => {
    setIsLoading(true);
    getVets()
      .then(data => {
        setVets(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch vets", error);
        setIsLoading(false);
      });
  }, []);

  const specialties = useMemo(() => {
    return ['All Specialties', ...Array.from(new Set(vets.map(v => v.specialty)))];
  }, [vets]);
  
  const filteredVets = useMemo(() => {
    return vets.filter(vet => {
        const locationMatch = vet.location.toLowerCase().includes(filters.location.toLowerCase());
        const specialtyMatch = filters.specialty === 'All Specialties' || vet.specialty === filters.specialty;
        // Availability is a mock filter for demonstration
        const availabilityMatch = !filters.availability || true; 

        return locationMatch && specialtyMatch && availabilityMatch;
    });
  }, [vets, filters]);


  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const resetFilters = () => {
    setFilters({
        location: '',
        specialty: 'All Specialties',
        availability: '',
    });
  };

  const handleBookClick = (vet: Vet) => {
    setSelectedVet(vet);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedVet(null);
  };

  const handleBookingConfirmed = (newAppointment: Appointment) => {
    console.log("Booking confirmed:", newAppointment);
    // In a real app, you might want to show a success toast message
  };

  return (
    <PageWrapper title="Find a Vet or Clinic">
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" name="location" id="location" value={filters.location} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" placeholder="e.g., New York" />
            </div>
            <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Specialty</label>
                <select name="specialty" id="specialty" value={filters.specialty} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">Availability</label>
                <input type="date" name="availability" id="availability" value={filters.availability} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div className="flex space-x-2">
                <Button onClick={resetFilters} variant="secondary" className="w-full">Reset</Button>
            </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {filteredVets.length > 0 ? (
            filteredVets.map(vet => (
                <VetCard key={vet.id} vet={vet} onBook={handleBookClick} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">No vets match your criteria.</p>
          )}
        </div>
      )}
      <BookingModal
        vet={selectedVet}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onBookingConfirmed={handleBookingConfirmed}
      />
    </PageWrapper>
  );
};

export default VetsPage;