"use client";

import { useEffect, useState } from "react";
import { useAppState } from "../../context/AppStateContext";
import { DashboardOverview } from "./DashboardOverview";
import { MapExplorer } from "./MapExplorer";
import { BusinessProfile } from "./BusinessProfile";
import { EmailEditor } from "./EmailEditor";
import { EmailTracking } from "./EmailTracking";
import { SettingsPanel } from "./SettingsPanel";
import { ErrorBanner } from "./ErrorBanner";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { ProgressOverlay } from "./ProgressOverlay";

export function DashboardRoot() {
  const { state, dispatch, generateEmailEvent } = useAppState();
  const [activeSendBusinessId, setActiveSendBusinessId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!state.isSendingEmails) {
      return;
    }
    let progress = state.sendProgress || 10;
    const timer = window.setInterval(() => {
      progress = Math.min(100, progress + 12);
      dispatch({ type: "setSendProgress", value: progress });
      if (progress >= 100) {
        window.clearInterval(timer);
        dispatch({ type: "setSending", value: false });
        dispatch({ type: "setSendProgress", value: 0 });
        if (activeSendBusinessId) {
          dispatch({
            type: "updateBusinessStatus",
            businessId: activeSendBusinessId,
            status: "email_sent",
          });
          generateEmailEvent(activeSendBusinessId, "email_sent");
          setActiveSendBusinessId(null);
        }
      }
    }, 700);

    return () => window.clearInterval(timer);
  }, [
    activeSendBusinessId,
    dispatch,
    generateEmailEvent,
    state.isSendingEmails,
    state.sendProgress,
  ]);

  const currentBusiness = state.businesses.find(
    (biz) => biz.id === state.selectedBusinessId,
  );

  return (
    <>
      <ErrorBanner message={state.errorMessage} dispatch={dispatch} />
      <DashboardOverview
        stats={state.stats}
        businesses={state.businesses}
        emailEvents={state.emailEvents}
      />
      <MapExplorer />
      <div className="grid-split">
        <BusinessProfile />
        <EmailEditor />
      </div>
      <EmailTracking />
      <SettingsPanel />
      <ConfirmationDialog
        open={state.confirmationState.open}
        businessId={state.confirmationState.businessId}
        businesses={state.businesses}
        onCancel={() => dispatch({ type: "closeConfirmation" })}
        onConfirm={(businessId) => {
          dispatch({ type: "queueEmailSend", businessId });
          setActiveSendBusinessId(businessId);
        }}
      />
      <ProgressOverlay
        visible={state.isAnalyzing}
        title="Scanning Google Maps listings"
        description="Discovering businesses without a website in the selected radius."
        progress={65}
      />
      <ProgressOverlay
        visible={state.isSendingEmails}
        title={`Sending email to ${
          state.businesses.find((biz) => biz.id === activeSendBusinessId)?.name ??
          currentBusiness?.name ??
          "selected businesses"
        }`}
        description="Personalizing template, warming deliverability, and tracking engagement."
        progress={state.sendProgress}
      />
    </>
  );
}
