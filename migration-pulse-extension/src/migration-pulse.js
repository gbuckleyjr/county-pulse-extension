(function () {
  'use strict';

  const canvas = document.getElementById('map-canvas');
  const stage = document.querySelector('.map-stage');
  const ctx = canvas.getContext('2d');
  const statusEl = document.getElementById('source-status');
  const configPanel = document.getElementById('config-panel');
  const configureBtn = document.getElementById('configure-source');
  const worksheetSelect = document.getElementById('worksheet-select');
  const saveSourceBtn = document.getElementById('save-source');
  const speedRange = document.getElementById('speed-range');
  const playToggle = document.getElementById('play-toggle');
  const tooltip = document.getElementById('tooltip');
  const detailTitle = document.getElementById('detail-title');
  const countiesShown = document.getElementById('counties-shown');
  const netTotal = document.getElementById('net-total');
  const netRate = document.getElementById('net-rate');
  const genderSplit = document.getElementById('gender-split');

  const gainColor = '#14957f';
  const lossColor = '#d36435';
  const landColor = '#ece4d7';
  const missingColor = '#d6cec1';
  const boundaryColor = 'rgba(72, 78, 72, 0.28)';
  const stateBoundaryColor = 'rgba(45, 54, 56, 0.42)';
  const pulseLimit = 250;
  const dataByFips = new Map();

  let allRows = [];
  let filteredRows = [];
  let pulseRows = [];
  let countyFeatures = [];
  let countyMesh = null;
  let stateMesh = null;
  let nationFeature = null;
  let projection = null;
  let path = null;
  let width = 960;
  let height = 580;
  let isPlaying = true;
  let selectedRow = null;
  let activeWorksheet = null;
  let tableauWorksheets = [];
  let animationId = 0;
  let lastPointer = null;
  let animationClock = 0;
  let lastFrameTimestamp = null;

  const formatInt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const formatRate = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function parseNumber(value) {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const parsed = Number(String(value).replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function normalizeFips(value) {
    return String(value || '').replace(/\D/g, '').padStart(5, '0').slice(-5);
  }

  function normalizeKey(value) {
    return String(value || '')
      .replace(/\[|\]/g, '')
      .replace(/\b(SUM|AVG|ATTR|COUNTD|COUNT|MIN|MAX|AGG)\((.+)\)/i, '$2')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
  }

  function valueFrom(row, keys) {
    const wanted = new Set(keys.map(normalizeKey));
    for (const [key, value] of Object.entries(row)) {
      if (wanted.has(normalizeKey(key))) return value;
    }
    return '';
  }

  function normalizeRow(row) {
    const state = valueFrom(row, ['State', 'STNAME']);
    const county = valueFrom(row, ['County', 'CoName2020', 'County/Area Name, NME 2020']);
    const fips = normalizeFips(valueFrom(row, ['County FIPS', 'fips_str2020', 'State-County/Area FIPS Code, NME 2020']));
    const femalePop = parseNumber(valueFrom(row, ['Female Population 2020', 'Population 2020, female total', 'f1ttft']));
    const malePop = parseNumber(valueFrom(row, ['Male Population 2020', 'Population 2020, male total', 'f1ttmt']));
    const netFemale = parseNumber(valueFrom(row, ['Net Female Migrants', 'Net Migrants 2010s, female total', 'm1ttft']));
    const netMale = parseNumber(valueFrom(row, ['Net Male Migrants', 'Net Migrants 2010s, male total', 'm1ttmt']));
    const totalPop = parseNumber(valueFrom(row, ['Total Population 2020'])) || femalePop + malePop;
    const totalNet = parseNumber(valueFrom(row, ['Total Net Migrants'])) || netFemale + netMale;
    const rate = totalPop ? (totalNet / totalPop) * 100 : 0;

    return {
      state,
      stateFips: normalizeFips(`${valueFrom(row, ['State FIPS', 'STFIPS']).toString().padStart(2, '0')}000`).slice(0, 2),
      county,
      fips,
      femalePop,
      malePop,
      totalPop,
      netFemale,
      netMale,
      totalNet,
      rate,
      absNet: Math.abs(totalNet),
      genderGap: netFemale - netMale
    };
  }

  function prepareRows(rows) {
    dataByFips.clear();
    allRows = rows
      .map(normalizeRow)
      .filter((row) => row.fips && row.county && row.county !== 'State Total');

    for (const row of allRows) dataByFips.set(row.fips, row);
    calculateCentroids();

    updateFilters();
  }

  function tableauAvailable() {
    return Boolean(
      window.self !== window.top &&
      window.tableau &&
      tableau.extensions &&
      tableau.extensions.initializeAsync
    );
  }

  async function initTableau() {
    if (!tableauAvailable()) return false;

    try {
      await tableau.extensions.initializeAsync({ configure: toggleConfigPanel });
      tableauWorksheets = tableau.extensions.dashboardContent.dashboard.worksheets || [];
      populateWorksheetSelect();
      const savedName = tableau.extensions.settings.get('worksheetName') || 'Extension Feed';
      activeWorksheet = tableauWorksheets.find((sheet) => sheet.name === savedName) || tableauWorksheets[0];

      if (!activeWorksheet) throw new Error('No worksheet found in dashboard.');
      await loadFromWorksheet(activeWorksheet);
      addWorksheetListeners(activeWorksheet);
      setStatus(`Tableau: ${activeWorksheet.name}`);
      return true;
    } catch (error) {
      console.warn('Tableau initialization failed; using local CSV fallback.', error);
      return false;
    }
  }

  function populateWorksheetSelect() {
    worksheetSelect.innerHTML = '';
    for (const worksheet of tableauWorksheets) {
      const option = document.createElement('option');
      option.value = worksheet.name;
      option.textContent = worksheet.name;
      worksheetSelect.appendChild(option);
    }
  }

  async function loadFromWorksheet(worksheet) {
    const table = await readSummaryData(worksheet);
    const rows = dataTableToObjects(table);
    prepareRows(rows);
  }

  async function readSummaryData(worksheet) {
    if (worksheet.getSummaryDataReaderAsync) {
      const reader = await worksheet.getSummaryDataReaderAsync(10000, {
        ignoreSelection: true
      });
      const page = await reader.getPageAsync(0);
      if (reader.releaseAsync) await reader.releaseAsync();
      return page;
    }

    return worksheet.getSummaryDataAsync({
      ignoreSelection: true,
      maxRows: 10000
    });
  }

  function dataTableToObjects(table) {
    const columns = (table.columns || []).map((column) => (
      column.fieldName || column.name || column.caption || column.id || ''
    ));

    return (table.data || []).map((cells) => {
      const row = {};
      cells.forEach((cell, index) => {
        row[columns[index]] = cell.nativeValue ?? cell.value ?? cell.formattedValue ?? '';
      });
      return row;
    });
  }

  function addWorksheetListeners(worksheet) {
    if (!window.tableau || !worksheet.addEventListener) return;
    const refresh = async () => {
      try {
        await loadFromWorksheet(worksheet);
        setStatus(`Tableau: ${worksheet.name}`);
      } catch (error) {
        setStatus('Tableau refresh failed');
        console.error(error);
      }
    };
    worksheet.addEventListener(tableau.TableauEventType.FilterChanged, refresh);
    worksheet.addEventListener(tableau.TableauEventType.SummaryDataChanged, refresh);
  }

  async function loadStandaloneCsv() {
    const candidates = [
      '../US%20County%20PopMigration.csv',
      '../US County PopMigration.csv',
      '/2026.05.11/US%20County%20PopMigration.csv',
      '/2026.05.11/US County PopMigration.csv'
    ];

    for (const url of candidates) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        const text = await response.text();
        prepareRows(d3.csvParse(text));
        setStatus('Preview: local CSV');
        return;
      } catch (error) {
        // Try next path.
      }
    }

    throw new Error('Local CSV fallback not found.');
  }

  async function loadMap() {
    const response = await fetch('assets/counties-10m.json');
    if (!response.ok) throw new Error('County topology not found.');
    const topology = await response.json();
    countyFeatures = topojson.feature(topology, topology.objects.counties).features;
    countyMesh = topojson.mesh(topology, topology.objects.counties, (a, b) => a !== b);
    stateMesh = topojson.mesh(topology, topology.objects.states, (a, b) => a !== b);
    nationFeature = topojson.feature(topology, topology.objects.nation);
  }

  function resizeCanvas() {
    const bounds = stage.getBoundingClientRect();
    width = Math.max(320, Math.round(bounds.width));
    height = Math.max(360, Math.round(bounds.height));
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    projection = d3.geoAlbersUsa().fitSize([width, height], nationFeature);
    path = d3.geoPath(projection, ctx);
    calculateCentroids();
  }

  function calculateCentroids() {
    if (!path) return;
    for (const feature of countyFeatures) {
      const row = dataByFips.get(normalizeFips(feature.id));
      if (!row) continue;
      const centroid = path.centroid(feature);
      row.x = centroid[0];
      row.y = centroid[1];
    }
  }

  function updateFilters() {
    filteredRows = allRows.slice();
    pulseRows = filteredRows
      .filter((row) => Number.isFinite(row.x) && Number.isFinite(row.y))
      .sort((a, b) => b.absNet - a.absNet)
      .slice(0, pulseLimit);

    if (selectedRow && !filteredRows.includes(selectedRow)) selectedRow = null;
    updateDetail();
  }

  function updateDetail(row) {
    const target = row || selectedRow;
    if (target) {
      detailTitle.textContent = `${target.county}, ${target.state}`;
      countiesShown.textContent = '1 selected';
      netTotal.textContent = signedInt(target.totalNet);
      netRate.textContent = `${signedRate(target.rate)} per 100`;
      genderSplit.textContent = `${signedInt(target.netFemale)} / ${signedInt(target.netMale)}`;
      return;
    }

    const totalNetValue = d3.sum(filteredRows, (rowItem) => rowItem.totalNet);
    const totalPopValue = d3.sum(filteredRows, (rowItem) => rowItem.totalPop);
    const totalFemale = d3.sum(filteredRows, (rowItem) => rowItem.netFemale);
    const totalMale = d3.sum(filteredRows, (rowItem) => rowItem.netMale);

    detailTitle.textContent = filteredRows.length >= 3000 ? 'National view' : 'Current view';
    countiesShown.textContent = `${formatInt.format(pulseRows.length)} of ${formatInt.format(filteredRows.length)}`;
    netTotal.textContent = signedInt(totalNetValue);
    netRate.textContent = `${signedRate(totalPopValue ? (totalNetValue / totalPopValue) * 100 : 0)} per 100`;
    genderSplit.textContent = `${signedInt(totalFemale)} / ${signedInt(totalMale)}`;
  }

  function signedInt(value) {
    const sign = value > 0 ? '+' : '';
    return `${sign}${formatInt.format(value)}`;
  }

  function signedRate(value) {
    const sign = value > 0 ? '+' : '';
    return `${sign}${formatRate.format(value)}`;
  }

  function draw(timestamp) {
    animationId = requestAnimationFrame(draw);
    const currentTimestamp = timestamp || 0;
    const elapsed = lastFrameTimestamp === null
      ? 0
      : Math.min(0.1, Math.max(0, (currentTimestamp - lastFrameTimestamp) / 1000));
    lastFrameTimestamp = currentTimestamp;

    if (isPlaying) {
      const speed = Number(speedRange.value) / 90;
      animationClock += elapsed * speed;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#e7eef0';
    ctx.fillRect(0, 0, width, height);
    drawCounties();
    drawPulses(animationClock);
    drawBoundaries();
  }

  function drawCounties() {
    for (const feature of countyFeatures) {
      const fips = normalizeFips(feature.id);
      const row = dataByFips.get(fips);
      ctx.beginPath();
      path(feature);
      ctx.fillStyle = row ? countyFill(row) : missingColor;
      ctx.fill();
    }
  }

  function countyFill(row) {
    const opacity = Math.min(0.72, 0.16 + Math.sqrt(row.absNet) / 820);
    const color = row.totalNet >= 0 ? d3.color(gainColor) : d3.color(lossColor);
    color.opacity = opacity;
    return color.toString();
  }

  function drawBoundaries() {
    ctx.beginPath();
    path(countyMesh);
    ctx.strokeStyle = boundaryColor;
    ctx.lineWidth = 0.35;
    ctx.stroke();

    ctx.beginPath();
    path(stateMesh);
    ctx.strokeStyle = stateBoundaryColor;
    ctx.lineWidth = 0.9;
    ctx.stroke();
  }

  function drawPulses(clock) {
    if (!pulseRows.length) return;
    const maxAbs = d3.max(pulseRows, (row) => row.absNet) || 1;

    for (let index = 0; index < pulseRows.length; index += 1) {
      const row = pulseRows[index];
      const phase = ((clock + index * 0.027) % 1 + 1) % 1;
      const maxRadius = 5 + 34 * Math.sqrt(row.absNet / maxAbs);
      const radius = 2 + maxRadius * phase;
      const alpha = 0.7 * (1 - phase);
      drawCircle(row.x, row.y, radius, row.totalNet >= 0 ? gainColor : lossColor, alpha, false);
      drawCircle(row.x, row.y, Math.max(1.8, maxRadius * 0.14), row.totalNet >= 0 ? gainColor : lossColor, 0.9, true);
    }
  }

  function drawCircle(x, y, radius, color, alpha, fill) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    const parsed = d3.color(color);
    parsed.opacity = alpha;
    if (fill) {
      ctx.fillStyle = parsed.toString();
      ctx.fill();
    } else {
      ctx.strokeStyle = parsed.toString();
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
  }

  function nearestRow(x, y) {
    let best = null;
    let bestDistance = Infinity;
    for (const row of pulseRows) {
      const distance = Math.hypot(row.x - x, row.y - y);
      if (distance < bestDistance) {
        best = row;
        bestDistance = distance;
      }
    }
    return bestDistance <= 16 ? best : null;
  }

  function showTooltip(row, event) {
    if (!row) {
      tooltip.hidden = true;
      return;
    }

    tooltip.innerHTML = `
      <strong>${escapeHtml(row.county)}, ${escapeHtml(row.state)}</strong>
      <span>Net migrants <b>${signedInt(row.totalNet)}</b></span>
      <span>Rate per 100 <b>${signedRate(row.rate)}</b></span>
      <span>Female / male <b>${signedInt(row.netFemale)} / ${signedInt(row.netMale)}</b></span>
      <span>2020 population <b>${formatInt.format(row.totalPop)}</b></span>
    `;
    tooltip.hidden = false;
    const stageRect = stage.getBoundingClientRect();
    const left = Math.min(stageRect.width - tooltip.offsetWidth - 12, event.clientX - stageRect.left + 14);
    const top = Math.min(stageRect.height - tooltip.offsetHeight - 12, event.clientY - stageRect.top + 14);
    tooltip.style.left = `${Math.max(10, left)}px`;
    tooltip.style.top = `${Math.max(10, top)}px`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function toggleConfigPanel() {
    configPanel.hidden = !configPanel.hidden;
  }

  async function saveWorksheetChoice() {
    const name = worksheetSelect.value;
    const worksheet = tableauWorksheets.find((sheet) => sheet.name === name);
    if (!worksheet) return;
    activeWorksheet = worksheet;
    if (tableauAvailable()) {
      tableau.extensions.settings.set('worksheetName', name);
      await tableau.extensions.settings.saveAsync();
    }
    await loadFromWorksheet(worksheet);
    addWorksheetListeners(worksheet);
    setStatus(`Tableau: ${worksheet.name}`);
    configPanel.hidden = true;
  }

  function bindEvents() {
    configureBtn.addEventListener('click', toggleConfigPanel);
    saveSourceBtn.addEventListener('click', saveWorksheetChoice);
    speedRange.addEventListener('input', () => {});
    playToggle.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playToggle.textContent = isPlaying ? 'Pause' : 'Play';
    });
    window.addEventListener('resize', () => {
      resizeCanvas();
      updateFilters();
    });
    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      lastPointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      showTooltip(nearestRow(lastPointer.x, lastPointer.y), event);
    });
    canvas.addEventListener('mouseleave', () => {
      tooltip.hidden = true;
      lastPointer = null;
    });
    canvas.addEventListener('click', () => {
      if (!lastPointer) return;
      selectedRow = nearestRow(lastPointer.x, lastPointer.y);
      updateDetail(selectedRow);
    });
  }

  async function boot() {
    bindEvents();
    await loadMap();
    resizeCanvas();
    const connected = await initTableau();
    if (!connected) await loadStandaloneCsv();
    updateFilters();
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(draw);
  }

  boot().catch((error) => {
    setStatus('Load failed');
    console.error(error);
  });
}());
