
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { CompanyDocumentsProps } from './documents/types';
import { useCompanyFiles } from './documents/useCompanyFiles';
import FileUploadDialog from './documents/FileUploadDialog';
import DocumentsTable from './documents/DocumentsTable';
import EmptyDocuments from './documents/EmptyDocuments';

const CompanyDocuments: React.FC<CompanyDocumentsProps> = ({ companyId }) => {
  const { files, loading, error, refetch } = useCompanyFiles(companyId);
  const { user } = useAuth();
  const { canEditCompany } = useRoleAccess();
  const canUploadFiles = canEditCompany(companyId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" size="sm" onClick={refetch} className="ml-2">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Company Documents</h3>
        
        {canUploadFiles && (
          <FileUploadDialog companyId={companyId} onUploadComplete={refetch} />
        )}
      </div>
      
      {files.length === 0 ? (
        <EmptyDocuments />
      ) : (
        <DocumentsTable 
          files={files}
          companyId={companyId}
          canUploadFiles={canUploadFiles}
          onDeleteComplete={refetch}
        />
      )}
    </div>
  );
};

export default CompanyDocuments;
