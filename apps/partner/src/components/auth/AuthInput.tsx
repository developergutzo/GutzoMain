import { forwardRef } from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, className = "", style, ...props }, ref) => {
    return (
      <div style={{ 
        width: '100%', 
        textAlign: 'left',
        margin: '0',
        padding: '0',
        display: 'block',
        position: 'relative',
        left: '0'
      }}>
        {label && (
          <label style={{ 
            textAlign: 'left', 
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem',
            marginLeft: '0',
            marginRight: '0',
            position: 'relative',
            left: '0'
          }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          style={{ 
            textAlign: 'left', 
            width: '100%',
            margin: '0',
            padding: '0.75rem 1rem',
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '1rem',
            color: '#111827',
            minHeight: '72px',
            fontSize: '1.125rem',
            position: 'relative',
            left: '0',
            ...style
          }}
          className={className}
          {...props}
        />
        {error && (
          <p style={{ 
            textAlign: 'left',
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: '#DC2626',
            marginLeft: '0',
            position: 'relative',
            left: '0'
          }}>{error}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";