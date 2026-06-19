const { poolPromise } = require('./db');

const fullHtml = `
<style>
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .5; transform: scale(.8); }
}
.flow-container-wrap .hero-tag-dot { animation: pulse-dot 2s ease-in-out infinite; }

.flow-container-wrap .section-num.role    { background: var(--teal-600); font-size: 10px; }
.flow-container-wrap .section-num.flow-tag { background: var(--blue-600); font-size: 10px; }

.flow-container-wrap .h3 {
  font-size: 15px; font-weight: 700; color: var(--slate-700);
  margin: 20px 0 10px; display: flex; align-items: center; gap: 8px;
}
.flow-container-wrap .h3::before {
  content: ''; display: inline-block; width: 3px; height: 14px;
  background: var(--teal-500); border-radius: 2px; flex-shrink: 0;
}

.flow-container-wrap .doc-list {
  list-style: none; margin: 12px 0 16px;
  display: flex; flex-direction: column; gap: 8px; padding-left: 0;
}
.flow-container-wrap .doc-list li {
  font-size: 14px; color: var(--slate-600);
  padding-left: 20px; position: relative; line-height: 1.6;
}
.flow-container-wrap .doc-list li::before {
  content: '\\B7'; position: absolute; left: 6px;
  color: var(--teal-500); font-weight: 700;
}
.flow-container-wrap .doc-list li strong { color: var(--slate-800); font-weight: 600; }

.flow-container-wrap .stat-strip {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px; margin: 24px 0;
}
.flow-container-wrap .stat-item {
  background: #fff; border: 1px solid var(--slate-200);
  border-radius: var(--radius-md); padding: 16px 18px; text-align: center;
}
.flow-container-wrap .stat-num {
  font-family: var(--font-display); font-size: 36px;
  color: var(--teal-600); line-height: 1; margin-bottom: 6px;
}
.flow-container-wrap .stat-label { font-size: 12px; color: var(--slate-400); line-height: 1.4; }

.flow-container-wrap .org-chart { margin: 28px 0; font-size: 13px; }
.flow-container-wrap .org-top { display: flex; justify-content: center; margin-bottom: 0; }
.flow-container-wrap .org-node {
  border-radius: var(--radius-md); padding: 14px 22px;
  text-align: center; position: relative; min-width: 160px;
}
.flow-container-wrap .org-node-title {
  font-size: 11px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; margin-bottom: 4px;
}
.flow-container-wrap .org-node-sub { font-size: 11px; opacity: .75; line-height: 1.4; }
.flow-container-wrap .org-node.hc   { background: var(--slate-800); color: #fff; }
.flow-container-wrap .org-node.hims { background: var(--teal-700);  color: #fff; }
.flow-container-wrap .org-node.tm   { background: var(--teal-500);  color: #fff; }
.flow-container-wrap .org-node.off  { background: var(--teal-100);  color: var(--teal-800); border: 1px solid var(--teal-300); }
.flow-container-wrap .org-node.dhpm { background: var(--blue-100);  color: var(--blue-800); border: 1px solid rgba(24,95,165,.2); }
.flow-container-wrap .org-node.base { background: var(--purple-100); color: var(--purple-600); border: 1px solid rgba(83,74,183,.2); }

.flow-container-wrap .org-connector {
  display: flex; justify-content: center; align-items: center; height: 32px;
}
.flow-container-wrap .org-connector-line { width: 2px; height: 100%; background: var(--slate-300); }
.flow-container-wrap .org-branch {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 0;
}
.flow-container-wrap .org-branch-col {
  display: flex; flex-direction: column; align-items: center; gap: 0;
}
.flow-container-wrap .org-branch-label {
  font-size: 10px; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: var(--slate-400); margin-bottom: 10px; text-align: center;
}

.flow-container-wrap .resp-card {
  background: #fff; border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg); overflow: hidden; margin: 20px 0; transition: box-shadow .2s;
}
.flow-container-wrap .resp-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,.07); }
.flow-container-wrap .resp-card-header {
  padding: 20px 26px; display: flex; align-items: center; gap: 16px;
}
.flow-container-wrap .resp-card-icon {
  width: 46px; height: 46px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-weight: 700; font-size: 13px;
  color: #fff; flex-shrink: 0;
}
.flow-container-wrap .resp-card-icon.hims   { background: var(--teal-700); }
.flow-container-wrap .resp-card-icon.tm     { background: var(--teal-500); }
.flow-container-wrap .resp-card-icon.off-co { background: var(--blue-600); }
.flow-container-wrap .resp-card-icon.off-ba { background: var(--purple-600); }
.flow-container-wrap .resp-card-name {
  font-family: var(--font-display); font-size: 20px; color: var(--slate-900);
}
.flow-container-wrap .resp-card-role {
  font-size: 12px; color: var(--slate-400); margin-top: 3px; font-family: var(--font-mono);
}
.flow-container-wrap .resp-card-body { padding: 4px 26px 22px; }

.flow-container-wrap .mgmt-layers { display: flex; flex-direction: column; gap: 10px; margin: 20px 0; }
.flow-container-wrap .mgmt-layer {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px; border-radius: var(--radius-md); border-left: 4px solid;
}
.flow-container-wrap .mgmt-layer-num {
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  opacity: .6; flex-shrink: 0; min-width: 24px;
}
.flow-container-wrap .mgmt-layer-title { font-size: 14px; font-weight: 600; flex: 1; }
.flow-container-wrap .mgmt-layer-note { font-size: 12px; opacity: .75; flex-shrink: 0; }
.flow-container-wrap .mgmt-layer.l1 { background: var(--teal-50);    border-color: var(--teal-600); color: var(--teal-800); }
.flow-container-wrap .mgmt-layer.l2 { background: var(--blue-100);   border-color: var(--blue-600); color: var(--blue-800); }
.flow-container-wrap .mgmt-layer.l3 { background: var(--purple-100); border-color: var(--purple-600); color: var(--purple-600); }

.flow-container-wrap .doc-footer {
  padding: 32px 64px; border-top: 1px solid var(--slate-200);
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--slate-400);
}
.flow-container-wrap .doc-footer-brand {
  font-family: var(--font-display); font-size: 14px; color: var(--teal-700);
}

.flow-container-wrap .update-banner {
  background: linear-gradient(135deg,#fffbeb,#fef3c7);
  border: 1px solid #f59e0b; border-radius: var(--radius-lg);
  padding: 18px 22px; margin: 0 0 32px; display: flex; gap: 14px; align-items: flex-start;
}
.flow-container-wrap .update-banner-icon {
  font-size: 22px; flex-shrink: 0; margin-top: 2px;
}
.flow-container-wrap .update-banner-title {
  font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 6px; letter-spacing: .02em;
}
.flow-container-wrap .update-banner-list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 4px;
}
.flow-container-wrap .update-banner-list li {
  font-size: 13px; color: #78350f; padding-left: 16px; position: relative;
}
.flow-container-wrap .update-banner-list li::before {
  content: '\\2714'; position: absolute; left: 0;
  color: #d97706; font-size: 11px; top: 1px;
}
</style>

<div class="flow-container-wrap">

<!-- ═══════════════════════════════════════════ SIDEBAR -->
<nav class="sidebar" role="navigation" aria-label="Document navigation">
  <div class="sidebar-brand">
    <div class="sidebar-brand-system">HIS Team &middot; Lebanon Mission</div>
    <div class="sidebar-brand-title">Roles, Responsibilities &amp; Data Flows</div>
    <div class="sidebar-brand-sub">Internal Team Documentation v1.1</div>
  </div>

  <div class="sidebar-part">Part 1 &mdash; Team Structure</div>
  <a class="nav-item active" href="#s1"><span class="nav-num">01</span>Overview</a>
  <a class="nav-item" href="#s2"><span class="nav-num">02</span>Org Chart &amp; Distribution</a>
  <a class="nav-item" href="#s3"><span class="nav-num">03</span>Management Lines</a>

  <div class="sidebar-part">Part 2 &mdash; Roles &amp; Responsibilities</div>
  <a class="nav-item" href="#r1"><span class="nav-num">R1</span>HIMS</a>
  <a class="nav-item" href="#r2"><span class="nav-num">R2</span>HIS Team Manager</a>
  <a class="nav-item" href="#r3"><span class="nav-num">R3</span>HIS Officers &mdash; Coordination</a>
  <a class="nav-item" href="#r4"><span class="nav-num">R4</span>HIS Officers &mdash; Bases</a>
  <a class="nav-item" href="#r5"><span class="nav-num">R5</span>Continuity &amp; Absence</a>

  <div class="sidebar-part">Part 3 &mdash; Data Flows</div>
  <a class="nav-item" href="#f1"><span class="nav-num">F1</span>Programmatic Reporting</a>
  <a class="nav-item" href="#f2"><span class="nav-num">F2</span>AIMS &amp; Activity Info</a>
  <a class="nav-item" href="#f3"><span class="nav-num">F3</span>MHPSS Data</a>

  <div class="sidebar-footer">
    Health Information System Team<br>
    Health Department &middot; Lebanon Mission<br>
    June 2026 &middot; Internal Use
  </div>
</nav>

<!-- ═══════════════════════════════════════════ MAIN -->
<main class="main">

  <!-- HERO -->
  <div class="hero">
    <div class="hero-content">
      <div class="hero-tag">
        <span class="hero-tag-dot"></span>
        Health Information System Team &middot; Lebanon Mission
      </div>
      <h1>HIS Team<br><em>Roles, Responsibilities &amp; Data Flows</em></h1>
      <p class="hero-sub">Comprehensive internal documentation of the Health Information System team structure, line and technical management relationships, individual role responsibilities, and end-to-end data flow processes at coordination and base levels.</p>
      <div class="hero-meta">
        <div class="hero-meta-item">
          <div class="hero-meta-label">Department</div>
          <div class="hero-meta-value">Health</div>
        </div>
        <div class="hero-meta-item">
          <div class="hero-meta-label">Team</div>
          <div class="hero-meta-value">HIS</div>
        </div>
        <div class="hero-meta-item">
          <div class="hero-meta-label">Branches</div>
          <div class="hero-meta-value">3</div>
        </div>
        <div class="hero-meta-item">
          <div class="hero-meta-label">Version</div>
          <div class="hero-meta-value">1.1 &middot; June 2026</div>
        </div>
      </div>
    </div>
  </div>

  <div class="content-wrap">

    <!-- VERSION 1.1 UPDATE NOTICE -->
    <div class="update-banner">
      <div class="update-banner-icon">&#x1F4DD;</div>
      <div>
        <div class="update-banner-title">Updated in Version 1.1 &mdash; June 2026</div>
        <ul class="update-banner-list">
          <li>HIS TM responsibility for communicating reporting delays and confirming on-track status to Grants</li>
          <li>HIS TM holds final responsibility for all Grants communication on reporting packages</li>
          <li>Grants notification required for any known unavailability of Ali Roumani affecting pivot generation</li>
          <li>Formal continuity and responsibility-transfer protocol during any team member absence (new R5)</li>
          <li>DPM role strengthened: programmatic data cleaning review integrated at base level, not only at final stage</li>
          <li>Data quality issues in reporting packages must be routed through the HIS Team Manager</li>
          <li>AIMS and Activity Info ownership clarified: Base HIS Teams responsible for follow-up and pre-submission validation (new F2)</li>
          <li>MHPSS data integration status documented: limited current interaction; HIS role pending full PHENICS integration (new F3)</li>
        </ul>
      </div>
    </div>

    <!-- ══════════ PART 1 ══════════ -->
    <div class="part-header" id="part1">
      <div class="part-number">1</div>
      <div>
        <div class="part-label">Part One</div>
        <div class="part-title">Team Structure</div>
        <div class="part-desc">Geographic distribution, organisational hierarchy, and management relationships</div>
      </div>
    </div>

    <!-- S1 -->
    <section class="section" id="s1">
      <div class="section-header">
        <div class="section-badge"><div class="section-num">01</div></div>
        <div>
          <div class="section-title">Overview</div>
          <div class="section-sub">Team composition &middot; 7 members across 3 branches</div>
        </div>
      </div>

      <p class="prose">The Health Information System (HIS) Team operates under the <strong>Health Department Management</strong> of the Lebanon Mission. The team is responsible for health information strategy, data management, programmatic reporting, and field-level technical support across all health programme areas.</p>
      <p class="prose">The team is organised into three branches: a <strong>Coordination (Central) Office</strong> and two field bases &mdash; <strong>Saida Base</strong> and <strong>Tripoli Base</strong> &mdash; each covering a defined geographic catchment of health facilities and programme areas.</p>

      <div class="stat-strip">
        <div class="stat-item"><div class="stat-num">7</div><div class="stat-label">Total Team Members</div></div>
        <div class="stat-item"><div class="stat-num">1</div><div class="stat-label">HIM Specialist</div></div>
        <div class="stat-item"><div class="stat-num">1</div><div class="stat-label">HIS Team Manager</div></div>
        <div class="stat-item"><div class="stat-num">5</div><div class="stat-label">HIS Officers</div></div>
        <div class="stat-item"><div class="stat-num">3</div><div class="stat-label">Branches</div></div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Branch</th><th>Location</th><th>Coverage Area</th><th>HIS Staff</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Coordination Office</td><td>Central</td>
              <td>Mission-wide oversight</td><td>HIMS &middot; HIS TM &middot; 2 HIS Officers</td>
            </tr>
            <tr>
              <td>Saida Base</td><td>South Lebanon</td>
              <td>Beirut / Mount Lebanon &middot; South / Nabatieh</td><td>2 HIS Officers</td>
            </tr>
            <tr>
              <td>Tripoli Base</td><td>North Lebanon</td>
              <td>North / Akkar &middot; Bekaa</td><td>1 HIS Officer</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <hr class="section-rule">

    <!-- S2 -->
    <section class="section" id="s2">
      <div class="section-header">
        <div class="section-badge"><div class="section-num">02</div></div>
        <div>
          <div class="section-title">Organisational Chart &amp; Distribution</div>
          <div class="section-sub">Reporting structure across coordination and base offices</div>
        </div>
      </div>

      <p class="prose">The diagram below illustrates the full organisational structure of the HIS Team, from the Health Coordinator at the top of the health department to base-level HIS Officers. Both <strong>line management</strong> and <strong>technical supervision</strong> relationships are present and distinct within the team.</p>

      <div class="org-chart">
        <div class="org-top">
          <div class="org-node hc">
            <div class="org-node-title">Health Coordinator</div>
            <div class="org-node-sub">Head of Health Department</div>
          </div>
        </div>
        <div class="org-connector"><div class="org-connector-line"></div></div>

        <div class="org-top">
          <div class="org-node hims">
            <div class="org-node-title">HIMS</div>
            <div class="org-node-sub">Health Information Management Specialist<br>Coordination Office</div>
          </div>
        </div>
        <div class="org-connector"><div class="org-connector-line"></div></div>

        <div class="org-top">
          <div class="org-node tm">
            <div class="org-node-title">HIS Team Manager (HIS TM)</div>
            <div class="org-node-sub">Coordination Office</div>
          </div>
        </div>
        <div class="org-connector"><div class="org-connector-line"></div></div>

        <div class="org-branch">
          <div class="org-branch-col">
            <div class="org-branch-label">Coordination Office</div>
            <div class="org-node off" style="width:100%">
              <div class="org-node-title">HIS Officer &times; 2</div>
              <div class="org-node-sub">Programmatic Reporting</div>
            </div>
          </div>
          <div class="org-branch-col">
            <div class="org-branch-label">Saida Base</div>
            <div class="org-node dhpm" style="width:100%;margin-bottom:10px">
              <div class="org-node-title">DHPM &mdash; Saida</div>
              <div class="org-node-sub">Deputy Health Programme Manager</div>
            </div>
            <div class="org-node base" style="width:100%">
              <div class="org-node-title">HIS Officer &times; 2</div>
              <div class="org-node-sub">Beirut / Mount Lebanon<br>South / Nabatieh</div>
            </div>
          </div>
          <div class="org-branch-col">
            <div class="org-branch-label">Tripoli Base</div>
            <div class="org-node dhpm" style="width:100%;margin-bottom:10px">
              <div class="org-node-title">DHPM &mdash; Tripoli</div>
              <div class="org-node-sub">Deputy Health Programme Manager</div>
            </div>
            <div class="org-node base" style="width:100%">
              <div class="org-node-title">HIS Officer &times; 1</div>
              <div class="org-node-sub">North / Akkar &middot; Bekaa</div>
            </div>
          </div>
        </div>
      </div>

      <div class="infobox teal" style="margin-top:28px">
        <div class="infobox-icon">&#x2139;</div>
        <div>
          <div class="infobox-title">Dual management model at bases</div>
          <div class="infobox-body">HIS Officers stationed at bases operate under a dual management model. Their <strong>administrative and line management</strong> sits with the Deputy Health Programme Manager (DHPM) at the respective base. Their <strong>technical supervision</strong> is carried out by the HIS Team Manager at the Coordination Office. Overall management authority for all HIS team members rests with the HIMS.</div>
        </div>
      </div>
    </section>

    <hr class="section-rule">

    <!-- S3 -->
    <section class="section" id="s3">
      <div class="section-header">
        <div class="section-badge"><div class="section-num">03</div></div>
        <div>
          <div class="section-title">Management Lines</div>
          <div class="section-sub">Line management, technical supervision, and overall authority</div>
        </div>
      </div>

      <p class="prose">The HIS Team operates under three distinct management relationships that must be clearly understood by all team members. These relationships define accountability, reporting pathways, and escalation channels.</p>

      <div class="h3">Line Management</div>
      <div class="mgmt-layers">
        <div class="mgmt-layer l1">
          <div class="mgmt-layer-num">L1</div>
          <div class="mgmt-layer-title">Health Coordinator &rarr; HIMS</div>
          <div class="mgmt-layer-note">Head of Department</div>
        </div>
        <div class="mgmt-layer l1">
          <div class="mgmt-layer-num">L2</div>
          <div class="mgmt-layer-title">HIMS &rarr; HIS Team Manager</div>
          <div class="mgmt-layer-note">Coordination Office</div>
        </div>
        <div class="mgmt-layer l1">
          <div class="mgmt-layer-num">L3</div>
          <div class="mgmt-layer-title">HIS TM &rarr; HIS Officers (Coordination)</div>
          <div class="mgmt-layer-note">Central Office Officers</div>
        </div>
        <div class="mgmt-layer l2">
          <div class="mgmt-layer-num">L4</div>
          <div class="mgmt-layer-title">DHPM &rarr; HIS Officers (Bases)</div>
          <div class="mgmt-layer-note">Saida Base &middot; Tripoli Base</div>
        </div>
      </div>

      <div class="h3">Technical Supervision</div>
      <div class="mgmt-layers">
        <div class="mgmt-layer l3">
          <div class="mgmt-layer-num">T1</div>
          <div class="mgmt-layer-title">HIS TM &rarr; All HIS Officers (Coordination &amp; Bases)</div>
          <div class="mgmt-layer-note">Technical oversight</div>
        </div>
      </div>

      <div class="h3">Overall Management Authority</div>
      <div class="mgmt-layers">
        <div class="mgmt-layer l1">
          <div class="mgmt-layer-num">O1</div>
          <div class="mgmt-layer-title">HIMS &rarr; All HIS Team Members</div>
          <div class="mgmt-layer-note">Mission-level HIS authority</div>
        </div>
      </div>

      <div class="infobox amber">
        <div class="infobox-icon">&#x26A0;</div>
        <div>
          <div class="infobox-title">Escalation principle</div>
          <div class="infobox-body">The HIS TM serves as the <strong>pre-final layer</strong> for all health information management decisions and approvals. The HIMS is the <strong>final layer</strong>. Issues should be escalated progressively through this chain; direct escalation to the HIMS is reserved for matters that cannot be resolved at HIS TM level.</div>
        </div>
      </div>
    </section>

    <!-- ══════════ PART 2 ══════════ -->
    <div class="part-header" id="part2">
      <div class="part-number">2</div>
      <div>
        <div class="part-label">Part Two</div>
        <div class="part-title">Roles &amp; Responsibilities</div>
        <div class="part-desc">Detailed responsibilities for each position within the HIS Team</div>
      </div>
    </div>

    <!-- R1 -->
    <section class="section" id="r1">
      <div class="section-header">
        <div class="section-badge"><div class="section-num role">HIMS</div></div>
        <div>
          <div class="section-title">Health Information Management Specialist</div>
          <div class="section-sub">Technical Head &middot; Coordination Office &middot; Final approval authority</div>
        </div>
      </div>
      <div class="resp-card">
        <div class="resp-card-header">
          <div class="resp-card-icon hims">HIMS</div>
          <div>
            <div class="resp-card-name">HIM Specialist</div>
            <div class="resp-card-role">Coordination Office &middot; Reports to Health Coordinator</div>
          </div>
        </div>
        <div class="resp-card-body">
          <div class="h3">Strategy &amp; Leadership</div>
          <ul class="doc-list">
            <li>Develops and owns the <strong>Health Information Management strategy</strong> at mission level</li>
            <li>Defines the <strong>HIS team strategy</strong>, structures and annual workplans</li>
            <li>Serves as the <strong>last layer of authority</strong> on all health information management decisions within the mission</li>
            <li>Line manages the <strong>HIS Team Manager</strong> and holds overall management authority over all HIS team members</li>
          </ul>
          <div class="h3">Tools, Applications &amp; Development</div>
          <ul class="doc-list">
            <li>Leads <strong>tools and applications development</strong> for the HIS team</li>
            <li>Oversees all <strong>health application development at MOPH level</strong></li>
            <li>Holds <strong>final approval authority</strong> over reporting tool designs and development</li>
            <li>Leads <strong>FFM (Field Facility Monitoring) tool</strong> design and development</li>
            <li>Responsible for the development of new <strong>programmatic KPIs</strong></li>
          </ul>
          <div class="h3">Documentation</div>
          <ul class="doc-list">
            <li>Produces and maintains all <strong>official documentation</strong> related to data flows, databases, application usage, and tool usage</li>
          </ul>
        </div>
      </div>
    </section>

    <hr class="section-rule">

    <!-- R2 — updated with Grants communication + Ali Roumani + data quality responsibilities -->
    <section class="section" id="r2">
      <div class="section-header">
        <div class="section-badge"><div class="section-num role">TM</div></div>
        <div>
          <div class="section-title">HIS Team Manager</div>
          <div class="section-sub">HIS TM &middot; Coordination Office &middot; Pre-final approval layer</div>
        </div>
      </div>
      <div class="resp-card">
        <div class="resp-card-header">
          <div class="resp-card-icon tm">TM</div>
          <div>
            <div class="resp-card-name">HIS Team Manager</div>
            <div class="resp-card-role">Coordination Office &middot; Reports to HIMS</div>
          </div>
        </div>
        <div class="resp-card-body">
          <div class="h3">Team Management</div>
          <ul class="doc-list">
            <li><strong>Line manages</strong> HIS Officers at the Coordination Office</li>
            <li><strong>Technically manages</strong> HIS Officers at all base offices</li>
            <li>Provides <strong>capacity building trainings</strong> to base HIS Officers to strengthen field-team systematic processes</li>
          </ul>
          <div class="h3">Programmatic Reporting</div>
          <ul class="doc-list">
            <li>Responsible for <strong>programmatic reporting</strong> produced by Coordination Office HIS Officers</li>
            <li>Validates ActivityInfo and sector reports requested on <strong>daily, weekly, and monthly</strong> bases</li>
            <li>Ensures base-level HIS Officers maintain timely and accurate reporting</li>
            <li>Ensures base HIS Officers populate data for <strong>FFM tools</strong></li>
            <li>Assures that all programmatic <strong>KPIs are being monitored and reported</strong> appropriately</li>
          </ul>
          <div class="h3">Grants Communication &amp; Reporting Timelines</div>
          <ul class="doc-list">
            <li>Holds <strong>final responsibility for all communication with Grants</strong> on reporting packages, including progress updates, identified issues, and the steps being taken to resolve them</li>
            <li>Responsible for <strong>initiating communication with Grants</strong> in the event of any reporting delay, including the nature of the delay and corrective actions underway</li>
            <li>Responsible for <strong>confirming to Grants</strong> when reporting is progressing as planned and expected to meet retro-planning deadlines</li>
            <li>Any <strong>data quality issue in a reporting package</strong> must be communicated to the HIS Team Manager, who is responsible for follow-up and coordination with the relevant team members before any external communication</li>
          </ul>
          <div class="h3">Systems &amp; Applications</div>
          <ul class="doc-list">
            <li>Ensures all systematic modules developed on <strong>PHENICS</strong> are functioning seamlessly</li>
            <li>Collects bugs and additional system requirements from HIS Officers, team managers, or key base staff</li>
            <li>Co-responds to <strong>development requirements</strong> submitted by bases</li>
            <li>Ensures data flows at base level are operating correctly</li>
          </ul>
          <div class="h3">MOPH Coordination &amp; Pivot Oversight</div>
          <ul class="doc-list">
            <li>Primary contact for the <strong>MOPH consultant (Ali Roumani)</strong> on pivot table integration and KPI data</li>
            <li>Responsible for communicating pivot integration requirements, KPI embedding, and resolving pivot extraction errors</li>
            <li>Validates MOPH-generated data pivots before distribution to Coordination HIS Officers</li>
            <li>Must <strong>notify Grants</strong> in advance of any known unavailability of Ali Roumani &mdash; including planned leave or other expected absence &mdash; when this may affect pivot generation or reporting timelines; this notification must be coordinated with Ali Roumani and the HIMS</li>
          </ul>
          <div class="infobox blue">
            <div class="infobox-icon">&#x2139;</div>
            <div>
              <div class="infobox-title">Pre-final approval layer</div>
              <div class="infobox-body">The HIS TM acts as the <strong>pre-final layer</strong> for all mission-level health information management approvals. Reporting packages, pivot validations, and system development decisions are reviewed and signed off at HIS TM level before escalation to the HIMS where required.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <hr class="section-rule">

    <!-- R3 -->
    <section class="section" id="r3">
      <div class="section-header">
        <div class="section-badge"><div class="section-num role">CO</div></div>
        <div>
          <div class="section-title">HIS Officers &mdash; Coordination Office</div>
          <div class="section-sub">2 Officers &middot; Programmatic reporting &middot; Pivot validation &middot; Data verification</div>
        </div>
      </div>
      <div class="resp-card">
        <div class="resp-card-header">
          <div class="resp-card-icon off-co">CO</div>
          <div>
            <div class="resp-card-name">HIS Officers &mdash; Coordination</div>
            <div class="resp-card-role">Coordination Office &middot; 2 Officers &middot; Report to HIS TM</div>
          </div>
        </div>
        <div class="resp-card-body">
          <div class="h3">Programmatic Reporting</div>
          <ul class="doc-list">
            <li>Fully dedicated to <strong>programmatic reporting</strong> for the mission</li>
            <li>Produce and finalise all required reports and submit to the HIS TM for validation</li>
            <li>Ensure reporting figures remain <strong>consistent and accurate</strong> across all reporting periods</li>
          </ul>
          <div class="h3">Data Verification</div>
          <ul class="doc-list">
            <li>Conduct <strong>bi-weekly second-layer verification</strong> of data submitted by base HIS Officers to identify and flag inconsistencies</li>
            <li>Flag identified data quality issues to the relevant base HIS Officers for cleaning; escalate unresolved issues to the HIS TM</li>
          </ul>
          <div class="h3">Pivot Validation</div>
          <ul class="doc-list">
            <li>Validate MOPH-generated pivot tables for <strong>consistency and accuracy</strong> against internal SOPs</li>
            <li>Ensure pivot figures align with KPIs reported to donors</li>
            <li>Perform a <strong>second-level validation</strong> of pivots after the HIS TM&rsquo;s initial check</li>
            <li>Report any pivot discrepancies directly to the HIS TM for follow-up with the MOPH consultant</li>
          </ul>
        </div>
      </div>
    </section>

    <hr class="section-rule">

    <!-- R4 — updated: AIMS & Activity Info added -->
    <section class="section" id="r4">
      <div class="section-header">
        <div class="section-badge"><div class="section-num role">BA</div></div>
        <div>
          <div class="section-title">HIS Officers &mdash; Bases</div>
          <div class="section-sub">3 Officers (Saida &times;2, Tripoli &times;1) &middot; Field technical support &middot; AIMS &amp; Activity Info</div>
        </div>
      </div>
      <div class="resp-card">
        <div class="resp-card-header">
          <div class="resp-card-icon off-ba">BA</div>
          <div>
            <div class="resp-card-name">HIS Officers &mdash; Bases</div>
            <div class="resp-card-role">Saida Base (&times;2) &middot; Tripoli Base (&times;1) &middot; Line managed by DHPM &middot; Technically supervised by HIS TM</div>
          </div>
        </div>
        <div class="resp-card-body">
          <div class="h3">Facility &amp; Field Support</div>
          <ul class="doc-list">
            <li>Provide <strong>full technical support</strong> to health facilities in their coverage area</li>
            <li>Support health field teams on systematic and data-entry processes</li>
            <li>Follow up with <strong>facility data focal points</strong> to ensure timely and accurate data submission</li>
          </ul>
          <div class="h3">Data Cleaning &amp; Quality</div>
          <ul class="doc-list">
            <li>Perform <strong>data cleaning on a weekly or bi-weekly basis</strong> for their respective area</li>
            <li>Report unresolved data issues to the <strong>HIS TM on a weekly basis</strong></li>
          </ul>
          <div class="h3">AIMS &amp; Activity Info</div>
          <ul class="doc-list">
            <li>Hold <strong>primary responsibility</strong> for AIMS and Activity Info data entry and management at base level</li>
            <li>Conduct required <strong>follow-up with field teams and facility focal points</strong> to ensure timely and complete data entry</li>
            <li>Complete a <strong>data validation check before each submission</strong> to confirm accuracy and completeness; no submission may proceed with known, unresolved data issues</li>
            <li>Report any submission issues or data quality concerns to the <strong>HIS TM before submission</strong> proceeds</li>
          </ul>
          <div class="h3">Systems &amp; Applications</div>
          <ul class="doc-list">
            <li>Communicate with the HIS TM for support on <strong>pricing and setups on PHENICS, MERA</strong>, and other applications</li>
            <li>Ensure FFM tool data is populated as required by the HIS TM</li>
          </ul>
          <div class="infobox purple">
            <div class="infobox-icon">&#x1F4CD;</div>
            <div>
              <div class="infobox-title">Geographic responsibilities</div>
              <div class="infobox-body">
                <ul>
                  <li><strong>Saida Base Officers (&times;2):</strong> Beirut / Mount Lebanon and South / Nabatieh areas</li>
                  <li><strong>Tripoli Base Officer (&times;1):</strong> North / Akkar and Bekaa areas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <hr class="section-rule">

    <!-- R5 — NEW: Continuity & Absence Management -->
    <section class="section" id="r5">
      <div class="section-header">
        <div class="section-badge"><div class="section-num role" style="font-size:9px">CON</div></div>
        <div>
          <div class="section-title">Continuity &amp; Absence Management</div>
          <div class="section-sub">Cross-cutting responsibility &middot; All team members</div>
        </div>
      </div>

      <p class="prose">To ensure continuity of work and avoid delays, all HIS Team members are responsible for formally transferring responsibilities before any period of absence. The HIS Team Manager coordinates handovers at team level and communicates any absence that may affect reporting or data flows to the relevant stakeholders.</p>

      <div class="h3">Principles &amp; Obligations</div>
      <ul class="doc-list">
        <li>All team members must <strong>formally transfer responsibilities</strong> before any planned or expected absence, in coordination with the HIS TM and in line with sufficient advance notice</li>
        <li>The HIS TM must ensure that a <strong>named cover arrangement</strong> is confirmed for any critical task falling within an absence period</li>
        <li>Any absence that may affect <strong>reporting timelines, pivot generation, or data submissions</strong> must be communicated to the HIS TM with sufficient advance notice to allow appropriate handover</li>
        <li>The HIS TM is responsible for <strong>informing Grants and the HIMS</strong> of any absence with potential impact on reporting deliverables or pivot generation</li>
      </ul>

      <div class="h3">Specific Obligations by Role</div>
      <div class="mgmt-layers">
        <div class="mgmt-layer l1">
          <div class="mgmt-layer-num">HIS&nbsp;TM</div>
          <div class="mgmt-layer-title">Coordinate team handovers; notify Grants and HIMS of impact</div>
          <div class="mgmt-layer-note">Initiates communication</div>
        </div>
        <div class="mgmt-layer l2">
          <div class="mgmt-layer-num">CO&nbsp;Off.</div>
          <div class="mgmt-layer-title">Notify HIS TM; handover reporting and pivot tasks</div>
          <div class="mgmt-layer-note">Coordination Office</div>
        </div>
        <div class="mgmt-layer l3">
          <div class="mgmt-layer-num">Base&nbsp;Off.</div>
          <div class="mgmt-layer-title">Notify HIS TM and DHPM; handover data cleaning and submissions</div>
          <div class="mgmt-layer-note">Saida &middot; Tripoli</div>
        </div>
      </div>

      <div class="infobox amber">
        <div class="infobox-icon">&#x26A0;</div>
        <div>
          <div class="infobox-title">Ali Roumani (MOPH Consultant) — unavailability notification</div>
          <div class="infobox-body">Grants must be notified in advance of any known unavailability of Ali Roumani &mdash; including planned leave or any other expected absence &mdash; when this may affect pivot generation or reporting timelines. The HIS TM initiates this notification in coordination with Ali Roumani and the HIMS. See also <strong>R2 &mdash; MOPH Coordination &amp; Pivot Oversight</strong>.</div>
        </div>
      </div>
    </section>

    <!-- ══════════ PART 3 ══════════ -->
    <div class="part-header" id="part3">
      <div class="part-number">3</div>
      <div>
        <div class="part-label">Part Three</div>
        <div class="part-title">Data Flows</div>
        <div class="part-desc">End-to-end process flows for HIS Team operational activities</div>
      </div>
    </div>

    <!-- F1 — updated: DPM base-level review + Grants communication at Step 8 -->
    <section class="section" id="f1">
      <div class="section-header">
        <div class="section-badge"><div class="section-num flow-tag">F1</div></div>
        <div>
          <div class="section-title">Programmatic Reporting Flow</div>
          <div class="section-sub">Monthly data cycle &middot; From data cleaning through final reporting package delivery</div>
        </div>
      </div>

      <p class="prose">The programmatic reporting flow covers the full monthly cycle &mdash; from ongoing data cleaning at base level through pivot validation, report production, programme-side validation, and final delivery to the Deputy Health Coordinator. Each stage has a defined responsible actor and escalation path.</p>

      <div class="infobox teal">
        <div class="infobox-icon">&#x1F4C5;</div>
        <div>
          <div class="infobox-title">Monthly cycle timing</div>
          <div class="infobox-body">System closure occurs on the <strong>second working day of the month</strong>. MOPH pivot generation typically occurs the day after closure. All post-closure data cleaning issues must be reported by email to the HIS TM with HIMS and Health Coordinator copied. The <strong>HIS TM is responsible for communicating delays or on-track status to Grants</strong> throughout the cycle.</div>
        </div>
      </div>

      <div class="flow">

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--purple-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--purple-600)">HIS Officers &mdash; Bases</div>
            <h4>Ongoing Data Cleaning &amp; Base-Level DPM Review</h4>
            <p>Throughout the month, base HIS Officers perform continuous data cleaning within their respective coverage areas. <strong>DPMs review data cleaning outcomes at base level</strong> during this phase to ensure programmatic validation is integrated into the process and not deferred to the final reporting stage. All identified but unresolved issues are documented and reported to the HIS TM on a weekly basis.</p>
            <div class="flow-tags">
              <span class="tag badge-purple">Weekly reporting to HIS TM</span>
              <span class="tag badge-amber">DPM base-level review</span>
              <span class="tag badge-slate">During month</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--blue-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--blue-600)">HIS Officers &mdash; Coordination</div>
            <h4>Bi-Weekly Second-Layer Data Verification</h4>
            <p>Coordination Office HIS Officers perform bi-weekly <strong>second-layer verification</strong> of data submitted by base offices. Data quality issues identified are flagged directly to the relevant base HIS Officers for cleaning, with findings reported to the HIS TM.</p>
            <div class="flow-tags">
              <span class="tag badge-blue">Second-layer verification</span>
              <span class="tag badge-slate">Reports to HIS TM</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--teal-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--teal-600)">System</div>
            <h4>System Closure</h4>
            <p>The system is closed on the <strong>second working day of the month</strong>. Any data cleaning issues identified after closure must be reported immediately to the HIS TM by email, with the HIMS and Health Coordinator copied.</p>
            <div class="flow-tags">
              <span class="tag badge-teal">2nd working day</span>
              <span class="tag badge-amber">Email: HIS TM cc HIMS &amp; Health Coord.</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--teal-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--teal-600)">MOPH</div>
            <h4>Pivot Generation</h4>
            <p>MOPH generates the data pivot tables, typically on the day following system closure. These pivots are the basis for all programmatic KPI reporting. Any known unavailability of <strong>Ali Roumani</strong> that may affect this step must be communicated to Grants in advance by the HIS TM.</p>
            <div class="flow-tags">
              <span class="tag badge-teal">Typically day after closure</span>
              <span class="tag badge-amber">Grants notified if Ali Roumani unavailable</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--teal-500)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--teal-500)">HIS Team Manager</div>
            <h4>First Pivot Validation</h4>
            <p>The HIS TM performs the primary review of the MOPH-generated pivot, checking for missing parameters and data integrity issues. If issues are found, the HIS TM contacts the MOPH consultant directly to request a corrected pivot.</p>
            <div class="flow-tags">
              <span class="tag badge-teal">Primary validation</span>
              <span class="tag badge-slate">MOPH consultant follow-up if needed</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--blue-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--blue-600)">HIS Officers &mdash; Coordination</div>
            <h4>Second Pivot Validation</h4>
            <p>After the HIS TM&rsquo;s initial review, Coordination HIS Officers conduct a second-level validation of the pivot against internal SOPs and donor-reported KPIs. Any identified discrepancies are reported directly to the HIS TM, who follows up with the MOPH consultant and obtains a corrected pivot if required.</p>
            <div class="flow-tags">
              <span class="tag badge-blue">Second-level validation</span>
              <span class="tag badge-slate">SOP alignment &amp; KPI check</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--blue-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--blue-600)">HIS Officers &mdash; Coordination</div>
            <h4>Report Finalisation</h4>
            <p>Once pivots are validated, Coordination HIS Officers complete and finalise all programmatic reports using the validated pivot data, then submit the reporting package to the HIS TM. Any data quality issue identified at this stage must be reported to the HIS TM before the package is submitted.</p>
            <div class="flow-tags">
              <span class="tag badge-blue">Submit to HIS TM</span>
              <span class="tag badge-amber">Data quality issues &rarr; HIS TM first</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--teal-500)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--teal-500)">HIS Team Manager</div>
            <h4>Report Validation, Grants Communication &amp; Sharing with DPMs</h4>
            <p>The HIS TM reviews and validates the final reporting package. The HIS TM <strong>communicates with Grants</strong> at this stage &mdash; confirming the package is on track and meeting retro-planning deadlines, or notifying of any delay with corrective steps. The validated package is then shared with DPMs for programme-side logical review.</p>
            <div class="flow-tags">
              <span class="tag badge-teal">HIS TM validation</span>
              <span class="tag badge-green">Grants: on-track confirmation or delay notice</span>
              <span class="tag badge-slate">Distributed to DPMs</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--amber-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--amber-600)">Deputy Programme Managers (DPMs)</div>
            <h4>Programme-Side Validation</h4>
            <p>DPMs have been involved in data cleaning review at base level throughout the month. At month close, they perform a final review of the reporting figures for logical coherence from the programme perspective. Any discrepancies or concerns are communicated directly to the HIS TM. Upon satisfactory review, the DPM sends an official confirmation email.</p>
            <div class="flow-tags">
              <span class="tag badge-amber">Final logical validation</span>
              <span class="tag badge-green">Official email confirmation</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--teal-500)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--teal-500)">HIS Team Manager</div>
            <h4>Reporting Package Delivery to DHC</h4>
            <p>Following DPM validation, the HIS TM sends the finalised reporting package to the <strong>Deputy Health Coordinator (DHC)</strong> by email. Any issues raised by the DHC are directed back to the HIS TM, with the HIMS copied into the communication loop.</p>
            <div class="flow-tags">
              <span class="tag badge-teal">Email to DHC</span>
              <span class="tag badge-slate">HIMS looped for issues</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--green-600)"></div>
          </div>
          <div class="flow-card" style="border-color:var(--green-600);background:var(--green-100)">
            <div class="flow-card-actor" style="color:var(--green-600)">Deputy Health Coordinator</div>
            <h4 style="color:var(--green-600)">Reporting Cycle Complete</h4>
            <p style="color:var(--green-600)">The reporting package is received and reviewed by the DHC. The monthly programmatic reporting cycle is closed. Any issues raised are escalated through the HIS TM, looping in the HIMS as required.</p>
            <div class="flow-tags">
              <span class="tag badge-green">Cycle closed</span>
            </div>
          </div>
        </div>

      </div>

      <div class="h3">Flow Summary &mdash; Actors &amp; Actions</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Step</th><th>Actor</th><th>Action</th><th>Escalation / Note</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><span class="badge badge-purple">HIS Officers &mdash; Bases</span></td>
              <td>Ongoing data cleaning + DPM base-level review</td>
              <td>Weekly report to HIS TM; DPMs review outcomes at base</td>
            </tr>
            <tr>
              <td>2</td>
              <td><span class="badge badge-blue">HIS Officers &mdash; Coord.</span></td>
              <td>Bi-weekly second-layer data verification</td>
              <td>Flag issues to base HIS Officers; report to HIS TM</td>
            </tr>
            <tr>
              <td>3</td>
              <td><span class="badge badge-teal">System</span></td>
              <td>System closure (2nd working day)</td>
              <td>Post-closure issues: email HIS TM cc HIMS &amp; HC</td>
            </tr>
            <tr>
              <td>4</td>
              <td><span class="badge badge-teal">MOPH</span></td>
              <td>Pivot generation</td>
              <td>Grants notified if Ali Roumani unavailable</td>
            </tr>
            <tr>
              <td>5</td>
              <td><span class="badge badge-teal">HIS TM</span></td>
              <td>First pivot validation</td>
              <td>Issues &rarr; MOPH consultant</td>
            </tr>
            <tr>
              <td>6</td>
              <td><span class="badge badge-blue">HIS Officers &mdash; Coord.</span></td>
              <td>Second pivot validation</td>
              <td>Issues &rarr; HIS TM &rarr; MOPH consultant</td>
            </tr>
            <tr>
              <td>7</td>
              <td><span class="badge badge-blue">HIS Officers &mdash; Coord.</span></td>
              <td>Report finalisation &amp; submission</td>
              <td>Data quality issues &rarr; HIS TM before submission</td>
            </tr>
            <tr>
              <td>8</td>
              <td><span class="badge badge-teal">HIS TM</span></td>
              <td>Report validation; Grants communication; share with DPMs</td>
              <td>Grants: on-track confirmation or delay notice</td>
            </tr>
            <tr>
              <td>9</td>
              <td><span class="badge badge-amber">DPMs</span></td>
              <td>Programme-side logical validation (final)</td>
              <td>Issues &rarr; HIS TM; confirmation email when approved</td>
            </tr>
            <tr>
              <td>10</td>
              <td><span class="badge badge-teal">HIS TM</span></td>
              <td>Package delivery to DHC</td>
              <td>DHC issues &rarr; HIS TM cc HIMS</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <hr class="section-rule">

    <!-- F2 — NEW: AIMS & Activity Info -->
    <section class="section" id="f2">
      <div class="section-header">
        <div class="section-badge"><div class="section-num flow-tag">F2</div></div>
        <div>
          <div class="section-title">AIMS &amp; Activity Info</div>
          <div class="section-sub">Base HIS Teams &middot; Entry, follow-up, validation &amp; submission</div>
        </div>
      </div>

      <p class="prose">AIMS (Activity Information Management System) and Activity Info data management is the <strong>responsibility of the Base HIS Teams</strong>. This covers data entry, ongoing follow-up with field focal points, validation of data before submission, and escalation of any issues to the HIS TM prior to submission.</p>

      <div class="flow">

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--purple-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--purple-600)">HIS Officers &mdash; Bases</div>
            <h4>Data Entry &amp; Facility Follow-Up</h4>
            <p>Base HIS Officers are responsible for data entry into AIMS and Activity Info for their coverage area. They follow up with health facility focal points and field teams to ensure data is submitted on time and completely.</p>
            <div class="flow-tags">
              <span class="tag badge-purple">Base HIS Officers</span>
              <span class="tag badge-slate">Per coverage area</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--purple-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--purple-600)">HIS Officers &mdash; Bases</div>
            <h4>Pre-Submission Validation</h4>
            <p>Before each submission, the responsible HIS Officer completes a validation check to confirm data accuracy and completeness. Any unresolved data quality issues identified at this stage must be reported to the HIS TM; submission does not proceed until issues are resolved or cleared by the HIS TM.</p>
            <div class="flow-tags">
              <span class="tag badge-purple">Validation required</span>
              <span class="tag badge-amber">Issues &rarr; HIS TM before submission</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--teal-500)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--teal-500)">HIS Team Manager</div>
            <h4>Oversight &amp; Issue Resolution</h4>
            <p>The HIS TM maintains overall oversight of the AIMS and Activity Info submission cycle. Any issues escalated by base HIS Officers are reviewed and resolved at HIS TM level before submission proceeds.</p>
            <div class="flow-tags">
              <span class="tag badge-teal">HIS TM oversight</span>
              <span class="tag badge-slate">Resolves escalated issues</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--green-600)"></div>
          </div>
          <div class="flow-card" style="border-color:var(--green-600);background:var(--green-100)">
            <div class="flow-card-actor" style="color:var(--green-600)">HIS Officers &mdash; Bases</div>
            <h4 style="color:var(--green-600)">Submission Complete</h4>
            <p style="color:var(--green-600)">Data is submitted to AIMS and Activity Info once validation is confirmed and all issues are resolved. The base HIS Officer confirms submission to the HIS TM.</p>
            <div class="flow-tags">
              <span class="tag badge-green">Submission confirmed</span>
            </div>
          </div>
        </div>

      </div>

      <div class="infobox blue">
        <div class="infobox-icon">&#x2139;</div>
        <div>
          <div class="infobox-title">Validation before submission — mandatory step</div>
          <div class="infobox-body">Base HIS Officers must complete a data validation check before every AIMS and Activity Info submission. Submission with known, unresolved data quality issues is not permitted. Any such issues must be reported to the HIS TM for resolution or clearance before the submission proceeds.</div>
        </div>
      </div>
    </section>

    <hr class="section-rule">

    <!-- F3 — NEW: MHPSS Data Integration Note -->
    <section class="section" id="f3">
      <div class="section-header">
        <div class="section-badge"><div class="section-num flow-tag">F3</div></div>
        <div>
          <div class="section-title">MHPSS Data</div>
          <div class="section-sub">Integration status &middot; Pending PHENICS integration</div>
        </div>
      </div>

      <p class="prose">The current interaction between the MHPSS and HIS teams remains limited. The HIS Team role with respect to MHPSS data will be further defined and documented once the full integration of MHPSS data into PHENICS is completed.</p>

      <div class="infobox amber">
        <div class="infobox-icon">&#x26A0;</div>
        <div>
          <div class="infobox-title">Role to be defined &mdash; pending PHENICS integration</div>
          <div class="infobox-body">At the time of this version (June 2026), the interaction between the MHPSS and HIS teams is limited and the HIS Team&rsquo;s role in MHPSS data flows has not yet been fully established. This section will be updated with a complete flow once the integration of MHPSS data into PHENICS is finalised. All team members will be notified when this section is published on the HIS Hub.</div>
        </div>
      </div>
    </section>

  </div><!-- /content-wrap -->

  <footer class="doc-footer">
    <div class="doc-footer-brand">HIS Team</div>
    <div>Health Information System &middot; Health Department &middot; Lebanon Mission</div>
    <div>Roles, Responsibilities &amp; Data Flows v1.1 &middot; June 2026 &middot; Internal Use</div>
  </footer>

</main>
</div>
`;

