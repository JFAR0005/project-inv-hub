
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
import { BarChart2, Briefcase, Calendar, FileText, Users } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  // Sample data (would come from APIs in real implementation)
  const stats = [
    {
      title: "Portfolio Companies",
      value: "12",
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      change: "+2 this quarter",
      link: "/portfolio",
      admin: true,
      partner: true,
      founder: false,
    },
    {
      title: "Active Deals",
      value: "8",
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
      change: "+3 this month",
      link: "/deals",
      admin: true,
      partner: false,
      founder: false,
    },
    {
      title: "Upcoming Meetings",
      value: "5",
      icon: <Calendar className="h-8 w-8 text-primary" />,
      change: "Next: Tomorrow 10 AM",
      link: "/meetings",
      admin: true,
      partner: true,
      founder: true,
    },
    {
      title: "Recent Notes",
      value: "24",
      icon: <FileText className="h-8 w-8 text-primary" />,
      change: "+12 this week",
      link: "/notes",
      admin: true,
      partner: true,
      founder: false,
    },
    {
      title: "Team Members",
      value: "18",
      icon: <Users className="h-8 w-8 text-primary" />,
      change: "4 online now",
      link: "/team",
      admin: true,
      partner: true,
      founder: true,
    },
  ];

  // Filter stats based on user role
  const filteredStats = stats.filter((stat) => {
    if (user?.role === "admin") return stat.admin;
    if (user?.role === "partner") return stat.partner;
    if (user?.role === "founder") return stat.founder;
    return false;
  });

  // Welcome message based on role
  const welcomeMessages: Record<string, string> = {
    admin: "Manage your portfolio, review deals, and track team activity all in one place.",
    partner: "Connect with founders, share notes, and stay updated on portfolio performance.",
    founder: "Track your metrics, schedule meetings, and connect with the Black Nova team.",
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">
          {user?.role && welcomeMessages[user.role]}
        </p>
      </div>

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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Upcoming Meetings</CardTitle>
              <Link to="/meetings">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
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

        {user?.role === "admin" && (
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
                  <div>
                    <p className="text-sm font-medium">Update your Q2 metrics</p>
                    <p className="text-xs text-muted-foreground">Due in 5 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Schedule monthly review</p>
                    <p className="text-xs text-muted-foreground">With your lead investor</p>
                  </div>
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
