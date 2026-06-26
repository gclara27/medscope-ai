import { FormEvent, useCallback, useEffect, useState } from "react";

import { Alert } from "@/components/Alert";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSystemSettings, updateSystemSettings } from "@/services/adminSettings";
import type { SystemSettings } from "@/types/adminSettings";
import { getAdminSettingsErrorMessage } from "@/utils/adminSettingsErrors";

/** Platform configuration form for administrators (T-X02, UC-071). */
export function SystemConfigurationPanel() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [platformName, setPlatformName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [riskHigh, setRiskHigh] = useState("0.5");
  const [riskMedium, setRiskMedium] = useState("0.35");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const applySettings = useCallback((next: SystemSettings) => {
    setSettings(next);
    setPlatformName(next.platform_name);
    setSupportEmail(next.support_contact_email);
    setRiskHigh(String(next.risk_threshold_high));
    setRiskMedium(String(next.risk_threshold_medium));
  }, []);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSystemSettings();
      applySettings(response);
    } catch (loadError) {
      setSettings(null);
      setError(getAdminSettingsErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [applySettings]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateSystemSettings({
        platform_name: platformName.trim(),
        support_contact_email: supportEmail.trim(),
        risk_threshold_high: Number(riskHigh),
        risk_threshold_medium: Number(riskMedium),
      });
      applySettings(updated);
      setSuccess("Platform settings saved successfully.");
    } catch (saveError) {
      setError(getAdminSettingsErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="shadow-level-1">
        <CardContent className="flex justify-center p-10">
          <Spinner label="Loading system configuration" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-level-1">
      <CardHeader className="border-b border-outline-variant">
        <CardTitle className="text-base">System configuration</CardTitle>
        <p className="text-sm text-on-surface-variant">
          Platform defaults and operational thresholds used during risk classification.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {error ? <Alert variant="error">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        <form className="grid gap-5 md:grid-cols-2" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="platform-name">Platform name</Label>
            <Input
              id="platform-name"
              value={platformName}
              onChange={(event) => setPlatformName(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk-high">High risk threshold</Label>
            <Input
              id="risk-high"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={riskHigh}
              onChange={(event) => setRiskHigh(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk-medium">Medium risk threshold</Label>
            <Input
              id="risk-medium"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={riskMedium}
              onChange={(event) => setRiskMedium(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="support-email">Support contact email</Label>
            <Input
              id="support-email"
              type="email"
              value={supportEmail}
              onChange={(event) => setSupportEmail(event.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save configuration"}
            </Button>
          </div>
        </form>

        {settings ? (
          <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-4 text-sm">
            <p className="font-medium text-on-surface">Model metadata (read-only)</p>
            <dl className="mt-3 grid gap-2 text-on-surface-variant sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide">Model ID</dt>
                <dd>{settings.model.model_id ?? "Unavailable"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Version</dt>
                <dd>{settings.model.model_version ?? "Unavailable"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Training threshold</dt>
                <dd>
                  {settings.model.production_threshold != null
                    ? settings.model.production_threshold.toFixed(2)
                    : "Unavailable"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">ML status</dt>
                <dd>{settings.model.ml_ready ? "Ready" : "Not loaded"}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
