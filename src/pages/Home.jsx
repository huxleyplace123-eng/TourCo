import React from "react";
import { ArrowRight, Check, MapPin, ShieldCheck, Users } from "lucide-react";
import { c } from "../theme.js";
import { Button } from "../components/ui.jsx";
import { Reveal } from "../motion.jsx";
import { CinematicHero } from "../components/CinematicHero.jsx";
import { activityImage, cdnImage, themedSlides } from "../images.js";
import { activities, regions } from "../data.js";
import { BLOG_POSTS } from "../blog-data.js";
import { activityPath, blogPath } from "../routing.js";

const ACTION_IDS = ["a7", "a10", "a6", "a9"];
const ACTION_COPY = {
  a7: { kicker: "Manuel Antonio", title: "Zip lining" },
  a10: { kicker: "Quepos", title: "White-water rafting" },
  a6: { kicker: "Tamarindo", title: "Surfing" },
  a9: { kicker: "Uvita", title: "Whale watching" },
};
const ACTIONS = ACTION_IDS.map((id) => activities.find((activity) => activity.id === id)).filter(Boolean);
const REGION_NAMES = ["Manuel Antonio", "Guanacaste", "Uvita", "Dominical"];
const FEATURED_REGIONS = REGION_NAMES.map((name) => regions.find((region) => region.name === name)).filter(Boolean);
const HOME_REGION_IMAGE = themedSlides("home", 1800)[6];
const HOME_CLOSE_IMAGE = themedSlides("home", 1800)[8];
const FAMILY_ACTIVITY = activities.find((activity) => activity.id === "a2");
const HOME_ARTICLES = BLOG_POSTS.slice(0, 3);

const PROMISES = [
  { icon: MapPin, title: "Route planning", body: "Activities are organized around your destinations and travel time." },
  { icon: ShieldCheck, title: "Confirmed details", body: "We confirm availability, timing, operator and final price." },
  { icon: Check, title: "Trip summary", body: "Your activities, pricing and next steps stay in one place." },
];

