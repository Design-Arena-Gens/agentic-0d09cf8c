"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  computeStats,
  createInitialState,
} from "../lib/data";
import type {
  AppAction,
  AppState,
  Business,
  BusinessStatus,
  EmailEvent,
} from "../lib/types";

interface AppStateContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  generateEmailEvent: (businessId: string, status: BusinessStatus) => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined,
);

function updateBusinessCollection(
  businesses: Business[],
  businessId: string,
  updater: (business: Business) => Business,
): Business[] {
  return businesses.map((biz) =>
    biz.id === businessId ? updater(biz) : biz,
  );
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "selectBusiness":
      return { ...state, selectedBusinessId: action.businessId };
    case "updateSearchQuery":
      return { ...state, searchQuery: action.value };
    case "updateSearchRadius":
      return {
        ...state,
        searchSettings: { ...state.searchSettings, radiusKm: action.value },
      };
    case "toggleAutoDiscover":
      return {
        ...state,
        searchSettings: {
          ...state.searchSettings,
          autoDiscover: action.value,
        },
      };
    case "updateApiCredentials":
      return {
        ...state,
        apiCredentials: { ...state.apiCredentials, ...action.patch },
      };
    case "updateEmailSettings":
      return {
        ...state,
        emailSettings: { ...state.emailSettings, ...action.patch },
      };
    case "updateTemplateContent": {
      const variants = state.emailTemplates.variants.map((variant) =>
        variant.id === action.variantId
          ? { ...variant, content: action.content }
          : variant,
      );
      return {
        ...state,
        emailTemplates: { ...state.emailTemplates, variants },
      };
    }
    case "setActiveTemplateVariant":
      return {
        ...state,
        emailTemplates: {
          ...state.emailTemplates,
          activeVariantId: action.variantId,
        },
      };
    case "queueEmailSend": {
      const businesses = updateBusinessCollection(
        state.businesses,
        action.businessId,
        (biz) => ({
          ...biz,
          status: biz.status === "not_contacted" ? "email_sent" : biz.status,
          lastInteraction: new Date().toISOString(),
        }),
      );
      const stats = computeStats(businesses);
      return {
        ...state,
        businesses,
        stats,
        isSendingEmails: true,
        sendProgress: 10,
        confirmationState: { open: false, businessId: null },
      };
    }
    case "updateBusinessStatus": {
      const businesses = updateBusinessCollection(
        state.businesses,
        action.businessId,
        (biz) => ({
          ...biz,
          status: action.status,
          lastInteraction: new Date().toISOString(),
        }),
      );
      const stats = computeStats(businesses);
      return { ...state, businesses, stats };
    }
    case "setAnalyzing":
      return { ...state, isAnalyzing: action.value };
    case "setSending":
      return { ...state, isSendingEmails: action.value };
    case "setSendProgress":
      return { ...state, sendProgress: action.value };
    case "setError":
      return { ...state, errorMessage: action.message };
    case "updateStats":
      return { ...state, stats: { ...state.stats, ...action.stats } };
    case "openConfirmation":
      return {
        ...state,
        confirmationState: { open: true, businessId: action.businessId },
      };
    case "closeConfirmation":
      return {
        ...state,
        confirmationState: { open: false, businessId: null },
      };
    default:
      return state;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);
  const [events, setEvents] = useState<EmailEvent[]>(state.emailEvents);

  const generateEmailEvent = useCallback(
    (businessId: string, status: BusinessStatus) => {
      const type: EmailEvent["type"] =
        status === "email_sent"
          ? "sent"
          : status === "opened"
            ? "opened"
            : status === "replied" || status === "interested"
              ? "reply"
              : status === "not_interested"
                ? "reply"
                : "sent";

      setEvents((prev) => [
        ...prev,
        {
          id: `evt-${prev.length + 1}`,
          businessId,
          type,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
    [],
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      state: { ...state, emailEvents: events },
      dispatch,
      generateEmailEvent,
    }),
    [state, events, generateEmailEvent],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
