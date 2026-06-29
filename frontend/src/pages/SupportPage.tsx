import { LifeBuoy } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert } from "@/components/Alert";
import { SupportContactCard } from "@/components/support/SupportContactCard";
import { SupportKbCategoryCard } from "@/components/support/SupportKbCategoryCard";
import { SupportKbSearch } from "@/components/support/SupportKbSearch";
import { SupportTicketForm } from "@/components/support/SupportTicketForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { getRouteIcon } from "@/config/navigation";
import {
  DEFAULT_SUPPORT_CONTACT_EMAIL,
  SUPPORT_CENTER_COPY,
  SUPPORT_KB_CATEGORIES,
  filterSupportKbCategories,
} from "@/lib/supportKb";
import { getSupportContact } from "@/services/support";
import { getSupportContactErrorMessage } from "@/utils/supportErrors";

/** Clinical support center — knowledge base (T-X05-02, RFW-024, UC-064). */
export function SupportPage() {
  const SupportIcon = getRouteIcon("/support") ?? LifeBuoy;
  const [searchQuery, setSearchQuery] = useState("");
  const [supportEmail, setSupportEmail] = useState(DEFAULT_SUPPORT_CONTACT_EMAIL);
  const [isContactLoading, setIsContactLoading] = useState(true);
  const [contactError, setContactError] = useState<string | null>(null);

  const visibleCategories = useMemo(
    () => filterSupportKbCategories(SUPPORT_KB_CATEGORIES, searchQuery),
    [searchQuery],
  );

  const loadSupportContact = useCallback(async () => {
    setIsContactLoading(true);
    setContactError(null);
    try {
      const contact = await getSupportContact();
      setSupportEmail(contact.support_contact_email);
    } catch (error) {
      setSupportEmail(DEFAULT_SUPPORT_CONTACT_EMAIL);
      setContactError(getSupportContactErrorMessage(error));
    } finally {
      setIsContactLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSupportContact();
  }, [loadSupportContact]);

  return (
    <PageShell>
      <PageHeader
        icon={SupportIcon}
        eyebrow="Help & documentation"
        title={SUPPORT_CENTER_COPY.title}
        description={SUPPORT_CENTER_COPY.description}
        actions={<SupportKbSearch value={searchQuery} onChange={setSearchQuery} />}
      />

      {contactError ? (
        <Alert variant="info" title="Using default support contact">
          {contactError}
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <section className="xl:col-span-2" aria-labelledby="support-kb-heading">
          <h2
            id="support-kb-heading"
            className="mb-4 flex items-center gap-2 text-xl font-semibold text-on-surface"
          >
            <LifeBuoy className="h-5 w-5 text-primary" aria-hidden />
            {SUPPORT_CENTER_COPY.knowledgeBaseHeading}
          </h2>

          {visibleCategories.length === 0 ? (
            <p className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest px-4 py-8 text-center text-sm text-on-surface-variant">
              {SUPPORT_CENTER_COPY.noResultsMessage}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibleCategories.map((category) => (
                <SupportKbCategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-col gap-6 xl:col-span-1">
          <SupportTicketForm supportEmail={supportEmail} disabled={isContactLoading} />
          <SupportContactCard email={supportEmail} isLoading={isContactLoading} />
        </div>
      </div>
    </PageShell>
  );
}
