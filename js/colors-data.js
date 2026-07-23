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
      An optional `code` (Bambu Lab's official filament SKU, e.g. '10102')
      can be added too — it's just informational, nothing reads it yet.

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

/* ── Per-series overrides of the type-level PRESETS above ──
   Only list the fields that differ from the type's default. ── */
const SERIES_PRESETS = {
  PLA: {
    Wood: { dtemp: 60, dtime: 8 },
  },
};

/* ── Series available per type (the "Series" dropdown) ── */
const SERIES_OPTIONS = {
  'PLA':  ['Basic','Matte','Silk','Metal','Tough+','Pure','Wood','Silk+',
           'Translucent','Silk Multi-Color','Galaxy','Marble','Glow',
           'Sparkle','CF','Aero','Basic Gradient'],
  'PETG': ['Basic','HF','CF','Translucent'],
  'ABS':  ['Basic'],
  'ASA':  ['Basic'],
  'TPU':  ['95A','90A','for AMS'],
  'PA':   ['Basic','CF','12-CF','HT'],
  'PC':   ['Basic'],
  'PVA':  ['Basic'],
};

/* ── Color catalog, grouped by Type → Series ── */
const COLOR_CATALOG = {
  PLA: {
    Basic: [
      { name: 'Jade White',       hex: '#FFFFFF', code: '10100' },
      { name: 'Magenta',          hex: '#EC008C', code: '10202' },
      { name: 'Gold',             hex: '#E4BD68', code: '10401' },
      { name: 'Mistletoe Green',  hex: '#3F8E43', code: '10502' },
      { name: 'Red',              hex: '#C12E1F', code: '10200' },
      { name: 'Purple',           hex: '#5E43B7', code: '10700' },
      { name: 'Beige',            hex: '#F7E6DE', code: '10201' },
      { name: 'Pink',             hex: '#F55A74', code: '10203' },
      { name: 'Sunflower Yellow', hex: '#FEC600', code: '10402' },
      { name: 'Bronze',           hex: '#847D48', code: '10801' },
      { name: 'Turquoise',        hex: '#00B1B7', code: '10605' },
      { name: 'Indigo Purple',    hex: '#482960', code: '10701' },
      { name: 'Light Gray',       hex: '#D1D3D5', code: '10104' },
      { name: 'Hot Pink',         hex: '#F5547C', code: '10204' },
      { name: 'Yellow',           hex: '#F4EE2A', code: '10400' },
      { name: 'Cocoa Brown',      hex: '#6F5034', code: '10802' },
      { name: 'Cyan',             hex: '#0086D6', code: '10603' },
      { name: 'Blue Grey',        hex: '#5B6579', code: '10602' },
      { name: 'Silver',           hex: '#A6A9AA', code: '10102' },
      { name: 'Orange',           hex: '#FF6A13', code: '10300' },
      { name: 'Bright Green',     hex: '#BECF00', code: '10503' },
      { name: 'Brown',            hex: '#9D432C', code: '10800' },
      { name: 'Blue',             hex: '#0A2989', code: '10601' },
      { name: 'Dark Gray',        hex: '#545454', code: '10105' },
      { name: 'Gray',             hex: '#8E9089', code: '10103' },
      { name: 'Pumpkin Orange',   hex: '#FF9016', code: '10301' },
      { name: 'Bambu Green',      hex: '#00AE42', code: '10501' },
      { name: 'Maroon Red',       hex: '#9D2235', code: '10205' },
      { name: 'Cobalt Blue',      hex: '#0056B8', code: '10604' },
      { name: 'Black',            hex: '#000000', code: '10101' },
    ],
    Wood: [
      { name: 'Black Walnut',  hex: '#4F3F24', code: '13107' },
      { name: 'Rosewood',      hex: '#4C241C', code: '13204' },
      { name: 'Clay Brown',    hex: '#995F11', code: '13801' },
      { name: 'Classic Birch', hex: '#918669', code: '13505' },
      { name: 'White Oak',     hex: '#D6CCA3', code: '13106' },
      { name: 'Ochre Yellow',  hex: '#C98935', code: '13403' },
    ],
    Matte: [
      { name: 'Ivory White',   hex: '#FFFFFF', code: '11100' },
      { name: 'Bone White',    hex: '#CBC6B8', code: '11103' },
      { name: 'Desert Tan',    hex: '#E8DBB7', code: '11401' },
      { name: 'Latte Brown',   hex: '#D3B7A7', code: '11800' },
      { name: 'Caramel',       hex: '#AE835B', code: '11803' },
      { name: 'Terracotta',    hex: '#B15533', code: '11203' },
      { name: 'Dark Brown',    hex: '#7D6556', code: '11801' },
      { name: 'Dark Chocolate',hex: '#4D3324', code: '11802' },
      { name: 'Lilac Purple',  hex: '#AE96D4', code: '11700' },
      { name: 'Sakura Pink',   hex: '#E8AFCF', code: '11201' },
      { name: 'Mandarin Orange', hex: '#F99963', code: '11300' },
      { name: 'Lemon Yellow',  hex: '#F7D959', code: '11400' },
      { name: 'Plum',          hex: '#950051', code: '11204' },
      { name: 'Scarlet Red',   hex: '#DE4343', code: '11200' },
      { name: 'Dark Red',      hex: '#BB3D43', code: '11202' },
      { name: 'Dark Green',    hex: '#68724D', code: '11501' },
      { name: 'Grass Green',   hex: '#61C680', code: '11500' },
      { name: 'Apple Green',   hex: '#C2E189', code: '11502' },
      { name: 'Ice Blue',      hex: '#A3D8E1', code: '11601' },
      { name: 'Sky Blue',      hex: '#56B7E6', code: '11603' },
      { name: 'Marine Blue',   hex: '#0078BF', code: '11600' },
      { name: 'Dark Blue',     hex: '#042F56', code: '11602' },
      { name: 'Ash Gray',      hex: '#9B9EA0', code: '11102' },
      { name: 'Nardo Gray',    hex: '#757575', code: '11104' },
      { name: 'Charcoal',      hex: '#000000', code: '11101' },
    ],
    Pure: [
      { name: 'Pure White',     hex: '#FFFFFF', code: '17100' },
      { name: 'Absolute Black', hex: '#000000', code: '17101' },
      { name: 'Baby Blue',      hex: '#A4DBE8', code: '17600' },
      { name: 'Milky Pink',     hex: '#F7CED7', code: '17200' },
      { name: 'Apricot',        hex: '#FFB673', code: '17300' },
    ],
    CF: [
      { name: 'Burgundy Red', hex: '#951E23', code: '14200' },
      { name: 'Iris Purple',  hex: '#69398E', code: '14700' },
      { name: 'Matcha Green', hex: '#5C9748', code: '14500' },
      { name: 'Jeans Blue',   hex: '#6E88BC', code: '14600' },
      { name: 'Royal Blue',   hex: '#2842AD', code: '14601' },
      { name: 'Lava Gray',    hex: '#4D5054', code: '14101' },
      { name: 'Black',        hex: '#000000', code: '14100' },
    ],
    'Tough+': [
      { name: 'White',  hex: '#FFFFFF', code: '12107' },
      { name: 'Gray',   hex: '#AFB1AE', code: '12105' },
      { name: 'Black',  hex: '#000000', code: '12104' },
      { name: 'Silver', hex: '#959698', code: '12106' },
      { name: 'Yellow', hex: '#F4D53F', code: '12401' },
      { name: 'Cyan',   hex: '#009BD8', code: '12601' },
      { name: 'Orange', hex: '#DC3A27', code: '12301' },
    ],
    Translucent: [
      { name: 'Teal',        hex: '#009FA1', code: '13612' },
      { name: 'Light Jade',  hex: '#96D8AF', code: '13510' },
      { name: 'Blue',        hex: '#0047BB', code: '13611' },
      { name: 'Mellow Yellow', hex: '#F5DBAB', code: '13410' },
      { name: 'Purple',      hex: '#8344B0', code: '13710' },
      { name: 'Cherry Pink', hex: '#F5B6CD', code: '13211' },
      { name: 'Orange',      hex: '#F74E02', code: '13301' },
      { name: 'Ice Blue',    hex: '#B8CDE9', code: '13610' },
      { name: 'Red',         hex: '#B50011', code: '13210' },
      { name: 'Lavender',    hex: '#B8ACD6', code: '13711' },
    ],
    Glow: [
      { name: 'Glow Green',  hex: '#A1FFAC', code: '15500' },
      { name: 'Glow Yellow', hex: '#F8FF80', code: '15400' },
      { name: 'Glow Pink',   hex: '#F17B8F', code: '15200' },
      { name: 'Glow Blue',   hex: '#7AC0E9', code: '15600' },
      { name: 'Glow Orange', hex: '#FF9D5B', code: '15300' },
    ],
    Sparkle: [
      { name: 'Classic Gold Sparkle',  hex: '#CEA629', code: '13402' },
      { name: 'Slate Gray Sparkle',    hex: '#8E9089', code: '13102' },
      { name: 'Crimson Red Sparkle',   hex: '#792B36', code: '13200' },
      { name: 'Royal Purple Sparkle',  hex: '#483D8B', code: '13700' },
      { name: 'Alpine Green Sparkle',  hex: '#3F5443', code: '13501' },
      { name: 'Onyx Black Sparkle',    hex: '#2D2B28', code: '13101' },
    ],
  },

  PETG: {
    Basic: [
      { name: 'Red',              hex: '#D6001C', code: '30201' },
      { name: 'Orange',           hex: '#FF671F', code: '30301' },
      { name: 'Yellow',           hex: '#FCE300', code: '30402' },
      { name: 'Reflex Blue',      hex: '#001489', code: '30603' },
      { name: 'Navy Blue',        hex: '#0086D6', code: '30604' },
      { name: 'Misty Blue',       hex: '#688197', code: '30108' },
      { name: 'Green',            hex: '#009639', code: '30502' },
      { name: 'Pine Green',       hex: '#034638', code: '30503' },
      { name: 'Dark Brown',       hex: '#4F2C1D', code: '30800' },
      { name: 'Dark Beige',       hex: '#DBC8B6', code: '30403' },
      { name: 'Black',            hex: '#000000', code: '30105' },
      { name: 'Gray',             hex: '#7F7E83', code: '30107' },
      { name: 'White',            hex: '#FFFFFF', code: '30106' },
    ],
    CF: [
      { name: 'Brick Red',       hex: '#9F332A', code: '31200' },
      { name: 'Violet Purple',   hex: '#583061', code: '31700' },
      { name: 'Indigo Blue',     hex: '#324585', code: '31600' },
      { name: 'Malachite Green', hex: '#16B08E', code: '31500' },
      { name: 'Black',           hex: '#000000', code: '31100' },
      { name: 'Titan Gray',      hex: '#565656', code: '31101' },
    ],
    HF: [
      { name: 'Yellow',        hex: '#FFD00B', code: '33400' },
      { name: 'Orange',        hex: '#F75403', code: '33300' },
      { name: 'Green',         hex: '#00AE42', code: '33500' },
      { name: 'Red',           hex: '#EB3A3A', code: '33200' },
      { name: 'Blue',          hex: '#002E96', code: '33600' },
      { name: 'Black',         hex: '#000000', code: '33102' },
      { name: 'White',         hex: '#FFFFFF', code: '33100' },
      { name: 'Cream',         hex: '#F9DFB9', code: '33401' },
      { name: 'Lime Green',    hex: '#6EE53C', code: '33501' },
      { name: 'Forest Green',  hex: '#39541A', code: '33502' },
      { name: 'Lake Blue',     hex: '#1F79E5', code: '33601' },
      { name: 'Peanut Brown',  hex: '#875718', code: '33801' },
      { name: 'Gray',          hex: '#ADB1B2', code: '33101' },
      { name: 'Dark Gray',     hex: '#515151', code: '33103' },
    ],
  },

  ABS: {
    Basic: [
      { name: 'White',            hex: '#FFFFFF', code: '40100' },
      { name: 'Bambu Green',      hex: '#00AE42', code: '40500' },
      { name: 'Olive',            hex: '#789D4A', code: '40502' },
      { name: 'Azure',            hex: '#489FDF', code: '40601' },
      { name: 'Navy Blue',        hex: '#0C2340', code: '40602' },
      { name: 'Blue',             hex: '#0A2CA5', code: '40600' },
      { name: 'Tangerine Yellow', hex: '#FFC72C', code: '40402' },
      { name: 'Orange',           hex: '#FF6A13', code: '40300' },
      { name: 'Red',              hex: '#D32941', code: '40200' },
      { name: 'Purple',           hex: '#AF1685' },
      { name: 'Silver',           hex: '#87909A', code: '40102' },
      { name: 'Black',            hex: '#000000', code: '40101' },
    ],
  },

  ASA: {
    Basic: [
      { name: 'White', hex: '#FFFAF2', code: '45100' },
      { name: 'Gray',  hex: '#8A949E', code: '45102' },
      { name: 'Red',   hex: '#E02928', code: '45200' },
      { name: 'Green', hex: '#00A6A0', code: '45500' },
      { name: 'Blue',  hex: '#2140B4', code: '45600' },
      { name: 'Black', hex: '#000000', code: '45101' },
    ],
  },

  TPU: {
    '90A': [
      { name: 'Black',        hex: '#000000', code: '51103' },
      { name: 'White',        hex: '#FFFFEE', code: '51105' },
      { name: 'Grape Jelly',  hex: '#D6ABFF', code: '51700' },
      { name: 'Crystal Blue', hex: '#7EB4E1', code: '51601' },
      { name: 'Cocoa Brown',  hex: '#5C4738', code: '51800' },
      { name: 'Quicksilver',  hex: '#9EA2A2', code: '51106' },
    ],
    'for AMS': [
      { name: 'Red',        hex: '#ED0000', code: '53200' },
      { name: 'Yellow',     hex: '#F9EF41', code: '53400' },
      { name: 'Blue',       hex: '#5898DD', code: '53600' },
      { name: 'Neon Green', hex: '#90FF1A', code: '53500' },
      { name: 'White',      hex: '#FFFFFF', code: '53100' },
      { name: 'Gray',       hex: '#939393', code: '53102' },
      { name: 'Black',      hex: '#000000', code: '53101' },
    ],
  },
};
