<!doctype html>
<html lang="en">

<head>

  <meta charset="utf-8" />

  <meta
    name="viewport"
    content="width=device-width,initial-scale=1"
  />

  <title>Imports | Dealership Performance</title>

  <link rel="stylesheet" href="./css/app.css" />
  <link rel="stylesheet" href="./css/dashboard.css" />

</head>

<body>

  <header class="topbar">

    <div>
      <p class="eyebrow">Manager Imports</p>
      <h1>Commission Data Imports</h1>
    </div>

    <div style="display:flex; gap:12px; align-items:center;">

      <select id="periodSelect" class="control">
        <option>April 2026</option>
      </select>

      <a
        href="./dashboard-manager.html"
        class="button secondary"
      >
        Dashboard
      </a>

    </div>

  </header>

  <main class="shell">

    <!-- ===================================================== -->
    <!-- IMPORT OVERVIEW -->
    <!-- ===================================================== -->

    <section class="card-grid">

      <article class="metric-card">
        <div class="label">Imports Completed</div>
        <div class="value" id="importsCompleted">0 / 7</div>
      </article>

      <article class="metric-card">
        <div class="label">Commission Period</div>
        <div class="value">April 2026</div>
      </article>

      <article class="metric-card">
        <div class="label">Rows Imported</div>
        <div class="value" id="rowsImported">0</div>
      </article>

      <article class="metric-card">
        <div class="label">Status</div>
        <div class="value">Draft</div>
      </article>

    </section>

    <!-- ===================================================== -->
    <!-- SIGN UPS -->
    <!-- ===================================================== -->

    <section class="panel import-panel">

      <div class="section-head">
        <div>
          <h2>Sign Ups</h2>
          <p class="muted">
            Paste raw BI export data directly below.
          </p>
        </div>

        <button
          class="button primary import-btn"
          data-type="signups"
        >
          Process
        </button>

      </div>

      <textarea
        id="signupsInput"
        class="import-textarea"
        placeholder="Paste Sign Ups report here..."
      ></textarea>

    </section>

    <!-- ===================================================== -->
    <!-- DEAL LOG -->
    <!-- ===================================================== -->

    <section class="panel import-panel">

      <div class="section-head">
        <div>
          <h2>Deal Log</h2>
          <p class="muted">
            Uses Processed Gross minus AM - Gross to calculate real GP.
          </p>
        </div>

        <button
          class="button primary import-btn"
          data-type="deal_log"
        >
          Process
        </button>

      </div>

      <textarea
        id="dealLogInput"
        class="import-textarea"
        placeholder="Paste Deal Log report here..."
      ></textarea>

    </section>

    <!-- ===================================================== -->
    <!-- ACCESSORIES -->
    <!-- ===================================================== -->

    <section class="panel import-panel">

      <div class="section-head">
        <div>
          <h2>Accessories</h2>
          <p class="muted">
            GP calculated from Sale Amount minus Cost Amount.
          </p>
        </div>

        <button
          class="button primary import-btn"
          data-type="accessories"
        >
          Process
        </button>

      </div>

      <textarea
        id="accessoriesInput"
        class="import-textarea"
        placeholder="Paste Accessories report here..."
      ></textarea>

    </section>

    <!-- ===================================================== -->
    <!-- FINANCE -->
    <!-- ===================================================== -->

    <section class="panel import-panel">

      <div class="section-head">
        <div>
          <h2>Finance</h2>
          <p class="muted">
            Dealer Finance used for penetration and Total Income for IPUR.
          </p>
        </div>

        <button
          class="button primary import-btn"
          data-type="finance"
        >
          Process
        </button>

      </div>

      <textarea
        id="financeInput"
        class="import-textarea"
        placeholder="Paste Finance report here..."
      ></textarea>

    </section>

    <!-- ===================================================== -->
    <!-- AFTERCARE -->
    <!-- ===================================================== -->

    <section class="panel import-panel">

      <div class="section-head">
        <div>
          <h2>Aftercare</h2>
          <p class="muted">
            Uses Total Aftermarket divided by total deals.
          </p>
        </div>

        <button
          class="button primary import-btn"
          data-type="aftercare"
        >
          Process
        </button>

      </div>

      <textarea
        id="aftercareInput"
        class="import-textarea"
        placeholder="Paste Aftercare report here..."
      ></textarea>

    </section>

    <!-- ===================================================== -->
    <!-- LEADS -->
    <!-- ===================================================== -->

    <section class="panel import-panel">

      <div class="section-head">
        <div>
          <h2>Lead Data</h2>
          <p class="muted">
            Used for lead tracking, test drives and valuation analysis.
          </p>
        </div>

        <button
          class="button primary import-btn"
          data-type="leads"
        >
          Process
        </button>

      </div>

      <textarea
        id="leadsInput"
        class="import-textarea"
        placeholder="Paste Lead Data report here..."
      ></textarea>

    </section>

    <!-- ===================================================== -->
    <!-- REVIEWS -->
    <!-- ===================================================== -->

    <section class="panel import-panel">

      <div class="section-head">
        <div>
          <h2>NPS / DAH / Google Reviews</h2>
          <p class="muted">
            Paste manually maintained review metrics here.
          </p>
        </div>

        <button
          class="button primary import-btn"
          data-type="reviews"
        >
          Process
        </button>

      </div>

      <textarea
        id="reviewsInput"
        class="import-textarea"
        placeholder="Paste NPS / DAH / Google Reviews data here..."
      ></textarea>

    </section>

    <!-- ===================================================== -->
    <!-- RESULTS -->
    <!-- ===================================================== -->

    <section class="panel">

      <div class="section-head">
        <div>
          <h2>Import Results</h2>
          <p class="muted">
            Parsed rows and processing results will appear here.
          </p>
        </div>
      </div>

      <div id="importResults">

        <div class="result-card">
          No imports processed yet.
        </div>

      </div>

    </section>

  </main>

  <script type="module" src="./js/shared/api.js"></script>
  <script type="module" src="./js/imports/import-page.js"></script>

</body>

</html>