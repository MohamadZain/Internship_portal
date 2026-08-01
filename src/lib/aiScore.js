const normalizeScore = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(100, Math.round(parsed)));
    }
  }

  return null;
};

export function getCoverLetterAiScore(application) {
  if (!application || typeof application !== 'object') return null;

  const candidates = [
    application.coverLetterAIScore,
    application.cover_letter_ai_score,
    application.aiScore,
    application.ai_score,
    application.ai_score_percentage,
    application.ai_usage_score,
  ];

  for (const candidate of candidates) {
    const score = normalizeScore(candidate);
    if (score !== null) return score;
  }

  const nestedScore = application.ai_detection?.score;
  const nestedNormalizedScore = normalizeScore(nestedScore);
  return nestedNormalizedScore ?? null;
}

export function getAiUsageTone(score) {
  if (score === null || score === undefined) return 'neutral';
  if (score < 20) return 'low';
  if (score < 50) return 'medium';
  if (score < 80) return 'high';
  return 'very-high';
}

export function getAiUsageBadgeClasses(score) {
  switch (getAiUsageTone(score)) {
    case 'low':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    case 'medium':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20';
    case 'high':
      return 'bg-rose-50 text-rose-700 ring-rose-600/20';
    case 'very-high':
      return 'bg-rose-600 text-white ring-rose-900/50';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-600/20';
  }
}
