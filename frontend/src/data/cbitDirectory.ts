import type { FacultyMember } from '../types';

export const CBIT_DEPARTMENTS = [
  'Chemical Engineering',
  'Mathematics',
  'Chemistry',
  'Physics',
  'Electrical and Electronics Engineering (EEE)',
  'Information Technology (IT)',
  'Computer Science and Engineering (CSE)',
  'Artificial Intelligence & Machine Learning (AI&ML)',
  'Artificial Intelligence & Data Science (AI&DS)',
  'Electronics and Communication Engineering (ECE)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'English & Humanities',
  'Master of Computer Applications (MCA)',
  'School of Management Studies (SMS / MBA)'
] as const;

export const CBIT_DESIGNATIONS = [
  'Professor & HOD',
  'Associate Professor & HOD',
  'Adjunct Professor',
  'Associate Professor',
  'Assistant Professor',
  'JR Faculty',
  'Technician Grade I',
  'Technician Grade III',
  'Lab Technician Grade III (Contract)',
  'Administrative Executive',
  'Special Grade Attender',
  'Principal',
  'Vice-Principal (Administration)',
  'Vice-Principal (Academics)'
] as const;

/**
 * Official CBIT Freshers' Day 2026 Faculty & Staff Roster
 * Includes Junior Batch Faculty (JR Faculty) & Our Batch Faculty (Chemical Engineering department)
 */
export const VERIFIED_CBIT_STARTER_DATA: Omit<FacultyMember, 'id' | 'created_at' | 'updated_at'>[] = [
  // --- JUNIOR BATCH FACULTY (JR Faculty) ---
  {
    name: 'M. Tirupathi Rao',
    designation: 'Assistant Professor (JR Faculty)',
    department: 'Mathematics',
    faculty_group: 'Junior Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'JR Faculty'
  },
  {
    name: 'Dr. K. Laxmi',
    designation: 'Professor (JR Faculty)',
    department: 'Chemistry',
    faculty_group: 'Junior Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'JR Faculty'
  },
  {
    name: 'Dr. K. Sukanth',
    designation: 'Assistant Professor (JR Faculty)',
    department: 'Electrical and Electronics Engineering (EEE)',
    faculty_group: 'Junior Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'JR Faculty'
  },
  {
    name: 'Ms. Shamia Karim',
    designation: 'Assistant Professor (JR Faculty)',
    department: 'Information Technology (IT)',
    faculty_group: 'Junior Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'JR Faculty'
  },
  {
    name: 'Ms. M. Lavanya',
    designation: 'Assistant Professor (JR Faculty)',
    department: 'Artificial Intelligence & Machine Learning (AI&ML)',
    faculty_group: 'Junior Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'JR Faculty - CSE (AI & ML)'
  },
  {
    name: 'Dr. Swatmaram',
    designation: 'Associate Professor & HOD',
    department: 'Mathematics',
    faculty_group: 'Junior Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'Mathematics Department HOD'
  },
  {
    name: 'Prof. B. Sreenivasa Reddy',
    designation: 'Professor & HOD',
    department: 'Physics',
    faculty_group: 'Junior Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'Physics Department HOD'
  },

  // --- OUR BATCH FACULTY & STAFF (Chemical Engineering) ---
  {
    name: 'Dr. M. Mukunda Vani',
    designation: 'Professor & HOD',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'Chemical Engineering Head of Department'
  },
  {
    name: 'Dr. Ravi Gujjula',
    designation: 'Adjunct Professor',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: ''
  },
  {
    name: 'Dr. P. V. Naga Prapurna',
    designation: 'Associate Professor',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: ''
  },
  {
    name: 'Dr. N. L. N. Reddy',
    designation: 'Associate Professor',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: ''
  },
  {
    name: 'Dr. Mekala Mallaiah',
    designation: 'Associate Professor',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: ''
  },
  {
    name: 'Sri I. Balakrishna',
    designation: 'Assistant Professor',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: ''
  },
  {
    name: 'Dr. P. Madhuri',
    designation: 'Assistant Professor',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: ''
  },
  {
    name: 'Dr. B. Ganesh',
    designation: 'Assistant Professor',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: ''
  },
  {
    name: 'Dr. Prasanna Rani R',
    designation: 'Assistant Professor',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: ''
  },
  {
    name: 'Dr. Seriyala Anil Kumar',
    designation: 'Assistant Professor',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: ''
  },
  {
    name: 'Dr. Snigdha Saha',
    designation: 'Assistant Professor',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: ''
  },
  {
    name: 'Sri M. Laxmana Chary',
    designation: 'Technician Grade I',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'Department Technical Staff'
  },
  {
    name: 'Sri V. Sanjeeva Reddy',
    designation: 'Technician Grade III',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'Department Technical Staff'
  },
  {
    name: 'Mr. N. Raj Kumar',
    designation: 'Administrative Executive',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'Department Administration'
  },
  {
    name: 'Mrs. Siddam Mounika',
    designation: 'Administrative Executive',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'Department Administration'
  },
  {
    name: 'Mrs. Palabindela Anitha',
    designation: 'Lab Technician Grade III (Contract)',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'Department Laboratory Staff'
  },
  {
    name: 'Mr. G. Raju',
    designation: 'Special Grade Attender',
    department: 'Chemical Engineering',
    faculty_group: 'Our Batch Faculty',
    status: 'Not invited',
    invited_by: null,
    invited_at: null,
    notes: 'Department Attender Staff'
  }
];

