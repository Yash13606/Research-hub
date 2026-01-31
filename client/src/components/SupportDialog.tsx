import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SupportDialog: FC<SupportDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    toast({
      title: "Message Sent",
      description: "We've received your request and will get back to you shortly.",
      duration: 3000,
    });
    
    // Reset after showing success state
    setTimeout(() => {
      onOpenChange(false);
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: "", email: "", subject: "", message: "" });
      }, 300);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0F172A] border-gray-800 text-white">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  Contact Support
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Have a question or feedback? We're here to help.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Your name" 
                    className="bg-gray-900/50 border-gray-700 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="you@example.com" 
                    className="bg-gray-900/50 border-gray-700 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                  <Input 
                    id="subject" 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="How can we help?" 
                    className="bg-gray-900/50 border-gray-700 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-300">Message</Label>
                  <Textarea 
                    id="message" 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Tell us more about your issue..." 
                    className="bg-gray-900/50 border-gray-700 focus:border-blue-500 min-h-[100px]"
                    required
                  />
                </div>
                
                <DialogFooter className="pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => onOpenChange(false)}
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-900/20"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 flex flex-col items-center text-center space-y-4"
            >
              <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white">Message Sent!</h3>
              <p className="text-gray-400 max-w-[280px]">
                Thank you for reaching out. Our support team will respond to your email shortly.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
