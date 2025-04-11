
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, CalendarDays, UserCheck, Award, ExternalLink, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockAlumni } from "@/lib/mock-data";

const Dashboard = () => {
  const { user } = useAuth();
  const alumni = mockAlumni.find(a => a.userId === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Alumni Dashboard</h1>
        <div className="mt-4 md:mt-0">
          <Badge className="bg-placement-primary">
            Class of {alumni?.graduationYear || 2020}
          </Badge>
        </div>
      </div>
      
      {/* Welcome Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Welcome back, {user?.firstName}!</CardTitle>
          <CardDescription>
            Thank you for your continued support to your alma mater. Your contributions make a difference.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-placement-primary">
                <AvatarImage src={user?.avatar} alt={user?.firstName} />
                <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{alumni?.position}</p>
                <p className="text-sm text-muted-foreground">{alumni?.company}</p>
              </div>
            </div>
            <Button variant="outline" className="ml-auto">
              Update Profile
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <h2 className="text-xl font-bold mt-8">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-placement-primary" /> 
              Post Job Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-4">
              Help students find opportunities at your company.
            </p>
            <Link to="/alumni/post-jobs">
              <Button className="w-full bg-placement-primary hover:bg-placement-primary/90">
                Post a Job
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-placement-secondary" /> 
              Request a Seminar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-4">
              Share your industry knowledge with current students.
            </p>
            <Link to="/alumni/seminars">
              <Button variant="outline" className="w-full">
                Request Seminar
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-placement-primary" /> 
              Refer a Student
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-4">
              Refer promising students for positions at your company.
            </p>
            <Link to="/alumni/referrals">
              <Button variant="outline" className="w-full">
                Create Referral
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {/* Your Impact */}
      <h2 className="text-xl font-bold mt-8">Your Impact</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Posted</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              12 students applied
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seminars Conducted</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              180+ students attended
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Referred</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              3 successfully placed
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Latest Updates & Recent Referrals */}
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Latest Campus Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-blue-100 p-2">
                  <Award className="h-4 w-4 text-placement-primary" />
                </div>
                <div>
                  <p className="font-medium">College ranked #12 in Engineering</p>
                  <p className="text-sm text-gray-500">1 week ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-green-100 p-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Placement drive success: 92% placement rate</p>
                  <p className="text-sm text-gray-500">2 weeks ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 justify-between">
                <div className="flex gap-4">
                  <div className="rounded-full bg-purple-100 p-2">
                    <ExternalLink className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">View all updates</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">Software Developer</p>
                  </div>
                </div>
                <Badge className="bg-green-600">Placed</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-xs text-muted-foreground">Data Analyst</p>
                  </div>
                </div>
                <Badge className="bg-yellow-600">In Process</Badge>
              </div>
              
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>RB</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Robert Brown</p>
                    <p className="text-xs text-muted-foreground">UX Designer</p>
                  </div>
                </div>
                <Badge className="bg-green-600">Placed</Badge>
              </div>
              
              <Button variant="ghost" size="sm" className="w-full mt-2">
                View All Referrals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
