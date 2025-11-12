export enum Page {
    Dashboard = 'Dashboard',
    Vets = 'Vets & Clinics',
    Appointments = 'Appointments',
    MyPets = 'My Pets',
    Consultation = 'Consultation',
    PetProfile = 'Pet Profile',
    Reports = 'Reports',
    DocManagement = 'Document Management',
    Referrals = 'Referrals',
    
    // Vet Pages
    VetAppointments = 'My Appointments',
    Patients = 'Patients',
    WebsiteManagement = 'My Website',

    // Clinic Pages
    ScheduleManagement = 'Schedule Management',
    PatientRecords = 'Patient Records',
    VetProfile = 'Vet Profile',
    ClinicProfile = 'Clinic Profile',

    // Admin Pages
    VetManagement = 'Vet Management',
    ClinicManagement = 'Clinic Management',
    UserManagement = 'User Management',

    // New Modules
    Templates = 'Templates',
    Financials = 'Financials',
    StaffManagement = 'Staff Management',
    MasterData = 'Master Data',
    Settings = 'Settings',
}

export type Role = 'Pet Parent' | 'Veterinarian' | 'Clinic Admin' | 'Admin';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export enum ConsultationType {
    Virtual = 'Virtual',
    InPerson = 'In-Person',
    Call = 'Call',
    Mobile = 'Mobile Visit'
}

export interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    type: 'appointment' | 'blocked';
}

export interface TimeSlot {
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
}

export type WeeklyAvailability = {
    [day in 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday']?: TimeSlot[];
};

export interface ConsultationService {
    name: string;
    basePrice: number;
    type: ConsultationType;
}

export interface Vet {
    id: string;
    name: string;
    specialty: string;
    clinicId?: string;
    clinicName?: string;
    location: string;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    basePrice?: number;
    services?: ConsultationService[];
    schedule?: CalendarEvent[];
    weeklyAvailability?: WeeklyAvailability;
}

export interface Clinic {
    id: string;
    name: string;
    address: string;
    vets: Vet[];
}

export interface HealthRecord {
    vaccinations: string[];
    allergies: string[];
    medications: string[];
}

export interface PetOwner {
    id: string;
    name: string;
    clinicId: string;
}

export interface Pet {
    id: string;
    name: string;
    breed: string;
    age: number;
    imageUrl: string;
    ownerId: string;
    healthRecord: HealthRecord;
}

export interface FollowUp {
    date: string; // YYYY-MM-DD
    time: string; // HH:mm AM/PM
    reason: string;
    referredVetName?: string;
}

export interface SoapNote {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    followUp?: FollowUp;
}

export interface Prescription {
    medication: string;
    dosage: string;
    frequency: string;
}

export interface Attachment {
    name: string;
    type: 'image' | 'video' | 'record';
    url: string; // data URL for preview
}

export interface Appointment {
    id: string;
    pet: Pet;
    vet: Vet;
    type: ConsultationType;
    date: string;
    time: string;
    status: 'Upcoming' | 'Completed' | 'Cancelled' | 'Pending';
    service?: string;
    price?: number;
    notes?: SoapNote;
    userNotes?: string;
    attachments?: Attachment[];
    prescriptions?: Prescription[];
}

export interface Notification {
    id: string;
    message: string;
    date: string; // ISO string
    isRead: boolean;
    userId: string;
}

export interface Referral {
    id: string;
    pet: Pet;
    fromVet: Vet;
    toVet: Vet;
    appointmentId: string; // ID of the original appointment
    notes: string;
    date: string; // ISO string
    status: 'Pending' | 'Booked';
}


// Reports
export interface BaseReport {
  id: string; // Reference number
  petId: string;
  date: string; // ISO string for timestamp
}

export interface PawScanReport extends BaseReport {
  type: 'PawScan';
  summary: string;
  dataUrl: string; // Link to the detailed report/scan image
}

export interface PawCamReport extends BaseReport {
  type: 'PawCam';
  summary: string;
  videoUrl: string; // Link to the video
}

export interface ConsultationReport {
  id: string; // appointmentId
  petId: string;
  date: string; // appointment date and time
  type: 'Consultation';
  vetName: string;
  summary: string;
}

export interface PrescriptionReport extends BaseReport {
    type: 'Prescription';
    medications: Prescription[];
    vetName: string;
}

export type Report = PawScanReport | PawCamReport | ConsultationReport | PrescriptionReport;
