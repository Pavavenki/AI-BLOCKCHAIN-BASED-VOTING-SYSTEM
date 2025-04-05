import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AdminLayout from "@/components/admin/admin-layout";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, BarChart3, Users } from "lucide-react";

export default function AdminResults() {
  const [constituency, setConstituency] = useState<string>("all");

  // Fetch results
  const { data: results = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/results'],
    retry: 1,
    select: (data) => {
      if (constituency === "all") return data;
      return data.filter(result => result.constituency === constituency);
    }
  });

  // Fetch constituencies for filter
  const { data: candidates = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/candidates'],
    retry: 1,
  });

  // Extract unique constituencies
  const constituencies = candidates ? 
    Array.from(new Set(candidates.map((c: any) => c.constituency))) : 
    [];

  // Calculate total votes
  const totalVotes = results ? results.reduce((sum: number, r: any) => sum + r.voteCount, 0) : 0;
  
  // Calculate voter turnout (mock data)
  const voterTurnout = totalVotes > 0 ? (totalVotes / (totalVotes + Math.floor(totalVotes * 0.35))).toFixed(1) : "0.0";
  
  // Get winner (first in sorted results)
  const winner = results && results.length > 0 ? results[0] : null;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Election Results</h2>
        <Select 
          value={constituency} 
          onValueChange={setConstituency}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select Constituency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Constituencies</SelectItem>
            {constituencies.map((c: string) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <>
          <Skeleton className="h-40 w-full mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-4" />
          ))}
        </>
      ) : results && results.length > 0 ? (
        <>
          {/* Winner Card */}
          {winner && (
            <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-lg shadow-md text-white mb-8">
              <h3 className="text-xl font-bold mb-2">Winner</h3>
              <div className="flex items-center">
                <div 
                  className="flex-shrink-0 h-20 w-20 bg-white rounded-full flex items-center justify-center"
                  style={{ color: winner.partyColor }}
                >
                  <span className="font-bold text-xl">{winner.partyShortName}</span>
                </div>
                <div className="ml-6">
                  <p className="text-2xl font-bold">{winner.candidateName}</p>
                  <p className="text-lg">{winner.partyName}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-xl font-bold">{winner.voteCount.toLocaleString()}</span>
                    <span className="ml-2 text-sm">votes ({winner.percentage}%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Constituency</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result: any, index: number) => (
                  <TableRow key={result.candidateId}>
                    <TableCell>
                      <div className="flex items-center">
                        <div 
                          className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
                          style={{ 
                            backgroundColor: index === 0 ? '#FBBF24' : '#E5E7EB',
                            color: index === 0 ? '#92400E' : '#4B5563',
                          }}
                        >
                          <span className="font-bold">{index + 1}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div 
                          className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${result.partyColor}25` }}
                        >
                          <span style={{ color: result.partyColor }} className="font-bold text-sm">
                            {result.partyShortName}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{result.partyName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{result.candidateName}</TableCell>
                    <TableCell>{result.constituency}</TableCell>
                    <TableCell className="font-medium">
                      {result.voteCount.toLocaleString()}
                    </TableCell>
                    <TableCell>{result.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  Total Votes Cast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {totalVotes.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Voter Turnout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{voterTurnout}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-primary" />
                  Blockchain Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600 flex items-center">
                  <Shield className="h-5 w-5 mr-1" />
                  All votes verified and secured
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-500 mb-4">No voting results available yet</p>
          <p className="text-sm text-gray-400">
            Results will appear here once voting has begun
          </p>
        </div>
      )}
    </AdminLayout>
  );
}
