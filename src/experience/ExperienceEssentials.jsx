import React from 'react';
import {publicExperienceFacts} from './standards.js';
import './experience.css';
export default function ExperienceEssentials({activity}){
 const d=activity.experienceDetails||{};
 return <section className="experience-essentials" aria-label="Experience essentials"><h2>Know before you go</h2><p>{activity.catalogStatus==='planning-example'?'Planning example. The team will check these details with the actual provider.':'Review the details and ask us about anything your group needs.'}</p><dl>{publicExperienceFacts(activity).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><h3>Meet the people behind your experience</h3>{d.hostName?<><strong>{d.hostName}</strong><p>{d.hostStory||'Ask the team about your guide’s local experience.'}</p>{d.languages&&<p>Languages: {d.languages}</p>}<small>Information supplied by the operator. No credential verification is implied.</small></>:<p>Your operating team and guide details will be shared when the provider is confirmed. Tell us your preferred language and any special requirements.</p>}</section>;
}
