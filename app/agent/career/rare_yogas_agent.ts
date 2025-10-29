import llm from "../lib/llm.ts";
import rare_yogas_prompt from "../../prompt/career/rare_yogas.ts";

const result = await llm.invoke(rare_yogas_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(result.content)
  ? result.content.find((item: any) => item.type === 'text')?.text || ''
  : result.content;


export default textContent;
