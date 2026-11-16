export const experienceFields = [
 ['agenda','What happens, in order'],['groupSize','Group size and capacity limits'],['transport','Transport and meeting arrangements'],
 ['inclusions','What is included'],['exclusions','What is not included'],['preparation','What guests should bring'],
 ['effort','Physical effort and terrain'],['ageRequirements','Age and supervision requirements'],
 ['accessibility','Specific accessibility information'],['cancellationTerms','Cancellation and change terms'],
 ['weatherPlan','Weather decisions and alternatives'],['hostName','Guide or operating team'],
 ['hostStory','Local story and relevant experience'],['languages','Languages offered'],
];
export function experienceGaps(t={}) {
 const d=t.experienceDetails||{};
 return experienceFields.filter(([key])=>!String(d[key]||'').trim()).map(([key,label])=>({key,label}));
}
export function experienceReady(t={}) {
 return !!String(t.product||t.title||'').trim() && !!String(t.duration||'').trim() && experienceGaps(t).length===0;
}
export function publicExperienceFacts(a={}) {
 const d=a.experienceDetails||{};
 const list=v=>Array.isArray(v)?v.join(' · '):v;
 return [
  ['Duration',a.duration||'Confirm with the team'],['Group size',d.groupSize||'Ask about group size and available spaces.'],['Effort',d.effort||a.level||'Confirm with the team'],
  ['What happens',d.agenda||'Ask the team for the provider’s step-by-step itinerary.'],
  ['Transport and meeting',d.transport||'Pickup inclusion and exact meeting instructions need confirmation.'],
  ['Included',d.inclusions||list(a.included)||'Confirm with the team'],
  ['Not included',d.exclusions||'Ask about any additional costs before confirming.'],
  ['Bring',d.preparation||list(a.bring)||'Confirm with the team'],
  ['Ages and supervision',d.ageRequirements||'Age limits and supervision requirements need confirmation.'],
  ['Accessibility',d.accessibility||'Tell us what access you need so we can check with the provider.'],
  ['Changes and cancellation',d.cancellationTerms||'Provider-specific terms will be supplied for review before confirmation.'],
  ['Weather',d.weatherPlan||'The operator must confirm weather-related changes and available alternatives.'],
 ];
}
