import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%'),
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${variantClasses[variant]} ${className}`}
      style={style}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <Skeleton variant="text" height="1.5rem" width="60%" />
      <Skeleton variant="text" height="1rem" width="100%" />
      <Skeleton variant="text" height="1rem" width="90%" />
      <Skeleton variant="text" height="1rem" width="80%" />
      <div className="flex gap-2 mt-4">
        <Skeleton variant="rectangular" height="2.5rem" width="6rem" />
        <Skeleton variant="rectangular" height="2.5rem" width="6rem" />
      </div>
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <Skeleton variant="circular" width="3rem" height="3rem" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" height="1rem" width="40%" />
            <Skeleton variant="text" height="0.875rem" width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
};