export const SAMPLE_CSV_CONTENT = `Name,Designation,Department,Group,Status,Invited By,Notes
M. Tirupathi Rao,Assistant Professor (JR Faculty),Mathematics,Junior Batch Faculty,Not invited,,JR Faculty
Dr. K. Laxmi,Professor (JR Faculty),Chemistry,Junior Batch Faculty,Not invited,,JR Faculty
Dr. K. Sukanth,Assistant Professor (JR Faculty),Electrical and Electronics Engineering (EEE),Junior Batch Faculty,Not invited,,JR Faculty
Ms. Shamia Karim,Assistant Professor (JR Faculty),Information Technology (IT),Junior Batch Faculty,Not invited,,JR Faculty
Ms. M. Lavanya,Assistant Professor (JR Faculty),Artificial Intelligence & Machine Learning (AI&ML),Junior Batch Faculty,Not invited,,JR Faculty - CSE (AI & ML)
Dr. M. Mukunda Vani,Professor & HOD,Chemical Engineering,Our Batch Faculty,Not invited,,Head of Department
Dr. Ravi Gujjula,Adjunct Professor,Chemical Engineering,Our Batch Faculty,Not invited,,
Dr. P. V. Naga Prapurna,Associate Professor,Chemical Engineering,Our Batch Faculty,Not invited,,
Dr. N. L. N. Reddy,Associate Professor,Chemical Engineering,Our Batch Faculty,Not invited,,
Dr. Mekala Mallaiah,Associate Professor,Chemical Engineering,Our Batch Faculty,Not invited,,
Sri I. Balakrishna,Assistant Professor,Chemical Engineering,Our Batch Faculty,Not invited,,
Dr. P. Madhuri,Assistant Professor,Chemical Engineering,Our Batch Faculty,Not invited,,
Dr. B. Ganesh,Assistant Professor,Chemical Engineering,Our Batch Faculty,Not invited,,
Dr. Prasanna Rani R,Assistant Professor,Chemical Engineering,Our Batch Faculty,Not invited,,
Dr. Seriyala Anil Kumar,Assistant Professor,Chemical Engineering,Our Batch Faculty,Not invited,,
Dr. Snigdha Saha,Assistant Professor,Chemical Engineering,Our Batch Faculty,Not invited,,
Sri M. Laxmana Chary,Technician Grade I,Chemical Engineering,Our Batch Faculty,Not invited,,
Sri V. Sanjeeva Reddy,Technician Grade III,Chemical Engineering,Our Batch Faculty,Not invited,,
Mr. N. Raj Kumar,Administrative Executive,Chemical Engineering,Our Batch Faculty,Not invited,,
Mrs. Siddam Mounika,Administrative Executive,Chemical Engineering,Our Batch Faculty,Not invited,,
Mrs. Palabindela Anitha,Lab Technician Grade III (Contract),Chemical Engineering,Our Batch Faculty,Not invited,,
Mr. G. Raju,Special Grade Attender,Chemical Engineering,Our Batch Faculty,Not invited,,
Dr. Swatmaram,Associate Professor & HOD,Mathematics,Junior Batch Faculty,Not invited,,Mathematics HOD
Prof. B. Sreenivasa Reddy,Professor & HOD,Physics,Junior Batch Faculty,Not invited,,Physics HOD
`;
