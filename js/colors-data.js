/*
 * SpoolCard — Bambu Lab-style filament label generator
 * Copyright (C) 2026 javierconfoie (https://github.com/javierconfoie)
 * Licensed under the GNU AGPL-3.0 — see LICENSE for full terms.
 */

/* ════════════════════════════════════════════════════════════
   CATALOG DATA — edit this file, no need to touch app.js
   ════════════════════════════════════════════════════════════

   To add a new color:
   1. Find the material type (PLA, PETG, ABS...) inside COLOR_CATALOG.
   2. Find the series (Basic, Wood, HF...). If the series doesn't exist
      yet, create it as a new array: 'MySeries': [ ... ]
   3. Add a new line with the name and hex code:
      { name: 'Color name', hex: '#RRGGBB' }

   To add a new material type, also add its default values in PRESETS
   and its series in SERIES_OPTIONS below.
   ════════════════════════════════════════════════════════════ */

/* ── Default print/drying settings per material type ──
   Print and drying temperatures per Bambu Lab's official technical data
   sheets (drying = recommended value for a "blast"-type dryer/oven, the
   one usually printed on the physical spool label). ── */
const PRESETS = {
  'PLA':  { tmin: 190, tmax: 230, dtemp: 55, dtime: 8  },
  'PETG': { tmin: 230, tmax: 260, dtemp: 65, dtime: 8  },
  'ABS':  { tmin: 240, tmax: 270, dtemp: 80, dtime: 8  },
  'ASA':  { tmin: 240, tmax: 270, dtemp: 80, dtime: 8  },
  'TPU':  { tmin: 220, tmax: 240, dtemp: 70, dtime: 8  },
  'PA':   { tmin: 260, tmax: 290, dtemp: 80, dtime: 12 },
  'PC':   { tmin: 260, tmax: 280, dtemp: 80, dtime: 8  },
  'PVA':  { tmin: 220, tmax: 250, dtemp: 80, dtime: 12 },
};

/* ── Series available per type (the "Series" dropdown) ── */
const SERIES_OPTIONS = {
  'PLA':  ['Basic','Matte','Silk','Metal','Tough+','Pure','Wood','Silk+',
           'Translucent','Silk Multi-Color','Galaxy','Marble','Glow',
           'Sparkle','CF','Aero','Basic Gradient'],
  'PETG': ['Basic','HF','CF','Translucent'],
  'ABS':  ['Basic'],
  'ASA':  ['Basic'],
  'TPU':  ['95A','90A'],
  'PA':   ['Basic','CF','12-CF','HT'],
  'PC':   ['Basic'],
  'PVA':  ['Basic'],
};