export function Home({ go, viewActivity, viewBlogPost, browseActivities }) {
  return (
    <>
      <CinematicHero go={go} onSearch={browseActivities} />

      <section className="home-action" aria-labelledby="home-action-title">
        <div className="home-shell home-action-head">
          <span className="home-kicker">Activities and tours</span>
          <h2 id="home-action-title">Popular Costa Rica<br /><em>activities.</em></h2>
          <p>Browse zip lining, rafting, surfing and wildlife tours.</p>
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

      <section className="home-family" aria-labelledby="home-family-title">
        <div className="home-shell">
          <div className="home-family-card">
            <div className="home-family-photo">
              <img src={activityImage(FAMILY_ACTIVITY, 1400)} alt="Fishing boat set for a guided Costa Rica coastal excursion" loading="lazy" decoding="async" />
              <span className="home-family-photo-wash" />
              <span className="home-family-photo-note"><Users size={16} /> Family travel</span>
            </div>
            <div className="home-family-copy">
              <span className="home-kicker">Traveling together</span>
              <h2 id="home-family-title">Traveling with kids?</h2>
              <p>Start with easier-paced wildlife, water and beginner activities, then check age and operator requirements before you choose.</p>
              <div className="home-family-details" aria-label="Family activity planning highlights">
                <span>Easy-paced picks</span>
                <span>Age guidance</span>
                <span>Family planning notes</span>
              </div>
              <a
                className="home-family-link"
                href="/kid-friendly-costa-rica-activities"
                onClick={(event) => {
                  event.preventDefault();
                  go("kids");
                }}
              >
                Explore kid-friendly activities <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="home-regions" style={{ "--home-region-image": `url(${HOME_REGION_IMAGE.src})` }}>
        <div className="home-regions-wash" />
        <div className="home-shell home-regions-content">
          <Reveal>
            <span className="home-kicker">Costa Rica regions</span>
            <h2>Explore activities<br /><em>by region.</em></h2>
            <p>See activities in Manuel Antonio, Guanacaste, Uvita and Dominical, along with route information.</p>
          </Reveal>
        </div>
        <div className="home-region-dock" aria-label="Explore Costa Rica regions">
          {FEATURED_REGIONS.map((region) => (
            <button key={region.name} onClick={() => go("map")}>
              <div><strong>{region.name}</strong><small>{region.tag}</small></div><ArrowRight size={15} />
            </button>
          ))}
        </div>
      </section>

      <section className="home-concierge">
        <div className="home-shell home-concierge-grid">
          <Reveal>
            <div className="home-concierge-copy">
              <span className="home-kicker">Trip planning</span>
              <h2>Plan your Costa Rica<br /><span>activities.</span></h2>
              <p>Choose activities and dates. We organize the schedule and confirm availability, timing, operator and final price.</p>
            </div>
          </Reveal>

          <div className="home-promise-panel">
            <span className="home-promise-label">What TicoWild helps with</span>
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

      <section className="home-journal" aria-labelledby="home-journal-title">
        <div className="home-shell">
          <div className="home-journal-head">
            <div>
              <span className="home-kicker">TicoWild field guide</span>
              <h2 id="home-journal-title">Know more before<br /><em>you choose.</em></h2>
            </div>
            <div>
              <p>Practical Costa Rica planning notes for routes, families, regions and the questions worth asking before you book.</p>
              <a href="/blog" onClick={(event) => { event.preventDefault(); go("blog"); }}>Explore the blog <ArrowRight size={16} /></a>
            </div>
          </div>

          <div className="home-journal-grid">
            {HOME_ARTICLES.map((post, index) => {
              return (
                <a key={post.slug} className={`home-journal-card home-journal-card-${index + 1}`} href={blogPath(post)} onClick={(event) => { event.preventDefault(); viewBlogPost(post.slug); }}>
                  <img src={cdnImage(post.imageId, index === 0 ? 1400 : 900)} alt="" loading="lazy" decoding="async" />
                  <span className="home-journal-shade" />
                  <span className="home-journal-copy"><small>{post.category} · {post.readTime}</small><strong>{post.title}</strong><span>Read guide <ArrowRight size={15} /></span></span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-closing" style={{ "--home-close-image": `url(${HOME_CLOSE_IMAGE.src})` }}>
        <div className="home-closing-wash" />
        <div className="home-closing-content">
          <Reveal>
            <span className="home-kicker">Plan your trip</span>
            <h2>Start planning your<br />Costa Rica trip.</h2>
            <p>Enter your dates, destinations, group size and preferred activities.</p>
            <Button variant="primary" size="lg" onClick={() => go("build")}>Plan my trip <ArrowRight size={18} /></Button>
          </Reveal>
        </div>
      </section>

      <style>{`
        .home-shell{width:min(1240px,calc(100% - 48px));margin:0 auto}
        .home-kicker{display:inline-flex;align-items:center;gap:9px;color:${c.teal};font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
        .home-kicker:before{content:"";width:30px;height:5px;border-top:1px solid ${c.teal};border-bottom:1px solid rgba(34,211,238,.38);box-shadow:0 5px 18px -8px rgba(34,211,238,.8)}
        .home-regions{position:relative;min-height:620px;display:flex;align-items:center;overflow:hidden;background-image:var(--home-region-image);background-size:cover;background-position:center;isolation:isolate}
        .home-regions:before{content:"";position:absolute;inset:0;z-index:-1;background:inherit;background-size:cover;background-position:center;transform:scale(1.025)}
        .home-regions-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,15,30,.94) 0%,rgba(5,15,30,.68) 47%,rgba(5,15,30,.14) 100%),linear-gradient(0deg,rgba(5,15,30,.8) 0%,transparent 44%)}
        .home-regions-content{position:relative;z-index:2;padding-bottom:104px}.home-regions-content h2{margin:15px 0 17px;color:#fff;font-size:clamp(44px,5.1vw,70px);font-weight:830;letter-spacing:-.052em;line-height:.95;max-width:760px}.home-regions-content h2 em{font:inherit;color:${c.gold};font-style:normal}.home-regions-content p{max-width:540px;margin:0;color:rgba(239,245,255,.8);font-size:15.5px;line-height:1.68}
        .home-region-dock{position:absolute;z-index:3;left:50%;bottom:26px;transform:translateX(-50%);display:grid;grid-template-columns:repeat(4,1fr);width:min(1320px,calc(100% - 48px));padding:10px;border:1px solid rgba(255,255,255,.17);border-radius:22px;background:rgba(5,15,30,.76);backdrop-filter:blur(18px);box-shadow:0 28px 70px -34px rgba(0,0,0,.9)}
        .home-region-dock button{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:15px 16px;border:0;border-right:1px solid rgba(127,166,232,.16);background:transparent;color:#fff;text-align:left;cursor:pointer}.home-region-dock button:last-child{border-right:0}.home-region-dock button div{display:grid;gap:2px}.home-region-dock strong{font-size:13px}.home-region-dock small{color:${c.stone};font-size:10px}.home-region-dock svg{color:rgba(255,255,255,.55);transition:transform .2s ease}.home-region-dock button:hover svg{transform:translateX(4px);color:${c.gold}}

        .home-action{padding:92px 0 102px;background:#050f1f;overflow:hidden}.home-action-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.46fr);column-gap:64px;align-items:end;margin-bottom:34px}.home-action-head>.home-kicker{grid-column:1 / -1;margin-bottom:14px}.home-action-head h2{margin:0;color:#fff;font-size:clamp(40px,4.75vw,63px);font-weight:830;letter-spacing:-.05em;line-height:.96}.home-action-head h2 em{color:${c.gold};font:inherit;font-style:normal}.home-action-head p{margin:0 0 4px;color:${c.stone};font-size:15px;line-height:1.65;max-width:400px}.home-action-grid{width:min(1240px,calc(100% - 48px));height:552px;margin:0 auto;display:grid;grid-template-columns:1.18fr .78fr .78fr;grid-template-rows:1fr 1fr;gap:11px}.home-action-scene{position:relative;display:block;min-width:0;overflow:hidden;border-radius:22px;border:1px solid rgba(255,255,255,.13);background:#0b1a2e;box-shadow:0 35px 90px -54px rgba(0,0,0,.95)}.home-action-scene-1{grid-row:1 / 3}.home-action-scene-2{grid-column:2 / 4}.home-action-scene img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(1.16) contrast(1.03);transition:transform 1.1s cubic-bezier(.2,.7,.2,1),filter .35s ease}.home-action-scene:hover img{transform:scale(1.045);filter:saturate(1.3) contrast(1.04)}.home-action-shade{position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(3,12,25,.88) 100%),linear-gradient(110deg,rgba(3,12,25,.2),transparent 56%)}.home-action-copy{position:absolute;z-index:2;left:24px;right:22px;bottom:22px;display:grid;gap:5px;color:#fff}.home-action-copy small{color:${c.teal};font-size:9.5px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.home-action-copy strong{font-size:clamp(22px,2.25vw,33px);line-height:1;letter-spacing:-.038em}.home-action-copy>span{display:flex;align-items:center;gap:7px;color:rgba(255,255,255,.78);font-size:11.5px;font-weight:750}.home-action-copy svg{color:${c.gold};transition:transform .2s ease}.home-action-scene:hover .home-action-copy svg{transform:translateX(4px)}

        .home-family{padding:70px 0;background:${c.sand};overflow:hidden}.home-family-card{position:relative;display:grid;grid-template-columns:minmax(340px,.84fr) minmax(0,1.16fr);min-height:390px;overflow:hidden;border:1px solid rgba(127,166,232,.18);border-radius:28px;background:linear-gradient(145deg,#0d213b,#071528);box-shadow:0 34px 90px -58px rgba(3,12,25,.78)}.home-family-card:after{content:"";position:absolute;right:-120px;bottom:-170px;width:380px;height:380px;border-radius:50%;border:1px solid rgba(34,211,238,.13);box-shadow:0 0 0 70px rgba(34,211,238,.024),0 0 0 140px rgba(34,211,238,.015);pointer-events:none}.home-family-photo{position:relative;min-height:390px;overflow:hidden}.home-family-photo img{width:100%;height:100%;display:block;object-fit:cover;object-position:center;filter:saturate(1.06) contrast(1.03);transition:transform .7s cubic-bezier(.2,.7,.2,1)}.home-family-card:hover .home-family-photo img{transform:scale(1.025)}.home-family-photo-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,12,25,.06) 48%,rgba(7,21,40,.82) 100%),linear-gradient(0deg,rgba(3,12,25,.72),transparent 48%)}.home-family-photo-note{position:absolute;left:22px;bottom:21px;display:inline-flex;align-items:center;gap:8px;padding:8px 11px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(5,15,30,.72);backdrop-filter:blur(12px);color:#fff;font-size:11px;font-weight:800}.home-family-photo-note svg{color:${c.gold}}.home-family-copy{position:relative;z-index:1;display:flex;flex-direction:column;justify-content:center;padding:clamp(42px,5vw,72px)}.home-family-copy h2{margin:15px 0;color:#fff;font-size:clamp(36px,4vw,54px);font-weight:830;letter-spacing:-.05em;line-height:.98}.home-family-copy>p{max-width:620px;margin:0;color:${c.stone};font-size:15px;line-height:1.67}.home-family-details{display:flex;flex-wrap:wrap;gap:8px;margin:23px 0 25px}.home-family-details span{display:inline-flex;align-items:center;min-height:31px;padding:0 11px;border:1px solid rgba(34,211,238,.18);border-radius:999px;background:rgba(34,211,238,.055);color:rgba(239,245,255,.8);font-size:10.5px;font-weight:750}.home-family-link{align-self:flex-start;display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:48px;padding:0 18px;border:1px solid rgba(255,208,0,.52);border-radius:14px;background:${c.gold};color:${c.ink};font-size:12.5px;font-weight:900;text-decoration:none;box-shadow:0 15px 34px -20px rgba(255,208,0,.78);transition:transform .2s ease,box-shadow .2s ease}.home-family-link:hover{transform:translateY(-2px);box-shadow:0 19px 38px -19px rgba(255,208,0,.9)}.home-family-link svg{transition:transform .2s ease}.home-family-link:hover svg{transform:translateX(3px)}

        .home-concierge{position:relative;padding:92px 0;background:${c.sand};overflow:hidden;border-bottom:1px solid rgba(127,166,232,.12)}
        .home-concierge:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 10% 50%,rgba(34,211,238,.07),transparent 31%),radial-gradient(circle at 92% 28%,rgba(255,208,0,.055),transparent 25%);pointer-events:none}
        .home-concierge:after{content:"";position:absolute;width:520px;height:520px;right:-330px;bottom:-360px;border-radius:50%;border:1px solid rgba(34,211,238,.15);box-shadow:0 0 0 90px rgba(34,211,238,.022),0 0 0 180px rgba(34,211,238,.014);pointer-events:none}
        .home-concierge-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,.78fr) minmax(460px,1.22fr);gap:clamp(46px,6vw,82px);align-items:center}.home-concierge-copy{max-width:520px;text-align:left}.home-concierge-copy h2{margin:16px 0 18px;color:#fff;font-size:clamp(38px,3.85vw,52px);font-weight:830;letter-spacing:-.048em;line-height:.98}.home-concierge-copy h2 span{color:${c.gold}}.home-concierge-copy>p{margin:0;color:${c.stone};font-size:15px;line-height:1.66;max-width:490px}
        .home-promise-panel{position:relative;padding:14px 32px 8px;border:1px solid rgba(127,166,232,.2);border-radius:28px;background:linear-gradient(145deg,rgba(255,255,255,.065),rgba(9,24,43,.84));box-shadow:0 32px 90px -52px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.04);backdrop-filter:blur(18px);overflow:hidden}.home-promise-panel:before{content:"";position:absolute;left:0;top:30px;bottom:30px;width:2px;background:linear-gradient(180deg,${c.gold},${c.teal});box-shadow:0 0 20px rgba(34,211,238,.28)}.home-promise-label{display:block;padding:7px 0 13px;color:${c.gold};font-size:10px;font-weight:900;letter-spacing:.15em;text-transform:uppercase}.home-promise-row{display:grid;grid-template-columns:48px 1fr;gap:17px;align-items:start;padding:22px 0;border-top:1px solid rgba(127,166,232,.14)}.home-promise-icon{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;color:${c.teal};background:linear-gradient(145deg,rgba(34,211,238,.13),rgba(34,211,238,.055));border:1px solid rgba(34,211,238,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}.home-promise-row h3{margin:0 0 5px;color:#fff;font-size:17px;letter-spacing:-.018em}.home-promise-row p{margin:0;color:${c.stone};font-size:13.5px;line-height:1.55}

        .home-journal{padding:94px 0 104px;background:#050f1f;overflow:hidden}.home-journal-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.55fr);gap:60px;align-items:end;margin-bottom:34px}.home-journal-head h2{margin:15px 0 0;color:#fff;font-size:clamp(39px,4.7vw,62px);font-weight:830;letter-spacing:-.052em;line-height:.96}.home-journal-head h2 em{color:${c.gold};font:inherit;font-style:normal}.home-journal-head>div:last-child{padding-bottom:4px}.home-journal-head p{margin:0;color:${c.stone};font-size:14.5px;line-height:1.65}.home-journal-head a{display:inline-flex;align-items:center;gap:8px;margin-top:17px;color:${c.teal};font-size:12.5px;font-weight:900;text-decoration:none}.home-journal-head a svg{transition:transform .2s ease}.home-journal-head a:hover svg{transform:translateX(4px)}.home-journal-grid{display:grid;grid-template-columns:1.16fr .84fr;grid-template-rows:repeat(2,226px);gap:12px}.home-journal-card{position:relative;display:block;overflow:hidden;border:1px solid rgba(255,255,255,.13);border-radius:22px;background:${c.canvas2};color:#fff;text-decoration:none}.home-journal-card-1{grid-row:1/3}.home-journal-card img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .85s cubic-bezier(.2,.7,.2,1),filter .3s ease}.home-journal-card:hover img{transform:scale(1.035);filter:saturate(1.12)}.home-journal-shade{position:absolute;inset:0;background:linear-gradient(0deg,rgba(3,12,25,.94),rgba(3,12,25,.08) 72%)}.home-journal-copy{position:absolute;left:25px;right:24px;bottom:23px;display:flex;flex-direction:column;align-items:flex-start}.home-journal-copy small{color:${c.gold};font-size:9.5px;font-weight:900;letter-spacing:.07em;text-transform:uppercase}.home-journal-copy strong{max-width:590px;margin-top:8px;font-size:clamp(20px,2.4vw,33px);line-height:1.08;letter-spacing:-.035em}.home-journal-card:not(.home-journal-card-1) .home-journal-copy strong{font-size:20px}.home-journal-copy>span{display:inline-flex;align-items:center;gap:7px;margin-top:13px;color:${c.teal};font-size:11px;font-weight:850}.home-journal-copy>span svg{transition:transform .2s ease}.home-journal-card:hover .home-journal-copy>span svg{transform:translateX(4px)}

        .home-closing{position:relative;min-height:460px;display:grid;place-items:center;overflow:hidden;background-image:var(--home-close-image);background-size:cover;background-position:center 56%;isolation:isolate}.home-closing:before{content:"";position:absolute;inset:0;z-index:-1;background:inherit;background-size:cover;background-position:center 56%;transform:scale(1.02)}.home-closing-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,16,31,.88) 0%,rgba(5,16,31,.58) 50%,rgba(5,16,31,.36) 100%),linear-gradient(0deg,rgba(5,16,31,.5),transparent 45%)}.home-closing-content{position:relative;z-index:1;width:min(1240px,calc(100% - 48px));margin:0 auto;padding:70px 0;text-align:center}.home-closing-content .home-kicker{justify-content:center}.home-closing-content h2{margin:14px auto 16px;color:#fff;font-size:clamp(40px,4.8vw,64px);font-weight:830;letter-spacing:-.05em;line-height:.96;max-width:720px}.home-closing-content p{margin:0 auto 25px;color:rgba(239,245,255,.8);font-size:16px;line-height:1.62;max-width:530px}

        @media(max-width:1050px){.home-concierge-grid{grid-template-columns:1fr;gap:46px}.home-concierge-copy{max-width:680px}.home-promise-panel{max-width:760px}}
        @media(max-width:760px){
          .home-shell,.home-closing-content{width:calc(100% - 36px)}
          .home-regions{min-height:730px;align-items:flex-start;background-position:60% center}.home-regions:before{background-position:60% center}.home-regions-wash{background:linear-gradient(180deg,rgba(5,15,30,.88) 0%,rgba(5,15,30,.55) 52%,rgba(5,15,30,.94) 100%)}.home-regions-content{padding-top:72px;padding-bottom:190px}.home-regions-content h2{font-size:clamp(44px,12.8vw,60px);line-height:.95}.home-regions-content p{font-size:15px;line-height:1.62}.home-region-dock{left:0;right:0;bottom:18px;transform:none;width:100%;display:flex;overflow-x:auto;border-left:0;border-right:0;border-radius:0;padding:9px 18px;scroll-snap-type:x mandatory}.home-region-dock button{flex:0 0 225px;scroll-snap-align:start;border-right:1px solid rgba(127,166,232,.16)}
          .home-action{padding:76px 0 88px}.home-action-head{display:block;margin-bottom:28px}.home-action-head>.home-kicker{margin-bottom:13px}.home-action-head h2{font-size:clamp(42px,12vw,56px);line-height:.95}.home-action-head p{margin-top:18px;font-size:15px;line-height:1.6}.home-action-grid{width:100%;height:480px;display:flex;gap:11px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 18px 8px;scroll-padding-left:18px}.home-action-scene{flex:0 0 84vw;height:100%;border-radius:22px;scroll-snap-align:start}.home-action-copy{left:21px;right:18px;bottom:84px}.home-action-copy strong{font-size:38px}.home-action-copy small{font-size:9px}
          .home-family{padding:52px 0}.home-family-card{grid-template-columns:1fr;min-height:0;border-radius:22px}.home-family-photo{height:240px;min-height:240px}.home-family-photo img{position:absolute;inset:0}.home-family-photo-wash{background:linear-gradient(0deg,rgba(7,21,40,.83),transparent 58%)}.home-family-copy{padding:30px 22px 32px}.home-family-copy h2{font-size:clamp(34px,10.5vw,44px);margin:13px 0}.home-family-copy>p{font-size:14px;line-height:1.62}.home-family-details{margin:20px 0 22px;gap:6px}.home-family-details span{font-size:10px}.home-family-link{width:100%;min-height:50px;padding:0 14px}.home-family-card:after{display:none}
          .home-concierge{padding:76px 0}.home-concierge-grid{gap:32px}.home-concierge-copy h2{font-size:clamp(37px,10.8vw,47px);line-height:.98;margin:16px 0 17px}.home-concierge-copy>p{font-size:15px;line-height:1.62}.home-promise-panel{margin:0 -2px;padding:14px 19px 7px;border-radius:22px}.home-promise-panel:before{top:24px;bottom:24px}.home-promise-row{grid-template-columns:42px 1fr;gap:13px;padding:18px 0}.home-promise-icon{width:40px;height:40px;border-radius:13px}.home-promise-row h3{font-size:16px}.home-promise-row p{font-size:12.5px;line-height:1.5}
          .home-journal{padding:74px 0 82px}.home-journal-head{grid-template-columns:1fr;gap:22px;margin-bottom:26px}.home-journal-head h2{font-size:clamp(40px,11.8vw,52px)}.home-journal-head>div:last-child{padding:0}.home-journal-head p{font-size:14px}.home-journal-grid{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;margin-inline:-18px;padding:0 18px 8px}.home-journal-card,.home-journal-card-1{flex:0 0 84vw;height:385px;grid-row:auto;scroll-snap-align:start}.home-journal-card:not(.home-journal-card-1) .home-journal-copy strong,.home-journal-copy strong{font-size:27px}.home-journal-copy{left:21px;right:19px;bottom:21px}
          .home-closing{min-height:500px;background-position:66% center}.home-closing:before{background-position:66% center}.home-closing-wash{background:linear-gradient(90deg,rgba(5,16,31,.94),rgba(5,16,31,.66)),linear-gradient(0deg,rgba(5,16,31,.55),transparent)}.home-closing-content{padding:74px 0}.home-closing-content h2{font-size:clamp(42px,12vw,54px);line-height:.98}.home-closing-content p{font-size:15.5px}.home-closing-content .tico-button{width:100%}
        }
      `}</style>
    </>
  );
}
