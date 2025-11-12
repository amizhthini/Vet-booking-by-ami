import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { getReports, getPets, getPetOwners, getAppointments } from '../services/mockDataService';
import type { Report, Pet, PetOwner, Appointment, PrescriptionReport } from '../types';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';

type SortConfig = {
    key: keyof Pet;
    direction: 'ascending' | 'descending';
};

const ReportsPage: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [petOwners, setPetOwners] = useState<PetOwner[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [reportsData, petsData, ownersData, appointmentsData] = await Promise.all([
                    getReports(),
                    getPets(),
                    getPetOwners(),
                    getAppointments(),
                ]);
                setReports(reportsData);
                setPets(petsData);
                setPetOwners(ownersData);
                setAppointments(appointmentsData);
            } catch (error) {
                console.error("Failed to load reports data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredPets = useMemo(() => {
        if (!user) return [];

        switch (user.role) {
            case 'Pet Parent':
                const owner = petOwners.find(o => o.name === user.name);
                return owner ? pets.filter(p => p.ownerId === owner.id) : [];
            case 'Veterinarian':
                const vetAppointments = appointments.filter(a => a.vet.id === user.id);
                const patientIds = new Set(vetAppointments.map(a => a.pet.id));
                return pets.filter(p => patientIds.has(p.id));
            case 'Clinic Admin':
                // Assuming clinic admin belongs to clinic 'c1' for this mock-up
                const clinicOwnerIds = new Set(petOwners.filter(o => o.clinicId === 'c1').map(o => o.id));
                return pets.filter(p => clinicOwnerIds.has(p.ownerId));
            case 'Admin':
                return pets;
            default:
                return [];
        }
    }, [user, pets, petOwners, appointments]);
    
    const sortedPets = useMemo(() => {
        let sortableItems = [...filteredPets];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredPets, sortConfig]);

    const requestSort = (key: keyof Pet) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getReportsForPet = (petId: string, type: Report['type']) => {
        return reports.filter(r => r.petId === petId && r.type === type);
    };
    
    const getOwnerForPet = (ownerId: string) => {
        return petOwners.find(o => o.id === ownerId);
    };

    if (isLoading) {
        return (
            <PageWrapper title="Reports">
                <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
            </PageWrapper>
        );
    }
    
    return (
        <PageWrapper title="Reports">
            <Card className="!p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('id')}>Pet ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>Pet Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet Parent ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PawScan</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PawCam</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultations</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescriptions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedPets.map(pet => (
                                <tr key={pet.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pet.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pet.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getOwnerForPet(pet.ownerId)?.id || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {getReportsForPet(pet.id, 'PawScan').map(r => (
                                            <div key={r.id} title={(r as any).summary}>{r.id} ({new Date(r.date).toLocaleDateString()})</div>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {getReportsForPet(pet.id, 'PawCam').map(r => (
                                            <div key={r.id} title={(r as any).summary}>{r.id} ({new Date(r.date).toLocaleDateString()})</div>
                                        ))}
                                    </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {getReportsForPet(pet.id, 'Consultation').map(r => (
                                            <div key={r.id} title={(r as any).summary}>Ref: {r.id} ({new Date(r.date).toLocaleDateString()})</div>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {getReportsForPet(pet.id, 'Prescription').map(r => {
                                            const report = r as PrescriptionReport;
                                            const summary = report.medications.map(m => m.medication).join(', ');
                                            return (
                                                <div key={r.id} title={summary}>Ref: {r.id} ({new Date(r.date).toLocaleDateString()})</div>
                                            )
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {sortedPets.length === 0 && (
                        <p className="text-center text-gray-500 py-10">No reports found for your access level.</p>
                    )}
                </div>
            </Card>
        </PageWrapper>
    );
};

export default ReportsPage;