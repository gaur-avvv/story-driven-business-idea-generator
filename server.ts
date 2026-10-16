import express from 'express';
import cors from 'cors';
import path from 'path';

// Load .env.local for local development (no-op if the file is absent, e.g. on
// Render where env vars are injected by the platform). Node >= 20.12 built-in.
try {
  (process as any).loadEnvFile?.('.env.local');
} catch {
  /* .env.local not present — rely on platform-injected env vars */
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // ---------------------------------------------------------------------------
  // Health check (used by Render + the app's "engine status" indicator)
  // ---------------------------------------------------------------------------
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      serpapi: Boolean(process.env.SERPAPI_KEY),
      elevenlabs: Boolean(process.env.ELEVENLABS_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      janBaseUrl: process.env.JAN_BASE_URL || 'http://localhost:1337/v1',
      time: new Date().toISOString(),
    });
  });

  // ---------------------------------------------------------------------------
  // SerpApi — real-time web search (server holds the key; never exposed client)
  // ---------------------------------------------------------------------------
  app.post('/api/search', async (req, res) => {
    try {
      const { query, num = 8, type = 'search' } = req.body || {};
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'A search query is required.' });
      }
      const apiKey = process.env.SERPAPI_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'Search is not configured on the server.' });
      }

      const params = new URLSearchParams({
        engine: type === 'news' ? 'google_news' : 'google',
        q: query,
        num: String(Math.min(Math.max(Number(num) || 8, 1), 20)),
        api_key: apiKey,
      });

      const serpRes = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
      const data = await serpRes.json();

      if (!serpRes.ok) {
        return res.status(serpRes.status).json({ error: data.error || 'Search request failed.' });
      }

      // Normalize organic/news results into a compact citation list
      const organic = Array.isArray(data.organic_results) ? data.organic_results : [];
      const news = Array.isArray(data.news_results) ? data.news_results : [];
      const results = [...organic, ...news]
        .slice(0, 10)
        .map((r: any) => ({
          title: r.title || r.source || 'Untitled',
          uri: r.link || r.url,
          snippet: r.snippet || r.date || '',
        }))
        .filter((r: any) => r.uri);

      res.json({ results, answerBox: data.answer_box || null });
    } catch (err: any) {
      console.error('SerpApi search error:', err);
      res.status(500).json({ error: err.message || 'Search failed.' });
    }
  });

  // ---------------------------------------------------------------------------
  // ElevenLabs — text-to-speech (server holds the key; returns base64 audio)
  // ---------------------------------------------------------------------------
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, voiceId = 'JBFqnCBsd6RMkjVDRZzb' } = req.body || {};
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required.' });
      }
      const apiKey = process.env.ELEVENLABS_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'Voice narration is not configured on the server.' });
      }

      const modelId = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
      const ttsRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({
            text: text.slice(0, 2500),
            model_id: modelId,
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        }
      );

      if (!ttsRes.ok) {
        const errText = await ttsRes.text();
        console.error('ElevenLabs error:', ttsRes.status, errText);
        return res.status(ttsRes.status).json({ error: 'Narration request failed.' });
      }

      const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
      res.json({ audioBase64: audioBuffer.toString('base64'), format: 'mp3' });
    } catch (err: any) {
      console.error('TTS error:', err);
      res.status(500).json({ error: err.message || 'Narration failed.' });
    }
  });

  // ---------------------------------------------------------------------------
  // Jan.ai local status — lets the UI know whether local Gemma is reachable
  // ---------------------------------------------------------------------------
  app.get('/api/jan/status', async (_req, res) => {
    const base = (process.env.JAN_BASE_URL || 'http://localhost:1337/v1').replace(/\/$/, '');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const r = await fetch(`${base}/models`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!r.ok) {
        return res.json({ available: false, base });
      }
      const data = await r.json();
      res.json({ available: true, base, models: data.data || [] });
    } catch (_e) {
      res.json({ available: false, base });
    }
  });

  // Notion API proxy endpoint
  app.post('/api/notion/save', async (req, res) => {
    try {
      const { apiKey, parentId, isDatabase = true, idea } = req.body;

      if (!apiKey) {
        return res.status(400).json({ error: 'Notion API key is required.' });
      }
      if (!parentId) {
        return res.status(400).json({ error: 'Notion Parent ID / Database ID is required.' });
      }
      if (!idea) {
        return res.status(400).json({ error: 'Business idea data is required.' });
      }

      // Build Notion page properties & content blocks from the BusinessIdea shape.
      const title = (idea.idea || 'Untitled Business Idea').toString().slice(0, 2000);

      const heading = (text: string) => ({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: text } }] },
      });
      const paragraph = (text: string) => ({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: (text || '').slice(0, 2000) } }] },
      });
      const bullet = (text: string) => ({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: (text || '').slice(0, 2000) } }] },
      });

      const children: any[] = [];
      if (idea.marketInsight) {
        children.push(heading('Market Insight'), paragraph(idea.marketInsight));
      }
      if (idea.marketScarcity) {
        children.push(heading('Market Scarcity'), paragraph(idea.marketScarcity));
      }
      if (idea.corePrinciple) {
        children.push(heading('Core Principle'), paragraph(idea.corePrinciple));
      }
      if (idea.story) {
        children.push(heading('The Story'), paragraph(idea.story));
      }
      if (Array.isArray(idea.nextSteps) && idea.nextSteps.length) {
        children.push(heading('Execution Roadmap'), ...idea.nextSteps.map(bullet));
      }
      if (idea.swot) {
        children.push(heading('SWOT Analysis'));
        const quadrants: [string, string[] | undefined][] = [
          ['Strengths', idea.swot.strengths],
          ['Weaknesses', idea.swot.weaknesses],
          ['Opportunities', idea.swot.opportunities],
          ['Threats', idea.swot.threats],
        ];
        for (const [label, items] of quadrants) {
          if (Array.isArray(items) && items.length) {
            children.push({
              object: 'block',
              type: 'heading_3',
              heading_3: { rich_text: [{ type: 'text', text: { content: label } }] },
            });
            items.forEach((item) => children.push(bullet(item)));
          }
        }
      }
      if (Array.isArray(idea.sources) && idea.sources.length) {
        children.push(heading('Sources'));
        idea.sources.forEach((s: any) => children.push(bullet(`${s.title || 'Source'} — ${s.uri || ''}`)));
      }

      // Format request for Notion API
      const notionPayload: any = {
        parent: isDatabase
          ? { database_id: parentId }
          : { page_id: parentId },
        properties: {
          title: {
            title: [{ text: { content: title } }],
          },
        },
        children: children.slice(0, 100),
      };

      const notionResponse = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify(notionPayload),
      });

      const notionData = await notionResponse.json();

      if (!notionResponse.ok) {
        return res.status(notionResponse.status).json({
          error: notionData.message || 'Failed to save to Notion. Please check your API key and Parent/Database ID.',
          details: notionData,
        });
      }

      return res.json({ success: true, data: notionData });
    } catch (err: any) {
      console.error('Notion save error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error while saving to Notion.' });
    }
  });

  if (isProduction) {
    // Serve the built SPA from /dist (built by `npm run build`)
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback: any non-API GET returns index.html
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
          res.status(200).send('Story-Driven Business Idea Generator — build output not found. Run `npm run build` first.');
        }
      });
    });
  } else {
    // Dev: Vite server in middleware mode. Imported dynamically so the
    // production bundle never depends on `vite` (a devDependency) existing
    // at runtime.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}${isProduction ? ' (production)' : ' (dev)'}`);
  });
}

startServer();
