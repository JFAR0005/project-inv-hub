
import React from 'react';
import { FileText } from 'lucide-react';

interface FileIconProps {
  fileName: string;
}

const FileIcon: React.FC<FileIconProps> = ({ fileName }) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch(extension) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'doc':
    case 'docx':
      return <FileText className="h-5 w-5 text-blue-500" />;
    case 'xls':
    case 'xlsx':
      return <FileText className="h-5 w-5 text-green-500" />;
    case 'ppt':
    case 'pptx':
      return <FileText className="h-5 w-5 text-orange-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

export default FileIcon;
