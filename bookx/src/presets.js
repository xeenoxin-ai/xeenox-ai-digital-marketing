// Business types: each sets the words the app uses, how bookings work
// (timed appointments or pickup orders), starter services and repeat-visit gaps.

const H = (from, to, breakFrom = '', breakTo = '') => ({ open: true, from, to, breakFrom, breakTo });
const CLOSED = { open: false, from: '09:00', to: '18:00', breakFrom: '', breakTo: '' };
// Sunday first, matching Date#getDay().
const week = (day, sunday = CLOSED) => [sunday, day, day, day, day, day, day];

// [name, minutes, price, revisit after (days, 0 = none), category]
const svc = (rows) => rows.map(([name, duration, price, revisitDays = 0, category = '']) => ({ name, duration, price, revisitDays, category }));

export const PRESETS = {
  clinic: {
    name: 'Clinic / doctor', group: 'Health', icon: '🩺', mode: 'appointments',
    labels: { customer: 'Patient', customers: 'Patients', staff: 'Doctor', booking: 'Appointment' },
    hours: week(H('09:00', '20:00', '13:00', '16:00'), H('09:00', '12:00')),
    staff: ['Dr. Main'],
    services: svc([
      ['Consultation', 15, 300, 0, 'OP'],
      ['Follow-up visit', 10, 150, 7, 'OP'],
      ['Review after medicine course', 15, 200, 30, 'OP'],
      ['Health check-up', 30, 1200, 365, 'Check-up'],
      ['Diabetes / BP review', 15, 250, 30, 'Chronic care'],
    ]),
  },
  dental: {
    name: 'Dental clinic', group: 'Health', icon: '🦷', mode: 'appointments',
    labels: { customer: 'Patient', customers: 'Patients', staff: 'Dentist', booking: 'Appointment' },
    hours: week(H('10:00', '20:00', '14:00', '16:00')),
    staff: ['Dr. Main'],
    services: svc([
      ['Consultation', 15, 300, 0, 'General'],
      ['Scaling & cleaning', 30, 1200, 180, 'General'],
      ['Filling', 45, 1500, 0, 'Treatment'],
      ['Root canal sitting', 60, 3000, 7, 'Treatment'],
      ['Braces adjustment', 20, 800, 30, 'Orthodontics'],
    ]),
  },
  physio: {
    name: 'Physiotherapy / therapy', group: 'Health', icon: '🧘', mode: 'appointments',
    labels: { customer: 'Patient', customers: 'Patients', staff: 'Therapist', booking: 'Session' },
    hours: week(H('08:00', '20:00', '13:00', '15:00')),
    staff: ['Therapist 1'],
    services: svc([
      ['Assessment', 45, 600, 2, 'Physio'],
      ['Physio session', 45, 500, 2, 'Physio'],
      ['Counselling session', 50, 1000, 7, 'Therapy'],
    ]),
  },
  salon: {
    name: 'Salon / unisex salon', group: 'Beauty', icon: '💇', mode: 'appointments',
    labels: { customer: 'Client', customers: 'Clients', staff: 'Stylist', booking: 'Appointment' },
    hours: week(H('09:30', '20:30'), H('09:30', '20:30')),
    staff: ['Stylist 1', 'Stylist 2'],
    services: svc([
      ['Haircut', 30, 300, 30, 'Hair'],
      ['Hair colour', 90, 1500, 45, 'Hair'],
      ['Hair spa', 60, 1000, 30, 'Hair'],
      ['Facial', 60, 1200, 30, 'Skin'],
      ['Threading', 15, 60, 21, 'Skin'],
      ['Manicure & pedicure', 60, 900, 30, 'Hands & feet'],
    ]),
  },
  barber: {
    name: 'Barber shop', group: 'Beauty', icon: '💈', mode: 'appointments',
    labels: { customer: 'Customer', customers: 'Customers', staff: 'Barber', booking: 'Booking' },
    hours: week(H('08:00', '21:00'), H('08:00', '14:00')),
    staff: ['Barber 1', 'Barber 2'],
    services: svc([
      ['Haircut', 20, 150, 21, 'Hair'],
      ['Beard trim', 15, 80, 10, 'Beard'],
      ['Haircut + beard', 30, 200, 21, 'Hair'],
      ['Head massage', 15, 100, 0, 'Care'],
    ]),
  },
  beauty: {
    name: 'Beauty parlour / spa', group: 'Beauty', icon: '💅', mode: 'appointments',
    labels: { customer: 'Client', customers: 'Clients', staff: 'Beautician', booking: 'Appointment' },
    hours: week(H('10:00', '20:00'), H('10:00', '20:00')),
    staff: ['Beautician 1'],
    services: svc([
      ['Facial', 60, 1000, 30, 'Skin'],
      ['Waxing', 45, 600, 28, 'Skin'],
      ['Body massage', 60, 1800, 30, 'Spa'],
      ['Bridal makeup', 180, 15000, 0, 'Makeup'],
      ['Mehendi', 60, 800, 0, 'Makeup'],
    ]),
  },
  photo: {
    name: 'Photo / video studio', group: 'Studios', icon: '📷', mode: 'appointments',
    labels: { customer: 'Client', customers: 'Clients', staff: 'Photographer', booking: 'Shoot' },
    hours: week(H('10:00', '19:00'), H('10:00', '19:00')),
    staff: ['Studio A'],
    services: svc([
      ['Passport photos', 15, 150, 0, 'Quick'],
      ['Portrait session', 60, 2500, 0, 'Studio'],
      ['Baby / family shoot', 90, 4000, 180, 'Studio'],
      ['Product shoot (per hour)', 60, 3000, 30, 'Commercial'],
    ]),
  },
  fitness: {
    name: 'Yoga / fitness / dance studio', group: 'Studios', icon: '🏋️', mode: 'appointments',
    labels: { customer: 'Member', customers: 'Members', staff: 'Trainer', booking: 'Class' },
    hours: week(H('06:00', '21:00', '11:00', '16:00'), H('06:00', '11:00')),
    staff: ['Trainer 1'],
    services: svc([
      ['Trial class', 60, 0, 3, 'Classes'],
      ['Personal training', 60, 800, 2, 'Personal'],
      ['Group class', 60, 300, 2, 'Classes'],
      ['Monthly renewal check-in', 15, 0, 30, 'Membership'],
    ]),
  },
  tattoo: {
    name: 'Tattoo / piercing studio', group: 'Studios', icon: '🎨', mode: 'appointments',
    labels: { customer: 'Client', customers: 'Clients', staff: 'Artist', booking: 'Session' },
    hours: week(H('11:00', '20:00'), H('11:00', '20:00')),
    staff: ['Artist 1'],
    services: svc([
      ['Consultation', 30, 0, 0, 'Tattoo'],
      ['Small tattoo', 60, 2500, 21, 'Tattoo'],
      ['Tattoo session (3 hr)', 180, 8000, 30, 'Tattoo'],
      ['Piercing', 20, 800, 42, 'Piercing'],
    ]),
  },
  bakery: {
    name: 'Bakery / cake shop', group: 'Food', icon: '🎂', mode: 'orders',
    labels: { customer: 'Customer', customers: 'Customers', staff: 'Counter', booking: 'Order' },
    hours: week(H('08:00', '21:00'), H('08:00', '21:00')),
    staff: [],
    capacity: 4,
    services: svc([
      ['Birthday cake 1 kg', 0, 900, 365, 'Cakes'],
      ['Birthday cake 500 g', 0, 500, 365, 'Cakes'],
      ['Photo cake 1 kg', 0, 1400, 365, 'Cakes'],
      ['Cupcakes (box of 6)', 0, 360, 30, 'Small treats'],
      ['Bread loaf', 0, 60, 7, 'Daily'],
      ['Puffs (dozen)', 0, 300, 14, 'Snacks'],
    ]),
  },
  pet: {
    name: 'Pet grooming / vet', group: 'Other', icon: '🐾', mode: 'appointments',
    labels: { customer: 'Pet parent', customers: 'Pet parents', staff: 'Groomer', booking: 'Appointment' },
    hours: week(H('09:00', '19:00'), H('09:00', '13:00')),
    staff: ['Groomer 1'],
    services: svc([
      ['Bath & brush', 60, 700, 30, 'Grooming'],
      ['Full grooming', 90, 1500, 45, 'Grooming'],
      ['Vaccination', 15, 600, 365, 'Vet'],
      ['Deworming', 10, 200, 90, 'Vet'],
    ]),
  },
  other: {
    name: 'Other services', group: 'Other', icon: '🗓️', mode: 'appointments',
    labels: { customer: 'Customer', customers: 'Customers', staff: 'Staff', booking: 'Booking' },
    hours: week(H('09:00', '18:00')),
    staff: ['Staff 1'],
    services: svc([
      ['Standard service', 30, 500, 30, ''],
      ['Long service', 60, 1000, 30, ''],
    ]),
  },
};

export const preset = (type) => PRESETS[type] || PRESETS.other;

export const PALETTE = ['#2563eb', '#db2777', '#16a34a', '#ea580c', '#7c3aed', '#0891b2', '#ca8a04', '#dc2626'];

export const DEFAULT_TEMPLATES = {
  confirm: 'Hi {name}, your {booking} at {business} is confirmed for {date} at {time} ({service}). Reply here to change it. See you!',
  reminder: 'Hi {name}, a reminder of your {booking} at {business} on {date} at {time} ({service}). Reply YES to confirm or tell us a better time.',
  revisit: 'Hi {name}, it has been a while since your {service} at {business} on {last}. It is a good time for the next one. Shall we book you in? {link}',
  occasion: 'Hi {name}, your {occasion} is coming up on {date}! 🎉 {business} would love to make it special. Book or order here: {link}',
  winback: 'Hi {name}, we miss you at {business}! It has been {days} days since your last visit. Come back this week; reply to book. {link}',
  thanks: 'Thank you for visiting {business}, {name}! {loyalty} If you liked it, please leave us a review: {review}',
  order: 'Hi {name}, your order at {business} is confirmed: {items}. Pickup {date} at {time}. Total {total}, advance paid {advance}.',
};
