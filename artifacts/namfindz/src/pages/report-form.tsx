import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertCircle, ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useListDocumentTypes, useCreateReport, getListReportsQueryKey } from "@workspace/api-client-react";

const formSchema = z.object({
  documentType: z.string().min(1, "Please select a category"),
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  nameOnDocument: z.string().optional(),
  description: z.string().min(10, "Please provide more details").max(1000),
  location: z.string().min(3, "Please enter a specific location"),
  eventDate: z.string().min(1, "Please select a date"),
  contactName: z.string().min(2, "Name is required"),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  photoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  reward: z.string().optional(),
}).refine((data) => data.contactPhone || data.contactEmail, {
  message: "Either phone or email must be provided for contact",
  path: ["contactPhone"],
});

export default function ReportForm({ kind }: { kind: "lost" | "found" }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: docTypes } = useListDocumentTypes();

  const createReport = useCreateReport();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: "",
      title: "",
      nameOnDocument: "",
      description: "",
      location: "",
      eventDate: new Date().toISOString().split('T')[0],
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      photoUrl: "",
      reward: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createReport.mutate({
      data: {
        ...values,
        kind,
      } as any
    }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
        toast({
          title: "Report created successfully!",
          description: "Your report has been published.",
        });
        setLocation(`/reports/${data.id}`);
      },
      onError: (error) => {
        toast({
          title: "Error creating report",
          description: "There was a problem. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const isLost = kind === "lost";

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" className="mb-6 pl-0" onClick={() => setLocation("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Button>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className={`h-2 w-full ${isLost ? 'bg-destructive' : 'bg-primary'}`} />
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl">
            {isLost ? "Report a Lost Item" : "Report a Found Item"}
          </CardTitle>
          <CardDescription className="text-base">
            {isLost 
              ? "Provide detailed information to help others identify and return your item." 
              : "Thank you for helping! Provide details to help the owner find their item. We respect your privacy."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Item Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Item Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select what kind of item" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(docTypes ?? []).map((dt) => (
                              <SelectItem key={dt.slug} value={dt.slug}>{dt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Title <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder={isLost ? "Lost Black Wallet" : "Found Keys with Red Lanyard"} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nameOnDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name on Item / ID (if applicable)</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>If the item has a name written on it, this helps us match it faster.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Color, brand, identifying marks, serial numbers (partial), etc." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo URL</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="https://example.com/image.jpg" className="pl-9" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                      <FormDescription>A clear photo significantly increases the chance of recovery.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Time & Place */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Time & Place</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isLost ? "Where did you lose it?" : "Where did you find it?"} <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Wernhil Park Mall, Windhoek" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isLost ? "When was it lost?" : "When was it found?"} <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="date" max={new Date().toISOString().split('T')[0]} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Your Contact Information</h3>
                
                {!isLost && (
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-3 flex items-start gap-3 text-sm text-muted-foreground mb-4">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p>Your contact details will be kept private. Initial communication happens securely through our messaging platform.</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+264 81 123 4567" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jane@example.com" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {isLost && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Reward (Optional)</h3>
                  <FormField
                    control={form.control}
                    name="reward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reward Description</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. N$ 500" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>Offering a reward is optional but may encourage finders.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <Button type="submit" className="w-full text-lg h-14" disabled={createReport.isPending}>
                {createReport.isPending ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                ) : (
                  isLost ? "Publish Lost Report" : "Publish Found Report"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}