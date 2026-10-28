import React from "react";
import { ArrowRight, Check, MapPin, ShieldCheck, Users } from "lucide-react";
import { c } from "../theme.js";
import { Button } from "../components/ui.jsx";
import { Reveal } from "../motion.jsx";
import { CinematicHero } from "../components/CinematicHero.jsx";
import { HomeFAQ } from "../components/HomeFAQ.jsx";
import { activityImage, cdnImage, themedSlides } from "../images.js";
import { activities, regions } from "../data.js";
import { BLOG_POSTS } from "../blog-data.js";
import { activityPath, blogPath } from "../routing.js";
import { track } from "../analytics.js";

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
const HOME_FAMILY_IMAGE = "/images/tico-wild-family-coast-v1.jpg";
const HOME_ARTICLES = BLOG_POSTS.slice(0, 3);

const PROMISES = [
  { icon: MapPin, step: "01", title: "Choose what fits", body: "Share your destinations, dates and the experiences that interest you." },
  { icon: ShieldCheck, step: "02", title: "We confirm the details", body: "TicoWild checks availability, timing, operator requirements and final price." },
  { icon: Check, step: "03", title: "You review one clear plan", body: "See the organized details before you decide or make any payment." },
];

export function Home({ go, viewActivity, viewBlogPost, browseActivities }) {
  return (
    <>
      <CinematicHero go={go} onSearch={browseActivities} />

      <section className="home-concierge" aria-labelledby="home-concierge-title">
        <div className="home-shell home-concierge-grid">
          <Reveal>
            <div className="home-concierge-copy">
              <span className="home-kicker">How TicoWild works</span>
              <h2 id="home-concierge-title">From trip idea to<br /><span>clear next step.</span></h2>
              <p>Explore first. When you are ready, TicoWild organizes the details and confirms what is current before payment.</p>
              <span className="home-concierge-assurance"><ShieldCheck size={16} /> No payment. No obligation. Details confirmed first.</span>
            </div>
          </Reveal>

          <div className="home-promise-panel" aria-label="Three-step TicoWild planning process">
            {PROMISES.map(({ icon: Icon, step, title, body }, index) => (
              <Reveal key={title} delay={index * 70}>
                <div className="home-promise-row">
                  <span className="home-promise-step">{step}</span>
                  <span className="home-promise-icon"><Icon size={19} /></span>
                  <div><h3>{title}</h3><p>{body}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

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
                track("home_activity_opened", { activity_id: activity.id, display_position: index + 1 });
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
              <img src={HOME_FAMILY_IMAGE} alt="Parents and two children walking together on a tropical Costa Rica beach" loading="lazy" decoding="async" />
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
                  track("home_family_opened");
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
            <button key={region.name} onClick={() => { track("home_region_opened", { region: region.name }); go("map"); }}>
              <div><strong>{region.name}</strong><small>{region.tag}</small></div><ArrowRight size={15} />
            </button>
          ))}
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
                <a key={post.slug} className={`home-journal-card home-journal-card-${index + 1}`} href={blogPath(post)} onClick={(event) => { event.preventDefault(); track("home_blog_opened", { slug: post.slug, display_position: index + 1 }); viewBlogPost(post.slug); }}>
                  <img src={cdnImage(post.imageId, index === 0 ? 1400 : 900)} alt="" loading="lazy" decoding="async" />
                  <span className="home-journal-shade" />
                  <span className="home-journal-copy"><small>{post.category} · {post.readTime}</small><strong>{post.title}</strong><span>Read guide <ArrowRight size={15} /></span></span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <HomeFAQ />

      <section className="home-closing" style={{ "--home-close-image": `url(${HOME_CLOSE_IMAGE.src})` }}>
        <div className="home-closing-wash" />
        <div className="home-closing-content">
          <Reveal>
            <span className="home-kicker">Plan your trip</span>
            <h2>Leave the guesswork.<br />Keep the adventure.</h2>
            <p>Tell us your route, dates and interests. Review one organized plan before any payment.</p>
            <Button variant="primary" size="lg" onClick={() => { track("home_plan_clicked", { placement: "closing" }); go("build"); }}>Plan my trip <ArrowRight size={18} /></Button>
            <small className="home-closing-note"><ShieldCheck size={14} /> No payment or obligation. Current details are confirmed first.</small>
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

        .home-family{padding:70px 0;background:${c.sand};overflow:hidden}.home-family-card{position:relative;display:grid;grid-template-columns:minmax(340px,.84fr) minmax(0,1.16fr);min-height:390px;overflow:hidden;border:1px solid rgba(127,166,232,.18);border-radius:28px;background:linear-gradient(145deg,#0d213b,#071528);box-shadow:0 34px 90px -58px rgba(3,12,25,.78)}.home-family-card:after{content:"";position:absolute;right:-120px;bottom:-170px;width:380px;height:380px;border-radius:50%;border:1px solid rgba(34,211,238,.13);box-shadow:0 0 0 70px rgba(34,211,238,.024),0 0 0 140px rgba(34,211,238,.015);pointer-events:none}.home-family-photo{position:relative;min-height:390px;overflow:hidden}.home-family-photo img{width:100%;height:100%;display:block;object-fit:cover;object-position:43% center;filter:saturate(1.03) contrast(1.03);transition:transform .7s cubic-bezier(.2,.7,.2,1)}.home-family-card:hover .home-family-photo img{transform:scale(1.025)}.home-family-photo-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,12,25,.02) 48%,rgba(7,21,40,.75) 100%),linear-gradient(0deg,rgba(3,12,25,.58),transparent 48%)}.home-family-photo-note{position:absolute;left:22px;bottom:21px;display:inline-flex;align-items:center;gap:8px;padding:8px 11px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(5,15,30,.72);backdrop-filter:blur(12px);color:#fff;font-size:11px;font-weight:800}.home-family-photo-note svg{color:${c.gold}}.home-family-copy{position:relative;z-index:1;display:flex;flex-direction:column;justify-content:center;padding:clamp(42px,5vw,72px)}.home-family-copy h2{margin:15px 0;color:#fff;font-size:clamp(36px,4vw,54px);font-weight:830;letter-spacing:-.05em;line-height:.98}.home-family-copy>p{max-width:620px;margin:0;color:${c.stone};font-size:15px;line-height:1.67}.home-family-details{display:flex;flex-wrap:wrap;gap:8px;margin:23px 0 25px}.home-family-details span{display:inline-flex;align-items:center;min-height:31px;padding:0 11px;border:1px solid rgba(34,211,238,.18);border-radius:999px;background:rgba(34,211,238,.055);color:rgba(239,245,255,.8);font-size:10.5px;font-weight:750}.home-family-link{align-self:flex-start;display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:48px;padding:0 18px;border:1px solid rgba(255,208,0,.52);border-radius:14px;background:${c.gold};color:${c.ink};font-size:12.5px;font-weight:900;text-decoration:none;box-shadow:0 15px 34px -20px rgba(255,208,0,.78);transition:transform .2s ease,box-shadow .2s ease}.home-family-link:hover{transform:translateY(-2px);box-shadow:0 19px 38px -19px rgba(255,208,0,.9)}.home-family-link svg{transition:transform .2s ease}.home-family-link:hover svg{transform:translateX(3px)}

        .home-concierge{position:relative;padding:58px 0 62px;background:linear-gradient(180deg,#0b1a2e,#08172a);overflow:hidden;border-bottom:1px solid rgba(127,166,232,.12)}
        .home-concierge:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 10% 50%,rgba(34,211,238,.07),transparent 31%),radial-gradient(circle at 92% 28%,rgba(255,208,0,.055),transparent 25%);pointer-events:none}
        .home-concierge:after{content:"";position:absolute;width:520px;height:520px;right:-330px;bottom:-360px;border-radius:50%;border:1px solid rgba(34,211,238,.15);box-shadow:0 0 0 90px rgba(34,211,238,.022),0 0 0 180px rgba(34,211,238,.014);pointer-events:none}
        .home-concierge-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(280px,.66fr) minmax(0,1.34fr);gap:clamp(34px,5vw,66px);align-items:center}.home-concierge-copy{max-width:460px;text-align:left}.home-concierge-copy h2{margin:14px 0 15px;color:#fff;font-size:clamp(34px,3.4vw,48px);font-weight:830;letter-spacing:-.048em;line-height:.98}.home-concierge-copy h2 span{color:${c.gold}}.home-concierge-copy>p{margin:0;color:${c.stone};font-size:14px;line-height:1.64;max-width:450px}.home-concierge-assurance{display:inline-flex;align-items:center;gap:8px;margin-top:19px;color:rgba(255,255,255,.84);font-size:11.5px;font-weight:800}.home-concierge-assurance svg{color:${c.teal};flex:0 0 auto}
        .home-promise-panel{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));padding:10px;border:1px solid rgba(127,166,232,.2);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.068),rgba(9,24,43,.84));box-shadow:0 32px 90px -52px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.04);backdrop-filter:blur(18px);overflow:hidden}.home-promise-row{position:relative;height:100%;display:grid;grid-template-columns:40px 1fr;gap:12px;align-content:start;padding:18px 17px 17px}.home-promise-panel>div:not(:first-child) .home-promise-row{border-left:1px solid rgba(127,166,232,.16)}.home-promise-step{position:absolute;right:15px;top:13px;color:rgba(127,166,232,.42);font-size:10px;font-weight:900;letter-spacing:.1em}.home-promise-icon{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;color:${c.teal};background:linear-gradient(145deg,rgba(34,211,238,.13),rgba(34,211,238,.055));border:1px solid rgba(34,211,238,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}.home-promise-row h3{margin:2px 20px 5px 0;color:#fff;font-size:14.5px;letter-spacing:-.018em}.home-promise-row p{grid-column:1 / -1;margin:6px 0 0;color:${c.stone};font-size:12px;line-height:1.52}

        .home-journal{padding:94px 0 104px;background:#050f1f;overflow:hidden}.home-journal-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.55fr);gap:60px;align-items:end;margin-bottom:34px}.home-journal-head h2{margin:15px 0 0;color:#fff;font-size:clamp(39px,4.7vw,62px);font-weight:830;letter-spacing:-.052em;line-height:.96}.home-journal-head h2 em{color:${c.gold};font:inherit;font-style:normal}.home-journal-head>div:last-child{padding-bottom:4px}.home-journal-head p{margin:0;color:${c.stone};font-size:14.5px;line-height:1.65}.home-journal-head a{display:inline-flex;align-items:center;gap:8px;margin-top:17px;color:${c.teal};font-size:12.5px;font-weight:900;text-decoration:none}.home-journal-head a svg{transition:transform .2s ease}.home-journal-head a:hover svg{transform:translateX(4px)}.home-journal-grid{display:grid;grid-template-columns:1.16fr .84fr;grid-template-rows:repeat(2,226px);gap:12px}.home-journal-card{position:relative;display:block;overflow:hidden;border:1px solid rgba(255,255,255,.13);border-radius:22px;background:${c.canvas2};color:#fff;text-decoration:none}.home-journal-card-1{grid-row:1/3}.home-journal-card img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .85s cubic-bezier(.2,.7,.2,1),filter .3s ease}.home-journal-card:hover img{transform:scale(1.035);filter:saturate(1.12)}.home-journal-shade{position:absolute;inset:0;background:linear-gradient(0deg,rgba(3,12,25,.94),rgba(3,12,25,.08) 72%)}.home-journal-copy{position:absolute;left:25px;right:24px;bottom:23px;display:flex;flex-direction:column;align-items:flex-start}.home-journal-copy small{color:${c.gold};font-size:9.5px;font-weight:900;letter-spacing:.07em;text-transform:uppercase}.home-journal-copy strong{max-width:590px;margin-top:8px;font-size:clamp(20px,2.4vw,33px);line-height:1.08;letter-spacing:-.035em}.home-journal-card:not(.home-journal-card-1) .home-journal-copy strong{font-size:20px}.home-journal-copy>span{display:inline-flex;align-items:center;gap:7px;margin-top:13px;color:${c.teal};font-size:11px;font-weight:850}.home-journal-copy>span svg{transition:transform .2s ease}.home-journal-card:hover .home-journal-copy>span svg{transform:translateX(4px)}

        .home-closing{position:relative;min-height:400px;display:grid;place-items:center;overflow:hidden;background-image:var(--home-close-image);background-size:cover;background-position:center 56%;isolation:isolate}.home-closing:before{content:"";position:absolute;inset:0;z-index:-1;background:inherit;background-size:cover;background-position:center 56%;transform:scale(1.02)}.home-closing-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,16,31,.91) 0%,rgba(5,16,31,.62) 50%,rgba(5,16,31,.4) 100%),linear-gradient(0deg,rgba(5,16,31,.55),transparent 45%)}.home-closing-content{position:relative;z-index:1;width:min(1240px,calc(100% - 48px));margin:0 auto;padding:62px 0;text-align:center}.home-closing-content .home-kicker{justify-content:center}.home-closing-content h2{margin:14px auto 16px;color:#fff;font-size:clamp(38px,4.5vw,58px);font-weight:830;letter-spacing:-.05em;line-height:.96;max-width:760px}.home-closing-content p{margin:0 auto 23px;color:rgba(239,245,255,.82);font-size:15.5px;line-height:1.62;max-width:590px}.home-closing-note{display:flex;align-items:center;justify-content:center;gap:7px;margin:14px auto 0;color:rgba(239,245,255,.7);font-size:11px;font-weight:750}.home-closing-note svg{color:${c.teal}}

        .home-action{padding:52px 0 60px}.home-action-grid{height:360px}.home-family{padding:44px 0}.home-family-card{height:360px;min-height:360px}.home-family-photo{height:360px;min-height:360px}.home-family-photo img{position:absolute;inset:0}.home-family-copy{padding:38px}.home-family-copy h2{font-size:clamp(34px,3.2vw,44px);margin:12px 0}.home-family-details{margin:18px 0 20px}.home-regions{min-height:460px}.home-regions-content{padding-bottom:82px}.home-journal{padding:52px 0 60px}.home-journal-grid{grid-template-rows:repeat(2,160px)}.home-closing{min-height:330px}.home-closing-content{padding:48px 0}
        @media(max-width:1050px){.home-concierge-grid{grid-template-columns:1fr;gap:34px}.home-concierge-copy{max-width:680px}.home-promise-panel{max-width:none}}
        @media(max-width:760px){
          .home-shell,.home-closing-content{width:calc(100% - 36px)}
          .home-concierge{padding:48px 0 50px}.home-concierge-grid{gap:27px}.home-concierge-copy h2{font-size:clamp(35px,10.6vw,45px);line-height:.98;margin:14px 0 15px}.home-concierge-copy>p{font-size:14px;line-height:1.6}.home-concierge-assurance{align-items:flex-start;font-size:10.5px;line-height:1.45}.home-promise-panel{grid-template-columns:1fr;margin:0;padding:7px 16px;border-radius:20px}.home-promise-panel>div:not(:first-child) .home-promise-row{border-left:0;border-top:1px solid rgba(127,166,232,.16)}.home-promise-row{grid-template-columns:38px 1fr;gap:12px;padding:16px 0}.home-promise-icon{width:36px;height:36px}.home-promise-step{right:2px;top:13px}.home-promise-row h3{font-size:14.5px}.home-promise-row p{grid-column:2;margin-top:-3px;font-size:11.5px}
          .home-action{padding:44px 0 50px}.home-action-head{display:block;margin-bottom:22px}.home-action-head>.home-kicker{margin-bottom:12px}.home-action-head h2{font-size:clamp(36px,10.8vw,48px);line-height:.96}.home-action-head p{margin-top:14px;font-size:14px;line-height:1.58}.home-action-grid{width:calc(100% - 36px);height:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:none;gap:9px;overflow:visible;padding:0}.home-action-scene,.home-action-scene-1,.home-action-scene-2{grid-column:auto;grid-row:auto;height:160px;border-radius:17px}.home-action-copy{left:14px;right:12px;bottom:13px}.home-action-copy strong{font-size:20px}.home-action-copy small{font-size:8px}.home-action-copy>span{font-size:9px}
          .home-family{padding:34px 0}.home-family-card{grid-template-columns:1fr;height:auto;min-height:0;border-radius:22px}.home-family-photo{height:175px;min-height:175px}.home-family-photo img{position:absolute;inset:0;object-position:42% center}.home-family-photo-wash{background:linear-gradient(0deg,rgba(7,21,40,.76),transparent 58%)}.home-family-copy{padding:23px 20px 25px}.home-family-copy h2{font-size:clamp(32px,9.8vw,40px);margin:11px 0}.home-family-copy>p{font-size:14px;line-height:1.58}.home-family-details{margin:16px 0 18px;gap:6px}.home-family-details span{font-size:10px}.home-family-link{width:100%;min-height:50px;padding:0 14px}.home-family-card:after{display:none}
          .home-regions{min-height:490px;align-items:flex-start;background-position:60% center}.home-regions:before{background-position:60% center}.home-regions-wash{background:linear-gradient(180deg,rgba(5,15,30,.9) 0%,rgba(5,15,30,.52) 48%,rgba(5,15,30,.95) 100%)}.home-regions-content{padding-top:50px;padding-bottom:160px}.home-regions-content h2{font-size:clamp(37px,11vw,49px);line-height:.96}.home-regions-content p{font-size:14px;line-height:1.56}.home-region-dock{left:18px;right:18px;bottom:16px;transform:none;width:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));overflow:visible;border-radius:18px;padding:7px}.home-region-dock button{min-width:0;min-height:58px;padding:9px 10px;border-right:0;border-bottom:1px solid rgba(127,166,232,.14)}.home-region-dock button:nth-child(odd){border-right:1px solid rgba(127,166,232,.14)}.home-region-dock button:nth-last-child(-n+2){border-bottom:0}.home-region-dock strong{font-size:11.5px}.home-region-dock small{font-size:8.5px}
          .home-journal{padding:44px 0 50px}.home-journal-head{grid-template-columns:1fr;gap:18px;margin-bottom:21px}.home-journal-head h2{font-size:clamp(35px,10.4vw,44px)}.home-journal-head>div:last-child{padding:0}.home-journal-head p{font-size:13.5px}.home-journal-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:215px 140px;gap:9px;overflow:visible;margin:0;padding:0}.home-journal-card,.home-journal-card-1{height:auto;min-width:0;grid-row:auto;border-radius:17px}.home-journal-card-1{grid-column:1/-1}.home-journal-card:not(.home-journal-card-1) .home-journal-copy strong{font-size:15px}.home-journal-card-1 .home-journal-copy strong{font-size:23px}.home-journal-copy{left:14px;right:13px;bottom:13px}.home-journal-copy>span{margin-top:8px;font-size:9px}
          .home-closing{min-height:315px;background-position:66% center}.home-closing:before{background-position:66% center}.home-closing-wash{background:linear-gradient(90deg,rgba(5,16,31,.95),rgba(5,16,31,.68)),linear-gradient(0deg,rgba(5,16,31,.58),transparent)}.home-closing-content{padding:43px 0}.home-closing-content h2{font-size:clamp(35px,10.6vw,45px);line-height:.98}.home-closing-content p{font-size:14px}.home-closing-content .tico-button{width:100%}.home-closing-note{align-items:flex-start;font-size:10px;line-height:1.45}
        }
        @media(max-width:380px){.home-action-grid{grid-template-columns:1fr}.home-action-scene,.home-action-scene-1,.home-action-scene-2{height:165px}.home-journal-grid{grid-template-columns:1fr;grid-template-rows:none}.home-journal-card,.home-journal-card-1{grid-column:auto;height:175px}.home-journal-card-1{height:200px}}
      `}</style>
    </>
  );
}
