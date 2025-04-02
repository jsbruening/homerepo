import { forwardRef, SelectHTMLAttributes } from 'react';

interface Option {
 value: string;
 label: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
 label: string;
 id: string;
 error?: string;
 helperText?: string;
 options: Option[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
 ({ label, id, error, helperText, options, ...props }, ref) => {
  return (
   <div>
    <label htmlFor={id} className="label">
     {label}
    </label>
    <select
     ref={ref}
     id={id}
     className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
     {...props}
    >
     <option value="">Select an option</option>
     {options.map((option) => (
      <option key={option.value} value={option.value}>
       {option.label}
      </option>
     ))}
    </select>
    {error ? (
     <p className="mt-1 text-sm text-red-600">{error}</p>
    ) : helperText ? (
     <p className="mt-1 text-sm text-gray-500">{helperText}</p>
    ) : null}
   </div>
  );
 }
);

FormSelect.displayName = 'FormSelect'; 