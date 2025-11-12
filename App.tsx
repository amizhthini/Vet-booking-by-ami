import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import VetsPage from './pages/VetsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ConsultationPage from './pages/ConsultationPage';
import LoginPage from './pages/LoginPage';
import PlaceholderPage from './pages/PlaceholderPage';
import PatientRecordsPage from './pages/PatientRecordsPage';
import PetProfilePage from './pages/PetProfilePage';
import VetManagementPage from './pages/VetManagementPage';
import VetProfilePage from './pages/VetProfilePage';
import ScheduleManagementPage from './pages/ScheduleManagementPage';
import VetPatientsPage from './pages/VetPatientsPage';
import ClinicSchedulePage from './pages/ClinicSchedulePage';
import type { Appointment, Pet, Vet } from './types';
import { Page, Role } from './types';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { getVets } from './services/mockDataService';


const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [activeVet, setActiveVet] = useState<Vet | null>(null);
  const [loggedInVet, setLoggedInVet] = useState<Vet | null>(null);

  useEffect(() => {
    if (user?.role === 'Veterinarian' && user.id) {
        getVets().then(vets => {
            const currentVet = vets.find(v => v.id === user.id);
            setLoggedInVet(currentVet || null);
        });
    }
  }, [user]);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };
  
  const startConsultation = useCallback((appointment: Appointment) => {
    setActiveAppointment(appointment);
    setCurrentPage(Page.Consultation);
  }, []);

  const viewPetProfile = useCallback((pet: Pet) => {
    setActivePet(pet);
    setCurrentPage(Page.PetProfile);
  }, []);

  const viewVetProfile = useCallback((vet: Vet) => {
    setActiveVet(vet);
    setCurrentPage(Page.VetProfile);
  }, []);

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      // Pet Parent Pages
      case Page.Dashboard:
        return <DashboardPage navigateTo={navigateTo} startConsultation={startConsultation} />;
      case Page.Vets:
        return <VetsPage navigateTo={navigateTo} />;
      case Page.Appointments:
        return <AppointmentsPage startConsultation={startConsultation} />;
      case Page.Consultation:
        return activeAppointment ? <ConsultationPage appointment={activeAppointment} navigateTo={navigateTo} /> : <DashboardPage navigateTo={navigateTo} startConsultation={startConsultation}/>;
      
      // Clinic Admin Pages
      case Page.PatientRecords:
        return <PatientRecordsPage viewPetProfile={viewPetProfile} />;
      case Page.PetProfile:
        return activePet ? <PetProfilePage pet={activePet} navigateTo={navigateTo} /> : <PatientRecordsPage viewPetProfile={viewPetProfile} />;
      case Page.VetManagement:
        return <VetManagementPage viewVetProfile={viewVetProfile} />;
      case Page.VetProfile:
        return activeVet ? <VetProfilePage vet={activeVet} navigateTo={navigateTo} /> : <VetManagementPage viewVetProfile={viewVetProfile} />;
      
      // Vet Pages
      case Page.Schedule:
        return loggedInVet ? <ScheduleManagementPage vet={loggedInVet} /> : <PlaceholderPage title="Loading Schedule..." />;
      case Page.Patients:
        return loggedInVet ? <VetPatientsPage vet={loggedInVet} viewPetProfile={viewPetProfile} /> : <PlaceholderPage title="Loading Patients..." />;

      // Clinic Admin Page
      case Page.ScheduleManagement:
        return <ClinicSchedulePage />;

      // Other placeholders
      case Page.ClinicManagement:
      case Page.UserManagement:
      case Page.MyPets:
        return <PlaceholderPage title={currentPage} />;

      default:
        return <DashboardPage navigateTo={navigateTo} startConsultation={startConsultation}/>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} navigateTo={navigateTo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;