import React from 'react';

interface ConfirmDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <>
    {/* Overlay */}
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-40"></div>
    {/* Modal */}
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm mx-auto">
        <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
        <p className="mb-4">Are you sure you want to delete this listing?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </>
  );
};

export default ConfirmDeleteModal;
