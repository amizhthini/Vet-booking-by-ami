import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import type { Pet } from '../types';

interface EditPetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (petData: Partial<Omit<Pet, 'id' | 'ownerId' | 'imageUrl'>>, petId?: string) => Promise<void>;
    petToEdit: Pet | null;
}

const EditPetModal: React.FC<EditPetModalProps> = ({ isOpen, onClose, onSave, petToEdit }) => {
    const [name, setName] = useState('');
    const [breed, setBreed] = useState('');
    const [age, setAge] = useState('');
    const [vaccinations, setVaccinations] = useState('');
    const [allergies, setAllergies] = useState('');
    const [medications, setMedications] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (petToEdit) {
            setName(petToEdit.name);
            setBreed(petToEdit.breed);
            setAge(petToEdit.age.toString());
            setVaccinations(petToEdit.healthRecord.vaccinations.join(', '));
            setAllergies(petToEdit.healthRecord.allergies.join(', '));
            setMedications(petToEdit.healthRecord.medications.join(', '));
        } else {
            // Reset form for adding a new pet
            setName('');
            setBreed('');
            setAge('');
            setVaccinations('');
            setAllergies('');
            setMedications('');
        }
    }, [petToEdit, isOpen]);

    const handleSubmit = async () => {
        setIsLoading(true);
        const petData = {
            name,
            breed,
            age: parseInt(age, 10) || 0,
            healthRecord: {
                vaccinations: vaccinations.split(',').map(s => s.trim()).filter(Boolean),
                allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
                medications: medications.split(',').map(s => s.trim()).filter(Boolean),
            }
        };
        await onSave(petData, petToEdit?.id);
        setIsLoading(false);
        onClose();
    };
    
    const title = petToEdit ? `Edit ${petToEdit.name}'s Profile` : 'Add a New Pet';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="breed" className="block text-sm font-medium text-gray-700">Breed</label>
                    <input type="text" id="breed" value={breed} onChange={e => setBreed(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                    <input type="number" id="age" value={age} onChange={e => setAge(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                
                <h3 className="font-semibold text-md text-gray-800 border-t pt-4">Health Records</h3>
                <p className="text-xs text-gray-500 -mt-2">Separate multiple items with a comma (,)</p>

                <div>
                    <label htmlFor="vaccinations" className="block text-sm font-medium text-gray-700">Vaccinations</label>
                    <textarea id="vaccinations" value={vaccinations} onChange={e => setVaccinations(e.target.value)} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., Rabies, DHPP"></textarea>
                </div>
                <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">Allergies</label>
                    <textarea id="allergies" value={allergies} onChange={e => setAllergies(e.target.value)} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., Chicken, Flea bites"></textarea>
                </div>
                 <div>
                    <label htmlFor="medications" className="block text-sm font-medium text-gray-700">Current Medications</label>
                    <textarea id="medications" value={medications} onChange={e => setMedications(e.target.value)} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., Simparica Trio (monthly)"></textarea>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? <Spinner size="sm" /> : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default EditPetModal;
