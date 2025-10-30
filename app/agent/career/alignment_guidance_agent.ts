import llm from "../lib/llm.ts";
import alignment_guidance_prompt from "../../prompt/career/alignment_guidance.ts";

const result = await llm.invoke(alignment_guidance_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(result.content)
  ? result.content.find((item: any) => item.type === 'text')?.text || ''
  : result.content;


export default textContent;
