import React from "react";
import { ArrowRight, Bird, Check, Heart, MapPin, ShieldCheck, Sparkles, UtensilsCrossed, Waves, Zap } from "lucide-react";
import { c, gradFor } from "../theme.js";
import { Button } from "../components/ui.jsx";
import { Photo, Reveal } from "../motion.jsx";
import { CinematicHero } from "../components/CinematicHero.jsx";
import { activityImage, themedSlides } from "../images.js";
import { activities, regions } from "../data.js";
import { activityPath } from "../routing.js";

const FEELINGS = [
  { icon: Waves, title: "Easy coast", note: "Warm water. Slow afternoons." },
  { icon: Bird, title: "Wildlife", note: "Rainforest mornings." },
  { icon: Zap, title: "Big adventure", note: "Go home with a story." },
  { icon: Heart, title: "Just us", note: "Private, quiet, unforgettable." },
  { icon: UtensilsCrossed, title: "Food & nights", note: "Local flavor after dark." },
];

const FEATURED_IDS = ["a15", "a16", "a4", "a11"];
const FEATURED = FEATURED_IDS.map((id) => activities.find((activity) => activity.id === id)).filter(Boolean);
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
        <div className="home-feeling-wrap">
          <div className="home-feeling-head">
            <span>Start with a feeling</span>
            <strong>What sounds like you?</strong>
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

        <div className="home-shell home-featured-wrap">
          <Reveal>
            <div className="home-section-head">
              <div>
                <span className="home-kicker">Handpicked in Costa Rica</span>
                <h2>Days worth building<br />a trip around.</h2>
              </div>
              <div>
                <p>No endless catalog. Just remarkable experiences with a clear reason to go.</p>
                <button className="home-text-link" onClick={() => go("activities")}>See the collection <ArrowRight size={17} /></button>
              </div>
            </div>
          </Reveal>

          <div className="home-featured-track" aria-label="Featured Costa Rica experiences">
            {FEATURED.map((activity, index) => (
              <Reveal key={activity.id} delay={index * 60}>
                <a
                  className="home-feature-card"
                  href={activityPath(activity)}
                  onClick={(event) => {
                    event.preventDefault();
                    viewActivity(activity.id);
                  }}
                >
                  <div className="home-feature-image">
                    <Photo src={activity.id === "a11" ? HOME_REGION_IMAGE.src : activityImage(activity, 900)} fallback={gradFor(activity.category)} alt={activity.title} height="100%" />
                    <span className="home-feature-region">{activity.region}</span>
                    <span className="home-feature-arrow"><ArrowRight size={17} /></span>
                  </div>
                  <div className="home-feature-body">
                    <small>{activity.category}</small>
                    <h3>{activity.title}</h3>
                    <div><span>★ {activity.rating}</span><span>{activity.duration}</span><strong>from ${activity.price}</strong></div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="home-regions" style={{ "--home-region-image": `url(${HOME_REGION_IMAGE.src})` }}>
        <div className="home-regions-wash" />
        <div className="home-shell home-regions-content">
          <Reveal>
            <span className="home-kicker">One country. Completely different worlds.</span>
            <h2>Follow the feeling.<br /><em>We’ll shape the route.</em></h2>
            <p>Pacific blue, cloud forest, warm rain and hidden waterfalls—without turning your vacation into a driving schedule.</p>
            <Button variant="primary" size="lg" onClick={() => go("map")}>Explore Costa Rica <ArrowRight size={18} /></Button>
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
              <span className="home-kicker">The TicoWild difference</span>
              <h2>You imagine the trip.<br />We make the days work.</h2>
              <p>No planning maze. Tell us what matters, and we’ll turn it into a practical Costa Rica plan with the real details checked.</p>
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
            <span className="home-kicker">Your Costa Rica starts here</span>
            <h2>A trip this beautiful<br />should feel simple.</h2>
            <p>Two quick choices are enough to begin. We’ll shape the rest around you.</p>
            <Button variant="primary" size="lg" onClick={() => go("build")}>Plan my Costa Rica trip <ArrowRight size={18} /></Button>
          </Reveal>
        </div>
      </section>

      <style>{`
        .home-shell{width:min(1240px,calc(100% - 48px));margin:0 auto}
        .home-kicker{display:inline-flex;align-items:center;gap:9px;color:${c.teal};font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
        .home-kicker:before{content:"";width:26px;height:1px;background:${c.teal}}
        .home-text-link{display:inline-flex;align-items:center;gap:9px;margin-top:20px;padding:0;border:0;background:transparent;color:#fff;font:inherit;font-size:14px;font-weight:850;cursor:pointer}
        .home-text-link svg{color:${c.gold};transition:transform .2s ease}.home-text-link:hover svg{transform:translateX(4px)}

        .home-discovery{position:relative;padding:0 0 118px;background:#071524;overflow:hidden}
        .home-discovery:before{content:"";position:absolute;width:760px;height:760px;right:-330px;top:120px;border-radius:50%;background:radial-gradient(circle,rgba(34,211,238,.1),transparent 68%);pointer-events:none}
        .home-feeling-wrap{position:relative;z-index:5;width:min(1320px,calc(100% - 48px));margin:0 auto;padding:20px 22px;border:1px solid rgba(111,205,227,.22);border-top:0;border-radius:0 0 24px 24px;background:rgba(9,24,43,.9);box-shadow:0 30px 80px -38px rgba(0,0,0,.95),0 0 60px -42px rgba(34,211,238,.7);backdrop-filter:blur(20px)}
        .home-feeling-head{display:flex;align-items:center;gap:12px;margin:0 4px 14px}.home-feeling-head span{color:${c.teal};font-size:9.5px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.home-feeling-head strong{color:#fff;font-size:14px}
        .home-feeling-track{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
        .home-feeling{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:10px;align-items:center;min-width:0;padding:13px 12px;border:1px solid rgba(127,166,232,.13);border-radius:15px;background:rgba(255,255,255,.035);color:#fff;text-align:left;cursor:pointer;transition:transform .2s ease,border-color .2s ease,background .2s ease}
        .home-feeling:hover{transform:translateY(-2px);border-color:rgba(34,211,238,.42);background:rgba(34,211,238,.07)}.home-feeling>span{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;color:${c.teal};background:rgba(34,211,238,.1)}.home-feeling div{display:grid;gap:2px;min-width:0}.home-feeling strong{font-size:13px;white-space:nowrap}.home-feeling small{color:${c.stone};font-size:9.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.home-feeling>svg{color:rgba(127,166,232,.55)}

        .home-featured-wrap{padding-top:112px}.home-section-head{display:grid;justify-items:center;text-align:center;gap:22px;margin:0 auto 48px}.home-section-head h2{margin:14px 0 0;color:#fff;font-size:clamp(48px,5.9vw,78px);font-weight:830;letter-spacing:-.055em;line-height:.94}.home-section-head>div:last-child{display:grid;justify-items:center}.home-section-head p{margin:0;color:rgba(225,235,250,.7);font-size:16px;line-height:1.67;max-width:540px}
        .home-featured-track{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.home-featured-track>div{min-width:0}
        .home-feature-card{display:block;height:100%;overflow:hidden;border:1px solid rgba(127,166,232,.16);border-radius:21px;background:linear-gradient(150deg,rgba(255,255,255,.055),rgba(9,23,41,.94));text-decoration:none;box-shadow:0 26px 70px -46px rgba(0,0,0,.95);transition:transform .28s cubic-bezier(.2,.7,.2,1),border-color .2s ease,box-shadow .2s ease}
        .home-feature-card:hover{transform:translateY(-7px);border-color:rgba(34,211,238,.4);box-shadow:0 34px 74px -42px rgba(34,211,238,.25)}
        .home-feature-image{position:relative;height:300px;overflow:hidden}.home-feature-image:after{content:"";position:absolute;inset:45% 0 0;background:linear-gradient(transparent,rgba(5,15,30,.78))}.home-feature-image img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s cubic-bezier(.2,.7,.2,1)}.home-feature-card:hover img{transform:scale(1.055)}
        .home-feature-region{position:absolute;z-index:2;left:14px;top:14px;padding:6px 9px;border-radius:999px;background:rgba(5,15,30,.68);border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(12px);color:#fff;font-size:9px;font-weight:850;letter-spacing:.06em;text-transform:uppercase}.home-feature-arrow{position:absolute;z-index:2;right:14px;bottom:13px;width:39px;height:39px;border-radius:50%;display:grid;place-items:center;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.24);backdrop-filter:blur(10px)}
        .home-feature-body{padding:18px 18px 19px}.home-feature-body>small{color:${c.teal};font-size:9.5px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}.home-feature-body h3{min-height:45px;margin:7px 0 15px;color:#fff;font-size:18px;line-height:1.22;letter-spacing:-.025em}.home-feature-body>div{display:grid;grid-template-columns:auto auto 1fr;gap:9px;align-items:center;color:${c.stone};font-size:10.5px}.home-feature-body>div span:first-child{color:${c.gold}}.home-feature-body>div strong{justify-self:end;color:#fff;font-size:12px}

        .home-regions{position:relative;min-height:760px;display:flex;align-items:center;overflow:hidden;background-image:var(--home-region-image);background-size:cover;background-position:center;isolation:isolate}
        .home-regions:before{content:"";position:absolute;inset:0;z-index:-1;background:inherit;background-size:cover;background-position:center;transform:scale(1.025)}
        .home-regions-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,15,30,.94) 0%,rgba(5,15,30,.68) 47%,rgba(5,15,30,.14) 100%),linear-gradient(0deg,rgba(5,15,30,.8) 0%,transparent 44%)}
        .home-regions-content{position:relative;z-index:2;padding-bottom:130px}.home-regions-content h2{margin:17px 0 20px;color:#fff;font-size:clamp(52px,6.4vw,86px);font-weight:830;letter-spacing:-.057em;line-height:.92;max-width:900px}.home-regions-content h2 em{font:inherit;color:${c.gold};font-style:normal}.home-regions-content p{max-width:570px;margin:0 0 30px;color:rgba(239,245,255,.8);font-size:17px;line-height:1.7}
        .home-region-dock{position:absolute;z-index:3;left:50%;bottom:26px;transform:translateX(-50%);display:grid;grid-template-columns:repeat(4,1fr);width:min(1320px,calc(100% - 48px));padding:10px;border:1px solid rgba(255,255,255,.17);border-radius:22px;background:rgba(5,15,30,.76);backdrop-filter:blur(18px);box-shadow:0 28px 70px -34px rgba(0,0,0,.9)}
        .home-region-dock button{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:15px 16px;border:0;border-right:1px solid rgba(127,166,232,.16);background:transparent;color:#fff;text-align:left;cursor:pointer}.home-region-dock button:last-child{border-right:0}.home-region-dock button>span{color:${c.teal};font-size:9px;font-weight:900}.home-region-dock button div{display:grid;gap:2px}.home-region-dock strong{font-size:13px}.home-region-dock small{color:${c.stone};font-size:10px}.home-region-dock svg{color:rgba(255,255,255,.55);transition:transform .2s ease}.home-region-dock button:hover svg{transform:translateX(4px);color:${c.gold}}

        .home-concierge{position:relative;padding:126px 0;background:${c.sand};overflow:hidden;border-bottom:1px solid rgba(127,166,232,.12)}
        .home-concierge:after{content:"";position:absolute;width:520px;height:520px;left:-300px;bottom:-330px;border-radius:50%;border:1px solid rgba(34,211,238,.18);box-shadow:0 0 0 90px rgba(34,211,238,.025),0 0 0 180px rgba(34,211,238,.018);pointer-events:none}
        .home-concierge-grid{display:grid;grid-template-columns:minmax(460px,1fr) minmax(0,.9fr);gap:clamp(70px,10vw,150px);align-items:center}.home-concierge-grid>div:first-child{order:2}.home-concierge-copy{text-align:right}.home-concierge-copy .home-kicker{justify-content:flex-end}.home-concierge-copy h2{margin:18px 0 22px;color:#fff;font-size:clamp(42px,5.1vw,68px);font-weight:830;letter-spacing:-.052em;line-height:.98}.home-concierge-copy>p{margin:0 0 31px auto;color:${c.stone};font-size:17px;line-height:1.72;max-width:590px}
        .home-promise-panel{order:1;position:relative;padding:19px 34px 12px;border:1px solid rgba(127,166,232,.18);border-radius:28px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(9,24,43,.72));box-shadow:0 36px 100px -58px rgba(0,0,0,.9);backdrop-filter:blur(18px)}.home-promise-label{display:block;padding:5px 0 12px;color:${c.gold};font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.home-promise-row{display:grid;grid-template-columns:50px 1fr;gap:18px;align-items:start;padding:24px 0;border-top:1px solid rgba(127,166,232,.14)}.home-promise-icon{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;color:${c.teal};background:rgba(34,211,238,.09);border:1px solid rgba(34,211,238,.2)}.home-promise-row h3{margin:1px 0 6px;color:#fff;font-size:18px;letter-spacing:-.02em}.home-promise-row p{margin:0;color:${c.stone};font-size:13.5px;line-height:1.58}

        .home-closing{position:relative;min-height:570px;display:grid;place-items:center;overflow:hidden;background-image:var(--home-close-image);background-size:cover;background-position:center 56%;isolation:isolate}.home-closing:before{content:"";position:absolute;inset:0;z-index:-1;background:inherit;background-size:cover;background-position:center 56%;transform:scale(1.02)}.home-closing-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,16,31,.88) 0%,rgba(5,16,31,.58) 50%,rgba(5,16,31,.36) 100%),linear-gradient(0deg,rgba(5,16,31,.5),transparent 45%)}.home-closing-content{position:relative;z-index:1;width:min(1240px,calc(100% - 48px));margin:0 auto;padding:92px 0;text-align:center}.home-closing-content .home-kicker{justify-content:center}.home-closing-content h2{margin:16px auto 18px;color:#fff;font-size:clamp(48px,6vw,80px);font-weight:830;letter-spacing:-.055em;line-height:.94;max-width:820px}.home-closing-content p{margin:0 auto 30px;color:rgba(239,245,255,.8);font-size:18px;line-height:1.65;max-width:560px}

        @media(max-width:1050px){.home-feeling-track{grid-template-columns:repeat(5,minmax(180px,1fr));overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:3px}.home-feeling{scroll-snap-align:start}.home-featured-track{grid-template-columns:repeat(4,minmax(255px,1fr));overflow-x:auto;scroll-snap-type:x mandatory;padding:0 1px 18px}.home-featured-track>div{scroll-snap-align:start}.home-concierge-grid{grid-template-columns:1fr;gap:52px}.home-promise-panel{max-width:680px}}
        @media(max-width:760px){
          .home-shell,.home-closing-content{width:calc(100% - 36px)}
          .home-discovery{padding-bottom:78px}.home-feeling-wrap{width:100%;margin:0;padding:23px 0 18px;border-width:0 0 1px;border-radius:0;background:#09182b}.home-feeling-head{padding:0 18px;margin-bottom:14px}.home-feeling-track{padding:0 18px 5px;grid-template-columns:repeat(5,190px);gap:8px;scroll-padding-left:18px}.home-feeling{padding:12px 11px}
          .home-featured-wrap{padding-top:72px}.home-section-head{grid-template-columns:1fr;gap:22px;margin-bottom:30px}.home-section-head h2{font-size:clamp(42px,12vw,56px);line-height:.95}.home-section-head p{font-size:15px}.home-featured-track{margin-right:-18px;grid-template-columns:repeat(4,78vw);gap:11px}.home-feature-image{height:320px}.home-feature-body h3{min-height:auto}
          .home-regions{min-height:730px;align-items:flex-start;background-position:60% center}.home-regions:before{background-position:60% center}.home-regions-wash{background:linear-gradient(180deg,rgba(5,15,30,.88) 0%,rgba(5,15,30,.55) 52%,rgba(5,15,30,.94) 100%)}.home-regions-content{padding-top:72px;padding-bottom:190px}.home-regions-content h2{font-size:clamp(44px,12.8vw,60px);line-height:.95}.home-regions-content p{font-size:15px;line-height:1.62}.home-regions-content .tico-button{width:100%}.home-region-dock{left:0;right:0;bottom:18px;transform:none;width:100%;display:flex;overflow-x:auto;border-left:0;border-right:0;border-radius:0;padding:9px 18px;scroll-snap-type:x mandatory}.home-region-dock button{flex:0 0 225px;scroll-snap-align:start;border-right:1px solid rgba(127,166,232,.16)}
          .home-concierge{padding:78px 0}.home-concierge-grid{gap:38px}.home-concierge-grid>div:first-child{order:1}.home-concierge-copy{text-align:left}.home-concierge-copy .home-kicker{justify-content:flex-start}.home-concierge-copy h2{font-size:clamp(36px,10.7vw,46px);line-height:1}.home-concierge-copy>p{font-size:15px;line-height:1.62;margin:0 0 26px}.home-concierge-copy .tico-button{width:100%}.home-promise-panel{order:2;margin:0 -4px;padding:16px 20px 8px;border-radius:22px}.home-promise-row{grid-template-columns:42px 1fr;gap:13px;padding:19px 0}.home-promise-icon{width:40px;height:40px;border-radius:13px}.home-promise-row h3{font-size:16px}.home-promise-row p{font-size:12.5px;line-height:1.5}
          .home-closing{min-height:500px;background-position:66% center}.home-closing:before{background-position:66% center}.home-closing-wash{background:linear-gradient(90deg,rgba(5,16,31,.94),rgba(5,16,31,.66)),linear-gradient(0deg,rgba(5,16,31,.55),transparent)}.home-closing-content{padding:74px 0}.home-closing-content h2{font-size:clamp(42px,12vw,54px);line-height:.98}.home-closing-content p{font-size:15.5px}.home-closing-content .tico-button{width:100%}
        }
      `}</style>
    </>
  );
}