async function seedFlowV2() {
    try {
        const pool = await poolPromise;

        // Ensure FlowGroupId column exists (idempotent)
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'DataFlows' AND COLUMN_NAME = 'FlowGroupId'
            )
            ALTER TABLE DataFlows ADD FlowGroupId INT NULL;
        `);

        // Find v1.0 and ensure it has a FlowGroupId
        const v1Result = await pool.request().query(`
            SELECT Id, FlowGroupId
            FROM DataFlows
            WHERE Title = N'HIS Team Roles, Responsibilities & Data Flows'
              AND Version = '1.0'
        `);

        if (v1Result.recordset.length === 0) {
            console.error('v1.0 record not found. Run seed_his_team_roles.js first.');
            process.exit(1);
        }

        const v1 = v1Result.recordset[0];
        const groupId = v1.FlowGroupId ?? v1.Id;

        if (v1.FlowGroupId == null) {
            await pool.request()
                .input('Id', v1.Id)
                .query('UPDATE DataFlows SET FlowGroupId = Id WHERE Id = @Id');
        }

        // Check if v1.1 already exists
        const v2Check = await pool.request().query(`
            SELECT Id FROM DataFlows
            WHERE Title = N'HIS Team Roles, Responsibilities & Data Flows'
              AND Version = '1.1'
        `);

        if (v2Check.recordset.length > 0) {
            const v2Id = v2Check.recordset[0].Id;
            await pool.request()
                .input('Id', v2Id)
                .input('Subtitle', 'Internal Team Documentation')
                .input('SystemName', 'HIS Team')
                .input('Program', 'Team Structure & Data Flows')
                .input('DocumentDate', 'June 2026')
                .input('HtmlContent', fullHtml)
                .input('GroupId', groupId)
                .query(`
                    UPDATE DataFlows
                    SET Subtitle = @Subtitle, SystemName = @SystemName, Program = @Program,
                        DocumentDate = @DocumentDate, HtmlContent = @HtmlContent, FlowGroupId = @GroupId
                    WHERE Id = @Id
                `);
            console.log('Updated v1.1 record successfully.');
        } else {
            await pool.request()
                .input('Title', 'HIS Team Roles, Responsibilities & Data Flows')
                .input('Subtitle', 'Internal Team Documentation')
                .input('SystemName', 'HIS Team')
                .input('Program', 'Team Structure & Data Flows')
                .input('Version', '1.1')
                .input('DocumentDate', 'June 2026')
                .input('HtmlContent', fullHtml)
                .input('GroupId', groupId)
                .query(`
                    INSERT INTO DataFlows
                        (Title, Subtitle, SystemName, Program, Version, DocumentDate, HtmlContent, FlowGroupId)
                    VALUES
                        (@Title, @Subtitle, @SystemName, @Program, @Version, @DocumentDate, @HtmlContent, @GroupId)
                `);
            console.log('Seeded v1.1 record successfully.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seedFlowV2();
