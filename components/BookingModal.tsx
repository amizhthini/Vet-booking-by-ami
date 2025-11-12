import React, { useState, useEffect } from 'react';
import type { Vet, Pet, Appointment, Attachment, User } from '../types';
import { ConsultationType } from '../types';
import { getPets, saveAppointment, updateAppointment } from '../services/mockDataService';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import AddAppointmentDetailsForm from './AddAppointmentDetailsForm';
import { useAuth } from '../hooks/useAuth';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: { success: boolean; data?: Appointment; error?: string }) => void;
  
  // Different modes determine the flow and available props
  mode?: 'book' | 'reschedule' | 'create';
  
  // For 'book' mode
  vet?: Vet | null;
  
  // For 'reschedule' mode
  appointmentToReschedule?: Appointment | null;
  
  // For 'create' mode
  allPets?: Pet[];
  allVets?: Vet[];
  loggedInVet?: Vet | null;
}

const availableTimes = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  mode = 'book',
  vet,
  appointmentToReschedule,
  allPets = [],
  allVets = [],
  loggedInVet,
}) => {
  const { user } = useAuth();
  const initialStep = mode === 'reschedule' ? 2 : 1;
  const isCreateMode = mode === 'create';
  const isClinicAdmin = user?.role === 'Clinic Admin';

  const [step, setStep] = useState(initialStep);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(appointmentToReschedule?.pet || null);
  const [selectedVet, setSelectedVet] = useState<Vet | null>(loggedInVet || appointmentToReschedule?.vet || vet || null);
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(appointmentToReschedule?.type || null);
  const [selectedDate, setSelectedDate] = useState(appointmentToReschedule?.date || '');
  const [selectedTime, setSelectedTime] = useState(appointmentToReschedule?.time || '');
  const [userNotes, setUserNotes] = useState(appointmentToReschedule?.userNotes || '');
  const [attachments, setAttachments] = useState<Attachment[]>(appointmentToReschedule?.attachments || []);
  const [isLoading, setIsLoading] = useState(false);
  const [petSearch, setPetSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'book') {
        setIsLoading(true);
        getPets().then(data => {
          setUserPets(data);
          setIsLoading(false);
        });
      }
      // Reset state on open/prop change
      setStep(initialStep);
      setSelectedPet(appointmentToReschedule?.pet || null);
      setSelectedVet(loggedInVet || appointmentToReschedule?.vet || vet || null);
      setSelectedType(appointmentToReschedule?.type || null);
      setSelectedDate(appointmentToReschedule?.date || '');
      setSelectedTime(appointmentToReschedule?.time || '');
      setUserNotes(appointmentToReschedule?.userNotes || '');
      setAttachments(appointmentToReschedule?.attachments || []);
      setPetSearch('');
    }
  }, [isOpen, appointmentToReschedule, mode, initialStep, vet, loggedInVet]);

  const handleFinalConfirm = async () => {
    const currentVet = isCreateMode ? selectedVet : (mode === 'reschedule' ? appointmentToReschedule?.vet : vet);

    if (!currentVet || !selectedPet || !selectedType || !selectedDate || !selectedTime) return;

    setIsLoading(true);
    try {
      if (mode === 'reschedule' && appointmentToReschedule) {
        const updatedData: Partial<Appointment> = {
            date: selectedDate,
            time: selectedTime,
            type: selectedType,
            userNotes,
            attachments,
        };
        const updatedAppointment = await updateAppointment(appointmentToReschedule.id, updatedData);
        onComplete({ success: true, data: updatedAppointment });
      } else { // Handles 'book' and 'create' modes
        const newAppointmentData = {
            pet: selectedPet,
            vet: currentVet,
            type: selectedType,
            date: selectedDate,
            time: selectedTime,
            userNotes,
            attachments,
        };
        const newAppointment = await saveAppointment(newAppointmentData);
        onComplete({ success: true, data: newAppointment });
      }
      onClose();
    } catch (error) {
      console.error(`Failed to ${mode} appointment`, error);
      onComplete({ success: false, error: `Failed to ${mode} appointment. Please try again later.` });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDetailsSave = (data: {userNotes: string; attachments: Attachment[]}) => {
    setUserNotes(data.userNotes);
    setAttachments(data.attachments);
    handleFinalConfirm();
  };

  const filteredPets = isCreateMode
    ? allPets.filter(p => p.name.toLowerCase().includes(petSearch.toLowerCase()))
    : userPets;
    
  const clinicVets = isClinicAdmin ? allVets.filter(v => v.clinicId === 'c1') : [];

  let title = `Book Appointment with ${vet?.name}`;
  if (mode === 'reschedule') title = `Reschedule for ${selectedPet?.name}`;
  if (mode === 'create') title = 'Create New Appointment';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {isLoading && step !== 3 ? (
        <div className="flex justify-center items-center h-48"><Spinner /></div>
      ) : (
        <div>
          {/* Step 1: Select Pet (and Vet for Admins in Create mode) */}
          {step === 1 && (
            <div>
              {isCreateMode ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="pet-search" className="block text-sm font-medium text-gray-700">Search for a Pet</label>
                    <input
                      type="text"
                      id="pet-search"
                      value={petSearch}
                      onChange={e => setPetSearch(e.target.value)}
                      placeholder="Type pet name..."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    />
                     <select size={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={e => setSelectedPet(allPets.find(p => p.id === e.target.value) || null)}>
                        {filteredPets.map(pet => (
                           <option key={pet.id} value={pet.id}>{pet.name} ({pet.breed})</option>
                        ))}
                     </select>
                  </div>
                  {isClinicAdmin && (
                      <div>
                        <label htmlFor="vet-select" className="block text-sm font-medium text-gray-700">Assign to Veterinarian</label>
                         <select id="vet-select" value={selectedVet?.id || ''} onChange={e => setSelectedVet(clinicVets.find(v => v.id === e.target.value) || null)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                             <option value="" disabled>-- Select a vet --</option>
                             {clinicVets.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                         </select>
                      </div>
                  )}
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-lg mb-4">Which pet is this for?</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {userPets.map(pet => (
                      <div key={pet.id} onClick={() => setSelectedPet(pet)} className={`p-4 border rounded-lg cursor-pointer ${selectedPet?.id === pet.id ? 'border-teal-500 ring-2 ring-teal-500' : 'border-gray-200'}`}>
                        <img src={pet.imageUrl} alt={pet.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
                        <p className="text-center font-medium">{pet.name}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!selectedPet || (isCreateMode && !selectedVet)}>Next</Button>
              </div>
            </div>
          )}
          
          {/* Step 2: Select Consultation Type & Time */}
          {step === 2 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Consultation Type</h3>
              <div className="flex space-x-2 mb-4">
                {Object.values(ConsultationType).map(type => (
                  <button key={type} onClick={() => setSelectedType(type)} className={`px-3 py-1.5 text-sm rounded-full border ${selectedType === type ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    {type}
                  </button>
                ))}
              </div>
              
              <h3 className="font-semibold text-lg mb-2">Date & Time</h3>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-2 border rounded-md mb-4" min={new Date().toISOString().split('T')[0]} />

              <div className="grid grid-cols-3 gap-2">
                {availableTimes.map(time => (
                  <button key={time} onClick={() => setSelectedTime(time)} className={`p-2 text-sm rounded-md border ${selectedTime === time ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    {time}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <Button onClick={() => setStep(1)} variant="secondary" disabled={mode === 'reschedule'}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={!selectedType || !selectedDate || !selectedTime}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 3: Add Details (Optional) */}
          {step === 3 && selectedPet && (
            <div>
                <AddAppointmentDetailsForm 
                    petName={selectedPet.name}
                    initialNotes={userNotes}
                    initialAttachments={attachments}
                    onSave={handleDetailsSave}
                    onClose={onClose}
                    onSkip={handleFinalConfirm}
                    isLoading={isLoading}
                />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default BookingModal;