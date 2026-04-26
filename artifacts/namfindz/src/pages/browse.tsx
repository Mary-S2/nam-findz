import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Filter, SlidersHorizontal, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportCard } from "@/components/report-card";
import {
  useListReports,
  useListDocumentTypes,
  useListLocations,
} from "@workspace/api-client-react";

export default function Browse() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const initialQuery = searchParams.get("query") || "";
  const initialKind = searchParams.get("kind") || "all";
  const initialDocType = searchParams.get("documentType") || "all";
  const initialLoc = searchParams.get("location") || "all";

  const [query, setQuery] = useState(initialQuery);
  const [kind, setKind] = useState(initialKind);
  const [documentType, setDocumentType] = useState(initialDocType);
  const [locFilter, setLocFilter] = useState(initialLoc);

  const listParams = {
    ...(query ? { query } : {}),
    ...(kind !== "all" ? { kind: kind as any } : {}),
    ...(documentType !== "all" ? { documentType } : {}),
    ...(locFilter !== "all" ? { location: locFilter } : {}),
  };

  const { data: reports, isLoading } = useListReports(listParams);
  const { data: docTypes } = useListDocumentTypes();
  const { data: locations } = useListLocations();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL without full reload (wouter doesn't have useSearchParams hook that updates url, so just navigating)
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (kind !== "all") params.set("kind", kind);
    if (documentType !== "all") params.set("documentType", documentType);
    if (locFilter !== "all") params.set("location", locFilter);
    
    setLocation(`/browse${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Browse Reports</h1>
        <p className="text-muted-foreground">Search through all reported lost and found items.</p>
      </div>

      <Card className="mb-8 border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, ID, or description..." 
                  className="pl-9 bg-background"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="md:w-auto w-full">
                Search
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <Select value={kind} onValueChange={setKind}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="lost">Lost Items</SelectItem>
                    <SelectItem value="found">Found Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Document Category</label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {docTypes?.map((dt: any) => (
                      <SelectItem key={dt.slug} value={dt.slug}>{dt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Location</label>
                <Select value={locFilter} onValueChange={setLocFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations?.map((loc: string) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">
          {isLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            `${reports?.length || 0} result${reports?.length !== 1 ? 's' : ''}`
          )}
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-[400px] overflow-hidden flex flex-col">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardContent className="p-5 flex-1 flex flex-col gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="mt-auto space-y-2 pt-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reports?.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent shadow-none py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No reports found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              We couldn't find any reports matching your current filters. Try adjusting your search criteria.
            </p>
            <Button variant="outline" onClick={() => {
              setQuery("");
              setKind("all");
              setDocumentType("all");
              setLocFilter("all");
              setLocation("/browse");
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {reports?.map((report: any) => (
            <motion.div key={report.id} variants={item}>
              <ReportCard report={report} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}