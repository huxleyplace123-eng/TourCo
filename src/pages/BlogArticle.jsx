import React from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { BLOG_POSTS, blogPostBySlug } from "../blog-data.js";
import { cdnImage } from "../images.js";
import { blogPath } from "../routing.js";
import { c } from "../theme.js";
import { Button } from "../components/ui.jsx";

const imageFor = (post, width = 1500) => cdnImage(post.imageId, width);

export function BlogArticle({ activeId, go, viewBlogPost }) {
  const post = blogPostBySlug(activeId);
  if (!post) return null;
  const related = BLOG_POSTS.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article className="article-page">
        <header className="article-hero">
          <img src={imageFor(post, 1900)} alt="" aria-hidden />
          <span className="article-hero-wash" />
          <div className="article-hero-inner">
            <a href="/blog" onClick={(event) => { event.preventDefault(); go("blog"); }} className="article-back"><ArrowLeft size={15} />All field guides</a>
            <div className="article-meta"><span>{post.category}</span><span><Clock3 size={14} />{post.readTime}</span><span>{post.dateLabel}</span></div>
            <h1>{post.title}</h1>
            <p>{post.excerpt}</p>
          </div>
        </header>

        <div className="article-layout">
          <div className="article-body">
            {post.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bestFor && <div className="article-best-for"><MapPin size={17} /><div><strong>Best fit</strong><span>{section.bestFor}</span></div></div>}
                {section.bullets && <ul>{section.bullets.map((item) => <li key={item}><Check size={16} /> <span>{item}</span></li>)}</ul>}
              </section>
            ))}
          </div>

          <aside className="article-aside">
            <div className="article-takeaway"><span><BookOpen size={18} />The short version</span><p>{post.takeaway}</p></div>
            <div className="article-confirm"><ShieldCheck size={18} /><div><strong>Before payment</strong><p>TicoWild confirms current availability, timing, operator requirements and final price for the actual booking.</p></div></div>
            <Button variant="gold" full onClick={() => go(post.cta.page)}>{post.cta.label} <ArrowRight size={16} /></Button>
          </aside>
        </div>
      </article>

      <section className="article-related">
        <div className="article-related-head"><span>Keep planning</span><h2>More from the field guide.</h2></div>
        <div className="article-related-grid">
          {related.map((item) => (
            <a key={item.slug} href={blogPath(item)} onClick={(event) => { event.preventDefault(); viewBlogPost(item.slug); }}>
              <img src={imageFor(item, 800)} alt="" loading="lazy" />
              <span><small>{item.category} · {item.readTime}</small><strong>{item.title}</strong><em>Read article <ArrowRight size={14} /></em></span>
            </a>
          ))}
        </div>
      </section>

      <style>{`
        .article-page{background:${c.sand}.article-hero{position:relative;min-height:560px;display:flex;align-items:flex-end;overflow:hidden}.article-hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.article-hero-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,15,30,.96),rgba(5,15,30,.78) 56%,rgba(5,15,30,.28)),linear-gradient(0deg,rgba(5,15,30,.94),transparent 60%)}.article-hero-inner{position:relative;z-index:1;width:min(980px,calc(100% - 40px));margin:0 auto;padding:92px 0 64px}.article-back{display:inline-flex;align-items:center;gap:7px;color:rgba(255,255,255,.76);font-size:12px;font-weight:800;text-decoration:none}.article-back:hover{color:${c.teal}}.article-meta{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:34px;color:rgba(255,255,255,.72);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em}.article-meta span:first-child{color:${c.gold}}.article-meta span:nth-child(2){display:inline-flex;align-items:center;gap:5px}.article-hero h1{max-width:900px;margin:15px 0 0;color:#fff;font-size:clamp(43px,6vw,72px);line-height:.98;letter-spacing:-.052em;text-wrap:balance}.article-hero p{max-width:720px;margin:22px 0 0;color:rgba(243,247,255,.82);font-size:17px;line-height:1.68}
        .article-layout{display:grid;grid-template-columns:minmax(0,760px) minmax(260px,320px);gap:64px;width:min(1120px,calc(100% - 40px));margin:0 auto;padding:72px 0 92px;align-items:start}.article-body>p{margin:0 0 20px;color:rgba(229,238,252,.86);font-size:17px;line-height:1.82}.article-body>p:first-child{font-size:21px;line-height:1.68;color:#fff}.article-body section{padding-top:36px;margin-top:32px;border-top:1px solid rgba(127,166,232,.16)}.article-body h2{margin:0 0 16px;color:#fff;font-size:clamp(26px,3vw,34px);line-height:1.12;letter-spacing:-.8px}.article-body section p{margin:0 0 17px;color:${c.stone};font-size:16px;line-height:1.8}.article-body ul{display:grid;gap:10px;margin:19px 0 0;padding:0;list-style:none}.article-body li{display:grid;grid-template-columns:26px 1fr;gap:8px;align-items:start;padding:13px 14px;border:1px solid rgba(127,166,232,.14);border-radius:14px;background:rgba(255,255,255,.025);color:rgba(238,244,255,.86);font-size:14px;line-height:1.5}.article-body li svg{margin-top:2px;color:${c.teal}}.article-best-for{display:grid;grid-template-columns:34px 1fr;gap:10px;margin-top:19px;padding:16px;border-left:2px solid ${c.gold};border-radius:0 14px 14px 0;background:rgba(255,208,0,.055)}.article-best-for svg{color:${c.gold}}.article-best-for strong{display:block;color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:.06em}.article-best-for span{display:block;margin-top:4px;color:${c.stone};font-size:13.5px;line-height:1.5}
        .article-aside{position:sticky;top:92px;display:grid;gap:12px}.article-takeaway,.article-confirm{padding:22px;border:1px solid rgba(127,166,232,.17);border-radius:19px;background:linear-gradient(145deg,rgba(21,43,75,.98),rgba(8,20,42,.98));box-shadow:0 28px 70px -52px rgba(0,0,0,.9)}.article-takeaway>span{display:flex;align-items:center;gap:8px;color:${c.gold};font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.article-takeaway p{margin:12px 0 0;color:#fff;font-size:14.5px;line-height:1.65}.article-confirm{display:grid;grid-template-columns:24px 1fr;gap:10px}.article-confirm>svg{color:${c.teal}}.article-confirm strong{color:#fff;font-size:13px}.article-confirm p{margin:5px 0 0;color:${c.stone};font-size:12.5px;line-height:1.55}
        .article-related{padding:72px 20px 86px;background:#050f1f;border-top:1px solid rgba(127,166,232,.12)}.article-related-head{max-width:1180px;margin:0 auto 25px}.article-related-head span{color:${c.teal};font-size:10px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.article-related-head h2{margin:7px 0 0;color:#fff;font-size:34px;letter-spacing:-.9px}.article-related-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;max-width:1180px;margin:0 auto}.article-related-grid a{display:grid;grid-template-columns:128px 1fr;min-height:142px;overflow:hidden;border:1px solid rgba(127,166,232,.15);border-radius:18px;background:rgba(255,255,255,.035);color:#fff;text-decoration:none;transition:transform .2s ease,border-color .2s ease}.article-related-grid a:hover{transform:translateY(-3px);border-color:rgba(34,211,238,.35)}.article-related-grid img{width:100%;height:100%;object-fit:cover}.article-related-grid a>span{display:flex;flex-direction:column;padding:15px}.article-related-grid small{color:${c.gold};font-size:9.5px;font-weight:850;text-transform:uppercase;letter-spacing:.04em}.article-related-grid strong{margin-top:7px;font-size:14px;line-height:1.3}.article-related-grid em{display:flex;align-items:center;gap:5px;margin-top:auto;color:${c.teal};font-size:10.5px;font-style:normal;font-weight:800}
        @media(max-width:900px){.article-layout{grid-template-columns:1fr;gap:36px}.article-aside{position:static;grid-template-columns:repeat(2,minmax(0,1fr))}.article-aside .tico-button{grid-column:1/-1}.article-related-grid{grid-template-columns:1fr}}
        @media(max-width:620px){.article-hero{min-height:570px}.article-hero-inner{width:calc(100% - 32px);padding:72px 0 42px}.article-meta{gap:9px;margin-top:27px;font-size:9.5px}.article-hero h1{font-size:clamp(38px,11.5vw,49px);line-height:1.01}.article-hero p{font-size:15px;line-height:1.62}.article-layout{width:calc(100% - 32px);padding:52px 0 68px}.article-body>p{font-size:16px;line-height:1.75}.article-body>p:first-child{font-size:18px}.article-body section{padding-top:29px;margin-top:26px}.article-body h2{font-size:27px}.article-body section p{font-size:15px;line-height:1.72}.article-aside{grid-template-columns:1fr}.article-related{padding:56px 16px 70px}.article-related-head h2{font-size:29px}.article-related-grid a{grid-template-columns:105px 1fr;min-height:132px}}
        @media(prefers-reduced-motion:reduce){.article-related-grid a{transition:none!important}}
      `}</style>
    </>
  );
}
