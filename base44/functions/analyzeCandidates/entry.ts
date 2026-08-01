const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const jobDescription: string = (body?.job_description || '').trim();
    const resumeFileUrls: string[] = Array.isArray(body?.resume_file_urls) ? body.resume_file_urls : [];

    if (!jobDescription) {
      return Response.json({ error: 'A job description is required.' }, { status: 400 });
    }
    if (resumeFileUrls.length === 0) {
      return Response.json({ error: 'At least one resume is required.' }, { status: 400 });
    }
    if (resumeFileUrls.length > 12) {
      return Response.json({ error: 'A maximum of 12 resumes can be analyzed at once.' }, { status: 400 });
    }

    const prompt = `You are Deema AI, an expert technical recruiter for the Qatar Science & Technology Park internship program.

A hiring manager has provided a job description and ${resumeFileUrls.length} candidate resumes. Analyze each resume against the job description and identify the TOP CANDIDATES who are the strongest match.

For EACH top candidate (return between 3 and ${Math.min(resumeFileUrls.length, 6)} candidates, ranked best-first), provide:
- candidate_name: the candidate's full name as found on their resume
- summary: a concise bullet-point style narrative (2-3 sentences) explaining why this candidate is a strong match
- relevant_experience: a short description of their most relevant past experience
- technical_strengths: an array of 3-5 specific technical strengths relevant to the role
- match_reasons: an array of 3-4 concrete reasons this candidate matches the job

Do NOT include any scores, percentages, ratings, or numerical rankings in any text field. Write in clear, professional English. Be specific and reference actual details from the resume when possible.

Return ONLY a JSON object with this exact shape:
{
  "candidates": [
    {
      "candidate_name": "string",
      "summary": "string",
      "relevant_experience": "string",
      "technical_strengths": ["string"],
      "match_reasons": ["string"]
    }
  ]
}`;

    const result = await db.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: resumeFileUrls,
      response_json_schema: {
        type: 'object',
        properties: {
          candidates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                candidate_name: { type: 'string' },
                summary: { type: 'string' },
                relevant_experience: { type: 'string' },
                technical_strengths: { type: 'array', items: { type: 'string' } },
                match_reasons: { type: 'array', items: { type: 'string' } }
              },
              required: ['candidate_name', 'summary', 'relevant_experience', 'technical_strengths', 'match_reasons']
            }
          }
        },
        required: ['candidates']
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}