import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

export default function AdminCandidates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    partyName: "",
    partyShortName: "",
    partyColor: "#3366CC",
    constituency: "",
    logoUrl: "",
  });

  // Fetch candidates
  const { data: candidates = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/candidates'],
    retry: 1,
  });

  // Add candidate mutation
  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/candidates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/candidates'] });
      toast({
        title: "Success",
        description: "Candidate added successfully",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add candidate",
        variant: "destructive",
      });
    }
  });

  // Edit candidate mutation
  const editMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/admin/candidates/${selectedCandidate.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/candidates'] });
      toast({
        title: "Success",
        description: "Candidate updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedCandidate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update candidate",
        variant: "destructive",
      });
    }
  });

  // Delete candidate mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/candidates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/candidates'] });
      toast({
        title: "Success",
        description: "Candidate deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedCandidate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete candidate",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editMutation.mutate(formData);
  };

  const openEditDialog = (candidate: any) => {
    setSelectedCandidate(candidate);
    setFormData({
      name: candidate.name,
      partyName: candidate.partyName,
      partyShortName: candidate.partyShortName,
      partyColor: candidate.partyColor,
      constituency: candidate.constituency,
      logoUrl: candidate.logoUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      partyName: "",
      partyShortName: "",
      partyColor: "#3366CC",
      constituency: "",
      logoUrl: "",
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Manage Candidates</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-12 w-full mb-4" />
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-4" />
            ))}
          </div>
        ) : candidates && candidates.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">S.No</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Constituency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate, index) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {candidate.logoUrl ? (
                        <img 
                          src={candidate.logoUrl} 
                          alt={`${candidate.partyName} logo`} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div 
                          className="h-10 w-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${candidate.partyColor}25` }}
                        >
                          <span style={{ color: candidate.partyColor }} className="font-bold text-sm">
                            {candidate.partyShortName}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="font-medium">{candidate.partyName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{candidate.constituency}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(candidate)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(candidate)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No candidates found</p>
            <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
              Add Your First Candidate
            </Button>
          </div>
        )}
      </div>

      {/* Add Candidate Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
            <DialogDescription>
              Enter the details of the new candidate below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Candidate Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="partyName">Party Name</Label>
                <Input
                  id="partyName"
                  name="partyName"
                  value={formData.partyName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="partyShortName">Party Short Name</Label>
                  <Input
                    id="partyShortName"
                    name="partyShortName"
                    value={formData.partyShortName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="partyColor">Party Color</Label>
                  <Input
                    id="partyColor"
                    name="partyColor"
                    type="color"
                    value={formData.partyColor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="constituency">Constituency</Label>
                <Input
                  id="constituency"
                  name="constituency"
                  value={formData.constituency}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logoUrl">Party Logo URL</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                />
                {formData.logoUrl && (
                  <div className="mt-2 flex items-center">
                    <img 
                      src={formData.logoUrl} 
                      alt="Party Logo Preview" 
                      className="h-10 w-10 rounded-full object-cover mr-2"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://placehold.co/40x40/gray/white?text=!";
                      }}
                    />
                    <span className="text-sm text-gray-500">Logo Preview</span>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adding..." : "Add Candidate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Candidate Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
            <DialogDescription>
              Update the details of the candidate.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Candidate Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-partyName">Party Name</Label>
                <Input
                  id="edit-partyName"
                  name="partyName"
                  value={formData.partyName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-partyShortName">Party Short Name</Label>
                  <Input
                    id="edit-partyShortName"
                    name="partyShortName"
                    value={formData.partyShortName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-partyColor">Party Color</Label>
                  <Input
                    id="edit-partyColor"
                    name="partyColor"
                    type="color"
                    value={formData.partyColor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-constituency">Constituency</Label>
                <Input
                  id="edit-constituency"
                  name="constituency"
                  value={formData.constituency}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-logoUrl">Party Logo URL</Label>
                <Input
                  id="edit-logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                />
                {formData.logoUrl && (
                  <div className="mt-2 flex items-center">
                    <img 
                      src={formData.logoUrl} 
                      alt="Party Logo Preview" 
                      className="h-10 w-10 rounded-full object-cover mr-2"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://placehold.co/40x40/gray/white?text=!";
                      }}
                    />
                    <span className="text-sm text-gray-500">Logo Preview</span>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending ? "Updating..." : "Update Candidate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the candidate
              {selectedCandidate && ` "${selectedCandidate.name}"`}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCandidate && deleteMutation.mutate(selectedCandidate.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
