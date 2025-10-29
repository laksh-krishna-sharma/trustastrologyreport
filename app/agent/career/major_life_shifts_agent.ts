import llm from "../lib/llm.ts";
import life_timeline_prompt from "../../prompt/career/life_timeline.ts";

const birth_imprint_result = await llm.invoke(life_timeline_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(birth_imprint_result.content)
  ? birth_imprint_result.content.find((item: any) => item.type === 'text')?.text || ''
  : birth_imprint_result.content;


export default textContent;
