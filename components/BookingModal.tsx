
import React, { useState, useEffect } from 'react';
import type { Vet, Pet, Appointment } from '../types';
import { ConsultationType } from '../types';
import { getPets, saveAppointment } from '../services/mockDataService';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Spinner from './ui/Spinner';

interface BookingModalProps {
  vet: Vet | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (newAppointment: Appointment) => void;
}

const availableTimes = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

const BookingModal: React.FC<BookingModalProps> = ({ vet, isOpen, onClose, onBookingConfirmed }) => {
  const [step, setStep] = useState(1);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getPets().then(data => {
        setPets(data);
        setIsLoading(false);
      });
      // Reset state on open
      setStep(1);
      setSelectedPet(null);
      setSelectedType(null);
      setSelectedDate('');
      setSelectedTime('');
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!vet || !selectedPet || !selectedType || !selectedDate || !selectedTime) return;

    setIsLoading(true);
    try {
        const newAppointmentData = {
            pet: selectedPet,
            vet,
            type: selectedType,
            date: selectedDate,
            time: selectedTime,
        };
        const newAppointment = await saveAppointment(newAppointmentData);
        onBookingConfirmed(newAppointment);
        onClose();
    } catch (error) {
        console.error("Failed to book appointment", error);
    } finally {
        setIsLoading(false);
    }
  };

  if (!vet) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book Appointment with ${vet.name}`}>
      {isLoading ? (
        <div className="flex justify-center items-center h-48"><Spinner /></div>
      ) : (
        <div>
          {/* Step 1: Select Pet */}
          {step === 1 && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Which pet is this for?</h3>
              <div className="grid grid-cols-2 gap-4">
                {pets.map(pet => (
                  <div key={pet.id} onClick={() => setSelectedPet(pet)} className={`p-4 border rounded-lg cursor-pointer ${selectedPet?.id === pet.id ? 'border-teal-500 ring-2 ring-teal-500' : 'border-gray-200'}`}>
                    <img src={pet.imageUrl} alt={pet.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
                    <p className="text-center font-medium">{pet.name}</p>
                    <p className="text-center text-sm text-gray-500">{pet.breed}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!selectedPet}>Next</Button>
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
                <Button onClick={() => setStep(1)} variant="secondary">Back</Button>
                <Button onClick={handleConfirm} disabled={!selectedType || !selectedDate || !selectedTime}>Confirm Booking</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default BookingModal;
