import Input from '../../components/ui/Input';

export default function SearchBox({ value, onChange, placeholder }) {
  return <Input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mb-4 w-full max-w-sm text-sm" />;
}
