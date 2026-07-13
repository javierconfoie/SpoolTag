/*
 * SpoolCard — Bambu Lab-style filament label generator
 * Copyright (C) 2026 javierconfoie (https://github.com/javierconfoie)
 * Licensed under the GNU AGPL-3.0 — see LICENSE for full terms.
 */

/* PRESETS, SERIES_OPTIONS, and COLOR_CATALOG live in js/colors-data.js */

/* ── Helpers ──────────────────────────────────────────────── */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeHex(c) {
  return /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#808080';
}

function v(id) { return document.getElementById(id).value; }

/* ── Color slots (multi-color pie) ──────────────── */
let colorSlots = [{ hex: '#a6a9aa', name: 'Silver' }];
let activeSlot = 0;
let colorMode  = 'pie';

function setColorMode(mode) { colorMode = mode; render(); }

/* ── Custom logo ─────────────────────────────────── */
let centerMode    = 'specs';
let customLogoUrl = null;
let logoRotation  = 0;
let logoScale     = 1;
let showLogo      = true;
let customBrandUrl  = null;
let brandLogoRotation = 0;
let brandLogoScale    = 1;

function toggleLogo(val) {
  showLogo = val;
  document.getElementById('brand-logo-section').style.display = val ? 'block' : 'none';
  render();
}

function onBrandLogoFileChange(input) {
  const file = input.files[0]; if (file) processBrandLogoFile(file);
}
function processBrandLogoFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    customBrandUrl = e.target.result;
    document.getElementById('brand-preview-img').src = customBrandUrl;
    document.getElementById('brand-filename').textContent = file.name;
    document.getElementById('brand-drop-zone').style.display = 'none';
    document.getElementById('brand-preview-box').style.display = 'block';
    render();
  };
  reader.readAsDataURL(file);
}
function clearBrandLogo() {
  customBrandUrl = null;
  document.getElementById('f-brand-file').value = '';
  document.getElementById('brand-preview-box').style.display = 'none';
  document.getElementById('brand-drop-zone').style.display = 'block';
  document.getElementById('f-brand-rotation').value = 0;
  document.getElementById('brand-rotation-val').textContent = '0°';
  document.getElementById('f-brand-scale').value = 100;
  document.getElementById('brand-scale-val').textContent = '100%';
  brandLogoRotation = 0; brandLogoScale = 1;
  render();
}
function onBrandLogoRotation(val) {
  brandLogoRotation = parseInt(val, 10);
  document.getElementById('brand-rotation-val').textContent = brandLogoRotation + '°';
  const inner = document.getElementById('bl-brand-inner');
  if (inner) inner.style.transform = `scale(${brandLogoScale}) rotate(${brandLogoRotation}deg)`;
}
function onBrandLogoScale(val) {
  brandLogoScale = parseInt(val, 10) / 100;
  document.getElementById('brand-scale-val').textContent = val + '%';
  const inner = document.getElementById('bl-brand-inner');
  if (inner) inner.style.transform = `scale(${brandLogoScale}) rotate(${brandLogoRotation}deg)`;
}

function setCenterMode(mode) {
  centerMode = mode;
  document.getElementById('logo-upload-section').style.display =
    mode === 'logo' ? 'block' : 'none';
  document.getElementById('specs-inputs').style.display =
    mode === 'logo' ? 'none' : 'block';
  render();
}

function processLogoFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    customLogoUrl = e.target.result;
    document.getElementById('logo-preview-img').src = customLogoUrl;
    document.getElementById('logo-filename').textContent = file.name;
    document.getElementById('logo-drop-zone').style.display = 'none';
    document.getElementById('logo-preview-box').style.display = 'block';
    render();
  };
  reader.readAsDataURL(file);
}

function onLogoFileChange(input) {
  const file = input.files[0];
  if (file) processLogoFile(file);
}

function clearLogo() {
  customLogoUrl = null;
  document.getElementById('f-logo-file').value = '';
  document.getElementById('logo-preview-box').style.display = 'none';
  document.getElementById('logo-drop-zone').style.display = 'block';
  document.getElementById('f-logo-rotation').value = 0;
  document.getElementById('rotation-val').textContent = '0°';
  document.getElementById('f-logo-scale').value = 100;
  document.getElementById('scale-val').textContent = '100%';
  logoRotation = 0; logoScale = 1;
  render();
}

function onLogoRotation(val) {
  logoRotation = parseInt(val, 10);
  document.getElementById('rotation-val').textContent = logoRotation + '°';
  render();
}

function onLogoScale(val) {
  logoScale = parseInt(val, 10) / 100;
  document.getElementById('scale-val').textContent = val + '%';
  render();
}

