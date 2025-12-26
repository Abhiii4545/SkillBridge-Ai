import { Internship } from './types';

export const MOCK_INTERNSHIPS: Internship[] = [
  {
    id: '1',
    title: 'Frontend Developer Intern',
    company: 'TechFlow Solutions',
    location: 'Hitech City, Hyderabad',
    type: 'On-site',
    stipend: '₹15,000/mo',
    description: 'We are looking for a passionate React developer to help build our main SaaS product. You will work directly with the CTO.',
    requiredSkills: ['React', 'JavaScript', 'Tailwind CSS', 'Git'],
    postedDate: '2023-10-25'
  },
  {
    id: '2',
    title: 'AI/ML Research Intern',
    company: 'NextGen AI Labs',
    location: 'T-Hub, Hyderabad',
    type: 'Hybrid',
    stipend: '₹25,000/mo',
    description: 'Join our research team to work on NLP models. Experience with Python and PyTorch is a must. Great opportunity to publish papers.',
    requiredSkills: ['Python', 'PyTorch', 'Machine Learning', 'NLP'],
    postedDate: '2023-10-24'
  },
  {
    id: '3',
    title: 'Full Stack Engineer Intern',
    company: 'UrbanKisaan',
    location: 'Jubilee Hills, Hyderabad',
    type: 'On-site',
    stipend: '₹20,000/mo',
    description: 'Help us revolutionize urban farming. Need someone who can handle Node.js backend and React frontend.',
    requiredSkills: ['Node.js', 'React', 'MongoDB', 'Express'],
    postedDate: '2023-10-22'
  },
  {
    id: '4',
    title: 'Data Analyst Intern',
    company: 'Deloitte',
    location: 'Gachibowli, Hyderabad',
    type: 'On-site',
    stipend: '₹30,000/mo',
    description: 'Work with large datasets to derive business insights. SQL and Excel mastery required. Visualization tools are a plus.',
    requiredSkills: ['SQL', 'Excel', 'Tableau', 'Python'],
    postedDate: '2023-10-20'
  },
  {
    id: '5',
    title: 'Cloud DevOps Intern',
    company: 'Darwinbox',
    location: 'Madhapur, Hyderabad',
    type: 'Hybrid',
    stipend: '₹22,000/mo',
    description: 'Assist in managing our AWS infrastructure. Good understanding of Linux and Docker is appreciated.',
    requiredSkills: ['AWS', 'Docker', 'Linux', 'Jenkins'],
    postedDate: '2023-10-18'
  }
];