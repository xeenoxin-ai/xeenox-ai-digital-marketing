// Shared by the worker, tests and (copied into) the dashboard.
export const OUTCOMES = ['converted', 'interested', 'follow_up', 'not_interested', 'no_conversation'];
export const SKILLS = ['opening', 'discovery', 'pitch', 'objection_handling', 'closing', 'tone', 'listening'];
export const SKILL_LABELS = {
  opening: 'Opening & greeting',
  discovery: 'Asking questions / need discovery',
  pitch: 'Product pitch',
  objection_handling: 'Objection handling',
  closing: 'Closing & next step',
  tone: 'Tone & politeness',
  listening: 'Listening',
};
export const LEAD_STATUSES = ['new', 'contacted', 'interested', 'follow_up', 'won', 'lost'];
