import type { ReactNode } from 'react';

interface FormFieldProps {
  label?: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
  style?: React.CSSProperties;
}

export default function FormField({ label, error, children, required, style }: FormFieldProps) {
  return (
    <div style={{ marginBottom: 24, ...style }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          {required && <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>}
          {label}
        </label>
      )}
      {children}
      {error && (
        <div style={{ color: '#ff4d4f', fontSize: 14, marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}
