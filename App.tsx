
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
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
import VetAppointmentsPage from './pages/VetAppointmentsPage';
import ClinicSchedulePage from './pages/ClinicSchedulePage';
import ReportsPage from './pages/ReportsPage';
import DocManagementPage from './pages/DocManagementPage';
import ReferralsPage from './pages/ReferralsPage';
import MyPetsPage from './pages/MyPetsPage';
import TemplatesPage from './pages/TemplatesPage';
import FinancialsPage from './pages/FinancialsPage';
import StaffManagementPage from './pages/StaffManagementPage';
import MasterDataPage from './pages/MasterDataPage';
import SettingsPage from './pages/SettingsPage';
import ClinicProfilePage from './pages/ClinicProfilePage';
import VetLandingPage from './pages/VetLandingPage';
import ClinicLandingPage from './pages/ClinicLandingPage';
import WebsiteManagementPage from './pages/WebsiteManagementPage';
import RoleManagementPage from './pages/RoleManagementPage';
import type { Appointment, Pet, Vet } from './types';
import { Page, Role } from './types';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { getVets, getAppointments } from './services/mockDataService';
import AppointmentNotifier from './components/AppointmentNotifier';
import AppointmentStartModal from './components/AppointmentStartModal';
import Toast from './components/ui/Toast';


const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [activeVet, setActiveVet] = useState<Vet | null>(null);
  const [loggedInVet, setLoggedInVet] = useState<Vet | null>(null);
  const [externalPage, setExternalPage] = useState<{ type: 'vet' | 'clinic', id: string } | null>(null);
  
  // State for global notifications
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [toastInfo, setToastInfo] = useState<{ id: number, message: string; type: 'success' | 'error' } | null>(null);
  const [modalAppointment, setModalAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    // Use hash-based routing for public pages to prevent 404s on direct navigation.
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const view = params.get('view');
    const id = params.get('id');
    if ((view === 'vet' || view === 'clinic') && id) {
        setExternalPage({ type: view, id });
    }
  }, []);
  
  useEffect(() => {
    if (user) {
        getAppointments().then(setAllAppointments).catch(console.error);
        
        if (user.role === 'Veterinarian' && user.id) {
            getVets().then(vets => {
                const currentVet = vets.find(v => v.id === user.id);
                setLoggedInVet(currentVet || null);
            });
        }
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

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToastInfo({ id: Date.now(), message, type });
  }, []);

  const showStartModal = useCallback((appointment: Appointment) => {
    setModalAppointment(appointment);
  }, []);
  
  const handleJoinConsultation = useCallback(() => {
    if (modalAppointment) {
      startConsultation(modalAppointment);
      setModalAppointment(null);
    }
  }, [modalAppointment, startConsultation]);

  const exitExternalView = useCallback((redirectTo: Page = Page.Dashboard) => {
    setExternalPage(null);
    setCurrentPage(redirectTo);
    // Clear the hash from the URL without reloading
    window.history.pushState("", document.title, window.location.pathname + window.location.search);
  }, []);

  const viewPublicPage = useCallback((type: 'vet' | 'clinic', id: string) => {
    setExternalPage({ type, id });
  }, []);

  if (externalPage) {
    if (externalPage.type === 'vet') {
        return <VetLandingPage vetId={externalPage.id} onExit={user ? exitExternalView : undefined} />;
    }
    if (externalPage.type === 'clinic') {
        return <ClinicLandingPage clinicId={externalPage.id} onExit={user ? exitExternalView : undefined} />;
    }
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      // Pet Parent Pages
      case Page.Dashboard:
        return <AnalyticsDashboardPage navigateTo={navigateTo} startConsultation={startConsultation} viewPetProfile={viewPetProfile} />;
      case Page.Vets:
        return <VetsPage navigateTo={navigateTo} />;
      case Page.Appointments:
        return <AppointmentsPage startConsultation={startConsultation} />;
      case Page.MyPets:
        return <MyPetsPage navigateTo={navigateTo} />;
      case Page.Consultation:
        return activeAppointment ? <ConsultationPage appointment={activeAppointment} navigateTo={navigateTo} /> : <AnalyticsDashboardPage navigateTo={navigateTo} startConsultation={startConsultation} viewPetProfile={viewPetProfile} />;
      
      // All-role pages
      case Page.Reports:
        return <ReportsPage />;
      case Page.DocManagement:
        return <DocManagementPage />;
      case Page.Referrals:
        return <ReferralsPage navigateTo={navigateTo} />;
      case Page.Financials:
        return <FinancialsPage />;
      case Page.Settings:
        return <SettingsPage />;
      case Page.RoleManagement:
        return <RoleManagementPage />;

      // Clinic Admin Pages
      case Page.PatientRecords:
        return <PatientRecordsPage viewPetProfile={viewPetProfile} />;
      case Page.PetProfile:
        return activePet ? <PetProfilePage pet={activePet} navigateTo={navigateTo} startConsultation={startConsultation} /> : <PatientRecordsPage viewPetProfile={viewPetProfile} />;
      case Page.VetManagement:
        return <VetManagementPage viewVetProfile={viewVetProfile} />;
      case Page.VetProfile:
        return activeVet ? <VetProfilePage vet={activeVet} navigateTo={navigateTo} /> : <VetManagementPage viewVetProfile={viewVetProfile} />;
      case Page.ClinicProfile:
        return <ClinicProfilePage onViewPublicPage={viewPublicPage} />;
      
      // Vet Pages
      case Page.VetAppointments:
        return loggedInVet ? <VetAppointmentsPage vet={loggedInVet} startConsultation={startConsultation} /> : <PlaceholderPage title="Loading Appointments..." />;
      case Page.Patients:
        return loggedInVet ? <VetPatientsPage vet={loggedInVet} viewPetProfile={viewPetProfile} /> : <PlaceholderPage title="Loading Patients..." />;
      case Page.Templates:
        return <TemplatesPage />;
      case Page.WebsiteManagement:
        return loggedInVet ? <WebsiteManagementPage vet={loggedInVet} onViewPublicPage={viewPublicPage} /> : <PlaceholderPage title="Loading Website..." />;
      case Page.StaffManagement:
        return <StaffManagementPage />;
      case Page.MasterData:
        return <MasterDataPage />;


      // Clinic Admin Page
      case Page.ScheduleManagement:
        return <ClinicSchedulePage />;

      // Other placeholders
      case Page.ClinicManagement:
      case Page.UserManagement:
        return <PlaceholderPage title={currentPage} />;

      default:
        return <AnalyticsDashboardPage navigateTo={navigateTo} startConsultation={startConsultation} viewPetProfile={viewPetProfile} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} navigateTo={navigateTo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header viewVetProfile={viewVetProfile} loggedInVet={loggedInVet} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
      <AppointmentNotifier
        appointments={allAppointments}
        onShowToast={showToast}
        onShowStartModal={showStartModal}
      />
      {toastInfo && <Toast key={toastInfo.id} message={toastInfo.message} type={toastInfo.type} onClose={() => setToastInfo(null)} />}
      <AppointmentStartModal
        isOpen={!!modalAppointment}
        appointment={modalAppointment}
        onClose={() => setModalAppointment(null)}
        onJoin={handleJoinConsultation}
      />
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
