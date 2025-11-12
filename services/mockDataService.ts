import { VETS, PETS, APPOINTMENTS, PET_OWNERS, REPORTS, REFERRALS } from '../constants';
import type { Vet, Pet, Appointment, SoapNote, PetOwner, WeeklyAvailability, Report, PrescriptionReport, FollowUp, Notification, User, Referral } from '../types';
import { ConsultationType } from '../types';

const LS_VETS_KEY = 'vetsync_vets';
const LS_PETS_KEY = 'vetsync_pets';
const LS_APPOINTMENTS_KEY = 'vetsync_appointments';
const LS_PET_OWNERS_KEY = 'vetsync_pet_owners';
const LS_REPORTS_KEY = 'vetsync_reports';
const LS_NOTIFICATIONS_KEY = 'vetsync_notifications';
const LS_REFERRALS_KEY = 'vetsync_referrals';


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
initializeData<Notification>(LS_NOTIFICATIONS_KEY, []);
initializeData<Referral>(LS_REFERRALS_KEY, REFERRALS);


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

export const addPetOwner = (owner: Omit<PetOwner, 'id'>): Promise<PetOwner> => {
    const owners = initializeData<PetOwner>(LS_PET_OWNERS_KEY, []);
    const newOwner: PetOwner = {
        ...owner,
        id: `po${Date.now()}`,
    };
    const updatedOwners = [...owners, newOwner];
    localStorage.setItem(LS_PET_OWNERS_KEY, JSON.stringify(updatedOwners));
    return mockApiCall(newOwner);
}


// Pets
export const getPets = (): Promise<Pet[]> => {
    const pets = initializeData<Pet>(LS_PETS_KEY, PETS);
    return mockApiCall(pets);
}

export const addPet = (pet: Omit<Pet, 'id'>): Promise<Pet> => {
    const pets = initializeData<Pet>(LS_PETS_KEY, []);
    const newPet: Pet = {
        ...pet,
        id: `p${Date.now()}`,
    };
    const updatedPets = [...pets, newPet];
    localStorage.setItem(LS_PETS_KEY, JSON.stringify(updatedPets));
    return mockApiCall(newPet);
}

export const updatePet = (petId: string, updatedData: Partial<Omit<Pet, 'id'>>): Promise<Pet> => {
    const pets = initializeData<Pet>(LS_PETS_KEY, []);
    let updatedPet: Pet | undefined;
    const updatedPets = pets.map(pet => {
        if (pet.id === petId) {
            updatedPet = { ...pet, ...updatedData };
            return updatedPet;
        }
        return pet;
    });
    
    if (updatedPet) {
        localStorage.setItem(LS_PETS_KEY, JSON.stringify(updatedPets));
        return mockApiCall(updatedPet);
    } else {
        return Promise.reject(new Error("Pet not found"));
    }
}


// Appointments
export const getAppointments = (): Promise<Appointment[]> => {
    const appointments = initializeData<Appointment>(LS_APPOINTMENTS_KEY, APPOINTMENTS);
    return mockApiCall(appointments);
}

