import React from 'react';

function LoadingSpinner({ fullPage = false, small = false, message = "Loading..." }) {
  if (small) {
    return <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>;
  }

  const style = fullPage
    ? {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        color: 'var(--text-primary)'
      }
    : {
        color: 'var(--text-primary)',
        textAlign: 'center',
        marginTop: '2rem'
      };

  return (
    <div id="loadingSpinner" style={style}>
      <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">{message}</p>
    </div>
  );
}

export default LoadingSpinner;