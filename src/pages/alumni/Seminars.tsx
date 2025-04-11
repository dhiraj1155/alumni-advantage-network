
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarDays, Edit, Trash, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RequestStatus } from "@/types";
import { mockSeminarRequests } from "@/lib/mock-data";

const Seminars = () => {
  const { toast } = useToast();
  const [seminars, setSeminars] = useState(mockSeminarRequests);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  const onSubmit = (data: any) => {
    // In a real app, we would send this to the API
    console.log("Form data:", data);
    
    // Mock success notification
    toast({
      title: "Seminar request submitted",
      description: "Your seminar request has been submitted for approval.",
    });
    
    // Reset form
    reset();
  };

  const handleDeleteSeminar = (id: string) => {
    setSeminars(prev => prev.filter(seminar => seminar.id !== id));
    toast({
      title: "Seminar request deleted",
      description: "Your seminar request has been successfully deleted.",
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Request Seminars</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Request a Seminar</CardTitle>
          <CardDescription>
            Share your industry knowledge with current students by requesting to organize a seminar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Seminar Title</label>
              <Input 
                id="title" 
                placeholder="e.g. Web Development Trends 2023" 
                {...register("title", { required: true })}
              />
              {errors.title && <p className="text-red-500 text-xs">This field is required</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Seminar Description</label>
              <Textarea 
                id="description" 
                placeholder="Describe the seminar topic, what students will learn, and its relevance..." 
                className="min-h-32"
                {...register("description", { required: true })}
              />
              {errors.description && <p className="text-red-500 text-xs">This field is required</p>}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="proposedDate" className="text-sm font-medium">Proposed Date</label>
                <Input 
                  id="proposedDate" 
                  type="date" 
                  {...register("proposedDate", { required: true })}
                />
                {errors.proposedDate && <p className="text-red-500 text-xs">This field is required</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-medium">Duration (hours)</label>
                <Input 
                  id="duration" 
                  type="number" 
                  placeholder="e.g. 2" 
                  {...register("duration", { required: true, min: 0.5, max: 8 })}
                />
                {errors.duration && <p className="text-red-500 text-xs">Valid duration required (0.5-8 hours)</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="targetAudience" className="text-sm font-medium">Target Audience</label>
              <Input 
                id="targetAudience" 
                placeholder="e.g. Third-year Computer Science students interested in web development" 
                {...register("targetAudience", { required: true })}
              />
              {errors.targetAudience && <p className="text-red-500 text-xs">This field is required</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="requirements" className="text-sm font-medium">Special Requirements (optional)</label>
              <Textarea 
                id="requirements" 
                placeholder="Any special requirements for the seminar, such as equipment, software, etc." 
                {...register("requirements")}
              />
            </div>
            
            <Button 
              type="submit" 
              className="bg-placement-primary hover:bg-placement-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" /> Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Seminar Requests</CardTitle>
          <CardDescription>
            Track the status of your seminar requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {seminars.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seminar Title</TableHead>
                  <TableHead>Proposed Date</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seminars.map((seminar) => (
                  <TableRow key={seminar.id}>
                    <TableCell className="font-medium">{seminar.title}</TableCell>
                    <TableCell>{new Date(seminar.proposedDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(seminar.requestedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          seminar.status === RequestStatus.PENDING 
                            ? 'bg-yellow-500' 
                            : seminar.status === RequestStatus.APPROVED 
                              ? 'bg-green-600' 
                              : 'bg-red-500'
                        }
                      >
                        {seminar.status.charAt(0).toUpperCase() + seminar.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={seminar.status !== RequestStatus.PENDING}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={seminar.status !== RequestStatus.PENDING}
                          onClick={() => handleDeleteSeminar(seminar.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No seminar requests yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You haven't requested any seminars yet. 
                Use the form above to request your first seminar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Seminars;
