import { forwardRef, TextareaHTMLAttributes } from 'react';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
 label: string;
 id: string;
 error?: string;
 helperText?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
 ({ label, id, error, helperText, ...props }, ref) => {
  return (
   <div>
    <label htmlFor={id} className="label">
     {label}
    </label>
    <textarea
     ref={ref}
     id={id}
     className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
     rows={4}
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

FormTextarea.displayName = 'FormTextarea'; 