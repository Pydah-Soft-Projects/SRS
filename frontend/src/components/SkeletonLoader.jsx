import React from 'react';
import styled, { keyframes } from 'styled-components';

// Shimmer animation for skeleton loading
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    var(--background) 0%,
    var(--primary-light) 50%,
    var(--background) 100%
  );
  background-size: 2000px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`;

// Skeleton Box - Basic building block
export const SkeletonBox = styled(SkeletonBase)`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '20px'};
  margin: ${props => props.margin || '0'};
`;

// Skeleton Circle - For avatars/icons
export const SkeletonCircle = styled(SkeletonBase)`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border-radius: 50%;
  margin: ${props => props.margin || '0'};
`;

// Skeleton Card - For card components
export const SkeletonCard = styled.div`
  background: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// Skeleton Table - For table components
export const SkeletonTable = styled.div`
  background: var(--surface);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$columns || 'repeat(5, 1fr)'};
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--primary-light);
  border-bottom: 2px solid var(--border);
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$columns || 'repeat(5, 1fr)'};
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  
  &:last-child {
    border-bottom: none;
  }
`;

// Dashboard Skeleton - For dashboard pages
export const DashboardSkeleton = () => (
  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
    {/* Header Skeleton */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <SkeletonBox width="280px" height="32px" />
        <SkeletonBox width="420px" height="16px" />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <SkeletonBox width="140px" height="16px" />
        <SkeletonBox width="100px" height="36px" style={{ borderRadius: '8px' }} />
      </div>
    </div>

    {/* Stats Cards Skeleton (4 blocks) */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
      gap: '1rem',
      width: '100%'
    }}>
      {[1, 2, 3, 4].map(i => (
        <SkeletonCard key={i} style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonBox width="80px" height="14px" />
            <SkeletonCircle size="36px" />
          </div>
          <SkeletonBox width="60px" height="32px" style={{ margin: '0.5rem 0' }} />
          <SkeletonBox width="110px" height="12px" />
        </SkeletonCard>
      ))}
    </div>

    {/* Filter bar Skeleton */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '0.85rem 1.25rem',
      background: 'var(--surface)',
      borderRadius: '10px',
      border: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[1, 2, 3].map(i => (
          <SkeletonBox key={i} width="90px" height="32px" style={{ borderRadius: '6px' }} />
        ))}
      </div>
      <SkeletonBox width="160px" height="32px" style={{ borderRadius: '6px' }} />
    </div>

    {/* Charts Skeleton */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
      gap: '1.25rem',
      width: '100%'
    }}>
      <SkeletonCard style={{ minHeight: '300px' }}>
        <SkeletonBox width="180px" height="20px" />
        <SkeletonBox width="100%" height="220px" style={{ marginTop: '1rem' }} />
      </SkeletonCard>
      <SkeletonCard style={{ minHeight: '300px' }}>
        <SkeletonBox width="180px" height="20px" />
        <SkeletonBox width="100%" height="220px" style={{ marginTop: '1rem' }} />
      </SkeletonCard>
    </div>
  </div>
);

// Card Grid Skeleton - For candidate/card-based layouts
export const CardGridSkeleton = ({ count = 6, columns = 'repeat(auto-fill, minmax(280px, 1fr))' }) => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: columns, 
    gap: '1.25rem',
    width: '100%'
  }}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SkeletonBox width="60%" height="20px" />
          <SkeletonBox width="25%" height="24px" style={{ borderRadius: '12px' }} />
        </div>
        <SkeletonBox width="100%" height="16px" margin="0.5rem 0" />
        <SkeletonBox width="80%" height="16px" />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <SkeletonBox width="30%" height="16px" />
          <SkeletonBox width="30%" height="32px" style={{ borderRadius: '6px' }} />
        </div>
      </SkeletonCard>
    ))}
  </div>
);

// Test Card Skeleton - For test lists
export const TestCardSkeleton = ({ count = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ width: '70%' }}>
            <SkeletonBox width="50%" height="24px" margin="0 0 0.5rem 0" />
            <SkeletonBox width="80%" height="16px" margin="0 0 0.75rem 0" />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <SkeletonBox width="80px" height="16px" />
              <SkeletonBox width="80px" height="16px" />
            </div>
          </div>
          <SkeletonBox width="100px" height="36px" style={{ borderRadius: '6px' }} />
        </div>
      </SkeletonCard>
    ))}
  </div>
);

// Table Skeleton - For table layouts
export const TableSkeleton = ({ rows = 5, columns = 'repeat(5, 1fr)' }) => (
  <SkeletonTable>
    <TableHeader $columns={columns}>
      {Array.from({ length: parseInt(columns.match(/\d+/) || 5) }).map((_, i) => (
        <SkeletonBox key={i} width="80%" height="16px" />
      ))}
    </TableHeader>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <TableRow key={rowIndex} $columns={columns}>
        {Array.from({ length: parseInt(columns.match(/\d+/) || 5) }).map((_, colIndex) => (
          <SkeletonBox key={colIndex} width={colIndex === 0 ? '70%' : '90%'} height="16px" />
        ))}
      </TableRow>
    ))}
  </SkeletonTable>
);

// Dedicated Full-Page Table Skeleton for fast route navigation
export const TablePageSkeleton = ({ rows = 8, columns = 'repeat(5, 1fr)' }) => (
  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {/* Page Title & Action Bar Skeleton */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      flexWrap: 'wrap', 
      gap: '0.75rem',
      padding: '0.5rem 0'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <SkeletonBox width="240px" height="28px" />
        <SkeletonBox width="340px" height="14px" />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <SkeletonBox width="110px" height="36px" style={{ borderRadius: '8px' }} />
        <SkeletonBox width="110px" height="36px" style={{ borderRadius: '8px' }} />
      </div>
    </div>

    {/* Search & Filter Toolbar Skeleton */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '0.75rem 1rem',
      background: 'var(--surface)',
      borderRadius: '10px',
      border: '1px solid var(--border)'
    }}>
      <SkeletonBox width="280px" height="34px" style={{ borderRadius: '6px' }} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <SkeletonBox width="90px" height="34px" style={{ borderRadius: '6px' }} />
        <SkeletonBox width="90px" height="34px" style={{ borderRadius: '6px' }} />
      </div>
    </div>

    {/* Table rows skeleton */}
    <TableSkeleton rows={rows} columns={columns} />
  </div>
);

// Unified SkeletonLoader Component
const SkeletonLoader = ({ 
  loading = true, 
  variant = 'card-grid', 
  count = 6, 
  rows = 5, 
  columns = 'repeat(5, 1fr)',
  children 
}) => {
  if (!loading) {
    return children || null;
  }

  switch (variant) {
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'table':
      return <TableSkeleton rows={rows} columns={columns} />;
    case 'table-page':
      return <TablePageSkeleton rows={rows} columns={columns} />;
    case 'card-grid':
      return <CardGridSkeleton count={count} columns={columns} />;
    case 'test-card':
      return <TestCardSkeleton count={count} />;
    default:
      return <CardGridSkeleton count={count} columns={columns} />;
  }
};

export default SkeletonLoader;
