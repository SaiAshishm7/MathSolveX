import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-6 left-6 z-50">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default BackButton; 