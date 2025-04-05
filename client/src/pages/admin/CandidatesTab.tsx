import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, AlertCircle, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Validation schema for candidate form
const candidateSchema = z.object({
  partyName: z.string().min(1, "Party name is required"),
  partyLogo: z.string().min(1, "Party logo is required"),
  candidateName: z.string().min(1, "Candidate name is required"),
  constituency: z.string().min(1, "Constituency is required")
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

const CandidatesTab: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  
  // Forms
  const addForm = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      partyName: "",
      partyLogo: "lotus",
      candidateName: "",
      constituency: "Mumbai South"
    }
  });
  
  const editForm = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      partyName: "",
      partyLogo: "lotus",
      candidateName: "",
      constituency: "Mumbai South"
    }
  });
  
  // Fetch candidates
  const { data: candidates, isLoading } = useQuery({
    queryKey: ["/api/candidates"],
    enabled: !!token
  });
  
  // Add candidate mutation
  const addCandidateMutation = useMutation({
    mutationFn: async (data: CandidateFormValues) => {
      const response = await apiRequest("POST", "/api/admin/candidates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      setIsAddDialogOpen(false);
      addForm.reset();
      toast({
        title: "Success",
        description: "Candidate added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add candidate",
        variant: "destructive"
      });
    }
  });
  
  // Edit candidate mutation
  const editCandidateMutation = useMutation({
    mutationFn: async (data: CandidateFormValues & { id: number }) => {
      const response = await apiRequest("PUT", `/api/admin/candidates/${data.id}`, {
        partyName: data.partyName,
        partyLogo: data.partyLogo,
        candidateName: data.candidateName,
        constituency: data.constituency
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      setIsEditDialogOpen(false);
      editForm.reset();
      toast({
        title: "Success",
        description: "Candidate updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update candidate",
        variant: "destructive"
      });
    }
  });
  
  // Delete candidate mutation
  const deleteCandidateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/candidates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      setIsDeleteDialogOpen(false);
      setSelectedCandidate(null);
      toast({
        title: "Success",
        description: "Candidate deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete candidate",
        variant: "destructive"
      });
    }
  });
  
  // Handle adding a new candidate
  const onAddSubmit = (data: CandidateFormValues) => {
    addCandidateMutation.mutate(data);
  };
  
  // Handle editing a candidate
  const onEditSubmit = (data: CandidateFormValues) => {
    if (!selectedCandidate) return;
    
    editCandidateMutation.mutate({
      ...data,
      id: selectedCandidate.id
    });
  };
  
  // Open edit dialog and populate form
  const handleEditClick = (candidate: any) => {
    setSelectedCandidate(candidate);
    editForm.reset({
      partyName: candidate.partyName,
      partyLogo: candidate.partyLogo,
      candidateName: candidate.candidateName,
      constituency: candidate.constituency
    });
    setIsEditDialogOpen(true);
  };
  
  // Open delete dialog
  const handleDeleteClick = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!selectedCandidate) return;
    deleteCandidateMutation.mutate(selectedCandidate.id);
  };
  
  // Render logo based on type
  const renderLogo = (logo: string) => {
    const logoMap: Record<string, string> = {
      lotus: "🪷",
      hand: "✋",
      elephant: "🐘",
      cycle: "🚲"
    };
    
    return logoMap[logo] || "🏛️";
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Candidates Management</h2>
        <Button 
          className="bg-green-500 hover:bg-green-600"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Candidate
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center p-8">Loading candidates...</div>
      ) : !candidates || candidates.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No candidates found. Add your first candidate.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Party Name</TableHead>
                <TableHead>Party Logo</TableHead>
                <TableHead>Candidate Name</TableHead>
                <TableHead>Constituency</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate: any, index: number) => (
                <TableRow key={candidate.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{candidate.partyName}</TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      {renderLogo(candidate.partyLogo)}
                    </div>
                  </TableCell>
                  <TableCell>{candidate.candidateName}</TableCell>
                  <TableCell>{candidate.constituency}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary-600 hover:text-primary-900"
                        onClick={() => handleEditClick(candidate)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(candidate)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Add Candidate Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="partyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="partyLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party Logo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a logo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lotus">Lotus 🪷</SelectItem>
                        <SelectItem value="hand">Hand ✋</SelectItem>
                        <SelectItem value="elephant">Elephant 🐘</SelectItem>
                        <SelectItem value="cycle">Cycle 🚲</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="candidateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidate Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="constituency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Constituency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a constituency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mumbai South">Mumbai South</SelectItem>
                        <SelectItem value="Mumbai North">Mumbai North</SelectItem>
                        <SelectItem value="Delhi East">Delhi East</SelectItem>
                        <SelectItem value="Delhi West">Delhi West</SelectItem>
                        <SelectItem value="Bangalore Central">Bangalore Central</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addCandidateMutation.isPending}>
                  {addCandidateMutation.isPending ? "Adding..." : "Add Candidate"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Candidate Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="partyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="partyLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party Logo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a logo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lotus">Lotus 🪷</SelectItem>
                        <SelectItem value="hand">Hand ✋</SelectItem>
                        <SelectItem value="elephant">Elephant 🐘</SelectItem>
                        <SelectItem value="cycle">Cycle 🚲</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="candidateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidate Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="constituency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Constituency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a constituency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mumbai South">Mumbai South</SelectItem>
                        <SelectItem value="Mumbai North">Mumbai North</SelectItem>
                        <SelectItem value="Delhi East">Delhi East</SelectItem>
                        <SelectItem value="Delhi West">Delhi West</SelectItem>
                        <SelectItem value="Bangalore Central">Bangalore Central</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editCandidateMutation.isPending}>
                  {editCandidateMutation.isPending ? "Updating..." : "Update Candidate"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the candidate {selectedCandidate?.candidateName}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteCandidateMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CandidatesTab;
