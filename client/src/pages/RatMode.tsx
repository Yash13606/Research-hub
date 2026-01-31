
import { FC, useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  Brain, Shield, CheckCircle, AlertTriangle, Play, LogOut, 
  Timer, ChevronRight, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// RAT Components
import { AIProctor } from "@/components/rat-exam/ai-proctor";
import { BrowserFocusTracker } from "@/components/rat-exam/browser-focus-tracker";
import { NetworkMonitor } from "@/components/rat-exam/network-monitor";

// Types
type ExamStep = "login" | "setup" | "exam" | "result";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

// Mock Data
const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Which of the following is NOT a primary source of information?",
    options: ["Original research article", "Textbook", "Conference proceeding", "Dissertation"],
    correctAnswer: 1
  },
  {
    id: 2,
    text: "What is the purpose of a literature review in research?",
    options: ["To fill pages", "To identify gaps in existing knowledge", "To copy other's work", "To summarize the conclusion"],
    correctAnswer: 1
  },
  {
    id: 3,
    text: "In the context of research, what does 'peer-reviewed' mean?",
    options: ["Reviewed by friends", "Evaluated by experts in the field", "Checked by the author", "Approved by the publisher only"],
    correctAnswer: 1
  },
  {
    id: 4,
    text: "Which sampling method gives every member of the population an equal chance of being selected?",
    options: ["Convenience sampling", "Snowball sampling", "Simple random sampling", "Purposive sampling"],
    correctAnswer: 2
  },
  {
    id: 5,
    text: "What represents the independent variable in an experiment?",
    options: ["The outcome measure", "The variable being manipulated", "The constant factor", "The error term"],
    correctAnswer: 1
  }
];

const VALID_CREDENTIALS = [
  { examId: "EXAM1", studentId: "STU1" },
  { examId: "TEST", studentId: "USER" } 
];

