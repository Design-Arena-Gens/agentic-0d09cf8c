"use client";

import { useState } from "react";
import { KeyRound, Radar, Repeat, Save, Shield } from "lucide-react";
import { useAppState } from "../../context/AppStateContext";
import { Tooltip } from "./Tooltip";

export function SettingsPanel() {
  const { state, dispatch } = useAppState();
  const [localMapsKey, setLocalMapsKey] = useState(
    state.apiCredentials.googleMapsKey,
  );
  const [localEmailKey, setLocalEmailKey] = useState(
    state.apiCredentials.emailServiceKey,
  );

  const saveCredentials = () => {
    dispatch({
      type: "updateApiCredentials",
      patch: {
        googleMapsKey: localMapsKey,
        emailServiceKey: localEmailKey,
      },
    });
  };

  return (
    <section className="section">
      <header className="section__header">
        <div>
          <h2>Settings & automation</h2>
          <p className="section__subtitle">
            Connect APIs, fine-tune targeting, and govern outreach cadence.
          </p>
        </div>
        <button type="button" className="button button--ghost" onClick={saveCredentials}>
          <Save aria-hidden="true" /> Save changes
        </button>
      </header>

      <div className="settings-grid">
        <section className="settings-card">
          <header>
            <KeyRound aria-hidden="true" />
            <div>
              <h3>API keys</h3>
              <p>Securely stored and encrypted at rest.</p>
            </div>
          </header>
          <label className="settings-card__field">
            <span>Google Maps key</span>
            <input
              type="password"
              value={localMapsKey}
              onChange={(event) => setLocalMapsKey(event.target.value)}
              placeholder="AIza..."
              aria-label="Google Maps API key"
            />
          </label>
          <label className="settings-card__field">
            <span>Email service key</span>
            <input
              type="password"
              value={localEmailKey}
              onChange={(event) => setLocalEmailKey(event.target.value)}
              placeholder="sk_live_..."
              aria-label="Email service API key"
            />
          </label>
          <Tooltip label="Keys are masked and only used client-side for demo.">
            <span className="settings-card__hint">
              <Shield aria-hidden="true" /> Rotates every 90 days automatically.
            </span>
          </Tooltip>
        </section>

        <section className="settings-card">
          <header>
            <Radar aria-hidden="true" />
            <div>
              <h3>Targeting</h3>
              <p>Customize discovery radius and industry focus.</p>
            </div>
          </header>
          <label className="settings-card__field">
            <span>Discovery radius (km)</span>
            <input
              type="number"
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
          </label>
          <div className="settings-card__field">
            <span>Focus categories</span>
            <div className="chip-group">
              {state.searchSettings.categories.map((category) => (
                <span key={category} className="chip chip--selected">
                  {category}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header>
            <Repeat aria-hidden="true" />
            <div>
              <h3>Email sequencing</h3>
              <p>Control cadence to stay within warm-outreach limits.</p>
            </div>
          </header>
          <label className="settings-card__field">
            <span>Daily send limit</span>
            <input
              type="number"
              min={10}
              max={1000}
              value={state.emailSettings.dailyLimit}
              onChange={(event) =>
                dispatch({
                  type: "updateEmailSettings",
                  patch: { dailyLimit: Number(event.target.value) },
                })
              }
            />
          </label>
          <label className="settings-card__field">
            <span>Throttle between sends (seconds)</span>
            <input
              type="number"
              min={10}
              max={300}
              value={state.emailSettings.throttleSeconds}
              onChange={(event) =>
                dispatch({
                  type: "updateEmailSettings",
                  patch: { throttleSeconds: Number(event.target.value) },
                })
              }
            />
          </label>
          <div className="settings-card__row">
            <label>
              <span>Sending window start</span>
              <input
                type="time"
                value={state.emailSettings.sendingWindowStart}
                onChange={(event) =>
                  dispatch({
                    type: "updateEmailSettings",
                    patch: { sendingWindowStart: event.target.value },
                  })
                }
              />
            </label>
            <label>
              <span>Sending window end</span>
              <input
                type="time"
                value={state.emailSettings.sendingWindowEnd}
                onChange={(event) =>
                  dispatch({
                    type: "updateEmailSettings",
                    patch: { sendingWindowEnd: event.target.value },
                  })
                }
              />
            </label>
          </div>
        </section>
      </div>
    </section>
  );
}
