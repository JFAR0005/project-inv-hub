
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface LPLead {
  id: string;
  name: string;
  type: 'Individual' | 'Family Office' | 'Institutional';
  status: 'Contacted' | 'Interested' | 'In DD' | 'Committed' | 'Declined';
  estimated_commitment?: number;
  next_followup_date?: string;
  relationship_owner?: { name: string; email: string };
}

interface FollowUpTasksProps {
  lpLeads: LPLead[];
}

const FollowUpTasks: React.FC<FollowUpTasksProps> = ({ lpLeads }) => {
  const navigate = useNavigate();
  
  // Get tasks for the next 7 days
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const upcomingTasks = lpLeads
    .filter(lead => lead.next_followup_date)
    .map(lead => ({
      ...lead,
      followupDate: new Date(lead.next_followup_date!),
    }))
    .filter(lead => lead.followupDate <= nextWeek)
    .sort((a, b) => a.followupDate.getTime() - b.followupDate.getTime());

  const overdueTasks = upcomingTasks.filter(task => task.followupDate < today);
  const todayTasks = upcomingTasks.filter(task => {
    const taskDate = task.followupDate.toDateString();
    return taskDate === today.toDateString();
  });
  const thisWeekTasks = upcomingTasks.filter(task => {
    const taskDate = task.followupDate;
    return taskDate > today && taskDate <= nextWeek;
  });

  const getTaskPriority = (date: Date) => {
    if (date < today) return 'overdue';
    if (date.toDateString() === today.toDateString()) return 'today';
    return 'upcoming';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'today': return 'bg-yellow-100 text-yellow-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TaskCard = ({ task }: { task: any }) => {
    const priority = getTaskPriority(task.followupDate);
    
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{task.name}</h3>
                <Badge className={getPriorityColor(priority)}>
                  {priority === 'overdue' ? 'Overdue' : 
                   priority === 'today' ? 'Due Today' : 'Upcoming'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {task.followupDate.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {task.relationship_owner?.name || 'Unassigned'}
                </div>
              </div>
              
              <div className="mt-2 text-sm">
                <span className="font-medium">Status:</span> {task.status} | 
                <span className="font-medium"> Type:</span> {task.type}
                {task.estimated_commitment && (
                  <>
                    {' | '}
                    <span className="font-medium">Est.:</span> {formatCurrency(task.estimated_commitment)}
                  </>
                )}
              </div>
            </div>
            
            <div className="ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/fundraising/leads/${task.id}`)}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Overdue Tasks ({overdueTasks.length})
          </h2>
          {overdueTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Due Today ({todayTasks.length})
          </h2>
          {todayTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* This Week's Tasks */}
      {thisWeekTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            This Week ({thisWeekTasks.length})
          </h2>
          {thisWeekTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* No Tasks */}
      {upcomingTasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No upcoming follow-ups</h3>
            <p className="text-muted-foreground">
              All caught up! No follow-up tasks scheduled for the next week.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FollowUpTasks;
