import React, { useState, useEffect } from 'react';
import type { Vet, Pet, Appointment, Attachment } from '../types';
import { ConsultationType } from '../types';
import { getPets, saveAppointment, updateAppointment } from '../services/mockDataService';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import AddAppointmentDetailsForm from './AddAppointmentDetailsForm';

interface BookingModalProps {
  vet: Vet | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: { success: boolean; data?: Appointment; error?: string }) => void;
  appointmentToReschedule?: Appointment | null;
}

const availableTimes = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

const BookingModal: React.FC<BookingModalProps> = ({ vet, isOpen, onClose, onComplete, appointmentToReschedule }) => {
  const mode = appointmentToReschedule ? 'reschedule' : 'book';
  const initialStep = mode === 'reschedule' ? 2 : 1;

  const [step, setStep] = useState(initialStep);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(appointmentToReschedule?.pet || null);
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(appointmentToReschedule?.type || null);
  const [selectedDate, setSelectedDate] = useState(appointmentToReschedule?.date || '');
  const [selectedTime, setSelectedTime] = useState(appointmentToReschedule?.time || '');
  const [userNotes, setUserNotes] = useState(appointmentToReschedule?.userNotes || '');
  const [attachments, setAttachments] = useState<Attachment[]>(appointmentToReschedule?.attachments || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'book') {
        setIsLoading(true);
        getPets().then(data => {
          setPets(data);
          setIsLoading(false);
        });
      }
      // Reset state on open/prop change
      setStep(initialStep);
      setSelectedPet(appointmentToReschedule?.pet || null);
      setSelectedType(appointmentToReschedule?.type || null);
      setSelectedDate(appointmentToReschedule?.date || '');
      setSelectedTime(appointmentToReschedule?.time || '');
      setUserNotes(appointmentToReschedule?.userNotes || '');
      setAttachments(appointmentToReschedule?.attachments || []);
    }
  }, [isOpen, appointmentToReschedule, mode, initialStep]);

  const handleFinalConfirm = async () => {
    const currentVet = mode === 'reschedule' ? appointmentToReschedule?.vet : vet;
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
      } else {
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

  const title = mode === 'reschedule' ? `Reschedule for ${selectedPet?.name}` : `Book Appointment with ${vet?.name}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {isLoading && step !== 3 ? (
        <div className="flex justify-center items-center h-48"><Spinner /></div>
      ) : (
        <div>
          {/* Step 1: Select Pet */}
          {step === 1 && mode === 'book' && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Which pet is this for?</h3>
              <div className="grid grid-cols-2 gap-4">
                {pets.map(pet => (
                  <div key={pet.id} onClick={() => setSelectedPet(pet)} className={`p-4 border rounded-lg cursor-pointer ${selectedPet?.id === pet.id ? 'border-teal-500 ring-2 ring-teal-500' : 'border-gray-200'}`}>
                    <img src={pet.imageUrl} alt={pet.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
                    <p className="text-center font-medium">{pet.name}</p>
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

// Extracted form for reuse in both Booking and Editing modals
const AddAppointmentDetailsForm: React.FC<{
    petName: string;
    initialNotes: string;
    initialAttachments: Attachment[];
    onSave: (data: { userNotes: string, attachments: Attachment[] }) => void;
    onClose: () => void;
    onSkip?: () => void;
    isLoading: boolean;
}> = ({ petName, initialNotes, initialAttachments, onSave, onClose, onSkip, isLoading }) => {
    const [userNotes, setUserNotes] = useState(initialNotes);
    const [attachments, setAttachments] = useState(initialAttachments);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'record') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newAttachment: Attachment = {
                    name: file.name,
                    type: type === 'media' ? (file.type.startsWith('image/') ? 'image' : 'video') : 'record',
                    url: event.target?.result as string,
                };
                setAttachments(prev => [...prev, newAttachment]);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleSave = () => {
        onSave({ userNotes, attachments });
    };

    const mediaAttachments = attachments.filter(a => a.type === 'image' || a.type === 'video');
    const recordAttachments = attachments.filter(a => a.type === 'record');

    return (
      <div className="space-y-4">
        <div>
          <label htmlFor="user-notes" className="block text-sm font-medium text-gray-700">Notes for the Vet (optional)</label>
          <textarea
            id="user-notes"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder={`e.g., ${petName} has been less active since yesterday...`}
          />
        </div>
        <FileUploadSection
            title="Upload Pictures/Videos (optional)"
            onFileChange={(e) => handleFileChange(e, 'media')}
            attachments={mediaAttachments}
            onRemove={handleRemoveAttachment}
            accept="image/*,video/*"
            id="media-upload"
        />
        <FileUploadSection
            title="Upload Previous Medical Records (optional)"
            onFileChange={(e) => handleFileChange(e, 'record')}
            attachments={recordAttachments}
            onRemove={(index) => handleRemoveAttachment(attachments.findIndex(a => a === recordAttachments[index]))}
            accept=".pdf,.doc,.docx,image/*"
            id="record-upload"
        />
        <div className="flex justify-between items-center pt-4">
          <div>
            {onSkip && <Button onClick={onSkip} variant="ghost" disabled={isLoading}>Skip & Confirm</Button>}
          </div>
          <div className="flex space-x-2">
            <Button onClick={onClose} variant="secondary" disabled={isLoading}>Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? <Spinner size="sm" /> : onSkip ? 'Save & Confirm' : 'Save Details'}
            </Button>
          </div>
        </div>
      </div>
    );
};

const FileUploadSection: React.FC<{
    title: string;
    id: string;
    accept: string;
    attachments: Attachment[];
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
}> = ({ title, id, accept, attachments, onFileChange, onRemove }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{title}</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div className="flex text-sm text-gray-600"><label htmlFor={id} className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"><span>Upload a file</span><input id={id} name={id} type="file" className="sr-only" onChange={onFileChange} accept={accept} /></label></div>
            </div>
        </div>
        {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
                {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-1.5 bg-gray-100 rounded-md text-sm">
                        <span className="text-gray-700 truncate">{file.name}</span>
                        <button onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                    </div>
                ))}
            </div>
        )}
    </div>
);


export default BookingModal;