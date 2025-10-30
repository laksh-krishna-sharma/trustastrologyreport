import llm from "../lib/llm.ts";
import life_timeline_prompt from "../../prompt/career/life_timeline.ts";

const result = await llm.invoke(life_timeline_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(result.content)
  ? result.content.find((item: any) => item.type === 'text')?.text || ''
  : result.content;


export default textContent;
