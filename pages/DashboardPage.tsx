
import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import type { Appointment, Vet, Attachment } from '../types';
import { Page } from '../types';
import { getAppointments, getVets, updateAppointment, confirmAppointmentPayment } from '../services/mockDataService';
import AppointmentCard from '../components/AppointmentCard';
import VetCard from '../components/VetCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import AddAppointmentDetailsModal from '../components/AddAppointmentDetailsModal';
import BookingModal from '../components/BookingModal';
import Toast from '../components/ui/Toast';


interface DashboardPageProps {
  navigateTo: (page: Page) => void;
  startConsultation: (appointment: Appointment) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ navigateTo, startConsultation }) => {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [featuredVets, setFeaturedVets] = useState<Vet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [appointments, vets] = await Promise.all([getAppointments(), getVets()]);
        setAllAppointments(appointments);
        setFeaturedVets(vets.slice(0, 2));
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setToast({ message: 'Failed to load dashboard data.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenDetailsModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleSaveDetails = async (appointmentId: string, data: { userNotes?: string; attachments?: Attachment[] }) => {
    try {
        const updatedAppt = await updateAppointment(appointmentId, data);
        setAllAppointments(prev => prev.map(a => a.id === appointmentId ? updatedAppt : a));
    } catch (error) {
        console.error("Failed to save details:", error);
        setToast({ message: 'Failed to save details.', type: 'error' });
    }
  };
  
  const handleOpenRescheduleModal = (appointment: Appointment) => {
    setAppointmentToReschedule(appointment);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleComplete = (result: { success: boolean; data?: Appointment; error?: string }) => {
    if (result.success && result.data) {
        setAllAppointments(prev => {
            const existing = prev.find(a => a.id === result.data!.id);
            if (existing) {
                return prev.map(a => a.id === result.data!.id ? result.data! : a);
            }
            return [...prev, result.data];
        });
        setToast({ message: 'Appointment rescheduled successfully!', type: 'success' });
    } else {
        setToast({ message: result.error || 'Failed to reschedule.', type: 'error' });
    }
    setAppointmentToReschedule(null);
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    if (window.confirm(`Are you sure you want to cancel your appointment for ${appointment.pet.name}?`)) {
        try {
            const updatedAppt = await updateAppointment(appointment.id, { status: 'Cancelled' });
            setAllAppointments(prev => prev.map(a => a.id === appointment.id ? updatedAppt : a));
            setToast({ message: 'Appointment cancelled successfully.', type: 'success' });
        } catch (error) {
            console.error("Failed to cancel appointment:", error);
            setToast({ message: 'Failed to cancel appointment.', type: 'error' });
        }
    }
  };

  const handleConfirmPayment = async (appointment: Appointment) => {
    try {
        const updatedAppt = await confirmAppointmentPayment(appointment.id);
        setAllAppointments(prev => prev.map(a => a.id === appointment.id ? updatedAppt : a));
        setToast({ message: 'Appointment confirmed successfully!', type: 'success' });
    } catch (error) {
        console.error("Failed to confirm appointment:", error);
        setToast({ message: 'Failed to confirm appointment.', type: 'error' });
    }
  };

  const upcomingAndPendingAppointments = allAppointments
    .filter(a => a.status === 'Upcoming' || a.status === 'Pending')
    .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime())
    .slice(0, 3);

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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Your Schedule</h2>
            <Button variant="ghost" onClick={() => navigateTo(Page.Appointments)}>View All</Button>
          </div>
          {upcomingAndPendingAppointments.length > 0 ? (
            upcomingAndPendingAppointments.map(appt => (
              <AppointmentCard 
                key={appt.id} 
                appointment={appt} 
                onStartConsultation={startConsultation}
                onAddDetails={handleOpenDetailsModal}
                onReschedule={handleOpenRescheduleModal}
                onCancel={handleCancelAppointment}
                onConfirmPayment={handleConfirmPayment}
                />
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
       <AddAppointmentDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        appointment={selectedAppointment}
        onSave={handleSaveDetails}
      />
       <BookingModal 
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        mode="reschedule"
        appointmentToReschedule={appointmentToReschedule}
        onComplete={handleRescheduleComplete}
      />
    </PageWrapper>
  );
};

export default DashboardPage;
