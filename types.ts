export enum Page {
    Dashboard = 'Dashboard',
    Vets = 'Vets & Clinics',
    Appointments = 'Appointments',
    MyPets = 'My Pets',
    Consultation = 'Consultation',
    PetProfile = 'Pet Profile',
    
    // Vet Pages
    Schedule = 'Schedule',
    Patients = 'Patients',

    // Clinic Pages
    ScheduleManagement = 'Schedule Management',
    PatientRecords = 'Patient Records',
    VetProfile = 'Vet Profile',

    // Admin Pages
    VetManagement = 'Vet Management',
    ClinicManagement = 'Clinic Management',
    UserManagement = 'User Management',
}

export type Role = 'Pet Parent' | 'Veterinarian' | 'Clinic Admin' | 'Admin';

export interface User {
  id?: string;
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

export interface SoapNote {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

export interface Prescription {
    medication: string;
    dosage: string;
    frequency: string;
}

export interface FollowUp {
    date: string; // YYYY-MM-DD
    reason: string;
}

export interface Attachment {
    name: string;
    type: 'image' | 'video';
    url: string; // data URL for preview
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
    userNotes?: string;
    attachments?: Attachment[];
    prescriptions?: Prescription[];
    followUp?: FollowUp;
}