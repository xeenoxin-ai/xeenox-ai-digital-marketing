// Local development only: a stand-in for Workers AI when wrangler dev runs
// without Cloudflare access (set FAKE_AI=1 in .dev.vars). Never used in production.
let n = 0;
export const fakeAI = {
  async run(model, input) {
    if (model.includes('whisper')) {
      n++;
      const line = input.task === 'translate' ? `Line ${n} in English` : `Line ${n}`;
      return { text: line, segments: [{ start: 0, end: 2, text: line }], transcription_info: { language: 'en' } };
    }
    if (input.response_format?.json_schema?.properties?.tip) return { response: { tip: 'Ask which day suits them for the service.', kind: 'tip' } };
    const props = input.response_format?.json_schema?.properties || {};
    if (props.speakers) return { response: { speakers: [], language: 'en', summary: 'Fake analysis for local testing.', outcome: 'interested', conversion_chance: 55, lead_intent: '', sentiment: 'positive', skills: { opening: 7, discovery: 6, pitch: 7, objection_handling: 5, closing: 6, tone: 8, listening: 7 }, overall_score: 66, script_adherence: { score: 70, followed: ['Greet'], missed: ['Ask for booking'] }, objections: [], strengths: ['Polite'], improvements: ['Ask for the booking'], red_flags: [], next_action: 'Call back tomorrow', follow_up_date: '', key_moments: [] } };
    return { response: { outcome: 'interested', conversion_chance: 50, sentiment: 'positive', summary: 'Quick fake verdict.', next_action: '' } };
  },
};
