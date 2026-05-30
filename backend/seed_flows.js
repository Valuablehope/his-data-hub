const { poolPromise } = require('./db');

const sampleHtml = `
<style>
/* ─── SIDEBAR ───────────────────────────────────── */
.flow-viewer-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: calc(100vh - 64px);
  overflow-y: auto;
  background: var(--slate-900);
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: var(--slate-700) transparent;
}

.sidebar-brand {
  padding: 32px 24px 24px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.sidebar-brand-system {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--primary-red);
  margin-bottom: 8px;
}

.sidebar-brand-title {
  font-family: var(--font-display, Georgia, serif);
  font-size: 22px;
  color: #fff;
  line-height: 1.2;
}

.sidebar-brand-sub {
  font-size: 12px;
  color: var(--slate-300);
  margin-top: 6px;
  line-height: 1.4;
}

.sidebar-part {
  padding: 20px 24px 8px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--slate-400);
}

.sidebar-part:not(:first-of-type) {
  border-top: 1px solid rgba(255,255,255,.06);
  margin-top: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 24px;
  font-size: 13px;
  color: var(--slate-300);
  text-decoration: none;
  transition: all .18s ease;
  border-left: 3px solid transparent;
  cursor: pointer;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255,255,255,.05);
  border-left-color: var(--primary-red);
}

.nav-item.active {
  color: #fff;
  background: rgba(227, 0, 15, 0.1);
  border-left-color: var(--primary-red);
  font-weight: 500;
}

.nav-num {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--primary-red);
  min-width: 28px;
}

/* ─── MAIN ───────────────────────────────────────── */
.flow-viewer-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: calc(100vh - 64px);
  background: var(--bg-color);
}

.hero {
  background: linear-gradient(135deg, var(--slate-800) 0%, var(--slate-900) 60%, var(--slate-950) 100%);
  padding: 80px 64px 72px;
  position: relative;
  overflow: hidden;
}

.hero-content { position: relative; z-index: 1; max-width: 860px; }

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(227, 0, 15,.12);
  border: 1px solid rgba(227, 0, 15,.25);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--primary-red);
  margin-bottom: 28px;
}

.hero h1 {
  font-family: var(--font-display, Georgia, serif);
  font-size: clamp(32px, 4vw, 52px);
  color: #fff;
  line-height: 1.15;
  margin-bottom: 16px;
  letter-spacing: -.02em;
}

.hero-sub {
  font-size: 16px;
  color: var(--slate-200);
  max-width: 620px;
  line-height: 1.65;
  margin-bottom: 40px;
  font-weight: 300;
}

.hero-meta {
  display: flex;
  gap: 0;
  flex-wrap: wrap;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: var(--radius-md);
  overflow: hidden;
  max-width: 620px;
}

.hero-meta-item {
  flex: 1;
  min-width: 120px;
  padding: 14px 20px;
  border-right: 1px solid rgba(255,255,255,.08);
}

.hero-meta-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--primary-red);
  margin-bottom: 4px;
}

.hero-meta-value {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
}

.content-wrap {
  padding: 56px 64px 80px;
  max-width: 988px;
}

.part-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 64px 0 40px;
  padding: 28px 36px;
  background: var(--slate-800);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

.part-number {
  font-family: var(--font-display, Georgia, serif);
  font-size: 48px;
  color: rgba(255,255,255,.12);
  line-height: 1;
  flex-shrink: 0;
}

.part-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--primary-red);
  margin-bottom: 6px;
}

.part-title {
  font-family: var(--font-display, Georgia, serif);
  font-size: 24px;
  color: #fff;
  line-height: 1.25;
}

.section {
  margin-bottom: 56px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.section-num {
  width: 40px; height: 40px;
  border-radius: var(--radius-sm);
  background: var(--slate-800);
  color: #fff;
  font-family: var(--font-mono, monospace);
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  font-family: var(--font-display, Georgia, serif);
  font-size: 26px;
  color: var(--text-primary);
  line-height: 1.25;
  letter-spacing: -.01em;
}

.section-sub {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.prose {
  font-size: 15px;
  line-height: 1.75;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.infobox {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  border-radius: var(--radius-md);
  padding: 18px 22px;
  margin: 20px 0;
  border-left: 4px solid;
}

.infobox-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 1px;
}

.infobox-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
}

.infobox.blue { background: rgba(59, 130, 246, 0.1); border-color: #3B82F6; color: #1E40AF; }
.infobox.amber { background: rgba(245, 158, 11, 0.1); border-color: #F59E0B; color: #92400E; }
.infobox.green { background: rgba(16, 185, 129, 0.1); border-color: #10B981; color: #065F46; }

.flow {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 24px 0;
}

.flow-item {
  display: flex;
  gap: 0;
  position: relative;
}

.flow-spine {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 56px;
  flex-shrink: 0;
}

.flow-dot {
  width: 14px; height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 18px;
  z-index: 1;
  background: var(--slate-400);
  box-shadow: 0 0 0 3px var(--bg-color);
}

.flow-line {
  width: 2px;
  flex: 1;
  min-height: 20px;
  background: var(--border-color);
}

.flow-card {
  flex: 1;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 18px 22px;
  margin: 8px 0;
}

.flow-card-actor {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  margin-bottom: 6px;
  color: var(--primary-red);
}

.flow-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.flow-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.tag {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(0,0,0,0.05);
  color: var(--text-secondary);
}

.tag.badge-blue { background: rgba(59, 130, 246, 0.1); color: #2563EB; }
.tag.badge-amber { background: rgba(245, 158, 11, 0.1); color: #D97706; }
.tag.badge-purple { background: rgba(139, 92, 246, 0.1); color: #7C3AED; }
.tag.badge-green { background: rgba(16, 185, 129, 0.1); color: #059669; }

.section-rule {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 48px 0;
}

.table-wrap {
  overflow-x: auto;
  margin: 20px 0;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

thead tr { background: var(--slate-800); }

thead th {
  padding: 12px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--slate-300);
}

tbody tr { border-bottom: 1px solid var(--border-color); }
tbody td { padding: 11px 16px; color: var(--text-secondary); }

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin: 20px 0;
}

.role-card {
  border-radius: var(--radius-md);
  padding: 18px 20px;
  border: 1px solid var(--border-color);
  background: var(--surface-color);
}

.role-card h5 {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.role-card ul {
  list-style: none;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.score-widget {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  margin: 20px 0;
}

.score-widget h4 { font-size: 14px; font-weight: 600; margin-bottom: 16px; }

.score-track {
  position: relative;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #F0997B 0%, #FAC775 40%, #9FE1CB 65%, #5DCAA5 100%);
  margin-bottom: 8px;
}

.score-outcomes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
}

.score-outcome {
  border-radius: var(--radius-sm);
  padding: 12px 16px;
}

.outcome-pass { background: rgba(16, 185, 129, 0.1); color: #065F46; }
.outcome-fail { background: rgba(239, 68, 68, 0.1); color: #991B1B; }

.id-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 20px 0;
}

.id-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
}

.id-card code {
  display: inline-block;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  background: rgba(0,0,0,0.05);
  padding: 3px 10px;
  border-radius: 4px;
}
</style>

<div style="display: flex; min-height: 100vh;">
<!-- SIDEBAR -->
<nav class="flow-viewer-sidebar" role="navigation">
  <div class="sidebar-brand">
    <div class="sidebar-brand-system">PHENICS · Lebanon</div>
    <div class="sidebar-brand-title">Hospital Deliveries</div>
    <div class="sidebar-brand-sub">Complete Operational Documentation v1.0</div>
  </div>

  <div class="sidebar-part">Part 1 — Data Flow</div>
  <a class="nav-item active" href="#s1"><span class="nav-num">01</span>System Overview</a>
  <a class="nav-item" href="#s2"><span class="nav-num">02</span>Overall Data Flow</a>
  <a class="nav-item" href="#s3"><span class="nav-num">03</span>Pregnancy Package</a>
  <a class="nav-item" href="#s4"><span class="nav-num">04</span>ANC Visits</a>
  <a class="nav-item" href="#s5"><span class="nav-num">05</span>Eligibility Score</a>
  <a class="nav-item" href="#s6"><span class="nav-num">06</span>Hospital Activation</a>
  <a class="nav-item" href="#s7"><span class="nav-num">07</span>Delivery &amp; Discharge</a>
  <a class="nav-item" href="#s8"><span class="nav-num">08</span>Roles &amp; Responsibilities</a>
</nav>

<!-- MAIN -->
<main class="flow-viewer-main">
  <!-- HERO -->
  <div class="hero">
    <div class="hero-content">
      <div class="hero-tag">National Health Information System · Lebanon</div>
      <h1>PHENICS<br><em>Hospital Deliveries Program</em></h1>
      <p class="hero-sub">Complete operational documentation covering the end-to-end data flow for the maternal hospital deliveries service.</p>
      <div class="hero-meta">
        <div class="hero-meta-item">
          <div class="hero-meta-label">System</div>
          <div class="hero-meta-value">PHENICS</div>
        </div>
        <div class="hero-meta-item">
          <div class="hero-meta-label">Program</div>
          <div class="hero-meta-value">Hospital Deliveries</div>
        </div>
        <div class="hero-meta-item">
          <div class="hero-meta-label">Version</div>
          <div class="hero-meta-value">1.0</div>
        </div>
        <div class="hero-meta-item">
          <div class="hero-meta-label">Date</div>
          <div class="hero-meta-value">May 2026</div>
        </div>
      </div>
    </div>
  </div>

  <!-- CONTENT -->
  <div class="content-wrap">
    <div class="part-header">
      <div class="part-number">1</div>
      <div>
        <div class="part-label">Part One</div>
        <div class="part-title">Hospital Deliveries — System Data Flow</div>
      </div>
    </div>

    <!-- S1: Overview -->
    <section class="section" id="s1">
      <div class="section-header">
        <div class="section-num">01</div>
        <div>
          <div class="section-title">System Overview</div>
          <div class="section-sub">Purpose and scope of the Hospital Deliveries module</div>
        </div>
      </div>
      <p class="prose">PHENICS (Primary Health Care Electronic Network Information and Communication System) is Lebanon's National Health Information System. The <strong>Hospital Deliveries</strong> module governs the end-to-end management of pregnant women from pregnancy registration through delivery and postnatal care.</p>
      <div class="infobox blue">
        <div class="infobox-icon">ℹ</div>
        <div>
          <div class="infobox-title">Scope of this document</div>
          <div class="infobox-body">This document covers the operational flow for hospital deliveries and the associated file-checking procedures for the Health Field Officer (HFO).</div>
        </div>
      </div>
    </section>

    <hr class="section-rule">

    <!-- S2: Data Flow -->
    <section class="section" id="s2">
      <div class="section-header">
        <div class="section-num">02</div>
        <div>
          <div class="section-title">Overall Data Flow</div>
          <div class="section-sub">End-to-end journey across three primary actors</div>
        </div>
      </div>

      <div class="flow">
        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:#2563EB"></div>
            <div class="flow-line"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:#2563EB">Stage 1 · PHCC</div>
            <h4>Pregnancy Detection &amp; Package Activation</h4>
            <p>When pregnancy is confirmed, the Pregnancy Package is activated in PHENICS.</p>
            <div class="flow-tags">
              <span class="tag badge-blue">Pregnancy Package</span>
              <span class="tag badge-amber">Gestational age — mandatory</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:#059669"></div>
            <div class="flow-line"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:#059669">Stage 5 · System</div>
            <h4>Eligibility Score Calculation</h4>
            <p>PHENICS calculates the composite eligibility score. The patient must achieve a score of <strong>≥ 21</strong> to be eligible.</p>
            <div class="flow-tags">
              <span class="tag badge-green">Score ≥ 21 → Eligible</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</main>
</div>
`;

async function seedFlow() {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Title', 'Hospital Deliveries')
            .input('Subtitle', 'Complete Operational Documentation')
            .input('SystemName', 'PHENICS')
            .input('Program', 'Hospital Deliveries')
            .input('Version', '1.0')
            .input('DocumentDate', 'May 2026')
            .input('HtmlContent', sampleHtml)
            .query(`
                INSERT INTO DataFlows (Title, Subtitle, SystemName, Program, Version, DocumentDate, HtmlContent)
                VALUES (@Title, @Subtitle, @SystemName, @Program, @Version, @DocumentDate, @HtmlContent)
            `);
        console.log("Seeded sample flow successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seedFlow();
