"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Beaker, Code2, Eye, Sparkles, TextCursorInput } from "lucide-react";
import { useAppState } from "../../context/AppStateContext";
import type { EmailTemplateVariant } from "../../lib/types";
import { Tooltip } from "./Tooltip";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="editor__loading">Loading editor…</div>,
});

import "react-quill/dist/quill.snow.css";

const PLACEHOLDERS = [
  { label: "Business name", token: "{{business_name}}" },
  { label: "Category", token: "{{category}}" },
  { label: "Address", token: "{{address}}" },
  { label: "Rating", token: "{{rating}}" },
  { label: "Owner name", token: "{{owner_name | default:'there'}}" },
];

export function EmailEditor() {
  const { state, dispatch } = useAppState();

  const activeVariant = useMemo(() => {
    return (
      state.emailTemplates.variants.find(
        (variant) => variant.id === state.emailTemplates.activeVariantId,
      ) ?? state.emailTemplates.variants[0]
    );
  }, [state.emailTemplates]);

  const selectedBusiness = useMemo(
    () =>
      state.businesses.find((biz) => biz.id === state.selectedBusinessId) ?? null,
    [state.businesses, state.selectedBusinessId],
  );

  const previewHtml = useMemo(() => {
    if (!activeVariant) {
      return "";
    }
    const source = activeVariant.content;
    if (!selectedBusiness) {
      return source.replace(/\n/g, "<br/>");
    }
    return source
      .replace(/{{business_name}}/g, selectedBusiness.name)
      .replace(/{{category}}/g, selectedBusiness.category)
      .replace(/{{address}}/g, selectedBusiness.address)
      .replace(/{{rating}}/g, selectedBusiness.rating.toFixed(1))
      .replace(/{{owner_name \| default:'there'}}/g, "there")
      .replace(/\n/g, "<br/>");
  }, [activeVariant, selectedBusiness]);

  const handleVariantChange = (variant: EmailTemplateVariant) => {
    dispatch({ type: "setActiveTemplateVariant", variantId: variant.id });
  };

  const handlePlaceholderInsert = (token: string) => {
    if (!activeVariant) return;
    const separator = activeVariant.content.endsWith(" ") || activeVariant.content.endsWith("\n") || !activeVariant.content
      ? ""
      : " ";
    dispatch({
      type: "updateTemplateContent",
      variantId: activeVariant.id,
      content: `${activeVariant.content}${separator}${token}`,
    });
  };

  return (
    <section className="section">
      <header className="section__header">
        <div>
          <h2>Email template lab</h2>
          <p className="section__subtitle">
            Personalize outreach copy and experiment with A/B variants to lift
            cold email performance.
          </p>
        </div>
        <Tooltip label="Variant performance is calculated from open and reply signals.">
          <span className="badge badge--secondary">A/B testing enabled</span>
        </Tooltip>
      </header>

      <div className="editor">
        <div className="editor__variant-switcher" role="tablist">
          {state.emailTemplates.variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              role="tab"
              aria-selected={variant.id === activeVariant?.id}
              className={
                variant.id === activeVariant?.id
                  ? "editor__variant editor__variant--active"
                  : "editor__variant"
              }
              onClick={() => handleVariantChange(variant)}
            >
              <Beaker aria-hidden="true" />
              {variant.label}
            </button>
          ))}
          <button type="button" className="editor__variant editor__variant--ghost">
            <Sparkles aria-hidden="true" /> Suggest copy
          </button>
        </div>

        <div className="editor__body">
          <div className="editor__composer">
            <div className="editor__toolbar" aria-label="Template options">
              <TextCursorInput aria-hidden="true" />
              <span>Insert placeholder</span>
              <div className="editor__placeholder-group" role="group">
                {PLACEHOLDERS.map((placeholder) => (
                  <button
                    key={placeholder.token}
                    type="button"
                    className="chip"
                    onClick={() => handlePlaceholderInsert(placeholder.token)}
                  >
                    {placeholder.label}
                  </button>
                ))}
              </div>
            </div>
            <ReactQuill
              theme="snow"
              value={activeVariant?.content ?? ""}
              onChange={(value) =>
                dispatch({
                  type: "updateTemplateContent",
                  variantId: activeVariant?.id ?? "",
                  content: value,
                })
              }
              placeholder="Craft a personalized pitch leveraging AI insights…"
            />
          </div>

          <div className="editor__preview" aria-live="polite">
            <header>
              <Eye aria-hidden="true" />
              <span>Live preview</span>
              <Tooltip label="Placeholders automatically hydrate before sending.">
                <Code2 aria-hidden="true" />
              </Tooltip>
            </header>
            <div
              className="editor__preview-surface"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