/* Pie SVG — html2canvas-compatible (conic-gradient isn't) */
function getColorDotSVG(slots) {
  const r = 50, cx = 50, cy = 50;
  const outlineOn = document.getElementById('f-white-outline')?.checked;
  const stroke = outlineOn
    ? `<circle cx="${cx}" cy="${cy}" r="49" fill="none" stroke="#000" stroke-width="1.5"/>`
    : '';

  /* — Gradient mode — */
  if (colorMode === 'gradient' && slots.length > 1) {
    const stops = slots.map((c, i) => {
      const pct = (i / (slots.length - 1) * 100).toFixed(1);
      return `<stop offset="${pct}%" stop-color="${c.hex}"/>`;
    }).join('');
    return `<svg class="bl-dot" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
      <defs><linearGradient id="bldg" x1="0" y1="1" x2="0" y2="0" gradientUnits="objectBoundingBox">${stops}</linearGradient></defs>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#bldg)"/>${stroke}
    </svg>`;
  }

  /* — Pie mode (default) — */
  let inner = '';
  if (slots.length === 1) {
    inner = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${slots[0].hex}"/>`;
  } else {
    const deg = 360 / slots.length;
    slots.forEach((c, i) => {
      const a1 = (i       * deg - 90) * Math.PI / 180;
      const a2 = ((i + 1) * deg - 90) * Math.PI / 180;
      const x1 = (cx + r * Math.cos(a1)).toFixed(2);
      const y1 = (cy + r * Math.sin(a1)).toFixed(2);
      const x2 = (cx + r * Math.cos(a2)).toFixed(2);
      const y2 = (cy + r * Math.sin(a2)).toFixed(2);
      inner += `<path d="M${cx},${cy}L${x1},${y1}A${r},${r} 0 ${deg > 180 ? 1 : 0} 1 ${x2},${y2}Z" fill="${c.hex}"/>`;
    });
  }
  return `<svg class="bl-dot" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
    style="flex-shrink:0">${inner}${stroke}</svg>`;
}

function renderColorSlots() {
  const container = document.getElementById('color-slots');
  container.innerHTML = colorSlots.map((c, i) => `
    <div class="color-slot${i === activeSlot ? ' active-slot' : ''}"
         onclick="setActiveSlot(${i})">
      <input type="color" value="${c.hex}"
             oninput="updateSlotColor(${i}, this.value)"
             onfocus="setActiveSlot(${i})"
             onclick="event.stopPropagation()">
      <input type="text" value="${esc(c.name)}"
             oninput="updateSlotName(${i}, this.value)"
             onfocus="setActiveSlot(${i})"
             onclick="event.stopPropagation()">
      ${colorSlots.length > 1
        ? `<button class="btn-slot-remove" title="Remove"
             onclick="removeColorSlot(${i});event.stopPropagation()">×</button>`
        : ''}
    </div>`).join('');
  document.getElementById('btn-add-color').disabled = colorSlots.length >= 4;
  buildColorPalette();
}

function setActiveSlot(i) {
  activeSlot = i;
  document.querySelectorAll('#color-slots .color-slot').forEach((el, idx) => {
    el.classList.toggle('active-slot', idx === i);
  });
  buildColorPalette();
}

function addColorSlot() {
  if (colorSlots.length >= 4) return;
  colorSlots.push({ hex: '#ffffff', name: 'Color ' + (colorSlots.length + 1) });
  activeSlot = colorSlots.length - 1;
  renderColorSlots(); suggestWhiteOutline(); render();
}

function removeColorSlot(i) {
  colorSlots.splice(i, 1);
  if (activeSlot >= colorSlots.length) activeSlot = colorSlots.length - 1;
  renderColorSlots(); suggestWhiteOutline(); render();
}

function updateSlotColor(i, hex) {
  colorSlots[i].hex = safeHex(hex);
  updateSwatchSelection(); suggestWhiteOutline(); render();
}

function updateSlotName(i, name) { colorSlots[i].name = name; render(); }

/* ── Color palette ────────────────────────────────── */
function isLightColor(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return (r*299 + g*587 + b*114) / 1000 > 186;
}

function isNearWhite(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return (r*299 + g*587 + b*114) / 1000 > 245;
}

/* Suggests the "outline for white colors" checkbox state whenever the
   color set changes; a manual click in between is left alone until then. */
function suggestWhiteOutline() {
  const cb = document.getElementById('f-white-outline');
  if (cb) cb.checked = colorSlots.some(c => isNearWhite(c.hex));
}

function buildColorPalette() {
  const type    = getType();
  const series  = getSeries().trim();
  const pal     = document.getElementById('color-palette');
  const list    = COLOR_CATALOG[type]?.[series] || [];
  if (!list.length) { pal.innerHTML = ''; return; }
  pal.innerHTML = list.map(c => {
    const shadow = isLightColor(c.hex)
      ? 'box-shadow:inset 0 0 0 1px rgba(0,0,0,0.18);' : '';
    return `<div class="color-swatch"
      data-hex="${c.hex}" data-name="${esc(c.name)}"
      style="background:${c.hex};${shadow}"
      title="${esc(c.name)}"
      onclick="selectColor(this.dataset.hex,this.dataset.name)"></div>`;
  }).join('');
  updateSwatchSelection();
}

function selectColor(hex, name) {
  colorSlots[activeSlot].hex = hex;
  colorSlots[activeSlot].name = name;
  const slots = document.querySelectorAll('.color-slot');
  if (slots[activeSlot]) {
    slots[activeSlot].querySelector('input[type=color]').value = hex;
    slots[activeSlot].querySelector('input[type=text]').value = name;
  }
  updateSwatchSelection();
  suggestWhiteOutline();
  render();
}

function updateSwatchSelection() {
  const cur = (colorSlots[activeSlot]?.hex ?? '').toLowerCase();
  document.querySelectorAll('#color-palette .color-swatch').forEach(sw => {
    sw.classList.toggle('selected', sw.dataset.hex.toLowerCase() === cur);
  });
}

