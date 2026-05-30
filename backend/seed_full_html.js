const { poolPromise } = require('./db');

const fullHtml = `


<div class="flow-container-wrap">
<!-- ═══════════════════════════════════════════════ SIDEBAR -->
<nav class="sidebar" role="navigation" aria-label="Document navigation">
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

  <div class="sidebar-footer">
    National Health Information System<br>
    Ministry of Public Health · Lebanon<br>
    May 2026 · Confidential
  </div>
</nav>

<!-- ═══════════════════════════════════════════════ MAIN -->
<main class="main">
  <!-- HERO -->
  <div class="hero">
    <div class="hero-content">
      <div class="hero-tag">
        <span class="hero-tag-dot"></span>
        National Health Information System · Lebanon
      </div>
      <h1>PHENICS<br><em>Hospital Deliveries Program</em></h1>
      <p class="hero-sub">Complete operational documentation covering the end-to-end data flow for the maternal hospital deliveries service — from pregnancy registration through delivery, discharge, and postnatal care — and the HFO monthly file-checking procedures.</p>
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

  <!-- ─── CONTENT ─────────────────────────────────── -->
  <div class="content-wrap">

    <!-- PART 1 HEADER -->
    <div class="part-header">
      <div class="part-number">1</div>
      <div class="part-header-text">
        <div class="part-label">Part One</div>
        <div class="part-title">Hospital Deliveries — System Data Flow</div>
        <div class="part-desc">Complete end-to-end workflow from pregnancy detection to postnatal care</div>
      </div>
    </div>

    <!-- ── S1: Overview ── -->
    <section class="section" id="s1">
      <div class="section-header">
        <div class="section-badge"><div class="section-num">01</div></div>
        <div>
          <div class="section-title">System Overview</div>
          <div class="section-sub">Purpose and scope of the Hospital Deliveries module within PHENICS</div>
        </div>
      </div>

      <p class="prose">PHENICS (Primary Health Care Electronic Network Information and Communication System) is Lebanon's National Health Information System, designed to coordinate and digitize the continuum of care delivered across Primary Health Care Centers (PHCCs) and partner hospitals. The <strong>Hospital Deliveries</strong> module governs the end-to-end management of pregnant women from pregnancy registration through delivery and postnatal care.</p>

      <p class="prose">This documentation describes the complete data flow for the hospital deliveries service program — covering pregnancy package activation, antenatal care (ANC) visit management, eligibility assessment, inter-facility referral, hospital-level activation, delivery recording, and discharge — and is intended for PHCC staff, PUI midwives, HFOs, and hospital administrators operating within PHENICS.</p>

      <div class="infobox blue">
        <div class="infobox-icon">ℹ</div>
        <div>
          <div class="infobox-title">Scope of this document</div>
          <div class="infobox-body">This document covers the operational flow for hospital deliveries and the associated file-checking procedures for the Health Field Officer (HFO). PNC services delivered at the PHCC after discharge are referenced but not separately detailed.</div>
        </div>
      </div>
    </section>

    <hr class="section-rule">

    <!-- ── S2: Data Flow ── -->
    <section class="section" id="s2">
      <div class="section-header">
        <div class="section-badge"><div class="section-num">02</div></div>
        <div>
          <div class="section-title">Overall Data Flow</div>
          <div class="section-sub">End-to-end journey across three primary actors — PHCC, PUI Midwife, and Hospital</div>
        </div>
      </div>

      <p class="prose">The workflow spans three primary actors coordinated through PHENICS. The flow is strictly sequential — each stage is a prerequisite for the next.</p>

      <div class="flow">

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--blue-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--blue-600)">Stage 1 · PHCC</div>
            <h4>Pregnancy Detection &amp; Package Activation</h4>
            <p>When pregnancy is confirmed, the Pregnancy Package is activated in PHENICS. Gestational age (number of pregnancy weeks) is a <strong>mandatory field</strong> — the package cannot be activated without it.</p>
            <div class="flow-tags">
              <span class="tag badge-blue">Pregnancy Package</span>
              <span class="tag badge-amber">Gestational age — mandatory</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--blue-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--blue-600)">Stage 2 · PHCC</div>
            <h4>ANC Visits — Auto-Approval Schedule</h4>
            <p>The pregnant woman attends ANC visits at the PHCC per the <strong>restriction manual for auto-approval</strong>. A minimum of <strong>4 ANC visits</strong> must be completed before the patient is initially eligible for the delivery service program pool.</p>
            <div class="flow-tags">
              <span class="tag badge-blue">Minimum 4 ANC visits</span>
              <span class="tag badge-amber">Auto-approval rules apply</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--blue-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--blue-600)">Stage 3 · PHCC Midwife</div>
            <h4>Medical Assessment — Eligibility Criteria</h4>
            <p>During ANC visits, the <strong>PHCC midwife</strong> fills specific medical assessment sections of the eligibility criteria — clinical risk factors, pregnancy health status, and obstetric history indicators.</p>
            <div class="flow-tags">
              <span class="tag badge-blue">Medical sections</span>
              <span class="tag badge-blue">PHCC midwife responsibility</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--purple-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--purple-600)">Stage 4 · PUI Midwife</div>
            <h4>Socio-Economic Assessment — Eligibility Criteria</h4>
            <p>After the PHCC midwife completes the medical sections, the <strong>PUI midwife</strong> fills the socio-economic section — capturing household vulnerability and financial indicators forming part of the composite eligibility score.</p>
            <div class="flow-tags">
              <span class="tag badge-purple">Socio-economic section</span>
              <span class="tag badge-purple">PUI midwife responsibility</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--green-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--green-600)">Stage 5 · System</div>
            <h4>Eligibility Score Calculation</h4>
            <p>PHENICS calculates the composite eligibility score from both sections. The patient must achieve a score of <strong>≥ 21</strong> to be eligible for the delivery program. Patients below this threshold are not referred.</p>
            <div class="flow-tags">
              <span class="tag badge-green">Score ≥ 21 → Eligible</span>
              <span class="tag" style="background:var(--coral-100);color:var(--coral-600)">Score &lt; 21 → Not referred</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--blue-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--blue-600)">Stage 6 · PHCC → Hospital</div>
            <h4>Referral Initiation — Delivery Request Act</h4>
            <p>If the score is positive, the PHCC initiates a referral through the <strong>Delivery Request Act</strong> in PHENICS. The referral form is printed and handed to the pregnant woman to carry to the hospital.</p>
            <div class="flow-tags">
              <span class="tag badge-blue">Delivery Request Act</span>
              <span class="tag badge-blue">Printed referral form</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--teal-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--teal-600)">Stage 7 · Hospital</div>
            <h4>Hospital Activation — Referral &amp; Patient IDs</h4>
            <p>The pregnant woman presents the referral form at the hospital. Staff extract two critical identifiers — the <strong>Referral ID</strong> and <strong>Patient ID</strong> — and use these to activate both the referral and the patient profile in PHENICS.</p>
            <div class="flow-tags">
              <span class="tag badge-teal">Referral ID</span>
              <span class="tag badge-teal">Patient ID</span>
              <span class="tag badge-teal">Hospital activation</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--teal-600)"></div>
            <div class="flow-line" style="background:var(--slate-200)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--teal-600)">Stage 8 · Hospital</div>
            <h4>Delivery Recording &amp; Discharge Report Upload</h4>
            <p>Delivery details are recorded in PHENICS by the hospital. Upon completion, the hospital uploads the <strong>discharge report</strong>, closing the hospital episode and triggering the transition back to primary care.</p>
            <div class="flow-tags">
              <span class="tag badge-teal">Delivery recorded</span>
              <span class="tag badge-teal">Discharge report uploaded</span>
            </div>
          </div>
        </div>

        <div class="flow-item">
          <div class="flow-spine">
            <div class="flow-dot" style="background:var(--blue-600)"></div>
          </div>
          <div class="flow-card">
            <div class="flow-card-actor" style="color:var(--blue-600)">Stage 9 · PHCC</div>
            <h4>PNC Services — Patient Return to PHCC</h4>
            <p>Following discharge, the patient is directed back to the originating PHCC to receive <strong>postnatal care (PNC) services</strong>. The PHCC continues the care episode in PHENICS within the postnatal framework.</p>
            <div class="flow-tags">
              <span class="tag badge-blue">PNC at PHCC</span>
              <span class="tag badge-blue">Continuity of care</span>
            </div>
          </div>
        </div>

      </div>
    </section>

    <hr class="section-rule">

    <!-- ── S3: Pregnancy Package ── -->
    <section class="section" id="s3">
      <div class="section-header">
        <div class="section-badge"><div class="section-num">03</div></div>
        <div>
          <div class="section-title">PHCC Initiation — Pregnancy Package</div>
          <div class="section-sub">How the pregnancy episode is opened in PHENICS</div>
        </div>
      </div>

      <p class="prose">All hospital delivery workflows originate at the PHCC. When a pregnant woman visits and pregnancy is confirmed, the <strong>Pregnancy Package</strong> is activated in PHENICS to begin tracking the maternal care episode.</p>

      <div class="infobox amber">
        <div class="infobox-icon">⚠</div>
        <div>
          <div class="infobox-title">Mandatory field — gestational age</div>
          <div class="infobox-body">The number of pregnancy weeks (gestational age) is a mandatory field. The Pregnancy Package cannot be activated without this value. Staff must confirm gestational age from clinical assessment before initiating the package.</div>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead><tr><th>Field</th><th>Requirement</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td>Gestational Age (weeks)</td><td><span class="badge badge-coral">Mandatory</span></td><td>Package cannot be activated without this value</td></tr>
            <tr><td>Patient Profile</td><td><span class="badge badge-blue">Required</span></td><td>Must be registered in PHENICS before package activation</td></tr>
            <tr><td>PHCC Identifier</td><td><span class="badge badge-slate">System-assigned</span></td><td>Automatically linked to the originating PHCC</td></tr>
            <tr><td>Pregnancy Package Date</td><td><span class="badge badge-slate">System-assigned</span></td><td>Activation date stamped automatically</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <hr class="section-rule">

    <!-- ── S4: ANC Visits ── -->
    <section class="section" id="s4">
      <div class="section-header">
        <div class="section-badge"><div class="section-num">04</div></div>
        <div>
          <div class="section-title">Antenatal Care (ANC) Visits</div>
          <div class="section-sub">Visit requirements and auto-approval restriction rules</div>
        </div>
      </div>

      <p class="prose">Following package activation, the pregnant woman attends ANC visits governed by the <strong>restriction manual for auto-approval</strong>, which defines the schedule, intervals, and clinical content required at each visit.</p>

      <div class="infobox green">
        <div class="infobox-icon">✓</div>
        <div>
          <div class="infobox-title">Minimum ANC visit threshold</div>
          <div class="infobox-body">A pregnant woman must complete a minimum of <strong>4 ANC visits</strong> at the PHCC to become initially eligible for the delivery service program pool. Patients who have not reached this threshold are not eligible for referral, regardless of their eligibility score.</div>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead><tr><th>Requirement</th><th>Value</th><th>Status in PHENICS</th></tr></thead>
          <tbody>
            <tr><td>Minimum ANC visits for eligibility</td><td>4 visits</td><td><span class="badge badge-green">System-enforced</span></td></tr>
            <tr><td>Visit scheduling</td><td>Per auto-approval restriction manual</td><td><span class="badge badge-amber">Compliance monitored</span></td></tr>
            <tr><td>Eligibility assessment trigger</td><td>After 4th ANC visit</td><td><span class="badge badge-blue">Automated unlock</span></td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <hr class="section-rule">

    <!-- ── S5: Eligibility ── -->
    <section class="section" id="s5">
      <div class="section-header">
        <div class="section-badge"><div class="section-num">05</div></div>
        <div>
          <div class="section-title">Eligibility Score &amp; Criteria</div>
          <div class="section-sub">Two-part assessment conducted by two separate actors</div>
        </div>
      </div>

      <p class="prose">Eligibility is determined through a structured two-part assessment. Both parts must be completed before PHENICS calculates the composite score.</p>

      <div class="role-grid">
        <div class="role-card role-teal">
          <h5>🩺 PHCC Midwife</h5>
          <ul>
            <li>Medical assessment sections</li>
            <li>Clinical risk factors</li>
            <li>Pregnancy health status</li>
            <li>Obstetric history indicators</li>
          </ul>
        </div>
        <div class="role-card role-purple">
          <h5>🏠 PUI Midwife</h5>
          <ul>
            <li>Socio-economic section</li>
            <li>Household vulnerability</li>
            <li>Financial indicators</li>
            <li>Displacement/residency factors</li>
          </ul>
        </div>
        <div class="role-card role-slate">
          <h5>⚙ PHENICS System</h5>
          <ul>
            <li>Aggregates both sections</li>
            <li>Calculates composite score</li>
            <li>Applies threshold rule</li>
            <li>Unlocks referral if eligible</li>
          </ul>
        </div>
      </div>

      <div class="score-widget">
        <h4>Composite eligibility score — threshold</h4>
        <div class="score-track">
          <div class="score-marker">
            <div class="score-marker-label">Score ≥ 21</div>
          </div>
        </div>
        <div class="score-scale"><span>0</span><span>10</span><span>20</span><span>30</span><span>40+</span></div>
        <div class="score-outcomes">
          <div class="score-outcome outcome-fail">
            <h5>Score &lt; 21 — Not eligible</h5>
            <p>Referral is not initiated. Patient remains in ANC management at the PHCC level.</p>
          </div>
          <div class="score-outcome outcome-pass">
            <h5>Score ≥ 21 — Eligible</h5>
            <p>Patient is eligible. PHCC proceeds to initiate a referral via the Delivery Request Act.</p>
          </div>
        </div>
      </div>

      <div class="infobox blue">
        <div class="infobox-icon">ℹ</div>
        <div>
          <div class="infobox-title">Sequential dependency</div>
          <div class="infobox-body">The PUI midwife can only fill the socio-economic section <strong>after</strong> the PHCC midwife has completed the medical sections. The score is calculated only once both parts are fully submitted. Partial completion does not trigger a score.</div>
        </div>
      </div>
    </section>

    <hr class="section-rule">

    <!-- ── S6: Hospital Activation ── -->
    <section class="section" id="s6">
      <div class="section-header">
        <div class="section-badge"><div class="section-num">06</div></div>
        <div>
          <div class="section-title">Hospital Activation Process</div>
          <div class="section-sub">Referral initiation, referral form, and hospital-side ID activation</div>
        </div>
      </div>

      <p class="prose">When the eligibility score is ≥ 21, the PHCC initiates a hospital referral through the <strong>Delivery Request Act</strong> in PHENICS. This generates a referral form that is printed and handed to the pregnant woman.</p>

      <div class="id-grid">
        <div class="id-card">
          <div class="id-card-icon">🔢</div>
          <h5>Referral ID</h5>
          <p>Unique identifier for the inter-facility referral transaction. Used to activate the referral record in PHENICS at the hospital level, linking it to the originating PHCC referral.</p>
          <code>Found on printed referral form</code>
        </div>
        <div class="id-card">
          <div class="id-card-icon">👤</div>
          <h5>Patient ID</h5>
          <p>Unique national identifier for the patient within PHENICS. Used to activate and access the patient profile at the hospital level, enabling delivery recording under the correct episode.</p>
          <code>Found on printed referral form</code>
        </div>
      </div>

      <div class="infobox amber">
        <div class="infobox-icon">⚠</div>
        <div>
          <div class="infobox-title">Both IDs are required</div>
          <div class="infobox-body">The hospital must activate both the referral (Referral ID) and the patient profile (Patient ID) in PHENICS before any delivery data can be recorded. Attempting to record a delivery without activating both will result in an error or an unlinked episode.</div>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead><tr><th>Action</th><th>Actor</th><th>PHENICS Step</th></tr></thead>
          <tbody>
            <tr><td>Initiate referral</td><td>PHCC staff</td><td>Create Delivery Request Act</td></tr>
            <tr><td>Print referral form</td><td>PHCC staff</td><td>Print from PHENICS</td></tr>
            <tr><td>Present referral form at hospital</td><td>Pregnant woman</td><td>Physical handover</td></tr>
            <tr><td>Extract Referral ID &amp; Patient ID</td><td>Hospital staff</td><td>From printed form</td></tr>
            <tr><td>Activate referral in PHENICS</td><td>Hospital staff</td><td>Using Referral ID</td></tr>
            <tr><td>Activate patient profile in PHENICS</td><td>Hospital staff</td><td>Using Patient ID</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <hr class="section-rule">

    <!-- ── S7: Delivery & Discharge ── -->
    <section class="section" id="s7">
      <div class="section-header">
        <div class="section-badge"><div class="section-num">07</div></div>
        <div>
          <div class="section-title">Delivery Recording &amp; Discharge</div>
          <div class="section-sub">Hospital recording obligations and discharge documentation</div>
        </div>
      </div>

      <p class="prose">Once the referral and patient profile are activated, the hospital records all delivery-related clinical data in PHENICS. The hospital is required to upload a <strong>discharge report</strong> upon completion of the delivery episode.</p>
    </section>

  </div>
</main>
</div>
`;

