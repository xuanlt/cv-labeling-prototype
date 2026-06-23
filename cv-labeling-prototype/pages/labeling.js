// ─── Annotation Engine ────────────────────────────────────────────────────────

const NS = 'http://www.w3.org/2000/svg';
const IMG_W = 640, IMG_H = 480;

// Class registry — source of truth for classes
const classRegistry = [
  { id:1, name:'license_plate', color:'#e53e3e', key:'1' },
  { id:2, name:'vehicle',       color:'#3182ce', key:'2' },
  { id:3, name:'text_region',   color:'#38a169', key:'3' },
];
let classIdCounter = 4;

// Per-image annotation store
const imageStore = {
  'img_0040.jpg': { bg:'linear-gradient(135deg,#243040,#1e2832)',    anns:[{id:1,type:'bbox',cid:1,x:85,y:105,w:175,h:52},{id:2,type:'bbox',cid:2,x:45,y:65,w:275,h:215}] },
  'img_0041.jpg': { bg:'linear-gradient(135deg,#2a3a28,#1e2832)',    anns:[{id:1,type:'bbox',cid:1,x:195,y:155,w:148,h:48}] },
  'img_0042.jpg': { bg:'linear-gradient(135deg,#0a1520 0%,#0f1e2e 20%,#08141e 40%,#0d1e14 60%,#0a1220 80%,#04080e 100%)',
    anns:[
      {id:1,type:'bbox',cid:1,x:120,y:180,w:200,h:60},
      {id:2,type:'bbox',cid:2,x:60,y:100,w:320,h:260},
      {id:3,type:'poly',cid:3,pts:[[280,150],[340,140],[360,160],[350,190],[290,185]]}
    ]
  },
  'img_0043.jpg': { bg:'linear-gradient(135deg,#1a1a2e,#16213e)',    anns:[] },
  'img_0044.jpg': { bg:'linear-gradient(135deg,#1e1010,#2a1a1a)',    anns:[] },
  'img_0045.jpg': { bg:'linear-gradient(135deg,#1a2028,#12181e)',    anns:[] },
  'img_0046.jpg': { bg:'linear-gradient(135deg,#1e1010,#2a1a1a)',    anns:[] },
  'img_0047.jpg': { bg:'linear-gradient(135deg,#1c1c28,#141420)',    anns:[] },
};

let currentImg = 'img_0042.jpg';
let annotations = clone(imageStore[currentImg].anns);
const undoStack = [], redoStack = [];
let nextId = 10;
let selectedId = null;
let activeTool = 'bbox';
let activeClassId = 1;
let zoom = 1;
let panX = 0, panY = 0;

// Drawing state
let drawing = false;
let drawAnchor = null, drawCurrent = null;

// Move/resize state
let dragging = false;
let dragMode = null, dragStart = null, dragOrigAnn = null;

// Polygon state
let polyPts = [], polyMouse = null;

// Space pan state
let spacePan = false, panning = false;
let panClientStart = null, panAtStart = null;

// Global mouse handlers (added/removed dynamically so drag works outside SVG)
let _globalMove = null, _globalUp = null;

function clone(o) { return JSON.parse(JSON.stringify(o)); }

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mockImage').style.background = imageStore[currentImg].bg;
  document.querySelectorAll('.img-list-item').forEach(el => {
    el.addEventListener('click', () => selectImage(el.dataset.img));
  });

  const svg = document.getElementById('annSvg');
  svg.addEventListener('mousedown', onSvgDown);
  svg.addEventListener('mousemove', onSvgMove);
  svg.addEventListener('mouseleave', () => { polyMouse = null; if (activeTool==='polygon') render(); });
  svg.addEventListener('dblclick', e => { if (activeTool==='polygon' && polyPts.length>=3) { e.preventDefault(); closePoly(); } });
  svg.addEventListener('wheel', e => { e.preventDefault(); zoomStep(e.deltaY < 0 ? 0.15 : -0.15); }, { passive:false });
  svg.addEventListener('contextmenu', e => { if (!e.target.closest('[data-ann-id]')) e.preventDefault(); });

  document.addEventListener('mousedown', e => { if (!e.target.closest('#ctxMenu')) hideCtxMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hideCtxMenu(); }, true);

  filterImages('todo', document.querySelector('.img-filter-btn.active'));
  render();
});

// ─── SVG coordinate helper ────────────────────────────────────────────────────

function svgPt(e) {
  const svg = document.getElementById('annSvg');
  const p = svg.createSVGPoint();
  p.x = e.clientX; p.y = e.clientY;
  const tp = p.matrixTransform(svg.getScreenCTM().inverse());
  return { x: Math.round(tp.x), y: Math.round(tp.y) };
}

// ─── Mouse events ─────────────────────────────────────────────────────────────

