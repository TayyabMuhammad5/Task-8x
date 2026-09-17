#!/usr/bin/env node
'use strict';

/**
 * capture-log.js — Antigravity IDE lifecycle hook script
 * 
 * Wired to the "Stop" hook event. Reads the session transcript (JSONL),
 * extracts USER_INPUT / PLANNER_RESPONSE pairs, and appends them to
 * .agent-logs/<session-file>.md in the format required by the 8x assignment.
 *
 * Input  (stdin):  JSON hook payload with transcriptPath, conversationId, etc.
 * Output (stdout): JSON object — { "decision": "allow" }
 */

const fs   = require('fs');
const path = require('path');

// ─── Helpers ────────────────────────────────────────────────────────────────

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
  });
}

/**
 * Strip system-injected XML wrappers, keep only the human-authored text.
 */
function extractPrompt(raw) {
  if (!raw) return '';
  let text = raw
    .replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, '')
    .replace(/<USER_SETTINGS_CHANGE>[\s\S]*?<\/USER_SETTINGS_CHANGE>/g, '')
    .replace(/<\/?USER_REQUEST>/g, '');
  return text.trim();
}

function extractResponse(raw) {
  return (raw || '').trim();
}

function resolveModelName(name) {
  if (!name || name === 'auto') return 'claude-opus-4.6-thinking';
  return name;
}

function fmtTimestamp(iso) {
  if (!iso) return new Date().toISOString();
  return iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z';
}

/** "2026-09-17T16:00:25Z" → "2026-09-17_16-00-25" */
function dateSlug(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return [
    d.getUTCFullYear(),
    p(d.getUTCMonth() + 1),
    p(d.getUTCDate()),
  ].join('-') + '_' + [
    p(d.getUTCHours()),
    p(d.getUTCMinutes()),
    p(d.getUTCSeconds()),
  ].join('-');
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  try {
    const payload = JSON.parse(await readStdin());

    const conversationId = payload.conversationId || 'unknown';
    const model          = resolveModelName(payload.modelName);
    const workspacePath  = (payload.workspacePaths || [])[0] || path.resolve(__dirname, '..', '..');
    const transcriptPath = payload.transcriptPath || '';

    // Prefer the untruncated transcript
    const fullPath = transcriptPath.replace(/transcript\.jsonl$/, 'transcript_full.jsonl');
    const actualPath = fs.existsSync(fullPath) ? fullPath : transcriptPath;

    if (!actualPath || !fs.existsSync(actualPath)) {
      process.stdout.write(JSON.stringify({ decision: 'allow' }));
      return;
    }

    // ── Parse transcript ──────────────────────────────────────────────────
    const lines   = fs.readFileSync(actualPath, 'utf8').split(/\r?\n/).filter(Boolean);
    const entries = [];
    for (const line of lines) {
      try { entries.push(JSON.parse(line)); } catch { /* skip malformed */ }
    }

    const prompts   = entries.filter((e) => e.type === 'USER_INPUT');
    const responses = entries.filter((e) => e.type === 'PLANNER_RESPONSE');

    if (prompts.length === 0) {
      process.stdout.write(JSON.stringify({ decision: 'allow' }));
      return;
    }

    // ── Pair each prompt with its LAST response ───────────────────────────
    const pairs = [];
    for (let i = 0; i < prompts.length; i++) {
      const cur  = prompts[i];
      const next = prompts[i + 1];
      const inRange = responses.filter(
        (r) => r.step_index > cur.step_index && (!next || r.step_index < next.step_index),
      );
      pairs.push({
        num:      i + 1,
        prompt:   cur,
        response: inRange.length ? inRange[inRange.length - 1] : null,
      });
    }

    // ── State tracking (only append new pairs) ────────────────────────────
    const logDir = path.join(workspacePath, '.agent-logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const stateFile = path.join(logDir, '.capture-state.json');
    let state = {};
    try { state = JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch { /* first run */ }

    const key            = conversationId;
    const lastPairIndex  = (state[key] && state[key].lastPairIndex) || 0;
    const newPairs       = pairs.filter((p) => p.num > lastPairIndex);

    if (newPairs.length === 0) {
      process.stdout.write(JSON.stringify({ decision: 'allow' }));
      return;
    }

    // ── Determine file path ───────────────────────────────────────────────
    const shortId        = conversationId.substring(0, 8);
    const firstTime      = fmtTimestamp(prompts[0].created_at);
    const lastTime       = fmtTimestamp(prompts[prompts.length - 1].created_at);
    const dateStr        = firstTime.substring(0, 10);
    const logFileName    = `${dateSlug(firstTime)}_${shortId}.md`;
    const logFilePath    = path.join(logDir, logFileName);

    // ── Build / update file ───────────────────────────────────────────────
    const header = [
      '---',
      `session_id: ${conversationId}`,
      `date: ${dateStr}`,
      `author: TAYYAB`,
      `model: ${model}`,
      `tool: antigravity-ide`,
      `project: Task-8x`,
      `total_exchanges: ${pairs.length}`,
      `first_prompt_time: ${firstTime}`,
      `last_prompt_time: ${lastTime}`,
      '---',
      '',
      `# Session Log - ${dateStr}`,
      '',
      `Session: \`${shortId}\` | Project: \`Task-8x\` | Author: \`TAYYAB\``,
      '',
      '---',
      '',
    ].join('\n');

    // Collect existing entry text (everything after the header)
    let existingBody = '';
    if (fs.existsSync(logFilePath)) {
      const existing = fs.readFileSync(logFilePath, 'utf8');
      // Header ends after the third "---" line
      let dashCount = 0;
      const existingLines = existing.split('\n');
      let bodyStart = 0;
      for (let i = 0; i < existingLines.length; i++) {
        if (existingLines[i].trim() === '---') {
          dashCount++;
          if (dashCount === 3) { bodyStart = i + 1; break; }
        }
      }
      existingBody = existingLines.slice(bodyStart).join('\n');
    }

    // Format new entries
    let newText = '';
    for (const pair of newPairs) {
      const pTime = fmtTimestamp(pair.prompt.created_at);
      const pText = extractPrompt(pair.prompt.content);

      newText += `\n[LOG_ENTRY type=PROMPT num=${pair.num} session=${shortId}]\n`;
      newText += `timestamp: ${pTime}\n`;
      newText += `model: ${model}\n\n`;
      newText += `${pText}\n\n`;

      if (pair.response) {
        const rTime = fmtTimestamp(pair.response.created_at);
        const rText = extractResponse(pair.response.content);

        newText += `\n[LOG_ENTRY type=RESPONSE num=${pair.num} session=${shortId}]\n`;
        newText += `timestamp: ${rTime}\n`;
        newText += `model: ${model}\n\n`;
        newText += `${rText}\n\n`;
      }
    }

    fs.writeFileSync(logFilePath, header + existingBody + newText, 'utf8');

    // ── Persist state ─────────────────────────────────────────────────────
    state[key] = { lastPairIndex: pairs[pairs.length - 1].num, logFileName };
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');

    process.stdout.write(JSON.stringify({ decision: 'allow' }));
  } catch (err) {
    // Never block the agent — log error and allow stop
    try {
      const errPath = path.join(
        process.cwd(), '..', '.agent-logs', 'capture-errors.log',
      );
      fs.mkdirSync(path.dirname(errPath), { recursive: true });
      fs.appendFileSync(errPath, `[${new Date().toISOString()}] ${err.stack || err}\n`);
    } catch { /* swallow */ }
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
  }
}

main();
