
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Filter, Eye, Search } from "lucide-react";
import { mockStudents } from "@/lib/mock-data";
import { Department, Year, Student } from "@/types";

const Students = () => {
  const [students] = useState<Student[]>(mockStudents);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(mockStudents);
  const [filters, setFilters] = useState({
    year: "",
    department: "",
    placed: "",
    skills: ""
  });
  
  // Apply filters whenever the filters or students change
  useEffect(() => {
    let result = students;
    
    if (filters.year) {
      result = result.filter(student => student.year === filters.year);
    }
    
    if (filters.department) {
      result = result.filter(student => student.department === filters.department);
    }
    
    if (filters.placed) {
      const isPlaced = filters.placed === "Placed";
      result = result.filter(student => student.isPlaced === isPlaced);
    }
    
    if (filters.skills) {
      const skillsArray = filters.skills.toLowerCase().split(",").map(s => s.trim());
      result = result.filter(student => 
        student.skills.some(skill => 
          skillsArray.some(searchSkill => 
            skill.toLowerCase().includes(searchSkill)
          )
        )
      );
    }
    
    setFilteredStudents(result);
  }, [filters, students]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      year: "",
      department: "",
      placed: "",
      skills: ""
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Students</h1>
      
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" /> Filter Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label htmlFor="year" className="text-sm font-medium">Year</label>
              <Select value={filters.year} onValueChange={(value) => handleFilterChange("year", value)}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  <SelectItem value={Year.FY}>{Year.FY}</SelectItem>
                  <SelectItem value={Year.SY}>{Year.SY}</SelectItem>
                  <SelectItem value={Year.TY}>{Year.TY}</SelectItem>
                  <SelectItem value={Year.BTECH}>{Year.BTECH}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-medium">Branch</label>
              <Select value={filters.department} onValueChange={(value) => handleFilterChange("department", value)}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches</SelectItem>
                  {Object.values(Department).map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="placed" className="text-sm font-medium">Placed</label>
              <Select value={filters.placed} onValueChange={(value) => handleFilterChange("placed", value)}>
                <SelectTrigger id="placed">
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Students</SelectItem>
                  <SelectItem value="Placed">Placed</SelectItem>
                  <SelectItem value="Unplaced">Unplaced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="skills" className="text-sm font-medium">Skills</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="skills"
                  placeholder="e.g. React, Python"
                  className="pl-8"
                  value={filters.skills}
                  onChange={(e) => handleFilterChange("skills", e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={resetFilters} className="mr-2">
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Student Results ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Is SEDA</TableHead>
                  <TableHead>Is Placed</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Resume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">John Doe</TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>{student.isSeda ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        {student.isPlaced ? (
                          <Badge className="bg-green-600">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.skills.slice(0, 2).map((skill, i) => (
                            <Badge key={i} variant="outline" className="bg-muted/50">
                              {skill}
                            </Badge>
                          ))}
                          {student.skills.length > 2 && (
                            <Badge variant="outline" className="bg-muted/50">
                              +{student.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.resumeUrl ? (
                          <Button variant="ghost" size="sm" className="text-placement-primary" onClick={() => window.open(student.resumeUrl, '_blank')}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not uploaded</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No students found matching the filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;
