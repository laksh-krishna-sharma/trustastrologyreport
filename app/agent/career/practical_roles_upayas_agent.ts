import llm from "../lib/llm.ts";
import practical_roles_upayas_prompt from "@/app/prompt/career/practical_roles_upayas.ts";

const result = await llm.invoke(practical_roles_upayas_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(result.content)
  ? result.content.find((item: any) => item.type === 'text')?.text || ''
  : result.content;


export default textContent;
