'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Film, Bot, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { suggestMovieByMood } from '../services/geminiMoodService';

const PRESET_MOODS = [
  'Feeling sad but want an action movie to cheer up',
  'Mind-bending sci-fi thriller for a rainy night',
  'High-energy cyber heist with fast pacing',
  'Intense psychological drama with plot twists',
  'Nostalgic superhero adventure with epic battles',
];

export function MoodMatcher({ onAiMovieMatched, currentMatchedTitle, onClearAiMatch }) {
  const [moodInput, setMoodInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0); // 0 = idle, 1 = Gemini processing, 2 = TMDB handoff, 3 = complete
  const [resolvedTitle, setResolvedTitle] = useState('');
  const [modelSource, setModelSource] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleMatchMood = async (moodToUse) => {
    const prompt = moodToUse || moodInput;
    if (!prompt || !prompt.trim()) return;

    setIsLoading(true);
    setPipelineStep(1);
    setStatusMessage('Step 1: Contacting Google Gemini REST API to interpret contextual mood...');

    try {
      const result = await suggestMovieByMood(prompt);
      setResolvedTitle(result.title);
      setModelSource(result.source);

      setPipelineStep(2);
      setStatusMessage(`Step 2: Gemini recommended "${result.title}". Handing off to TMDB/OMDb Search API...`);

      setTimeout(() => {
        setPipelineStep(3);
        setIsLoading(false);
        setStatusMessage(`Successfully dispatched "${result.title}" to Media Discovery Engine.`);
        if (onAiMovieMatched) onAiMovieMatched(result.title);
      }, 400);

    } catch (err) {
      setIsLoading(false);
      setPipelineStep(0);
      setStatusMessage(err.message || 'Mood matcher encountered an issue.');
    }
  };

  const handleSelectChip = (preset) => {
    setMoodInput(preset);
    handleMatchMood(preset);
  };

  const handleClear = () => {
    setMoodInput('');
    setResolvedTitle('');
    setPipelineStep(0);
    setStatusMessage('');
    if (onClearAiMatch) onClearAiMatch();
  };

  return (
    <div className="w-full p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0F1015] via-[#14161F] to-[#0A0A0A] border border-[#222530] shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-cerulean/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-rose-neon/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cerulean to-rose-neon text-white shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              AI Mood Matcher
              <span className="text-[10px] font-mono tracking-wide uppercase px-2 py-0.5 rounded-full bg-cerulean/20 text-cerulean-light border border-cerulean/30">
                Gemini LLM Handoff
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Describe your current mood or setting, and Gemini LLM will synthesize the perfect cinematic match.
            </p>
          </div>
        </div>

        {/* Active AI Matched Title Pill */}
        {currentMatchedTitle && (
          <div className="flex items-center space-x-2 bg-rose-neon/15 border border-rose-neon/40 px-3 py-1.5 rounded-xl text-xs text-white">
            <Film className="w-4 h-4 text-rose-neon" />
            <span>AI Match: <strong className="text-rose-neon underline">{currentMatchedTitle}</strong></span>
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-white ml-1 font-bold"
              title="Reset to all movies"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Input & Action Row */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-2.5 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={moodInput}
            onChange={(e) => setMoodInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleMatchMood();
            }}
            placeholder="e.g. 'Feeling stressed and want an energetic superhero film' or 'Rainy night cyberpunk vibes'..."
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-[#2D3142] focus:border-rose-neon focus:ring-2 focus:ring-rose-neon/20 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all"
          />
        </div>

        <button
          type="button"
          onClick={() => handleMatchMood()}
          disabled={isLoading || !moodInput.trim()}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cerulean to-rose-neon hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Match Vibe</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Preset Mood Chips */}
      <div className="relative z-10 flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-medium text-gray-500 mr-1 flex items-center gap-1">
          <Bot className="w-3 h-3 text-cerulean-light" />
          Quick Vibes:
        </span>
        {PRESET_MOODS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectChip(preset)}
            disabled={isLoading}
            className="text-xs px-2.5 py-1 rounded-lg bg-[#0A0A0A]/60 hover:bg-[#1F2230] text-gray-300 hover:text-cerulean-light border border-[#222530] hover:border-cerulean/50 transition-colors disabled:opacity-50"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Pipeline Status Bar */}
      {(isLoading || statusMessage) && (
        <div className="mt-3.5 pt-3 border-t border-[#1F2230] flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 text-cerulean-light animate-spin" />
            ) : pipelineStep === 3 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="text-gray-300">{statusMessage}</span>
          </div>

          {modelSource && (
            <span className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-dark-900 border border-dark-700 text-cerulean-light">
              Engine: {modelSource}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default MoodMatcher;
