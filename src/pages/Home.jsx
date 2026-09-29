import React from "react";
import { ArrowRight, Bird, Check, Heart, MapPin, ShieldCheck, Sparkles, UtensilsCrossed, Waves, Zap } from "lucide-react";
import { c } from "../theme.js";
import { Button } from "../components/ui.jsx";
import { Reveal } from "../motion.jsx";
import { CinematicHero } from "../components/CinematicHero.jsx";
import { activityImage, themedSlides } from "../images.js";
import { activities, regions } from "../data.js";
import { activityPath } from "../routing.js";

const FEELINGS = [
  { icon: Waves, title: "Beach days", note: "Warm water and a slower pace." },
  { icon: Bird, title: "Wildlife", note: "Rainforest, rivers and rare encounters." },
  { icon: Zap, title: "Adventure", note: "Zip lines, rapids and stories worth telling." },
  { icon: Heart, title: "Time together", note: "Private, romantic and unhurried." },
  { icon: UtensilsCrossed, title: "Food & nights", note: "Local flavors and memorable evenings." },
];

const ACTION_IDS = ["a7", "a10", "a6", "a9"];
const ACTION_COPY = {
  a7: { kicker: "Above the rainforest", title: "Fly the canopy" },
  a10: { kicker: "Deep in the green", title: "Run the river" },
  a6: { kicker: "Out on the Pacific", title: "Catch the break" },
  a9: { kicker: "Wild water", title: "Meet the giants" },
};
const ACTIONS = ACTION_IDS.map((id) => activities.find((activity) => activity.id === id)).filter(Boolean);
const REGION_NAMES = ["Manuel Antonio", "Guanacaste", "Uvita", "Dominical"];
const FEATURED_REGIONS = REGION_NAMES.map((name) => regions.find((region) => region.name === name)).filter(Boolean);
const HOME_REGION_IMAGE = themedSlides("home", 1800)[6];
const HOME_CLOSE_IMAGE = themedSlides("home", 1800)[8];

const PROMISES = [
  { icon: MapPin, title: "A route that flows", body: "The right experiences in the right order—without zig-zagging the country." },
  { icon: ShieldCheck, title: "Real details, checked", body: "Availability, timing and operator details are confirmed before you decide." },
  { icon: Check, title: "One clear plan", body: "Your days, pricing and next steps stay together in one place." },
];

