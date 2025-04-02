import { forwardRef, InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
 label: string;
 id: string;
 error?: string;
 helperText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
 ({ label, id, error, helperText, ...props }, ref) => {
  return (
   <div>
    <label htmlFor={id} className="label">
     {label}
    </label>
    <input
     ref={ref}
     id={id}
     className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
     {...props}
    />
    {error ? (
     <p className="mt-1 text-sm text-red-600">{error}</p>
    ) : helperText ? (
     <p className="mt-1 text-sm text-gray-500">{helperText}</p>
    ) : null}
   </div>
  );
 }
);

FormInput.displayName = 'FormInput'; 