import llm from "../lib/llm.ts";
import professional_karma_focus_prompt from "../../prompt/career/professional_karma_focus.ts";

const result = await llm.invoke(professional_karma_focus_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(result.content)
  ? result.content.find((item: any) => item.type === 'text')?.text || ''
  : result.content;


export default textContent;
