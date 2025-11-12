import React from 'react';
import type { Vet, Pet, Appointment, PetOwner } from './types';
import { ConsultationType } from './types';

export const PET_OWNERS: PetOwner[] = [
    { id: 'po1', name: 'Alex Johnson', clinicId: 'c1' },
    { id: 'po2', name: 'Maria Garcia', clinicId: 'c1' },
    { id: 'po3', name: 'Sam Chen', clinicId: 'c2' },
];

export const PETS: Pet[] = [
    { 
        id: 'p1', 
        name: 'Buddy', 
        breed: 'Golden Retriever', 
        age: 5, 
        imageUrl: 'https://picsum.photos/seed/buddy/200',
        ownerId: 'po1',
        healthRecord: {
            vaccinations: ['Rabies (01/2023)', 'DHPP (01/2023)', 'Bordetella (05/2023)'],
            allergies: ['None known'],
            medications: ['Simparica Trio (monthly)']
        }
    },
    { 
        id: 'p2', 
        name: 'Lucy', 
        breed: 'Siamese Cat', 
        age: 3, 
        imageUrl: 'https://picsum.photos/seed/lucy/200',
        ownerId: 'po2',
        healthRecord: {
            vaccinations: ['FVRCP (03/2023)', 'Rabies (03/2023)'],
            allergies: ['Flea bites'],
            medications: ['Revolution Plus (monthly)']
        }
    },
     { 
        id: 'p3', 
        name: 'Max', 
        breed: 'German Shepherd', 
        age: 7, 
        imageUrl: 'https://picsum.photos/seed/max/200',
        ownerId: 'po1',
        healthRecord: {
            vaccinations: ['Rabies (06/2023)', 'DHPP (06/2023)'],
            allergies: ['Chicken', 'Grain'],
            medications: ['Galliprant (as needed for arthritis)']
        }
    },
];

export const VETS: Vet[] = [
    { 
        id: 'v1', 
        name: 'Dr. Emily Carter', 
        specialty: 'General Practice', 
        clinicId: 'c1', 
        clinicName: 'Happy Paws Clinic', 
        location: 'New York, NY', 
        imageUrl: 'https://picsum.photos/seed/drcarter/200', 
        rating: 4.9, 
        reviewCount: 124,
        schedule: [
            { id: 'e1', date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], title: '10:00 AM - Buddy', type: 'appointment'},
            { id: 'e2', date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], title: '11:00 AM - Max', type: 'appointment'},
            { id: 'e3', date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0], title: 'Surgery', type: 'blocked'},
            { id: 'e4', date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], title: '02:00 PM - Checkup', type: 'appointment'},
        ],
        weeklyAvailability: {
            Monday: [{ startTime: '09:00', endTime: '17:00' }],
            Tuesday: [{ startTime: '09:00', endTime: '17:00' }],
            Wednesday: [{ startTime: '09:00', endTime: '13:00' }],
            Friday: [{ startTime: '10:00', endTime: '16:00' }],
        }
    },
    { id: 'v2', name: 'Dr. Johnathan Lee', specialty: 'Orthopedic Surgery', clinicId: 'c2', clinicName: 'Advanced Pet Care', location: 'San Francisco, CA', imageUrl: 'https://picsum.photos/seed/drlee/200', rating: 4.8, reviewCount: 98 },
    { id: 'v3', name: 'Dr. Sarah Chen', specialty: 'Dermatology', clinicName: 'Independent', location: 'Chicago, IL', imageUrl: 'https://picsum.photos/seed/drchen/200', rating: 5.0, reviewCount: 76 },
    { 
        id: 'v4', 
        name: 'Dr. Michael Ramirez', 
        specialty: 'Cardiology', 
        clinicId: 'c1', 
        clinicName: 'Happy Paws Clinic', 
        location: 'New York, NY', 
        imageUrl: 'https://picsum.photos/seed/drramirez/200', 
        rating: 4.7, 
        reviewCount: 110,
        schedule: [
             { id: 'e5', date: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString().split('T')[0], title: 'Conference', type: 'blocked'},
             { id: 'e6', date: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString().split('T')[0], title: 'Follow-up Calls', type: 'blocked'},
             { id: 'e7', date: new Date(new Date().setDate(new Date().getDate() + 9)).toISOString().split('T')[0], title: '09:00 AM - Fido', type: 'appointment'},
        ],
        weeklyAvailability: {
            Tuesday: [{ startTime: '10:00', endTime: '18:00' }],
            Thursday: [{ startTime: '10:00', endTime: '18:00' }],
        }
    },
     { 
        id: 'v5', 
        name: 'Dr. David Chen', 
        specialty: 'Oncology', 
        clinicId: 'c1', 
        clinicName: 'Happy Paws Clinic', 
        location: 'New York, NY', 
        imageUrl: 'https://picsum.photos/seed/drdavid/200', 
        rating: 4.9, 
        reviewCount: 88,
        schedule: [
            { id: 'e8', date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], title: 'Admin Time', type: 'blocked' },
            { id: 'e9', date: new Date(new Date().setDate(new Date().getDate() + 6)).toISOString().split('T')[0], title: '10:00 AM - Whiskers', type: 'appointment' },
        ],
        weeklyAvailability: {
             Monday: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '13:00', endTime: '16:00' }],
             Wednesday: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '13:00', endTime: '16:00' }],
             Friday: [{ startTime: '08:00', endTime: '12:00' }],
        }
    },
    { 
        id: 'v6', 
        name: 'Dr. Olivia Martinez', 
        specialty: 'Neurology', 
        clinicId: 'c2', 
        clinicName: 'Advanced Pet Care', 
        location: 'San Francisco, CA', 
        imageUrl: 'https://picsum.photos/seed/drmartinez/200', 
        rating: 4.8, 
        reviewCount: 65 
    },
];

