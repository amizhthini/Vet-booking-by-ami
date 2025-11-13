
import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import type { Appointment, Vet, Pet, PetOwner } from '../types';
import { Page, ConsultationType } from '../types';
import { getAppointments, getVets, getPets, getPetOwners } from '../services/mockDataService';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

// --- Reusable Chart & Stat Components ---

const StatCard: React.FC<{ title: string; value: string | number; change?: string; }> = ({ title, value, change }) => (
    <Card>
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        {change && <p className="text-sm text-gray-500 mt-1">{change}</p>}
    </Card>
);

const BarChart: React.FC<{ title: string; data: { label: string; value: number }[] }> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="space-y-2">
                {data.map(item => (
                    <div key={item.label} className="flex items-center">
                        <span className="text-sm text-gray-600 w-28 truncate">{item.label}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 mr-2">
                            <div
                                className="bg-teal-500 h-4 rounded-full"
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{item.value}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const PieChart: React.FC<{ title: string; data: { label: string; value: number }[] }> = ({ title, data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    const colors = ['#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#a7f3d0', '#d1fae5'];
    let cumulativePercent = 0;

    const gradients = data.map((item, index) => {
        const percent = (item.value / total) * 100;
        const start = cumulativePercent;
        cumulativePercent += percent;
        return `${colors[index % colors.length]} ${start}% ${cumulativePercent}%`;
    });

    return (
        <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="flex items-center justify-around">
                <div className="w-32 h-32 rounded-full" style={{ background: `conic-gradient(${gradients.join(', ')})` }}></div>
                <div className="text-sm space-y-1">
                    {data.map((item, index) => (
                        <div key={item.label} className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
                            <span>{item.label}: <span className="font-semibold">{item.value}</span></span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

const DataTable: React.FC<{ title: string; headers: string[]; rows: (string | number)[][] }> = ({ title, headers, rows }) => (
    <Card className="!p-0">
        <h3 className="text-lg font-semibold text-gray-800 p-4">{title}</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>{headers.map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{cell}</td>)}</tr>)}
                </tbody>
            </table>
        </div>
    </Card>
);

// --- Main Dashboard Page ---

interface AnalyticsDashboardPageProps {
  navigateTo: (page: Page) => void;
  startConsultation: (appointment: Appointment) => void;
  viewPetProfile: (pet: Pet) => void;
}

const AnalyticsDashboardPage: React.FC<AnalyticsDashboardPageProps> = ({ navigateTo, startConsultation, viewPetProfile }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<{ appointments: Appointment[]; pets: Pet[]; vets: Vet[]; owners: PetOwner[] }>({ appointments: [], pets: [], vets: [], owners: [] });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [appointments, pets, vets, owners] = await Promise.all([
                    getAppointments(),
                    getPets(),
                    getVets(),
                    getPetOwners()
                ]);
                setData({ appointments, pets, vets, owners });
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        if (!user) return { appointments: [], pets: [], vets: [], owners: [] };

        const { appointments, pets, vets, owners } = data;

        if (user.role === 'Clinic Admin') {
            // Assuming clinic 'c1'
            const clinicVets = vets.filter(v => v.clinicId === 'c1');
            const clinicVetIds = new Set(clinicVets.map(v => v.id));
            const clinicAppointments = appointments.filter(a => clinicVetIds.has(a.vet.id));
            const clinicPetIds = new Set(clinicAppointments.map(a => a.pet.id));
            const clinicPets = pets.filter(p => clinicPetIds.has(p.id));
            return { appointments: clinicAppointments, pets: clinicPets, vets: clinicVets, owners };
        }
        if (user.role === 'Veterinarian') {
            const vetAppointments = appointments.filter(a => a.vet.id === user.id);
            const petIds = new Set(vetAppointments.map(a => a.pet.id));
            const vetPets = pets.filter(p => petIds.has(p.id));
            return { appointments: vetAppointments, pets: vetPets, vets: [vets.find(v => v.id === user.id)!], owners };
        }
        if (user.role === 'Pet Parent') {
            const ownerPets = pets.filter(p => p.ownerId === user.id);
            const petIds = new Set(ownerPets.map(p => p.id));
            const ownerAppointments = appointments.filter(a => petIds.has(a.pet.id));
            return { appointments: ownerAppointments, pets: ownerPets, vets, owners: [owners.find(o => o.id === user.id)!] };
        }
        return data; // Admin sees all
    }, [user, data]);


    const renderClinicAdminDashboard = () => {
        const { appointments, pets, vets } = filteredData;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyAppointments = appointments.filter(a => {
            const apptDate = new Date(a.date);
            return apptDate.getMonth() === currentMonth && apptDate.getFullYear() === currentYear;
        });
        
        const monthlyRevenue = monthlyAppointments
            .filter(a => a.status === 'Completed' && a.price)
            .reduce((sum, a) => sum + a.price!, 0);

        const consultationTypes = monthlyAppointments.reduce((acc, a) => {
            acc[a.type] = (acc[a.type] || 0) + 1;
            return acc;
        }, {} as Record<ConsultationType, number>);
        const consultationTypeData = Object.entries(consultationTypes).map(([label, value]) => ({ label, value }));

        const vetPerformance = vets.map(vet => {
            const vetAppts = monthlyAppointments.filter(a => a.vet.id === vet.id);
            const earnings = vetAppts.filter(a => a.status === 'Completed').reduce((sum, a) => sum + (a.price || 0), 0);
            return { name: vet.name, consultations: vetAppts.length, earnings: `$${earnings.toFixed(2)}` };
        }).sort((a,b) => b.consultations - a.consultations);

        const statusCounts = appointments.reduce((acc, a) => {
            acc[a.status] = (acc[a.status] || 0) + 1;
            return acc;
        }, {} as Record<Appointment['status'], number>);
        
        const petSpecies = pets.reduce((acc, p) => {
            acc[p.breed] = (acc[p.breed] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const petSpeciesData = Object.entries(petSpecies).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 5);
        
        // Mocked data for disease stats
        const commonConditionsData = [
            { label: 'Dermatology', value: 42 },
            { label: 'Gastrointestinal', value: 31 },
            { label: 'Arthritis/Mobility', value: 25 },
            { label: 'Dental Issues', value: 18 },
            { label: 'Wellness Check', value: 55 },
        ];
        
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Monthly Consultations" value={monthlyAppointments.length} change="vs last month" />
                    <StatCard title="Monthly Revenue" value={`$${monthlyRevenue.toFixed(2)}`} />
                    <StatCard title="Total Patients" value={pets.length} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BarChart title="Consultation Types (Monthly)" data={consultationTypeData} />
                    <PieChart title="Common Conditions" data={commonConditionsData} />
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <div className="lg:col-span-2">
                        <DataTable title="Vet Performance (Monthly)" headers={['Name', 'Consultations', 'Earnings']} rows={vetPerformance.map(v => [v.name, v.consultations, v.earnings])} />
                     </div>
                     <div className="space-y-4">
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Appointment Status</h3>
                            <div className="flex justify-around text-center">
                                {Object.entries(statusCounts).map(([status, count]) => <div key={status}><p className="text-2xl font-bold">{count}</p><p className="text-sm text-gray-500">{status}</p></div>)}
                            </div>
                        </Card>
                         <PieChart title="Pet Species" data={petSpeciesData} />
                     </div>
                 </div>
            </div>
        )
    }

    const renderVetDashboard = () => {
        const { appointments, pets } = filteredData;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyAppointments = appointments.filter(a => {
            const apptDate = new Date(a.date);
            return apptDate.getMonth() === currentMonth && apptDate.getFullYear() === currentYear;
        });

        const monthlyRevenue = monthlyAppointments
            .filter(a => a.status === 'Completed' && a.price)
            .reduce((sum, a) => sum + a.price!, 0);

        const upcomingAppointments = appointments
            .filter(a => a.status === 'Upcoming' || a.status === 'Pending')
            .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime())
            .slice(0, 5);
        
        const consultationTypes = appointments.reduce((acc, a) => {
            acc[a.type] = (acc[a.type] || 0) + 1;
            return acc;
        }, {} as Record<ConsultationType, number>);
        const consultationTypeData = Object.entries(consultationTypes).map(([label, value]) => ({ label, value }));

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="My Monthly Consultations" value={monthlyAppointments.length} />
                    <StatCard title="My Monthly Earnings" value={`$${monthlyRevenue.toFixed(2)}`} />
                    <StatCard title="My Patients" value={pets.length} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h3>
                                <Button variant="ghost" size="sm" onClick={() => navigateTo(Page.VetAppointments)}>View All</Button>
                            </div>
                            <div className="space-y-2">
                                {upcomingAppointments.length > 0 ? upcomingAppointments.map(a => (
                                    <div key={a.id} className="p-2 bg-gray-50 rounded-md flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{a.pet.name}</p>
                                            <p className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString()} at {a.time}</p>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={() => startConsultation(a)}>Start</Button>
                                    </div>
                                )) : <p className="text-sm text-gray-500 text-center py-4">No upcoming appointments.</p>}
                            </div>
                        </Card>
                    </div>
                    <PieChart title="My Consultation Types" data={consultationTypeData} />
                </div>
            </div>
        );
    };

    const renderPetParentDashboard = () => {
        const { appointments, pets } = filteredData;

        const totalSpent = appointments
            .filter(a => a.status === 'Completed' && a.price)
            .reduce((sum, a) => sum + a.price!, 0);

        const nextAppointment = appointments
            .filter(a => a.status === 'Upcoming' || a.status === 'Pending')
            .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime())[0];
        
        return (
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Appointments" value={appointments.length} />
                    <StatCard title="Total Spent" value={`$${totalSpent.toFixed(2)}`} />
                    <StatCard title="My Pets" value={pets.length} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {nextAppointment ? (
                            <Card>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Next Appointment</h3>
                                <div className="p-4 bg-teal-50 border-l-4 border-teal-500 rounded-r-lg">
                                    <p className="font-bold text-teal-800">{nextAppointment.service} for {nextAppointment.pet.name}</p>
                                    <p className="text-sm text-teal-700">with {nextAppointment.vet.name}</p>
                                    <p className="text-sm text-teal-700">{new Date(nextAppointment.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {nextAppointment.time}</p>
                                    <Button size="sm" className="mt-3" onClick={() => navigateTo(Page.Appointments)}>Manage Appointments</Button>
                                </div>
                            </Card>
                        ) : (
                            <Card>
                                 <div className="text-center py-8">
                                    <p className="text-gray-500">No upcoming appointments.</p>
                                    <Button className="mt-4" onClick={() => navigateTo(Page.Vets)}>Book a Consultation</Button>
                                </div>
                            </Card>
                        )}
                    </div>
                     <Card>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">My Pets</h3>
                        <div className="space-y-2">
                            {pets.map(pet => (
                                <div key={pet.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                                    <div className="flex items-center space-x-2">
                                        <img src={pet.imageUrl} alt={pet.name} className="w-8 h-8 rounded-full" />
                                        <p className="font-semibold">{pet.name}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => viewPetProfile(pet)}>View</Button>
                                </div>
                            ))}
                             <Button variant="secondary" className="w-full mt-2" onClick={() => navigateTo(Page.MyPets)}>Manage Pets</Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    const renderDashboardByRole = () => {
        switch (user?.role) {
            case 'Clinic Admin': return renderClinicAdminDashboard();
            case 'Veterinarian': return renderVetDashboard();
            case 'Pet Parent': return renderPetParentDashboard();
            default: return <p>No dashboard available for this role.</p>;
        }
    };

    return (
        <PageWrapper title="Dashboard">
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                </div>
            ) : (
                renderDashboardByRole()
            )}
        </PageWrapper>
    );
};

export default AnalyticsDashboardPage;