/* ── Dynamic font size based on type text length ───── */
function matFontSize(text) {
  const len = text.length;
  if (len <= 2)  return '18pt';
  if (len <= 3)  return '15pt';
  if (len <= 4)  return '13pt';
  if (len <= 5)  return '11pt';
  if (len <= 7)  return '9pt';
  if (len <= 9)  return '7.5pt';
  return '6.5pt';
}

/* ── BambuLab logo (official SVG) ──────────────────────────────── */
function logoSVG() {
  return `<svg viewBox="0 0 485.05 175.15" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <style>.ll0{fill:#000}</style>
    <polygon points="160.26,143.47 160.26,101.95 148.62,101.95 148.62,153.19 191.24,153.19 187.6,143.47" class="ll0"/>
    <path d="M240.56,112.15h-40.93l3.34,8.83h37.18c0.63,0,1.13,0.51,1.13,1.13l-0.01,5.21h-33.18c-6.26,0-11.34,5.08-11.34,11.34v3.19c0,6.26,5.08,11.34,11.34,11.34h43.8l0.01-29.74C251.9,117.19,246.83,112.15,240.56,112.15zM241.26,144.27H208.5c-0.63,0-1.13-0.51-1.13-1.13v-5.82c0-0.63,0.51-1.13,1.13-1.13h32.76V144.27z" class="ll0"/>
    <path d="M300.51,112.15H273.8v-10.24h-0.22h-11.42v51.28h11.64h26.71c6.26,0,11.34-5.08,11.34-11.34v-18.36C311.85,117.23,306.77,112.15,300.51,112.15zM300.43,143.14c0,0.63-0.51,1.13-1.13,1.13h-25.5v-23.12h25.5c0.63,0,1.13,0.51,1.13,1.13V143.14z" class="ll0"/>
    <path d="M336.96,46.37h-57.65v41.04h11.31v-30.9c0-0.63,0.51-1.13,1.13-1.13h15.3c0.63,0,1.13,0.51,1.13,1.13v30.9h11.37v-30.9c0-0.63,0.51-1.13,1.13-1.13h15.08c0.63,0,1.13,0.51,1.13,1.13v30.9h11.39v-29.7C348.3,51.45,343.22,46.37,336.96,46.37z" class="ll0"/>
    <path d="M456.95,46.37v30.99c0,0.63-0.51,1.13-1.13,1.13h-27.22c-0.63,0-1.13-0.51-1.13-1.13V46.37h-10.71v29.7c0,6.26,5.08,11.34,11.34,11.34h28.15c6.26,0,11.34-5.08,11.34-11.34v-29.7H456.95z" class="ll0"/>
    <path d="M225.24,87.41h43.8l0.01-29.74c0-6.26-5.08-11.3-11.34-11.3h-40.93l3.34,8.83h37.18c0.63,0,1.13,0.51,1.13,1.13l-0.01,5.21h-33.18c-6.26,0-11.34,5.08-11.34,11.34v3.19C213.91,82.33,218.98,87.41,225.24,87.41zM224.53,71.53c0-0.63,0.51-1.13,1.13-1.13h32.76v8.08h-32.76c-0.63,0-1.13-0.51-1.13-1.13V71.53z" class="ll0"/>
    <path d="M395.9,46.37h-26.71V36.13h-0.22h-11.42v51.28h11.64h26.71c6.26,0,11.34-5.08,11.34-11.34V57.71C407.24,51.45,402.16,46.37,395.9,46.37zM395.82,77.36c0,0.63-0.51,1.13-1.13,1.13h-25.5V55.38h25.5c0.63,0,1.13,0.51,1.13,1.13V77.36z" class="ll0"/>
    <polygon points="71.11,153.19 117.59,153.19 117.59,89.8 71.11,71.5" class="ll0"/>
    <polygon points="71.11,22.84 71.11,63.69 117.59,82 117.59,22.84" class="ll0"/>
    <polygon points="17.42,22.84 17.42,104.53 63.89,86.23 63.89,22.84" class="ll0"/>
    <polygon points="17.42,153.19 63.89,153.19 63.89,94.03 17.42,112.34" class="ll0"/>
    <polygon points="148.62,27.4 148.62,38.47 160.26,34 160.26,22.93" class="ll0"/>
    <path d="M183.03,34c-2.43,0-13.77,0-22.77,0v9.13l-11.64,4.47v39.81h41.28c0.08,0,0.16,0.01,0.24,0.01c0.08,0,0.16-0.01,0.24-0.01c8.28-0.13,14.95-6.87,14.95-15.18c0-4.69-2.12-8.87-5.46-11.66c0.07-0.08,0.13-0.17,0.19-0.26c2.02-2.67,3.24-5.98,3.24-9.58c0-6.79-4.27-12.57-10.27-14.84c0,0,0,0,0,0c-2.75-1.18-5.89-1.85-9.16-1.89C183.75,34,183.33,34,183.03,34zM160.26,43.13h13.21h11.52c0.73,0,1.43,0.16,2.07,0.44c2.34,0.92,4.01,3.2,4.01,5.88c0,0-0.05,0.89-0.14,1.32c-0.34,2.04-1.7,3.66-3.53,4.42c-0.81,0.37-1.7,0.59-2.65,0.59h-12.39h-12.1V43.13zM186.61,78.5h-10.29h-16.05V64.86h16.6h3.32h6.42c1.55,0,2.98,0.53,4.12,1.4c1.63,1.25,2.69,3.21,2.69,5.42C193.42,75.45,190.37,78.5,186.61,78.5z" class="ll0"/>
  </svg>`;
}

