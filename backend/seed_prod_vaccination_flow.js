// ─── FILL IN PRODUCTION CREDENTIALS ─────────────────────────────────────────
const DB_SERVER   = '';
const DB_DATABASE = '';
const DB_USER     = '';
const DB_PASSWORD = '';
// ─────────────────────────────────────────────────────────────────────────────

const sql = require('mssql');

const htmlContent = `
<div class="flow-container-wrap">
  <nav class="sidebar" role="navigation">
    <div class="sidebar-brand">
      <div class="sidebar-brand-system">PHENICS · Lebanon</div>
      <div class="sidebar-brand-title">Vaccination Records</div>
      <div class="sidebar-brand-sub">Non-PUI Patients — Operational Guide v1.0</div>
    </div>
    <div class="sidebar-part">Sections</div>
    <a class="nav-item active" href="#s1"><span class="nav-num">01</span>Overview</a>
    <a class="nav-item" href="#s2"><span class="nav-num">02</span>Step-by-Step Procedure</a>
    <a class="nav-item" href="#s3"><span class="nav-num">03</span>Quick Reference</a>
  </nav>

  <main class="main">
    <div class="hero">
      <div class="hero-content">
        <div class="hero-tag"><div class="hero-tag-dot"></div>OPERATIONAL MANUAL</div>
        <h1>PHENICS<br><em>Vaccination Records — Non-PUI Patients</em></h1>
        <p class="hero-sub">How to access vaccination history for patients not registered under the PUI program, using the EPI immunization module.</p>
        <div class="hero-meta">
          <div class="hero-meta-item">
            <div class="hero-meta-label">System</div>
            <div class="hero-meta-value">PHENICS</div>
          </div>
          <div class="hero-meta-item">
            <div class="hero-meta-label">Program</div>
            <div class="hero-meta-value">Immunization / EPI</div>
          </div>
          <div class="hero-meta-item">
            <div class="hero-meta-label">Version</div>
            <div class="hero-meta-value">1.0</div>
          </div>
          <div class="hero-meta-item">
            <div class="hero-meta-label">Date</div>
            <div class="hero-meta-value">June 2026</div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-wrap">

      <section class="section" id="s1">
        <div class="section-header">
          <div class="section-num">01</div>
          <div>
            <div class="section-title">Overview</div>
            <div class="section-sub">When and why to use this procedure</div>
          </div>
        </div>
        <p class="prose">This guide describes how to access vaccination records for patients who <strong>are registered in PHENICS but are not enrolled under the PUI program</strong>.</p>
        <div class="infobox blue">
          <div class="infobox-icon">&#8505;</div>
          <div>
            <div class="infobox-title">Who this applies to</div>
            <div class="infobox-body">Use this flow when a patient's vaccination records are <strong>not accessible via the standard PUI pathway</strong>. Their vaccination data exists in the system but must be accessed through the EPI Statistics module and the patient's Medical File.</div>
          </div>
        </div>
        <div class="infobox amber">
          <div class="infobox-icon">&#9888;</div>
          <div>
            <div class="infobox-title">Prerequisite</div>
            <div class="infobox-body">The patient must already be registered in PHENICS. If the patient does not appear in the statistics report, verify their registration status before proceeding with this flow.</div>
          </div>
        </div>
      </section>

      <hr class="section-rule">

      <section class="section" id="s2">
        <div class="section-header">
          <div class="section-num">02</div>
          <div>
            <div class="section-title">Step-by-Step Procedure</div>
            <div class="section-sub">Six steps to locate and view a patient's vaccination history</div>
          </div>
        </div>
        <p class="prose">Follow the steps below in sequence. Each step includes the navigation path within PHENICS and the expected outcome.</p>

        <div class="flow">

          <div class="flow-item">
            <div class="flow-spine">
              <div class="flow-dot" style="background:#185FA5"></div>
              <div class="flow-line" style="background:var(--slate-200)"></div>
            </div>
            <div class="flow-card">
              <div class="flow-card-actor" style="color:#185FA5">Step 1 &middot; Statistics Module</div>
              <h4>Open the Vaccination Statistics Report</h4>
              <p>From the main PHENICS menu, navigate to <strong>&#x625;&#x62D;&#x635;&#x627;&#x621;&#x627;&#x62A;</strong> (Statistics). Under the available reports, select <strong>&#x201C;&#x627;&#x644;&#x623;&#x637;&#x641;&#x627;&#x644; &#x627;&#x644;&#x630;&#x64A;&#x646; &#x62A;&#x644;&#x642;&#x648;&#x627; &#x644;&#x642;&#x627;&#x62D;&#x627;&#x62A; &#x636;&#x645;&#x646; &#x641;&#x62A;&#x631;&#x629; &#x645;&#x62D;&#x62F;&#x62F;&#x629;&#x201D;</strong> (Children Who Received Vaccines Within a Specific Period).</p>
              <div class="flow-tags">
                <span class="tag" style="background:var(--blue-100);color:var(--blue-800);">&#x625;&#x62D;&#x635;&#x627;&#x621;&#x627;&#x62A;</span>
                <span class="tag" style="background:var(--blue-100);color:var(--blue-800);">Vaccination Report</span>
              </div>
            </div>
          </div>

          <div class="flow-item">
            <div class="flow-spine">
              <div class="flow-dot" style="background:#185FA5"></div>
              <div class="flow-line" style="background:var(--slate-200)"></div>
            </div>
            <div class="flow-card">
              <div class="flow-card-actor" style="color:#185FA5">Step 2 &middot; Data Extraction</div>
              <h4>Extract the Required Data</h4>
              <p>Filter the report by the relevant <strong>reporting period</strong> (e.g., month, quarter, or custom date range). Run the report to generate the list of vaccinated children. Identify the target patient in the results to confirm their presence in the system.</p>
              <div class="flow-tags">
                <span class="tag" style="background:var(--amber-100);color:var(--amber-600);">Date Range Filter</span>
                <span class="tag" style="background:var(--amber-100);color:var(--amber-600);">Reporting Period</span>
              </div>
            </div>
          </div>

          <div class="flow-item">
            <div class="flow-spine">
              <div class="flow-dot" style="background:#3B6D11"></div>
              <div class="flow-line" style="background:var(--slate-200)"></div>
            </div>
            <div class="flow-card">
              <div class="flow-card-actor" style="color:#3B6D11">Step 3 &middot; Patient Search</div>
              <h4>Search for the Patient</h4>
              <p>Use the <strong>"Search Patient"</strong> functionality in PHENICS. Enter the patient's name, national ID, or any available identifier to locate their profile in the system.</p>
              <div class="flow-tags">
                <span class="tag" style="background:var(--green-100);color:var(--green-600);">Search Patient</span>
                <span class="tag" style="background:var(--green-100);color:var(--green-600);">Patient Lookup</span>
              </div>
            </div>
          </div>

          <div class="flow-item">
            <div class="flow-spine">
              <div class="flow-dot" style="background:#3B6D11"></div>
              <div class="flow-line" style="background:var(--slate-200)"></div>
            </div>
            <div class="flow-card">
              <div class="flow-card-actor" style="color:#3B6D11">Step 4 &middot; Patient Profile</div>
              <h4>Open the Patient's Homepage</h4>
              <p>In the search results, locate the patient and click the <strong>Home Icon</strong> next to their record. This redirects you to their <strong>&#x201C;&#x627;&#x644;&#x635;&#x641;&#x62D;&#x629; &#x627;&#x644;&#x631;&#x626;&#x64A;&#x633;&#x64A;&#x629;&#x201D;</strong> (Patient Homepage), which is the central hub for all patient data and clinical records.</p>
              <div class="flow-tags">
                <span class="tag" style="background:var(--green-100);color:var(--green-600);">Home Icon</span>
                <span class="tag" style="background:var(--green-100);color:var(--green-600);">&#x627;&#x644;&#x635;&#x641;&#x62D;&#x629; &#x627;&#x644;&#x631;&#x626;&#x64A;&#x633;&#x64A;&#x629;</span>
              </div>
            </div>
          </div>

          <div class="flow-item">
            <div class="flow-spine">
              <div class="flow-dot" style="background:#534AB7"></div>
              <div class="flow-line" style="background:var(--slate-200)"></div>
            </div>
            <div class="flow-card">
              <div class="flow-card-actor" style="color:#534AB7">Step 5 &middot; Medical File</div>
              <h4>Access the Medical File</h4>
              <p>From the patient's homepage, locate the <strong>right-side navigation menu</strong>. Select <strong>&#x201C;&#x627;&#x644;&#x645;&#x644;&#x641; &#x627;&#x644;&#x637;&#x628;&#x64A;&#x201D;</strong> (Medical File) to open the patient's complete clinical record, where all medical modules — including immunization — are accessible.</p>
              <div class="flow-tags">
                <span class="tag" style="background:var(--purple-100);color:var(--purple-600);">Right-side Menu</span>
                <span class="tag" style="background:var(--purple-100);color:var(--purple-600);">&#x627;&#x644;&#x645;&#x644;&#x641; &#x627;&#x644;&#x637;&#x628;&#x64A;</span>
              </div>
            </div>
          </div>

          <div class="flow-item">
            <div class="flow-spine">
              <div class="flow-dot" style="background:var(--teal-500)"></div>
            </div>
            <div class="flow-card">
              <div class="flow-card-actor" style="color:var(--teal-600)">Step 6 &middot; Vaccination Records</div>
              <h4>View the Vaccination Schedule</h4>
              <p>Within the Medical File, navigate to <strong>&#x201C;&#x631;&#x632;&#x646;&#x627;&#x645;&#x629; &#x627;&#x644;&#x62A;&#x644;&#x642;&#x64A;&#x62D;&#x201D;</strong> (Vaccination Schedule / Immunization Calendar). This section displays the patient's <strong>complete vaccination history</strong>, including all administered vaccines, dates of administration, doses given, and any pending scheduled immunizations.</p>
              <div class="flow-tags">
                <span class="tag" style="background:var(--teal-100);color:var(--teal-700);">&#x631;&#x632;&#x646;&#x627;&#x645;&#x629; &#x627;&#x644;&#x62A;&#x644;&#x642;&#x64A;&#x62D;</span>
                <span class="tag" style="background:var(--teal-100);color:var(--teal-700);">Vaccination History</span>
                <span class="tag" style="background:var(--teal-100);color:var(--teal-700);">Immunization Calendar</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <hr class="section-rule">

      <section class="section" id="s3">
        <div class="section-header">
          <div class="section-num">03</div>
          <div>
            <div class="section-title">Quick Reference</div>
            <div class="section-sub">Summary navigation table for all six steps</div>
          </div>
        </div>
        <p class="prose">Use this table as an at-a-glance reference when navigating the system to retrieve vaccination records.</p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Navigation Path</th>
                <th>Destination / Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="badge badge-blue">01</span></td>
                <td>Main Menu &#x2192; &#x625;&#x62D;&#x635;&#x627;&#x621;&#x627;&#x62A;</td>
                <td>&#x627;&#x644;&#x623;&#x637;&#x641;&#x627;&#x644; &#x627;&#x644;&#x630;&#x64A;&#x646; &#x62A;&#x644;&#x642;&#x648;&#x627; &#x644;&#x642;&#x627;&#x62D;&#x627;&#x62A; &#x636;&#x645;&#x646; &#x641;&#x62A;&#x631;&#x629; &#x645;&#x62D;&#x62F;&#x62F;&#x629;</td>
              </tr>
              <tr>
                <td><span class="badge badge-amber">02</span></td>
                <td>Set date range filter</td>
                <td>Generate and review the vaccination period report</td>
              </tr>
              <tr>
                <td><span class="badge badge-green">03</span></td>
                <td>Search Patient</td>
                <td>Locate patient by name, ID, or other identifier</td>
              </tr>
              <tr>
                <td><span class="badge badge-green">04</span></td>
                <td>Search Results &#x2192; Home Icon</td>
                <td>&#x627;&#x644;&#x635;&#x641;&#x62D;&#x629; &#x627;&#x644;&#x631;&#x626;&#x64A;&#x633;&#x64A;&#x629; (Patient Homepage)</td>
              </tr>
              <tr>
                <td><span class="badge badge-purple">05</span></td>
                <td>Right-side Menu &#x2192; &#x627;&#x644;&#x645;&#x644;&#x641; &#x627;&#x644;&#x637;&#x628;&#x64A;</td>
                <td>Patient Medical File</td>
              </tr>
              <tr>
                <td><span class="badge badge-teal">06</span></td>
                <td>Medical File &#x2192; &#x631;&#x632;&#x646;&#x627;&#x645;&#x629; &#x627;&#x644;&#x62A;&#x644;&#x642;&#x64A;&#x62D;</td>
                <td>Full Vaccination Schedule &amp; History</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="infobox green">
          <div class="infobox-icon">&#10003;</div>
          <div>
            <div class="infobox-title">End Result</div>
            <div class="infobox-body">You now have access to the patient's full vaccination history, including all administered vaccines, their dates, and any upcoming scheduled doses — even for patients not registered under the PUI program.</div>
          </div>
        </div>
      </section>

    </div>
  </main>
</div>
`;

async function run() {
    const pool = await new sql.ConnectionPool({
        user: DB_USER,
        password: DB_PASSWORD,
        server: DB_SERVER,
        database: DB_DATABASE,
        options: { encrypt: true, trustServerCertificate: true }
    }).connect();

    console.log('Connected to production DB.');

    await pool.request()
        .input('Title',        'Vaccination Records — Non-PUI Patients')
        .input('Subtitle',     'How to access vaccination history for patients not registered under the PUI program')
        .input('SystemName',   'PHENICS')
        .input('Program',      'Immunization / EPI')
        .input('Version',      '1.0')
        .input('DocumentDate', 'June 2026')
        .input('HtmlContent',  htmlContent)
        .query(`
            INSERT INTO DataFlows (Title, Subtitle, SystemName, Program, Version, DocumentDate, HtmlContent)
            VALUES (@Title, @Subtitle, @SystemName, @Program, @Version, @DocumentDate, @HtmlContent)
        `);

    console.log('Flow inserted successfully into production.');
    await pool.close();
}

run().catch(err => { console.error('Failed:', err); process.exit(1); });
