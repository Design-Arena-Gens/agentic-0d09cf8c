"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Compass,
  Crosshair,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  CircleF,
  GoogleMap,
  MarkerF,
  useLoadScript,
} from "@react-google-maps/api";
import clsx from "clsx";
import { useAppState } from "../../context/AppStateContext";
import type { Business } from "../../lib/types";
import { StatusBadge } from "./StatusBadge";
import { Tooltip } from "./Tooltip";

const MAP_LIBRARIES: ("places")[] = ["places"];

export function MapExplorer() {
  const { state, dispatch } = useAppState();
  const [searchInput, setSearchInput] = useState(state.searchQuery);

  const filteredBusinesses = useMemo(() => {
    if (!state.searchQuery) {
      return state.businesses;
    }
    return state.businesses.filter((biz) =>
      biz.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      biz.address.toLowerCase().includes(state.searchQuery.toLowerCase()),
    );
  }, [state.businesses, state.searchQuery]);

  const selectedBusiness = useMemo(
    () =>
      filteredBusinesses.find((biz) => biz.id === state.selectedBusinessId) ??
      filteredBusinesses[0] ??
      null,
    [filteredBusinesses, state.selectedBusinessId],
  );

  const center = useMemo(() => {
    if (selectedBusiness) {
      return selectedBusiness.location;
    }
    if (!filteredBusinesses.length) {
      return { lat: 37.0902, lng: -95.7129 }; // United States center
    }
    const avgLat =
      filteredBusinesses.reduce((acc, biz) => acc + biz.location.lat, 0) /
      filteredBusinesses.length;
    const avgLng =
      filteredBusinesses.reduce((acc, biz) => acc + biz.location.lng, 0) /
      filteredBusinesses.length;
    return { lat: avgLat, lng: avgLng };
  }, [filteredBusinesses, selectedBusiness]);

  const handleSearch = useCallback(() => {
    dispatch({ type: "updateSearchQuery", value: searchInput });
  }, [dispatch, searchInput]);

  const handleAnalyzeArea = useCallback(() => {
    dispatch({ type: "setAnalyzing", value: true });
    dispatch({ type: "setError", message: null });
    setTimeout(() => {
      dispatch({ type: "setAnalyzing", value: false });
      dispatch({ type: "setError", message: null });
    }, 2500);
  }, [dispatch]);

  const handleSelectBusiness = useCallback(
    (businessId: string) => {
      dispatch({ type: "selectBusiness", businessId });
    },
    [dispatch],
  );

  return (
    <section className="section">
      <header className="section__header">
        <div>
          <h2>Google Maps prospecting</h2>
          <p className="section__subtitle">
            Search manually or let the AI scan nearby businesses lacking an
            online presence.
          </p>
        </div>
        <div className="section__actions">
          <Tooltip label="Automatically discover businesses around map center.">
            <label className="switch" aria-label="Toggle automated discovery">
              <input
                type="checkbox"
                checked={state.searchSettings.autoDiscover}
                onChange={(event) =>
                  dispatch({
                    type: "toggleAutoDiscover",
                    value: event.target.checked,
                  })
                }
              />
              <span className="switch__slider" />
              <span className="switch__label">Auto-discover</span>
            </label>
          </Tooltip>
        </div>
      </header>

      <div className="map-panel">
        <div className="map-panel__controls" role="search">
          <div className="field">
            <label htmlFor="searchInput" className="field__label">
              Business search
            </label>
            <div className="field__control">
              <Search aria-hidden="true" />
              <input
                id="searchInput"
                type="search"
                placeholder="Find coffee shops, clinics, gyms..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <button type="button" className="button button--ghost" onClick={handleSearch}>
                Apply
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="radius" className="field__label">
              Search radius
            </label>
            <div className="field__range">
              <Compass aria-hidden="true" />
              <input
                id="radius"
                type="range"
                min={1}
                max={50}
                value={state.searchSettings.radiusKm}
                onChange={(event) =>
                  dispatch({
                    type: "updateSearchRadius",
                    value: Number(event.target.value),
                  })
                }
              />
              <span>{state.searchSettings.radiusKm}km</span>
            </div>
          </div>

          <button
            type="button"
            className="button button--primary"
            onClick={handleAnalyzeArea}
          >
            <RefreshCw aria-hidden="true" /> Analyze area
          </button>
        </div>

        <div className="map-panel__grid">
          <div
            className="map-panel__map"
            role="application"
            aria-label="Google Maps view"
          >
            {state.apiCredentials.googleMapsKey ? (
              <GoogleMapView
                apiKey={state.apiCredentials.googleMapsKey}
                center={center}
                radiusKm={state.searchSettings.radiusKm}
                businesses={filteredBusinesses}
                selectedBusiness={state.selectedBusinessId}
                onSelectBusiness={handleSelectBusiness}
              />
            ) : (
              <MapPlaceholder
                businesses={filteredBusinesses}
                selectedBusiness={state.selectedBusinessId}
                onSelectBusiness={handleSelectBusiness}
                center={center}
                radiusKm={state.searchSettings.radiusKm}
              />
            )}
          </div>

          <div className="map-panel__list" aria-label="Business results">
            <div className="map-panel__list-header">
              <span>{filteredBusinesses.length} matches</span>
              <Tooltip label="We highlight businesses missing websites in green.">
                <span className="legend">
                  <span className="legend__marker legend__marker--primary" />
                  Missing website
                </span>
              </Tooltip>
            </div>
            <ul className="business-list">
              {filteredBusinesses.map((biz) => (
                <li key={biz.id}>
                  <button
                    type="button"
                    className={clsx("business-list__item", {
                      "business-list__item--active": biz.id === state.selectedBusinessId,
                    })}
                    onClick={() => handleSelectBusiness(biz.id)}
                  >
                    <div className="business-list__title">
                      <span>{biz.name}</span>
                      {!biz.hasWebsite ? (
                        <Tooltip label="No website detected in their Google Maps listing.">
                          <span className="business-list__badge">No site</span>
                        </Tooltip>
                      ) : null}
                    </div>
                    <p>{biz.address}</p>
                    <div className="business-list__meta">
                      <span>
                        ⭐ {biz.rating.toFixed(1)} · {biz.totalReviews} reviews
                      </span>
                      <StatusBadge status={biz.status} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

interface GoogleMapViewProps {
  apiKey: string;
  center: { lat: number; lng: number };
  radiusKm: number;
  businesses: Business[];
  selectedBusiness: string | null;
  onSelectBusiness: (businessId: string) => void;
}

function GoogleMapView({
  apiKey,
  center,
  radiusKm,
  businesses,
  selectedBusiness,
  onSelectBusiness,
}: GoogleMapViewProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: MAP_LIBRARIES,
  });

  if (loadError) {
    return (
      <div className="map-placeholder map-placeholder--error">
        <p>Unable to load Google Maps. Check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-placeholder">
        <Loader2 className="spin" aria-hidden="true" />
        <p>Loading Google Maps…</p>
      </div>
    );
  }

  const circleRadiusMeters = radiusKm * 1000;

  return (
    <GoogleMap
      center={center}
      zoom={12}
      options={{
        disableDefaultUI: true,
        clickableIcons: false,
        styles: mapStyle,
      }}
      mapContainerClassName="map-canvas"
    >
      {businesses.map((biz) => (
        <MarkerF
          key={biz.id}
          position={biz.location}
          onClick={() => onSelectBusiness(biz.id)}
          icon={getMarkerIcon(biz, biz.id === selectedBusiness)}
          zIndex={biz.id === selectedBusiness ? 100 : 1}
        />
      ))}
      <CircleF
        center={center}
        radius={circleRadiusMeters}
        options={{
          fillColor: "#3A80F6",
          fillOpacity: 0.08,
          strokeColor: "#3A80F6",
          strokeOpacity: 0.4,
        }}
      />
    </GoogleMap>
  );
}

interface MapPlaceholderProps {
  businesses: Business[];
  selectedBusiness: string | null;
  onSelectBusiness: (businessId: string) => void;
  center: { lat: number; lng: number };
  radiusKm: number;
}

function MapPlaceholder({
  businesses,
  selectedBusiness,
  onSelectBusiness,
  center,
  radiusKm,
}: MapPlaceholderProps) {
  return (
    <div className="map-placeholder" aria-live="polite">
      <div className="map-placeholder__overlay">
        <MapPin aria-hidden="true" />
        <p>
          Add a Google Maps API key in Settings to activate live map view.
        </p>
      </div>
      <div className="map-placeholder__markers">
        {businesses.map((biz) => (
          <button
            key={biz.id}
            type="button"
            className={clsx("map-placeholder__marker", {
              "map-placeholder__marker--no-site": !biz.hasWebsite,
              "map-placeholder__marker--active": biz.id === selectedBusiness,
            })}
            onClick={() => onSelectBusiness(biz.id)}
            style={{
              top: `${50 + (biz.location.lat - center.lat) * 8}%`,
              left: `${50 + (biz.location.lng - center.lng) * 8}%`,
            }}
          >
            <Crosshair aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="map-placeholder__radius">{radiusKm}km radius</div>
    </div>
  );
}

function getMarkerIcon(business: Business, isSelected: boolean) {
  const baseColor = business.hasWebsite ? "#8897A8" : "#3FB783";
  const strokeColor = business.hasWebsite ? "#475A6E" : "#195A3F";
  const scale = isSelected ? 1.6 : business.hasWebsite ? 1 : 1.2;

  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
    fillColor: baseColor,
    fillOpacity: 1,
    strokeColor,
    strokeWeight: 1,
    scale,
  } as google.maps.Symbol;
}

const mapStyle = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#18263d" }],
  },
];
