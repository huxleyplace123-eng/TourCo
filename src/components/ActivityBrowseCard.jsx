import React from "react";
import {
  ArrowUpRight,
  Check,
  Clock3,
  Compass,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { operators } from "../data.js";
import { activityImage } from "../images.js";
import { ticoActivityVerdict } from "../intelligence/tico.js";
import { c, gradFor, money } from "../theme.js";
import { Photo } from "../motion.jsx";
import { Button } from "./ui.jsx";

const CARD_STYLES = `
  .tn-activity-browse-card {
    --activity-accent: #22d3ee;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    color: #fff;
    background:
      radial-gradient(120% 90% at 100% 0%, rgba(34, 211, 238, .08), transparent 48%),
      linear-gradient(155deg, rgba(19, 41, 74, .98), rgba(7, 19, 35, .99));
    border: 1px solid rgba(127, 166, 232, .17);
    border-radius: 24px;
    box-shadow: 0 28px 70px -42px rgba(0, 0, 0, .92);
    isolation: isolate;
    transition: transform .35s cubic-bezier(.2,.8,.2,1), border-color .35s ease, box-shadow .35s ease;
  }

  .tn-activity-browse-card::after {
    content: "";
    position: absolute;
    inset: auto 0 0;
    z-index: -1;
    height: 3px;
    opacity: .8;
    background: linear-gradient(90deg, var(--activity-accent), transparent 72%);
  }

  .tn-activity-browse-card:hover {
    transform: translateY(-5px);
    border-color: rgba(127, 166, 232, .32);
    box-shadow: 0 36px 85px -42px rgba(0, 0, 0, .96);
  }

  .tn-activity-browse-card.is-rico-pick {
    border-color: color-mix(in srgb, var(--activity-accent) 48%, transparent);
    box-shadow: 0 30px 80px -40px color-mix(in srgb, var(--activity-accent) 45%, #000);
  }

  .tn-activity-browse-card__media {
    position: relative;
    min-height: 224px;
    overflow: hidden;
    border-bottom: 1px solid rgba(127, 166, 232, .14);
  }

  .tn-activity-browse-card__photo,
  .tn-activity-browse-card__photo > div {
    height: 100% !important;
  }

  .tn-activity-browse-card__media-top {
    position: absolute;
    inset: 16px 16px auto;
    z-index: 3;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .tn-activity-browse-card__type,
  .tn-activity-browse-card__approved {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    padding: 7px 10px;
    border: 1px solid rgba(255, 255, 255, .19);
    border-radius: 999px;
    color: #fff;
    background: rgba(5, 16, 30, .72);
    box-shadow: 0 8px 28px rgba(0, 0, 0, .2);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    font-size: 10px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .tn-activity-browse-card__type {
    max-width: 66%;
    overflow: hidden;
    color: var(--activity-accent);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tn-activity-browse-card__approved {
    flex: 0 0 auto;
    color: #d9f9ff;
  }

  .tn-activity-browse-card__price {
    position: absolute;
    right: 16px;
    bottom: 15px;
    z-index: 3;
    display: flex;
    align-items: baseline;
    gap: 4px;
    padding: 8px 11px;
    color: #fff;
    background: rgba(5, 16, 30, .78);
    border: 1px solid rgba(255, 255, 255, .18);
    border-radius: 12px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    font-size: 18px;
    font-weight: 850;
    line-height: 1;
  }

  .tn-activity-browse-card__top-pick {
    position: absolute;
    left: 16px;
    bottom: 15px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    color: #071323;
    background: var(--activity-accent);
    border-radius: 999px;
    box-shadow: 0 10px 28px -12px var(--activity-accent);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .tn-activity-browse-card__price small {
    color: rgba(255,255,255,.68);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .04em;
  }

  .tn-activity-browse-card__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    padding: 22px;
  }

  .tn-activity-browse-card__heading {
    margin: 0;
    color: #fff;
    font-size: clamp(20px, 2.1vw, 25px);
    font-weight: 800;
    letter-spacing: -.035em;
    line-height: 1.12;
    text-wrap: balance;
  }

  .tn-activity-browse-card:not(.is-featured) .tn-activity-browse-card__heading {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .tn-activity-browse-card__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 9px 16px;
    margin-top: 14px;
    color: rgba(210, 227, 251, .68);
    font-size: 12.5px;
    font-weight: 650;
  }

  .tn-activity-browse-card__meta span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .tn-activity-browse-card__rico {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 11px;
    margin-top: 18px;
    padding: 12px 13px;
    border: 1px solid rgba(127, 166, 232, .15);
    border-radius: 15px;
    background: rgba(255, 255, 255, .035);
  }

  .tn-activity-browse-card__rico-score {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    color: #071323;
    background: var(--activity-accent);
    border-radius: 13px;
    box-shadow: 0 12px 28px -13px var(--activity-accent);
    font-size: 16px;
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .tn-activity-browse-card__rico-copy {
    min-width: 0;
    color: rgba(255,255,255,.82);
    font-size: 12.5px;
    font-weight: 700;
    line-height: 1.35;
  }

  .tn-activity-browse-card__rico-copy strong {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 2px;
    color: var(--activity-accent);
    font-size: 10px;
    font-weight: 850;
    letter-spacing: .11em;
    text-transform: uppercase;
  }

  .tn-activity-browse-card__operator {
    margin-top: 15px;
    overflow: hidden;
    color: rgba(210, 227, 251, .56);
    font-size: 11.5px;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tn-activity-browse-card__operator strong {
    color: rgba(255,255,255,.84);
    font-weight: 750;
  }

  .tn-activity-browse-card__actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    margin-top: auto;
    padding-top: 20px;
  }

  .tn-activity-browse-card__primary {
    min-height: 42px;
  }

  .tn-activity-browse-card__details {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 42px;
    padding: 8px 2px 8px 10px;
    color: rgba(255,255,255,.76);
    background: transparent;
    border: 0;
    border-radius: 10px;
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    font-weight: 750;
    white-space: nowrap;
    transition: color .2s ease, transform .2s ease;
  }

  .tn-activity-browse-card__details:hover {
    color: var(--activity-accent);
    transform: translateX(2px);
  }

  .tn-activity-browse-card :is(button, [role="button"]):focus-visible {
    outline: 3px solid var(--activity-accent);
    outline-offset: 3px;
  }

  .tn-activity-browse-card.is-featured {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(340px, .65fr);
    min-height: 430px;
    border-radius: 30px;
    box-shadow: 0 38px 95px -45px rgba(0, 0, 0, .98);
  }

  .tn-activity-browse-card.is-featured .tn-activity-browse-card__media {
    min-height: 430px;
    border-right: 1px solid rgba(127, 166, 232, .14);
    border-bottom: 0;
  }

  .tn-activity-browse-card.is-featured .tn-activity-browse-card__body {
    justify-content: center;
    padding: clamp(28px, 4vw, 46px);
  }

  .tn-activity-browse-card.is-featured .tn-activity-browse-card__heading {
    font-size: clamp(28px, 3.2vw, 43px);
    line-height: 1.03;
  }

  .tn-activity-browse-card.is-featured .tn-activity-browse-card__meta {
    margin-top: 18px;
  }

  @media (max-width: 860px) {
    .tn-activity-browse-card.is-featured {
      display: flex;
      min-height: 0;
      border-radius: 25px;
    }

    .tn-activity-browse-card.is-featured .tn-activity-browse-card__media,
    .tn-activity-browse-card.is-featured .tn-activity-browse-card__photo,
    .tn-activity-browse-card.is-featured .tn-activity-browse-card__photo > div {
      height: 310px !important;
      min-height: 310px !important;
      border-right: 0;
      border-bottom: 1px solid rgba(127, 166, 232, .14);
    }

    .tn-activity-browse-card.is-featured .tn-activity-browse-card__body {
      padding: 26px;
    }
  }

  @media (max-width: 520px) {
    .tn-activity-browse-card {
      border-radius: 20px;
    }

    .tn-activity-browse-card__media,
    .tn-activity-browse-card__photo,
    .tn-activity-browse-card__photo > div {
      height: 205px !important;
      min-height: 205px !important;
    }

    .tn-activity-browse-card.is-featured .tn-activity-browse-card__media,
    .tn-activity-browse-card.is-featured .tn-activity-browse-card__photo,
    .tn-activity-browse-card.is-featured .tn-activity-browse-card__photo > div {
      height: 242px !important;
      min-height: 242px !important;
    }

    .tn-activity-browse-card__media-top {
      inset: 12px 12px auto;
      gap: 8px;
    }

    .tn-activity-browse-card__approved {
      padding-inline: 9px;
    }

    .tn-activity-browse-card__approved span {
      display: none;
    }

    .tn-activity-browse-card__price {
      right: 12px;
      bottom: 12px;
    }

    .tn-activity-browse-card__top-pick {
      left: 12px;
      bottom: 12px;
    }

    .tn-activity-browse-card__body,
    .tn-activity-browse-card.is-featured .tn-activity-browse-card__body {
      padding: 19px;
    }

    .tn-activity-browse-card.is-featured .tn-activity-browse-card__heading,
    .tn-activity-browse-card__heading {
      font-size: 22px;
      line-height: 1.1;
    }

    .tn-activity-browse-card__actions {
      gap: 10px;
      padding-top: 17px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tn-activity-browse-card,
    .tn-activity-browse-card__details {
      transition: none;
    }
  }
`;

export function ActivityBrowseCardStyles() {
  return <style>{CARD_STYLES}</style>;
}

/**
 * Premium, collection-aware activity card used by the editorial Activities page.
 * It intentionally keeps the page callbacks identical to the legacy ActivityCard.
 */
export function ActivityBrowseCard({
  a,
  onAdd,
  onView,
  inTrip,
  featured = false,
  ricoPick = false,
  collectionAccent,
}) {
  if (!a) return null;

  const operator = operators.find((item) => item.id === a.operatorId);
  // Publication stays fail-closed: never present an activity as approved when
  // its approved operator record is not available.
  if (!operator) return null;

  const rico = ticoActivityVerdict(a);
  const accent = collectionAccent || c.teal;

  return (
      <article
        className={`tn-activity-browse-card${featured ? " is-featured" : ""}${ricoPick ? " is-rico-pick" : ""}`}
        style={{ "--activity-accent": accent }}
      >
        <div className="tn-activity-browse-card__media">
          <div className="tn-activity-browse-card__photo">
            <Photo
              src={activityImage(a, featured ? 1400 : 900)}
              fallback={gradFor(a.category)}
              alt={a.title}
              height={featured ? "100%" : 224}
              style={{ height: "100%", minHeight: featured ? 430 : 224 }}
              overlay={(
                <div
                  aria-hidden="true"
                  style={{
                    width: "100%",
                    height: "100%",
                    background: featured
                      ? "linear-gradient(180deg, rgba(5,16,30,.08) 18%, rgba(5,16,30,.72) 100%)"
                      : "linear-gradient(180deg, rgba(5,16,30,.06) 22%, rgba(5,16,30,.78) 100%)",
                  }}
                />
              )}
            />
          </div>

          <div className="tn-activity-browse-card__media-top">
            <span className="tn-activity-browse-card__type" title={a.category}>
              {a.category}
            </span>
            <span
              className="tn-activity-browse-card__approved"
              title={`Operated by approved partner ${operator.name}`}
            >
              <ShieldCheck size={13} aria-hidden="true" />
              <span>Approved</span>
            </span>
          </div>

          <div className="tn-activity-browse-card__price" aria-label={`${money(a.price)} per person`}>
            {money(a.price)} <small>/ person</small>
          </div>
          {ricoPick ? (
            <div className="tn-activity-browse-card__top-pick">
              <Sparkles size={12} aria-hidden="true" />Rico's top pick
            </div>
          ) : null}
        </div>

        <div className="tn-activity-browse-card__body">
          <h3 className="tn-activity-browse-card__heading">{a.title}</h3>

          <div className="tn-activity-browse-card__meta" aria-label="Activity details">
            {a.region && <span><MapPin size={13} aria-hidden="true" />{a.region}</span>}
            {a.duration && <span><Clock3 size={13} aria-hidden="true" />{a.duration}</span>}
            {a.level && <span><Compass size={13} aria-hidden="true" />{a.level}</span>}
          </div>

          <div
            className="tn-activity-browse-card__rico"
            title={`Rico rates this ${rico.score} out of 5: ${rico.label}`}
          >
            <span className="tn-activity-browse-card__rico-score" aria-hidden="true">
              {rico.score.toFixed(1)}
            </span>
            <span className="tn-activity-browse-card__rico-copy">
              <strong><Sparkles size={11} aria-hidden="true" />Rico's read</strong>
              {rico.label}
            </span>
          </div>

          <div className="tn-activity-browse-card__operator">
            Operated by <strong>{operator.name}</strong>
          </div>

          <div className="tn-activity-browse-card__actions">
            <Button
              type="button"
              variant={inTrip ? "dark" : "primary"}
              size="sm"
              className="tn-activity-browse-card__primary"
              style={{ width: "100%" }}
              onClick={() => onAdd(a.id)}
              aria-label={inTrip ? `${a.title} is added to your trip` : `Add ${a.title} to your trip`}
            >
              {inTrip ? <><Check size={15} aria-hidden="true" />Added</> : <><Plus size={15} aria-hidden="true" />Add to trip</>}
            </Button>

            <button
              type="button"
              className="tn-activity-browse-card__details"
              onClick={() => onView(a.id)}
              aria-label={`View details for ${a.title}`}
            >
              Details <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>
  );
}
