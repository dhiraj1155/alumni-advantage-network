
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Check, X, Briefcase, User, CalendarDays } from "lucide-react";
import { mockSeminarRequests, mockReferralRequests } from "@/lib/mock-data";
import { RequestStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Requests = () => {
  const { toast } = useToast();
  const [seminarRequests, setSeminarRequests] = useState(mockSeminarRequests);
  const [referralRequests, setReferralRequests] = useState(mockReferralRequests);
  
  const handleSeminarRequest = (id: string, status: RequestStatus) => {
    setSeminarRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status } : req
      )
    );
    
    toast({
      title: `Request ${status}`,
      description: `The seminar request has been ${status}.`,
    });
  };
  
  const handleReferralRequest = (id: string, status: RequestStatus) => {
    setReferralRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status } : req
      )
    );
    
    toast({
      title: `Request ${status}`,
      description: `The referral request has been ${status}.`,
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Requests</h1>
      
      <Tabs defaultValue="seminars">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="seminars">Seminar Requests</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="seminars" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Alumni Seminar Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {seminarRequests.length > 0 ? (
                <div className="space-y-4">
                  {seminarRequests.map((request) => (
                    <Card key={request.id} className="border-muted">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <h3 className="text-xl font-bold">{request.title}</h3>
                              <Badge 
                                className={`ml-2 ${
                                  request.status === RequestStatus.PENDING 
                                    ? 'bg-yellow-500' 
                                    : request.status === RequestStatus.APPROVED 
                                      ? 'bg-green-600' 
                                      : 'bg-red-500'
                                }`}
                              >
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600">{request.description}</p>
                            
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Proposed Date: {new Date(request.proposedDate).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center mt-2">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>
                                  {request.requestedBy.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{request.requestedBy.name}</p>
                                <p className="text-xs text-muted-foreground">Requested on {new Date(request.requestedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          
                          {request.status === RequestStatus.PENDING && (
                            <div className="flex flex-row md:flex-col gap-2 md:min-w-[120px]">
                              <Button 
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => handleSeminarRequest(request.id, RequestStatus.APPROVED)}
                              >
                                <Check className="h-4 w-4 mr-2" /> Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleSeminarRequest(request.id, RequestStatus.REJECTED)}
                              >
                                <X className="h-4 w-4 mr-2" /> Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No seminar requests</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    There are no seminar requests from alumni at the moment. 
                    Alumni can request to organize seminars for students.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="referrals" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Alumni Referral Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {referralRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Job Position</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Referred By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralRequests.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-medium">John Doe</TableCell>
                        <TableCell>{referral.jobTitle}</TableCell>
                        <TableCell>{referral.company}</TableCell>
                        <TableCell>{referral.referredBy.name}</TableCell>
                        <TableCell>{new Date(referral.referredAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              referral.status === RequestStatus.PENDING 
                                ? 'bg-yellow-500' 
                                : referral.status === RequestStatus.APPROVED 
                                  ? 'bg-green-600' 
                                  : 'bg-red-500'
                            }
                          >
                            {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {referral.status === RequestStatus.PENDING && (
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleReferralRequest(referral.id, RequestStatus.APPROVED)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleReferralRequest(referral.id, RequestStatus.REJECTED)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No referral requests</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    There are no student referrals from alumni at the moment.
                    Alumni can refer students for job opportunities at their companies.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Requests;
