import { format, formatDistanceToNow, subDays } from "date-fns";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { FileText, CheckCircle, Search, Megaphone, Activity, ArrowRight } from "lucide-react";
import { Link } from "wouter";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetStatsSummary,
  useGetReportsByDocumentType,
  useGetRecentActivity,
} from "@workspace/api-client-react";

const COLORS = ['hsl(15 75% 55%)', 'hsl(40 60% 50%)', 'hsl(180 30% 40%)', 'hsl(20 40% 30%)', 'hsl(10 50% 65%)'];

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetStatsSummary();
  const { data: docTypes, isLoading: isDocsLoading } = useGetReportsByDocumentType();
  const { data: activities, isLoading: isActivitiesLoading } = useGetRecentActivity();

  const formatChartData = () => {
    if (!docTypes) return [];
    return docTypes.map((dt: any) => ({
      name: dt.label,
      Lost: dt.lostCount,
      Found: dt.foundCount,
      Total: dt.lostCount + dt.foundCount,
    })).sort((a: any, b: any) => b.Total - a.Total).slice(0, 7); // Top 7 for bar chart
  };

  const formatPieData = () => {
    if (!docTypes) return [];
    return docTypes.map((dt: any) => ({
      name: dt.label,
      value: dt.lostCount + dt.foundCount,
    })).sort((a: any, b: any) => b.value - a.value).slice(0, 5); // Top 5 for pie
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Platform statistics and recent community activity.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? <Skeleton className="h-8 w-24" /> : (
              <>
                <div className="text-3xl font-bold">{stats?.totalReports}</div>
                <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recovery Rate</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? <Skeleton className="h-8 w-24" /> : (
              <>
                <div className="text-3xl font-bold text-primary">{Math.round(stats?.recoveryRate || 0)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Based on resolved reports</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Lost</CardTitle>
            <Search className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-bold">{stats?.activeLost}</div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Found</CardTitle>
            <Megaphone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-bold">{stats?.activeFound}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Chart */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Reports by Category</CardTitle>
            <CardDescription>Comparison of lost vs found items across top categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              {isDocsLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Lost" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Found" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Item Distribution</CardTitle>
            <CardDescription>Most common items reported</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {isDocsLoading ? (
                <Skeleton className="h-full w-full rounded-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatPieData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {formatPieData().map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {!isDocsLoading && (
              <div className="mt-4 space-y-2">
                {formatPieData().map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-muted-foreground truncate max-w-[120px]">{entry.name}</span>
                    </div>
                    <span className="font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Recent Activity Timeline</CardTitle>
          <CardDescription>Latest updates across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {isActivitiesLoading ? (
            <div className="space-y-6 pl-4 border-l-2 border-border ml-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : activities?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No recent activity.</div>
          ) : (
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {activities?.slice(0, 8).map((activity: any, index: number) => (
                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                  
                  {/* Marker */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                    activity.kind === 'match' ? 'bg-blue-500' :
                    activity.kind === 'recovery' ? 'bg-green-500' : 'bg-primary'
                  }`}>
                    {activity.kind === 'match' ? <Activity className="h-4 w-4 text-white" /> :
                     activity.kind === 'recovery' ? <CheckCircle className="h-4 w-4 text-white" /> :
                     <FileText className="h-4 w-4 text-white" />}
                  </div>

                  {/* Content */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-4 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-foreground text-sm uppercase tracking-wider">
                        {activity.kind === 'new_report' ? 'New Report' : activity.kind}
                      </div>
                      <time className="text-xs font-medium text-primary">
                        {formatDistanceToNow(new Date(activity.timestamp))} ago
                      </time>
                    </div>
                    <div className="text-foreground font-medium mb-1">{activity.title}</div>
                    <div className="text-muted-foreground text-xs flex items-center gap-2">
                      <span className="bg-secondary px-2 py-0.5 rounded-sm">{activity.documentType}</span>
                      <span>•</span>
                      <span>{activity.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}