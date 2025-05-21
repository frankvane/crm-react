import React from 'react';

interface AddPatientButtonProps {
  onClick?: () => void;
}

const AddPatientButton: React.FC<AddPatientButtonProps> = ({ onClick }) => {
  return (
    <button
      style={{
        color: '#fff',
        border: 'none',
        background: '#1677ff',
        padding: '8px 20px',
        borderRadius: 6,
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: 16,
        boxShadow: '0 1px 4px rgba(22,119,255,0.08)',
        transition: 'background 0.2s',
        outline: 'none',
      }}
      onClick={onClick}
    >
      新增病患
    </button>
  );
};

export default AddPatientButton; 