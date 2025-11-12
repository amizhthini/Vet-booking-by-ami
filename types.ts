export enum Page {
    Dashboard = 'Dashboard',
    Vets = 'Vets & Clinics',
    Appointments = 'Appointments',
    MyPets = 'My Pets',
    Consultation = 'Consultation',
    
    // Vet Pages
    Schedule = 'Schedule',
    Patients = 'Patients',

    // Clinic Pages
    ScheduleManagement = 'Schedule Management',
    PatientRecords = 'Patient Records',

    // Admin Pages
    VetManagement = 'Vet Management',
    ClinicManagement = 'Clinic Management',
    UserManagement = 'User Management',
}

export type Role = 'Pet Parent' | 'Veterinarian' | 'Clinic Admin' | 'Admin';

export interface User {
  name: string;
  role: Role;
}

export enum ConsultationType {
    Virtual = 'Virtual',
    InPerson = 'In-Person',
    Call = 'Call',
    Mobile = 'Mobile Visit'
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
}

export interface Clinic {
    id: string;
    name: string;
    address: string;
    vets: Vet[];
}

export interface Pet {
    id: string;
    name: string;
    breed: string;
    age: number;
    imageUrl: string;
}

export interface SoapNote {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

export interface Appointment {
    id: string;
    pet: Pet;
    vet: Vet;
    type: ConsultationType;
    date: string;
    time: string;
    status: 'Upcoming' | 'Completed' | 'Cancelled';
    notes?: SoapNote;
}