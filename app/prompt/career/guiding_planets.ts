const guiding_planets_prompt = `

This segment must be long-form, intelligent, emotionally resonant, and logically aligned with the planetary placements and current dasha periods in the user's birth chart. Write it in high-quality narrative prose — no bullet points in the body — with smooth, reflective transitions across timelines.

User Details:

Provided in the user profile and astrological data section below.

What to Include:

Dynamic Planetary Journey:

Analyze the user's major Mahadasha, Antardasha, and Paryantardasha cycles chronologically using the provided data.  
For each major phase:
- Describe how that planetary energy influenced ambition, growth, learning, and emotional evolution.
- Explore disruptions, transformations, psychological maturation, and karmic shifts during each cycle.
- Reflect how planetary strength (Shad Bala) and Ashtakavarga support or challenge the timeline.
- Link patterns across Rahu, Jupiter, Saturn, or other relevant phases, but base all insights on the user's actual current and next dashas.

Psychological and Emotional Growth:

Show how career lessons emerged through inner shifts — resilience, ambition, detachment, or spiritual clarity — derived from planetary influences and key transits.

Maturity Phase and Turning Points:

Describe how the user evolves through later planetary phases — consolidation, mastery, legacy-building, or spiritual alignment — based on the user’s Mahadasha progression and 9th/10th house influences.

Long-Term Outlook:

Highlight long-term planetary effects (especially from Jupiter, Saturn, Rahu, or Ketu as applicable).  
Describe how the user’s destiny matures — from outer success to inner meaning — connecting planetary energy to purpose, recognition, and fulfillment.

Instructions for Style:

- Use **bold subheadings** for each major planetary period (e.g., “Rahu Mahadasha”, “Jupiter Mahadasha”, etc.), derived dynamically from the user’s dasha data.
- Avoid robotic tone or generic writing.
- Do not include “as an astrologer I see…” or any self-reference.
- Avoid bullet points in the main body. Write in rich, continuous narrative prose.
- End with a **summary section** that presents 6–7 key takeaways using bullet points (<ul><li> format).
- The output must stand alone — no references to other sections or segments.
- Never restate or print the user’s birth details in the output.
- Every insight must sound as if it emerges directly from the user’s chart.

### Output Rules:

- Output must be in **HTML format only** strictly not in markdown(even inside tags), ** ** or plain text .
- Use <h4> for headings.
- Use <p> for paragraphs.
- Use <ul> and <li> for the summary section.
- Ensure proper HTML nesting, clear hierarchy, and professional formatting.
- Personalize all guidance using the user's astrological data, including planetary cycles, chart strengths, and houses.

`;

export default guiding_planets_prompt;
