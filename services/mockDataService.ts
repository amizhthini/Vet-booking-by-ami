import { VETS, PETS, APPOINTMENTS, PET_OWNERS, REPORTS } from '../constants';
import type { Vet, Pet, Appointment, SoapNote, PetOwner, WeeklyAvailability, Report, PrescriptionReport } from '../types';

const LS_VETS_KEY = 'vetsync_vets';
const LS_PETS_KEY = 'vetsync_pets';
const LS_APPOINTMENTS_KEY = 'vetsync_appointments';
const LS_PET_OWNERS_KEY = 'vetsync_pet_owners';
const LS_REPORTS_KEY = 'vetsync_reports';

const initializeData = <T,>(key: string, defaultData: T[]): T[] => {
  try {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
  }
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

// Initialize with mock data if not present
initializeData<Vet>(LS_VETS_KEY, VETS);
initializeData<Pet>(LS_PETS_KEY, PETS);
initializeData<Appointment>(LS_APPOINTMENTS_KEY, APPOINTMENTS);
initializeData<PetOwner>(LS_PET_OWNERS_KEY, PET_OWNERS);
initializeData<Report>(LS_REPORTS_KEY, REPORTS);


const mockApiCall = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 500));
}

// Vets
export const getVets = (): Promise<Vet[]> => {
    const vets = initializeData<Vet>(LS_VETS_KEY, VETS);
    return mockApiCall(vets);
}

export const updateVet = (vetId: string, updatedData: { weeklyAvailability: WeeklyAvailability }): Promise<Vet> => {
    const vets = initializeData<Vet>(LS_VETS_KEY, []);
    let updatedVet: Vet | undefined;
    const updatedVets = vets.map(vet => {
        if (vet.id === vetId) {
            updatedVet = { ...vet, ...updatedData };
            return updatedVet;
        }
        return vet;
    });
    
    if (updatedVet) {
        localStorage.setItem(LS_VETS_KEY, JSON.stringify(updatedVets));
        return mockApiCall(updatedVet);
    } else {
        return Promise.reject(new Error("Vet not found"));
    }
}


// Pet Owners
export const getPetOwners = (): Promise<PetOwner[]> => {
    const owners = initializeData<PetOwner>(LS_PET_OWNERS_KEY, PET_OWNERS);
    return mockApiCall(owners);
}

// Pets
export const getPets = (): Promise<Pet[]> => {
    const pets = initializeData<Pet>(LS_PETS_KEY, PETS);
    return mockApiCall(pets);
}

// Appointments
export const getAppointments = (): Promise<Appointment[]> => {
    const appointments = initializeData<Appointment>(LS_APPOINTMENTS_KEY, APPOINTMENTS);
    return mockApiCall(appointments);
}

export const saveAppointment = (appointment: Omit<Appointment, 'id' | 'status'>): Promise<Appointment> => {
    const appointments = initializeData<Appointment>(LS_APPOINTMENTS_KEY, []);
    const newAppointment: Appointment = {
        ...appointment,
        id: `a${Date.now()}`,
        status: 'Upcoming',
    };
    const updatedAppointments = [...appointments, newAppointment];
    localStorage.setItem(LS_APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
    return mockApiCall(newAppointment);
}

export const updateAppointment = (appointmentId: string, updatedData: Partial<Appointment>): Promise<Appointment> => {
    const appointments = initializeData<Appointment>(LS_APPOINTMENTS_KEY, []);
    let updatedAppointment: Appointment | undefined;
    const updatedAppointments = appointments.map(appt => {
        if (appt.id === appointmentId) {
            const dataToUpdate = updatedData.notes 
                ? { ...updatedData, status: 'Completed' as const } 
                : updatedData;
            updatedAppointment = { ...appt, ...dataToUpdate };
            return updatedAppointment;
        }
        return appt;
    });
    
    if (updatedAppointment) {
        localStorage.setItem(LS_APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
        return mockApiCall(updatedAppointment);
    } else {
        return Promise.reject(new Error("Appointment not found"));
    }
}

// Reports
export const getReports = (): Promise<Report[]> => {
    const reports = initializeData<Report>(LS_REPORTS_KEY, REPORTS);
    
    const appointments = initializeData<Appointment>(LS_APPOINTMENTS_KEY, APPOINTMENTS);
    
    // Dynamically generate consultation reports from completed appointments
    const consultationReports: Report[] = appointments
        .filter(a => a.status === 'Completed' && a.notes)
        .map(a => ({
            id: a.id,
            petId: a.pet.id,
            date: `${a.date}T${a.time}`,
            type: 'Consultation',
            vetName: a.vet.name,
            summary: a.notes!.assessment,
        }));

    // Dynamically generate prescription reports
    const prescriptionReports: PrescriptionReport[] = appointments
        .filter(a => a.status === 'Completed' && a.prescriptions && a.prescriptions.length > 0)
        .map(a => ({
            id: `pres-${a.id}`,
            petId: a.pet.id,
            date: `${a.date}T${a.time}`,
            type: 'Prescription',
            medications: a.prescriptions!,
            vetName: a.vet.name,
        }));

    return mockApiCall([...reports, ...consultationReports, ...prescriptionReports]);
}

export const addReport = (report: Omit<Report, 'id'>): Promise<Report> => {
    const reports = initializeData<Report>(LS_REPORTS_KEY, []);
    const newReport: Report = {
        ...report,
        id: `doc-${Date.now()}`,
    } as Report;
    const updatedReports = [...reports, newReport];
    localStorage.setItem(LS_REPORTS_KEY, JSON.stringify(updatedReports));
    return mockApiCall(newReport);
}