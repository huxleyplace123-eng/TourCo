import React from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { c } from "../theme.js";

const QUESTIONS = [
  {
    question: "Does adding an activity book or charge me?",
    answer: "No. Saving an experience or sending a planning request does not create a reservation or charge you. TicoWild confirms the current details first.",
  },
  {
    question: "Are the website prices and availability final?",
    answer: "Website prices are planning estimates. Availability, the operating provider, final price and payment terms are confirmed in writing before payment.",
  },
  {
    question: "Who actually operates each experience?",
    answer: "Experiences are delivered by independent providers. The provider identity and the details TicoWild has checked are shared during confirmation.",
  },
  {
    question: "What happens with weather or cancellations?",
    answer: "Cancellation, weather and refund terms can vary by provider. The applicable terms are provided with the confirmed offer before payment.",
  },
  {
    question: "How do I know an activity works for my children?",
    answer: "Age, height, swimming, health and ability requirements vary by activity and provider. Share your group details so the relevant requirements can be checked before you decide.",
  },
];

export function HomeFAQ() {
  return (
    <section className="home-faq" aria-labelledby="home-faq-title">
      <div className="home-faq-shell">
        <div className="home-faq-intro">
          <span className="home-faq-kicker"><ShieldCheck size={16} /> Before you choose</span>
          <h2 id="home-faq-title">Clear answers.<br /><em>No surprises.</em></h2>
          <p>Know what happens next, what is confirmed, and what is not final yet.</p>
        </div>
        <div className="home-faq-list">
          {QUESTIONS.map(({ question, answer }, index) => (
            <details key={question} open={index === 0}>
              <summary><span>{question}</span><ChevronDown size={18} aria-hidden="true" /></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
      <style>{`
        .home-faq{padding:74px 24px;background:#071528;border-top:1px solid rgba(127,166,232,.12);border-bottom:1px solid rgba(127,166,232,.12)}
        .home-faq-shell{width:min(1240px,100%);margin:0 auto;display:grid;grid-template-columns:minmax(280px,.72fr) minmax(0,1.28fr);gap:clamp(46px,7vw,96px);align-items:start}
        .home-faq-kicker{display:inline-flex;align-items:center;gap:8px;color:${c.teal};font-size:11px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}
        .home-faq-intro h2{margin:17px 0 16px;color:#fff;font-size:clamp(38px,4.2vw,58px);font-weight:830;letter-spacing:-.052em;line-height:.97}.home-faq-intro h2 em{color:${c.gold};font:inherit;font-style:normal}
        .home-faq-intro p{max-width:420px;margin:0;color:${c.stone};font-size:14.5px;line-height:1.65}
        .home-faq-list{border-top:1px solid rgba(127,166,232,.2)}
        .home-faq-list details{border-bottom:1px solid rgba(127,166,232,.2)}
        .home-faq-list summary{min-height:65px;display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;cursor:pointer;list-style:none;color:#fff;font-size:15px;font-weight:820}.home-faq-list summary::-webkit-details-marker{display:none}
        .home-faq-list summary svg{color:${c.teal};transition:transform .2s ease}.home-faq-list details[open] summary svg{transform:rotate(180deg)}
        .home-faq-list details p{max-width:760px;margin:-4px 34px 20px 0;color:${c.stone};font-size:13.5px;line-height:1.65}
        @media(max-width:760px){.home-faq{padding:56px 18px}.home-faq-shell{grid-template-columns:1fr;gap:34px}.home-faq-intro h2{font-size:clamp(38px,11vw,48px)}.home-faq-list summary{min-height:61px;font-size:14px}.home-faq-list details p{margin:0 26px 18px 0;font-size:13px}}
      `}</style>
    </section>
  );
}
