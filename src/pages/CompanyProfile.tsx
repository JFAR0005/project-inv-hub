
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Download, FileText, PlusCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase, getCompanyFileUrl } from '@/integrations/supabase/client';
import { FounderUpdate, Metric, CompanyFile, RaiseStatus } from '@/types/reporting';

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [company, setCompany] = useState<any>(null);
  const [updates, setUpdates] = useState<FounderUpdate[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [files, setFiles] = useState<CompanyFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Access control check
  useEffect(() => {
    if (user && user.role === 'founder' && user.companyId !== id) {
      toast({
        title: "Access Denied",
        description: "You can only view your own company",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, id, navigate, toast]);

  // Fetch company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Fetch company details
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .single();
          
        if (companyError) throw companyError;
        setCompany(companyData);
        
        // Fetch founder updates
        const { data: updatesData, error: updatesError } = await supabase
          .from('founder_updates')
          .select('*')
          .eq('company_id', id)
          .order('submitted_at', { ascending: false });
          
        if (updatesError) throw updatesError;
        // Cast raise_status to RaiseStatus type
        const typedUpdates: FounderUpdate[] = updatesData.map(update => ({
          ...update,
          raise_status: update.raise_status as RaiseStatus
        }));
        setUpdates(typedUpdates);
        
        // Fetch metrics for charts
        const { data: metricsData, error: metricsError } = await supabase
          .from('metrics')
          .select('*')
          .eq('company_id', id)
          .order('date', { ascending: true });
          
        if (metricsError) throw metricsError;
        setMetrics(metricsData);
        
        // Fetch company files
        const { data: filesData, error: filesError } = await supabase
          .from('company_files')
          .select('*')
          .eq('company_id', id)
          .order('uploaded_at', { ascending: false });
          
        if (filesError) throw filesError;
        setFiles(filesData);
      } catch (error) {
        console.error('Error fetching company data:', error);
        toast({
          title: "Error",
          description: "Failed to load company data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyData();
  }, [id, toast]);

  // Helper function to format metrics for charts
  const prepareMetricData = (metricName: string) => {
    return metrics
      .filter(m => m.metric_name === metricName)
      .map(m => ({
        date: format(new Date(m.date), 'MMM dd'),
        value: m.value
      }))
      .slice(-12); // Show last 12 months/entries
  };

  // Handle file download
  const handleFileDownload = async (fileUrl: string, fileName: string) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('company_files')
        .download(fileUrl);
        
      if (error) throw error;
      
      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  // Render badge based on raise status
  const getRaiseStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    switch (status) {
      case 'Raising':
        return <Badge variant="destructive">{status}</Badge>;
      case 'Planning':
        return <Badge variant="outline">{status}</Badge>;
      case 'Closed':
        return <Badge variant="default">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading company data...</div>
        </div>
      </Layout>
    );
  }

  // Handle case where company is not found
  if (!company) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle>Company Not Found</CardTitle>
              <CardDescription>
                The company you are looking for does not exist or you don't have access to it.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {company.sector && (
                <Badge variant="outline">{company.sector}</Badge>
              )}
              {company.stage && (
                <Badge variant="secondary">{company.stage}</Badge>
              )}
              {company.location && (
                <span className="text-sm text-muted-foreground">{company.location}</span>
              )}
            </div>
          </div>
          
          {user && user.role === 'founder' && user.companyId === id && (
            <Button onClick={() => navigate('/submit-update')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit Update
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Info</CardTitle>
                </CardHeader>
                <CardContent>
                  {company.description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                      <p>{company.description}</p>
                    </div>
                  )}
                  
                  {company.website && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Website</h4>
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Stage</h4>
                      <p>{company.stage || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
                      <p>{company.location || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Latest Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {updates.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h4>
                        <p>{format(new Date(updates[0].submitted_at), 'PPP')}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">ARR</h4>
                          <p>${updates[0].arr ? updates[0].arr.toLocaleString() : 'N/A'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">MRR</h4>
                          <p>${updates[0].mrr ? updates[0].mrr.toLocaleString() : 'N/A'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Burn Rate</h4>
                          <p>${updates[0].burn_rate ? updates[0].burn_rate.toLocaleString() : 'N/A'}/mo</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Runway</h4>
                          <p>{updates[0].runway ? `${updates[0].runway} months` : 'N/A'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Headcount</h4>
                          <p>{updates[0].headcount || 'N/A'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Churn</h4>
                          <p>{updates[0].churn ? `${updates[0].churn}%` : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No updates submitted yet</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Fundraising</CardTitle>
                </CardHeader>
                <CardContent>
                  {updates.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                        <div className="mt-1">
                          {getRaiseStatusBadge(updates[0].raise_status)}
                        </div>
                      </div>
                      
                      {updates[0].raise_status === 'Raising' && (
                        <>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Target Amount</h4>
                            <p>${updates[0].raise_target_amount ? updates[0].raise_target_amount.toLocaleString() : 'N/A'}</p>
                          </div>
                          
                          {updates[0].requested_intros && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Requested Intros</h4>
                              <p>{updates[0].requested_intros}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {!updates[0].raise_status || updates[0].raise_status === 'Not Raising' ? (
                        <p className="text-sm text-muted-foreground">Not currently fundraising</p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No fundraising information available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ARR Growth</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {prepareMetricData('ARR').length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareMetricData('ARR')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'ARR']} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="ARR" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No ARR data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Headcount Growth</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {prepareMetricData('Headcount').length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareMetricData('Headcount')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value, 'Headcount']} />
                        <Legend />
                        <Bar dataKey="value" name="Headcount" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No headcount data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Burn</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {prepareMetricData('Burn Rate').length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareMetricData('Burn Rate')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Burn Rate']} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Burn Rate" stroke="#ff7300" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No burn data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Runway</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {prepareMetricData('Runway').length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareMetricData('Runway')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} months`, 'Runway']} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Runway (months)" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No runway data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="updates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Updates</CardTitle>
                <CardDescription>
                  All founder updates in chronological order
                </CardDescription>
              </CardHeader>
              <CardContent>
                {updates.length > 0 ? (
                  <div className="space-y-8">
                    {updates.map((update) => (
                      <div key={update.id} className="border rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium">
                              Update - {format(new Date(update.submitted_at), 'MMMM d, yyyy')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Submitted {format(new Date(update.submitted_at), 'PPp')}
                            </p>
                          </div>
                          {getRaiseStatusBadge(update.raise_status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">ARR</h4>
                            <p>${update.arr ? update.arr.toLocaleString() : 'N/A'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">MRR</h4>
                            <p>${update.mrr ? update.mrr.toLocaleString() : 'N/A'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Burn Rate</h4>
                            <p>${update.burn_rate ? update.burn_rate.toLocaleString() : 'N/A'}/mo</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Runway</h4>
                            <p>{update.runway ? `${update.runway} months` : 'N/A'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Headcount</h4>
                            <p>{update.headcount || 'N/A'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Churn</h4>
                            <p>{update.churn ? `${update.churn}%` : 'N/A'}</p>
                          </div>
                        </div>
                        
                        {update.comments && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Commentary</h4>
                            <div className="bg-muted p-3 rounded-md whitespace-pre-line">
                              {update.comments}
                            </div>
                          </div>
                        )}
                        
                        {update.requested_intros && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Requested Introductions</h4>
                            <div className="bg-muted p-3 rounded-md">
                              {update.requested_intros}
                            </div>
                          </div>
                        )}
                        
                        {update.deck_url && (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span>Attached document</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-2"
                              onClick={() => handleFileDownload(update.deck_url!, `${company.name}-deck-${format(new Date(update.submitted_at), 'yyyy-MM-dd')}.pdf`)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No updates have been submitted yet</p>
                    
                    {user && user.role === 'founder' && user.companyId === id && (
                      <Button onClick={() => navigate('/submit-update')} className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Submit First Update
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Documents</CardTitle>
                <CardDescription>
                  Files and documents shared by the company
                </CardDescription>
              </CardHeader>
              <CardContent>
                {files.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              {file.file_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(file.uploaded_at), 'PP')}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleFileDownload(file.file_url, file.file_name)}
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No documents have been uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
