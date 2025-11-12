/**
 * Calculates a dynamic price for a consultation based on various demand factors.
 * @param basePrice The vet's base price for the selected service.
 * @param date The selected date for the appointment (YYYY-MM-DD).
 * @param time The selected time for the appointment (HH:mm AM/PM).
 * @returns The calculated dynamic price.
 */
export const calculateDynamicPrice = (basePrice: number, date: string, time: string): number => {
    let finalPrice = basePrice;

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 6 = Saturday

    // 1. Day of Week Multiplier
    // Make weekends slightly more expensive
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        finalPrice *= 1.15; // 15% surcharge for weekends
    } else if (dayOfWeek === 5) {
        finalPrice *= 1.10; // 10% surcharge for Fridays
    }

    // 2. Time of Day Multiplier
    const [timePart, modifier] = time.split(' ');
    let [hours] = timePart.split(':');
    let hourNum = parseInt(hours, 10);

    if (modifier === 'PM' && hourNum !== 12) {
        hourNum += 12;
    }
    if (modifier === 'AM' && hourNum === 12) {
        hourNum = 0;
    }
    
    // Surcharge for evening appointments (3 PM onwards)
    if (hourNum >= 15) {
        finalPrice *= 1.20; // 20% surcharge
    }

    // 3. Lead Time Multiplier
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) { // Same-day booking
        finalPrice *= 1.30; // 30% surcharge
    } else if (diffDays === 1) { // Next-day booking
        finalPrice *= 1.10; // 10% surcharge
    }
    
    // Return price rounded to 2 decimal places
    return Math.round(finalPrice * 100) / 100;
};
