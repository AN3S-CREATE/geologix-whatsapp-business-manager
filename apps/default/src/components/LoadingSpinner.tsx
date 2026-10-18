import * as React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '', 
  fullScreen = false 
}) => {
  const content = (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && (
        <span className="text-gray-600 font-medium">{text}</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export const LoadingCard: React.FC<{ text?: string; className?: string }> = ({ 
  text = "Loading...", 
  className = "" 
}) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center ${className}`}>
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}> = ({ 
  loading, 
  children, 
  loadingText, 
  className = '', 
  onClick, 
  disabled = false,
  type = 'button'
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading || disabled}
    className={`flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {loading ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{loadingText || 'Loading...'}</span>
      </>
    ) : (
      children
    )}
  </button>
);