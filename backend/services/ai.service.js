import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * AI Service for ContentPilot AI - Phase 2
 * Supports OpenAI and OpenAI-compatible LLM endpoints.
 * Operates strictly through backend environment variables.
 * Gracefully reports unavailable status when API key is missing.
 */

const getAIConfig = () => {
  const apiKey = process.env.AI_API_KEY?.trim() || '';
  let model = process.env.AI_MODEL?.trim() || 'gpt-4o-mini';
  let provider = process.env.AI_PROVIDER?.trim().toLowerCase() || 'openai';
  let baseURL = process.env.AI_BASE_URL?.trim() || undefined;

  // Auto-detect Google Gemini API key or explicit provider
  const isGeminiKey = apiKey.startsWith('AIzaSy') || apiKey.startsWith('AQ.');
  if (provider === 'gemini' || isGeminiKey) {
    provider = 'gemini';
    baseURL = baseURL || 'https://generativelanguage.googleapis.com/v1beta/openai/';
    if (model === 'gpt-4o-mini' || model === 'gemini-1.5-flash' || !model) {
      model = 'gemini-2.5-flash';
    }
  }

  return {
    apiKey,
    model,
    provider,
    baseURL,
    isAvailable: Boolean(apiKey && apiKey.length > 5 && !apiKey.includes('your-ai-api-key'))
  };
};

// Singleton OpenAI / Compatible LLM client
let cachedClient = null;
const getClient = () => {
  const config = getAIConfig();
  if (!config.isAvailable) {
    return null;
  }
  if (!cachedClient || cachedClient.apiKey !== config.apiKey || cachedClient.baseURL !== config.baseURL) {
    cachedClient = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: 35000 // 35 seconds timeout
    });
  }
  return cachedClient;
};

// Clean JSON response from LLM (strips Markdown ```json blocks if present)
const parseJSONFromResponse = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned);
  }
};

