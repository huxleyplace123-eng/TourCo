const CUSTOM_KEY = "ticowild_crm_email_templates_v1";

export const EMAIL_TEMPLATES = [
  {
    id: "operator-partnership-introduction", audience: "operator", category: "Outreach",
    name: "Partnership introduction",
    useWhen: "A strong local operator has been recommended or identified for outreach.",
    subject: "A partnership opportunity with TicoWild",
    body: `Hello {{contact_name}},

I am reaching out from TicoWild because {{company_name}} was recommended to us as a strong local operator in {{region}}.

TicoWild helps international travelers discover trusted Costa Rica experiences and turn them into a trip that fits their route, dates, and travel style. We keep our partner network intentionally focused so travelers have a clear choice and reliable local businesses receive qualified opportunities instead of competing in a crowded list.

Why operators work with TicoWild:
• More visibility with international travelers
• Qualified requests matched to your region and services
• Clear trip details before you confirm availability
• A simple handoff between the traveler, TicoWild, and your team
• Partnership terms agreed in writing before anything is published

Our current payment model is designed around TicoWild collecting a 20% planning deposit and the operator collecting the remaining 80% from the guest on the day of the experience. Final pricing, payment timing, and partner terms are always confirmed with you in writing first.

If this sounds like a fit, you can apply here:
https://ticowild.com/become-a-partner

I would also be happy to answer questions or schedule a short introduction.

Pura vida,
John Robinson
Co-Founder and Chief Operator, TicoWild
john@ticowild.com
WhatsApp: 8672-3132`,
  },
  {
    id: "operator-partnership-follow-up", audience: "operator", category: "Follow-up",
    name: "Partnership follow-up",
    useWhen: "The first introduction was sent and there has not been a reply.",
    subject: "Following up about {{company_name}} and TicoWild",
    body: `Hello {{contact_name}},

I wanted to follow up on my note about a possible partnership between {{company_name}} and TicoWild.

We are building a focused network of trusted Costa Rica operators and believe your {{service_category}} experience could be a strong fit for travelers visiting {{region}}.

There is no obligation to join. I would simply like to learn how you operate, what experiences you want to grow, and whether our traveler requests are a good match for your team.

You can reply to this email, message me on WhatsApp at 8672-3132, or apply here when convenient:
https://ticowild.com/become-a-partner

Pura vida,
John
TicoWild`,
  },
  {
    id: "operator-pricing-request", audience: "operator", category: "Onboarding",
    name: "Tour details and pricing request",
    useWhen: "An interested operator needs to provide the information required for review.",
    subject: "Details needed for your TicoWild partner profile",
    body: `Hello {{contact_name}},

Thank you for your interest in partnering with TicoWild. To review {{company_name}} and build an accurate partner profile, please send the following for each experience you would like us to consider:

• Experience name and short description
• Region, meeting point, and pickup options
• Duration, schedule, and minimum notice required
• Retail price and the net amount your company needs to receive
• Minimum and maximum group size
• What is included and what guests should bring
• Age, health, mobility, or weather restrictions
• Cancellation terms
• Current photos we may use with permission
• Best contact for live availability requests

Please also share your legal business name, website or public business profile, insurance or licensing details where applicable, and preferred payment method.

Nothing will be published until the details and final partner terms are reviewed with you.

Pura vida,
John
TicoWild`,
  },
  {
    id: "operator-application-received", audience: "operator", category: "Application",
    name: "Application received",
    useWhen: "A new operator application arrives and is waiting for review.",
    subject: "We received your TicoWild partner application",
    body: `Hello {{contact_name}},

Thank you for applying to become a TicoWild partner. We received the application for {{company_name}}.

What happens next:
1. We review the application and public business information.
2. We confirm pricing, availability, safety, and operating details with you.
3. If approved, we send the partner terms for review.
4. Your partner access is activated only after the required details are complete.

Nothing is published automatically, and this message is not yet an approval. If anything is missing, we will contact you before making a decision.

Pura vida,
The TicoWild team`,
  },
  {
    id: "operator-changes-requested", audience: "operator", category: "Application",
    name: "Application needs changes",
    useWhen: "The review team needs missing or corrected information before approval.",
    subject: "A few updates are needed for your TicoWild application",
    body: `Hello {{contact_name}},

Thank you for applying to TicoWild. We reviewed the application for {{company_name}} and need a few updates before we can continue:

{{requested_updates}}

Please reply with the information above or update your application when convenient. Once we receive it, we will continue the review from where it paused.

If any request is unclear, reply here and we will walk through it with you.

Pura vida,
The TicoWild team`,
  },
  {
    id: "operator-approved", audience: "operator", category: "Application",
    name: "Partner approved",
    useWhen: "An operator has passed review and the partnership can move into setup.",
    subject: "Welcome to the TicoWild partner network",
    body: `Hello {{contact_name}},

We are pleased to let you know that {{company_name}} has been approved to move forward as a TicoWild partner.

Before your experiences go live, we will finish the setup together:
• Confirm the experiences, pricing, and service areas we may present
• Confirm availability and booking contacts
• Review the partner terms and payment process
• Approve the photos and customer-facing details
• Activate your secure Partner Center access

Approval does not publish your listing automatically. We will confirm the final details with you first.

Welcome to TicoWild. We are excited to build a thoughtful, dependable partnership with your team.

Pura vida,
The TicoWild team`,
  },
  {
    id: "operator-availability-request", audience: "operator", category: "Booking",
    name: "Live availability request",
    useWhen: "A traveler is interested and the operator needs to confirm current details.",
    subject: "Availability request for {{experience_name}} on {{travel_date}}",
    body: `Hello {{contact_name}},

We have a traveler interested in {{experience_name}} and would like to confirm the current details before we present it as available.

Date: {{travel_date}}
Travelers: {{guest_count}}
Pickup or meeting area: {{location}}
Requested time: {{requested_time}}
Notes: {{traveler_notes}}

Please confirm availability, start time, final total and currency, what is included, pickup details, restrictions, and cancellation terms.

This is an availability request, not a confirmed booking. We will wait for your reply before making any promise to the traveler.

Thank you,
The TicoWild team`,
  },
  {
    id: "customer-request-received", audience: "customer", category: "New inquiry",
    name: "Planning request received",
    useWhen: "A traveler submits a new planning or availability request.",
    subject: "We received your Costa Rica trip request",
    body: `Hello {{first_name}},

Thank you for reaching out to TicoWild. We received your request and are reviewing the route, dates, group details, and experiences you shared.

Here is what happens next:
1. We make sure the plan fits your route and travel pace.
2. We check current details with the relevant local operators.
3. We send you a clear option with confirmed timing, availability, and final pricing before you decide.

Your request is not a reservation, and no payment has been collected through this message. If anything has changed, simply reply with the update.

Pura vida,
The TicoWild team`,
  },
  {
    id: "customer-details-needed", audience: "customer", category: "Planning",
    name: "Trip details needed",
    useWhen: "The team needs a few details before recommending an experience or route.",
    subject: "A few details will help us shape your Costa Rica trip",
    body: `Hello {{first_name}},

We would love to help shape the right Costa Rica experience for your trip. Before we narrow the options, could you reply with:

• Travel dates or date range
• Places you are staying or considering
• Number of adults and children, including children's ages
• The pace you want: relaxed, balanced, or adventure-filled
• Experiences you definitely want to include
• Mobility, health, food, or accessibility needs
• Approximate activity budget
• Best WhatsApp number while traveling

Once we have this, we can focus on options that fit the route instead of sending a long generic list.

Pura vida,
The TicoWild team`,
  },
  {
    id: "customer-plan-ready", audience: "customer", category: "Planning",
    name: "Curated plan ready",
    useWhen: "A route-aware recommendation or draft itinerary is ready to review.",
    subject: "Your TicoWild Costa Rica plan is ready to review",
    body: `Hello {{first_name}},

We have shaped a Costa Rica plan around your dates, route, group, and preferred pace.

Review your plan here:
{{plan_link}}

The plan shows how the days fit together and which details still need live confirmation. Prices and availability remain estimates until the relevant operator confirms them for your exact date and group.

Reply with what you love, what you would change, or any question you want us to solve. We can adjust the pace, swap an experience, or simplify the route before anything is finalized.

Pura vida,
The TicoWild team`,
  },
  {
    id: "customer-availability-update", audience: "customer", category: "Availability",
    name: "Availability in progress",
    useWhen: "The team is waiting on a local operator and wants to keep the traveler informed.",
    subject: "A quick update on your TicoWild request",
    body: `Hello {{first_name}},

We are still confirming current availability and final details for {{experience_name}} on {{travel_date}}.

We have not marked the experience as booked and have not promised a final price yet. We will update you as soon as the operator confirms the schedule, total, and any important requirements.

If your date, group size, or route changes while we are checking, please reply so we can update the request.

Thank you for your patience,
The TicoWild team`,
  },
  {
    id: "customer-details-confirmed", audience: "customer", category: "Booking",
    name: "Experience details confirmed",
    useWhen: "The operator has confirmed the details and the traveler needs a clear summary.",
    subject: "Confirmed details for {{experience_name}}",
    body: `Hello {{first_name}},

The current details for your experience are confirmed below.

Experience: {{experience_name}}
Date: {{travel_date}}
Start time: {{start_time}}
Travelers: {{guest_count}}
Meeting point or pickup: {{meeting_details}}
Final total: {{final_total}}
Amount due now: {{amount_due_now}}
Amount due to the operator: {{operator_balance}}
Cancellation terms: {{cancellation_terms}}

What is included:
{{included_items}}

What to bring:
{{what_to_bring}}

Please review every detail and reply if anything is incorrect. The booking is complete only when the confirmation and required payment steps stated here are finished.

Pura vida,
The TicoWild team`,
  },
  {
    id: "customer-pretrip-reminder", audience: "customer", category: "Trip care",
    name: "Pre-trip reminder",
    useWhen: "A confirmed experience is approaching and the guest needs practical details.",
    subject: "Your {{experience_name}} details for {{travel_date}}",
    body: `Hello {{first_name}},

Your {{experience_name}} experience is coming up on {{travel_date}}.

Start time: {{start_time}}
Meeting point or pickup: {{meeting_details}}
Operator contact: {{operator_contact}}
Balance due locally: {{operator_balance}}

Please bring:
{{what_to_bring}}

Important notes:
{{important_notes}}

Weather and local conditions can affect timing. If you are delayed or need help on the day, contact {{support_contact}} as soon as possible.

Have an amazing time,
The TicoWild team`,
  },
  {
    id: "customer-posttrip-thanks", audience: "customer", category: "Trip care",
    name: "Post-trip thank you",
    useWhen: "After an experience, to collect useful feedback and keep the relationship warm.",
    subject: "How was your TicoWild experience?",
    body: `Hello {{first_name}},

We hope you had a wonderful time on {{experience_name}}.

Would you reply with a quick note about how it went? We would especially like to know whether the operator communication, timing, safety briefing, and overall experience matched what you expected.

If something did not go as planned, please tell us directly so we can follow up. If you loved it, we would be grateful for a short review we may share with future travelers, with your permission.

Thank you for trusting TicoWild with part of your Costa Rica trip.

Pura vida,
The TicoWild team`,
  },
];

export function loadCustomTemplates() {
  try {
    const value = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveCustomTemplates(templates) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(templates));
}

export function allEmailTemplates() {
  return [...EMAIL_TEMPLATES, ...loadCustomTemplates()];
}

export function templateVariables(template) {
  return [...new Set(`${template?.subject || ""}\n${template?.body || ""}`.match(/{{[^}]+}}/g) || [])];
}
