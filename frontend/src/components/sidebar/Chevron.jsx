import { ChevronDown } from 'lucide-react';

const Chevron = ({ isOpen }) => (
  <ChevronDown className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
);

export default Chevron;
