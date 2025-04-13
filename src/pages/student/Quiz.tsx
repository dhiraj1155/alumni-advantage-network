
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

const Quiz = () => {
  const { domain } = useParams<{ domain: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (domain) {
      loadQuiz();
    }
  }, [domain]);
  
  const loadQuiz = async () => {
    setIsLoading(true);
    try {
      // First, create a quiz record
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          domain,
          title: getDomainTitle(domain)
        })
        .select('id')
        .single();
        
      if (quizError) throw quizError;
      
      setQuizId(quizData.id);
      
      // Then, generate questions
      try {
        // In a real scenario, we'd call the edge function
        // For now, let's generate some mock questions
        const mockQuestions = generateMockQuestions(domain);
        
        // Save questions to database
        const questionPromises = mockQuestions.map(q => 
          supabase
            .from('quiz_questions')
            .insert({
              quiz_id: quizData.id,
              question: q.question,
              options: q.options,
              correct_answer: q.correctAnswer
            })
        );
        
        await Promise.all(questionPromises);
        
        setQuestions(mockQuestions);
      } catch (genError: any) {
        console.error("Error generating questions:", genError);
        throw new Error("Failed to generate questions");
      }
    } catch (error: any) {
      console.error("Error loading quiz:", error);
      toast({
        title: "Error",
        description: "Failed to load quiz. Please try again.",
        variant: "destructive"
      });
      navigate("/student/quizzes");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getDomainTitle = (domainId: string): string => {
    switch (domainId) {
      case 'web-development': return 'Web Development Quiz';
      case 'data-science': return 'Data Science Quiz';
      case 'backend': return 'Backend Development Quiz';
      case 'ai-ml': return 'Artificial Intelligence Quiz';
      case 'networking': return 'Computer Networking Quiz';
      case 'algorithms': return 'Algorithms & Data Structures Quiz';
      default: return 'Skill Assessment Quiz';
    }
  };
  
  const generateMockQuestions = (domain: string): Question[] => {
    // This is a placeholder - in production, we'd call the edge function
    const baseQuestions = [
      {
        id: "1",
        question: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "Hyper Text Markdown Language",
          "Hyper Tool Multi Language",
          "Hyper Transfer Markup Language"
        ],
        correctAnswer: "Hyper Text Markup Language"
      },
      {
        id: "2",
        question: "Which is not a JavaScript framework?",
        options: [
          "React",
          "Angular",
          "Vue",
          "Java"
        ],
        correctAnswer: "Java"
      },
      {
        id: "3",
        question: "Which symbol is used for comments in JavaScript?",
        options: [
          "//",
          "#",
          "/* */",
          "Both // and /* */"
        ],
        correctAnswer: "Both // and /* */"
      },
      {
        id: "4",
        question: "What is the correct syntax for referring to an external script called 'script.js'?",
        options: [
          "<script src='script.js'>",
          "<script href='script.js'>",
          "<script ref='script.js'>",
          "<script name='script.js'>"
        ],
        correctAnswer: "<script src='script.js'>"
      },
      {
        id: "5",
        question: "How do you declare a JavaScript variable?",
        options: [
          "var carName;",
          "variable carName;",
          "v carName;",
          "declare carName;"
        ],
        correctAnswer: "var carName;"
      },
      {
        id: "6",
        question: "What is the correct way to write a JavaScript array?",
        options: [
          "var colors = ['red', 'green', 'blue']",
          "var colors = (1:'red', 2:'green', 3:'blue')",
          "var colors = 'red', 'green', 'blue'",
          "var colors = 1 = ('red'), 2 = ('green'), 3 = ('blue')"
        ],
        correctAnswer: "var colors = ['red', 'green', 'blue']"
      },
      {
        id: "7",
        question: "Which event occurs when the user clicks on an HTML element?",
        options: [
          "onclick",
          "onchange",
          "onmouseover",
          "onmouseclick"
        ],
        correctAnswer: "onclick"
      },
      {
        id: "8",
        question: "How do you add a comment in CSS?",
        options: [
          "/* this is a comment */",
          "// this is a comment //",
          "// this is a comment",
          "<!-- this is a comment -->"
        ],
        correctAnswer: "/* this is a comment */"
      },
      {
        id: "9",
        question: "What CSS property is used to change the text color of an element?",
        options: [
          "color",
          "text-color",
          "font-color",
          "text-style"
        ],
        correctAnswer: "color"
      },
      {
        id: "10",
        question: "What is the purpose of the 'alt' attribute in an image tag?",
        options: [
          "Provides alternative text if the image cannot be displayed",
          "Defines the alignment of the image",
          "Specifies the source URL of the image",
          "Sets the alternative size of the image"
        ],
        correctAnswer: "Provides alternative text if the image cannot be displayed"
      }
    ];
    
    return baseQuestions;
  };
  
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };
  
  const handleNext = () => {
    if (selectedAnswer === null) return;
    
    // Save the answer
    setAnswers({
      ...answers,
      [currentQuestion]: selectedAnswer
    });
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Calculate score
      let newScore = 0;
      for (let i = 0; i < questions.length; i++) {
        if (answers[i] === questions[i].correctAnswer) {
          newScore++;
        }
      }
      
      // Add the final answer
      if (selectedAnswer === questions[currentQuestion].correctAnswer) {
        newScore++;
      }
      
      setScore(newScore);
      setShowResults(true);
      submitQuizResults(newScore);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || null);
    }
  };
  
  const submitQuizResults = async (finalScore: number) => {
    if (!quizId || !user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          student_id: user.id,
          score: finalScore,
          max_score: questions.length
        });
        
      if (error) throw error;
      
      toast({
        title: "Quiz submitted",
        description: "Your quiz results have been saved.",
      });
    } catch (error: any) {
      console.error("Error submitting quiz results:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz results.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReturnToQuizzes = () => {
    navigate("/student/quizzes");
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-placement-primary mb-4" />
        <p className="text-muted-foreground">Loading quiz questions...</p>
      </div>
    );
  }
  
  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPassing = percentage >= 70;
    
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Quiz Results</h1>
        
        <Card className="overflow-hidden">
          <CardHeader className={isPassing ? "bg-green-100" : "bg-orange-100"}>
            <CardTitle className="flex items-center gap-2">
              {isPassing ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              {isPassing ? "Congratulations!" : "Quiz Completed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center">
                Your score: {score} out of {questions.length} ({percentage}%)
              </h2>
              
              <Progress value={percentage} className="h-2" />
              
              <Alert className={isPassing ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}>
                <AlertTitle className={isPassing ? "text-green-700" : "text-orange-700"}>
                  {isPassing ? "You passed the quiz!" : "Keep practicing!"}
                </AlertTitle>
                <AlertDescription className={isPassing ? "text-green-600" : "text-orange-600"}>
                  {isPassing 
                    ? "Great job! You've demonstrated a good understanding of this domain."
                    : "You're making progress. Keep learning and try again when you're ready."
                  }
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-gray-50 flex justify-center py-4">
            <Button 
              onClick={handleReturnToQuizzes}
              className="bg-placement-primary hover:bg-placement-primary/90"
            >
              Return to Quizzes
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">{getDomainTitle(domain || '')}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Question {currentQuestion + 1} of {questions.length}</span>
          <Progress value={(currentQuestion / questions.length) * 100} className="w-24 h-2" />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{questions[currentQuestion]?.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedAnswer || ""} onValueChange={handleAnswerSelect}>
            {questions[currentQuestion]?.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 py-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="border-t bg-gray-50 flex justify-between py-4">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          <Button 
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="bg-placement-primary hover:bg-placement-primary/90"
          >
            {currentQuestion < questions.length - 1 ? (
              <>Next <ArrowRight className="h-4 w-4 ml-2" /></>
            ) : (
              "Submit Quiz"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Quiz;
