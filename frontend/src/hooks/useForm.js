import { useState } from 'react';

// Form state in one object. <Input {...bind('email')} /> wires up value and onChange.
export function useForm(initial) {
  const [form, setForm] = useState(initial);
  const bind = (name) => ({ value: form[name], onChange: (e) => setForm({ ...form, [name]: e.target.value }) });
  return [form, bind, setForm];
}