export const APPOINTMENTS: Appointment[] = [
    {
        id: 'a1',
        pet: PETS[0],
        vet: VETS[0],
        type: ConsultationType.Virtual,
        date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
        time: '10:00 AM',
        status: 'Upcoming'
    },
    {
        id: 'a2',
        pet: PETS[1],
        vet: VETS[2],
        type: ConsultationType.InPerson,
        date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
        time: '02:30 PM',
        status: 'Upcoming'
    },
     {
        id: 'a3',
        pet: PETS[0],
        vet: VETS[1],
        type: ConsultationType.InPerson,
        date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0],
        time: '09:00 AM',
        status: 'Completed',
        notes: {
            subjective: "Owner reports Buddy has been limping on his right hind leg for 3 days, especially after rest. No known trauma. Appetite and energy levels are normal.",
            objective: "Mild swelling noted in the right stifle joint. Pain on full extension of the hip. Gait analysis shows a moderate, weight-bearing limp. No crepitus detected.",
            assessment: "Provisional diagnosis: Suspected cranial cruciate ligament strain or early-stage hip dysplasia. Rule out soft tissue injury.",
            plan: "Prescribed strict rest for 1 week. Start NSAID trial (Carprofen 50mg BID). Schedule follow-up appointment in 7-10 days. If no improvement, recommend radiographs of the hip and stifle joints."
        },
        prescriptions: [
            { medication: 'Carprofen', dosage: '50mg', frequency: 'Twice daily' },
            { medication: 'Joint Supplement', dosage: '1 chew', frequency: 'Once daily' }
        ],
        followUp: {
            date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0],
            reason: "Re-check limping in 7-10 days. Schedule radiographs if no improvement."
        }
    },
    {
        id: 'a4',
        pet: PETS[1],
        vet: VETS[3],
        type: ConsultationType.Call,
        date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0],
        time: '04:00 PM',
        status: 'Cancelled'
    },
    {
        id: 'a5',
        pet: PETS[2],
        vet: VETS[0],
        type: ConsultationType.InPerson,
        date: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString().split('T')[0],
        time: '11:00 AM',
        status: 'Completed',
        notes: {
            subjective: "Owner reports Max has been showing signs of stiffness, particularly in the mornings. Difficulty getting up after long periods of rest.",
            objective: "Physical exam reveals decreased range of motion in both hips. Mild muscle atrophy in the hind limbs. Positive Ortolani sign is absent. Crepitus noted on hip manipulation.",
            assessment: "Chronic osteoarthritis secondary to hip dysplasia.",
            plan: "Continue Galliprant as needed for pain management. Recommend starting joint supplements (glucosamine/chondroitin). Discussed weight management and low-impact exercise like swimming. Recheck in 3 months or sooner if signs worsen."
        },
        prescriptions: [
            { medication: 'Galliprant', dosage: 'As needed', frequency: 'For pain' }
        ],
        followUp: {
            date: new Date(new Date().setDate(new Date().getDate() + 65)).toISOString().split('T')[0],
            reason: "Re-check in 3 months or sooner if signs of stiffness worsen."
        }
    },
];

export const MOCK_TRANSCRIPT = "Okay, Mrs. Davis, so you're saying Buddy has been limping for about three days now? And it's his right hind leg... I see. Is it worse after he gets up from lying down? Yes, that's typical. Okay, I'm just going to examine him. He seems a little sensitive when I extend the hip fully, and I can see a bit of swelling around his knee, or the stifle joint. His gait is definitely off. I don't feel any clicking or grinding, which is good. For now, let's call it a suspected ligament strain. I want him on strict rest for the next week - no running or jumping. I'll prescribe an anti-inflammatory, Carprofen, twice a day. Let's schedule a recheck in about a week, and if he's not better, we'll need to get some x-rays to get a better look at what's going on in there.";

// SVG Icons
export const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" />
  </svg>
);

export const VideoCameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
  </svg>
);

export const MicrophoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" />
    </svg>
);

export const StopIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
    </svg>
);

export const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);

export const VetsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.684v.005z" />
    </svg>
);

export const PetIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345h5.364c.518 0 .734.654.372 1.01l-4.34 3.155a.562.562 0 00-.182.635l1.634 5.057a.563.563 0 01-.816.62l-4.124-2.832a.563.563 0 00-.671 0l-4.123 2.832a.563.563 0 01-.816-.62l1.634-5.057a.562.562 0 00-.182-.635l-4.34-3.155a.563.563 0 01.372-1.01h5.364a.562.562 0 00.475-.345L11.48 3.5z" />
    </svg>
);

export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.684v.005z" />
  </svg>
);

export const BuildingOfficeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6M5.25 21v-3.375c0-.621.504-1.125 1.125-1.125h11.25c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

export const ClipboardDocumentListIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
  </svg>
);

export const FolderOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

export const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);