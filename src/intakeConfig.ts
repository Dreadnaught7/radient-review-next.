export type IntakeConfig = {
  key: string;
  name: string;
  kicker: string;
  package: string;
  priceLabel: string;
  intro: string;
  serviceLabel: string;
  servicePh: string;
  territoryLabel: string;
  territoryPh: string;
  outcomeLabel: string;
  outcomePh: string;
  signalsLabel: string;
  signalsPh: string;
  notesPh: string;
  stripe?: string;
};

export const intakeConfigs: Record<string, IntakeConfig> = {
  research: {
    key:'research', name:'Custom Research & Evidence Review', kicker:'CUSTOM RESEARCH', package:'Custom Research & Evidence Review — starting at $99', priceLabel:'Starting at $99 · scope confirmed before paid work begins', intro:'Give us the question, claim, decision, or evidence problem. We organize the source material, identify what is supported, what conflicts, what is missing, and what deserves the next look.', serviceLabel:'Question / research objective', servicePh:'What do you need answered, checked, compared, verified, or organized?', territoryLabel:'Relevant location / jurisdiction', territoryPh:'City, state, country, market, court, agency, or not location-specific', outcomeLabel:'Decision this should support', outcomePh:'What will you do differently once you have the answer?', signalsLabel:'Sources / evidence already available', signalsPh:'Links, records, documents, datasets, statements, screenshots, filings, notes, or other material.', notesPh:'Deadline, required format, known uncertainties, opposing claims, or anything we should preserve.'
  },
  content: {
    key:'content', name:'Content From Chaos', kicker:'CONTENT & COMMUNICATIONS', package:'Content From Chaos — $150', priceLabel:'$150 selected', stripe:'https://buy.stripe.com/00w28q9ri3qfcUc3NK0sU03', intro:'Turn rough notes, transcripts, screenshots, voice-memo text, old posts, scattered ideas, or unfinished material into clear public-facing content without flattening your voice.', serviceLabel:'What raw material do you have?', servicePh:'Notes, transcript, screenshots, old posts, draft, voice-memo text, ideas, photos, etc.', territoryLabel:'Audience / market', territoryPh:'Who is this content meant to reach?', outcomeLabel:'Content goal', outcomePh:'Sell, explain, promote, document, educate, recruit, build authority, etc.', signalsLabel:'Channels / formats wanted', signalsPh:'Website, Facebook, Instagram, TikTok, X, email, flyer, article, captions, etc.', notesPh:'Voice/tone, words to avoid, examples you like, calls to action, deadlines, or brand requirements.'
  },
  commercial: {
    key:'commercial', name:'Commercial Intelligence', kicker:'COMMERCIAL INTELLIGENCE', package:'50 opportunities — $500', priceLabel:'$500 selected', stripe:'https://buy.stripe.com/5kQdR8dHy3qf4nG9840sU07', intro:'Define the market you want. We research evidence-led opportunities, why each account fits, the current signal, decision-maker route, and practical outreach angle.', serviceLabel:'What do you sell?', servicePh:'Describe the service or product you want opportunities for.', territoryLabel:'Territory / service area', territoryPh:'Cities, states, regions, or national.', outcomeLabel:'Ideal customer / account', outcomePh:'Facility type, company size, contract profile, buyer type, or other fit criteria.', signalsLabel:'Priority buying signals', signalsPh:'Expansion, opening, hiring, relocation, procurement, switching need, facility change, funding, etc.', notesPh:'Exclusions, minimum deal size, preferred decision makers, lead rules, and any qualification standard.'
  },
  ai: {
    key:'ai', name:'AI Compatibility & Readiness Audit', kicker:'AI READINESS', package:'AI Compatibility & Readiness Audit — $1,500', priceLabel:'$1,500 selected', stripe:'https://buy.stripe.com/5kQ9AS9rigd1cUc3NK0sU04', intro:'We map where AI can improve your operation, where it should not be trusted, what data or integration gaps exist, and what should remain under human control.', serviceLabel:'Business / workflow to assess', servicePh:'What operation, department, or workflow are you considering AI for?', territoryLabel:'Team / operating environment', territoryPh:'Locations, remote/on-site setup, number of users, departments, or customer environment.', outcomeLabel:'What improvement do you want?', outcomePh:'Save time, reduce admin, improve intake, research, customer service, routing, reporting, etc.', signalsLabel:'Current tools / workflow pain', signalsPh:'CRM, email, spreadsheets, scheduling, ticketing, databases, AI tools, repetitive work, bottlenecks.', notesPh:'Sensitive data, compliance concerns, human-approval requirements, systems that cannot change, or prior AI attempts.'
  },
  investigation: {
    key:'investigation', name:'Investigation Evidence Mapping', kicker:'EVIDENCE & INVESTIGATIONS', package:'Investigation Evidence Mapping — scoped engagement', priceLabel:'Scoped after brief review · no payment due at submission', intro:'Turn surveillance, records, interviews, digital evidence, public-source findings, and case notes into a unified chronology, corroboration map, contradiction map, evidence-gap register, and action queue.', serviceLabel:'Case / investigation type', servicePh:'Insurance, litigation support, workplace, fraud, background, internal investigation, civil matter, etc.', territoryLabel:'Jurisdiction / location', territoryPh:'State, court, claim jurisdiction, or operating region.', outcomeLabel:'Investigative objective', outcomePh:'What question must the evidence help answer?', signalsLabel:'Evidence already available', signalsPh:'Surveillance, interviews, records, photos/video, social media, digital forensics, statements, medical or financial records, etc.', notesPh:'Privilege/confidentiality needs, chain-of-custody constraints, deadlines, counsel/adjuster audience, and desired deliverable.'
  },
  entertainment: {
    key:'entertainment', name:'Entertainment & Talent Intelligence', kicker:'ENTERTAINMENT INTELLIGENCE', package:'Resonance Entertainment Intelligence — $2,500', priceLabel:'$2,500 selected', stripe:'https://buy.stripe.com/eVqfZgavm4uj5rK2JG0sU06', intro:'A focused intelligence brief around a talent, project, IP, audience, brand, development, representation, financing, or positioning decision.', serviceLabel:'Talent / project / IP / decision', servicePh:'What exactly are we evaluating?', territoryLabel:'Market / platform / territory', territoryPh:'Film, TV, streaming, music, digital, live, regional, national, global, etc.', outcomeLabel:'Decision this should support', outcomePh:'Represent, develop, finance, package, cast, acquire, partner, position, market, or pass.', signalsLabel:'Signals / comparables to examine', signalsPh:'Audience, cultural momentum, credits, comps, rights, financing, brand fit, platform signals, market demand, etc.', notesPh:'Known risks, rights questions, attachment status, budget range, target stakeholders, or specific material to review.'
  }
};