/* ── Custom combobox ───────────────────────────────── */
const COMBO_ALL = {
  type:   Object.keys(SERIES_OPTIONS),
  series: ['Basic'],   // updated dynamically
};
let comboKbIdx = { type: -1, series: -1 };

function comboRender(id, items) {
  const list = document.getElementById('combo-list-' + id);
  if (!items.length) { list.style.display = 'none'; return; }
  list.innerHTML = items.map(o =>
    `<div class="combo-item" onmousedown="comboSelect('${id}','${esc(o)}')">${esc(o)}</div>`
  ).join('');
  list.style.display = 'block';
  comboKbIdx[id] = -1;
}

function comboOpen(id) {
  comboRender(id, COMBO_ALL[id]);
}

function comboFilter(id) {
  const val = document.getElementById('f-' + id).value.toLowerCase();
  const filtered = val
    ? COMBO_ALL[id].filter(o => o.toLowerCase().includes(val))
    : COMBO_ALL[id];
  comboRender(id, filtered);
}

function comboToggle(id) {
  const list = document.getElementById('combo-list-' + id);
  if (list.style.display === 'none') {
    document.getElementById('f-' + id).focus();
    comboOpen(id);
  } else {
    list.style.display = 'none';
  }
}

function comboSelect(id, value) {
  document.getElementById('f-' + id).value = value;
  document.getElementById('combo-list-' + id).style.display = 'none';
  if (id === 'type') onTypeChange(); else onSeriesChange();
}

function comboKey(e, id) {
  const list = document.getElementById('combo-list-' + id);
  const items = list.querySelectorAll('.combo-item');
  if (!items.length) return;
  if (e.key === 'ArrowDown')  comboKbIdx[id] = Math.min(comboKbIdx[id]+1, items.length-1);
  else if (e.key === 'ArrowUp') comboKbIdx[id] = Math.max(comboKbIdx[id]-1, 0);
  else if (e.key === 'Enter' && comboKbIdx[id] >= 0) {
    comboSelect(id, items[comboKbIdx[id]].textContent); e.preventDefault(); return;
  } else if (e.key === 'Escape') { list.style.display='none'; return; }
  items.forEach((it,i) => it.classList.toggle('kb-active', i===comboKbIdx[id]));
  if (comboKbIdx[id]>=0) items[comboKbIdx[id]].scrollIntoView({block:'nearest'});
}

document.addEventListener('mousedown', e => {
  ['type','series'].forEach(id => {
    if (!document.getElementById('f-'+id)?.closest('.combo-wrap')?.contains(e.target))
      document.getElementById('combo-list-'+id).style.display = 'none';
  });
});

/* ── Form callbacks ─────────────────────────────── */
function getType() {
  return document.getElementById('f-type').value.trim() || 'PLA';
}

function getSeries() {
  return document.getElementById('f-series').value.trim();
}

function updateSeriesOptions(type) {
  COMBO_ALL.series = SERIES_OPTIONS[type] || ['Basic'];
  const s = document.getElementById('f-series');
  if (!COMBO_ALL.series.includes(s.value)) s.value = COMBO_ALL.series[0];
}

function onSeriesChange() {
  buildColorPalette();
  render();
}

function onTypeChange() {
  const t = getType();
  const p = PRESETS[t];
  if (p) {
    document.getElementById('f-tmin').value  = p.tmin;
    document.getElementById('f-tmax').value  = p.tmax;
    document.getElementById('f-dtemp').value = p.dtemp;
    document.getElementById('f-dtime').value = p.dtime;
  }
  updateSeriesOptions(t);
  buildColorPalette();
  render();
}

