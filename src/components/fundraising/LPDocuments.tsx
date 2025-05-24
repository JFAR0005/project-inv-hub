
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LPDocument {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  uploaded_by?: string;
}

interface LPDocumentsProps {
  lpLeadId: string;
  documents: LPDocument[];
  onRefetch: () => void;
}

const LPDocuments: React.FC<LPDocumentsProps> = ({ lpLeadId, documents, onRefetch }) => {
  const { toast } = useToast();

  const handleDownload = (document: LPDocument) => {
    window.open(document.file_url, '_blank');
  };

  const handleView = (document: LPDocument) => {
    window.open(document.file_url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Documents</CardTitle>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents uploaded</h3>
            <p className="text-muted-foreground">
              Upload DDQs, emails, or other relevant documents for this LP.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Uploaded Date</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.file_name}</TableCell>
                  <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                  <TableCell>{doc.uploaded_by || 'Unknown'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(doc)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default LPDocuments;
