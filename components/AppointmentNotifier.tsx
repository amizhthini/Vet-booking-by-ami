// FIX: Import React to fix "Cannot find namespace 'React'" error.
import React, { useEffect, useRef } from 'react';
import type { Appointment } from '../types';

interface AppointmentNotifierProps {
    appointments: Appointment[];
    onShowToast: (message: string, type: 'success' | 'error') => void;
    onShowStartModal: (appointment: Appointment) => void;
}

const NOTIFIED_KEY_PREFIX = 'vetsync_notified_';
const CHECK_INTERVAL = 1000 * 30; // Check every 30 seconds for demo purposes

const AppointmentNotifier: React.FC<AppointmentNotifierProps> = ({ appointments, onShowToast, onShowStartModal }) => {
    const notifiedRef = useRef(new Set<string>());

    useEffect(() => {
        const checkAppointments = () => {
            const now = new Date();
            const upcomingAndPending = appointments.filter(a => a.status === 'Upcoming' || a.status === 'Pending');

            for (const appt of upcomingAndPending) {
                const [time, modifier] = appt.time.split(' ');
                let [hours, minutes] = time.split(':');
                if (hours === '12') hours = '00';
                if (modifier === 'PM' && parseInt(hours, 10) < 12) hours = (parseInt(hours, 10) + 12).toString();
                
                const apptDateTime = new Date(`${appt.date}T${hours.padStart(2, '0')}:${minutes}:00`);
                
                if (isNaN(apptDateTime.getTime())) continue; // Skip invalid dates

                const diffMinutes = (apptDateTime.getTime() - now.getTime()) / (1000 * 60);

                const notify = (key: string, message: string) => {
                    const notificationKey = `${NOTIFIED_KEY_PREFIX}${appt.id}_${key}`;
                    if (!notifiedRef.current.has(notificationKey)) {
                        onShowToast(message, 'success');
                        notifiedRef.current.add(notificationKey);
                    }
                };
                
                // On time (within a 2-minute window)
                if (diffMinutes >= -1 && diffMinutes <= 1) {
                    const notificationKey = `${NOTIFIED_KEY_PREFIX}${appt.id}_start`;
                    if (!notifiedRef.current.has(notificationKey)) {
                       onShowStartModal(appt);
                       notifiedRef.current.add(notificationKey);
                    }
                }
                // 1 hour (between 59 and 60 minutes)
                else if (diffMinutes > 59 && diffMinutes <= 60) {
                    notify('1hr', `Reminder: ${appt.pet.name}'s appointment is in 1 hour.`);
                }
                // 1 day (between 23h 59m and 24h)
                else if (diffMinutes > (24*60 - 1) && diffMinutes <= 24*60) {
                    notify('1day', `Reminder: ${appt.pet.name}'s appointment is tomorrow.`);
                }
                // 1 week (between 6d 23h 59m and 7d)
                else if (diffMinutes > (7*24*60 - 1) && diffMinutes <= 7*24*60) {
                    notify('1week', `Reminder: ${appt.pet.name}'s appointment is in one week.`);
                }
            }
        };

        const intervalId = setInterval(checkAppointments, CHECK_INTERVAL);
        checkAppointments(); // run once on mount

        return () => clearInterval(intervalId);
    }, [appointments, onShowToast, onShowStartModal]);

    return null; // This is a side-effect component, it doesn't render anything
};

export default AppointmentNotifier;