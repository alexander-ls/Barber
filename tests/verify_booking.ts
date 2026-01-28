import { addMinutes, isBefore, isAfter } from 'date-fns';

function checkOverlap(slotStart: Date, slotEnd: Date, appStart: Date, appEnd: Date) {
  return isBefore(slotStart, appEnd) && isAfter(slotEnd, appStart);
}

const testAppointments = [
  { start: new Date('2024-01-28T10:00:00Z'), end: new Date('2024-01-28T10:30:00Z') },
];

const slot1 = { start: new Date('2024-01-28T09:30:00Z'), end: new Date('2024-01-28T10:00:00Z') }; // No overlap
const slot2 = { start: new Date('2024-01-28T10:00:00Z'), end: new Date('2024-01-28T10:30:00Z') }; // Exact overlap
const slot3 = { start: new Date('2024-01-28T10:15:00Z'), end: new Date('2024-01-28T10:45:00Z') }; // Partial overlap

console.log('Testing Overlap Logic...');
console.log('Slot 1 (09:30-10:00) vs App (10:00-10:30) -> Overlap:', checkOverlap(slot1.start, slot1.end, testAppointments[0].start, testAppointments[0].end));
console.log('Slot 2 (10:00-10:30) vs App (10:00-10:30) -> Overlap:', checkOverlap(slot2.start, slot2.end, testAppointments[0].start, testAppointments[0].end));
console.log('Slot 3 (10:15-10:45) vs App (10:00-10:30) -> Overlap:', checkOverlap(slot3.start, slot3.end, testAppointments[0].start, testAppointments[0].end));

const pass = !checkOverlap(slot1.start, slot1.end, testAppointments[0].start, testAppointments[0].end) &&
             checkOverlap(slot2.start, slot2.end, testAppointments[0].start, testAppointments[0].end) &&
             checkOverlap(slot3.start, slot3.end, testAppointments[0].start, testAppointments[0].end);

if (pass) {
  console.log('✅ Logic verification: PASSED');
} else {
  console.log('❌ Logic verification: FAILED');
  process.exit(1);
}
