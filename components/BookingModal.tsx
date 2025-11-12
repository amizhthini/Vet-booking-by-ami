import React, { useState, useEffect } from 'react';
import type { Vet, Pet, Appointment, Attachment, User, ConsultationService } from '../types';
import { getPets, saveAppointment, updateAppointment, addPet } from '../services/mockDataService';
import { calculateDynamicPrice } from '../services/pricingService';
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
  const { user, login } = useAuth();
  const isCreateMode = mode === 'create';
  const isClinicAdmin = user?.role === 'Clinic Admin';

  const [step, setStep] = useState(1);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(appointmentToReschedule?.pet || null);
  const [selectedVet, setSelectedVet] = useState<Vet | null>(loggedInVet || appointmentToReschedule?.vet || vet || null);
  const [selectedService, setSelectedService] = useState<ConsultationService | null>(null);
  const [selectedDate, setSelectedDate] = useState(appointmentToReschedule?.date || '');
  const [selectedTime, setSelectedTime] = useState(appointmentToReschedule?.time || '');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [userNotes, setUserNotes] = useState(appointmentToReschedule?.userNotes || '');
  const [attachments, setAttachments] = useState<Attachment[]>(appointmentToReschedule?.attachments || []);
  const [isLoading, setIsLoading] = useState(false);
  const [petSearch, setPetSearch] = useState('');
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetBreed, setNewPetBreed] = useState('');

  const fetchUserPets = async () => {
    if (!user) return;
    setIsLoading(true);
    setShowAddPetForm(false);
    try {
        const data = await getPets();
        const filteredUserPets = data.filter(p => p.ownerId === user.id);
        setUserPets(filteredUserPets);
        if (filteredUserPets.length === 0 && mode === 'book') {
            setShowAddPetForm(true);
        }
    } catch (error) {
        console.error("Failed to fetch pets", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user && (mode === 'book' || mode === 'reschedule')) {
      fetchUserPets();
    }
  }, [isOpen, user, mode]);

  useEffect(() => {
    if (isOpen) {
      const initialStep = mode === 'reschedule' ? 3 : 1;
      const initialVet = loggedInVet || appointmentToReschedule?.vet || vet || null;

      // Reset state on open/prop change
      setStep(initialStep);
      setSelectedPet(appointmentToReschedule?.pet || null);
      setSelectedVet(initialVet);

      if (mode === 'reschedule' && appointmentToReschedule && initialVet?.services) {
        const service = initialVet.services.find(s => s.name === appointmentToReschedule.service);
        setSelectedService(service || null);
      } else {
        setSelectedService(null);
      }
      
      setSelectedDate(appointmentToReschedule?.date || '');
      setSelectedTime(appointmentToReschedule?.time || '');
      setCalculatedPrice(appointmentToReschedule?.price || null);
      setUserNotes(appointmentToReschedule?.userNotes || '');
      setAttachments(appointmentToReschedule?.attachments || []);
      setPetSearch('');
      setShowAddPetForm(false);
      setNewPetName('');
      setNewPetBreed('');
    }
  }, [isOpen, appointmentToReschedule, mode, vet, loggedInVet]);
  
   useEffect(() => {
    if (selectedService && selectedDate && selectedTime) {
      const price = calculateDynamicPrice(selectedService.basePrice, selectedDate, selectedTime);
      setCalculatedPrice(price);
    } else {
      setCalculatedPrice(null);
    }
  }, [selectedService, selectedDate, selectedTime]);

  const handleAddNewPet = async () => {
    if (!newPetName || !newPetBreed || !user) return;
    setIsLoading(true);
    try {
      const newPetData = {
        name: newPetName,
        breed: newPetBreed,
        age: 0,
        imageUrl: `https://picsum.photos/seed/${newPetName.toLowerCase()}/200`,
        ownerId: user.id,
        healthRecord: { vaccinations: [], allergies: [], medications: [] }
      };
      const newPet = await addPet(newPetData);
      setUserPets([newPet]);
      setSelectedPet(newPet);
      setShowAddPetForm(false);
      setStep(2); // Automatically advance to service selection
    } catch (error) {
      console.error("Failed to add pet", error);
      onComplete({ success: false, error: 'Failed to add your pet. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };


  const handleFinalConfirm = async () => {
    if (!selectedVet || !selectedPet || !selectedService || !selectedDate || !selectedTime || !calculatedPrice) return;

    setIsLoading(true);
    try {
      const commonData = {
            date: selectedDate,
            time: selectedTime,
            type: selectedService.type,
            service: selectedService.name,
            price: calculatedPrice,
            userNotes,
            attachments,
      };

      if (mode === 'reschedule' && appointmentToReschedule) {
        const updatedAppointment = await updateAppointment(appointmentToReschedule.id, commonData);
        onComplete({ success: true, data: updatedAppointment });
      } else { // Handles 'book' and 'create' modes
        const newAppointmentData = {
            pet: selectedPet,
            vet: selectedVet,
            ...commonData
        };
        const newAppointment = await saveAppointment(newAppointmentData, 'Pending');
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
    setStep(5);
  };

  const handleSkipDetails = () => {
    setUserNotes(appointmentToReschedule?.userNotes || '');
    setAttachments(appointmentToReschedule?.attachments || []);
    setStep(5);
  };

  const filteredPets = isCreateMode
    ? allPets.filter(p => p.name.toLowerCase().includes(petSearch.toLowerCase()))
    : userPets;
    
  const clinicVets = isClinicAdmin ? allVets.filter(v => v.clinicId === 'c1') : [];

  let title = `Book Appointment with ${vet?.name}`;
  if (mode === 'reschedule') title = `Reschedule for ${selectedPet?.name}`;
  if (mode === 'create') title = 'Create New Appointment';
  if (showAddPetForm) title = 'First, Add Your Pet';
  if (step === 5) title = 'Confirm Your Appointment';

  // Handle unauthenticated user
  if (!user) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log In or Sign Up">
            <div className="text-center">
                <p className="mb-4 text-gray-600">To book an appointment, please log in or create a free Pet Parent account on VetSync AI.</p>
                <Button size="lg" className="w-full" onClick={() => login('Pet Parent')}>
                    Log In / Sign Up as Pet Parent
                </Button>
            </div>
        </Modal>
    );
  }

  const renderContent = () => {
    if (isLoading && step !== 5) { // Don't show global spinner on final step
        return <div className="flex justify-center items-center h-48"><Spinner /></div>;
    }
    
    if (showAddPetForm) {
        return (
            <div>
                <h3 className="font-semibold text-lg mb-4">Add a Pet to Continue</h3>
                <p className="text-sm text-gray-500 mb-4">We need to know which pet this appointment is for. Please add their basic details.</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="newPetName" className="block text-sm font-medium text-gray-700">Pet Name</label>
                        <input type="text" id="newPetName" value={newPetName} onChange={e => setNewPetName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="newPetBreed" className="block text-sm font-medium text-gray-700">Breed</label>
                        <input type="text" id="newPetBreed" value={newPetBreed} onChange={e => setNewPetBreed(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleAddNewPet} disabled={!newPetName || !newPetBreed}>Save and Continue</Button>
                </div>
            </div>
        );
    }
    
    const currentVetForServices = (isCreateMode ? selectedVet : vet);
    
    return (
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
                    {userPets.length > 0 ? userPets.map(pet => (
                      <div key={pet.id} onClick={() => setSelectedPet(pet)} className={`p-4 border rounded-lg cursor-pointer ${selectedPet?.id === pet.id ? 'border-teal-500 ring-2 ring-teal-500' : 'border-gray-200'}`}>
                        <img src={pet.imageUrl} alt={pet.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
                        <p className="text-center font-medium">{pet.name}</p>
                      </div>
                    )) : (
                        <p className="col-span-2 text-center text-gray-500">Something went wrong. Please refresh.</p>
                    )}
                  </div>
                </>
              )}
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!selectedPet || (isCreateMode && !selectedVet)}>Next</Button>
              </div>
            </div>
          )}
          
          {/* Step 2: Select Service */}
           {step === 2 && (
            <div>
              <h3 className="font-semibold text-lg mb-4">What service do you need?</h3>
              <div className="space-y-2">
                {currentVetForServices?.services?.map(service => (
                  <div key={service.name} onClick={() => setSelectedService(service)} className={`p-4 border rounded-lg cursor-pointer flex justify-between items-center ${selectedService?.name === service.name ? 'border-teal-500 ring-2 ring-teal-500' : 'border-gray-200'}`}>
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-sm text-gray-500">{service.type}</p>
                    </div>
                    <p className="font-semibold text-gray-700">${service.basePrice.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                 <Button onClick={() => setStep(1)} variant="secondary">Back</Button>
                <Button onClick={() => setStep(3)} disabled={!selectedService}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 3 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Select Date & Time</h3>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-2 border rounded-md mb-4" min={new Date().toISOString().split('T')[0]} />

              <div className="grid grid-cols-3 gap-2">
                {availableTimes.map(time => (
                  <button key={time} onClick={() => setSelectedTime(time)} className={`p-2 text-sm rounded-md border ${selectedTime === time ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    {time}
                  </button>
                ))}
              </div>
              
              {calculatedPrice !== null && (
                 <div className="mt-6 p-4 bg-teal-50 rounded-lg text-center">
                    <p className="text-sm text-teal-800">Estimated Price</p>
                    <p className="text-3xl font-bold text-teal-600">${calculatedPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">Price is dynamic and based on demand.</p>
                 </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button onClick={() => setStep(2)} variant="secondary" disabled={mode === 'reschedule'}>Back</Button>
                <Button onClick={() => setStep(4)} disabled={!selectedDate || !selectedTime}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 4: Add Details (Optional) */}
          {step === 4 && selectedPet && (
            <div>
                <AddAppointmentDetailsForm 
                    petName={selectedPet.name}
                    initialNotes={userNotes}
                    initialAttachments={attachments}
                    onSave={handleDetailsSave}
                    onClose={onClose}
                    onSkip={handleSkipDetails}
                    isLoading={isLoading}
                    confirmText="Proceed to Confirmation"
                />
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <div>
                <div className="p-4 bg-gray-50 rounded-lg space-y-3 text-sm">
                    <div>
                        <span className="font-semibold text-gray-500">Pet:</span>
                        <p className="font-medium text-gray-800">{selectedPet?.name}</p>
                    </div>
                     <div>
                        <span className="font-semibold text-gray-500">With:</span>
                        <p className="font-medium text-gray-800">{selectedVet?.name}</p>
                    </div>
                     <div>
                        <span className="font-semibold text-gray-500">Service:</span>
                        <p className="font-medium text-gray-800">{selectedService?.name}</p>
                    </div>
                     <div>
                        <span className="font-semibold text-gray-500">When:</span>
                        <p className="font-medium text-gray-800">{selectedDate} at {selectedTime}</p>
                    </div>
                     <div className="pt-2 border-t">
                        <span className="font-semibold text-gray-500">Total:</span>
                        <p className="text-2xl font-bold text-gray-800">${calculatedPrice?.toFixed(2)}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-between">
                    <Button onClick={() => setStep(4)} variant="secondary" disabled={isLoading}>Back</Button>
                    <Button onClick={handleFinalConfirm} disabled={isLoading}>
                        {isLoading ? <Spinner size="sm" /> : 'Confirm & Proceed to Payment'}
                    </Button>
                </div>
            </div>
          )}
        </div>
    );
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {renderContent()}
    </Modal>
  );
};

export default BookingModal;