/* ── Color catalog, grouped by Type → Series ── */
const COLOR_CATALOG = {
  PLA: {
    Basic: [
      { name: 'Jade White',       hex: '#FFFFFF' },
      { name: 'Magenta',          hex: '#EC008C' },
      { name: 'Gold',             hex: '#E4BD68' },
      { name: 'Mistletoe Green',  hex: '#3F8E43' },
      { name: 'Red',              hex: '#C12E1F' },
      { name: 'Purple',           hex: '#5E43B7' },
      { name: 'Beige',            hex: '#F7E6DE' },
      { name: 'Pink',             hex: '#F55A74' },
      { name: 'Sunflower Yellow', hex: '#FEC600' },
      { name: 'Bronze',           hex: '#847D48' },
      { name: 'Turquoise',        hex: '#00B1B7' },
      { name: 'Indigo Purple',    hex: '#482960' },
      { name: 'Light Gray',       hex: '#D1D3D5' },
      { name: 'Hot Pink',         hex: '#F5547C' },
      { name: 'Yellow',           hex: '#F4EE2A' },
      { name: 'Cocoa Brown',      hex: '#6F5034' },
      { name: 'Cyan',             hex: '#0086D6' },
      { name: 'Blue Grey',        hex: '#5B6579' },
      { name: 'Silver',           hex: '#A6A9AA' },
      { name: 'Orange',           hex: '#FF6A13' },
      { name: 'Bright Green',     hex: '#BECF00' },
      { name: 'Brown',            hex: '#9D432C' },
      { name: 'Blue',             hex: '#0A2989' },
      { name: 'Dark Gray',        hex: '#545454' },
      { name: 'Gray',             hex: '#8E9089' },
      { name: 'Pumpkin Orange',   hex: '#FF9016' },
      { name: 'Bambu Green',      hex: '#00AE42' },
      { name: 'Maroon Red',       hex: '#9D2235' },
      { name: 'Cobalt Blue',      hex: '#0056B8' },
      { name: 'Black',            hex: '#000000' },
    ],
    Wood: [
      { name: 'Black Walnut',  hex: '#4F3F24' },
      { name: 'Rosewood',      hex: '#4C241C' },
      { name: 'Clay Brown',    hex: '#995F11' },
      { name: 'Classic Birch', hex: '#918669' },
      { name: 'White Oak',     hex: '#D6CCA3' },
      { name: 'Ochre Yellow',  hex: '#C98935' },
    ],
    Matte: [
      { name: 'Ivory White',   hex: '#FFFFFF' },
      { name: 'Bone White',    hex: '#CBC6B8' },
      { name: 'Desert Tan',    hex: '#E8DBB7' },
      { name: 'Latte Brown',   hex: '#D3B7A7' },
      { name: 'Caramel',       hex: '#AE835B' },
      { name: 'Terracotta',    hex: '#B15533' },
      { name: 'Dark Brown',    hex: '#7D6556' },
      { name: 'Dark Chocolate',hex: '#4D3324' },
      { name: 'Lilac Purple',  hex: '#AE96D4' },
      { name: 'Sakura Pink',   hex: '#E8AFCF' },
      { name: 'Mandarin Orange', hex: '#F99963' },
      { name: 'Lemon Yellow',  hex: '#F7D959' },
      { name: 'Plum',          hex: '#950051' },
      { name: 'Scarlet Red',   hex: '#DE4343' },
      { name: 'Dark Red',      hex: '#BB3D43' },
      { name: 'Dark Green',    hex: '#68724D' },
      { name: 'Grass Green',   hex: '#61C680' },
      { name: 'Apple Green',   hex: '#C2E189' },
      { name: 'Ice Blue',      hex: '#A3D8E1' },
      { name: 'Sky Blue',      hex: '#56B7E6' },
      { name: 'Marine Blue',   hex: '#0078BF' },
      { name: 'Dark Blue',     hex: '#042F56' },
      { name: 'Ash Gray',      hex: '#9B9EA0' },
      { name: 'Nardo Gray',    hex: '#757575' },
      { name: 'Charcoal',      hex: '#000000' },
    ],
    Pure: [
      { name: 'Pure White',     hex: '#FFFFFF' },
      { name: 'Absolute Black', hex: '#000000' },
      { name: 'Baby Blue',      hex: '#A4DBE8' },
      { name: 'Milky Pink',     hex: '#F7CED7' },
      { name: 'Apricot',        hex: '#FFB673' },
    ],
    CF: [
      { name: 'Burgundy Red', hex: '#951E23' },
      { name: 'Iris Purple',  hex: '#69398E' },
      { name: 'Matcha Green', hex: '#5C9748' },
      { name: 'Jeans Blue',   hex: '#6E88BC' },
      { name: 'Royal Blue',   hex: '#2842AD' },
      { name: 'Lava Gray',    hex: '#4D5054' },
      { name: 'Black',        hex: '#000000' },
    ],
    'Tough+': [
      { name: 'White',  hex: '#FFFFFF' },
      { name: 'Gray',   hex: '#AFB1AE' },
      { name: 'Black',  hex: '#000000' },
      { name: 'Silver', hex: '#959698' },
      { name: 'Yellow', hex: '#F4D53F' },
      { name: 'Cyan',   hex: '#009BD8' },
      { name: 'Orange', hex: '#DC3A27' },
    ],
    Translucent: [
      { name: 'Teal',        hex: '#009FA1' },
      { name: 'Light Jade',  hex: '#96D8AF' },
      { name: 'Blue',        hex: '#0047BB' },
      { name: 'Mellow Yellow', hex: '#F5DBAB' },
      { name: 'Purple',      hex: '#8344B0' },
      { name: 'Cherry Pink', hex: '#F5B6CD' },
      { name: 'Orange',      hex: '#F74E02' },
      { name: 'Ice Blue',    hex: '#B8CDE9' },
      { name: 'Red',         hex: '#B50011' },
      { name: 'Lavender',    hex: '#B8ACD6' },
    ],
    Glow: [
      { name: 'Glow Green',  hex: '#A1FFAC' },
      { name: 'Glow Yellow', hex: '#F8FF80' },
      { name: 'Glow Pink',   hex: '#F17B8F' },
      { name: 'Glow Blue',   hex: '#7AC0E9' },
      { name: 'Glow Orange', hex: '#FF9D5B' },
    ],
  },

  PETG: {
    Basic: [
      { name: 'Red',              hex: '#D6001C' },
      { name: 'Orange',           hex: '#FF671F' },
      { name: 'Yellow',           hex: '#FCE300' },
      { name: 'Reflex Blue',      hex: '#001489' },
      { name: 'Navy Blue',        hex: '#0086D6' },
      { name: 'Misty Blue',       hex: '#688197' },
      { name: 'Green',            hex: '#009639' },
      { name: 'Pine Green',       hex: '#034638' },
      { name: 'Dark Brown',       hex: '#4F2C1D' },
      { name: 'Dark Beige',       hex: '#DBC8B6' },
      { name: 'Black',            hex: '#000000' },
      { name: 'Gray',             hex: '#7F7E83' },
      { name: 'White',            hex: '#FFFFFF' },
    ],
    CF: [
      { name: 'Brick Red',       hex: '#9F332A' },
      { name: 'Violet Purple',   hex: '#583061' },
      { name: 'Indigo Blue',     hex: '#324585' },
      { name: 'Malachite Green', hex: '#16B08E' },
      { name: 'Black',           hex: '#000000' },
      { name: 'Titan Gray',      hex: '#565656' },
    ],
    HF: [
      { name: 'Yellow',        hex: '#FFD00B' },
      { name: 'Orange',        hex: '#F75403' },
      { name: 'Green',         hex: '#00AE42' },
      { name: 'Red',           hex: '#EB3A3A' },
      { name: 'Blue',          hex: '#002E96' },
      { name: 'Black',         hex: '#000000' },
      { name: 'White',         hex: '#FFFFFF' },
      { name: 'Cream',         hex: '#F9DFB9' },
      { name: 'Lime Green',    hex: '#6EE53C' },
      { name: 'Forest Green',  hex: '#39541A' },
      { name: 'Lake Blue',     hex: '#1F79E5' },
      { name: 'Peanut Brown',  hex: '#875718' },
      { name: 'Gray',          hex: '#ADB1B2' },
      { name: 'Dark Gray',     hex: '#515151' },
    ],
  },

  ABS: {
    Basic: [
      { name: 'White',            hex: '#FFFFFF' },
      { name: 'Bambu Green',      hex: '#00AE42' },
      { name: 'Olive',            hex: '#789D4A' },
      { name: 'Azure',            hex: '#489FDF' },
      { name: 'Navy Blue',        hex: '#0C2340' },
      { name: 'Blue',             hex: '#0A2CA5' },
      { name: 'Tangerine Yellow', hex: '#FFC72C' },
      { name: 'Orange',           hex: '#FF6A13' },
      { name: 'Red',              hex: '#D32941' },
      { name: 'Purple',           hex: '#AF1685' },
      { name: 'Silver',           hex: '#87909A' },
      { name: 'Black',            hex: '#000000' },
    ],
  },

  ASA: {
    Basic: [
      { name: 'White', hex: '#FFFAF2' },
      { name: 'Gray',  hex: '#8A949E' },
      { name: 'Red',   hex: '#E02928' },
      { name: 'Green', hex: '#00A6A0' },
      { name: 'Blue',  hex: '#2140B4' },
      { name: 'Black', hex: '#000000' },
    ],
  },

  TPU: {
    '90A': [
      { name: 'Black',        hex: '#000000' },
      { name: 'White',        hex: '#FFFFEE' },
      { name: 'Grape Jelly',  hex: '#D6ABFF' },
      { name: 'Crystal Blue', hex: '#7EB4E1' },
      { name: 'Cocoa Brown',  hex: '#5C4738' },
      { name: 'Quicksilver',  hex: '#9EA2A2' },
    ],
  },
};