/* ── Label rendering ───────────────────────────── */
function render() {
  const matType   = getType();
  const matSeries = getSeries();
  const cname = colorSlots.map(c => c.name).join(' / ');
  const fs    = matFontSize(matType);
  const specsHtml = centerMode === 'specs'
    ? buildSpecsHtml()
    : customLogoUrl
      ? `<div class="bl-specs bl-logo-custom"><img id="bl-custom-img" alt="logo"></div>`
      : `<div class="bl-specs bl-logo-custom" style="border:0.3mm dashed #ccc;margin:1mm 2mm;border-radius:1mm"></div>`;

  document.getElementById('the-label').innerHTML = `
    <div class="bl-logo" style="${showLogo ? '' : 'visibility:hidden'}">
      ${(showLogo && customBrandUrl)
        ? '<img id="bl-brand-inner" alt="brand" style="max-width:100%;max-height:100%;object-fit:contain;display:block">'
        : `<div id="bl-brand-inner" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%">${logoSVG()}</div>`}
    </div>
    <div class="bl-mat">
      <span class="bl-mat-type" style="font-size:${fs}">${esc(matType)}</span>
      <span class="bl-mat-series">${esc(matSeries)}</span>
    </div>
    ${specsHtml}
    <div class="bl-color">
      ${getColorDotSVG(colorSlots)}
      <div class="bl-dot-name">${esc(cname)}</div>
    </div>
    <div class="bl-safe-area" style="${document.getElementById('f-show-guide').checked ? '' : 'display:none'}"></div>
  `;
  if (centerMode === 'logo' && customLogoUrl) {
    const img = document.getElementById('bl-custom-img');
    if (img) { img.src = customLogoUrl; img.style.transform = `scale(${logoScale}) rotate(${logoRotation}deg)`; }
  }
  if (showLogo) {
    const inner = document.getElementById('bl-brand-inner');
    if (inner) {
      inner.style.transform = `scale(${brandLogoScale}) rotate(${brandLogoRotation}deg)`;
      if (customBrandUrl && inner.tagName === 'IMG') inner.src = customBrandUrl;
    }
  }
  updateSwatchSelection();
}

/* ── Specs: customizable fields ─────────────── */
let customSpecFields = [];

function addCustomSpec() {
  customSpecFields.push({ id: Date.now(), label: '', value: '' });
  renderCustomSpecs();
  render();
}
function removeCustomSpec(id) {
  customSpecFields = customSpecFields.filter(f => f.id !== id);
  renderCustomSpecs();
  render();
}
function updateCustomSpec(id, field, val) {
  const f = customSpecFields.find(x => x.id === id);
  if (f) { f[field] = val; render(); }
}
function renderCustomSpecs() {
  const c = document.getElementById('custom-spec-list');
  if (!c) return;
  c.innerHTML = customSpecFields.map(f => `
    <div class="custom-spec-row">
      <input type="text" value="${esc(f.label)}" placeholder="Label"
             oninput="updateCustomSpec(${f.id},'label',this.value)">
      <input type="text" value="${esc(f.value)}" placeholder="Value"
             oninput="updateCustomSpec(${f.id},'value',this.value)">
      <button class="btn-spec-remove" onclick="removeCustomSpec(${f.id})">&#x2715;</button>
    </div>`).join('');
}
function buildSpecsHtml() {
  const on = id => document.getElementById(id)?.checked !== false;
  const rows = [];
  if (on('spec-diam-on'))
    rows.push(`<div class="bl-row"><span class="rl">Diameter</span><span class="rv">${esc(v('f-diam'))} ± ${esc(v('f-tol'))} mm</span></div>`);
  if (on('spec-temp-on'))
    rows.push(`<div class="bl-row"><span class="rl">Printing Temp</span><span class="rv">${esc(v('f-tmin'))} - ${esc(v('f-tmax'))}°C</span></div>`);
  if (on('spec-weight-on'))
    rows.push(`<div class="bl-row"><span class="rl">Net Weight</span><span class="rv">${esc(v('f-weight'))}</span></div>`);
  if (on('spec-code-on'))
    rows.push(`<div class="bl-row"><span class="rl">Filament Code</span><span class="rv">${esc(v('f-code'))}</span></div>`);
  if (on('spec-dry-on'))
    rows.push(`<div class="bl-row"><span class="rl">Drying Conditions</span><span class="rv">${esc(v('f-dtemp'))}°C, ${esc(v('f-dtime'))} H</span></div>`);
  customSpecFields.forEach(f => {
    if (f.label)
      rows.push(`<div class="bl-row"><span class="rl">${esc(f.label)}</span><span class="rv">${esc(f.value)}</span></div>`);
  });
  return `<div class="bl-specs">${rows.join('')}</div>`;
}

// Initial render
renderCustomSpecs();
updateSeriesOptions('PLA');
renderColorSlots();
suggestWhiteOutline();
render();

/* ── Match the preview panel's height to the form panel's ──
   (so the print queue, however long, never grows past it) ── */
function syncPreviewPanelHeight() {
  const form    = document.querySelector('.form-panel');
  const preview = document.querySelector('.preview-panel');
  if (!form || !preview) return;
  if (window.matchMedia('(max-width: 680px)').matches) {
    preview.style.height = '';
    return;
  }
  preview.style.height = form.offsetHeight + 'px';
}
window.addEventListener('resize', syncPreviewPanelHeight);
new ResizeObserver(syncPreviewPanelHeight).observe(document.querySelector('.form-panel'));
syncPreviewPanelHeight();

// Drag-and-drop brand logo
const _bdz = document.getElementById('brand-drop-zone');
_bdz.addEventListener('dragover',  e => { e.preventDefault(); _bdz.classList.add('drag-over'); });
_bdz.addEventListener('dragleave', () => _bdz.classList.remove('drag-over'));
_bdz.addEventListener('drop', e => {
  e.preventDefault(); _bdz.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) processBrandLogoFile(f);
});

/* ── Theme ──────────────────────────────────── */
function toggleTheme(isDark) {
  const theme = isDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('bl-theme', theme);
}
// Sync checkbox with current theme
(function(){
  const t = document.documentElement.getAttribute('data-theme') || 'light';
  const inp = document.getElementById('theme-toggle-input');
  if (inp) inp.checked = (t === 'dark');
})();

/* ── Print queue ───────────────────────────────── */
let labelQueue = [];
let editingQueueId = null;

function setRadioValue(name, value) {
  const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (el) el.checked = true;
}

/* Captures the full form state so it can be restored later */
function captureLabelState() {
  return {
    type: v('f-type'),
    series: v('f-series'),
    colorSlots: JSON.parse(JSON.stringify(colorSlots)),
    activeSlot,
    colorMode,
    whiteOutline: document.getElementById('f-white-outline').checked,
    centerMode,
    customLogoUrl,
    logoRotation,
    logoScale,
    showLogo,
    customBrandUrl,
    brandLogoRotation,
    brandLogoScale,
    specs: {
      diamOn:   document.getElementById('spec-diam-on').checked,
      diam:     v('f-diam'),
      tol:      v('f-tol'),
      tempOn:   document.getElementById('spec-temp-on').checked,
      tmin:     v('f-tmin'),
      tmax:     v('f-tmax'),
      weightOn: document.getElementById('spec-weight-on').checked,
      weight:   v('f-weight'),
      codeOn:   document.getElementById('spec-code-on').checked,
      code:     v('f-code'),
      dryOn:    document.getElementById('spec-dry-on').checked,
      dtemp:    v('f-dtemp'),
      dtime:    v('f-dtime'),
    },
    customSpecFields: JSON.parse(JSON.stringify(customSpecFields)),
  };
}

/* Restores a saved state into the form */
function applyLabelState(state) {
  document.getElementById('f-type').value = state.type;
  updateSeriesOptions(state.type);
  document.getElementById('f-series').value = state.series;

  colorSlots = JSON.parse(JSON.stringify(state.colorSlots));
  activeSlot = state.activeSlot;
  colorMode  = state.colorMode;
  setRadioValue('color-display', colorMode);
  document.getElementById('f-white-outline').checked = state.whiteOutline;

  centerMode = state.centerMode;
  setRadioValue('center-mode', centerMode);
  document.getElementById('logo-upload-section').style.display = centerMode === 'logo' ? 'block' : 'none';
  document.getElementById('specs-inputs').style.display        = centerMode === 'logo' ? 'none'  : 'block';

  customLogoUrl = state.customLogoUrl;
  logoRotation  = state.logoRotation;
  logoScale     = state.logoScale;
  document.getElementById('f-logo-rotation').value = logoRotation;
  document.getElementById('rotation-val').textContent = logoRotation + '°';
  document.getElementById('f-logo-scale').value = Math.round(logoScale * 100);
  document.getElementById('scale-val').textContent = Math.round(logoScale * 100) + '%';
  document.getElementById('logo-drop-zone').style.display  = customLogoUrl ? 'none'  : 'block';
  document.getElementById('logo-preview-box').style.display = customLogoUrl ? 'block' : 'none';
  if (customLogoUrl) document.getElementById('logo-preview-img').src = customLogoUrl;

  showLogo = state.showLogo;
  document.getElementById('f-show-logo').checked = showLogo;
  document.getElementById('brand-logo-section').style.display = showLogo ? 'block' : 'none';

  customBrandUrl     = state.customBrandUrl;
  brandLogoRotation  = state.brandLogoRotation;
  brandLogoScale     = state.brandLogoScale;
  document.getElementById('f-brand-rotation').value = brandLogoRotation;
  document.getElementById('brand-rotation-val').textContent = brandLogoRotation + '°';
  document.getElementById('f-brand-scale').value = Math.round(brandLogoScale * 100);
  document.getElementById('brand-scale-val').textContent = Math.round(brandLogoScale * 100) + '%';
  document.getElementById('brand-drop-zone').style.display  = customBrandUrl ? 'none'  : 'block';
  document.getElementById('brand-preview-box').style.display = customBrandUrl ? 'block' : 'none';
  if (customBrandUrl) document.getElementById('brand-preview-img').src = customBrandUrl;

  const s = state.specs;
  document.getElementById('spec-diam-on').checked   = s.diamOn;
  document.getElementById('f-diam').value           = s.diam;
  document.getElementById('f-tol').value            = s.tol;
  document.getElementById('spec-temp-on').checked   = s.tempOn;
  document.getElementById('f-tmin').value           = s.tmin;
  document.getElementById('f-tmax').value           = s.tmax;
  document.getElementById('spec-weight-on').checked = s.weightOn;
  document.getElementById('f-weight').value         = s.weight;
  document.getElementById('spec-code-on').checked   = s.codeOn;
  document.getElementById('f-code').value           = s.code;
  document.getElementById('spec-dry-on').checked    = s.dryOn;
  document.getElementById('f-dtemp').value          = s.dtemp;
  document.getElementById('f-dtime').value          = s.dtime;

  customSpecFields = JSON.parse(JSON.stringify(state.customSpecFields));
  renderCustomSpecs();
  renderColorSlots();
  render();
}

async function addToQueue() {
  const btn = document.getElementById('btn-add-queue');
  btn.disabled = true;
  btn.textContent = 'Generating…';
  try {
    const canvas  = await generateLabelCanvas();
    const dataUrl = canvas.toDataURL('image/png');
    const label   = `${getType()} ${getSeries()} · ${colorSlots.map(c => c.name).join(' / ')}`;
    const state   = captureLabelState();
    labelQueue.push({ id: Date.now(), dataUrl, label, state });
    renderQueue();
  } catch(e) {
    alert('Error: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '+ Add to queue';
  }
}

function editQueueItem(id) {
  const item = labelQueue.find(i => i.id === id);
  if (!item) return;
  applyLabelState(item.state);
  editingQueueId = id;
  renderQueue();
}

function cancelQueueEdit() {
  editingQueueId = null;
  renderQueue();
}

async function saveQueueItem(id) {
  const item = labelQueue.find(i => i.id === id);
  if (!item) return;
  const btn = document.getElementById('btn-queue-update-' + id);
  if (btn) btn.disabled = true;
  try {
    const canvas  = await generateLabelCanvas();
    const dataUrl = canvas.toDataURL('image/png');
    const label   = `${getType()} ${getSeries()} · ${colorSlots.map(c => c.name).join(' / ')}`;
    item.dataUrl = dataUrl;
    item.label   = label;
    item.state   = captureLabelState();
    editingQueueId = null;
    renderQueue();
  } catch(e) {
    alert('Error: ' + e.message);
    if (btn) btn.disabled = false;
  }
}

function duplicateQueueItem(id) {
  const idx = labelQueue.findIndex(i => i.id === id);
  if (idx === -1) return;
  const copy = {
    id: Date.now(),
    dataUrl: labelQueue[idx].dataUrl,
    label: labelQueue[idx].label,
    state: JSON.parse(JSON.stringify(labelQueue[idx].state)),
  };
  labelQueue.splice(idx + 1, 0, copy);
  renderQueue();
}

function renderQueue() {
  const list    = document.getElementById('queue-list');
  const count   = document.getElementById('queue-count');
  count.textContent = labelQueue.length;
  document.getElementById('btn-queue-print').disabled = !labelQueue.length;
  document.getElementById('btn-queue-clear').disabled = !labelQueue.length;
  document.getElementById('btn-queue-export').disabled = !labelQueue.length;
  if (!labelQueue.length) {
    list.innerHTML = '<p class="queue-empty">Queue up several labels to print them all at once — use “+ Add to queue” below.</p>';
    return;
  }
  list.innerHTML = labelQueue.map((item, i) => {
    const isEditing = item.id === editingQueueId;
    const actions = isEditing
      ? `<button class="btn-queue-update" id="btn-queue-update-${item.id}" title="Save changes"
           onclick="saveQueueItem(${item.id});event.stopPropagation()">Update</button>
         <button class="btn-queue-cancel" title="Cancel edit"
           onclick="cancelQueueEdit();event.stopPropagation()">Cancel</button>`
      : `<button class="btn-queue-dup" title="Duplicate" onclick="duplicateQueueItem(${item.id});event.stopPropagation()">&#x29C9;</button>
         <button class="btn-queue-remove" title="Remove" onclick="removeFromQueue(${item.id});event.stopPropagation()">&#x2715;</button>`;
    return `
    <div class="queue-item${isEditing ? ' editing' : ''}" onclick="editQueueItem(${item.id})">
      <img class="queue-thumb" src="${item.dataUrl}" alt="">
      <span class="queue-num">${i + 1}.</span>
      <span class="queue-label" title="${esc(item.label)}">${esc(item.label)}</span>
      ${actions}
    </div>`;
  }).join('');
}