export const aiService = {
  /**
   * Check if AI service is configured and available
   */
  getStatus() {
    const config = getAIConfig();
    return {
      available: config.isAvailable,
      provider: config.provider,
      model: config.model
    };
  },

  /**
   * Ensure AI is available or throw standard unavailable error
   */
  ensureAvailable() {
    const config = getAIConfig();
    if (!config.isAvailable) {
      const error = new Error('AI Assistant is currently unavailable. You can continue managing your content manually.');
      error.status = 503;
      error.isUnavailable = true;
      throw error;
    }
  },

  /**
   * Resilient completion executor with automatic fallback for high-demand spikes
   */
  async executeCompletion(params) {
    const client = getClient();
    const config = getAIConfig();

    // Build fallback chain: if flash is overloaded, automatically try flash-lite
    const modelsToTry = [config.model];
    if (config.provider === 'gemini') {
      if (config.model.includes('flash-lite')) {
        modelsToTry.push('gemini-2.5-flash');
      } else {
        modelsToTry.push('gemini-2.5-flash-lite', 'gemini-flash-latest');
      }
    }

    let lastError = null;
    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      try {
        return await client.chat.completions.create({
          ...params,
          model
        });
      } catch (err) {
        lastError = err;
        const isTransient = err?.status === 503 || 
                            err?.message?.includes('high demand') || 
                            err?.message?.includes('UNAVAILABLE') ||
                            err?.status === 429;
        if (isTransient && i < modelsToTry.length - 1) {
          console.warn(`[AI Service] Model ${model} is experiencing high demand. Automatically trying fallback model ${modelsToTry[i + 1]}...`);
          await new Promise(r => setTimeout(r, 600));
          continue;
        }
        break;
      }
    }
    throw lastError;
  },

  /**
   * 1. AI Content Generator
   */
  async generateContent({ topic, contentType = 'article', targetAudience, writingTone = 'professional', contentLength = 'medium' }) {
    this.ensureAvailable();
    const client = getClient();
    const config = getAIConfig();

    const lengthGuide = {
      short: 'around 300 to 500 words',
      medium: 'around 600 to 900 words',
      long: 'around 1000 to 1500 words with detailed sections'
    }[contentLength.toLowerCase()] || 'around 600 to 900 words';

    const systemPrompt = `You are ContentPilot AI, a world-class editorial assistant for digital publishing platforms.
Your task is to generate high-quality, engaging content based on the user's requirements.
Formatting rules:
- Format the content body with clean, semantic HTML tags (<h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>).
- Do not use markdown syntax in HTML content (use <p> instead of raw text, <strong> instead of **, etc.).
- Never invent harmful, defamatory, or false factual claims.
- Return ONLY a valid JSON object matching the requested schema.`;

    const userPrompt = `Generate a complete ${contentType} on the following topic:
Topic: "${topic}"
Content Type: ${contentType}
Target Audience: ${targetAudience || 'General readers and industry professionals'}
Writing Tone: ${writingTone}
Desired Length: ${lengthGuide}

Respond with a JSON object in this exact structure:
{
  "title": "Compelling, journalistic headline",
  "description": "Engaging 1-2 sentence excerpt/summary for article cards",
  "introduction": "An engaging hook and introductory section",
  "main_content": "The core analysis, structured into subsections with <h2> and <h3> headings and informative paragraphs",
  "conclusion": "Thoughtful closing thoughts, takeaways, or call-to-action",
  "full_html": "Full combined HTML article (introduction + main_content + conclusion)"
}`;

    try {
      const completion = await this.executeCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      const parsed = parseJSONFromResponse(responseText);

      // Fallback if full_html was not merged
      if (!parsed.full_html) {
        parsed.full_html = [
          parsed.introduction ? `<p>${parsed.introduction}</p>` : '',
          parsed.main_content || '',
          parsed.conclusion ? `<h3>Conclusion</h3><p>${parsed.conclusion}</p>` : ''
        ].filter(Boolean).join('\n\n');
      }

      return parsed;
    } catch (err) {
      this.handleAIError(err);
    }
  },

  /**
   * 2. AI Writing Assistant
   */
  async improveWriting({ text, instruction = 'improve_writing', tone }) {
    this.ensureAvailable();
    const client = getClient();
    const config = getAIConfig();

    if (!text || !text.trim()) {
      throw new Error('Text to improve cannot be empty.');
    }

    const instructionsMap = {
      fix_grammar: 'Fix all grammar, spelling, and punctuation errors while strictly preserving the existing tone and meaning.',
      improve_writing: 'Enhance clarity, vocabulary variety, sentence flow, and readability.',
      rewrite: 'Rewrite the text with fresh phrasing, modern cadence, and engaging style.',
      simplify: 'Simplify the language, sentence structure, and vocabulary so it is effortless to read.',
      make_professional: 'Polish the text to sound executive, authoritative, professional, and credible.',
      shorten: 'Condense and tighten the text to its essential points without sacrificing core meaning.',
      expand: 'Elaborate on the ideas, adding context, explanatory details, and illustrative depth.',
      change_tone: `Adapt the writing tone to be distinctly ${tone || 'engaging and friendly'}.`
    };

    const actionDescription = instructionsMap[instruction] || instructionsMap.improve_writing;

    const systemPrompt = `You are ContentPilot AI Writing Assistant.
You refine and elevate text submitted by authors and editors.
Preserve HTML tags (like <p>, <strong>, <em>, <a>, <h2>) if present in the original text.
Return ONLY a valid JSON object in this format:
{
  "improved": "The updated and refined text",
  "changes_summary": "A 1-2 sentence description of key improvements made"
}`;

    const userPrompt = `Directive: ${actionDescription}
${tone ? `Desired Tone: ${tone}` : ''}

Original Text:
"""
${text}
"""`;

    try {
      const completion = await this.executeCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
        response_format: { type: 'json_object' }
      });

      const parsed = parseJSONFromResponse(completion.choices[0]?.message?.content || '{}');
      return {
        original: text,
        improved: parsed.improved || text,
        changes_summary: parsed.changes_summary || 'Text refined for clarity.'
      };
    } catch (err) {
      this.handleAIError(err);
    }
  },

  /**
   * 3. AI SEO Assistant
   */
  async generateSEO({ title, description, body }) {
    this.ensureAvailable();
    const client = getClient();
    const config = getAIConfig();

    const systemPrompt = `You are a certified Search Engine Optimization (SEO) expert for high-traffic media and editorial publications.
Analyze the provided content and generate high-ranking metadata following standard search engine best practices:
- SEO Title: 50-60 characters, front-loaded with primary keywords.
- Meta Description: 140-160 characters, compelling click-through rate hook with keywords.
- Keywords: 6-10 highly relevant primary and long-tail search keywords.
- Recommendations: 3-5 concrete, actionable on-page SEO optimization suggestions.

Return ONLY a valid JSON object in this format:
{
  "seo_title": "Optimized Page Title | Site Brand",
  "meta_description": "Engaging meta snippet with keywords...",
  "keywords": "keyword1, keyword2, keyword3",
  "keywords_array": ["keyword1", "keyword2", "keyword3"],
  "recommendations": [
    "Tip 1...",
    "Tip 2...",
    "Tip 3..."
  ]
}`;

    const contentSnippet = (body || '').replace(/<[^>]*>/g, ' ').slice(0, 3000);

    const userPrompt = `Analyze this content and generate SEO metadata:
Title: "${title || ''}"
Summary: "${description || ''}"
Content Snippet:
"""
${contentSnippet}
"""`;

    try {
      const completion = await this.executeCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      return parseJSONFromResponse(completion.choices[0]?.message?.content || '{}');
    } catch (err) {
      this.handleAIError(err);
    }
  },

  /**
   * 4. AI Summarizer
   */
  async summarizeContent({ text, contentType = 'article' }) {
    this.ensureAvailable();
    const client = getClient();
    const config = getAIConfig();

    if (!text || !text.trim()) {
      throw new Error('Content text to summarize cannot be empty.');
    }

    const plainText = text.replace(/<[^>]*>/g, ' ').slice(0, 10000);

    const systemPrompt = `You are an expert executive editor and summarizer.
Synthesize the provided ${contentType} into three distinct summary formats:
1. One-line summary: A single punchy, informative sentence capturing the core thesis.
2. Short paragraph: A cohesive 2-3 sentence executive synopsis.
3. Key points: 4 to 6 concise bullet points highlighting the most crucial takeaways.

Return ONLY a valid JSON object in this format:
{
  "one_line_summary": "Single punchy sentence...",
  "short_paragraph": "2-3 sentence overview...",
  "key_points": [
    "Key point 1",
    "Key point 2",
    "Key point 3",
    "Key point 4"
  ]
}`;

    try {
      const completion = await this.executeCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Summarize the following text:\n\n"""\n${plainText}\n"""` }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      return parseJSONFromResponse(completion.choices[0]?.message?.content || '{}');
    } catch (err) {
      this.handleAIError(err);
    }
  },

  /**
   * 5. AI Content Reviewer
   * Provides advisory review suggestions only.
   * Human editors/admins retain full publishing control.
   */
  async reviewContent({ title, body, contentType = 'article' }) {
    this.ensureAvailable();
    const config = getAIConfig();

    if (!body || !body.trim()) {
      throw new Error('Content body cannot be empty for review.');
    }

    const plainText = body.replace(/<[^>]*>/g, ' ').slice(0, 8000);

    const systemPrompt = `You are ContentPilot AI Senior Editorial Reviewer.
Perform a thorough, constructive pre-publication review of this ${contentType}.
Analyze the content objectively across 6 dimensions:
1. Grammar & Spelling
2. Clarity & Sentence Structure
3. Repetition & Redundancy
4. Missing Information or Logical Gaps
5. Inappropriate or Offensive Language (Safety check)
6. Overall Quality & Engagement

IMPORTANT: You are an advisory review assistant ONLY. You do NOT publish, approve, or reject content. You provide structured diagnostic feedback for human editors and authors.

Return ONLY a valid JSON object in this format:
{
  "overall_score": 85,
  "verdict_summary": "Constructive 1-2 sentence overall appraisal",
  "grammar_issues": [
    { "issue": "Description of issue", "suggestion": "Suggested correction" }
  ],
  "clarity_issues": [
    { "sentence": "Unclear sentence snippet", "problem": "Why it is confusing", "recommendation": "How to clarify" }
  ],
  "repetition_issues": [
    "Example of redundant phrases or repeated arguments..."
  ],
  "missing_info": [
    "Suggestion on missing background, citations, or data..."
  ],
  "content_safety": {
    "passed": true,
    "notes": "No hate speech, offensive terminology, or inappropriate material detected."
  },
  "recommendations": [
    "Key suggestion 1",
    "Key suggestion 2",
    "Key suggestion 3"
  ]
}`;

    const userPrompt = `Title: "${title || 'Untitled'}"
Content:
"""
${plainText}
"""`;

    try {
      const completion = await this.executeCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      return parseJSONFromResponse(completion.choices[0]?.message?.content || '{}');
    } catch (err) {
      this.handleAIError(err);
    }
  },

  /**
   * Standardized error handling for all AI operations
   */
  handleAIError(err) {
    console.error('[AI Service Error]:', err?.message || err);

    // Timeout
    if (err?.code === 'ETIMEDOUT' || err?.name === 'TimeoutError' || err?.message?.includes('timeout')) {
      const e = new Error('AI request timed out. The provider took too long to respond. You can retry or continue editing manually.');
      e.status = 504;
      throw e;
    }

    // Rate Limit / Quota
    if (err?.status === 429 || err?.message?.includes('rate limit') || err?.message?.includes('quota')) {
      const e = new Error('AI Assistant is currently unavailable: Rate limit or API credit quota reached. You can continue managing your content manually.');
      e.status = 429;
      e.isUnavailable = true;
      throw e;
    }

    // Authentication failure
    if (err?.status === 401 || err?.message?.includes('API key')) {
      const e = new Error('AI Assistant is currently unavailable: Invalid API key configuration. You can continue managing your content manually.');
      e.status = 503;
      e.isUnavailable = true;
      throw e;
    }

    // High Demand / Temporary Capacity Spike from Provider
    if (err?.status === 503 || err?.message?.includes('high demand') || err?.message?.includes('UNAVAILABLE') || err?.message?.includes('overloaded')) {
      const e = new Error('The AI model is temporarily experiencing high server demand from the provider. Please try again in a moment, or continue managing your content manually.');
      e.status = 503;
      e.isUnavailable = true;
      throw e;
    }

    // General fallback
    const fallback = new Error(err.message || 'AI Assistant is currently unavailable. You can continue managing your content manually.');
    fallback.status = err.status || 500;
    throw fallback;
  }
};

export default aiService;

