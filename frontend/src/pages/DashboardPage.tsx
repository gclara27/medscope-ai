import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RiskDistributionChart } from "@/components/charts/RiskDistributionChart";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_RISK_DISTRIBUTION } from "@/lib/recharts";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-2xl font-semibold text-on-surface md:text-3xl">
          Clinical Dashboard
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Welcome back, {user?.first_name}. Review patient risk overview and recent
          clinical activity.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Signed in as</CardDescription>
            <CardTitle className="text-lg">{user?.email}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Role</CardDescription>
            <CardTitle className="text-lg capitalize">{user?.role}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Session</CardDescription>
            <CardTitle className="text-lg text-primary">Active</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section>
        <RiskDistributionChart data={[...DEFAULT_RISK_DISTRIBUTION]} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Clinical activity</CardTitle>
          <CardDescription>
            Recent evaluations and alerts will appear here (T-501–T-502).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-on-surface-variant">
            No recent high-risk alerts in this preview. Run a prediction from
            Evaluation to populate history and analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