function onSvgDown(e) {
  if (e.button !== 0) return;
  if (document.getElementById('ctxMenu').style.display === 'block') return;
  if (spacePan) {
    e.preventDefault();
    panning = true;
    panClientStart = { x: e.clientX, y: e.clientY };
    panAtStart = { x: panX, y: panY };
    document.getElementById('annSvg').style.cursor = 'grabbing';
    document.addEventListener('mousemove', onPanMove);
    document.addEventListener('mouseup', onPanUp);
    return;
  }
  const pt = svgPt(e);

  if (activeTool === 'select') {
    const handle = e.target.dataset.handle;
    const gEl = e.target.closest('[data-ann-id]');
    const annId = gEl ? parseInt(gEl.dataset.annId) : null;

    if (handle && annId) {
      e.preventDefault(); selectAnnotation(annId); startDrag(pt, 'resize-' + handle, annId);
    } else if (annId) {
      e.preventDefault(); selectAnnotation(annId); startDrag(pt, 'move', annId);
    } else {
      selectAnnotation(null);
    }

  } else if (activeTool === 'bbox') {
    e.preventDefault();
    drawing = true; drawAnchor = pt; drawCurrent = pt;
    selectAnnotation(null);
    startGlobalDrag();

  } else if (activeTool === 'polygon') {
    e.preventDefault();
    if (polyPts.length >= 3) {
      const d = Math.hypot(pt.x - polyPts[0][0], pt.y - polyPts[0][1]);
      if (d < 14) { closePoly(); return; }
    }
    const cpt = clampPt(pt);
    polyPts.push([cpt.x, cpt.y]);
    polyMouse = [cpt.x, cpt.y];
    render();
  }
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function clampPt(pt) { return { x: clamp(pt.x,0,IMG_W), y: clamp(pt.y,0,IMG_H) }; }

function onSvgMove(e) {
  const pt = svgPt(e);
  if (pt.x >= 0 && pt.x <= IMG_W && pt.y >= 0 && pt.y <= IMG_H) {
    document.getElementById('coords').textContent = `X: ${pt.x} · Y: ${pt.y}`;
  }
  if (drawing) { drawCurrent = clampPt(pt); render(); }
  if (activeTool === 'polygon' && polyPts.length > 0) { polyMouse = [pt.x, pt.y]; render(); }
}

function onGlobalMove(e) {
  const pt = svgPt(e);
  if (drawing) { drawCurrent = clampPt(pt); render(); return; }
  if (dragging) { applyDrag(pt); }
}

function onGlobalUp(e) {
  if (e.button !== 0) return;
  stopGlobalDrag();
  const pt = clampPt(svgPt(e));

  if (drawing) {
    drawing = false;
    const x = Math.min(drawAnchor.x, pt.x), y = Math.min(drawAnchor.y, pt.y);
    const x2 = Math.max(drawAnchor.x, pt.x), y2 = Math.max(drawAnchor.y, pt.y);
    const w = x2 - x, h = y2 - y;
    if (w > 6 && h > 6) {
      pushHistory();
      const ann = { id: nextId++, type:'bbox', cid: activeClassId, x, y, w, h };
      annotations.push(ann);
      save(); selectAnnotation(ann.id);
    }
    drawAnchor = drawCurrent = null; render(); return;
  }

  if (dragging) {
    dragging = false; dragMode = dragStart = dragOrigAnn = null;
    save(); render();
  }
}

function startGlobalDrag() {
  _globalMove = onGlobalMove;
  _globalUp   = onGlobalUp;
  document.addEventListener('mousemove', _globalMove);
  document.addEventListener('mouseup',   _globalUp);
}

function stopGlobalDrag() {
  if (_globalMove) document.removeEventListener('mousemove', _globalMove);
  if (_globalUp)   document.removeEventListener('mouseup',   _globalUp);
  _globalMove = _globalUp = null;
}

// ─── Drag / Resize ────────────────────────────────────────────────────────────

function startDrag(pt, mode, annId) {
  pushHistory();
  dragging = true; dragMode = mode; dragStart = pt;
  dragOrigAnn = clone(annotations.find(a => a.id === annId));
  startGlobalDrag();
}

function applyDrag(pt) {
  if (!dragOrigAnn) return;
  const ann = annotations.find(a => a.id === dragOrigAnn.id);
  if (!ann) return;
  const dx = pt.x - dragStart.x, dy = pt.y - dragStart.y;
  const o = dragOrigAnn;

  if (dragMode === 'move') {
    if (ann.type === 'bbox') {
      ann.x = clamp(o.x + dx, 0, IMG_W - o.w);
      ann.y = clamp(o.y + dy, 0, IMG_H - o.h);
    } else if (ann.type === 'poly') {
      ann.pts = o.pts.map(p => [clamp(p[0]+dx,0,IMG_W), clamp(p[1]+dy,0,IMG_H)]);
    }
  } else if (ann.type === 'bbox') {
    const h = dragMode;
    if (h==='resize-tl') { ann.x=o.x+dx; ann.y=o.y+dy; ann.w=o.w-dx; ann.h=o.h-dy; }
    else if (h==='resize-tm') { ann.y=o.y+dy; ann.h=o.h-dy; }
    else if (h==='resize-tr') { ann.y=o.y+dy; ann.w=o.w+dx; ann.h=o.h-dy; }
    else if (h==='resize-ml') { ann.x=o.x+dx; ann.w=o.w-dx; }
    else if (h==='resize-mr') { ann.w=o.w+dx; }
    else if (h==='resize-bl') { ann.x=o.x+dx; ann.w=o.w-dx; ann.h=o.h+dy; }
    else if (h==='resize-bm') { ann.h=o.h+dy; }
    else if (h==='resize-br') { ann.w=o.w+dx; ann.h=o.h+dy; }
    ann.w = Math.max(6, ann.w); ann.h = Math.max(6, ann.h);
    ann.x = clamp(ann.x, 0, IMG_W - ann.w);
    ann.y = clamp(ann.y, 0, IMG_H - ann.h);
    ann.w = Math.min(ann.w, IMG_W - ann.x);
    ann.h = Math.min(ann.h, IMG_H - ann.y);
  }
  render();
}

// ─── Polygon ──────────────────────────────────────────────────────────────────

function closePoly() {
  if (polyPts.length < 3) return;
  pushHistory();
  const ann = { id: nextId++, type:'poly', cid: activeClassId, pts: clone(polyPts) };
  annotations.push(ann);
  polyPts = []; polyMouse = null;
  save(); selectAnnotation(ann.id);
}

// ─── Annotation CRUD ──────────────────────────────────────────────────────────

function selectAnnotation(id) { selectedId = id; render(); }

function deleteAnnotation(id) {
  const i = annotations.findIndex(a => a.id === id);
  if (i === -1) return;
  pushHistory();
  annotations.splice(i, 1);
  if (selectedId === id) selectedId = null;
  save(); render();
  showToast('Đã xóa annotation');
}

function changeAnnotationClass(annId, newCid) {
  const ann = annotations.find(a => a.id === annId);
  if (!ann) return;
  pushHistory();
  ann.cid = newCid;
  save(); render();
  showToast('Đã đổi class: ' + cls(newCid).name);
}

// ─── Context Menu ─────────────────────────────────────────────────────────────

let _ctxAnnId = null;

function showCtxMenu(e, annId) {
  e.preventDefault(); e.stopPropagation();
  _ctxAnnId = annId;
  selectAnnotation(annId);

  const ann = annotations.find(a => a.id === annId);
  const c = cls(ann.cid);
  const num = annotations.filter(a => a.cid === ann.cid && a.id <= ann.id).length;
  const typeLabel = ann.type === 'bbox' ? 'Bounding box' : 'Polygon';
  document.getElementById('ctxHeader').innerHTML =
    `<b style="color:var(--cv-text);">${typeLabel}</b> · <span>${c.name} #${num}</span>`;
  document.getElementById('ctxClassGrid').innerHTML = classRegistry.map(cr =>
    `<button class="ctx-class-chip${cr.id===ann.cid?' active':''}" onclick="ctxChangeClass(${annId},${cr.id})">
      <span style="width:7px;height:7px;border-radius:2px;background:${cr.color};display:inline-block;flex-shrink:0;"></span>${cr.name}
    </button>`
  ).join('');

  const menu = document.getElementById('ctxMenu');
  const x = Math.min(e.clientX, window.innerWidth  - 210);
  const y = Math.min(e.clientY, window.innerHeight - 160);
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
  menu.style.display = 'block';
}

function hideCtxMenu() {
  document.getElementById('ctxMenu').style.display = 'none';
  _ctxAnnId = null;
}

function ctxChangeClass(annId, cid) { changeAnnotationClass(annId, cid); hideCtxMenu(); }
function ctxDoDelete() { const id = _ctxAnnId; hideCtxMenu(); if (id!==null) deleteAnnotation(id); }

// ─── Image navigation ─────────────────────────────────────────────────────────

function selectImage(imgName) {
  if (!imageStore[imgName] || imgName === currentImg) return;
  save();
  currentImg = imgName;
  annotations = clone(imageStore[currentImg].anns);
  nextId = annotations.length ? Math.max(...annotations.map(a=>a.id)) + 1 : 1;
  selectedId = null; drawing = false; dragging = false; polyPts = []; polyMouse = null;
  undoStack.length = 0; redoStack.length = 0; updateHistoryBtns();

  document.getElementById('mockImage').style.background = imageStore[currentImg].bg;
  document.getElementById('imgLabel').textContent = imgName + ' · 1920×1080';
  document.getElementById('breadcrumbFile').textContent = imgName;
  document.getElementById('submitImgName').textContent = imgName;

  document.querySelectorAll('.img-list-item').forEach(el => {
    el.classList.toggle('active', el.dataset.img === imgName);
    const nameEl = el.querySelector('.img-list-item__name');
    if (nameEl) nameEl.style.color = el.dataset.img === imgName ? 'var(--cv-accent)' : '';
  });

  render();
}

function navigateImage(dir) {
  const visible = Array.from(document.querySelectorAll('.img-list-item')).filter(el => el.style.display !== 'none');
  const idx = visible.findIndex(el => el.dataset.img === currentImg);
  const next = visible[idx + dir];
  if (next) selectImage(next.dataset.img);
  else showToast(dir > 0 ? 'Đây là ảnh cuối' : 'Đây là ảnh đầu tiên');
}

function save() { imageStore[currentImg].anns = clone(annotations); }

// ─── Render ───────────────────────────────────────────────────────────────────

function render() {
  const svg = document.getElementById('annSvg');
  svg.innerHTML = '';
  annotations.forEach(ann => renderAnn(svg, ann));
  renderPolyProgress(svg);
  renderBboxPreview(svg);
  updatePanel();
}

function cls(cid) { return classRegistry.find(c => c.id === cid) || { color:'#888', name:'?' }; }

function mkEl(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  if (attrs) Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
  return el;
}

function hexRgba(hex, a) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function renderAnn(svg, ann) {
  const c = cls(ann.cid);
  const sel = ann.id === selectedId;
  const g = mkEl('g'); g.dataset.annId = ann.id;

  if (ann.type === 'bbox') {
    g.appendChild(mkEl('rect', {
      x:ann.x, y:ann.y, width:ann.w, height:ann.h,
      fill: hexRgba(c.color, sel?0.15:0.08), stroke:c.color,
      'stroke-width': sel?1.5:1, cursor: activeTool==='select'?'move':'default'
    }));
    appendLabel(g, c, ann.x, ann.y);
    if (sel) appendHandlesBbox(g, ann);

  } else if (ann.type === 'poly') {
    const pts = ann.pts.map(p=>p.join(',')).join(' ');
    g.appendChild(mkEl('polygon', {
      points:pts, fill: hexRgba(c.color, sel?0.2:0.1), stroke:c.color,
      'stroke-width': sel?1.5:1, cursor: activeTool==='select'?'move':'default'
    }));
    if (ann.pts.length) appendLabel(g, c, ann.pts[0][0], ann.pts[0][1]);
    if (sel) ann.pts.forEach((pt,i) => {
      const h = mkEl('circle', { cx:pt[0], cy:pt[1], r:5, fill:'white', stroke:c.color, 'stroke-width':'1.5', cursor:'move' });
      h.dataset.handle = 'poly-v' + i;
      g.appendChild(h);
    });
  }

  g.addEventListener('mousedown', e => {
    if (activeTool !== 'select') return;
    e.stopPropagation(); e.preventDefault();
    const pt = svgPt(e);
    selectAnnotation(ann.id);
    const handle = e.target.dataset.handle;
    startDrag(pt, handle ? 'resize-'+handle : 'move', ann.id);
  });

  g.addEventListener('contextmenu', e => showCtxMenu(e, ann.id));

  svg.appendChild(g);
}

function appendLabel(g, c, x, y) {
  const lw = c.name.length * 5.4 + 6, lh = 13;
  g.appendChild(mkEl('rect', { x, y:y-lh, width:lw, height:lh, fill:c.color, rx:2, cursor: activeTool==='select'?'pointer':'crosshair' }));
  const t = mkEl('text', { x:x+3, y:y-3, fill:'white', 'font-size':'8', 'font-weight':'600', 'font-family':'system-ui,sans-serif', style:'pointer-events:none' });
  t.textContent = c.name; g.appendChild(t);
}

function appendHandlesBbox(g, ann) {
  const hh = [
    {id:'tl',cx:ann.x,          cy:ann.y,          cur:'nwse-resize'},
    {id:'tm',cx:ann.x+ann.w/2,  cy:ann.y,          cur:'ns-resize'},
    {id:'tr',cx:ann.x+ann.w,    cy:ann.y,          cur:'nesw-resize'},
    {id:'ml',cx:ann.x,          cy:ann.y+ann.h/2,  cur:'ew-resize'},
    {id:'mr',cx:ann.x+ann.w,    cy:ann.y+ann.h/2,  cur:'ew-resize'},
    {id:'bl',cx:ann.x,          cy:ann.y+ann.h,    cur:'nesw-resize'},
    {id:'bm',cx:ann.x+ann.w/2,  cy:ann.y+ann.h,    cur:'ns-resize'},
    {id:'br',cx:ann.x+ann.w,    cy:ann.y+ann.h,    cur:'nwse-resize'},
  ];
  hh.forEach(h => {
    const r = mkEl('rect', { x:h.cx-4, y:h.cy-4, width:8, height:8, fill:'white', stroke:'rgba(0,0,0,0.3)', 'stroke-width':'1', rx:'1', cursor:h.cur });
    r.dataset.handle = h.id; g.appendChild(r);
  });
}

function renderPolyProgress(svg) {
  if (!polyPts.length) return;
  const c = cls(activeClassId);
  const all = polyMouse ? [...polyPts, polyMouse] : polyPts;

  if (all.length >= 2) {
    svg.appendChild(mkEl('polyline', {
      points: all.map(p=>p.join(',')).join(' '), fill:'none',
      stroke:c.color, 'stroke-width':'1.5', 'stroke-dasharray':'5 3', style:'pointer-events:none'
    }));
  }

  if (polyMouse && polyPts.length >= 3) {
    svg.appendChild(mkEl('line', {
      x1:polyMouse[0], y1:polyMouse[1], x2:polyPts[0][0], y2:polyPts[0][1],
      stroke:c.color, 'stroke-width':'1', 'stroke-dasharray':'3 3', opacity:'0.5', style:'pointer-events:none'
    }));
    svg.appendChild(mkEl('circle', { cx:polyPts[0][0], cy:polyPts[0][1], r:8, fill:'none', stroke:c.color, 'stroke-width':'1.5', opacity:'0.6', style:'pointer-events:none' }));
  }

  polyPts.forEach((pt,i) => {
    svg.appendChild(mkEl('circle', { cx:pt[0], cy:pt[1], r:i===0?5:3, fill:i===0?c.color:'white', stroke:c.color, 'stroke-width':'1.5', style:'pointer-events:none' }));
  });
}

function renderBboxPreview(svg) {
  if (!drawing || !drawAnchor || !drawCurrent) return;
  const c = cls(activeClassId);
  const x=Math.min(drawAnchor.x,drawCurrent.x), y=Math.min(drawAnchor.y,drawCurrent.y);
  const w=Math.abs(drawCurrent.x-drawAnchor.x), h=Math.abs(drawCurrent.y-drawAnchor.y);
  svg.appendChild(mkEl('rect', {
    x, y, width:Math.max(1,w), height:Math.max(1,h),
    fill:hexRgba(c.color,0.12), stroke:c.color, 'stroke-width':'1.5', 'stroke-dasharray':'6 3', style:'pointer-events:none'
  }));
  if (w > 24 && h > 16) {
    const t = mkEl('text', { x:x+w/2, y:y+h/2+4, fill:'rgba(255,255,255,0.65)', 'font-size':'10', 'text-anchor':'middle', 'font-family':'monospace', style:'pointer-events:none' });
    t.textContent = `${w}×${h}`; svg.appendChild(t);
  }
}

// ─── Panel update ─────────────────────────────────────────────────────────────

function updatePanel() {
  // Edit panel for selected annotation
  const editPanel = document.getElementById('annEditPanel');
  if (selectedId !== null) {
    const ann = annotations.find(a => a.id === selectedId);
    if (ann) {
      const c = cls(ann.cid);
      const num = annotations.filter(a => a.cid === ann.cid && a.id <= ann.id).length;
      const typeLabel = ann.type === 'bbox' ? 'Bounding box' : 'Polygon';
      const classBtns = classRegistry.map(cr =>
        `<button class="ann-edit-class-btn${cr.id===ann.cid?' selected-class':''}" onclick="changeAnnotationClass(${ann.id},${cr.id})">
          <span style="width:8px;height:8px;border-radius:2px;background:${cr.color};display:inline-block;flex-shrink:0;"></span>${cr.name}
        </button>`
      ).join('');
      editPanel.style.display = '';
      editPanel.innerHTML = `
        <div class="ann-edit-panel__title">
          <span>Chỉnh sửa</span>
          <span style="font-size:10px;font-weight:400;text-transform:none;letter-spacing:0;color:var(--cv-muted);">${typeLabel} · ${c.name} #${num}</span>
        </div>
        <div style="padding:8px 10px 10px;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--cv-muted);margin-bottom:6px;">Đổi class</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">${classBtns}</div>
          <button class="ebtn ebtn-secondary" style="width:100%;justify-content:center;font-size:11px;color:#f87171;border-color:rgba(248,113,113,0.25);" onclick="deleteAnnotation(${ann.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Xóa annotation
          </button>
        </div>`;
    } else {
      editPanel.style.display = 'none';
    }
  } else {
    editPanel.style.display = 'none';
  }

  const list = document.getElementById('annotationList');
  list.innerHTML = '';

  annotations.forEach(ann => {
    const c = cls(ann.cid);
    const sel = ann.id === selectedId;
    const num = annotations.filter(a => a.cid === ann.cid && a.id <= ann.id).length;
    const shape = ann.type === 'bbox'
      ? `<rect x="3" y="3" width="18" height="18"/>`
      : `<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>`;

    const item = document.createElement('div');
    item.className = 'annotation-item' + (sel?' active':'');
    item.innerHTML = `<svg class="annotation-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${c.color}" stroke-width="2">${shape}</svg>
      <span class="annotation-name">${c.name} #${num}</span>
      <button class="annotation-del"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
    item.querySelector('.annotation-del').addEventListener('click', e => { e.stopPropagation(); deleteAnnotation(ann.id); });
    item.addEventListener('click', () => selectAnnotation(ann.id));
    list.appendChild(item);
  });

  document.getElementById('annCount').textContent = `(${annotations.length})`;
  document.getElementById('toolbarAnnCount').textContent = `${annotations.length} annotation${annotations.length!==1?'s':''}`;

  // Sync submit modal info
  const bboxCount = annotations.filter(a=>a.type==='bbox').length;
  const polyCount = annotations.filter(a=>a.type==='poly').length;
  const parts = [bboxCount&&`${bboxCount} bbox`, polyCount&&`${polyCount} polygon`].filter(Boolean).join(', ');
  document.getElementById('submitAnnSummary').textContent = annotations.length ? parts : '0';
  const usedIds = [...new Set(annotations.map(a=>a.cid))];
  document.getElementById('submitClassSummary').textContent = usedIds.map(id=>cls(id).name).join(', ') || '—';
}

// ─── Tools ────────────────────────────────────────────────────────────────────

function setTool(tool) {
  activeTool = tool;
  document.querySelectorAll('.tool-btn[id^="tool-"]').forEach(b => b.classList.remove('active'));
  document.getElementById('tool-' + tool)?.classList.add('active');
  updateCursor();

  if (tool !== 'polygon') { polyPts=[]; polyMouse=null; }
  if (tool !== 'bbox') { drawing=false; drawAnchor=drawCurrent=null; }

  const hints = { select:'Select · Click annotation để chọn, kéo để di chuyển', bbox:'Bbox tool · Kéo để vẽ bounding box', polygon:'Polygon · Click để thêm điểm, click điểm đầu để đóng' };
  document.getElementById('statusToolHint').textContent = hints[tool] || '';
  render();
}

function setClass(el) {
  document.querySelectorAll('.class-item').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const cid = parseInt(el.dataset.cid);
  if (cid) activeClassId = cid;
}

// ─── Zoom ─────────────────────────────────────────────────────────────────────

function zoomStep(delta) {
  zoom = Math.max(0.25, Math.min(4, parseFloat((zoom + delta).toFixed(2))));
  applyZoom();
}

function zoomFit() { zoom = 1; panX = 0; panY = 0; applyZoom(); }

function applyZoom() {
  document.getElementById('canvasContainer').style.transform = `translate(${panX}px,${panY}px) scale(${zoom})`;
  const pct = Math.round(zoom * 100) + '%';
  document.getElementById('zoomDisplay').textContent = pct;
  document.getElementById('statusZoom').textContent = pct;
}

function updateCursor() {
  const svg = document.getElementById('annSvg');
  if (spacePan) svg.style.cursor = panning ? 'grabbing' : 'grab';
  else svg.style.cursor = activeTool === 'select' ? 'default' : 'crosshair';
}

// ─── Space Pan ────────────────────────────────────────────────────────────────

function onPanMove(e) {
  if (!panning) return;
  panX = panAtStart.x + (e.clientX - panClientStart.x);
  panY = panAtStart.y + (e.clientY - panClientStart.y);
  applyZoom();
}

function onPanUp(e) {
  if (e.button !== 0) return;
  panning = false;
  document.removeEventListener('mousemove', onPanMove);
  document.removeEventListener('mouseup', onPanUp);
  updateCursor();
}

// ─── Custom class ─────────────────────────────────────────────────────────────

const CLASS_PALETTE = ['#9b59b6','#e67e22','#1abc9c','#e74c3c','#f39c12','#00bcd4','#e91e63','#ff5722','#8bc34a','#607d8b'];
let _colorIdx = 0;

function toggleAddClass() {
  const form = document.getElementById('addClassForm');
  const open = form.style.display !== 'none';
  form.style.display = open ? 'none' : '';
  document.getElementById('addClassBtn').style.color = open ? '' : 'var(--cv-accent)';
  if (!open) { document.getElementById('newClassColor').style.background = CLASS_PALETTE[_colorIdx]; document.getElementById('newClassName').focus(); }
}

function cycleColor() {
  _colorIdx = (_colorIdx + 1) % CLASS_PALETTE.length;
  document.getElementById('newClassColor').style.background = CLASS_PALETTE[_colorIdx];
}

function confirmAddClass() {
  const input = document.getElementById('newClassName');
  const name = input.value.trim().replace(/\s+/g,'_');
  if (!name) { input.focus(); return; }
  const color = CLASS_PALETTE[_colorIdx];
  const newId = classIdCounter++;
  classRegistry.push({ id:newId, name, color, key:'' });
  activeClassId = newId;

  const list = document.getElementById('classList');
  document.querySelectorAll('.class-item').forEach(c => c.classList.remove('active'));
  const item = document.createElement('div');
  item.className = 'class-item active';
  item.dataset.cid = newId;
  item.setAttribute('onclick','setClass(this)');
  item.innerHTML = `<div class="class-color" style="background:${color};"></div><span class="class-name">${name}</span>`
    + `<span style="font-size:9px;padding:1px 4px;background:var(--cv-active);border:1px solid var(--cv-border);border-radius:3px;color:var(--cv-muted);font-family:monospace;">custom</span>`;
  list.appendChild(item);

  input.value = '';
  _colorIdx = (_colorIdx + 1) % CLASS_PALETTE.length;
  document.getElementById('newClassColor').style.background = CLASS_PALETTE[_colorIdx];
  input.focus();
  showToast('Đã thêm class: ' + name);
}

function cancelAddClass() {
  document.getElementById('newClassName').value = '';
  document.getElementById('addClassForm').style.display = 'none';
  document.getElementById('addClassBtn').style.color = '';
}

function handleNewClassKey(e) {
  if (e.key === 'Enter') { e.preventDefault(); confirmAddClass(); }
  if (e.key === 'Escape') cancelAddClass();
}

// ─── Filter ───────────────────────────────────────────────────────────────────

function filterImages(filter, btn) {
  document.querySelectorAll('.img-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const items = document.querySelectorAll('.img-list-item');
  let visible = 0;
  items.forEach(item => {
    const s = item.dataset.status;
    const show = filter==='all' || (filter==='todo'&&(s==='active'||s==='none')) || (filter==='done'&&s==='done') || (filter==='returned'&&s==='returned');
    item.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  document.getElementById('imgCount').textContent = visible + ' / 8';
}

// ─── Undo / Redo ──────────────────────────────────────────────────────────────

function pushHistory() {
  undoStack.push(clone(annotations));
  if (undoStack.length > 50) undoStack.shift();
  redoStack.length = 0;
  updateHistoryBtns();
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(clone(annotations));
  annotations = undoStack.pop();
  selectedId = null;
  save(); render(); updateHistoryBtns();
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(clone(annotations));
  annotations = redoStack.pop();
  selectedId = null;
  save(); render(); updateHistoryBtns();
}

function updateHistoryBtns() {
  document.getElementById('btn-undo').classList.toggle('disabled', !undoStack.length);
  document.getElementById('btn-redo').classList.toggle('disabled', !redoStack.length);
}

// ─── Actions ──────────────────────────────────────────────────────────────────

function doSave() {
  save();
  const now = new Date();
  const t = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  document.getElementById('autosaveLabel').textContent = `Đã tự lưu lúc ${t}`;
  showToast('Đã lưu nháp');
}

function doSubmit() {
  document.getElementById('submitModal').style.display = 'none';
  showToast(`Đã nộp ${currentImg} thành công!`);
}

// ─── Keyboard ─────────────────────────────────────────────────────────────────

document.addEventListener('keyup', e => {
  if (e.key === ' ') {
    spacePan = false;
    if (panning) {
      panning = false;
      document.removeEventListener('mousemove', onPanMove);
      document.removeEventListener('mouseup', onPanUp);
    }
    updateCursor();
  }
});

// ─── Keyboard shortcuts config ────────────────────────────────────────────────
// Format: 'key' | 'ctrl+key' | 'ctrl+shift+key' | array of alternatives
// 'ctrl' matches Ctrl on Windows/Linux and Cmd on Mac
const SHORTCUTS = {
  toolSelect:  'v',
  toolBbox:    'b',
  toolPolygon: ['p','c'],  
  deleteAnn:   ['delete', 'backspace'],
  save:        'ctrl+s',
  submit:      ['ctrl+enter', 'ctrl+x'],
  undo:        'ctrl+z',
  redo:        ['ctrl+shift+z', 'ctrl+y'],
  zoomIn:      ['+', '='],
  zoomOut:     '-',
  zoomFit:     '0',
  fullscreen:  'f',
  focusMode:   'tab',
  prevImage:   ['arrowleft', 'arrowup', 'a', 'w'],
  nextImage:   ['arrowright', 'arrowdown', 'd', 's'],
};

function matchKey(e, combo) {
  const combos = Array.isArray(combo) ? combo : [combo];
  return combos.some(c => {
    const parts     = c.toLowerCase().split('+');
    const rawKey    = parts[parts.length - 1];
    const needCtrl  = parts.includes('ctrl');
    const needShift = parts.includes('shift');
    const needAlt   = parts.includes('alt');
    return e.key.toLowerCase() === rawKey
      && (e.ctrlKey || e.metaKey) === needCtrl
      && e.shiftKey === needShift
      && e.altKey   === needAlt;
  });
}

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === ' ') { e.preventDefault(); if (!spacePan) { spacePan = true; updateCursor(); } return; }

  if      (matchKey(e, SHORTCUTS.toolSelect))  setTool('select');
  else if (matchKey(e, SHORTCUTS.toolBbox))    setTool('bbox');
  else if (matchKey(e, SHORTCUTS.toolPolygon)) setTool('polygon');
  else if (e.key === 'Escape') {
    const modal = document.getElementById('submitModal');
    if (modal.style.display === 'flex') { modal.style.display = 'none'; return; }
    if (polyPts.length) { polyPts=[]; polyMouse=null; render(); }
    else selectAnnotation(null);
  }
  else if (matchKey(e, SHORTCUTS.deleteAnn) && selectedId !== null) deleteAnnotation(selectedId);
  else if (matchKey(e, SHORTCUTS.submit))    { e.preventDefault(); document.getElementById('submitModal').style.display='flex'; }
  else if (e.key === 'Enter' && document.getElementById('submitModal').style.display === 'flex') { e.preventDefault(); doSubmit(); }
  else if (e.key === 'Enter' && activeTool === 'polygon' && polyPts.length >= 3) { e.preventDefault(); closePoly(); }
  else if (matchKey(e, SHORTCUTS.save))      { e.preventDefault(); doSave(); }
  else if (matchKey(e, SHORTCUTS.redo))      { e.preventDefault(); redo(); }
  else if (matchKey(e, SHORTCUTS.undo))      { e.preventDefault(); undo(); }
  else if (matchKey(e, SHORTCUTS.zoomIn))    zoomStep(0.25);
  else if (matchKey(e, SHORTCUTS.zoomOut))   zoomStep(-0.25);
  else if (matchKey(e, SHORTCUTS.zoomFit))   zoomFit();
  else if (matchKey(e, SHORTCUTS.fullscreen)) toggleFullscreen();
  else if (matchKey(e, SHORTCUTS.focusMode)) { e.preventDefault(); document.querySelector('.editor-body').classList.toggle('is-focus'); }
  else if (matchKey(e, SHORTCUTS.prevImage)) { e.preventDefault(); navigateImage(-1); }
  else if (matchKey(e, SHORTCUTS.nextImage)) { e.preventDefault(); navigateImage(1); }
  else if (/^[1-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
    const cid = parseInt(e.key);
    const reg = classRegistry.find(c => c.key===e.key || c.id===cid);
    if (reg) {
      activeClassId = reg.id;
      document.querySelectorAll('.class-item').forEach(el => {
        if (parseInt(el.dataset.cid) === reg.id) setClass(el);
      });
    }
  }
});

// ─── Mouse coords (also on svg mousemove already handled above) ────────────────

document.getElementById('canvasViewport').addEventListener('mouseleave', () => {
  document.getElementById('coords').textContent = 'X: — · Y: —';
});

// ─── Toast ────────────────────────────────────────────────────────────────────

function toggleFullscreen() {
  const shell = document.querySelector('.app-shell');
  const entering = shell.classList.toggle('is-fullscreen');
  const btn = document.getElementById('btnFullscreen');
  const icon = document.getElementById('fsIcon');
  if (entering) {
    icon.innerHTML = '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>';
    btn.dataset.tooltip = 'Thoát toàn màn hình (F)';
  } else {
    icon.innerHTML = '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>';
    btn.dataset.tooltip = 'Toàn màn hình (F)';
    document.querySelector('.editor-body').classList.remove('is-focus');
  }
}

function showToast(msg) {
  const el = document.createElement('div');
  el.style.cssText = 'padding:8px 14px;background:#212529;border:1px solid #343a40;border-radius:6px;font-size:12px;color:#f8f9fa;pointer-events:all;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:opacity 0.3s;';
  el.textContent = msg;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => { el.style.opacity='0'; setTimeout(()=>el.remove(), 300); }, 2500);
}
