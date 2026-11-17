// Business-type (sector) presets. Choosing one sets the customer label,
// the fields on every bill, customer fields, extra item columns, starter
// items, default tax and a matching design. Every part can then be edited
// in Settings → "Fields on your bills", and "Custom" starts from scratch.

const F = (key, label, extra = {}) => ({ key, label, ...extra });
const D = (key, label, extra = {}) => ({ key, label, type: 'date', ...extra });
const PO = F('po', 'PO number', { sample: 'PO-4521' });
const REF = F('reference2', 'Reference', { sample: 'REF-11' });

export const GROUPS = [
  'Retail & trade', 'Food & hospitality', 'Healthcare', 'Professional services', 'Repairs & trades',
  'Beauty, fitness & wellness', 'Education', 'Construction & property', 'Transport & travel',
  'Manufacturing & agriculture', 'Events & media', 'Community & others',
];

export const INDUSTRIES = {
  /* ---------------- Retail & trade ---------------- */
  retail: {
    name: 'Retail shop / Store', group: 'Retail & trade', clientLabel: 'Customer', docTitle: 'Tax Invoice',
    template: 'classic', accent: '#ea580c', tax: 18,
    fields: [F('salesman', 'Salesperson', { sample: 'Arun' })], clientFields: [], itemCols: [],
    items: [['T-shirt cotton', 'pcs', 499, 5, '6109'], ['Steel water bottle 1L', 'pcs', 650, 18, '7323'], ['Carry bag', 'pcs', 10, 18, '3923']],
  },
  grocery: {
    name: 'Supermarket / Grocery', group: 'Retail & trade', clientLabel: 'Customer', docTitle: 'Bill',
    template: 'thermal', accent: '#16a34a', tax: 5, labels: { item: 'Item' },
    fields: [F('counter', 'Counter', { sample: '2' }), F('cashier', 'Cashier', { sample: 'Meera' })], clientFields: [F('loyalty', 'Loyalty card No.')], itemCols: [F('mrp', 'MRP')],
    items: [['Rice (Matta) 5 kg', 'bag', 320, 5, '1006'], ['Sunflower oil 1 L', 'pcs', 145, 5, '1512'], ['Toor dal 1 kg', 'kg', 160, 0, '0713'], ['Bath soap', 'pcs', 38, 18, '3401']],
  },
  electronics: {
    name: 'Electronics & Mobiles', group: 'Retail & trade', clientLabel: 'Customer', docTitle: 'Tax Invoice',
    template: 'modern', accent: '#0ea5e9', tax: 18,
    fields: [F('warranty', 'Warranty', { sample: '1 year' })], clientFields: [], itemCols: [F('serial', 'Serial / IMEI')],
    items: [['Smartphone 128 GB', 'pcs', 15999, 18, '8517'], ['LED TV 43"', 'pcs', 24990, 18, '8528'], ['Earbuds', 'pcs', 1499, 18, '8518'], ['Extended warranty', 'year', 999, 18, '998719']],
  },
  textile: {
    name: 'Textiles & Garments', group: 'Retail & trade', clientLabel: 'Customer', docTitle: 'Tax Invoice',
    template: 'elegant', accent: '#be123c', tax: 5,
    fields: [F('salesman', 'Salesperson', { sample: 'Divya' })], clientFields: [], itemCols: [F('size', 'Size'), F('colour', 'Colour')],
    items: [['Saree - silk', 'pcs', 3500, 5, '5007'], ['Shirt - cotton', 'pcs', 899, 5, '6205'], ['Kurti', 'pcs', 750, 5, '6211'], ['Stitching charges', 'job', 400, 5, '998821']],
  },
  jewellery: {
    name: 'Jewellery', group: 'Retail & trade', clientLabel: 'Customer', docTitle: 'Tax Invoice',
    template: 'elegant', accent: '#a16207', tax: 3,
    fields: [F('goldRate', 'Gold rate / g', { sample: '7,250' }), F('hallmark', 'HUID / Hallmark')], clientFields: [F('pan', 'PAN')], itemCols: [F('purity', 'Purity', { sample: '22K 916' }), F('weight', 'Net wt (g)', { sample: '8.200' }), F('making', 'Making', { sample: '12%' })],
    items: [['Gold chain 22K', 'g', 7250, 3, '7113'], ['Gold ring 22K', 'g', 7250, 3, '7113'], ['Silver anklet', 'g', 95, 3, '7113'], ['Making charges', 'job', 1, 5, '998892']],
  },
  hardware: {
    name: 'Hardware & Building materials', group: 'Retail & trade', clientLabel: 'Customer', docTitle: 'Tax Invoice',
    template: 'gst', accent: '#475569', tax: 18,
    fields: [F('vehicle', 'Delivery vehicle'), F('site', 'Delivery site')], clientFields: [], itemCols: [],
    items: [['Cement (OPC 53) bag', 'bag', 410, 28, '2523'], ['TMT bar 12 mm', 'kg', 68, 18, '7214'], ['PVC pipe 1"', 'pcs', 220, 18, '3917'], ['Wall putty 20 kg', 'bag', 780, 18, '3214']],
  },
  furniture: {
    name: 'Furniture & Home decor', group: 'Retail & trade', clientLabel: 'Customer', docTitle: 'Tax Invoice',
    template: 'bold', accent: '#92400e', tax: 18,
    fields: [D('delivery', 'Delivery date')], clientFields: [], itemCols: [],
    items: [['3-seater sofa', 'pcs', 28000, 18, '9401'], ['Dining table set', 'set', 35000, 18, '9403'], ['Curtains (pair)', 'pair', 1800, 12, '6303'], ['Installation', 'job', 1000, 18, '998719']],
  },
  wholesale: {
    name: 'Wholesale / Distributor', group: 'Retail & trade', clientLabel: 'Dealer', docTitle: 'Tax Invoice',
    template: 'gst', accent: '#1d4ed8', tax: 18,
    fields: [PO, F('transport', 'Transporter', { sample: 'VRL Logistics' }), F('lr', 'LR / Docket No.'), F('eway', 'E-way bill No.')], clientFields: [F('contact', 'Contact person')], itemCols: [F('batch', 'Batch')],
    items: [['Product A (case of 24)', 'case', 2400, 18, ''], ['Product B (case of 12)', 'case', 1800, 12, ''], ['Freight charges', 'trip', 1500, 18, '996511']],
  },

  /* ---------------- Food & hospitality ---------------- */
  restaurant: {
    name: 'Restaurant / Cafe', group: 'Food & hospitality', clientLabel: 'Guest', docTitle: 'Bill',
    template: 'thermal', accent: '#b91c1c', tax: 5, labels: { item: 'Item', thanks: 'Thank you! Visit again.' }, hide: ['discountCol', 'hsn'],
    fields: [F('table', 'Table', { sample: 'T4' }), F('covers', 'Covers', { sample: '3' }), F('steward', 'Steward', { sample: 'Rahul' }), F('kot', 'KOT No.', { sample: '118' })], clientFields: [], itemCols: [],
    items: [['Masala dosa', 'plate', 90, 5, '996331'], ['Chicken biryani', 'plate', 220, 5, '996331'], ['Fresh lime soda', 'glass', 60, 5, '996331'], ['Filter coffee', 'cup', 35, 5, '996331']],
  },
  bakery: {
    name: 'Bakery & Sweets', group: 'Food & hospitality', clientLabel: 'Customer', docTitle: 'Bill',
    template: 'thermal', accent: '#db2777', tax: 5, labels: { item: 'Item' }, hide: ['hsn'],
    fields: [D('pickup', 'Pickup date'), F('message', 'Cake message')], clientFields: [], itemCols: [],
    items: [['Black forest cake 1 kg', 'kg', 650, 5, '1905'], ['Puffs', 'pcs', 25, 5, '1905'], ['Sweets assorted', 'kg', 480, 5, '1704']],
  },
  catering: {
    name: 'Catering', group: 'Food & hospitality', clientLabel: 'Client', docTitle: 'Catering Invoice',
    template: 'modern', accent: '#c2410c', tax: 5,
    fields: [F('event', 'Event', { sample: 'Wedding reception' }), D('eventDate', 'Event date'), F('venue', 'Venue', { sample: 'Town Hall' }), F('plates', 'Plates', { sample: '250' })], clientFields: [], itemCols: [],
    items: [['Veg meals', 'plate', 280, 5, '996334'], ['Non-veg meals', 'plate', 420, 5, '996334'], ['Welcome drink', 'glass', 30, 5, '996334'], ['Service staff', 'person', 800, 18, '998519']],
  },
  hotel: {
    name: 'Hotel / Homestay / Resort', group: 'Food & hospitality', clientLabel: 'Guest', docTitle: 'Guest Folio',
    template: 'elegant', accent: '#7c3aed', tax: 12, labels: { item: 'Particulars' },
    fields: [F('room', 'Room No.', { sample: '204' }), D('checkin', 'Check-in'), D('checkout', 'Check-out'), F('guests', 'Guests', { sample: '2' }), F('booking', 'Booking ID', { sample: 'BK-7781' })],
    clientFields: [F('idProof', 'ID proof'), F('nationality', 'Nationality', { sample: 'Indian' })], itemCols: [],
    items: [['Deluxe room', 'night', 3200, 12, '996311'], ['Extra bed', 'night', 800, 12, '996311'], ['Breakfast buffet', 'person', 350, 5, '996331'], ['Laundry', 'lot', 200, 18, '999712']],
  },

  /* ---------------- Healthcare ---------------- */
  hospital: {
    name: 'Hospital', group: 'Healthcare', clientLabel: 'Patient', docTitle: 'Hospital Bill',
    template: 'medical', accent: '#0f766e', tax: 0, groupByCategory: true, insurance: true,
    labels: { item: 'Service / Particulars', payable: 'Patient Payable', tax: 'Tax %' },
    sampleName: 'Sunrise Multispeciality Hospital',
    fields: [F('ipNo', 'IP / OP No.', { sample: 'IP-2401' }), F('doctor', 'Consultant', { sample: 'Dr. Suresh Babu (MD)' }), F('department', 'Department', { sample: 'General Medicine' }),
      F('ward', 'Ward / Bed', { sample: 'Ward 3 / Bed 12' }), D('admission', 'Admission'), D('discharge', 'Discharge'), F('tpa', 'Insurance / TPA'), F('policy', 'Policy / Claim No.')],
    clientFields: [F('uhid', 'UHID / MRN', { sample: 'UH-10231' }), F('age', 'Age', { sample: '54' }), F('gender', 'Gender', { options: ['', 'Male', 'Female', 'Other'] }), F('blood', 'Blood group', { sample: 'B+' }), F('guardian', 'Guardian / Attender')],
    itemCols: [F('category', 'Category', { hidden: true })],
    items: [['Consultation fee', 'visit', 500, 0, '999312', 'Consultation'], ['Room charges - General ward', 'day', 1500, 0, '999311', 'Room & Nursing'],
      ['Room charges - Private room', 'day', 3500, 0, '999311', 'Room & Nursing'], ['Nursing charges', 'day', 600, 0, '999311', 'Room & Nursing'],
      ['ICU charges', 'day', 8000, 0, '999311', 'Room & Nursing'], ['Complete blood count (CBC)', 'test', 350, 0, '999316', 'Laboratory'],
      ['X-Ray chest PA', 'scan', 450, 0, '999316', 'Radiology'], ['ECG', 'test', 300, 0, '999316', 'Cardiology'],
      ['Minor procedure', 'job', 2500, 0, '999312', 'Procedures'], ['Pharmacy & consumables', 'lot', 500, 0, '3004', 'Pharmacy']],
  },
  clinic: {
    name: 'Clinic / Doctor / Dental', group: 'Healthcare', clientLabel: 'Patient', docTitle: 'Bill',
    template: 'medical', accent: '#0891b2', tax: 0, labels: { item: 'Treatment / Service' },
    fields: [F('doctor', 'Doctor', { sample: 'Dr. Anitha (BDS)' }), F('opNo', 'OP No.', { sample: 'OP-551' }), D('nextVisit', 'Next visit')],
    clientFields: [F('regNo', 'Patient ID', { sample: 'P-1021' }), F('age', 'Age', { sample: '34' }), F('gender', 'Gender', { options: ['', 'Male', 'Female', 'Other'] })], itemCols: [],
    items: [['Consultation', 'visit', 400, 0, '999312'], ['Scaling & polishing', 'session', 1200, 0, '999312'], ['Tooth filling', 'tooth', 1500, 0, '999312'], ['Medicines', 'lot', 250, 12, '3004']],
  },
  pharmacy: {
    name: 'Pharmacy / Medical store', group: 'Healthcare', clientLabel: 'Customer', docTitle: 'Pharmacy Invoice',
    template: 'compact', accent: '#16a34a', tax: 12,
    fields: [F('doctor', 'Prescribed by', { sample: 'Dr. Rao' }), F('rx', 'Rx No.'), F('dl', 'Drug licence No.', { sample: 'KL-PKD-20B-1234' })], clientFields: [F('age', 'Age', { sample: '41' })],
    itemCols: [F('batch', 'Batch', { sample: 'B2401' }), F('expiry', 'Exp.', { sample: '12/27' }), F('mrp', 'MRP')],
    items: [['Paracetamol 650 mg (strip of 15)', 'strip', 32, 12, '3004'], ['Amoxicillin 500 mg (strip of 10)', 'strip', 95, 12, '3004'], ['ORS sachet', 'pcs', 22, 12, '3004'], ['Digital thermometer', 'pcs', 250, 18, '9025']],
  },
  diagnostics: {
    name: 'Diagnostic lab / Scan centre', group: 'Healthcare', clientLabel: 'Patient', docTitle: 'Lab Bill',
    template: 'medical', accent: '#4f46e5', tax: 0,
    fields: [F('refDoctor', 'Referred by', { sample: 'Dr. Menon' }), F('sampleId', 'Sample ID', { sample: 'S-8812' }), D('reportDate', 'Report date')],
    clientFields: [F('age', 'Age', { sample: '29' }), F('gender', 'Gender', { options: ['', 'Male', 'Female', 'Other'] })], itemCols: [],
    items: [['Complete blood count', 'test', 350, 0, '999316'], ['Thyroid profile (T3, T4, TSH)', 'test', 600, 0, '999316'], ['HbA1c', 'test', 450, 0, '999316'], ['Ultrasound abdomen', 'scan', 1200, 0, '999316']],
  },
  optical: {
    name: 'Optical store', group: 'Healthcare', clientLabel: 'Customer', docTitle: 'Tax Invoice',
    template: 'modern', accent: '#0284c7', tax: 12,
    fields: [F('rightEye', 'Right eye (Rx)', { sample: '-1.25 / -0.50 x 180' }), F('leftEye', 'Left eye (Rx)', { sample: '-1.00' }), D('delivery', 'Delivery date')], clientFields: [], itemCols: [],
    items: [['Frame - full rim', 'pcs', 1800, 12, '9003'], ['Lens - anti-glare (pair)', 'pair', 2200, 12, '9001'], ['Eye test', 'test', 200, 0, '999312']],
  },
  veterinary: {
    name: 'Veterinary / Pet care', group: 'Healthcare', clientLabel: 'Pet owner', docTitle: 'Bill',
    template: 'medical', accent: '#65a30d', tax: 18,
    fields: [F('pet', 'Pet name', { sample: 'Bruno' }), F('species', 'Species / Breed', { sample: 'Dog / Labrador' }), F('vet', 'Veterinarian', { sample: 'Dr. Shaji' })], clientFields: [], itemCols: [],
    items: [['Consultation', 'visit', 400, 18, '998346'], ['Vaccination', 'dose', 650, 18, '998346'], ['Grooming', 'session', 900, 18, '999729'], ['Pet food 3 kg', 'pack', 1450, 18, '2309']],
  },

  /* ---------------- Professional services ---------------- */
  services: {
    name: 'Marketing / Creative agency', group: 'Professional services', clientLabel: 'Client', docTitle: 'Tax Invoice',
    template: 'bold', accent: '#db2777', tax: 18,
    fields: [F('project', 'Project', { sample: 'Brand launch' }), PO, F('period', 'Billing period', { sample: 'November 2026' })], clientFields: [F('contact', 'Contact person')], itemCols: [],
    items: [['Social media management', 'month', 15000, 18, '998361'], ['Meta & Google Ads management', 'month', 12000, 18, '998361'], ['Website design & development', 'project', 35000, 18, '998314'], ['SEO retainer', 'month', 10000, 18, '998361']],
  },
  it: {
    name: 'IT / Software company', group: 'Professional services', clientLabel: 'Client', docTitle: 'Tax Invoice',
    template: 'minimal', accent: '#2563eb', tax: 18,
    fields: [F('project', 'Project', { sample: 'ERP rollout' }), PO, F('sprint', 'Milestone / Sprint', { sample: 'M2' })], clientFields: [F('contact', 'Contact person')], itemCols: [],
    items: [['Software development', 'hour', 1800, 18, '998314'], ['Annual maintenance (AMC)', 'year', 25000, 18, '998713'], ['Cloud hosting', 'month', 3500, 18, '998315'], ['Software licence', 'user', 1200, 18, '997331']],
  },
  professional: {
    name: 'CA / Lawyer / Consultant', group: 'Professional services', clientLabel: 'Client', docTitle: 'Professional Fee Invoice',
    template: 'corporate', accent: '#1e3a8a', tax: 18, labels: { item: 'Particulars' },
    fields: [F('matter', 'Matter / Engagement', { sample: 'GST filing FY 26-27' }), F('period', 'Period')], clientFields: [F('pan', 'PAN'), F('contact', 'Contact person')], itemCols: [],
    items: [['GST return filing', 'month', 2000, 18, '998221'], ['Income tax return', 'return', 3500, 18, '998221'], ['Legal consultation', 'hour', 3000, 18, '998211'], ['Out-of-pocket expenses', 'lot', 0, 0, '']],
  },
  freelancer: {
    name: 'Freelancer', group: 'Professional services', clientLabel: 'Client', docTitle: 'Invoice',
    template: 'minimal', accent: '#111827', tax: 18,
    fields: [F('project', 'Project', { sample: 'Logo design' })], clientFields: [], itemCols: [],
    items: [['Design work', 'hour', 1200, 18, '998391'], ['Development', 'hour', 1500, 18, '998314'], ['Consultation call', 'session', 2000, 18, '998311']],
  },
  security: {
    name: 'Security / Housekeeping / Manpower', group: 'Professional services', clientLabel: 'Client', docTitle: 'Tax Invoice',
    template: 'gst', accent: '#334155', tax: 18,
    fields: [F('site', 'Site', { sample: 'Tech Park Block B' }), F('period', 'Service period', { sample: 'Nov 2026' }), PO], clientFields: [], itemCols: [],
    items: [['Security guard (8 hr shift)', 'month', 18000, 18, '998525'], ['Housekeeping staff', 'month', 15000, 18, '998533'], ['Supervisor', 'month', 22000, 18, '998519']],
  },

  /* ---------------- Repairs & trades ---------------- */
  automobile: {
    name: 'Auto workshop / Garage', group: 'Repairs & trades', clientLabel: 'Customer', docTitle: 'Service Invoice',
    template: 'corporate', accent: '#334155', tax: 18, groupByCategory: true,
    fields: [F('vehicle', 'Vehicle No.', { sample: 'KL 09 AB 1234' }), F('model', 'Make / Model', { sample: 'Maruti Swift' }), F('km', 'Odometer (km)', { sample: '42,180' }), F('jobcard', 'Job card No.', { sample: 'JC-771' })],
    clientFields: [], itemCols: [F('category', 'Type', { hidden: true })],
    items: [['General service labour', 'job', 1200, 18, '998714', 'Labour'], ['Engine oil 5W30', 'litre', 520, 18, '2710', 'Parts'], ['Oil filter', 'pcs', 280, 18, '8421', 'Parts'], ['Wheel alignment', 'job', 600, 18, '998714', 'Labour'], ['Brake pad set', 'set', 1800, 28, '8708', 'Parts']],
  },
  repair: {
    name: 'Mobile / Laptop / Appliance repair', group: 'Repairs & trades', clientLabel: 'Customer', docTitle: 'Service Invoice',
    template: 'compact', accent: '#0d9488', tax: 18,
    fields: [F('device', 'Device', { sample: 'Samsung M32' }), F('serial', 'Serial / IMEI'), F('problem', 'Complaint', { sample: 'Screen broken' }), F('ticket', 'Job No.', { sample: 'J-310' })], clientFields: [], itemCols: [],
    items: [['Display replacement', 'pcs', 3200, 18, '8517'], ['Service charge', 'job', 400, 18, '998716'], ['AC gas refill', 'job', 2500, 18, '998717'], ['Washing machine repair', 'job', 800, 18, '998717']],
  },
  electrical: {
    name: 'Electrician / Plumber / Contractor', group: 'Repairs & trades', clientLabel: 'Customer', docTitle: 'Invoice',
    template: 'classic', accent: '#ca8a04', tax: 18,
    fields: [F('site', 'Work site', { sample: 'Villa 12, Green Park' })], clientFields: [], itemCols: [],
    items: [['Wiring labour', 'point', 350, 18, '995461'], ['Plumbing labour', 'day', 900, 18, '995465'], ['MCB 32A', 'pcs', 420, 18, '8536'], ['CPVC pipe 1"', 'm', 140, 18, '3917']],
  },

  /* ---------------- Beauty, fitness & wellness ---------------- */
  salon: {
    name: 'Salon / Spa / Beauty parlour', group: 'Beauty, fitness & wellness', clientLabel: 'Client', docTitle: 'Bill',
    template: 'elegant', accent: '#c026d3', tax: 18, hide: ['hsn'],
    fields: [F('stylist', 'Stylist', { sample: 'Neha' })], clientFields: [F('membership', 'Membership No.')], itemCols: [],
    items: [['Haircut & styling', 'service', 450, 18, '999721'], ['Facial', 'service', 1200, 18, '999722'], ['Bridal makeup', 'service', 15000, 18, '999722'], ['Body massage (60 min)', 'session', 1800, 18, '999723']],
  },
  gym: {
    name: 'Gym / Yoga / Sports club', group: 'Beauty, fitness & wellness', clientLabel: 'Member', docTitle: 'Membership Invoice',
    template: 'bold', accent: '#dc2626', tax: 18,
    fields: [D('from', 'Valid from'), D('to', 'Valid to'), F('trainer', 'Trainer', { sample: 'Vishnu' })], clientFields: [F('memberId', 'Member ID', { sample: 'M-208' })], itemCols: [],
    items: [['Monthly membership', 'month', 1500, 18, '999652'], ['Quarterly membership', 'quarter', 4000, 18, '999652'], ['Personal training', 'session', 600, 18, '999652'], ['Locker', 'month', 200, 18, '999652']],
  },

  /* ---------------- Education ---------------- */
  education: {
    name: 'School / College', group: 'Education', clientLabel: 'Student', docTitle: 'Fee Receipt',
    template: 'minimal', accent: '#0369a1', tax: 0, labels: { item: 'Fee head' }, hide: ['hsn'],
    fields: [F('course', 'Class / Course', { sample: 'Grade 8 - B' }), F('term', 'Term', { sample: 'Term 2' }), F('roll', 'Roll No.', { sample: '27' })],
    clientFields: [F('parent', 'Parent / Guardian', { sample: 'Mr. Nair' }), F('admission', 'Admission No.', { sample: 'A-2290' })], itemCols: [],
    items: [['Tuition fee', 'term', 12000, 0, '999293'], ['Admission fee', 'once', 5000, 0, '999293'], ['Exam fee', 'term', 1000, 0, '999293'], ['Transport fee', 'month', 1500, 0, '996412']],
  },
  coaching: {
    name: 'Coaching / Training institute', group: 'Education', clientLabel: 'Student', docTitle: 'Fee Invoice',
    template: 'modern', accent: '#7c3aed', tax: 18, labels: { item: 'Course / Fee' },
    fields: [F('course', 'Course', { sample: 'Full-stack development' }), F('batch', 'Batch', { sample: 'Nov-B' }), F('installment', 'Instalment', { sample: '2 of 3' })],
    clientFields: [F('studentId', 'Student ID', { sample: 'ST-418' })], itemCols: [],
    items: [['Course fee', 'course', 30000, 18, '999294'], ['Study material', 'set', 1500, 5, '4901'], ['Certification exam', 'exam', 2500, 18, '999294']],
  },

  /* ---------------- Construction & property ---------------- */
  construction: {
    name: 'Builder / Construction', group: 'Construction & property', clientLabel: 'Client', docTitle: 'Running Account Bill',
    template: 'corporate', accent: '#a16207', tax: 18,
    fields: [F('site', 'Site', { sample: 'Plot 22, Kalmandapam' }), F('workorder', 'Work order No.', { sample: 'WO-117' }), F('stage', 'Stage / RA No.', { sample: 'RA-3' })], clientFields: [], itemCols: [],
    items: [['Brickwork', 'sq.ft', 85, 18, '995411'], ['Plastering', 'sq.ft', 32, 18, '995411'], ['Cement (OPC 53)', 'bag', 410, 28, '2523'], ['Labour charges', 'day', 900, 18, '995411']],
  },
  interior: {
    name: 'Interior design', group: 'Construction & property', clientLabel: 'Client', docTitle: 'Tax Invoice',
    template: 'elegant', accent: '#57534e', tax: 18,
    fields: [F('project', 'Project', { sample: '3 BHK apartment' }), F('milestone', 'Milestone', { sample: 'Design approval' })], clientFields: [], itemCols: [],
    items: [['Design fee', 'project', 50000, 18, '998391'], ['Modular kitchen', 'sq.ft', 1650, 18, '9403'], ['Wardrobe', 'sq.ft', 1350, 18, '9403'], ['False ceiling', 'sq.ft', 95, 18, '995454']],
  },
  realestate: {
    name: 'Real estate / Rent & lease', group: 'Construction & property', clientLabel: 'Tenant', docTitle: 'Rent Invoice',
    template: 'classic', accent: '#0f766e', tax: 18, labels: { item: 'Particulars' },
    fields: [F('property', 'Property', { sample: 'Shop No. 4, City Mall' }), F('period', 'Rent period', { sample: 'Nov 2026' })], clientFields: [F('agreement', 'Agreement No.', { sample: 'AG-22' })], itemCols: [],
    items: [['Monthly rent', 'month', 25000, 18, '997212'], ['Maintenance charges', 'month', 3000, 18, '997212'], ['Electricity charges', 'units', 9, 0, ''], ['Brokerage', 'deal', 25000, 18, '997221']],
  },

  /* ---------------- Transport & travel ---------------- */
  transport: {
    name: 'Transport / Logistics / Courier', group: 'Transport & travel', clientLabel: 'Consignor', docTitle: 'Freight Invoice',
    template: 'gst', accent: '#1e40af', tax: 12,
    fields: [F('lr', 'LR / Docket No.', { sample: 'LR-90012' }), F('vehicle', 'Vehicle No.', { sample: 'KL 10 T 4455' }), F('from', 'From', { sample: 'Palakkad' }), F('to', 'To', { sample: 'Chennai' }), F('eway', 'E-way bill No.')],
    clientFields: [], itemCols: [F('weight', 'Weight (kg)')],
    items: [['Freight charges', 'trip', 18000, 12, '996511'], ['Loading / unloading', 'job', 1500, 18, '996719'], ['Door delivery', 'job', 500, 18, '996812'], ['Courier - document', 'pcs', 60, 18, '996812']],
  },
  taxi: {
    name: 'Taxi / Cab / Vehicle rental', group: 'Transport & travel', clientLabel: 'Customer', docTitle: 'Trip Invoice',
    template: 'compact', accent: '#eab308', tax: 5,
    fields: [F('vehicle', 'Vehicle No.', { sample: 'KL 09 C 7788' }), F('driver', 'Driver', { sample: 'Sajan' }), F('route', 'Route', { sample: 'Palakkad - Kochi airport' }), F('kms', 'Kms (start-end)', { sample: '18,220 - 18,368' })], clientFields: [], itemCols: [],
    items: [['Sedan - per km', 'km', 14, 5, '996412'], ['Driver bata', 'day', 400, 5, '996412'], ['Toll & parking', 'lot', 0, 0, ''], ['Self-drive rental', 'day', 2200, 18, '997311']],
  },
  travel: {
    name: 'Travel agency / Tours', group: 'Transport & travel', clientLabel: 'Traveller', docTitle: 'Tour Invoice',
    template: 'bold', accent: '#0891b2', tax: 5,
    fields: [F('package', 'Package', { sample: 'Munnar 3N/4D' }), D('travelDate', 'Travel date'), F('pax', 'Travellers', { sample: '4' }), F('pnr', 'PNR / Booking ref')], clientFields: [F('passport', 'Passport No.')], itemCols: [],
    items: [['Tour package', 'person', 12500, 5, '998552'], ['Flight ticket', 'ticket', 6500, 0, '996425'], ['Visa service fee', 'person', 1500, 18, '998559'], ['Hotel booking', 'night', 3500, 12, '996311']],
  },

  /* ---------------- Manufacturing & agriculture ---------------- */
  manufacturing: {
    name: 'Manufacturing / Factory', group: 'Manufacturing & agriculture', clientLabel: 'Buyer', docTitle: 'Tax Invoice',
    template: 'gst', accent: '#374151', tax: 18,
    fields: [PO, F('dispatch', 'Dispatch through', { sample: 'Own vehicle' }), F('eway', 'E-way bill No.'), F('challan', 'Delivery challan No.')], clientFields: [F('contact', 'Contact person')], itemCols: [F('batch', 'Batch / Lot')],
    items: [['Finished goods - Model A', 'pcs', 1200, 18, ''], ['Job work charges', 'pcs', 45, 12, '998898'], ['Packing & forwarding', 'lot', 800, 18, '998540']],
  },
  printing: {
    name: 'Printing press / Signage', group: 'Manufacturing & agriculture', clientLabel: 'Customer', docTitle: 'Tax Invoice',
    template: 'modern', accent: '#e11d48', tax: 18,
    fields: [F('job', 'Job No.', { sample: 'PJ-662' }), D('delivery', 'Delivery date')], clientFields: [], itemCols: [F('size', 'Size')],
    items: [['Visiting cards (1000)', 'set', 900, 18, '4911'], ['Flex banner', 'sq.ft', 18, 18, '4911'], ['Brochure A4 (500)', 'set', 6500, 18, '4911'], ['Design charges', 'job', 1000, 18, '998391']],
  },
  agriculture: {
    name: 'Agriculture / Farm produce / Agri inputs', group: 'Manufacturing & agriculture', clientLabel: 'Customer', docTitle: 'Bill of Supply',
    template: 'classic', accent: '#15803d', tax: 0,
    fields: [F('vehicle', 'Vehicle No.'), F('market', 'Market / Mandi', { sample: 'Palakkad APMC' })], clientFields: [F('village', 'Village')], itemCols: [F('grade', 'Grade')],
    items: [['Paddy', 'quintal', 2300, 0, '1006'], ['Coconut', 'pcs', 18, 0, '0801'], ['Organic fertiliser 50 kg', 'bag', 650, 5, '3101'], ['Seeds - vegetable pack', 'pack', 80, 0, '1209']],
  },

  /* ---------------- Events & media ---------------- */
  events: {
    name: 'Event management / Decor', group: 'Events & media', clientLabel: 'Client', docTitle: 'Tax Invoice',
    template: 'bold', accent: '#9333ea', tax: 18,
    fields: [F('event', 'Event', { sample: 'Wedding' }), D('eventDate', 'Event date'), F('venue', 'Venue', { sample: 'Grand Convention Centre' })], clientFields: [], itemCols: [],
    items: [['Stage decoration', 'event', 45000, 18, '998596'], ['Sound & lights', 'event', 25000, 18, '998596'], ['Photography & video', 'event', 40000, 18, '998383'], ['Anchor / MC', 'event', 15000, 18, '999623']],
  },
  photography: {
    name: 'Photography / Studio / Media', group: 'Events & media', clientLabel: 'Client', docTitle: 'Invoice',
    template: 'minimal', accent: '#0f172a', tax: 18,
    fields: [F('shoot', 'Shoot', { sample: 'Pre-wedding' }), D('shootDate', 'Shoot date')], clientFields: [], itemCols: [],
    items: [['Photo shoot (full day)', 'day', 25000, 18, '998383'], ['Album (40 pages)', 'pcs', 12000, 12, '4911'], ['Video edit', 'job', 8000, 18, '999612'], ['Drone coverage', 'day', 6000, 18, '998383']],
  },

  /* ---------------- Community & others ---------------- */
  ngo: {
    name: 'NGO / Trust / Temple / Church', group: 'Community & others', clientLabel: 'Donor', docTitle: 'Donation Receipt',
    template: 'classic', accent: '#b45309', tax: 0, hide: ['hsn', 'taxCol', 'discountCol'], labels: { item: 'Purpose' },
    fields: [F('reg80g', '80G Reg. No.', { sample: 'AAATS1234E/80G/2024' }), F('mode', 'Mode', { sample: 'UPI' })], clientFields: [F('pan', 'PAN')], itemCols: [],
    items: [['General donation', 'once', 1000, 0, ''], ['Annadanam', 'once', 2500, 0, ''], ['Education support', 'once', 5000, 0, '']],
  },
  association: {
    name: 'Club / Association / Society', group: 'Community & others', clientLabel: 'Member', docTitle: 'Membership Bill',
    template: 'modern', accent: '#0369a1', tax: 0, hide: ['hsn'],
    fields: [F('period', 'Period', { sample: '2026-27' })], clientFields: [F('memberId', 'Member No.', { sample: 'MB-55' }), F('flat', 'Flat / Unit', { sample: 'C-402' })], itemCols: [],
    items: [['Annual membership', 'year', 2500, 0, ''], ['Maintenance charges', 'month', 2200, 0, ''], ['Sinking fund', 'month', 300, 0, ''], ['Hall booking', 'day', 3000, 18, '997212']],
  },
  general: {
    name: 'General business', group: 'Community & others', clientLabel: 'Client', docTitle: 'Tax Invoice',
    template: 'modern', accent: '#2563eb', tax: 18,
    fields: [PO, REF], clientFields: [], itemCols: [],
    items: [['Consulting service', 'hour', 1500, 18, '998311'], ['Product', 'pcs', 500, 18, ''], ['Installation charges', 'job', 1000, 18, '998719']],
  },
  custom: {
    name: 'Custom (build your own)', group: 'Community & others', clientLabel: 'Customer', docTitle: 'Invoice',
    template: 'modern', accent: '#4f46e5', tax: 18, custom: true,
    fields: [], clientFields: [], itemCols: [],
    items: [['Product or service', 'pcs', 100, 18, '']],
  },
};

