
import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import AppointmentCard from '../components/AppointmentCard';
import { getAppointments, updateAppointment, confirmAppointmentPayment } from '../services/mockDataService';
import type { Appointment, Attachment } from '../types';
import Spinner from '../components/ui/Spinner';
import AddAppointmentDetailsModal from '../components/AddAppointmentDetailsModal';
import BookingModal from '../components/BookingModal';
import Toast from '../components/ui/Toast';


interface AppointmentsPageProps {
  startConsultation: (appointment: Appointment) => void;
}

const AppointmentSection: React.FC<{
  title: string;
  appointments: Appointment[];
  onStartConsultation: (appointment: Appointment) => void;
  onAddDetails: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onConfirmPayment: (appointment: Appointment) => void;
}> = ({ title, appointments, onStartConsultation, onAddDetails, onReschedule, onCancel, onConfirmPayment }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (appointments.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <button
                className="w-full text-left flex justify-between items-center py-3 px-4 bg-gray-100 rounded-t-lg border-b"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <h2 className="text-xl font-semibold text-gray-700">{title} ({appointments.length})</h2>
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="bg-white p-4 rounded-b-lg shadow-sm">
                    {appointments.map(appointment => (
                        <AppointmentCard 
                            key={appointment.id} 
                            appointment={appointment} 
                            onStartConsultation={onStartConsultation}
                            onAddDetails={onAddDetails} 
                            onReschedule={onReschedule}
                            onCancel={onCancel}
                            onConfirmPayment={onConfirmPayment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ startConsultation }) => {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const data = await getAppointments();
            setAllAppointments(data);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setIsLoading(false);
        }
    }
    
    fetchAppointments();
  }, []);
  
  const handleOpenDetailsModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleSaveDetails = async (appointmentId: string, data: { userNotes?: string; attachments?: Attachment[] }) => {
    try {
        const updatedAppt = await updateAppointment(appointmentId, data);
        setAllAppointments(prev => prev.map(a => a.id === appointmentId ? updatedAppt : a));
        setToast({ message: 'Details saved successfully!', type: 'success' });
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
        setAllAppointments(prev => prev.map(a => a.id === result.data!.id ? result.data! : a));
        setToast({ message: 'Appointment rescheduled successfully!', type: 'success' });
    } else {
        setToast({ message: result.error || 'Failed to reschedule.', type: 'error' });
    }
    setAppointmentToReschedule(null);
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    if (window.confirm(`Are you sure you want to cancel your appointment for ${appointment.pet.name}? This action cannot be undone.`)) {
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

  const sortedAppointments = useMemo(() => {
    const upcoming = allAppointments
      .filter(a => a.status === 'Upcoming')
      .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());
      
    const pending = allAppointments
      .filter(a => a.status === 'Pending')
      .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());

    const past = allAppointments
      .filter(a => a.status === 'Completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    const cancelled = allAppointments
      .filter(a => a.status === 'Cancelled')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    return { upcoming, pending, past, cancelled };
  }, [allAppointments]);

  const commonProps = {
      onStartConsultation: startConsultation,
      onAddDetails: handleOpenDetailsModal,
      onReschedule: handleOpenRescheduleModal,
      onCancel: handleCancelAppointment,
      onConfirmPayment: handleConfirmPayment
  };

  return (
    <PageWrapper title="My Appointments">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <div>
          {allAppointments.length > 0 ? (
            <>
                <AppointmentSection title="Pending Confirmation" appointments={sortedAppointments.pending} {...commonProps} />
                <AppointmentSection title="Upcoming" appointments={sortedAppointments.upcoming} {...commonProps} />
                <AppointmentSection title="Past" appointments={sortedAppointments.past} {...commonProps} />
                <AppointmentSection title="Cancelled" appointments={sortedAppointments.cancelled} {...commonProps} />
            </>
          ) : (
            <p className="text-center text-gray-500 py-10">You have no appointments scheduled.</p>
          )}
        </div>
      )}
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

export default AppointmentsPage;
