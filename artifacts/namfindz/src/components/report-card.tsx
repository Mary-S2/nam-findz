import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Calendar, CheckCircle, Search, Megaphone, Clock, Info } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Report } from "@workspace/api-client-react";

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const isLost = report.kind === "lost";
  
  const getStatusBadge = () => {
    switch (report.status) {
      case "active":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">Active</Badge>;
      case "matched":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800">Matched</Badge>;
      case "claimed":
      case "closed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">Resolved</Badge>;
      case "under_review":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800">Review</Badge>;
      default:
        return <Badge variant="outline">{report.status}</Badge>;
    }
  };

  return (
    <Link href={`/reports/${report.id}`}>
      <Card className="h-full flex flex-col hover:border-primary/50 transition-colors overflow-hidden group cursor-pointer">
        {report.photoUrl ? (
          <div className="h-48 w-full bg-secondary/30 relative overflow-hidden">
            <img 
              src={report.photoUrl} 
              alt={report.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant={isLost ? "destructive" : "default"} className="shadow-sm font-semibold">
                {isLost ? "LOST" : "FOUND"}
              </Badge>
              {getStatusBadge()}
            </div>
          </div>
        ) : (
          <div className="h-48 w-full bg-secondary/30 flex items-center justify-center relative">
            {isLost ? <Search className="h-12 w-12 text-muted-foreground/30" /> : <Megaphone className="h-12 w-12 text-muted-foreground/30" />}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant={isLost ? "destructive" : "default"} className="shadow-sm font-semibold">
                {isLost ? "LOST" : "FOUND"}
              </Badge>
              {getStatusBadge()}
            </div>
          </div>
        )}
        
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wider">
            {report.documentType}
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {report.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {report.description}
          </p>
          
          <div className="space-y-2 mt-auto pt-4 border-t border-border/50">
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate">{report.location}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span>{new Date(report.eventDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span>{formatDistanceToNow(new Date(report.createdAt))} ago</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}