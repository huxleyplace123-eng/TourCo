import React, { useMemo, useState } from "react";
import { ArrowRight, Clock3, Map } from "lucide-react";
import { BLOG_POSTS } from "../blog-data.js";
import { cdnImage, themedSlides } from "../images.js";
import { blogPath } from "../routing.js";
import { c } from "../theme.js";
import { Button } from "../components/ui.jsx";
import { PageHero } from "../components/PageHero.jsx";

const articleImage = (post, width = 1000) => {
  return cdnImage(post.imageId, width);
};

function ArticleCard({ post, onOpen, featured = false }) {
  return (
    <a className={`blog-card${featured ? " blog-card-featured" : ""}`} href={blogPath(post)} onClick={(event) => { event.preventDefault(); onOpen(post.slug); }}>
      <span className="blog-card-media"><img src={articleImage(post, featured ? 1500 : 900)} alt="" loading={featured ? "eager" : "lazy"} decoding="async" /><span /></span>
      <span className="blog-card-copy">
        <span className="blog-card-meta"><span>{post.category}</span><span><Clock3 size={13} />{post.readTime}</span></span>
        <strong>{post.title}</strong>
        <span className="blog-card-excerpt">{post.excerpt}</span>
        <span className="blog-card-link">Read the guide <ArrowRight size={15} /></span>
      </span>
    </a>
  );
}

