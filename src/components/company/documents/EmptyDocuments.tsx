
import React from 'react';
import { FileText, Upload } from 'lucide-react';

interface EmptyDocumentsProps {
  canUpload?: boolean;
}

const EmptyDocuments: React.FC<EmptyDocumentsProps> = ({ canUpload = false }) => {
  return (
    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents uploaded</h3>
      <p className="text-gray-600 mb-4">
        {canUpload 
          ? "Upload documents like pitch decks, financial reports, or legal documents for this company."
          : "No documents have been uploaded for this company yet."
        }
      </p>
      {canUpload && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Upload className="h-4 w-4" />
          <span>Click "Upload Document" to get started</span>
        </div>
      )}
    </div>
  );
};

export default EmptyDocuments;