export const saveAppointment = (appointment: Omit<Appointment, 'id' | 'status'>, status: Appointment['status'] = 'Upcoming'): Promise<Appointment> => {
    const appointments = initializeData<Appointment>(LS_APPOINTMENTS_KEY, []);
    const newAppointment: Appointment = {
        ...appointment,
        id: `a${Date.now()}`,
        status: status,
    };
    const updatedAppointments = [...appointments, newAppointment];
    localStorage.setItem(LS_APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
    return mockApiCall(newAppointment);
}

export const confirmAppointmentPayment = (appointmentId: string): Promise<Appointment> => {
    return updateAppointment(appointmentId, { status: 'Upcoming' });
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

export const autoBookFollowUp = async (
    pet: Pet, 
    currentVet: Vet, 
    followUp: FollowUp
): Promise<Appointment | null> => {
    const allVets = await getVets();
    const allAppointments = await getAppointments();

    let targetVet = currentVet;
    if (followUp.referredVetName) {
        const referredVet = allVets.find(v => v.name.toLowerCase() === followUp.referredVetName.toLowerCase());
        if (referredVet) {
            targetVet = referredVet;
        } else {
            console.warn(`Referred vet "${followUp.referredVetName}" not found. Booking with current vet.`);
        }
    }
    
    const availableTimes = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
    
    const isSlotTaken = (date: string, time: string, vetId: string) => {
        return allAppointments.some(appt => 
            appt.date === date && appt.time === time && appt.vet.id === vetId && appt.status !== 'Cancelled'
        );
    };

    let finalTime = followUp.time;
    let isBooked = false;

    if (isSlotTaken(followUp.date, followUp.time, targetVet.id)) {
        console.warn(`Slot ${followUp.time} on ${followUp.date} is taken. Searching for next available...`);
        
        const suggestedTimeIndex = availableTimes.indexOf(followUp.time);
        let foundSlot = false;
        // Search for slots after the suggested one
        if (suggestedTimeIndex !== -1) {
             for (let i = suggestedTimeIndex + 1; i < availableTimes.length; i++) {
                if (!isSlotTaken(followUp.date, availableTimes[i], targetVet.id)) {
                    finalTime = availableTimes[i];
                    foundSlot = true;
                    break;
                }
            }
        }
       
        // If still no slot, search the whole day
        if (!foundSlot) {
            const nextAvailableSlot = availableTimes.find(timeSlot => !isSlotTaken(followUp.date, timeSlot, targetVet.id));
             if (nextAvailableSlot) {
                finalTime = nextAvailableSlot;
            } else {
                isBooked = true; // no slot found
            }
        }
    }
    
    if (isBooked) {
        console.log(`No available slots found for ${targetVet.name} on ${followUp.date}.`);
        return null;
    }

    const newAppointmentData = {
        pet: pet,
        vet: targetVet,
        type: ConsultationType.InPerson, // Default to In-Person for follow-ups
        date: followUp.date,
        time: finalTime,
    };

    const newAppointment = await saveAppointment(newAppointmentData, 'Pending');
    console.log("Successfully auto-booked PENDING appointment:", newAppointment);
    return newAppointment;
};


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

// Notifications
export const getNotifications = async (user: User): Promise<Notification[]> => {
    let allNotifications = initializeData<Notification>(LS_NOTIFICATIONS_KEY, []);
    
    // Add a welcome notification if it doesn't exist
    if (!allNotifications.some(n => n.userId === user.id && n.id === 'welcome')) {
        allNotifications.push({
            id: `welcome`,
            userId: user.id,
            message: `Welcome to VetSync AI, ${user.name}!`,
            date: new Date().toISOString(),
            isRead: false
        });
    }
    
    const allAppointments = await getAppointments();
    const userAppointments = allAppointments.filter(appt => {
        if (user.role === 'Veterinarian') return appt.vet.id === user.id;
        if (user.role === 'Pet Parent') return appt.pet.ownerId === user.id;
        if (user.role === 'Clinic Admin') {
            // Mock: clinic admin for 'c1'
            const allClinicVets = VETS.filter(v => v.clinicId === 'c1').map(v => v.id);
            return allClinicVets.includes(appt.vet.id);
        }
        return false;
    }).filter(appt => appt.status === 'Upcoming' || appt.status === 'Pending');

    for (const appt of userAppointments) {
        const notifId = `notif-${appt.id}`;
        if (!allNotifications.some(n => n.id === notifId && n.userId === user.id)) {
            const formattedDate = new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'});
            allNotifications.push({
                id: notifId,
                userId: user.id,
                message: `${appt.status} appointment for ${appt.pet.name} with ${appt.vet.name} on ${formattedDate} at ${appt.time}.`,
                date: new Date().toISOString(),
                isRead: false,
            });
        }
    }
    
    localStorage.setItem(LS_NOTIFICATIONS_KEY, JSON.stringify(allNotifications));
    
    const userNotifications = allNotifications
        .filter(n => n.userId === user.id)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return mockApiCall(userNotifications);
}

export const markAllNotificationsAsRead = (userId: string): Promise<Notification[]> => {
    let notifications = initializeData<Notification>(LS_NOTIFICATIONS_KEY, []);
    const updatedNotifications = notifications.map(n => 
        n.userId === userId ? { ...n, isRead: true } : n
    );
    localStorage.setItem(LS_NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    return mockApiCall(updatedNotifications.filter(n => n.userId === userId));
};

// Referrals
export const getReferrals = (): Promise<Referral[]> => {
    const referrals = initializeData<Referral>(LS_REFERRALS_KEY, REFERRALS);
    return mockApiCall(referrals);
}

export const createReferral = (referralData: Omit<Referral, 'id'>): Promise<Referral> => {
    const referrals = initializeData<Referral>(LS_REFERRALS_KEY, []);
    const newReferral: Referral = {
        ...referralData,
        id: `ref${Date.now()}`
    };
    const updatedReferrals = [...referrals, newReferral];
    localStorage.setItem(LS_REFERRALS_KEY, JSON.stringify(updatedReferrals));
    return mockApiCall(newReferral);
}

export const updateReferral = (referralId: string, updatedData: Partial<Referral>): Promise<Referral> => {
    const referrals = initializeData<Referral>(LS_REFERRALS_KEY, []);
    let updatedReferral: Referral | undefined;
    const updatedReferrals = referrals.map(ref => {
        if (ref.id === referralId) {
            updatedReferral = { ...ref, ...updatedData };
            return updatedReferral;
        }
        return ref;
    });

    if (updatedReferral) {
        localStorage.setItem(LS_REFERRALS_KEY, JSON.stringify(updatedReferrals));
        return mockApiCall(updatedReferral);
    } else {
        return Promise.reject(new Error("Referral not found"));
    }
}