export function Blog({ viewBlogPost, go }) {
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(BLOG_POSTS.map((post) => post.category))];
  const visiblePosts = useMemo(() => category === "All" ? BLOG_POSTS : BLOG_POSTS.filter((post) => post.category === category), [category]);
  const featured = visiblePosts[0];
  const remaining = visiblePosts.slice(1);

  return (
    <>
      <PageHero
        slides={themedSlides("guide", 1900)}
        height={340}
        eyebrow="TicoWild Field Guide"
        title="Plan Costa Rica with better context"
        sub="Route-first ideas, family guidance, regional comparisons and practical booking checks—written to help you make the next decision."
      />

      <main className="blog-index">
        <div className="blog-index-heading">
          <div><span>Latest field notes</span><h2>Useful before you book.</h2><p>Editorial guidance stays separate from the live details TicoWild confirms for a real reservation.</p></div>
          <div className="blog-category-rail" aria-label="Filter blog articles by category">
            {categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
        </div>

        {featured && <ArticleCard post={featured} onOpen={viewBlogPost} featured />}
        {remaining.length > 0 && <div className="blog-card-grid">{remaining.map((post) => <ArticleCard key={post.slug} post={post} onOpen={viewBlogPost} />)}</div>}

        <section className="blog-planning-cta">
          <span className="blog-planning-icon"><Map size={22} /></span>
          <div><span>Turn reading into a route</span><h2>Build the trip around your actual stops.</h2><p>Choose destinations, dates, group size and activities. TicoWild organizes the ideas before confirming live details.</p></div>
          <Button variant="gold" size="lg" onClick={() => go("build")}>Build my trip <ArrowRight size={17} /></Button>
        </section>
      </main>

      <style>{`
        @media(min-width:821px){.public-page-blog .page-hero{min-height:280px!important}}
        .blog-index{max-width:1220px;margin:0 auto;padding:36px 20px 52px}
        .blog-index-heading{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px;align-items:end;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(127,166,232,.13)}.blog-index-heading>div:first-child>span{color:${c.teal};font-size:9.5px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.blog-index-heading h2{margin:5px 0 0;color:#fff;font-size:clamp(29px,3vw,38px);line-height:1;letter-spacing:-1.1px}.blog-index-heading p{max-width:610px;margin:7px 0 0;color:${c.stone};font-size:13px;line-height:1.5}
        .blog-category-rail{display:flex;justify-content:flex-end;gap:6px;overflow-x:auto;scrollbar-width:none}.blog-category-rail::-webkit-scrollbar{display:none}.blog-category-rail button{flex:0 0 auto;min-height:34px;padding:0 10px;border:1px solid ${c.line};border-radius:999px;background:rgba(255,255,255,.035);color:${c.stone};font:800 10.5px inherit;cursor:pointer;transition:background .2s ease,border-color .2s ease,color .2s ease}.blog-category-rail button:hover{border-color:rgba(34,211,238,.32);color:#fff}.blog-category-rail button[aria-pressed="true"]{color:${c.ink};background:${c.gold};border-color:${c.gold};box-shadow:0 12px 28px -18px rgba(255,208,0,.8)}
        .blog-card{display:grid;grid-template-rows:128px 1fr;overflow:hidden;min-width:0;border:1px solid rgba(127,166,232,.16);border-radius:16px;background:linear-gradient(145deg,rgba(20,43,76,.98),rgba(8,20,42,.98));color:#fff;text-decoration:none;box-shadow:0 22px 60px -50px rgba(0,0,0,.9);transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}.blog-card:hover{transform:translateY(-3px);border-color:rgba(34,211,238,.4);box-shadow:0 28px 66px -46px rgba(34,211,238,.2)}.blog-card-media{position:relative;overflow:hidden}.blog-card-media img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.2,.7,.2,1)}.blog-card:hover .blog-card-media img{transform:scale(1.035)}.blog-card-media>span{position:absolute;inset:0;background:linear-gradient(0deg,rgba(7,18,39,.82),transparent 62%)}.blog-card-copy{display:flex;flex-direction:column;padding:15px}.blog-card-meta{display:flex;align-items:center;justify-content:space-between;gap:9px;color:${c.stone};font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.05em}.blog-card-meta>span:first-child{color:${c.gold}}.blog-card-meta>span:last-child{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}.blog-card-copy>strong{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:3;margin-top:7px;color:#fff;font-size:18px;line-height:1.12;letter-spacing:-.38px}.blog-card-excerpt{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;margin-top:7px;color:${c.stone};font-size:11.75px;line-height:1.48}.blog-card-link{display:inline-flex;align-items:center;gap:6px;margin-top:auto;padding-top:10px;color:${c.teal};font-size:10.5px;font-weight:850}.blog-card-link svg{transition:transform .2s ease}.blog-card:hover .blog-card-link svg{transform:translateX(4px)}
        .blog-card-featured{grid-template-columns:minmax(0,1.04fr) minmax(330px,.96fr);grid-template-rows:270px;margin-bottom:12px}.blog-card-featured .blog-card-media{grid-column:1}.blog-card-featured .blog-card-copy{grid-column:2;justify-content:center;padding:26px}.blog-card-featured .blog-card-copy>strong{font-size:clamp(25px,2.5vw,32px);line-height:1.04;letter-spacing:-.9px}.blog-card-featured .blog-card-excerpt{font-size:12.75px;line-height:1.54;-webkit-line-clamp:2}.blog-card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
        .blog-planning-cta{position:relative;overflow:hidden;display:grid;grid-template-columns:40px 1fr auto;gap:15px;align-items:center;margin-top:26px;padding:17px 20px;border:1px solid rgba(255,208,0,.22);border-radius:17px;background:radial-gradient(circle at 100% 0%,rgba(255,208,0,.1),transparent 36%),linear-gradient(145deg,rgba(17,38,68,.98),rgba(7,18,39,.98))}.blog-planning-icon{display:grid;place-items:center;width:40px;height:40px;border:1px solid rgba(255,208,0,.28);border-radius:12px;color:${c.gold};background:rgba(255,208,0,.07)}.blog-planning-cta>div>span{color:${c.teal};font-size:8.5px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.blog-planning-cta h2{margin:3px 0 0;color:#fff;font-size:19px;letter-spacing:-.35px}.blog-planning-cta p{margin:3px 0 0;color:${c.stone};font-size:11.5px;line-height:1.45}
        @media(max-width:900px){.blog-index-heading{grid-template-columns:1fr;gap:16px}.blog-category-rail{justify-content:flex-start}.blog-card-featured{grid-template-columns:1fr;grid-template-rows:230px auto}.blog-card-featured .blog-card-media,.blog-card-featured .blog-card-copy{grid-column:1}.blog-card-featured .blog-card-copy{padding:26px}.blog-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.blog-planning-cta{grid-template-columns:44px 1fr}.blog-planning-cta .tico-button{grid-column:1/-1;width:100%}}
        @media(max-width:620px){.blog-index{padding:38px 14px 50px}.blog-index-heading{gap:15px;margin-bottom:16px;padding-bottom:16px}.blog-index-heading h2{font-size:30px}.blog-index-heading p{font-size:12.75px;line-height:1.52}.blog-category-rail{margin-inline:-14px;padding:0 14px}.blog-category-rail button{min-height:44px}.blog-card-featured{grid-template-rows:180px auto;margin-bottom:10px}.blog-card-featured .blog-card-copy{padding:19px 18px}.blog-card-featured .blog-card-copy>strong{font-size:26px}.blog-card-featured .blog-card-excerpt{font-size:12.75px}.blog-card-grid{grid-template-columns:1fr;gap:10px}.blog-card:not(.blog-card-featured){grid-template-columns:112px minmax(0,1fr);grid-template-rows:128px;border-radius:16px}.blog-card:not(.blog-card-featured) .blog-card-copy{padding:13px 14px}.blog-card:not(.blog-card-featured) .blog-card-meta>span:last-child,.blog-card:not(.blog-card-featured) .blog-card-excerpt{display:none}.blog-card:not(.blog-card-featured) .blog-card-copy>strong{margin-top:7px;font-size:15.5px;line-height:1.17}.blog-card:not(.blog-card-featured) .blog-card-link{padding-top:8px;font-size:10.5px}.blog-planning-cta{grid-template-columns:38px 1fr;margin-top:26px;padding:17px 16px;border-radius:18px}.blog-planning-icon{width:38px;height:38px;border-radius:12px}.blog-planning-cta h2{font-size:18px}.blog-planning-cta p{display:none}}
        @media(prefers-reduced-motion:reduce){.blog-card,.blog-card img,.blog-card-link svg{transition:none!important}}
      `}</style>
    </>
  );
}
