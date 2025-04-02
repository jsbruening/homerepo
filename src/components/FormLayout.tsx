import { ReactNode } from 'react';

interface FormLayoutProps {
 title: string;
 description?: string;
 children: ReactNode;
 onSubmit: (e: React.FormEvent) => void;
 onCancel: () => void;
 submitLabel?: string;
 cancelLabel?: string;
 isSubmitting?: boolean;
}

export default function FormLayout({
 title,
 description,
 children,
 onSubmit,
 onCancel,
 submitLabel = 'Save',
 cancelLabel = 'Cancel',
 isSubmitting = false,
}: FormLayoutProps) {
 return (
  <div className="bg-white shadow rounded-lg">
   <div className="px-4 py-5 sm:p-6">
    <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
    {description && (
     <p className="mt-1 text-sm text-gray-500">
      {description}
     </p>
    )}

    <form onSubmit={onSubmit} className="mt-5 space-y-6">
     {children}

     <div className="flex justify-end space-x-3">
      <button
       type="button"
       className="btn btn-secondary"
       onClick={onCancel}
      >
       {cancelLabel}
      </button>
      <button
       type="submit"
       className="btn btn-primary"
       disabled={isSubmitting}
      >
       {isSubmitting ? 'Saving...' : submitLabel}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
} 