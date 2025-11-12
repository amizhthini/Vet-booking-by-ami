import React, { useState, useMemo } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import type { Pet, Vet, Appointment, Referral, User } from '../types';
import { createReferral } from '../services/mockDataService';

interface CreateReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (result: { success: boolean, data?: Referral, error?: string }) => void;
    pets: Pet[];
    vets: Vet[];
    appointments: Appointment[];
    loggedInUser: User | null;
}

const CreateReferralModal: React.FC<CreateReferralModalProps> = ({ isOpen, onClose, onComplete, pets, vets, appointments, loggedInUser }) => {
    const [selectedPetId, setSelectedPetId] = useState('');
    const [fromVetId, setFromVetId] = useState(loggedInUser?.role === 'Veterinarian' ? loggedInUser.id : '');
    const [toVetId, setToVetId] = useState('');
    const [appointmentId, setAppointmentId] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fromVets = useMemo(() => {
        if (loggedInUser?.role === 'Clinic Admin') {
            return vets.filter(v => v.clinicId === 'c1'); // Mock clinic ID
        }
        return vets;
    }, [vets, loggedInUser]);

    const petAppointments = useMemo(() => {
        if (!selectedPetId) return [];
        return appointments
            .filter(a => a.pet.id === selectedPetId && a.status === 'Completed')
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [appointments, selectedPetId]);

    const handleSubmit = async () => {
        const pet = pets.find(p => p.id === selectedPetId);
        const fromVet = vets.find(v => v.id === fromVetId);
        const toVet = vets.find(v => v.id === toVetId);

        if (!pet || !fromVet || !toVet || !appointmentId || !notes) {
            onComplete({ success: false, error: "Please fill out all fields." });
            return;
        }

        setIsLoading(true);
        try {
            const newReferralData = {
                pet,
                fromVet,
                toVet,
                appointmentId,
                notes,
                date: new Date().toISOString(),
                status: 'Pending' as const,
            };
            const newReferral = await createReferral(newReferralData);
            onComplete({ success: true, data: newReferral });
        } catch (error) {
            onComplete({ success: false, error: "Failed to create referral." });
        } finally {
            setIsLoading(false);
            onClose();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Referral">
            <div className="space-y-4">
                <div>
                    <label htmlFor="pet-select" className="block text-sm font-medium text-gray-700">Patient (Pet)</label>
                    <select id="pet-select" value={selectedPetId} onChange={e => setSelectedPetId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                        <option value="" disabled>-- Select a pet --</option>
                        {pets.map(pet => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="from-vet-select" className="block text-sm font-medium text-gray-700">Referring Vet (From)</label>
                    <select id="from-vet-select" value={fromVetId} onChange={e => setFromVetId(e.target.value)} disabled={loggedInUser?.role === 'Veterinarian'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm bg-gray-100 disabled:opacity-75">
                         {loggedInUser?.role === 'Clinic Admin' && <option value="" disabled>-- Select a vet --</option>}
                         {fromVets.map(vet => <option key={vet.id} value={vet.id}>{vet.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="to-vet-select" className="block text-sm font-medium text-gray-700">Referred To</label>
                    <select id="to-vet-select" value={toVetId} onChange={e => setToVetId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                        <option value="" disabled>-- Select a vet --</option>
                        {vets.map(vet => <option key={vet.id} value={vet.id}>{vet.name} ({vet.specialty})</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="appointment-select" className="block text-sm font-medium text-gray-700">Reference Consultation</label>
                    <select id="appointment-select" value={appointmentId} onChange={e => setAppointmentId(e.target.value)} disabled={!selectedPetId} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                        <option value="" disabled>-- Select a past consultation --</option>
                        {petAppointments.map(appt => <option key={appt.id} value={appt.id}>{new Date(appt.date).toLocaleDateString()} - {appt.vet.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Referral Notes</label>
                    <textarea id="notes" rows={4} value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" placeholder="Reason for referral, relevant history, etc."></textarea>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? <Spinner size="sm" /> : 'Send Referral'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateReferralModal;