function removeFromQueue(id) {
  labelQueue = labelQueue.filter(item => item.id !== id);
  if (editingQueueId === id) editingQueueId = null;
  renderQueue();
}

function clearQueue() {
  labelQueue = [];
  editingQueueId = null;
  renderQueue();
}

/* ── Save/load the queue as a JSON file ───────────────── */
function exportQueueJSON() {
  if (!labelQueue.length) return;
  const payload = {
    app: 'SpoolCard',
    version: 1,
    labels: labelQueue.map(item => ({ label: item.label, state: item.state })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = 'spoolcard-labels.json';
  link.href = URL.createObjectURL(blob);
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function importQueueJSON(input) {
  const file = input.files[0];
  if (!file) return;
  try {
    const text = JSON.parse(await file.text());
    if (!Array.isArray(text.labels)) throw new Error('Not a valid SpoolCard export file.');
    for (const entry of text.labels) {
      applyLabelState(entry.state);
      const canvas  = await generateLabelCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      labelQueue.push({ id: Date.now() + Math.random(), dataUrl, label: entry.label, state: entry.state });
    }
    renderQueue();
  } catch(e) {
    alert('Error importing JSON: ' + e.message);
  } finally {
    input.value = '';
  }
}

async function printQueue() {
  if (!labelQueue.length) return;
  const btn = document.getElementById('btn-queue-print');
  btn.disabled = true;
  btn.textContent = 'Preparing…';
  try {
    const imgs = labelQueue.map(item =>
      `<img src="${item.dataUrl}" style="width:120mm;height:23mm;display:block">`
    ).join('');
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>
        @page { size: A4 portrait; margin: 10mm; }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#fff; }
        .sheet { display:flex; flex-direction:column; gap:4mm; }
      </style></head><body>
      <div class="sheet">${imgs}</div>
      <script>window.onload=()=>{ setTimeout(()=>{ window.print(); },300); }<\/script>
    </body></html>`);
    win.document.close();
  } catch(e) {
    alert('Error: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Print all';
  }
}

// Drag-and-drop logo zone
const _dz = document.getElementById('logo-drop-zone');
_dz.addEventListener('dragover',  e => { e.preventDefault(); _dz.classList.add('drag-over'); });
_dz.addEventListener('dragleave', () => _dz.classList.remove('drag-over'));
_dz.addEventListener('drop', e => {
  e.preventDefault();
  _dz.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) processLogoFile(f);
});

/* ── Helpers for embedding PNG DPI ───────────────── */
function crc32(data) {
  if (!crc32._t) {
    crc32._t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      crc32._t[i] = c;
    }
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++)
    crc = crc32._t[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function addPngDpi(buffer, dpi) {
  const ppm = Math.round(dpi / 0.0254); // pixels per meter
  const src  = new Uint8Array(buffer);
  // pHYs chunk: 4(len)+4(type)+9(data)+4(crc) = 21 bytes
  const phys = new Uint8Array(21);
  const dv   = new DataView(phys.buffer);
  dv.setUint32(0, 9);
  phys.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
  dv.setUint32(8,  ppm);                  // X px/m
  dv.setUint32(12, ppm);                  // Y px/m
  phys[16] = 1;                           // unit = meter
  dv.setUint32(17, crc32(phys.subarray(4, 17)));
  // Insert after PNG signature (8 bytes) + IHDR (25 bytes) = byte 33
  const out = new Uint8Array(src.length + 21);
  out.set(src.subarray(0, 33));
  out.set(phys, 33);
  out.set(src.subarray(33), 54);
  return out.buffer;
}

/* ── Shared canvas generator (print & export) ────── */
async function generateLabelCanvas() {
  const label = document.getElementById('the-label');

  // Clone off-screen so we don't touch the visible element (avoids a visible resize)
  const clone = label.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left     = '-9999px';
  clone.style.top      = '0';
  clone.style.zoom     = '1';
  clone.style.overflow = 'visible';
  clone.style.border   = 'none';
  clone.style.margin   = '0';
  clone.querySelector('.bl-safe-area')?.remove(); // screen-only guide, never printed
  document.body.appendChild(clone);

  try {
    const DPI = 300;
    const raw = await html2canvas(clone, {
      scale: DPI / 96,
      backgroundColor: '#ffffff',
      allowTaint: true,
      useCORS: false,
      logging: false,
    });
    const w = raw.width, h = raw.height;
    const mcy = h / 2, lcx = mcy, rcx = w - mcy;
    const out = document.createElement('canvas');
    out.width = w; out.height = h;
    const ctx = out.getContext('2d');
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(lcx, 0);   ctx.lineTo(rcx, 0);
    ctx.arc(rcx, mcy, mcy, -Math.PI / 2,  Math.PI / 2);
    ctx.lineTo(lcx, h);
    ctx.arc(lcx, mcy, mcy,  Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(raw, 0, 0);
    ctx.restore();
    const bw = 1.5, rb = mcy - bw / 2;
    ctx.strokeStyle = '#cccccc'; ctx.lineWidth = bw;
    ctx.beginPath();
    ctx.moveTo(lcx, bw / 2);   ctx.lineTo(rcx, bw / 2);
    ctx.arc(rcx, mcy, rb, -Math.PI / 2,  Math.PI / 2);
    ctx.lineTo(lcx, h - bw / 2);
    ctx.arc(lcx, mcy, rb,  Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.stroke();
    return out;
  } finally {
    document.body.removeChild(clone);
  }
}

async function printAsImage() {
  const btn    = document.getElementById('btn-print-img');
  const copies = 1;
  btn.disabled = true;
  btn.textContent = 'Preparing…';
  // Open the window right away, in the same click gesture: if we wait for
  // generateLabelCanvas() to finish before opening it, Safari and some
  // pop-up blockers block it for losing the "user gesture".
  const win = window.open('', '_blank', 'width=900,height=700');
  if (win) {
    win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;color:#888;padding:40px">Generating…</body></html>');
    win.document.close();
  }
  try {
    if (!win) throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
    const canvas  = await generateLabelCanvas();
    const dataUrl = canvas.toDataURL('image/png');
    const imgTag  = `<img src="${dataUrl}" style="width:120mm;height:23mm;display:block">`;
    win.document.open();
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>
        @page { size: A4 portrait; margin: 10mm; }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#fff; }
        .sheet { display:flex; flex-direction:column; gap:4mm; }
      </style></head><body>
      <div class="sheet">${Array(copies).fill(imgTag).join('')}</div>
      <script>window.onload=()=>{ setTimeout(()=>{ window.print(); },300); }<\/script>
    </body></html>`);
    win.document.close();
  } catch(e) {
    if (win && !win.closed) win.close();
    alert('Error preparing print: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Print label';
  }
}

async function exportPNG() {
  const btn = document.getElementById('btn-export');
  btn.disabled = true;
  btn.textContent = 'Generating...';
  try {
    const DPI    = 300;
    const canvas = await generateLabelCanvas();
    const blob   = await new Promise(res => canvas.toBlob(res, 'image/png'));
    const buf    = await blob.arrayBuffer();
    const final  = new Blob([addPngDpi(buf, DPI)], { type: 'image/png' });
    const safe   = s => s.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
    const name   = safe(getType()) + '_' + safe(colorSlots.map(c=>c.name).join('-')) + '.png';
    const link   = document.createElement('a');
    link.download = name;
    link.href     = URL.createObjectURL(final);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  } catch(e) {
    alert('Error generating PNG: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Export PNG (high res)';
  }
}
