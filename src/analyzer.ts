import OpenAI from 'openai';
import { ScanResult } from './scanner';

export interface AnalysisResult {
  description: string;
  problemSolved: string;
  features: string[];
  techStack: string[];
  installation: string;
  usage: string;
  apiEndpoints: string;
  emoji: string;
  configuration: string;
}

export interface AIProviderOptions {
  provider: string;
  openaiKey?: string;
  anthropicKey?: string;
  openrouterKey?: string;
  ollamaHost?: string;
  model: string;
}

export async function analyzeProject(scan: ScanResult, opts: AIProviderOptions): Promise<AnalysisResult | null> {
  const systemPrompt = `You are an expert software engineer. Analyze this repository structure and details. Extract:
1. What does this project do? (1 sentence description)
2. What problem does it solve?
3. What are the main features? (list)
4. What tech stack is used? (list)
5. How do you install and run it? (bash commands)
6. What are the main API endpoints or functions? (list or explain)
7. Suggest a fitting emoji for the project.
8. What are the configuration options if any?

Return as structured JSON exactly matching this schema:
{
  "description": "string",
  "problemSolved": "string",
  "features": ["string"],
  "techStack": ["string"],
  "installation": "string",
  "usage": "string",
  "apiEndpoints": "string",
  "emoji": "string",
  "configuration": "string"
}`;

  const userPrompt = `Project Summary:
File Count: ${scan.fileCount}
Languages: ${scan.languages.join(', ')}
Frameworks: ${scan.frameworks.join(', ')}

Files:
${scan.files.slice(0, 100).join('\n')}

Package/Dependencies Info:
${JSON.stringify(scan.packageJson?.dependencies || {})}
${scan.requirementsTxt ? scan.requirementsTxt.substring(0, 500) : ''}
`;

  try {
    if (opts.provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': opts.anthropicKey || '',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: opts.model,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
      });

      if (!response.ok) throw new Error(`Anthropic Error: ${await response.text()}`);
      const data = await response.json();
      const content = data.content[0].text;
      const jsonStr = content.replace(/```json\n/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr) as AnalysisResult;
    } 
    
    if (opts.provider === 'ollama') {
      const response = await fetch(`${opts.ollamaHost}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: opts.model,
          stream: false,
          format: 'json',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) throw new Error(`Ollama Error: ${await response.text()}`);
      const data = await response.json();
      return JSON.parse(data.message.content) as AnalysisResult;
    }

    const isOpenRouter = opts.provider === 'openrouter';
    const client = new OpenAI({
      apiKey: isOpenRouter ? opts.openrouterKey : opts.openaiKey,
      baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
    });

    const response = await client.chat.completions.create({
      model: opts.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message?.content;
    if (!content) return null;
    return JSON.parse(content) as AnalysisResult;
  } catch (error) {
    console.error(`AI API Error (${opts.provider}):`, error);
    return null;
  }
}