export function Home({ go, viewActivity, browseActivities }) {
  return (
    <>
      <CinematicHero go={go} onSearch={browseActivities} />

      <section className="home-discovery">
        <div className="home-shell home-feeling-wrap">
          <div className="home-feeling-head">
            <span className="home-kicker">01 · Start with what you love</span>
            <h2>What do you want more of?</h2>
            <p>Pick what sounds best. We’ll show you the experiences and places that fit.</p>
          </div>
          <div className="home-feeling-track">
            {FEELINGS.map(({ icon: Icon, title, note }) => (
              <button key={title} className="home-feeling" onClick={() => go("build")}>
                <span><Icon size={19} /></span>
                <div><strong>{title}</strong><small>{note}</small></div>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="home-action" aria-labelledby="home-action-title">
        <div className="home-shell home-action-head">
          <span className="home-kicker">02 · Find the spark</span>
          <h2 id="home-action-title">See the kind of day<br /><em>that pulls you in.</em></h2>
          <p>Turn that feeling into something real: canopy air, white water, warm waves or wildlife.</p>
        </div>
        <div className="home-action-grid">
          {ACTIONS.map((activity, index) => (
            <a
              key={activity.id}
              className={`home-action-scene home-action-scene-${index + 1}`}
              href={activityPath(activity)}
              onClick={(event) => {
                event.preventDefault();
                viewActivity(activity.id);
              }}
            >
              <img src={activityImage(activity, index === 0 ? 1500 : 1100)} alt={activity.title} loading="lazy" decoding="async" />
              <span className="home-action-shade" />
              <span className="home-action-copy">
                <small>{ACTION_COPY[activity.id].kicker}</small>
                <strong>{ACTION_COPY[activity.id].title}</strong>
                <span>{activity.region} <ArrowRight size={16} /></span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="home-regions" style={{ "--home-region-image": `url(${HOME_REGION_IMAGE.src})` }}>
        <div className="home-regions-wash" />
        <div className="home-shell home-regions-content">
          <Reveal>
            <span className="home-kicker">03 · Give it a place</span>
            <h2>Now shape the route.<br /><em>We’ll keep it practical.</em></h2>
            <p>Once you know what excites you, we place it where the geography, drive time and pace make sense.</p>
            <Button variant="primary" size="lg" onClick={() => go("map")}>See where it fits <ArrowRight size={18} /></Button>
          </Reveal>
        </div>
        <div className="home-region-dock" aria-label="Explore Costa Rica regions">
          {FEATURED_REGIONS.map((region, index) => (
            <button key={region.name} onClick={() => go("map")}>
              <span>0{index + 1}</span><div><strong>{region.name}</strong><small>{region.tag}</small></div><ArrowRight size={15} />
            </button>
          ))}
        </div>
      </section>

      <section className="home-concierge">
        <div className="home-shell home-concierge-grid">
          <Reveal>
            <div className="home-concierge-copy">
              <span className="home-kicker">04 · Bring it together</span>
              <h2>You choose the feeling.<br />We make the days work.</h2>
              <p>Now TicoWild connects the experiences, route and real details into one trip you can understand.</p>
              <Button variant="primary" size="lg" onClick={() => go("build")}><Sparkles size={17} />Start my plan</Button>
            </div>
          </Reveal>

          <div className="home-promise-panel">
            <span className="home-promise-label">Made easier from the start</span>
            {PROMISES.map(({ icon: Icon, title, body }, index) => (
              <Reveal key={title} delay={index * 70}>
                <div className="home-promise-row">
                  <span className="home-promise-icon"><Icon size={20} /></span>
                  <div><h3>{title}</h3><p>{body}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="home-closing" style={{ "--home-close-image": `url(${HOME_CLOSE_IMAGE.src})` }}>
        <div className="home-closing-wash" />
        <div className="home-closing-content">
          <Reveal>
            <span className="home-kicker">One clear next step</span>
            <h2>Ready to make it<br />feel like yours?</h2>
            <p>Tell us who is going and what matters most. We’ll take it from there.</p>
            <Button variant="primary" size="lg" onClick={() => go("build")}>Plan my Costa Rica trip <ArrowRight size={18} /></Button>
          </Reveal>
        </div>
      </section>

      <style>{`
        .home-shell{width:min(1240px,calc(100% - 48px));margin:0 auto}
        .home-kicker{display:inline-flex;align-items:center;gap:9px;color:${c.teal};font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
        .home-kicker:before{content:"";width:30px;height:5px;border-top:1px solid ${c.teal};border-bottom:1px solid rgba(34,211,238,.38);box-shadow:0 5px 18px -8px rgba(34,211,238,.8)}
        .home-discovery{position:relative;background:#071524;overflow:hidden}
        .home-discovery:before{content:"";position:absolute;width:760px;height:760px;right:-330px;top:20px;border-radius:50%;background:radial-gradient(circle,rgba(34,211,238,.1),transparent 68%);pointer-events:none}
        .home-feeling-wrap{position:relative;z-index:2;padding:84px 0 90px}
        .home-feeling-head{display:grid;justify-items:center;text-align:center;margin:0 auto 34px;max-width:820px}.home-feeling-head>.home-kicker{margin-bottom:16px}.home-feeling-head h2{margin:0;color:#fff;font-size:clamp(46px,5.2vw,70px);font-weight:830;letter-spacing:-.055em;line-height:.96}.home-feeling-head p{margin:17px auto 0;color:${c.stone};font-size:17px;line-height:1.62;max-width:570px}
        .home-feeling-track{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
        .home-feeling{position:relative;display:grid;align-content:start;gap:0;min-width:0;min-height:156px;padding:20px;border:1px solid rgba(127,166,232,.17);border-radius:20px;background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(9,24,43,.84));color:#fff;text-align:left;cursor:pointer;box-shadow:0 24px 50px -42px rgba(0,0,0,.95);transition:transform .2s ease,border-color .2s ease,background .2s ease}
        .home-feeling:hover{transform:translateY(-4px);border-color:rgba(34,211,238,.42);background:rgba(34,211,238,.08)}.home-feeling>span{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;color:${c.teal};background:rgba(34,211,238,.1);border:1px solid rgba(34,211,238,.15)}.home-feeling div{display:grid;gap:6px;min-width:0;margin-top:16px}.home-feeling strong{font-size:16px;letter-spacing:-.015em}.home-feeling small{color:${c.stone};font-size:12px;line-height:1.45}.home-feeling>svg{position:absolute;right:18px;top:33px;color:rgba(127,166,232,.68)}

        .home-regions{position:relative;min-height:760px;display:flex;align-items:center;overflow:hidden;background-image:var(--home-region-image);background-size:cover;background-position:center;isolation:isolate}
        .home-regions:before{content:"";position:absolute;inset:0;z-index:-1;background:inherit;background-size:cover;background-position:center;transform:scale(1.025)}
        .home-regions-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,15,30,.94) 0%,rgba(5,15,30,.68) 47%,rgba(5,15,30,.14) 100%),linear-gradient(0deg,rgba(5,15,30,.8) 0%,transparent 44%)}
        .home-regions-content{position:relative;z-index:2;padding-bottom:130px}.home-regions-content h2{margin:17px 0 20px;color:#fff;font-size:clamp(52px,6.4vw,86px);font-weight:830;letter-spacing:-.057em;line-height:.92;max-width:900px}.home-regions-content h2 em{font:inherit;color:${c.gold};font-style:normal}.home-regions-content p{max-width:570px;margin:0 0 30px;color:rgba(239,245,255,.8);font-size:17px;line-height:1.7}
        .home-region-dock{position:absolute;z-index:3;left:50%;bottom:26px;transform:translateX(-50%);display:grid;grid-template-columns:repeat(4,1fr);width:min(1320px,calc(100% - 48px));padding:10px;border:1px solid rgba(255,255,255,.17);border-radius:22px;background:rgba(5,15,30,.76);backdrop-filter:blur(18px);box-shadow:0 28px 70px -34px rgba(0,0,0,.9)}
        .home-region-dock button{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:15px 16px;border:0;border-right:1px solid rgba(127,166,232,.16);background:transparent;color:#fff;text-align:left;cursor:pointer}.home-region-dock button:last-child{border-right:0}.home-region-dock button>span{color:${c.teal};font-size:9px;font-weight:900}.home-region-dock button div{display:grid;gap:2px}.home-region-dock strong{font-size:13px}.home-region-dock small{color:${c.stone};font-size:10px}.home-region-dock svg{color:rgba(255,255,255,.55);transition:transform .2s ease}.home-region-dock button:hover svg{transform:translateX(4px);color:${c.gold}}

        .home-action{padding:116px 0 128px;background:#050f1f;overflow:hidden}.home-action-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.46fr);column-gap:70px;align-items:end;margin-bottom:42px}.home-action-head>.home-kicker{grid-column:1 / -1;margin-bottom:16px}.home-action-head h2{margin:0;color:#fff;font-size:clamp(48px,5.9vw,78px);font-weight:830;letter-spacing:-.055em;line-height:.94}.home-action-head h2 em{color:${c.gold};font:inherit;font-style:normal}.home-action-head p{margin:0 0 5px;color:${c.stone};font-size:16px;line-height:1.68;max-width:420px}.home-action-grid{width:min(1380px,calc(100% - 48px));height:690px;margin:0 auto;display:grid;grid-template-columns:1.18fr .78fr .78fr;grid-template-rows:1fr 1fr;gap:12px}.home-action-scene{position:relative;display:block;min-width:0;overflow:hidden;border-radius:24px;border:1px solid rgba(255,255,255,.13);background:#0b1a2e;box-shadow:0 35px 90px -54px rgba(0,0,0,.95)}.home-action-scene-1{grid-row:1 / 3}.home-action-scene-2{grid-column:2 / 4}.home-action-scene img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(1.16) contrast(1.03);transition:transform 1.1s cubic-bezier(.2,.7,.2,1),filter .35s ease}.home-action-scene:hover img{transform:scale(1.045);filter:saturate(1.3) contrast(1.04)}.home-action-shade{position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(3,12,25,.88) 100%),linear-gradient(110deg,rgba(3,12,25,.2),transparent 56%)}.home-action-copy{position:absolute;z-index:2;left:28px;right:24px;bottom:25px;display:grid;gap:5px;color:#fff}.home-action-copy small{color:${c.teal};font-size:10px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.home-action-copy strong{font-size:clamp(25px,2.8vw,41px);line-height:1;letter-spacing:-.04em}.home-action-copy>span{display:flex;align-items:center;gap:7px;color:rgba(255,255,255,.78);font-size:12px;font-weight:750}.home-action-copy svg{color:${c.gold};transition:transform .2s ease}.home-action-scene:hover .home-action-copy svg{transform:translateX(4px)}

        .home-concierge{position:relative;padding:126px 0;background:${c.sand};overflow:hidden;border-bottom:1px solid rgba(127,166,232,.12)}
        .home-concierge:after{content:"";position:absolute;width:520px;height:520px;left:-300px;bottom:-330px;border-radius:50%;border:1px solid rgba(34,211,238,.18);box-shadow:0 0 0 90px rgba(34,211,238,.025),0 0 0 180px rgba(34,211,238,.018);pointer-events:none}
        .home-concierge-grid{display:grid;grid-template-columns:minmax(460px,1fr) minmax(0,.9fr);gap:clamp(70px,10vw,150px);align-items:center}.home-concierge-grid>div:first-child{order:2}.home-concierge-copy{text-align:right}.home-concierge-copy .home-kicker{justify-content:flex-end}.home-concierge-copy h2{margin:18px 0 22px;color:#fff;font-size:clamp(42px,5.1vw,68px);font-weight:830;letter-spacing:-.052em;line-height:.98}.home-concierge-copy>p{margin:0 0 31px auto;color:${c.stone};font-size:17px;line-height:1.72;max-width:590px}
        .home-promise-panel{order:1;position:relative;padding:19px 34px 12px;border:1px solid rgba(127,166,232,.18);border-radius:28px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(9,24,43,.72));box-shadow:0 36px 100px -58px rgba(0,0,0,.9);backdrop-filter:blur(18px)}.home-promise-label{display:block;padding:5px 0 12px;color:${c.gold};font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.home-promise-row{display:grid;grid-template-columns:50px 1fr;gap:18px;align-items:start;padding:24px 0;border-top:1px solid rgba(127,166,232,.14)}.home-promise-icon{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;color:${c.teal};background:rgba(34,211,238,.09);border:1px solid rgba(34,211,238,.2)}.home-promise-row h3{margin:1px 0 6px;color:#fff;font-size:18px;letter-spacing:-.02em}.home-promise-row p{margin:0;color:${c.stone};font-size:13.5px;line-height:1.58}

        .home-closing{position:relative;min-height:570px;display:grid;place-items:center;overflow:hidden;background-image:var(--home-close-image);background-size:cover;background-position:center 56%;isolation:isolate}.home-closing:before{content:"";position:absolute;inset:0;z-index:-1;background:inherit;background-size:cover;background-position:center 56%;transform:scale(1.02)}.home-closing-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,16,31,.88) 0%,rgba(5,16,31,.58) 50%,rgba(5,16,31,.36) 100%),linear-gradient(0deg,rgba(5,16,31,.5),transparent 45%)}.home-closing-content{position:relative;z-index:1;width:min(1240px,calc(100% - 48px));margin:0 auto;padding:92px 0;text-align:center}.home-closing-content .home-kicker{justify-content:center}.home-closing-content h2{margin:16px auto 18px;color:#fff;font-size:clamp(48px,6vw,80px);font-weight:830;letter-spacing:-.055em;line-height:.94;max-width:820px}.home-closing-content p{margin:0 auto 30px;color:rgba(239,245,255,.8);font-size:18px;line-height:1.65;max-width:560px}

        @media(max-width:1050px){.home-feeling-track{grid-template-columns:repeat(5,minmax(205px,1fr));overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:3px}.home-feeling{scroll-snap-align:start}.home-concierge-grid{grid-template-columns:1fr;gap:52px}.home-promise-panel{max-width:680px}}
        @media(max-width:760px){
          .home-shell,.home-closing-content{width:calc(100% - 36px)}
          .home-feeling-wrap{width:100%;padding:64px 0 68px}.home-feeling-head{display:block;padding:0 18px;margin-bottom:26px;text-align:left}.home-feeling-head>.home-kicker{margin-bottom:13px}.home-feeling-head h2{font-size:clamp(39px,11vw,49px);line-height:.97}.home-feeling-head p{margin:15px 0 0;font-size:15px;line-height:1.58}.home-feeling-track{padding:0 18px 5px;grid-template-columns:repeat(5,72vw);gap:10px;scroll-padding-left:18px}.home-feeling{min-height:148px;padding:18px}
          .home-regions{min-height:730px;align-items:flex-start;background-position:60% center}.home-regions:before{background-position:60% center}.home-regions-wash{background:linear-gradient(180deg,rgba(5,15,30,.88) 0%,rgba(5,15,30,.55) 52%,rgba(5,15,30,.94) 100%)}.home-regions-content{padding-top:72px;padding-bottom:190px}.home-regions-content h2{font-size:clamp(44px,12.8vw,60px);line-height:.95}.home-regions-content p{font-size:15px;line-height:1.62}.home-regions-content .tico-button{width:100%}.home-region-dock{left:0;right:0;bottom:18px;transform:none;width:100%;display:flex;overflow-x:auto;border-left:0;border-right:0;border-radius:0;padding:9px 18px;scroll-snap-type:x mandatory}.home-region-dock button{flex:0 0 225px;scroll-snap-align:start;border-right:1px solid rgba(127,166,232,.16)}
          .home-action{padding:76px 0 88px}.home-action-head{display:block;margin-bottom:28px}.home-action-head>.home-kicker{margin-bottom:13px}.home-action-head h2{font-size:clamp(42px,12vw,56px);line-height:.95}.home-action-head p{margin-top:18px;font-size:15px;line-height:1.6}.home-action-grid{width:100%;height:480px;display:flex;gap:11px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 18px 8px;scroll-padding-left:18px}.home-action-scene{flex:0 0 84vw;height:100%;border-radius:22px;scroll-snap-align:start}.home-action-copy{left:21px;right:18px;bottom:84px}.home-action-copy strong{font-size:38px}.home-action-copy small{font-size:9px}
          .home-concierge{padding:78px 0}.home-concierge-grid{gap:38px}.home-concierge-grid>div:first-child{order:1}.home-concierge-copy{text-align:left}.home-concierge-copy .home-kicker{justify-content:flex-start}.home-concierge-copy h2{font-size:clamp(36px,10.7vw,46px);line-height:1}.home-concierge-copy>p{font-size:15px;line-height:1.62;margin:0 0 26px}.home-concierge-copy .tico-button{width:100%}.home-promise-panel{order:2;margin:0 -4px;padding:16px 20px 8px;border-radius:22px}.home-promise-row{grid-template-columns:42px 1fr;gap:13px;padding:19px 0}.home-promise-icon{width:40px;height:40px;border-radius:13px}.home-promise-row h3{font-size:16px}.home-promise-row p{font-size:12.5px;line-height:1.5}
          .home-closing{min-height:500px;background-position:66% center}.home-closing:before{background-position:66% center}.home-closing-wash{background:linear-gradient(90deg,rgba(5,16,31,.94),rgba(5,16,31,.66)),linear-gradient(0deg,rgba(5,16,31,.55),transparent)}.home-closing-content{padding:74px 0}.home-closing-content h2{font-size:clamp(42px,12vw,54px);line-height:.98}.home-closing-content p{font-size:15.5px}.home-closing-content .tico-button{width:100%}
        }
      `}</style>
    </>
  );
}
