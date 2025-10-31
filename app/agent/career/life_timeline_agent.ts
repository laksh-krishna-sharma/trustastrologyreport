import llm from "../lib/llm.ts";
import life_timeline_prompt from "../../prompt/career/life_timeline.ts";
import { getFormattedUserDetailsForPrompt } from "../lib/user_details.ts";

const userContext = getFormattedUserDetailsForPrompt();
const enrichedPrompt = `${life_timeline_prompt}\n\n### USER PROFILE & ASTROLOGICAL DATA\n${userContext}`;

const result = await llm.invoke(enrichedPrompt);

// Extract only the text content from the response
const textContent = Array.isArray(result.content)
  ? result.content.find((item: any) => item.type === 'text')?.text || ''
  : result.content;


export default textContent;
