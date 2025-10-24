"use client";

import {
  Building2,
  ExternalLink,
  MailPlus,
  MapPin,
  Phone,
  Star,
  Tags,
  Verified,
} from "lucide-react";
import { useMemo } from "react";
import { useAppState } from "../../context/AppStateContext";
import { StatusBadge } from "./StatusBadge";
import { Tooltip } from "./Tooltip";

export function BusinessProfile() {
  const { state, dispatch } = useAppState();

  const business = useMemo(
    () => state.businesses.find((biz) => biz.id === state.selectedBusinessId),
    [state.businesses, state.selectedBusinessId],
  );

  if (!business) {
    return (
      <section className="section">
        <header className="section__header">
          <h2>Business profile</h2>
        </header>
        <div className="empty-state">
          <Building2 aria-hidden="true" />
          <p>Select a business from the map to view outreach insights.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <header className="section__header">
        <div>
          <h2>Business profile</h2>
          <p className="section__subtitle">
            Validate fit, personalize messaging, and kick off tailored outreach.
          </p>
        </div>
        <StatusBadge status={business.status} />
      </header>

      <article className="profile-card">
        <header className="profile-card__header">
          <div>
            <h3>{business.name}</h3>
            <p>{business.category}</p>
          </div>
          <div className="profile-card__rating">
            <Star aria-hidden="true" />
            <span>{business.rating.toFixed(1)}</span>
            <span className="profile-card__muted">
              · {business.totalReviews} reviews
            </span>
          </div>
        </header>

        <dl className="profile-card__meta">
          <div>
            <dt>
              <MapPin aria-hidden="true" /> Address
            </dt>
            <dd>{business.address}</dd>
          </div>
          <div>
            <dt>
              <Phone aria-hidden="true" /> Phone
            </dt>
            <dd>{business.phone}</dd>
          </div>
          <div>
            <dt>
              <Tags aria-hidden="true" /> Category
            </dt>
            <dd>{business.category}</dd>
          </div>
        </dl>

        <div
          className="profile-card__website"
          role="status"
          aria-live="polite"
        >
          {!business.hasWebsite ? (
            <div className="profile-card__website-status profile-card__website-status--missing">
              <Verified aria-hidden="true" />
              <div>
                <p>No website detected</p>
                <p className="profile-card__muted">
                  AI flagged this business as lacking a linked website on their
                  Google Maps listing.
                </p>
              </div>
            </div>
          ) : (
            <div className="profile-card__website-status">
              <Verified aria-hidden="true" />
              <div>
                <p>Website present</p>
                <p className="profile-card__muted">
                  Consider alternative services such as SEO or conversion audits.
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name} ${business.address}`)}`}
                target="_blank"
                rel="noreferrer"
                className="button button--ghost"
              >
                Visit <ExternalLink aria-hidden="true" />
              </a>
            </div>
          )}
        </div>

        <footer className="profile-card__actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() =>
              dispatch({ type: "openConfirmation", businessId: business.id })
            }
          >
            <MailPlus aria-hidden="true" /> Launch cold email
          </button>
          <Tooltip label="Tracks opens, clicks, replies, and interest signals automatically.">
            <span className="profile-card__footnote">
              Sequencing automations active
            </span>
          </Tooltip>
        </footer>
      </article>
    </section>
  );
}
