import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

const variantClasses = {
  primary: `
    bg-primary-700 text-white
    hover:bg-primary-900 active:bg-primary-900
    disabled:bg-neutral-300 disabled:text-neutral-500
    shadow-sm hover:shadow-md
  `,
  secondary: `
    bg-neutral-100 text-neutral-900
    hover:bg-neutral-200 active:bg-neutral-300
    disabled:bg-neutral-100 disabled:text-neutral-500
    border border-neutral-200
  `,
  ghost: `
    bg-transparent text-neutral-700
    hover:bg-neutral-100 active:bg-neutral-200
    disabled:text-neutral-500
  `,
};

const sizeClasses = {
  sm: 'px-md py-sm text-body-sm min-h-[36px]',
  md: 'px-lg py-sm text-body min-h-[44px]',
  lg: 'px-xl py-md text-body-lg min-h-[52px] font-semibold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        rounded-md font-semibold
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <span className="ml-2">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
