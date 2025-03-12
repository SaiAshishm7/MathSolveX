import { useState } from 'react';
import { Clock, Plus, Trash2, Check, InfoIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import BackButton from '@/components/BackButton';
import { toast } from "sonner";

interface Worker {
  id: number;
  name: string;
  skills: string[];
  maxHoursPerWeek: number;
  assignedHours: number;
}

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  requiredWorkers: number;
  assignedWorkers: string[];
}

const AVAILABLE_SKILLS = ['Assembly', 'Quality Control', 'Packaging', 'Machine Operation', 'Maintenance'];

const WorkforceShiftScheduler = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [schedule, setSchedule] = useState<{ [key: string]: { [key: string]: string[] } }>({});
  
  // Form states
  const [newWorker, setNewWorker] = useState({
    name: '',
    skills: [] as string[],
    maxHoursPerWeek: 40
  });
  const [newShift, setNewShift] = useState({
    name: '',
    startTime: '',
    endTime: '',
    requiredWorkers: 1
  });

  const [open, setOpen] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);

  const toggleSkill = (skill: string) => {
    setNewWorker(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const removeSkill = (skill: string) => {
    setNewWorker(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addWorker = () => {
    if (!newWorker.name) {
      toast.error("Please enter a worker name");
      return;
    }
    if (newWorker.skills.length === 0) {
      toast.error("Please select at least one skill");
      return;
    }

    const worker: Worker = {
      id: workers.length + 1,
      name: newWorker.name,
      skills: [...newWorker.skills],
      maxHoursPerWeek: newWorker.maxHoursPerWeek,
      assignedHours: 0
    };

    setWorkers([...workers, worker]);
    setNewWorker({ name: '', skills: [], maxHoursPerWeek: 40 });
    toast.success("Worker added successfully");
  };

  const removeWorker = (id: number) => {
    setWorkers(workers.filter(worker => worker.id !== id));
    toast.success("Worker removed successfully");
  };

  const addShift = () => {
    if (!newShift.name || !newShift.startTime || !newShift.endTime) {
      toast.error("Please fill in all shift details");
      return;
    }

    const shift: Shift = {
      id: shifts.length + 1,
      name: newShift.name,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      requiredWorkers: newShift.requiredWorkers,
      assignedWorkers: []
    };

    setShifts([...shifts, shift]);
    setNewShift({ name: '', startTime: '', endTime: '', requiredWorkers: 1 });
    toast.success("Shift added successfully");
  };

  const removeShift = (id: number) => {
    setShifts(shifts.filter(shift => shift.id !== id));
    toast.success("Shift removed successfully");
  };

  const generateSchedule = () => {
    if (workers.length === 0) {
      toast.error("Please add at least one worker");
      return;
    }
    if (shifts.length === 0) {
      toast.error("Please add at least one shift");
      return;
    }

    // Reset assigned hours and workers
    const updatedWorkers = workers.map(worker => ({ ...worker, assignedHours: 0 }));
    const updatedShifts = shifts.map(shift => ({ ...shift, assignedWorkers: [] }));
    
    // Generate schedule for next 7 days
    const newSchedule: { [key: string]: { [key: string]: string[] } } = {};
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toLocaleDateString();
      
      newSchedule[dateStr] = {};
      
      // Assign workers to each shift
      shifts.forEach(shift => {
        const availableWorkers = updatedWorkers.filter(worker => 
          worker.assignedHours + 8 <= worker.maxHoursPerWeek
        );
        
        // Randomly select required number of workers
        const selectedWorkers = availableWorkers
          .sort(() => Math.random() - 0.5)
          .slice(0, shift.requiredWorkers)
          .map(worker => worker.name);
        
        newSchedule[dateStr][shift.name] = selectedWorkers;
        
        // Update assigned hours
        selectedWorkers.forEach(workerName => {
          const workerIndex = updatedWorkers.findIndex(w => w.name === workerName);
          if (workerIndex !== -1) {
            updatedWorkers[workerIndex].assignedHours += 8;
          }
        });
      });
    }
    
    setSchedule(newSchedule);
    setWorkers(updatedWorkers);
    setShifts(updatedShifts);
    toast.success("Schedule generated successfully");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <BackButton />
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="bg-muted/50 py-12">
          <div className="container mx-auto">
            <div className="flex items-center mb-8">
              <div className="mr-4 p-2 bg-primary/10 rounded-full">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Workforce Shift Scheduler</h1>
                <p className="text-muted-foreground">
                  Automatically generate optimal shift schedules while ensuring fair distribution
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Worker</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Input
                        placeholder="Worker Name"
                        value={newWorker.name}
                        onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                      />
                    </div>
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
                      >
                        Select Skills
                        <Clock className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                      {showSkillsDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                          <div className="p-2">
                            {AVAILABLE_SKILLS.map((skill) => (
                              <div
                                key={skill}
                                className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 rounded-sm"
                                onClick={() => toggleSkill(skill)}
                              >
                                <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                                  {newWorker.skills.includes(skill) && (
                                    <Check className="h-3 w-3 text-primary" />
                                  )}
                                </div>
                                {skill}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newWorker.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {skill}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeSkill(skill)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Max Hours per Week"
                        value={newWorker.maxHoursPerWeek}
                        onChange={(e) => setNewWorker({ ...newWorker, maxHoursPerWeek: parseInt(e.target.value) })}
                      />
                    </div>
                    <Button onClick={addWorker} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Worker
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add New Shift</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Input
                        placeholder="Shift Name"
                        value={newShift.name}
                        onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="time"
                        value={newShift.startTime}
                        onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                      />
                      <Input
                        type="time"
                        value={newShift.endTime}
                        onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Required Workers"
                        value={newShift.requiredWorkers}
                        onChange={(e) => setNewShift({ ...newShift, requiredWorkers: parseInt(e.target.value) })}
                      />
                    </div>
                    <Button onClick={addShift} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Shift
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Workers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workers.map(worker => (
                      <div key={worker.id} className="space-y-2 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{worker.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeWorker(worker.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {worker.assignedHours}/{worker.maxHoursPerWeek} hours
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${(worker.assignedHours / worker.maxHoursPerWeek) * 100}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {worker.skills.map(skill => (
                            <span key={skill} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shifts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {shifts.map(shift => (
                      <div key={shift.id} className="space-y-2 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{shift.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeShift(shift.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {shift.startTime} - {shift.endTime}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Required: {shift.requiredWorkers}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {shift.assignedWorkers.map(worker => (
                            <span key={worker} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {worker}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center mb-8">
              <Button onClick={generateSchedule} className="px-8">
                Generate Schedule
              </Button>
            </div>

            {Object.keys(schedule).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          {shifts.map(shift => (
                            <TableHead key={shift.id}>{shift.name}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(schedule).map(([date, shifts]) => (
                          <TableRow key={date}>
                            <TableCell>{date}</TableCell>
                            {Object.entries(shifts).map(([shiftName, workers]) => (
                              <TableCell key={shiftName}>
                                <div className="flex flex-wrap gap-1">
                                  {workers.map(worker => (
                                    <span key={worker} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                      {worker}
                                    </span>
                                  ))}
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* How This Works Section */}
            <Card className="mb-8 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <InfoIcon className="h-5 w-5 text-blue-500" />
                  How This Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-blue-700">What This Tool Does:</h3>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-blue-500 mt-1">1.</span>
                          <span>Input worker availability and shift preferences</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-blue-500 mt-1">2.</span>
                          <span>Define shift patterns and coverage requirements</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-blue-500 mt-1">3.</span>
                          <span>Generate fair and efficient schedules automatically</span>
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-medium text-blue-700">How to Use:</h3>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-green-500 mt-1">1.</span>
                          <span>Set worker availability and preferences</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-green-500 mt-1">2.</span>
                          <span>Adjust shift patterns and requirements as needed</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold text-green-500 mt-1">3.</span>
                          <span>Click "Schedule" to create shifts</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkforceShiftScheduler; 