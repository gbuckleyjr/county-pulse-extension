(function () {
  'use strict';

  const canvas = document.getElementById('map-canvas');
  const stage = document.querySelector('.map-stage');
  const ctx = canvas.getContext('2d');
  const statusEl = document.getElementById('source-status');
  const modeButtons = Array.from(document.querySelectorAll('[data-mode]'));
  const rankOrderControl = document.getElementById('rank-order-control');
  const rankOrderButtons = Array.from(document.querySelectorAll('[data-rank-order]'));
  const speedRange = document.getElementById('speed-range');
  const playToggle = document.getElementById('play-toggle');
  const tooltip = document.getElementById('tooltip');
  const emptyState = document.getElementById('empty-state');

  const positiveColor = '#14957f';
  const negativeColor = '#d36435';
  const waterColor = '#e7eef0';
  const landColor = '#ece4d7';
  const missingColor = '#d6cec1';
  const countyBoundaryColor = 'rgba(72, 78, 72, 0.26)';
  const stateBoundaryColor = 'rgba(45, 54, 56, 0.44)';
  const pulseLimit = 180;
  const modeStorageKey = 'countyPulseMode';
  const rankOrderStorageKey = 'countyPulseRankOrder';
  const allowedModes = new Set(['pulse', 'build', 'scanner']);
  const allowedRankOrders = new Set(['desc', 'asc']);
  const customEncodingOrder = {
    fips: 0,
    value: 1,
    size: 2,
    label: 3
  };
  const encodingAliases = {
    fips: ['fips', 'countyfips', 'county fips'],
    value: ['value', 'signedvalue', 'signed value'],
    size: ['size', 'pulsesize', 'pulse size'],
    label: ['label']
  };

  const baseCanvas = document.createElement('canvas');
  const baseCtx = baseCanvas.getContext('2d');
  const dataByFips = new Map();

  let countyFeatures = [];
  let countyMesh = null;
  let stateMesh = null;
  let nationFeature = null;
  let projection = null;
  let basePath = null;
  let centroidPath = null;
  let width = 960;
  let height = 580;
  let pixelRatio = 1;
  let encodedRows = [];
  let pulseRows = [];
  let currentMode = 'pulse';
  let currentRankOrder = 'desc';
  let isPlaying = true;
  let animationId = 0;
  let animationClock = 0;
  let lastFrameTimestamp = null;
  let lastPointer = null;
  let baseDirty = true;
  let renderToken = 0;
  let resizeFrame = 0;
  let lastNativeTooltipTupleId = null;
  let lastNativeTooltipAt = 0;
  let worksheet = null;

  const formatNumber = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2
  });

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function showEmpty(show, message) {
    emptyState.hidden = !show;
    if (message) {
      emptyState.innerHTML = `<strong>${escapeHtml(message.title)}</strong><span>${escapeHtml(message.body)}</span>`;
    }
  }

  function tableauAvailable() {
    return Boolean(
      window.self !== window.top &&
      window.tableau &&
      tableau.extensions &&
      tableau.extensions.initializeAsync
    );
  }

  function setMode(mode, persist = true) {
    if (!allowedModes.has(mode)) return;
    currentMode = mode;
    animationClock = 0;
    for (const button of modeButtons) {
      const active = button.dataset.mode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    }
    rankOrderControl.hidden = mode !== 'build';
    if (persist) persistMode(mode);
  }

  function setRankOrder(order, persist = true) {
    if (!allowedRankOrders.has(order)) return;
    currentRankOrder = order;
    animationClock = 0;
    for (const button of rankOrderButtons) {
      const active = button.dataset.rankOrder === order;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    }
    if (persist) persistRankOrder(order);
  }

  async function persistMode(mode) {
    if (tableauAvailable() && tableau.extensions.settings && tableau.extensions.worksheetContent) {
      tableau.extensions.settings.set('animationMode', mode);
      await tableau.extensions.settings.saveAsync();
      return;
    }
    window.localStorage.setItem(modeStorageKey, mode);
  }

  async function persistRankOrder(order) {
    if (tableauAvailable() && tableau.extensions.settings && tableau.extensions.worksheetContent) {
      tableau.extensions.settings.set('rankBuildOrder', order);
      await tableau.extensions.settings.saveAsync();
      return;
    }
    window.localStorage.setItem(rankOrderStorageKey, order);
  }

  function loadStoredMode() {
    if (tableauAvailable() && tableau.extensions.settings && tableau.extensions.worksheetContent) {
      return tableau.extensions.settings.get('animationMode') || 'pulse';
    }
    return window.localStorage.getItem(modeStorageKey) || 'pulse';
  }

  function loadStoredRankOrder() {
    if (tableauAvailable() && tableau.extensions.settings && tableau.extensions.worksheetContent) {
      return tableau.extensions.settings.get('rankBuildOrder') || 'desc';
    }
    return window.localStorage.getItem(rankOrderStorageKey) || 'desc';
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

  function normalizeFieldName(field) {
    if (!field) return '';
    return field.name || field.fieldName || field.caption || field.alias || '';
  }

  function isAggregatedName(value) {
    return /\b(SUM|AVG|ATTR|COUNTD|COUNT|MIN|MAX|AGG)\(/i.test(String(value || ''));
  }

  function extractFieldsFromEncoding(encoding) {
    if (!encoding) return [];
    if (encoding.field) return [encoding.field];
    if (Array.isArray(encoding.fields)) return encoding.fields;
    return [];
  }

  function encodingKeys(encoding) {
    const candidates = [
      encoding.fieldEncodingId,
      encoding.id,
      encoding.type,
      encoding.name,
      encoding.caption,
      encoding.displayName,
      encoding.displayName && encoding.displayName.text,
      encoding.fieldEncodingName
    ].filter(Boolean);

    return candidates.map(normalizeKey).filter(Boolean);
  }

  function encodingMatches(encoding, aliases) {
    const targets = aliases.map(normalizeKey);
    const keys = encodingKeys(encoding);
    return keys.some((key) => (
      targets.some((target) => key === target || key.endsWith(target) || key.includes(target))
    ));
  }

  function isCustomEncoding(encoding) {
    return encodingKeys(encoding).includes('custom');
  }

  function extractCustomEncodingFields(encodings, targetId) {
    if (!(targetId in customEncodingOrder)) return [];
    const customEncodings = encodings
      .filter((encoding) => isCustomEncoding(encoding))
      .filter((encoding) => extractFieldsFromEncoding(encoding).length);
    const encoding = customEncodings[customEncodingOrder[targetId]];
    return encoding ? extractFieldsFromEncoding(encoding) : [];
  }

  function extractEncodingFields(encodings, targetIds, fallbackTypes = []) {
    let fields = encodings
      .filter((encoding) => targetIds.some((id) => encodingMatches(encoding, encodingAliases[id] || [id])))
      .flatMap((encoding) => extractFieldsFromEncoding(encoding));
    if (fields.length) return dedupeFields(fields);

    fields = targetIds.flatMap((id) => extractCustomEncodingFields(encodings, id));
    if (fields.length) return dedupeFields(fields);

    const fallback = encodings
      .filter((encoding) => fallbackTypes.includes(encoding.type))
      .flatMap((encoding) => extractFieldsFromEncoding(encoding));
    return dedupeFields(fallback);
  }

  function dedupeFields(fields) {
    const seen = new Set();
    return fields.filter((field) => {
      const key = normalizeFieldName(field);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function getFieldsFromEncodings(activeWorksheet) {
    const EncodingType = tableau.EncodingType || {};
    const visualSpec = await activeWorksheet.getVisualSpecificationAsync();
    const marksSpec = visualSpec.marksSpecifications[visualSpec.activeMarksSpecificationIndex];
    const encodings = marksSpec ? marksSpec.encodings : [];

    return {
      fips: extractEncodingFields(encodings, ['fips']),
      value: extractEncodingFields(encodings, ['value']),
      size: extractEncodingFields(encodings, ['size']),
      label: extractEncodingFields(encodings, ['label']),
      detail: extractEncodingFields(
        encodings,
        ['detail'],
        [EncodingType.Detail].filter(Boolean)
      ),
      tooltip: extractEncodingFields(
        encodings,
        ['tooltip'],
        [EncodingType.Tooltip].filter(Boolean)
      )
    };
  }

  function columnMatchesField(column, field) {
    const fieldName = normalizeFieldName(field);
    if (!fieldName) return false;

    const candidates = [
      column.fieldName,
      column.caption,
      column.alias,
      column.name
    ].filter(Boolean);

    if (candidates.includes(fieldName)) return true;

    const fieldKey = normalizeKey(fieldName);
    const normalizedMatch = candidates.some((candidate) => normalizeKey(candidate) === fieldKey);
    if (!normalizedMatch) return false;

    if (!isAggregatedName(column.fieldName)) return true;
    return normalizeKey(column.fieldName) === fieldKey;
  }

  function findColumn(columns, field) {
    if (!field) return null;
    return columns.find((column) => columnMatchesField(column, field)) || null;
  }

  function findColumnByName(columns, patterns) {
    return columns.find((column) => {
      const candidates = [
        column.fieldName,
        column.caption,
        column.alias,
        column.name
      ].filter(Boolean);
      return candidates.some((candidate) => {
        const normalized = normalizeKey(candidate);
        return patterns.some((pattern) => pattern.test(normalized));
      });
    }) || null;
  }

  function resolveColumn(columns, fields, patterns) {
    for (const field of fields) {
      const column = findColumn(columns, field);
      if (column) return column;
    }
    return findColumnByName(columns, patterns);
  }

  function fieldNames(fields) {
    return fields.map((field) => normalizeFieldName(field)).filter(Boolean);
  }

  function diagnosticText(fields, columns) {
    const mapped = [
      `FIPS: ${fieldNames(fields.fips).join(', ') || 'none'}`,
      `Value: ${fieldNames(fields.value).join(', ') || 'none'}`,
      `Size: ${fieldNames(fields.size).join(', ') || 'none'}`,
      `Label: ${fieldNames(fields.label).join(', ') || 'none'}`
    ].join(' | ');
    const columnNames = columns
      .map((column) => columnLabel(column))
      .filter(Boolean)
      .slice(0, 8)
      .join(', ');
    return `${mapped}. Worksheet columns seen: ${columnNames || 'none'}.`;
  }

  function columnLabel(column) {
    if (!column) return '';
    return column.caption || column.fieldName || column.name || column.alias || '';
  }

  function cellNative(cells, index) {
    const cell = cells[index];
    if (!cell) return '';
    return cell.nativeValue ?? cell.value ?? cell.formattedValue ?? '';
  }

  function cellFormatted(cells, index) {
    const cell = cells[index];
    if (!cell) return '';
    return cell.formattedValue ?? cell.value ?? cell.nativeValue ?? '';
  }

  async function readSummaryData(activeWorksheet) {
    if (activeWorksheet.getSummaryDataReaderAsync) {
      const reader = await activeWorksheet.getSummaryDataReaderAsync(10000, {
        ignoreSelection: true
      });
      const page = await reader.getPageAsync(0);
      if (reader.releaseAsync) await reader.releaseAsync();
      return page;
    }

    return activeWorksheet.getSummaryDataAsync({
      ignoreSelection: true,
      maxRows: 10000
    });
  }

  async function loadFromTableau() {
    const token = ++renderToken;
    setStatus('Reading Marks card');

    try {
      const fields = await getFieldsFromEncodings(worksheet);
      if (token !== renderToken) return;
      const table = await readSummaryData(worksheet);
      if (token !== renderToken) return;
      const rows = table.data || [];
      const columns = table.columns || [];
      const marksInfo = table.marksInfo || [];
      const fipsColumn = resolveColumn(columns, fields.fips, [
        /^countyfips$/,
        /^countyfipsstring$/,
        /^fips$/,
        /^fipsstr2020$/,
        /^statecountyareafipscode/
      ]);
      const valueColumn = resolveColumn(columns, fields.value, [
        /^signedvalue$/,
        /^totalnetmigrants$/,
        /^netmigrants$/,
        /^totalnetmigration$/,
        /^value$/
      ]);
      const sizeColumn = resolveColumn(columns, fields.size, [
        /^pulsesize$/,
        /^absolutenetmigrants$/,
        /^absnetmigrants$/,
        /^absolutenetmigration$/,
        /^magnitude$/,
        /^size$/
      ]);
      const labelColumn = resolveColumn(columns, fields.label, [
        /^label$/,
        /^county$/,
        /^countyname$/,
        /^coname2020$/,
        /^countyareaname/
      ]);
      const detailColumns = [...fields.detail, ...fields.tooltip]
        .map((field) => findColumn(columns, field))
        .filter(Boolean);

      if (!fipsColumn || !valueColumn) {
        encodedRows = [];
        pulseRows = [];
        dataByFips.clear();
        baseDirty = true;
        showEmpty(true, {
          title: 'Map fields on the Marks card.',
          body: `County FIPS and Signed Value are required. ${diagnosticText(fields, columns)}`
        });
        setStatus('Waiting for fields');
        return;
      }

      const columnIndex = new Map(columns.map((column, index) => [column.fieldName, index]));
      const fipsIndex = columnIndex.get(fipsColumn.fieldName);
      const valueIndex = columnIndex.get(valueColumn.fieldName);
      const sizeIndex = sizeColumn ? columnIndex.get(sizeColumn.fieldName) : -1;
      const labelIndex = labelColumn ? columnIndex.get(labelColumn.fieldName) : -1;
      const detailIndexes = detailColumns.map((column) => ({
        label: columnLabel(column),
        index: columnIndex.get(column.fieldName)
      }));

      encodedRows = rows
        .map((cells, index) => {
          const markInfo = marksInfo[index];
          const tupleId = markInfo ? Number(markInfo.tupleId) : null;
          const fips = normalizeFips(cellNative(cells, fipsIndex));
          const value = parseNumber(cellNative(cells, valueIndex));
          const explicitSize = sizeIndex >= 0 ? parseNumber(cellNative(cells, sizeIndex)) : null;
          const magnitude = Math.abs(explicitSize === null ? value : explicitSize);
          const label = labelIndex >= 0 ? String(cellFormatted(cells, labelIndex) || fips) : fips;
          const details = detailIndexes
            .filter((item) => Number.isInteger(item.index))
            .map((item) => ({
              label: item.label,
              value: String(cellFormatted(cells, item.index))
            }))
            .filter((item) => item.value !== '');

          return {
            fips,
            label,
            value,
            magnitude,
            details,
            tupleId: Number.isFinite(tupleId) ? tupleId : null,
            valueLabel: columnLabel(valueColumn),
            sizeLabel: sizeColumn ? columnLabel(sizeColumn) : columnLabel(valueColumn)
          };
        })
        .filter((row) => row.fips && Number.isFinite(row.value) && row.magnitude > 0);

      prepareRows();
      showEmpty(!encodedRows.length, {
        title: 'No county marks to draw.',
        body: 'Check that County FIPS values are populated and Signed Value is numeric.'
      });
      setStatus(`${formatNumber.format(encodedRows.length)} marks`);
    } catch (error) {
      console.error(error);
      showEmpty(true, {
        title: 'County Pulse could not read the worksheet.',
        body: error && error.message ? error.message : 'Check the Marks card encodings.'
      });
      setStatus('Read failed');
    }
  }

  function prepareRows() {
    dataByFips.clear();
    for (const row of encodedRows) {
      const existing = dataByFips.get(row.fips);
      if (!existing || row.magnitude > existing.magnitude) dataByFips.set(row.fips, row);
    }

    calculateCentroids();
    pulseRows = encodedRows
      .filter((row) => Number.isFinite(row.x) && Number.isFinite(row.y))
      .sort((a, b) => b.magnitude - a.magnitude)
      .slice(0, pulseLimit);
    baseDirty = true;
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
    width = Math.max(1, Math.round(bounds.width));
    height = Math.max(1, Math.round(bounds.height));
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    baseCanvas.width = canvas.width;
    baseCanvas.height = canvas.height;
    baseCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    projection = d3.geoAlbersUsa().fitSize([width, height], nationFeature);
    basePath = d3.geoPath(projection, baseCtx);
    centroidPath = d3.geoPath(projection);
    calculateCentroids();
    baseDirty = true;
  }

  function scheduleResize() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeCanvas();
      prepareRows();
    });
  }

  function calculateCentroids() {
    if (!centroidPath) return;
    for (const feature of countyFeatures) {
      const row = dataByFips.get(normalizeFips(feature.id));
      if (!row) continue;
      const centroid = centroidPath.centroid(feature);
      row.x = centroid[0];
      row.y = centroid[1];
    }
  }

  function draw(timestamp) {
    animationId = requestAnimationFrame(draw);
    const currentTimestamp = timestamp || 0;
    const elapsed = lastFrameTimestamp === null
      ? 0
      : Math.min(0.08, Math.max(0, (currentTimestamp - lastFrameTimestamp) / 1000));
    lastFrameTimestamp = currentTimestamp;

    if (isPlaying) {
      animationClock += elapsed * (Number(speedRange.value) / 90);
    }

    if (baseDirty) drawBaseMap();
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(baseCanvas, 0, 0, width, height);
    drawPulses(animationClock);
  }

  function drawBaseMap() {
    if (!basePath) return;
    baseDirty = false;
    baseCtx.clearRect(0, 0, width, height);
    baseCtx.fillStyle = waterColor;
    baseCtx.fillRect(0, 0, width, height);

    for (const feature of countyFeatures) {
      const row = dataByFips.get(normalizeFips(feature.id));
      baseCtx.beginPath();
      basePath(feature);
      baseCtx.fillStyle = row ? countyFill(row) : missingColor;
      baseCtx.fill();
    }

    baseCtx.beginPath();
    basePath(countyMesh);
    baseCtx.strokeStyle = countyBoundaryColor;
    baseCtx.lineWidth = 0.35;
    baseCtx.stroke();

    baseCtx.beginPath();
    basePath(stateMesh);
    baseCtx.strokeStyle = stateBoundaryColor;
    baseCtx.lineWidth = 0.9;
    baseCtx.stroke();
  }

  function countyFill(row) {
    const opacity = Math.min(0.72, 0.15 + Math.sqrt(row.magnitude) / 820);
    const color = d3.color(row.value >= 0 ? positiveColor : negativeColor);
    color.opacity = opacity;
    return color.toString();
  }

  function drawPulses(clock) {
    if (!pulseRows.length) return;
    const maxMagnitude = d3.max(pulseRows, (row) => row.magnitude) || 1;

    if (currentMode === 'build') {
      drawBuildMode(clock, maxMagnitude);
      return;
    }

    if (currentMode === 'scanner') {
      drawScannerMode(clock, maxMagnitude);
      return;
    }

    for (let index = 0; index < pulseRows.length; index += 1) {
      const row = pulseRows[index];
      const phase = ((clock + index * 0.031) % 1 + 1) % 1;
      const maxRadius = 5 + 34 * Math.sqrt(row.magnitude / maxMagnitude);
      const radius = 2 + maxRadius * phase;
      const alpha = 0.68 * (1 - phase);
      drawCircle(row.x, row.y, radius, row.value >= 0 ? positiveColor : negativeColor, alpha, false);
      drawCircle(row.x, row.y, Math.max(1.8, maxRadius * 0.14), row.value >= 0 ? positiveColor : negativeColor, 0.88, true);
    }
  }

  function drawBuildMode(clock, maxMagnitude) {
    const rankedRows = rankBuildRows();
    const visible = Math.max(1, Math.floor((clock % 8) / 8 * rankedRows.length));
    for (let index = 0; index < visible; index += 1) {
      const row = rankedRows[index];
      const radius = 2.5 + 19 * Math.sqrt(row.magnitude / maxMagnitude);
      drawCircle(row.x, row.y, radius, row.value >= 0 ? positiveColor : negativeColor, 0.55, false);
      drawCircle(row.x, row.y, 2.5, row.value >= 0 ? positiveColor : negativeColor, 0.95, true);
    }
  }

  function rankBuildRows() {
    const direction = currentRankOrder === 'asc' ? 1 : -1;
    return pulseRows
      .slice()
      .sort((a, b) => {
        const valueDiff = (a.value - b.value) * direction;
        if (valueDiff !== 0) return valueDiff;
        return b.magnitude - a.magnitude;
      });
  }

  function drawScannerMode(clock, maxMagnitude) {
    const wave = ((clock % 6) / 6) * (width + 220) - 110;
    for (const row of pulseRows) {
      const distance = Math.abs(row.x - wave);
      if (distance > 190) continue;
      const alpha = Math.max(0.08, 1 - distance / 150);
      const radius = 2 + 18 * Math.sqrt(row.magnitude / maxMagnitude);
      drawCircle(row.x, row.y, radius, row.value >= 0 ? positiveColor : negativeColor, alpha * 0.62, false);
    }
    ctx.beginPath();
    ctx.moveTo(wave, 0);
    ctx.lineTo(wave, height);
    ctx.strokeStyle = 'rgba(49, 95, 114, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
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
    if (tableauAvailable() && worksheet && worksheet.hoverTupleAsync) {
      tooltip.hidden = true;
      showNativeTooltip(row, event);
      return;
    }

    if (!row) {
      tooltip.hidden = true;
      return;
    }

    const detailHtml = row.details
      .slice(0, 8)
      .map((item) => `<span>${escapeHtml(item.label)} <b>${escapeHtml(item.value)}</b></span>`)
      .join('');

    tooltip.innerHTML = `
      <strong>${escapeHtml(row.label)}</strong>
      <span>${escapeHtml(row.valueLabel)} <b>${formatSigned(row.value)}</b></span>
      <span>${escapeHtml(row.sizeLabel)} <b>${formatNumber.format(row.magnitude)}</b></span>
      ${detailHtml}
    `;
    tooltip.hidden = false;

    const stageRect = stage.getBoundingClientRect();
    const left = Math.min(stageRect.width - tooltip.offsetWidth - 12, event.clientX - stageRect.left + 14);
    const top = Math.min(stageRect.height - tooltip.offsetHeight - 12, event.clientY - stageRect.top + 14);
    tooltip.style.left = `${Math.max(10, left)}px`;
    tooltip.style.top = `${Math.max(10, top)}px`;
  }

  function showNativeTooltip(row, event) {
    if (!row || !Number.isFinite(row.tupleId)) {
      clearNativeTooltip();
      return;
    }

    const now = performance.now();
    if (row.tupleId === lastNativeTooltipTupleId && now - lastNativeTooltipAt < 80) return;

    lastNativeTooltipTupleId = row.tupleId;
    lastNativeTooltipAt = now;

    worksheet.hoverTupleAsync(
      row.tupleId,
      {
        tooltipAnchorPoint: {
          x: event.clientX,
          y: event.clientY
        }
      },
      true
    ).catch((error) => {
      console.warn('Tableau tooltip failed', error);
    });
  }

  function clearNativeTooltip() {
    if (!worksheet || !worksheet.hoverTupleAsync || lastNativeTooltipTupleId === null) return;
    lastNativeTooltipTupleId = null;
    worksheet.hoverTupleAsync(0, null, false).catch(() => {});
  }

  function formatSigned(value) {
    const sign = value > 0 ? '+' : '';
    return `${sign}${formatNumber.format(value)}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function bindEvents() {
    for (const button of modeButtons) {
      button.addEventListener('click', () => setMode(button.dataset.mode));
    }

    for (const button of rankOrderButtons) {
      button.addEventListener('click', () => setRankOrder(button.dataset.rankOrder));
    }

    playToggle.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playToggle.textContent = isPlaying ? 'Pause' : 'Play';
    });

    window.addEventListener('resize', scheduleResize);

    if (window.ResizeObserver) {
      const observer = new ResizeObserver(scheduleResize);
      observer.observe(stage);
      observer.observe(document.body);
    }

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
      clearNativeTooltip();
      lastPointer = null;
    });
  }

  async function bootTableau() {
    await tableau.extensions.initializeAsync();
    worksheet = tableau.extensions.worksheetContent.worksheet;
    setRankOrder(loadStoredRankOrder(), false);
    setMode(loadStoredMode(), false);
    worksheet.addEventListener(tableau.TableauEventType.SummaryDataChanged, loadFromTableau);
    await loadFromTableau();
  }

  async function boot() {
    bindEvents();
    await loadMap();
    resizeCanvas();
    setRankOrder(loadStoredRankOrder(), false);
    setMode(loadStoredMode(), false);

    if (tableauAvailable()) {
      await bootTableau();
    } else {
      showEmpty(true, {
        title: 'Open County Pulse in Tableau.',
        body: 'Install CountyPulse.trex as a viz extension, then map fields on the Marks card.'
      });
      setStatus('Preview only');
    }

    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(draw);
  }

  boot().catch((error) => {
    console.error(error);
    showEmpty(true, {
      title: 'County Pulse failed to load.',
      body: error && error.message ? error.message : 'Check that all extension assets are hosted.'
    });
    setStatus('Load failed');
  });
}());
