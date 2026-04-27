import { Link } from "wouter";
import { FileText, LogIn, Plus } from "lucide-react";
import { useAuth } from "@workspace/auth-web";
import {
  useListMyReports,
  getListMyReportsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportCard } from "@/components/report-card";

export default function MyReports() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { data: reports, isLoading } = useListMyReports({
    query: {
      enabled: isAuthenticated,
      queryKey: getListMyReportsQueryKey(),
    },
  });

  if (isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-96" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="border-border/50 shadow-sm text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Log in to see your reports</CardTitle>
            <CardDescription className="text-base">
              Sign in to keep track of items you've reported lost or found and
              manage your messages in one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-2">
            <Link href="/login">
              <Button size="lg" className="mt-2">
                <LogIn className="mr-2 h-4 w-4" />
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="mt-2">
                Create account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            My Reports
          </h1>
          <p className="text-muted-foreground">
            Reports you've submitted as{" "}
            <span className="font-medium text-foreground">
              {user?.firstName || user?.email || "you"}
            </span>
            .
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/report/lost">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
              <Plus className="mr-2 h-4 w-4" />
              Report Lost
            </Button>
          </Link>
          <Link href="/report/found">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report Found
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-72 w-full rounded-lg" />
          ))}
        </div>
      ) : reports && reports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-16 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              When you report a lost or found item while signed in, it will
              appear here.
            </p>
            <div className="flex justify-center gap-2">
              <Link href="/report/lost">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  Report Lost Item
                </Button>
              </Link>
              <Link href="/report/found">
                <Button>Report Found Item</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
