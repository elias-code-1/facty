import React from 'react';
import Spinner from './Spinner';

const FullPageSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-slate-50">
    <Spinner size="lg" />
  </div>
);

export default FullPageSpinner;