async function seedFlow() {
    try {
        const pool = await poolPromise;
        // Check if our test flow exists and replace it, otherwise insert a new one
        const check = await pool.request()
            .input('Title', 'Hospital Deliveries')
            .query('SELECT Id FROM DataFlows WHERE Title = @Title');
            
        if (check.recordset.length > 0) {
            const id = check.recordset[0].Id;
            await pool.request()
                .input('Id', id)
                .input('HtmlContent', fullHtml)
                .query('UPDATE DataFlows SET HtmlContent = @HtmlContent WHERE Id = @Id');
            console.log("Updated sample flow successfully.");
        } else {
            await pool.request()
                .input('Title', 'Hospital Deliveries')
                .input('Subtitle', 'Complete Operational Documentation')
                .input('SystemName', 'PHENICS')
                .input('Program', 'Hospital Deliveries')
                .input('Version', '1.0')
                .input('DocumentDate', 'May 2026')
                .input('HtmlContent', fullHtml)
                .query(`
                    INSERT INTO DataFlows (Title, Subtitle, SystemName, Program, Version, DocumentDate, HtmlContent)
                    VALUES (@Title, @Subtitle, @SystemName, @Program, @Version, @DocumentDate, @HtmlContent)
                `);
            console.log("Seeded sample flow successfully.");
        }
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seedFlow();
