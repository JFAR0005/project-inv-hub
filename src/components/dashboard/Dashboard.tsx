
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, Briefcase, Calendar, FileText, Users, PlusCircle } from "lucide-react";

const Dashboard = () => {
  const { user, hasPermission } = useAuth();

  // Sample data (would come from APIs in real implementation)
  const stats = [
    {
      title: "Portfolio Companies",
      value: "12",
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      change: "+2 this quarter",
      link: "/portfolio",
      permission: "view:portfolio",
    },
    {
      title: "Active Deals",
      value: "8", 
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
      change: "+3 this month",
      link: "/deals",
      permission: "edit:all",
    },
    {
      title: "Upcoming Meetings",
      value: "5",
      icon: <Calendar className="h-8 w-8 text-primary" />,
      change: "Next: Tomorrow 10 AM",
      link: "/meetings",
      permission: "book:meetings",
    },
    {
      title: "Recent Notes",
      value: "24",
      icon: <FileText className="h-8 w-8 text-primary" />,
      change: "+12 this week", 
      link: "/notes",
      permission: "create:notes",
    },
    {
      title: "Team Members",
      value: "18",
      icon: <Users className="h-8 w-8 text-primary" />,
      change: "4 online now",
      link: "/team",
      permission: "view:team",
    },
  ];

  // Filter stats based on user permissions
  const filteredStats = stats.filter((stat) => hasPermission(stat.permission as any));

  // Welcome message based on role
  const welcomeMessages: Record<string, string> = {
    admin: "Manage your portfolio, review deals, and track team activity all in one place.",
    partner: "Connect with founders, share notes, and stay updated on portfolio performance.",
    founder: "Track your metrics, schedule meetings, and connect with the Black Nova team.",
    lp: "View portfolio performance and stay updated on investment activities.",
  };

  // Sample upcoming meetings
  const upcomingMeetings = [
    {
      id: '1',
      title: 'Monthly Portfolio Review',
      datetime: 'Tomorrow, 10:00 AM',
      attendees: ['Admin User', 'Venture Partner', 'Founder User'],
      description: 'Review Q2 performance and discuss growth strategy',
    },
    {
      id: '2',
      title: 'Product Demo with Tech Startup',
      datetime: 'Wed May 7, 2:00 PM',
      attendees: ['Admin User', 'Founder User'],
      description: 'Preview of new product features',
    },
  ];

  // Quick actions based on user role
  const getQuickActions = () => {
    const actions = [];
    
    if (hasPermission('create:notes')) {
      actions.push({
        title: 'Create Note',
        description: 'Add a new note about a company or deal',
        link: '/notes',
        icon: <FileText className="h-5 w-5" />,
      });
    }
    
    if (hasPermission('book:meetings')) {
      actions.push({
        title: 'Schedule Meeting',
        description: 'Book a meeting with team members',
        link: '/meetings',
        icon: <Calendar className="h-5 w-5" />,
      });
    }
    
    if (hasPermission('submit:updates')) {
      actions.push({
        title: 'Submit Update',
        description: 'Submit your monthly company update',
        link: '/submit-update',
        icon: <BarChart2 className="h-5 w-5" />,
      });
    }
    
    return actions;
  };

  const quickActions = getQuickActions();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">
          {user?.role && welcomeMessages[user.role]}
        </p>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks for your role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action, i) => (
                <Link key={i} to={action.link}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        {action.icon}
                        <div>
                          <h4 className="font-medium">{action.title}</h4>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStats.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <CardDescription className="mt-2 text-sm">
                {stat.change}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Link to={stat.link}>
                <Button variant="ghost" size="sm">View details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Role-specific content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Meetings - visible to all authenticated users */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Upcoming Meetings</CardTitle>
              {hasPermission('book:meetings') && (
                <Link to="/meetings">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
              )}
            </div>
            <CardDescription>
              Your scheduled meetings for the next few days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{meeting.title}</h4>
                    <p className="text-sm text-muted-foreground">{meeting.datetime}</p>
                    <p className="text-sm mt-1">{meeting.attendees.length} attendees</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin-specific: Recent Activity */}
        {hasPermission('view:all') && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates across your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New metrics submitted by TechStartup Inc.</p>
                      <p className="text-xs text-muted-foreground">2 hours ago by John Smith</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Founder-specific: Next Steps */}
        {user?.role === "founder" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Next Steps</CardTitle>
              <CardDescription>
                Actions to drive your growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Update your Q2 metrics</p>
                    <p className="text-xs text-muted-foreground">Due in 5 days</p>
                  </div>
                  <Link to="/submit-update">
                    <Button size="sm" variant="outline">Submit</Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Schedule monthly review</p>
                    <p className="text-xs text-muted-foreground">With your lead investor</p>
                  </div>
                  <Link to="/meetings">
                    <Button size="sm" variant="outline">Schedule</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Partner-specific: Deal Pipeline Summary */}
        {user?.role === "partner" && (
          <Card>
            <CardHeader>
              <CardTitle>Deal Pipeline Summary</CardTitle>
              <CardDescription>
                Your assigned deals and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Due Diligence Phase</p>
                    <p className="text-xs text-muted-foreground">3 active deals</p>
                  </div>
                  <Link to="/dealflow">
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Investment Committee</p>
                    <p className="text-xs text-muted-foreground">2 pending approvals</p>
                  </div>
                  <Link to="/deals">
                    <Button size="sm" variant="outline">Review</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
