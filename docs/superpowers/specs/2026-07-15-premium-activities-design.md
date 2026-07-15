# Premium Activities Collections

## Goal

Turn the Activities page from a long marketplace filter into an editorial discovery experience that helps travelers understand the catalog immediately. Preserve all existing activity, trip, details, search, filter, and sorting behavior.

## Information architecture

The 16 approved activities are assigned exclusively to four frontend-only collections while retaining each record's exact category as its subtype:

1. **Ocean & Coast** — fishing, catamaran, snorkeling, surfing, and whale watching.
2. **Jungle, Wildlife & Thrills** — ATV, ziplining, night wildlife, rafting, waterfalls, and paragliding.
3. **Private Signature Days** — adult-group, honeymoon, and yacht experiences.
4. **Transfers & Arrival** — private airport transfer.

No API, publication, or activity-record changes are required.

## Page design

- Keep the cinematic activity hero, but use only catalog-backed activity labels.
- Place a four-card, photo-led collection mosaic directly below the hero. Cards show collection number, icon, title, mood line, and activity count.
- Add a compact sticky discovery bar with collection chips, search, region, level, and sort controls. Secondary controls collapse cleanly on mobile.
- Remove the five-row ranked block before the catalog. Instead, each collection names its highest-scoring activity as **Rico's Pick**.
- Render four spacious editorial collection sections. Each section has a large lead card for Rico's Pick and lean supporting browse cards.
- Use a dedicated browse-card component so the existing detailed `ActivityCard` remains unchanged elsewhere.

## Interaction model

- Selecting a collection tile or chip scrolls to and activates that collection.
- With no active collection, all matching sections are visible.
- Search and filters operate across the catalog; sections with no matches disappear.
- Sorting is applied within every visible collection.
- Add-to-trip and details actions retain their current callbacks and state.
- A single premium empty state offers a one-click filter reset.

## Responsive behavior

- Desktop: asymmetric collection mosaic, sticky horizontal discovery bar, lead card plus supporting grid.
- Tablet: two-column collection mosaic and two-column activity grid.
- Mobile: horizontally snapping collection rail, scrollable category chips, collapsible filters, single-column cards, and full-width actions.
- All interactive controls remain keyboard accessible, expose pressed/expanded state, and respect reduced-motion preferences.

## Verification

- Production build.
- Browser checks at 1440, 1024, 820, 390, and 320 pixels.
- Confirm all 16 approved activities appear exactly once with default filters.
- Confirm collection, search, region, level, family, private, and sort behavior.
- Confirm add-to-trip and details actions still work.
- Confirm no horizontal overflow or browser errors.
