export interface DistrictItem {
  name: string;
  division: string;
  areas: string[];
}

export const BD_DIVISIONS = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
];

export const BD_DISTRICTS: Record<string, string[]> = {
  Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Narsingdi', 'Manikganj', 'Munshiganj', 'Kishoreganj', 'Faridpur', 'Gopalganj'],
  Chattogram: ['Chattogram', 'Cox\'s Bazar', 'Cumilla', 'Feni', 'Noakhali', 'Brahmanbaria', 'Chandpur', 'Rangamati', 'Bandarban', 'Khagrachhari'],
  Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rajshahi: ['Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Naogaon', 'Natore', 'Chapai Nawabganj', 'Joypurhat'],
  Khulna: ['Khulna', 'Jashore', 'Kushtia', 'Satkhira', 'Jhenaidah', 'Bagerhat', 'Chuadanga', 'Magura', 'Meherpur', 'Narail'],
  Barishal: ['Barishal', 'Patuakhali', 'Bhola', 'Pirojpur', 'Jhalokathi', 'Barguna'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Kurigram', 'Gaibandha', 'Nilphamari', 'Thakurgaon', 'Lalmonirhat', 'Panchagarh'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'],
};

export const DHAKA_AREAS = [
  'Dhanmondi',
  'Gulshan 1',
  'Gulshan 2',
  'Banani',
  'Uttara Sector 1-14',
  'Mirpur 1-14',
  'Mohakhali',
  'Badda',
  'Bashundhara R/A',
  'Mohammadpur',
  'Motijheel',
  'Old Dhaka (Lalbagh/Kotwali)',
  'Khilgaon',
  'Malibagh',
  'Shantinagar',
  'Baridhara',
  'Tejgaon',
  'Rampura',
  'Farmgate',
  'Paltan',
  'Lalmatia',
  'Savar',
  'Keraniganj'
];
