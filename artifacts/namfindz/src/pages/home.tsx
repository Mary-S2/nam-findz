import { Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Search, Megaphone, FileText, CheckCircle, Activity, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetStatsSummary,
  useGetRecentActivity,
  useGetReportsByDocumentType,
} from "@workspace/api-client-react";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    if (query) {
      setLocation(`/browse?query=${encodeURIComponent(query)}`);
    } else {
      setLocation(`/browse`);
    }
  };

  const { data: stats, isLoading: isStatsLoading } = useGetStatsSummary();
  const { data: activities, isLoading: isActivitiesLoading } = useGetRecentActivity();
  const { data: docTypes, isLoading: isDocsLoading } = useGetReportsByDocumentType();

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary/50 pt-20 pb-24 md:pt-32 md:pb-40">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-illustration.png" 
            alt="Diverse community reuniting with lost items" 
            className="w-full h-full object-cover opacity-30 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container relative z-10 px-4 mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Reuniting you with what matters.
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              The modern community noticeboard for reporting and finding lost ID cards, passports, electronics, and personal items in Namibia.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card shadow-xl rounded-2xl p-4 md:p-6 mb-8 max-w-3xl mx-auto border border-border/50"
          >
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  name="q"
                  placeholder="Search for a name, ID number, location, or item..." 
                  className="pl-10 h-12 text-base md:text-lg w-full bg-secondary/50 border-transparent focus-visible:bg-background focus-visible:border-primary"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 text-base">
                Search
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/report/lost" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base border-primary/20 text-foreground hover:bg-primary/5 hover:text-primary">
                Report a Lost Item
              </Button>
            </Link>
            <Link href="/report/found" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-primary/25 shadow-lg">
                Report a Found Item
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold text-foreground">{stats?.totalReports || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Search className="h-4 w-4 text-orange-500" />
                Active Lost Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold text-foreground">{stats?.activeLost || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-blue-500" />
                Active Found Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold text-foreground">{stats?.activeFound || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Successful Recoveries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold text-green-800 dark:text-green-300">{stats?.successfulRecoveries || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works & Recent Activity */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
              <Link href="/browse" className="text-sm text-primary font-medium hover:underline flex items-center">
                Browse all <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {isActivitiesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="shadow-sm border-border/50">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : activities?.length === 0 ? (
                <Card className="shadow-sm border-dashed border-2">
                  <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center">
                    <Activity className="h-12 w-12 text-muted mb-4" />
                    <p>No recent activity yet. Be the first to report an item.</p>
                  </CardContent>
                </Card>
              ) : (
                activities?.map((activity: any, index: number) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="shadow-sm border-border/50 hover:border-border transition-colors">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          activity.kind === 'match' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                          activity.kind === 'recovery' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {activity.kind === 'match' ? <Activity className="h-5 w-5" /> :
                           activity.kind === 'recovery' ? <CheckCircle className="h-5 w-5" /> :
                           <FileText className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {activity.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span className="truncate">{activity.documentType}</span>
                            <span>•</span>
                            <span className="truncate">{activity.location}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-8">
            <Card className="bg-secondary/30 border-secondary shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  How it works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background border border-primary/20 text-primary font-bold flex items-center justify-center">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Report it</h3>
                    <p className="text-sm text-muted-foreground">Submit details about what you lost or found. Add photos to help identification.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background border border-primary/20 text-primary font-bold flex items-center justify-center">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Get Matched</h3>
                    <p className="text-sm text-muted-foreground">Our system automatically suggests potential matches based on item details and location.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background border border-primary/20 text-primary font-bold flex items-center justify-center">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Reunite</h3>
                    <p className="text-sm text-muted-foreground">Connect securely through our platform to verify ownership and arrange a safe handover.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Common Items</CardTitle>
              </CardHeader>
              <CardContent>
                {isDocsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {docTypes?.slice(0, 5).map((type: any) => (
                      <Link key={type.documentType} href={`/browse?documentType=${type.documentType}`}>
                        <div className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer group">
                          <span className="font-medium text-sm group-hover:text-primary transition-colors">{type.label}</span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground bg-background border px-2 py-0.5 rounded-full">{type.lostCount + type.foundCount} items</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Link href="/dashboard" className="text-sm text-primary font-medium hover:underline text-center block">
                    View full statistics
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}