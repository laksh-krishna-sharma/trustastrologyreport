import llm from "../lib/llm.ts";
import professional_karma_focus_prompt from "../../prompt/career/professional_karma_focus.ts";

const birth_imprint_result = await llm.invoke(professional_karma_focus_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(birth_imprint_result.content)
  ? birth_imprint_result.content.find((item: any) => item.type === 'text')?.text || ''
  : birth_imprint_result.content;


export default textContent;
