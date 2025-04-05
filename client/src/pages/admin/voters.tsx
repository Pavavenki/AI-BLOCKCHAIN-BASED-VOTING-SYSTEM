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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

export default function AdminVoters() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<any>(null);
  const [formData, setFormData] = useState({
    voterId: "",
    password: "",
    name: "",
    dob: "",
    age: "",
    email: "",
    gender: "",
    address: "",
    state: "",
    district: "",
    pincode: "",
    maritalStatus: "",
    aadharNumber: "",
    constituency: "",
  });

  // Fetch voters
  const { data: voters = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/voters'],
    retry: 1,
  });

  // Add voter mutation
  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/voters", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/voters'] });
      toast({
        title: "Success",
        description: "Voter added successfully",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add voter",
        variant: "destructive",
      });
    }
  });

  // Edit voter mutation
  const editMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/admin/voters/${selectedVoter.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/voters'] });
      toast({
        title: "Success",
        description: "Voter updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedVoter(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update voter",
        variant: "destructive",
      });
    }
  });

  // Delete voter mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/voters/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/voters'] });
      toast({
        title: "Success",
        description: "Voter deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedVoter(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete voter",
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
    // Convert age to number
    const formattedData = {
      ...formData,
      age: parseInt(formData.age),
    };
    addMutation.mutate(formattedData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert age to number
    const formattedData = {
      ...formData,
      age: parseInt(formData.age),
    };
    editMutation.mutate(formattedData);
  };

  const openEditDialog = (voter: any) => {
    setSelectedVoter(voter);
    setFormData({
      voterId: voter.voterId,
      password: "", // Don't populate password for security
      name: voter.name,
      dob: voter.dob,
      age: voter.age.toString(),
      email: voter.email,
      gender: voter.gender,
      address: voter.address,
      state: voter.state,
      district: voter.district,
      pincode: voter.pincode,
      maritalStatus: voter.maritalStatus,
      aadharNumber: voter.aadharNumber,
      constituency: voter.constituency,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (voter: any) => {
    setSelectedVoter(voter);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      voterId: "",
      password: "",
      name: "",
      dob: "",
      age: "",
      email: "",
      gender: "",
      address: "",
      state: "",
      district: "",
      pincode: "",
      maritalStatus: "",
      aadharNumber: "",
      constituency: "",
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Manage Voters</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Voter
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
        ) : voters && voters.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voter ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Aadhar Number</TableHead>
                <TableHead>Constituency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voters.map((voter) => (
                <TableRow key={voter.id}>
                  <TableCell className="font-medium">{voter.voterId}</TableCell>
                  <TableCell>{voter.name}</TableCell>
                  <TableCell>{voter.aadharNumber}</TableCell>
                  <TableCell>{voter.constituency}</TableCell>
                  <TableCell>
                    <Badge variant={voter.hasVoted ? "success" : "warning"}>
                      {voter.hasVoted ? "Voted" : "Not Voted"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(voter)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(voter)}>
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
            <p className="text-gray-500">No voters found</p>
            <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
              Add Your First Voter
            </Button>
          </div>
        )}
      </div>

      {/* Add Voter Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Voter</DialogTitle>
            <DialogDescription>
              Enter the details of the new voter below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="voterId">Voter ID</Label>
                  <Input
                    id="voterId"
                    name="voterId"
                    value={formData.voterId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password (DOB: DD/MM/YYYY)</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="DD/MM/YYYY"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dob && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dob || "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dob ? new Date(formData.dob.split('/').reverse().join('-')) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const formattedDate = date.toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            });
                            setFormData(prev => ({ ...prev, dob: formattedDate }));
                          }
                        }}
                        defaultMonth={new Date(1990, 0)}
                        fromYear={1920}
                        toYear={new Date().getFullYear()}
                        captionLayout="dropdown"
                        disabled={(date) =>
                          date > new Date() || date < new Date('1920-01-01')
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Input
                    id="maritalStatus"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="aadharNumber">Aadhar Number</Label>
                  <Input
                    id="aadharNumber"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    required
                  />
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
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adding..." : "Add Voter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Voter Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Voter</DialogTitle>
            <DialogDescription>
              Update the details of the voter.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-voterId">Voter ID</Label>
                  <Input
                    id="edit-voterId"
                    name="voterId"
                    value={formData.voterId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-password">Password (Leave blank to keep unchanged)</Label>
                  <Input
                    id="edit-password"
                    name="password"
                    type="password"
                    placeholder="DD/MM/YYYY"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-dob">Date of Birth</Label>
                  <Input
                    id="edit-dob"
                    name="dob"
                    placeholder="DD/MM/YYYY"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-age">Age</Label>
                  <Input
                    id="edit-age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Input
                    id="edit-gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Input
                    id="edit-state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-district">District</Label>
                  <Input
                    id="edit-district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-pincode">Pincode</Label>
                  <Input
                    id="edit-pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-maritalStatus">Marital Status</Label>
                  <Input
                    id="edit-maritalStatus"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-aadharNumber">Aadhar Number</Label>
                  <Input
                    id="edit-aadharNumber"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    required
                  />
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
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending ? "Updating..." : "Update Voter"}
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
              This will permanently delete the voter
              {selectedVoter && ` "${selectedVoter.name}"`}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedVoter && deleteMutation.mutate(selectedVoter.id)}
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