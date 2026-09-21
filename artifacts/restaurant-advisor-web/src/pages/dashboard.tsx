import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, UtensilsCrossed, XCircle } from "lucide-react";

export default function Dashboard() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    document.title = "Dashboard | The Food Advisor";

    fetch("https://thefoodadvisor.co.uk/api/dashboard", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load dashboard");
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setStatus("success");
      })
      .catch((err: any) => {
        setStatus("error");
        setErrorMsg(err?.message || "An unexpected error occurred.");
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-6">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-sm">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
        <h1 className="font-serif text-xl font-semibold tracking-tight">The Food Advisor Dashboard</h1>
      </div>

      <Card className="shadow-xl border-card-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Your Venue Overview</CardTitle>
        </CardHeader>

        <CardContent>
          {status === "loading" && (
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-3 text-destructive">
              <XCircle className="h-6 w-6" />
              <p>{errorMsg}</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <p className="text-lg text-foreground/90">
                Welcome back! Here’s the latest information about your venue:
              </p>

              <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
