import { useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { formatDistanceToNow, format } from "date-fns";
import { 
  ArrowLeft, MapPin, Calendar, Clock, User, Phone, Mail, 
  ShieldAlert, Send, Megaphone, Search, AlertTriangle, 
  CheckCircle, Edit, Flag, Loader2 
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  useGetReport, getGetReportQueryKey, 
  useGetMatchSuggestions, getGetMatchSuggestionsQueryKey,
  useListMessages, getListMessagesQueryKey,
  useSendMessage,
  useUpdateReportStatus,
  useFlagReport
} from "@workspace/api-client-react";

const messageSchema = z.object({
  authorName: z.string().min(2, "Name is required"),
  body: z.string().min(1, "Message cannot be empty").max(1000),
});

export default function ReportDetail() {
  const { id } = useParams();
  const reportId = parseInt(id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [flagReason, setFlagReason] = useState("");
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);

  const { data: report, isLoading: isReportLoading } = useGetReport(reportId, {
    query: {
      enabled: !!reportId,
      queryKey: getGetReportQueryKey(reportId),
    },
  });

  const { data: matches, isLoading: isMatchesLoading } = useGetMatchSuggestions(
    reportId,
    {
      query: {
        enabled: !!reportId && !!report && report.status === "active",
        queryKey: getGetMatchSuggestionsQueryKey(reportId),
      },
    },
  );

  const { data: messages, isLoading: isMessagesLoading } = useListMessages(
    reportId,
    {
      query: {
        enabled: !!reportId,
        queryKey: getListMessagesQueryKey(reportId),
      },
    },
  );

  const sendMessageMutation = useSendMessage();
  const updateStatusMutation = useUpdateReportStatus();
  const flagReportMutation = useFlagReport();

  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { authorName: "", body: "" },
  });

  const onSendMessage = (values: z.infer<typeof messageSchema>) => {
    sendMessageMutation.mutate({
      id: reportId,
      data: values as any
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(reportId) });
        messageForm.reset({ ...values, body: "" });
        toast({ title: "Message sent", description: "Your message has been added to the thread." });
      }
    });
  };

  const handleUpdateStatus = (newStatus: any) => {
    updateStatusMutation.mutate({
      id: reportId,
      data: { status: newStatus } as any
    }, {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetReportQueryKey(reportId), (old: any) => 
          old ? { ...old, status: data.status } : old
        );
        toast({ title: "Status updated", description: `Report is now marked as ${data.status}.` });
      }
    });
  };

  const handleFlagReport = () => {
    if (!flagReason.trim()) return;
    
    flagReportMutation.mutate({
      id: reportId,
      data: { reason: flagReason } as any
    }, {
      onSuccess: () => {
        setIsFlagDialogOpen(false);
        setFlagReason("");
        toast({ title: "Report flagged", description: "Thank you for helping keep the platform safe. Moderators will review this." });
      }
    });
  };

  if (isReportLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
        <p className="text-muted-foreground mb-6">The report you are looking for does not exist or has been removed.</p>
        <Link href="/browse"><Button>Back to Browse</Button></Link>
      </div>
    );
  }

  const isLost = report.kind === "lost";

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/browse" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to reports
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={isLost ? "destructive" : "default"} className="px-3 py-1">
              {isLost ? "LOST" : "FOUND"}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 uppercase tracking-wide">
              {report.documentType}
            </Badge>
            {report.status === 'active' && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Active</Badge>}
            {report.status === 'matched' && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Matched</Badge>}
            {(report.status === 'claimed' || report.status === 'closed') && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{report.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {report.status === 'active' && (
            <Button variant="outline" onClick={() => handleUpdateStatus('matched')} disabled={updateStatusMutation.isPending}>
              Mark as Matched
            </Button>
          )}
          {report.status === 'matched' && (
            <Button onClick={() => handleUpdateStatus('claimed')} className="bg-green-600 hover:bg-green-700 text-white" disabled={updateStatusMutation.isPending}>
              <CheckCircle className="mr-2 h-4 w-4" /> Mark as Resolved
            </Button>
          )}
          
          <Dialog open={isFlagDialogOpen} onOpenChange={setIsFlagDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                <Flag className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Flag Report</DialogTitle>
                <DialogDescription>
                  Please tell us why you are flagging this report as suspicious, duplicate, or inappropriate.
                </DialogDescription>
              </DialogHeader>
              <Textarea 
                placeholder="e.g. This seems to be a scam, or it contains inappropriate content." 
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="mt-4"
              />
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsFlagDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleFlagReport} disabled={!flagReason.trim() || flagReportMutation.isPending}>
                  {flagReportMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Flag"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {report.photoUrl ? (
            <div className="rounded-xl overflow-hidden bg-secondary border border-border shadow-sm">
              <img src={report.photoUrl} alt={report.title} className="w-full max-h-[500px] object-contain bg-black/5" />
            </div>
          ) : (
            <div className="rounded-xl bg-secondary/30 border border-border/50 border-dashed h-48 flex flex-col items-center justify-center text-muted-foreground">
              {isLost ? <Search className="h-12 w-12 mb-2 opacity-50" /> : <Megaphone className="h-12 w-12 mb-2 opacity-50" />}
              <p>No photo provided</p>
            </div>
          )}

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                {report.description}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground font-medium">
                    <MapPin className="mr-2 h-4 w-4 text-primary" /> Location
                  </div>
                  <p className="pl-6">{report.location}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground font-medium">
                    <Calendar className="mr-2 h-4 w-4 text-primary" /> Date {isLost ? 'Lost' : 'Found'}
                  </div>
                  <p className="pl-6">{format(new Date(report.eventDate), 'MMMM d, yyyy')}</p>
                </div>
                {report.nameOnDocument && (
                  <div className="space-y-1 sm:col-span-2">
                    <div className="flex items-center text-sm text-muted-foreground font-medium">
                      <User className="mr-2 h-4 w-4 text-primary" /> Name on Item
                    </div>
                    <p className="pl-6 font-semibold">{report.nameOnDocument}</p>
                  </div>
                )}
                {report.reward && (
                  <div className="space-y-1 sm:col-span-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-100 dark:border-green-800">
                    <div className="flex items-center text-sm text-green-700 dark:text-green-400 font-medium">
                      <CheckCircle className="mr-2 h-4 w-4" /> Reward Offered
                    </div>
                    <p className="pl-6 text-green-900 dark:text-green-300 font-semibold">{report.reward}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages Section */}
          <Card className="shadow-sm border-border/50" id="messages">
            <CardHeader>
              <CardTitle>Message Thread</CardTitle>
              <CardDescription>
                Securely communicate to arrange a handover. Do not share sensitive personal information here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6">
                {isMessagesLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-3/4" />
                    <Skeleton className="h-20 w-3/4 ml-auto" />
                  </div>
                ) : messages?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages?.map((msg: any) => {
                    const isAuthor = msg.authorName === report.contactName;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isAuthor ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          isAuthor 
                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                            : 'bg-secondary text-secondary-foreground rounded-bl-none'
                        }`}>
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <span className="text-xs font-semibold opacity-90">{msg.authorName} {isAuthor && "(Reporter)"}</span>
                            <span className="text-[10px] opacity-75">{format(new Date(msg.createdAt), 'HH:mm, MMM d')}</span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {report.status !== 'closed' && report.status !== 'claimed' && (
                <div className="pt-4 border-t">
                  <Form {...messageForm}>
                    <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="space-y-4">
                      <FormField
                        control={messageForm.control}
                        name="authorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Your Name" {...field} className="max-w-[200px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={messageForm.control}
                        name="body"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Textarea 
                                  placeholder="Type your message here..." 
                                  className="min-h-[80px] pr-12 resize-none" 
                                  {...field} 
                                />
                                <Button 
                                  type="submit" 
                                  size="icon" 
                                  className="absolute bottom-2 right-2 rounded-full h-8 w-8"
                                  disabled={sendMessageMutation.isPending}
                                >
                                  {sendMessageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Contact Card */}
          <Card className="shadow-sm border-border/50 bg-primary/5 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {report.contactName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{report.contactName}</p>
                  <p className="text-xs text-muted-foreground">Reported {formatDistanceToNow(new Date(report.createdAt))} ago</p>
                </div>
              </div>
              
              <Separator className="bg-primary/10" />
              
              <div className="space-y-3">
                {report.contactPhone ? (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${report.contactPhone}`} className="hover:text-primary transition-colors font-medium">
                      {report.contactPhone}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground italic">
                    <Phone className="h-4 w-4 opacity-50" /> No phone provided
                  </div>
                )}
                
                {report.contactEmail ? (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${report.contactEmail}`} className="hover:text-primary transition-colors font-medium break-all">
                      {report.contactEmail}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground italic">
                    <Mail className="h-4 w-4 opacity-50" /> No email provided
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button className="w-full" variant="outline" onClick={() => document.getElementById('messages')?.scrollIntoView({ behavior: 'smooth' })}>
                Send Message
              </Button>
            </CardFooter>
          </Card>

          {/* Safety Tips */}
          <Card className="shadow-sm border-border/50 bg-secondary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-orange-500" /> Safety First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>• Always meet in a public, well-lit place.</li>
                <li>• Do not transfer money before verifying the item.</li>
                <li>• Ask specific questions only the true owner would know.</li>
                <li>• Keep communication on the platform initially.</li>
              </ul>
            </CardContent>
          </Card>

          {/* AI Match Suggestions (only shown for active items with matches) */}
          {report.status === 'active' && matches && matches.length > 0 && (
            <Card className="shadow-sm border-border/50 border-primary/30 overflow-hidden">
              <div className="bg-primary/10 px-6 py-3 border-b border-primary/20">
                <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Search className="h-4 w-4" /> Suggested Matches ({matches.length})
                </CardTitle>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50 max-h-[300px] overflow-y-auto">
                  {matches.map((match: any) => (
                    <Link key={match.report.id} href={`/reports/${match.report.id}`}>
                      <div className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{match.report.title}</p>
                          <Badge variant="secondary" className="text-[10px] py-0 h-4 ml-2 flex-shrink-0">
                            {Math.round(match.score * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{match.reason}</p>
                        <div className="flex items-center text-[10px] text-muted-foreground gap-2">
                          <span>{match.report.location}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(match.report.createdAt))} ago</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}