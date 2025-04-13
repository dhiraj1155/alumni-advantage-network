
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code, Lightbulb, Database, Globe, Server, Brain, ArrowRight, CheckCircle, Clock, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Domain {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const Quizzes = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attemptedDomains, setAttemptedDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchAttemptedQuizzes();
    }
  }, [user]);
  
  const fetchAttemptedQuizzes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('quiz_id, quizzes!inner(domain)')
        .eq('student_id', user?.id);
        
      if (error) throw error;
      
      const domains = data?.map(attempt => attempt.quizzes.domain) || [];
      // Get unique domains
      setAttemptedDomains([...new Set(domains)]);
    } catch (error: any) {
      console.error("Error fetching attempted quizzes:", error);
      toast({
        title: "Error",
        description: "Failed to load quiz history.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const startQuiz = (domain: string) => {
    navigate(`/student/quiz/${domain}`);
  };
  
  const domains: Domain[] = [
    {
      id: "web-development",
      name: "Web Development",
      icon: Code,
      description: "Test your knowledge in HTML, CSS, JavaScript and modern web frameworks.",
      color: "bg-blue-100 text-blue-700"
    },
    {
      id: "data-science",
      name: "Data Science",
      icon: Database,
      description: "Questions on data analysis, machine learning, and statistical methods.",
      color: "bg-purple-100 text-purple-700"
    },
    {
      id: "backend",
      name: "Backend Development",
      icon: Server,
      description: "Server-side programming, APIs, databases, and system architecture.",
      color: "bg-green-100 text-green-700"
    },
    {
      id: "ai-ml",
      name: "Artificial Intelligence",
      icon: Brain,
      description: "Explore machine learning, neural networks, and AI applications.",
      color: "bg-red-100 text-red-700"
    },
    {
      id: "networking",
      name: "Computer Networking",
      icon: Globe,
      description: "Protocols, network architecture, and internet technologies.",
      color: "bg-yellow-100 text-yellow-700"
    },
    {
      id: "algorithms",
      name: "Algorithms & Data Structures",
      icon: Lightbulb,
      description: "Problem-solving techniques, complexity analysis, and efficient coding.",
      color: "bg-orange-100 text-orange-700"
    }
  ];
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Skill Assessment Quizzes</h1>
      <p className="text-muted-foreground">
        Test your knowledge across different domains. Each quiz contains 10 questions to assess your skills.
      </p>
      
      <Tabs defaultValue="domains">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="domains">Available Domains</TabsTrigger>
          <TabsTrigger value="history">Quiz History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="domains" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain) => (
              <Card key={domain.id} className="overflow-hidden">
                <CardHeader className={`${domain.color} pb-2`}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <domain.icon className="h-5 w-5" />
                      {domain.name}
                    </CardTitle>
                    {attemptedDomains.includes(domain.id) && (
                      <Badge variant="outline" className="bg-white">Attempted</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600 mb-4">{domain.description}</p>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>10 questions • ~15 mins</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <Button 
                    className="w-full bg-placement-primary hover:bg-placement-primary/90"
                    onClick={() => startQuiz(domain.id)}
                  >
                    Start Quiz <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <QuizHistory userId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface QuizHistoryProps {
  userId?: string;
}

const QuizHistory = ({ userId }: QuizHistoryProps) => {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (userId) {
      fetchQuizHistory();
    }
  }, [userId]);
  
  const fetchQuizHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          score,
          max_score,
          attempted_at,
          quizzes (
            id,
            domain,
            title
          )
        `)
        .eq('student_id', userId)
        .order('attempted_at', { ascending: false });
        
      if (error) throw error;
      
      setAttempts(data || []);
    } catch (error: any) {
      console.error("Error fetching quiz history:", error);
      toast({
        title: "Error",
        description: "Failed to load quiz history.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-placement-primary"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (attempts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No quizzes attempted yet</h3>
          <p className="text-muted-foreground mb-4 text-center">Take your first quiz to start building your skills profile.</p>
          <Button variant="outline" onClick={() => document.querySelector('[data-value="domains"]')?.dispatchEvent(new Event('click'))}>
            Browse Quizzes
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {attempts.map((attempt) => (
        <Card key={attempt.id}>
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div>
                <CardTitle>{attempt.quizzes.title}</CardTitle>
                <CardDescription>Domain: {attempt.quizzes.domain}</CardDescription>
              </div>
              <Badge className={attempt.score >= attempt.max_score * 0.7 ? "bg-green-600" : "bg-orange-500"}>
                Score: {attempt.score}/{attempt.max_score} ({Math.round((attempt.score / attempt.max_score) * 100)}%)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Attempted on: {formatDate(attempt.attempted_at)}</span>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t flex justify-between">
            <div className="flex items-center">
              {attempt.score >= attempt.max_score * 0.7 ? (
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              ) : (
                <Clock className="h-4 w-4 text-orange-500 mr-2" />
              )}
              <span className="text-sm">
                {attempt.score >= attempt.max_score * 0.7 ? "Pass" : "Needs improvement"}
              </span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Quizzes;
