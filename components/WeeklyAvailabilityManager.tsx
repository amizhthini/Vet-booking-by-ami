import React, { useState } from 'react';
import type { WeeklyAvailability, TimeSlot } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface WeeklyAvailabilityManagerProps {
    initialAvailability?: WeeklyAvailability;
    onSave: (newAvailability: WeeklyAvailability) => void;
}

const dayOrder: (keyof WeeklyAvailability)[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WeeklyAvailabilityManager: React.FC<WeeklyAvailabilityManagerProps> = ({ initialAvailability = {}, onSave }) => {
    const [availability, setAvailability] = useState<WeeklyAvailability>(initialAvailability);
    const [isEditing, setIsEditing] = useState<keyof WeeklyAvailability | null>(null);
    const [newSlot, setNewSlot] = useState({ startTime: '09:00', endTime: '17:00' });

    const handleAddTimeSlot = (day: keyof WeeklyAvailability) => {
        const updatedDaySlots = [...(availability[day] || []), newSlot];
        // Sort slots by start time
        updatedDaySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        setAvailability(prev => ({
            ...prev,
            [day]: updatedDaySlots
        }));
        setIsEditing(null);
    };

    const handleRemoveTimeSlot = (day: keyof WeeklyAvailability, slotToRemove: TimeSlot) => {
        setAvailability(prev => ({
            ...prev,
            [day]: prev[day]?.filter(slot => slot.startTime !== slotToRemove.startTime || slot.endTime !== slotToRemove.endTime)
        }));
    };

    const formatTime = (time: string) => {
        const [hour, minute] = time.split(':');
        const hourNum = parseInt(hour, 10);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    return (
        <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Manage Weekly Availability</h3>
            <div className="space-y-4">
                {dayOrder.map(day => (
                    <div key={day} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold">{day}</h4>
                        <div className="mt-2 space-y-2">
                            {availability[day] && availability[day]!.length > 0 ? (
                                availability[day]!.map((slot, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
                                        <span className="text-sm font-mono">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                                        <button onClick={() => handleRemoveTimeSlot(day, slot)} className="text-red-500 hover:text-red-700">&times;</button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-500">Not available</p>
                            )}

                            {isEditing === day ? (
                                <div className="flex items-center space-x-2 pt-2">
                                    <input type="time" value={newSlot.startTime} onChange={e => setNewSlot(prev => ({...prev, startTime: e.target.value}))} className="p-1 border rounded-md text-sm w-full"/>
                                    <input type="time" value={newSlot.endTime} onChange={e => setNewSlot(prev => ({...prev, endTime: e.target.value}))} className="p-1 border rounded-md text-sm w-full"/>
                                    <Button size="sm" onClick={() => handleAddTimeSlot(day)}>Add</Button>
                                    <Button size="sm" variant="secondary" onClick={() => setIsEditing(null)}>Cancel</Button>
                                </div>
                            ) : (
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(day)} className="mt-2">+ Add Slot</Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <Button onClick={() => onSave(availability)}>Save Changes</Button>
            </div>
        </Card>
    );
};

export default WeeklyAvailabilityManager;
