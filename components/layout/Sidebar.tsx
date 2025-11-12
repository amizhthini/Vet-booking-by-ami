import React from 'react';
import { Page, Role } from '../../types';
import { 
    DashboardIcon, VetsIcon, CalendarIcon, PetIcon, UsersIcon, 
    BuildingOfficeIcon, FolderOpenIcon, ClockIcon, DocumentChartBarIcon, 
    DocumentPlusIcon, ArrowRightCircleIcon, TemplateIcon, CurrencyDollarIcon, 
    UsersGroupIcon, DatabaseIcon, CogIcon 
} from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { ArrowTopRightOnSquareIcon } from '../../constants';

interface SidebarProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

const NavItem: React.FC<{
  page: Page;
  currentPage: Page;
  navigateTo: (page: Page) => void;
  icon: React.ReactNode;
}> = ({ page, currentPage, navigateTo, icon }) => {
  const isActive = currentPage === page;
  return (
    <li
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-teal-500 text-white shadow-lg'
          : 'text-gray-600 hover:bg-teal-50 hover:text-teal-600'
      }`}
      onClick={() => navigateTo(page)}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="w-6 h-6 mr-3">{icon}</span>
      <span className="font-medium">{page}</span>
    </li>
  );
};

const PetParentNav: React.FC<SidebarProps> = (props) => (
  <ul>
    <NavItem page={Page.Dashboard} {...props} icon={<DashboardIcon />} />
    <NavItem page={Page.Vets} {...props} icon={<VetsIcon />} />
    <NavItem page={Page.Appointments} {...props} icon={<CalendarIcon />} />
    <NavItem page={Page.MyPets} {...props} icon={<PetIcon />} />
    <NavItem page={Page.Referrals} {...props} icon={<ArrowRightCircleIcon />} />
    <NavItem page={Page.Reports} {...props} icon={<DocumentChartBarIcon />} />
    <NavItem page={Page.DocManagement} {...props} icon={<DocumentPlusIcon />} />
    <NavItem page={Page.Financials} {...props} icon={<CurrencyDollarIcon />} />
    <NavItem page={Page.Settings} {...props} icon={<CogIcon />} />
  </ul>
);

const VetNav: React.FC<SidebarProps> = (props) => (
  <ul>
    <NavItem page={Page.Dashboard} {...props} icon={<DashboardIcon />} />
    <NavItem page={Page.VetAppointments} {...props} icon={<CalendarIcon />} />
    <NavItem page={Page.Patients} {...props} icon={<PetIcon />} />
    <NavItem page={Page.Website} {...props} icon={<ArrowTopRightOnSquareIcon />} />
    <NavItem page={Page.Referrals} {...props} icon={<ArrowRightCircleIcon />} />
    <NavItem page={Page.Reports} {...props} icon={<DocumentChartBarIcon />} />
    <NavItem page={Page.DocManagement} {...props} icon={<DocumentPlusIcon />} />
    <NavItem page={Page.Templates} {...props} icon={<TemplateIcon />} />
    <NavItem page={Page.Financials} {...props} icon={<CurrencyDollarIcon />} />
    <NavItem page={Page.Settings} {...props} icon={<CogIcon />} />
  </ul>
);

const ClinicNav: React.FC<SidebarProps> = (props) => (
    <ul>
      <NavItem page={Page.Dashboard} {...props} icon={<DashboardIcon />} />
      <NavItem page={Page.ScheduleManagement} {...props} icon={<ClockIcon />} />
      <NavItem page={Page.PatientRecords} {...props} icon={<FolderOpenIcon />} />
      <NavItem page={Page.VetManagement} {...props} icon={<VetsIcon />} />
      <NavItem page={Page.ClinicProfile} {...props} icon={<BuildingOfficeIcon />} />
      <NavItem page={Page.StaffManagement} {...props} icon={<UsersGroupIcon />} />
      <NavItem page={Page.Referrals} {...props} icon={<ArrowRightCircleIcon />} />
      <NavItem page={Page.Reports} {...props} icon={<DocumentChartBarIcon />} />
      <NavItem page={Page.DocManagement} {...props} icon={<DocumentPlusIcon />} />
      <NavItem page={Page.Templates} {...props} icon={<TemplateIcon />} />
      <NavItem page={Page.Financials} {...props} icon={<CurrencyDollarIcon />} />
      <NavItem page={Page.MasterData} {...props} icon={<DatabaseIcon />} />
      <NavItem page={Page.Settings} {...props} icon={<CogIcon />} />
    </ul>
);

const AdminNav: React.FC<SidebarProps> = (props) => (
    <ul>
      <NavItem page={Page.Dashboard} {...props} icon={<DashboardIcon />} />
      <NavItem page={Page.VetManagement} {...props} icon={<VetsIcon />} />
      <NavItem page={Page.ClinicManagement} {...props} icon={<BuildingOfficeIcon />} />
      <NavItem page={Page.UserManagement} {...props} icon={<UsersIcon />} />
       <NavItem page={Page.Reports} {...props} icon={<DocumentChartBarIcon />} />
    </ul>
);


const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigateTo }) => {
  const { user } = useAuth();
  
  const renderNav = () => {
    const props = { currentPage, navigateTo };
    switch (user?.role) {
        case 'Pet Parent':
            return <PetParentNav {...props} />;
        case 'Veterinarian':
            return <VetNav {...props} />;
        case 'Clinic Admin':
            return <ClinicNav {...props} />;
        case 'Admin':
            return <AdminNav {...props} />;
        default:
            return null;
    }
  }

  return (
    <aside className="w-64 bg-white shadow-lg h-full p-4 flex-col hidden sm:flex" aria-label="Sidebar">
      <div className="flex items-center mb-8">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0v-.5a1 1 0 00-1-1H6a1 1 0 01-1-1v-3a1 1 0 011-1h.5a1.5 1.5 0 000-3H6a1 1 0 01-1-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800 ml-2">VetSync AI</h1>
      </div>
      <nav>
        {renderNav()}
      </nav>
      <div className="mt-auto">
        <div className="p-4 bg-teal-50 rounded-lg text-center">
            <h3 className="font-semibold text-teal-800">Need Help?</h3>
            <p className="text-sm text-teal-700 mt-1">Contact our 24/7 support team.</p>
            <button className="mt-3 w-full bg-teal-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors">
                Contact Support
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;