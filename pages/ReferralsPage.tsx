import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { useAuth } from '../hooks/useAuth';
// FIX: 'Page' was imported as a type but is used as a value. Changed to a value import.
import { Page } from '../types';
import type { Referral, Pet, Vet, Appointment } from '../types';
import { getReferrals, getPets, getVets, getAppointments, updateReferral } from '../services/mockDataService';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import CreateReferralModal from '../components/CreateReferralModal';
import ReferralCard from '../components/ReferralCard';
import BookingModal from '../components/BookingModal';

interface ReferralsPageProps {
    navigateTo: (page: Page) => void;
}

const ReferralsPage: React.FC<ReferralsPageProps> = ({ navigateTo }) => {
    const { user } = useAuth();
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [vets, setVets] = useState<Vet[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [referralToBook, setReferralToBook] = useState<Referral | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [referralsData, petsData, vetsData, appointmentsData] = await Promise.all([
                getReferrals(),
                getPets(),
                getVets(),
                getAppointments()
            ]);
            setReferrals(referralsData);
            setPets(petsData);
            setVets(vetsData);
            setAppointments(appointmentsData);
        } catch (error) {
            console.error("Failed to load referrals data:", error);
            setToast({ message: 'Failed to load data.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const userReferrals = useMemo(() => {
        if (!user) return [];
        if (user.role === 'Pet Parent') {
            const userPetIds = pets.filter(p => p.ownerId === user.id).map(p => p.id);
            return referrals.filter(r => userPetIds.includes(r.pet.id));
        }
        if (user.role === 'Veterinarian') {
            return referrals.filter(r => r.fromVet.id === user.id || r.toVet.id === user.id);
        }
        if (user.role === 'Clinic Admin') {
            // Assuming admin for clinic c1
            const clinicVetIds = vets.filter(v => v.clinicId === 'c1').map(v => v.id);
            return referrals.filter(r => clinicVetIds.includes(r.fromVet.id) || clinicVetIds.includes(r.toVet.id));
        }
        return referrals;
    }, [user, referrals, pets, vets]);

    const handleCreateComplete = (result: { success: boolean, data?: Referral, error?: string }) => {
        if (result.success) {
            setToast({ message: 'Referral created successfully!', type: 'success' });
            fetchData();
        } else {
            setToast({ message: result.error || 'Failed to create referral.', type: 'error' });
        }
    };

    const handleBookAppointment = (referral: Referral) => {
        setReferralToBook(referral);
        setIsBookingModalOpen(true);
    };

    const handleBookingComplete = async (result: { success: boolean, data?: Appointment, error?: string }) => {
        if (result.success && referralToBook) {
            setToast({ message: 'Appointment booked successfully!', type: 'success' });
            try {
                await updateReferral(referralToBook.id, { status: 'Booked' });
                fetchData();
            } catch (error) {
                console.error("Failed to update referral status:", error);
            }
            setTimeout(() => navigateTo(Page.Appointments), 1500);
        } else {
            setToast({ message: result.error || 'Failed to book appointment.', type: 'error' });
        }
    };


    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
        }

        if (user?.role === 'Pet Parent') {
            return userReferrals.length > 0 ? (
                <div className="space-y-4">
                    {userReferrals.map(ref => (
                        <ReferralCard key={ref.id} referral={ref} onBook={handleBookAppointment} />
                    ))}
                </div>
            ) : <Card><p className="text-center text-gray-500 py-10">You have no referrals.</p></Card>;
        }
        
        // Vet & Clinic Admin View
        return (
            <Card className="!p-0">
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {userReferrals.map(ref => (
                                <tr key={ref.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ref.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ref.pet.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ref.fromVet.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ref.toVet.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ref.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                            {ref.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {userReferrals.length === 0 && <p className="text-center text-gray-500 py-10">No referrals found.</p>}
                </div>
            </Card>
        )
    };

    return (
        <PageWrapper title="Referrals">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {(user?.role === 'Veterinarian' || user?.role === 'Clinic Admin') && (
                <div className="flex justify-end mb-4">
                    <Button onClick={() => setIsCreateModalOpen(true)}>Create New Referral</Button>
                </div>
            )}
            
            {renderContent()}

            <CreateReferralModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onComplete={handleCreateComplete}
                pets={pets}
                vets={vets}
                appointments={appointments}
                loggedInUser={user}
            />

            {referralToBook && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    onComplete={handleBookingComplete}
                    mode="book"
                    vet={referralToBook.toVet}
                />
            )}
        </PageWrapper>
    );
};

export default ReferralsPage;