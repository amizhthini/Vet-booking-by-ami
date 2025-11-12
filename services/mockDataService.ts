
import { VETS, PETS, APPOINTMENTS } from '../constants';
import type { Vet, Pet, Appointment, SoapNote } from '../types';

const LS_VETS_KEY = 'vetsync_vets';
const LS_PETS_KEY = 'vetsync_pets';
const LS_APPOINTMENTS_KEY = 'vetsync_appointments';

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


const mockApiCall = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 500));
}

// Vets
export const getVets = (): Promise<Vet[]> => {
    const vets = initializeData<Vet>(LS_VETS_KEY, VETS);
    return mockApiCall(vets);
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

export const saveSoapNoteForAppointment = (appointmentId: string, notes: SoapNote): Promise<Appointment> => {
    const appointments = initializeData<Appointment>(LS_APPOINTMENTS_KEY, []);
    let updatedAppointment: Appointment | undefined;
    const updatedAppointments = appointments.map(appt => {
        if (appt.id === appointmentId) {
            updatedAppointment = { ...appt, notes, status: 'Completed' };
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
