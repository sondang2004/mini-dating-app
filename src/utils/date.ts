import type { TimeSlot } from '../types/models';

/**
 * Checks if a given date is within the next 3 weeks from today.
 */
export function isWithinNextThreeWeeks(dateStr: string): boolean {
    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeWeeksFromNow = new Date(today);
    threeWeeksFromNow.setDate(today.getDate() + 21);

    return targetDate >= today && targetDate <= threeWeeksFromNow;
}

/**
 * Normalizes time string (HH:mm) to minutes since midnight for easy comparison.
 */
function timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Minutes since midnight to time string (HH:mm).
 */
function minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

/**
 * Finds the first overlapping time slot between two users' availabilities.
 * Overlap must be at least 30 minutes long to count as a valid date.
 */
export function findFirstOverlap(slots1: TimeSlot[], slots2: TimeSlot[]): TimeSlot | null {
    // Sort both arrays by date, then by start time
    const sortSlots = (slots: TimeSlot[]) => {
        return [...slots].sort((a, b) => {
            const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
            return dateDiff !== 0 ? dateDiff : timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
        });
    };

    const sorted1 = sortSlots(slots1);
    const sorted2 = sortSlots(slots2);

    for (const s1 of sorted1) {
        for (const s2 of sorted2) {
            if (s1.date === s2.date) {
                const start1 = timeToMinutes(s1.startTime);
                const end1 = timeToMinutes(s1.endTime);
                const start2 = timeToMinutes(s2.startTime);
                const end2 = timeToMinutes(s2.endTime);

                const overlapStart = Math.max(start1, start2);
                const overlapEnd = Math.min(end1, end2);

                // Valid date overlap must be at least 30 minutes
                if (overlapEnd - overlapStart >= 30) {
                    return {
                        date: s1.date,
                        startTime: minutesToTime(overlapStart),
                        endTime: minutesToTime(overlapEnd),
                    };
                }
            }
        }
    }

    return null;
}
