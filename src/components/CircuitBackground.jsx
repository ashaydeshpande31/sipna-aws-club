// Full-screen animated background: a dark circuit board in the AWS purple and orange.
// (the idea comes from the Sipna Coders Club website, recoloured for the AWS club)
// - glowing data packets race along the grid lines and turn at the junctions
// - the grid lights up under the mouse and leaves a trail of glowing tiles
//   (on phones the light wanders by itself, and follows your finger while you touch)
// - click or tap anywhere to fire packets in four directions
// - the board slides gently as you scroll, and fades a little so text stays readable
import { useEffect, useRef } from 'react';

const PAL = [[140, 79, 255], [181, 140, 255], [255, 153, 0], [217, 196, 255]]; // violet, lavender, AWS orange, pale lilac
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const PARALLAX = 0.25; // how fast the board moves compared with the page
const BRIGHTNESS = 0.6; // how strong the background is: 1 = full, 0.6 = softer, 0.3 = very faint

const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (n) => Math.floor(Math.random() * n);
// tiny hash so the "solder dots" stay in the same place while the board scrolls
const hash = (i, j) => {
  let h = Math.imul(i, 374761393) + Math.imul(j, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
// soft glow, drawn once (much cheaper than canvas shadows)
function glowSprite(c) {
  const s = document.createElement('canvas');
  s.width = s.height = 64;
  const g = s.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, rgba(c, 0.95));
  gr.addColorStop(0.25, rgba(c, 0.45));
  gr.addColorStop(1, rgba(c, 0));
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return s;
}

export default function CircuitBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return undefined;
    const g = c.getContext('2d');
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const GLOWS = PAL.map(glowSprite);

    let W = 0, H = 0, dpr = 1, small = false, cell = 46, cols = 0, rows = 0, ox = 0, oy = 0, R = 230;
    let grid = null, gg = null, gridJ = 0, gridRows = 0, spot = null, sg = null;
    let packets = [], rings = [];
    const lit = new Map();
    let raf = 0, last = performance.now(), t = 0, lastOpacity = -1, touchTimer = 0, shift = 0;
    let mx = 0, my = 0, pointerOn = false, sx = -1, sy = -1, lastCell = '';

    const xOf = (i) => ox + i * cell;
    const yOf = (j) => oy + j * cell - shift;

    // (re)start a packet somewhere on screen, or at a given junction / direction
    const spawn = (p, i, j, dir, col, burst) => {
      const q = p || {};
      const firstRow = Math.floor((shift - oy) / cell);
      q.i = i ?? ri(cols);
      q.j = j ?? firstRow + ri(rows);
      const d = dir || DIRS[ri(4)];
      q.di = d[0]; q.dj = d[1];
      q.prog = 0;
      q.col = col ?? ri(4);
      q.speed = burst ? rnd(7, 9) : rnd(2.4, 5.2); // junctions per second
      q.life = burst ? rnd(1.2, 2) : rnd(3, 8);
      q.fade = 1;
      q.burst = !!burst;
      q.dead = false;
      q.trail = [[q.i, q.j]];
      return q;
    };

    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      small = W < 700;
      cell = small ? 36 : 46;
      cols = Math.ceil(W / cell) + 1;
      rows = Math.ceil(H / cell) + 1;
      ox = Math.round((W - (cols - 1) * cell) / 2);
      oy = Math.round((H - (rows - 1) * cell) / 2);
      shift = window.scrollY * PARALLAX;
      // the grid is drawn once into a buffer (a bit taller than the screen) and only redrawn
      // after scrolling far enough, instead of every frame
      gridRows = rows + 12;
      grid = document.createElement('canvas');
      grid.width = Math.round(W * dpr);
      grid.height = Math.round(gridRows * cell * dpr);
      gg = grid.getContext('2d');
      gridJ = null;
      R = small ? 150 : 230;
      spot = document.createElement('canvas'); // drawn at 1x: it is a soft glow anyway, and 4x cheaper
      spot.width = spot.height = 2 * R;
      sg = spot.getContext('2d');
      packets = [];
      for (let n = 0; n < (small ? 12 : 22); n++) {
        const q = spawn();
        q.life *= Math.random();
        packets.push(q);
      }
      lit.clear();
      rings = [];
    };

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      shift = window.scrollY * PARALLAX;

      // fade a little as the visitor scrolls down
      const op = Math.max(small ? 0.6 : 0.45, 1 - window.scrollY / (H * 1.2)) * BRIGHTNESS;
      if (Math.abs(op - lastOpacity) > 0.01) { c.style.opacity = op.toFixed(2); lastOpacity = op; }

      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
      g.clearRect(0, 0, W, H);

      // the light: follows the mouse / finger, otherwise wanders by itself
      const tx = pointerOn ? mx : W * (0.5 + 0.36 * Math.sin(t * 0.21));
      const ty = pointerOn ? my : H * (0.45 + 0.3 * Math.sin(t * 0.29 + 1));
      if (sx < 0) { sx = tx; sy = ty; }
      sx += (tx - sx) * Math.min(1, dt * 8);
      sy += (ty - sy) * Math.min(1, dt * 8);

      // trail of lit tiles under the light
      const ci = Math.floor((sx - ox) / cell), cj = Math.floor((sy - oy + shift) / cell);
      const key = `${ci},${cj}`;
      if (key !== lastCell) { lastCell = key; lit.set(key, { i: ci, j: cj, a: 1, c: PAL[ri(4)] }); }
      lit.forEach((L, k) => {
        L.a -= dt * 0.8;
        if (L.a <= 0) { lit.delete(k); return; }
        g.fillStyle = rgba(L.c, 0.16 * L.a);
        g.fillRect(xOf(L.i) + 1, yOf(L.j) + 1, cell - 1, cell - 1);
      });

      // the grid (from the buffer; redrawn only when the page has scrolled out of it)
      const base = (((oy - shift) % cell) + cell) % cell; // first horizontal line on screen
      const jTop = Math.floor((shift - oy) / cell) - 1;
      if (gridJ === null || jTop < gridJ || jTop + rows + 2 > gridJ + gridRows) {
        gridJ = jTop - 5;
        gg.setTransform(dpr, 0, 0, dpr, 0, 0);
        gg.clearRect(0, 0, W, gridRows * cell);
        gg.strokeStyle = 'rgba(255,255,255,.05)';
        gg.lineWidth = 1;
        gg.beginPath();
        for (let i = 0; i < cols; i++) { const x = xOf(i) + 0.5; gg.moveTo(x, 0); gg.lineTo(x, gridRows * cell); }
        for (let k = 0; k < gridRows; k++) { gg.moveTo(0, k * cell + 0.5); gg.lineTo(W, k * cell + 0.5); }
        gg.stroke();
        gg.fillStyle = 'rgba(255,255,255,.16)';
        for (let k = 0; k < gridRows; k++) {
          for (let i = 0; i < cols; i++) if (hash(i, gridJ + k) < 0.07) gg.fillRect(xOf(i) - 1.5, k * cell - 1.5, 3, 3);
        }
      }
      g.drawImage(grid, 0, yOf(gridJ), W, gridRows * cell);

      // spotlight: grid lines glow near the light
      const s0x = sx - R, s0y = sy - R, S = 2 * R;
      sg.setTransform(1, 0, 0, 1, 0, 0);
      sg.globalCompositeOperation = 'source-over';
      sg.clearRect(0, 0, S, S);
      sg.strokeStyle = 'rgba(181,140,255,.8)';
      sg.lineWidth = 1;
      sg.beginPath();
      for (let i = Math.ceil((s0x - ox) / cell); xOf(i) < s0x + S; i++) {
        const x = xOf(i) - s0x + 0.5; sg.moveTo(x, 0); sg.lineTo(x, S);
      }
      for (let y = base + Math.ceil((s0y - base) / cell) * cell; y < s0y + S; y += cell) {
        sg.moveTo(0, y - s0y + 0.5); sg.lineTo(S, y - s0y + 0.5);
      }
      sg.stroke();
      sg.globalCompositeOperation = 'destination-in';
      const mask = sg.createRadialGradient(R, R, 0, R, R, R);
      mask.addColorStop(0, 'rgba(0,0,0,.9)');
      mask.addColorStop(1, 'rgba(0,0,0,0)');
      sg.fillStyle = mask;
      sg.fillRect(0, 0, S, S);
      g.drawImage(spot, s0x, s0y, S, S);

      // data packets
      g.globalCompositeOperation = 'lighter';
      g.lineCap = 'round';
      g.lineWidth = 2;
      for (const p of packets) {
        p.prog += p.speed * dt;
        p.life -= dt;
        while (p.prog >= 1) {
          p.prog -= 1;
          p.i += p.di; p.j += p.dj;
          p.trail.push([p.i, p.j]);
          if (p.trail.length > 7) p.trail.shift();
          const r = Math.random(); // sometimes turn left or right at a junction
          if (r < 0.2) { const d = p.di; p.di = -p.dj; p.dj = d; } else if (r < 0.4) { const d = p.di; p.di = p.dj; p.dj = -d; }
          if (p.i + p.di < 0 || p.i + p.di >= cols) p.di = -p.di; // bounce off the sides
        }
        const hx = xOf(p.i + p.di * p.prog), hy = yOf(p.j + p.dj * p.prog);
        if (hy < -2 * cell || hy > H + 2 * cell) { if (p.burst) p.dead = true; else spawn(p); continue; } // scrolled away
        if (p.life < 0) {
          p.fade -= dt * 2;
          if (p.fade <= 0) { if (p.burst) p.dead = true; else spawn(p); continue; }
        }
        const col = PAL[p.col];
        let px = xOf(p.trail[0][0]), py = yOf(p.trail[0][1]);
        const n = p.trail.length + 1;
        for (let s = 1; s < n; s++) {
          const nx = s < p.trail.length ? xOf(p.trail[s][0]) : hx;
          const ny = s < p.trail.length ? yOf(p.trail[s][1]) : hy;
          g.strokeStyle = rgba(col, (s / n) * 0.85 * p.fade);
          g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke();
          px = nx; py = ny;
        }
        g.globalAlpha = p.fade;
        g.drawImage(GLOWS[p.col], hx - 20, hy - 20, 40, 40);
        g.fillStyle = '#fff';
        g.fillRect(hx - 1.5, hy - 1.5, 3, 3);
        g.globalAlpha = 1;
      }
      if (packets.some((p) => p.dead)) packets = packets.filter((p) => !p.dead);

      // tap rings
      for (let k = rings.length - 1; k >= 0; k--) {
        const rg = rings[k], e = (t - rg.t0) / 0.9;
        if (e >= 1) { rings.splice(k, 1); continue; }
        g.strokeStyle = rgba(rg.c, 0.7 * (1 - e));
        g.lineWidth = 2;
        g.beginPath();
        g.arc(rg.x, rg.y - (shift - rg.shift), 8 + e * cell * 3, 0, Math.PI * 2);
        g.stroke();
      }
      g.globalCompositeOperation = 'source-over';

      if (!reduce) raf = requestAnimationFrame(frame);
    };

    // mouse
    const onMove = (e) => { if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; pointerOn = true; } };
    const onOut = (e) => { if (!e.relatedTarget) pointerOn = false; }; // mouse left the window
    // phones: the light follows your finger while you touch and scroll
    const onTouch = (e) => {
      const p = e.touches && e.touches[0];
      if (!p) return;
      mx = p.clientX; my = p.clientY; pointerOn = true;
      clearTimeout(touchTimer);
      touchTimer = setTimeout(() => { pointerOn = false; }, 1200);
    };
    // click / tap: fire packets in four directions from the nearest junction
    const onDown = (e) => {
      const i = Math.round((e.clientX - ox) / cell), j = Math.round((e.clientY - oy + shift) / cell), col = ri(4);
      rings.push({ x: xOf(i), y: yOf(j), shift, t0: t, c: PAL[col] });
      DIRS.forEach((d) => packets.push(spawn(null, i, j, d, col, true)));
      const bursts = packets.filter((p) => p.burst);
      if (bursts.length > 40) packets = packets.filter((p) => !p.burst || bursts.indexOf(p) >= bursts.length - 40);
    };
    const onResize = () => { size(); if (reduce) frame(performance.now()); };

    size();
    window.addEventListener('resize', onResize);
    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('mouseout', onOut);
      window.addEventListener('touchstart', onTouch, { passive: true });
      window.addEventListener('touchmove', onTouch, { passive: true });
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('mouseout', onOut);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      clearTimeout(touchTimer);
    };
  }, []);

  return <canvas ref={ref} className="absolute left-0 top-0 h-full w-full" aria-hidden="true" />;
}
