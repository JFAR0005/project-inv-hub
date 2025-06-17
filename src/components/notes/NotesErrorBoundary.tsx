
import React from 'react';
import { AlertTriangle, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NotesErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
  onCreateNote?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class NotesErrorBoundary extends React.Component<NotesErrorBoundaryProps, State> {
  constructor(props: NotesErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Notes error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
              <p className="text-muted-foreground">
                Create and manage your notes
              </p>
            </div>
            {this.props.onCreateNote && (
              <Button onClick={this.props.onCreateNote}>
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Unable to load notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                There was an error loading your notes. This might be because the database tables haven't been set up yet.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                    this.props.onRetry?.();
                  }}
                  size="sm"
                >
                  Try Again
                </Button>
                {this.props.onCreateNote && (
                  <Button variant="outline" size="sm" onClick={this.props.onCreateNote}>
                    <FileText className="w-4 h-4 mr-2" />
                    Create First Note
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NotesErrorBoundary;