export const industry = (key) => INDUSTRIES[key] || INDUSTRIES.general;

/** Sectors grouped for pickers: [[group, [[key, preset], ...]], ...] */
export function groupedIndustries() {
  return GROUPS.map((g) => [g, Object.entries(INDUSTRIES).filter(([, v]) => v.group === g)]).filter(([, l]) => l.length);
}

/**
 * The sector as this business uses it: the preset with the business's own
 * edits (fields, customer fields, item columns, insurance share) applied.
 */
export function sectorOf(settings) {
  const p = industry(settings && settings.industry);
  const o = (settings && settings.sector) || {};
  return {
    ...p,
    fields: Array.isArray(o.fields) ? o.fields : p.fields,
    clientFields: Array.isArray(o.clientFields) ? o.clientFields : p.clientFields,
    itemCols: Array.isArray(o.itemCols) ? o.itemCols : p.itemCols,
    insurance: typeof o.insurance === 'boolean' ? o.insurance : !!p.insurance,
  };
}

/** Starter catalogue for an industry in the item store's shape. */
export function starterItems(key) {
  return industry(key).items.map(([name, unit, rate, tax, hsn, category]) => ({
    name, unit, rate, tax, hsn: hsn || '', category: category || '', description: '',
  }));
}

/** A believable value for a field, used for sample data and previews. */
export function sampleValue(f, i = 0, baseDate = '') {
  if (f.sample) return f.sample;
  if (f.type === 'date') return baseDate;
  if (f.options) return f.options[1 + (i % (f.options.length - 1))] || '';
  if (/age/i.test(f.key)) return String(28 + i * 13);
  return '';
}
