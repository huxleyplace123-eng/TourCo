import React from "react";
import { ArrowRight, Check, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { c } from "../theme.js";
import { Button } from "../components/ui.jsx";
import { Reveal } from "../motion.jsx";
import { CinematicHero } from "../components/CinematicHero.jsx";
import { themedSlides } from "../images.js";
import { activities } from "../data.js";
import { activityPath } from "../routing.js";

const HOME_STORY_ACTIVITY_IDS = ["a7", "a12", "a10"];
const HOME_STORY_IMAGES = themedSlides("activities", 1400).slice(0, 3).map((image, index) => ({
  ...image,
  activity: activities.find((item) => item.id === HOME_STORY_ACTIVITY_IDS[index]),
}));
const HOME_CLOSE_IMAGE = themedSlides("home", 1800)[8];

const PROMISES = [
  { icon: MapPin, title: "A route that flows", body: "The right experiences, in the right order, without zig-zagging the country." },
  { icon: ShieldCheck, title: "Real details, checked", body: "Availability, timing and operator details are confirmed before you decide." },
  { icon: Check, title: "One clear plan", body: "Your days, pricing and next steps stay together instead of scattered across tabs." },
];

export function Home({ go, viewActivity }) {
  return (
    <>
      <CinematicHero go={go} />

      <section className="home-showcase">
        <div className="home-shell">
          <Reveal>
            <div className="home-showcase-head">
              <div>
                <span className="home-kicker">Built for the way Costa Rica actually feels</span>
                <h2>Less searching.<br /><em>More living.</em></h2>
              </div>
              <div className="home-showcase-intro">
                <p>Start with the feeling you want. We connect the coast, rainforest and wild days into one trip that makes sense.</p>
                <button className="home-text-link" onClick={() => go("build")}>Shape my trip <ArrowRight size={17} /></button>
              </div>
            </div>
          </Reveal>

          <div className="home-image-stage" aria-label="Costa Rica trip inspiration">
            {HOME_STORY_IMAGES.map((image, index) => image.activity && (
              <Reveal key={image.activity.id} delay={index * 70}>
                <a
                  className={`home-image-card home-image-card-${index + 1}`}
                  href={activityPath(image.activity)}
                  aria-label={`View ${image.activity.title}`}
                  onClick={(event) => {
                    event.preventDefault();
                    viewActivity(image.activity.id);
                  }}
                >
                  <img src={image.src} alt={image.activity.title} loading={index === 0 ? "eager" : "lazy"} fetchpriority="low" decoding="async" />
                  <span className="home-image-wash" />
                  <span className="home-image-copy">
                    <small>{index === 0 ? "Into the canopy" : index === 1 ? "Above the Pacific" : "Follow the river"}</small>
                    <strong>{image.activity.title}</strong>
                    <i><ArrowRight size={18} /></i>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="home-concierge">
        <div className="home-shell home-concierge-grid">
          <Reveal>
            <div className="home-concierge-copy">
              <span className="home-kicker">The TicoWild difference</span>
              <h2>You imagine the trip.<br />We make the days work.</h2>
              <p>No giant catalog. No planning maze. Tell us what matters, and we’ll turn it into a practical Costa Rica plan with the real details checked.</p>
              <Button variant="primary" size="lg" onClick={() => go("build")}><Sparkles size={17} />Start my plan</Button>
            </div>
          </Reveal>

          <div className="home-promise-panel">
            <span className="home-promise-label">What you get</span>
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

        .home-showcase{position:relative;padding:112px 0 118px;background:#071524;overflow:hidden}
        .home-showcase:before{content:"";position:absolute;width:620px;height:620px;right:-280px;top:-260px;border-radius:50%;background:radial-gradient(circle,rgba(34,211,238,.12),transparent 68%);pointer-events:none}
        .home-showcase-head{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(340px,.65fr);gap:clamp(52px,10vw,150px);align-items:end;margin-bottom:54px}
        .home-showcase h2{margin:15px 0 0;color:#fff;font-size:clamp(50px,6.2vw,86px);font-weight:830;letter-spacing:-.055em;line-height:.91}
        .home-showcase h2 em{font:inherit;color:${c.gold};font-style:normal}
        .home-showcase-intro{padding-bottom:5px}
        .home-showcase-intro p{margin:0;color:rgba(225,235,250,.72);font-size:17px;line-height:1.7;max-width:500px}
        .home-text-link{display:inline-flex;align-items:center;gap:9px;margin-top:22px;padding:0;border:0;background:transparent;color:#fff;font:inherit;font-size:14px;font-weight:850;cursor:pointer}
        .home-text-link svg{color:${c.gold};transition:transform .2s ease}.home-text-link:hover svg{transform:translateX(4px)}

        .home-image-stage{display:grid;grid-template-columns:1.45fr .72fr;grid-template-rows:repeat(2,260px);gap:14px}
        .home-image-stage>div:nth-child(1){grid-column:1;grid-row:1 / 3}
        .home-image-stage>div:nth-child(2){grid-column:2;grid-row:1}
        .home-image-stage>div:nth-child(3){grid-column:2;grid-row:2}
        .home-image-stage>div{min-width:0;min-height:0}
        .home-image-card{position:relative;display:block;width:100%;height:100%;overflow:hidden;border-radius:24px;border:1px solid rgba(255,255,255,.13);background:${c.canvas2};isolation:isolate;text-decoration:none;box-shadow:0 28px 80px -44px rgba(0,0,0,.9)}
        .home-image-card img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s cubic-bezier(.2,.7,.2,1),filter .4s ease}
        .home-image-card:hover img{transform:scale(1.045);filter:saturate(1.08)}
        .home-image-card:focus-visible{outline:3px solid ${c.teal};outline-offset:4px}
        .home-image-wash{position:absolute;inset:28% 0 0;background:linear-gradient(transparent,rgba(3,10,20,.9));pointer-events:none}
        .home-image-copy{position:absolute;z-index:2;left:28px;right:24px;bottom:25px;display:grid;grid-template-columns:1fr auto;align-items:end;gap:4px 20px;color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.7)}
        .home-image-copy small{grid-column:1;color:${c.teal};font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
        .home-image-copy strong{font-size:clamp(18px,2.2vw,30px);line-height:1.08;letter-spacing:-.035em}
        .home-image-copy i{grid-column:2;grid-row:1 / 3;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.24);backdrop-filter:blur(12px);color:#fff;font-style:normal}
        .home-image-card-2 .home-image-copy,.home-image-card-3 .home-image-copy{left:20px;right:18px;bottom:18px}.home-image-card-2 .home-image-copy strong,.home-image-card-3 .home-image-copy strong{font-size:19px}

        .home-concierge{position:relative;padding:126px 0;background:${c.sand};overflow:hidden;border-top:1px solid rgba(127,166,232,.12);border-bottom:1px solid rgba(127,166,232,.12)}
        .home-concierge:after{content:"";position:absolute;width:520px;height:520px;left:-300px;bottom:-330px;border-radius:50%;border:1px solid rgba(34,211,238,.18);box-shadow:0 0 0 90px rgba(34,211,238,.025),0 0 0 180px rgba(34,211,238,.018);pointer-events:none}
        .home-concierge-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(460px,1fr);gap:clamp(70px,10vw,150px);align-items:center}
        .home-concierge-copy h2{margin:18px 0 22px;color:#fff;font-size:clamp(42px,5.1vw,68px);font-weight:830;letter-spacing:-.052em;line-height:.98}
        .home-concierge-copy>p{margin:0 0 31px;color:${c.stone};font-size:17px;line-height:1.72;max-width:590px}
        .home-promise-panel{position:relative;padding:19px 34px 12px;border:1px solid rgba(127,166,232,.18);border-radius:28px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(9,24,43,.72));box-shadow:0 36px 100px -58px rgba(0,0,0,.9);backdrop-filter:blur(18px)}
        .home-promise-label{display:block;padding:5px 0 12px;color:${c.gold};font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
        .home-promise-row{display:grid;grid-template-columns:50px 1fr;gap:18px;align-items:start;padding:24px 0;border-top:1px solid rgba(127,166,232,.14)}
        .home-promise-icon{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;color:${c.teal};background:rgba(34,211,238,.09);border:1px solid rgba(34,211,238,.2)}
        .home-promise-row h3{margin:1px 0 6px;color:#fff;font-size:18px;letter-spacing:-.02em}.home-promise-row p{margin:0;color:${c.stone};font-size:13.5px;line-height:1.58}

        .home-closing{position:relative;min-height:570px;display:grid;place-items:center;overflow:hidden;background-image:var(--home-close-image);background-size:cover;background-position:center 56%;isolation:isolate}
        .home-closing:before{content:"";position:absolute;inset:0;z-index:-1;background:inherit;background-size:cover;background-position:center 56%;transform:scale(1.02)}
        .home-closing-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,16,31,.93) 0%,rgba(5,16,31,.75) 46%,rgba(5,16,31,.2) 100%),linear-gradient(0deg,rgba(5,16,31,.5),transparent 45%)}
        .home-closing-content{position:relative;z-index:1;width:min(1240px,calc(100% - 48px));margin:0 auto;padding:92px 0}
        .home-closing-content h2{margin:16px 0 18px;color:#fff;font-size:clamp(48px,6vw,80px);font-weight:830;letter-spacing:-.055em;line-height:.94;max-width:820px}
        .home-closing-content p{margin:0 0 30px;color:rgba(239,245,255,.8);font-size:18px;line-height:1.65;max-width:560px}

        @media(max-width:900px){
          .home-showcase{padding:82px 0 86px}.home-showcase-head{grid-template-columns:1fr;gap:26px;margin-bottom:38px}.home-showcase-intro{max-width:600px}
          .home-image-stage{grid-template-columns:1.2fr .8fr;grid-template-rows:repeat(2,210px)}
          .home-concierge{padding:88px 0}.home-concierge-grid{grid-template-columns:1fr;gap:52px}.home-promise-panel{max-width:680px}
        }
        @media(max-width:620px){
          .home-shell,.home-closing-content{width:calc(100% - 36px)}
          .home-showcase{padding:64px 0 72px}.home-showcase h2{font-size:clamp(43px,13vw,58px);line-height:.94}.home-showcase-head{margin-bottom:30px}.home-showcase-intro p{font-size:15px;line-height:1.6}.home-text-link{margin-top:18px}
          .home-image-stage{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:320px 148px;gap:9px;margin-inline:-18px}
          .home-image-stage>div:nth-child(1){grid-column:1 / 3;grid-row:1}.home-image-stage>div:nth-child(2){grid-column:1;grid-row:2}.home-image-stage>div:nth-child(3){grid-column:2;grid-row:2}.home-image-card{border-radius:0;border-left:0;border-right:0}.home-image-stage>div:nth-child(2) .home-image-card{border-radius:0 14px 14px 0}.home-image-stage>div:nth-child(3) .home-image-card{border-radius:14px 0 0 14px}
          .home-image-copy{left:18px;right:16px;bottom:18px}.home-image-copy strong{font-size:23px}.home-image-copy i{width:38px;height:38px}.home-image-card-2 .home-image-copy,.home-image-card-3 .home-image-copy{left:12px;right:10px;bottom:11px}.home-image-card-2 .home-image-copy small,.home-image-card-3 .home-image-copy small{display:none}.home-image-card-2 .home-image-copy strong,.home-image-card-3 .home-image-copy strong{font-size:12.5px}.home-image-card-2 .home-image-copy i,.home-image-card-3 .home-image-copy i{display:none}
          .home-concierge{padding:74px 0}.home-concierge-grid{gap:38px}.home-concierge-copy h2{font-size:clamp(36px,10.7vw,46px);line-height:1}.home-concierge-copy>p{font-size:15px;line-height:1.62;margin-bottom:26px}.home-concierge-copy .tico-button{width:100%}
          .home-promise-panel{margin:0 -4px;padding:16px 20px 8px;border-radius:22px}.home-promise-row{grid-template-columns:42px 1fr;gap:13px;padding:19px 0}.home-promise-icon{width:40px;height:40px;border-radius:13px}.home-promise-row h3{font-size:16px}.home-promise-row p{font-size:12.5px;line-height:1.5}
          .home-closing{min-height:500px;background-position:66% center}.home-closing:before{background-position:66% center}.home-closing-wash{background:linear-gradient(90deg,rgba(5,16,31,.94),rgba(5,16,31,.66)),linear-gradient(0deg,rgba(5,16,31,.55),transparent)}.home-closing-content{padding:74px 0}.home-closing-content h2{font-size:clamp(42px,12vw,54px);line-height:.98}.home-closing-content p{font-size:15.5px}.home-closing-content .tico-button{width:100%}
        }
      `}</style>
    </>
  );
}
