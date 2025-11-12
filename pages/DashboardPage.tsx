
import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import type { Appointment, Vet } from '../types';
import { Page } from '../types';
import { getAppointments, getVets } from '../services/mockDataService';
import AppointmentCard from '../components/AppointmentCard';
import VetCard from '../components/VetCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

interface DashboardPageProps {
  navigateTo: (page: Page) => void;
  startConsultation: (appointment: Appointment) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ navigateTo, startConsultation }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [featuredVets, setFeaturedVets] = useState<Vet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [appointments, vets] = await Promise.all([getAppointments(), getVets()]);
        const upcoming = appointments
          .filter(a => a.status === 'Upcoming')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 2);
        
        setUpcomingAppointments(upcoming);
        setFeaturedVets(vets.slice(0, 2));
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <PageWrapper title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Upcoming Appointments</h2>
            <Button variant="ghost" onClick={() => navigateTo(Page.Appointments)}>View All</Button>
          </div>
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appt => (
              <AppointmentCard key={appt.id} appointment={appt} onStartConsultation={startConsultation} />
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">No upcoming appointments.</p>
                <Button className="mt-4" onClick={() => navigateTo(Page.Vets)}>Book a Consultation</Button>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Featured Vets</h2>
            <div className="space-y-4">
               {featuredVets.map(vet => (
                   <div key={vet.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
                       <img src={vet.imageUrl} alt={vet.name} className="w-12 h-12 rounded-full object-cover" />
                       <div>
                           <p className="font-semibold text-gray-800">{vet.name}</p>
                           <p className="text-sm text-gray-500">{vet.specialty}</p>
                       </div>
                   </div>
               ))}
            </div>
            <Button className="w-full mt-4" variant="secondary" onClick={() => navigateTo(Page.Vets)}>Find More Vets</Button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;
