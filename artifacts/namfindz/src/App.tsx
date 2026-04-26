import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

// Pages
import Home from "@/pages/home";
import Browse from "@/pages/browse";
import ReportForm from "@/pages/report-form";
import ReportDetail from "@/pages/report-detail";
import Dashboard from "@/pages/dashboard";
import About from "@/pages/about";
import MyReports from "@/pages/my-reports";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/browse" component={Browse} />
      <Route path="/report/lost">
        {() => <ReportForm kind="lost" />}
      </Route>
      <Route path="/report/found">
        {() => <ReportForm kind="found" />}
      </Route>
      <Route path="/reports/:id" component={ReportDetail} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/my-reports" component={MyReports} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