const RatMode: FC = () => {
  const [step, setStep] = useState<ExamStep>("login");
  const [studentInfo, setStudentInfo] = useState({ examId: "", studentId: "" });
  const [score, setScore] = useState(0);
  const [violations, setViolations] = useState<string[]>([]);
  
  // Handlers
  const handleLoginSuccess = (info: { examId: string; studentId: string }) => {
    setStudentInfo(info);
    setStep("setup");
  };

  const handleStartExam = () => {
    setStep("exam");
  };

  const handleFinishExam = (finalScore: number) => {
    setScore(finalScore);
    setStep("result");
  };

  const handleViolation = (violation: string) => {
    setViolations(prev => [...prev, `${new Date().toLocaleTimeString()}: ${violation}`]);
  };

  return (
    <div className="min-h-screen bg-[#0A1A2F] text-white font-sans overflow-x-hidden">
      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8">
        
        {/* Header (Hidden in Exam Mode for focus) */}
        {step !== "exam" && (
          <header className="flex justify-between items-center mb-12">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ResearchHub <span className="text-purple-400 font-light">| RAT Mode</span></span>
              </div>
            </Link>
          </header>
        )}

        <main className="flex flex-col items-center justify-center min-h-[60vh]">
          {step === "login" && <LoginView onSuccess={handleLoginSuccess} />}
          {step === "setup" && <SetupView onStart={handleStartExam} />}
          {step === "exam" && (
            <ExamSessionView 
              studentInfo={studentInfo} 
              onFinish={handleFinishExam} 
              onViolation={handleViolation} 
            />
          )}
          {step === "result" && (
            <ResultView 
              score={score} 
              total={MOCK_QUESTIONS.length} 
              violations={violations} 
              onRestart={() => setStep("login")}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// SUB-COMPONENTS
// ------------------------------------------------------------------

const LoginView: FC<{ onSuccess: (info: any) => void }> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ examId: "", studentId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate API Check
    setTimeout(() => {
      const isValid = VALID_CREDENTIALS.some(
        c => c.examId === formData.examId && c.studentId === formData.studentId
      );

      setLoading(false);
      if (isValid) {
        toast({ title: "Verification Successful", description: "Access granted to exam environment." });
        onSuccess(formData);
      } else {
        setError("Invalid Credentials. Try EXAM1 / STU1");
        toast({ variant: "destructive", title: "Access Denied", description: "Invalid Exam ID or Student ID." });
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md bg-[#132338] border-gray-700 shadow-2xl">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-purple-400" />
        </div>
        <CardTitle className="text-2xl text-white">Proctored Login</CardTitle>
        <CardDescription className="text-gray-400">Enter your credentials to verify identity</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label className="text-gray-300">Exam ID</Label>
              <Input 
                className="bg-gray-800 border-gray-700 text-white focus:ring-purple-500"
                placeholder="e.g. EXAM1"
                value={formData.examId}
                onChange={(e) => setFormData({...formData, examId: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Student ID</Label>
              <Input 
                className="bg-gray-800 border-gray-700 text-white focus:ring-purple-500"
                placeholder="e.g. STU1"
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? "Verifying..." : "Enter Exam Environment"}
            </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-xs text-gray-500">
        Secure Enclave v2.4.1 • AI Proctoring Enabled
      </CardFooter>
    </Card>
  );
};

const SetupView: FC<{ onStart: () => void }> = ({ onStart }) => {
  const [cameraReady, setCameraReady] = useState(false);

  return (
    <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">System Check</h1>
          <p className="text-gray-400">Please complete the hardware verification to proceed.</p>
        </div>
        
        <div className="space-y-4">
           <StepItem 
             icon={CheckCircle} 
             title="Browser Compatibility" 
             desc="Chrome/Edge detected (Version 120+)" 
             ready={true} 
           />
           <StepItem 
             icon={CheckCircle} 
             title="Network Connection" 
             desc="Stable connection (Latency < 50ms)" 
             ready={true} 
           />
           <StepItem 
             icon={cameraReady ? CheckCircle : AlertTriangle} 
             title="Webcam Access" 
             desc={cameraReady ? "Camera active and calibrated" : "Waiting for permission..."} 
             ready={cameraReady} 
             active={!cameraReady}
           />
        </div>

        <Button 
          size="lg" 
          className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white h-14 text-lg"
          disabled={!cameraReady}
          onClick={onStart}
        >
          {cameraReady ? (
            <span className="flex items-center gap-2"><Play className="w-5 h-5" /> Start Exam Now</span>
          ) : (
            "Complete Checks to Continue"
          )}
        </Button>
      </div>

      <div className="bg-[#132338] rounded-xl p-6 border border-gray-700 shadow-xl">
        <AIProctor 
          onCameraStatus={setCameraReady} 
          required={true}
        />
        <div className="mt-4 text-xs text-gray-500 text-center">
          By continuing, you agree to be monitored by our AI proctoring system for the duration of the exam.
        </div>
      </div>
    </div>
  );
};

const StepItem = ({ icon: Icon, title, desc, ready, active }: any) => (
  <div className={`flex items-start gap-4 p-4 rounded-lg border ${active ? 'bg-purple-900/10 border-purple-500/50' : 'bg-gray-800/30 border-gray-700'}`}>
    <div className={`p-2 rounded-full ${ready ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h3 className={`font-medium ${ready ? 'text-white' : 'text-gray-200'}`}>{title}</h3>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  </div>
);

const ExamSessionView: FC<{ 
  studentInfo: any, 
  onFinish: (score: number) => void,
  onViolation: (msg: string) => void  
}> = ({ studentInfo, onFinish, onViolation }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = (idx: number) => {
    setAnswers(prev => ({...prev, [MOCK_QUESTIONS[currentQ].id]: idx}));
  };

  const handleSubmit = () => {
    // Calculate Score
    let score = 0;
    MOCK_QUESTIONS.forEach(q => {
      if (answers[q.id] !== undefined && answers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    onFinish(score);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-[#0A1A2F] z-50 flex flex-col">
      {/* Hidden Probes */}
      <BrowserFocusTracker onViolation={onViolation} />
      <NetworkMonitor onViolation={onViolation} />

      {/* Top Bar */}
      <div className="bg-[#132338] border-b border-gray-700 p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <div className="text-white font-bold text-lg">RAT Exam #0442</div>
          <Badge variant="outline" className="border-gray-600 text-gray-400">
             Student: {studentInfo.studentId}
          </Badge>
        </div>
        <div className="flex items-center gap-6">
           <div className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
             {formatTime(timeLeft)}
           </div>
           <Button variant="destructive" size="sm" onClick={handleSubmit}>Finish Exam</Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Main Question Area */}
        <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-gray-400">Question {currentQ + 1} of {MOCK_QUESTIONS.length}</h2>
              <Progress value={((currentQ + 1) / MOCK_QUESTIONS.length) * 100} className="w-1/3 h-2" />
            </div>

            <Card className="bg-[#132338] border-gray-700 mb-8">
              <CardContent className="p-8">
                <p className="text-xl text-white mb-8 leading-relaxed font-medium">
                  {MOCK_QUESTIONS[currentQ].text}
                </p>
                
                <RadioGroup value={answers[MOCK_QUESTIONS[currentQ].id]?.toString()} onValueChange={(v) => handleSelect(parseInt(v))}>
                  <div className="space-y-4">
                    {MOCK_QUESTIONS[currentQ].options.map((opt, idx) => (
                      <div key={idx} className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${answers[MOCK_QUESTIONS[currentQ].id] === idx ? 'bg-blue-600/20 border-blue-500' : 'border-gray-700 hover:bg-white/5'}`}>
                        <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} className="border-gray-500 text-blue-500" />
                        <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer text-gray-200 text-base">{opt}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
                disabled={currentQ === 0}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Previous
              </Button>
              {currentQ < MOCK_QUESTIONS.length - 1 ? (
                <Button onClick={() => setCurrentQ(prev => prev + 1)} className="bg-blue-600 hover:bg-blue-700">
                  Next Question <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                 <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  Submit All Answers
                </Button>
              )}
            </div>
        </div>

        {/* Proctor Sidebar */}
        <div className="w-80 bg-[#0F1C2E] border-l border-gray-700 p-4 flex flex-col">
           <div className="mb-4">
             <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Proctor Feed</div>
             <AIProctor onViolation={onViolation} required={true} />
           </div>
           
           <div className="flex-1 bg-[#0A1A2F]/50 rounded-lg border border-gray-800 p-4">
             <div className="flex items-center gap-2 mb-4 text-gray-400">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">Security Status</span>
             </div>
             <div className="space-y-3">
               <StatusRow label="Browser Focus" active={true} />
               <StatusRow label="Face Detection" active={true} />
               <StatusRow label="Audio Monitoring" active={true} />
               <StatusRow label="Network Tunnel" active={true} />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({ label, active }: any) => (
  <div className="flex justify-between items-center text-xs">
    <span className="text-gray-500">{label}</span>
    <span className="flex items-center text-green-500 gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      Active
    </span>
  </div>
);

const ResultView: FC<{ score: number, total: number, violations: string[], onRestart: () => void }> = ({ score, total, violations, onRestart }) => {
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 60;

  return (
    <div className="w-full max-w-2xl text-center">
       <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ${passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
         {passed ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
       </div>

       <h1 className="text-4xl font-bold text-white mb-2">{passed ? "Exam Completed" : "Exam Failed"}</h1>
       <p className="text-gray-400 mb-8">Your results have been submitted to the central registry.</p>

       <div className="grid grid-cols-3 gap-4 mb-8">
         <ResultCard label="Score" value={`${score}/${total}`} />
         <ResultCard label="Percentage" value={`${percentage}%`} />
         <ResultCard label="Status" value={passed ? "PASSED" : "FAILED"} highlight={passed} />
       </div>

       {violations.length > 0 && (
         <div className="bg-red-900/10 border border-red-900/40 rounded-xl p-6 mb-8 text-left">
           <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
             <AlertTriangle className="w-5 h-5" /> Security Flag Report
           </h3>
           <ul className="space-y-2 max-h-40 overflow-y-auto">
             {violations.map((v, i) => (
               <li key={i} className="text-sm text-red-300/80 border-b border-red-900/20 pb-1 last:border-0">
                 {v}
               </li>
             ))}
           </ul>
         </div>
       )}

       <div className="flex gap-4 justify-center">
         <Button variant="outline" className="border-gray-700 text-gray-300" onClick={onRestart}>
           Take Another Exam
         </Button>
         <Link href="/">
            <Button className="bg-white text-black hover:bg-gray-200">Return to Dashboard</Button>
         </Link>
       </div>
    </div>
  );
};

const ResultCard = ({ label, value, highlight }: any) => (
  <div className={`p-4 rounded-xl border ${highlight === undefined ? 'bg-gray-800/50 border-gray-700' : highlight ? 'bg-green-900/10 border-green-900/30' : 'bg-red-900/10 border-red-900/30'}`}>
    <div className="text-sm text-gray-500 mb-1">{label}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

export default RatMode;
