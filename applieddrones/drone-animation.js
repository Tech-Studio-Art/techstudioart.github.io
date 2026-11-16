// Applied Drones animation (cyberpunk): the drone is programmed, then does one job, four times over, on a loop.
(function () {
  var cv = document.getElementById('droneAnim');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var W = 1600, H = 900;
  var BG = '#07040f', CY = '#19f0ff', MG = '#ff2bd6', YL = '#fcee09', HOT = '#ff3d6e', DIM = '#120a2a', EDGE = '#3a1d7a', WH = '#e8f9ff';
  var MONO = 'ui-monospace, Menlo, Consolas, "DejaVu Sans Mono", monospace';
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var sm = function (t) { t = clamp(t); return t * t * (3 - 2 * t); };
  var seed = 11;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function pr() { return Math.random(); }
  function glow(c, b) { ctx.shadowColor = c; ctx.shadowBlur = b; }
  function noGlow() { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; }

  var GROUND = 770;

  // ---- static backdrop: night sky, far skyline, neon floor grid, scanlines, vignette ----
  var bgc = document.createElement('canvas');
  bgc.width = W; bgc.height = H;
  (function () {
    var g = bgc.getContext('2d');
    var sky = g.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, '#07040f'); sky.addColorStop(0.7, '#150a30'); sky.addColorStop(1, '#3a0f55');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.font = '500 18px ' + MONO; g.textBaseline = 'top';
    for (var y = 0; y < GROUND; y += 30) for (var x = 0; x < W; x += 26) {
      g.fillStyle = 'rgba(25,240,255,' + (0.025 + rnd() * 0.04) + ')';
      g.fillText(rnd() < 0.5 ? '1' : '0', x, y);
    }
    // far skyline
    var x0 = 0;
    while (x0 < W) {
      var w = 40 + rnd() * 70, h = 120 + rnd() * 330;
      g.fillStyle = '#0c0620'; g.fillRect(x0, GROUND - h, w, h);
      g.strokeStyle = 'rgba(255,43,214,.35)'; g.lineWidth = 2; g.strokeRect(x0 + 1, GROUND - h, w - 2, h);
      for (var k = 0; k < 14; k++) {
        if (rnd() < 0.55) continue;
        var cols = [CY, MG, YL];
        g.fillStyle = cols[Math.floor(rnd() * 3)]; g.globalAlpha = 0.5 + rnd() * 0.4;
        g.fillRect(x0 + 6 + rnd() * (w - 16), GROUND - h + 10 + rnd() * (h - 24), 5, 4);
      }
      g.globalAlpha = 1;
      x0 += w + 6 + rnd() * 24;
    }
    // floor
    var fl = g.createLinearGradient(0, GROUND, 0, H);
    fl.addColorStop(0, '#1a0838'); fl.addColorStop(1, '#07040f');
    g.fillStyle = fl; g.fillRect(0, GROUND, W, H - GROUND);
    g.strokeStyle = 'rgba(255,43,214,.45)'; g.lineWidth = 1.5;
    for (var i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(800 + i * 40, GROUND); g.lineTo(800 + i * 230, H); g.stroke(); }
    for (var j = 1; j < 6; j++) { var yy = GROUND + Math.pow(j / 6, 1.8) * (H - GROUND); g.beginPath(); g.moveTo(0, yy); g.lineTo(W, yy); g.stroke(); }
    // scanlines
    g.fillStyle = 'rgba(0,0,0,.22)';
    for (var s = 0; s < H; s += 4) g.fillRect(0, s, W, 1.5);
    var vg = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 960);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
  })();

  var T = 0;

  function drone(x, y, s, o) {
    o = o || {};
    ctx.save();
    ctx.translate(x, y); ctx.rotate(o.tilt || 0); ctx.scale(s, s);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var arm = 190, ry = 0.62, dirs = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
    glow(CY, 14);
    for (var i = 0; i < 4; i++) {
      var ax = dirs[i][0], ay = dirs[i][1], rx = ax * arm, py = ay * arm * ry;
      ctx.strokeStyle = CY; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(rx, py); ctx.stroke();
      ctx.fillStyle = BG;
      ctx.beginPath(); ctx.ellipse(rx, py, 34, 18, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,43,214,.85)'; glow(MG, 12);
      var ph = Math.abs(Math.cos(T * 40 + ax * 1.3 + ay));
      ctx.beginPath(); ctx.ellipse(rx, py - 16, 130, 17, 0, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx - 120 * ph, py - 16); ctx.lineTo(rx + 120 * ph, py - 16); ctx.stroke();
      glow(CY, 14);
    }
    ctx.strokeStyle = CY; ctx.lineWidth = 9; ctx.fillStyle = BG;
    ctx.beginPath(); ctx.roundRect(-70, -48, 140, 96, 34); ctx.fill(); ctx.stroke();
    ctx.fillStyle = MG; glow(MG, 22);
    ctx.beginPath(); ctx.arc(0, -4, 20 + (o.pulse || 0) * 14, 0, 7); ctx.fill();
    ctx.fillStyle = BG; noGlow();
    ctx.beginPath(); ctx.arc(0, -4, 8, 0, 7); ctx.fill();
    ctx.restore();
    noGlow();
  }

  // Building: 4 columns x 11 rows
  var B = { x: 1030, w: 250, top: 150, ground: GROUND, rowH: 54 };
  function winX(c) { return B.x + 12 + c * 62; }
  function winY(r) { return B.top + 16 + r * B.rowH; }
  function building(winFn) {
    ctx.fillStyle = '#0b0520'; ctx.strokeStyle = CY; ctx.lineWidth = 3; glow(CY, 16);
    ctx.fillRect(B.x, B.top, B.w, B.ground - B.top); ctx.strokeRect(B.x, B.top, B.w, B.ground - B.top);
    noGlow();
    for (var r = 0; r < 11; r++) for (var c = 0; c < 4; c++) winFn(r, c, winX(c), winY(r), 38, 34);
    ground();
  }
  function ground() {
    ctx.strokeStyle = CY; ctx.lineWidth = 3; glow(CY, 14);
    ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke(); noGlow();
  }
  function dimWin(x, y, w, h) {
    ctx.fillStyle = DIM; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = EDGE; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
  }
  function circle(x, y, r, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }

  var parts = [];
  function stepParts(dt, g) {
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life += dt; p.vy += g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life > p.max || p.y > GROUND) parts.splice(i, 1);
    }
  }
  function drawParts(col, r) {
    ctx.fillStyle = col; glow(col, 10);
    for (var i = 0; i < parts.length; i++) { ctx.beginPath(); ctx.arc(parts[i].x, parts[i].y, r, 0, 7); ctx.fill(); }
    noGlow();
  }

  // ---------- Programming (1.5 s): ones and zeros flow into the drone, then the next job loads ----------
  var digits = [], pulse = 0;
  function makeProgram(job) {
    return {
      dur: 1.5, fade: 0.18, name: 'uploading ' + job.replace(/ /g, '_') + '.bin', prog: true,
      reset: function () { digits = []; pulse = 0; },
      draw: function (u, dt) {
        var cx = 800, cy = 400 + Math.sin(T * 2.4) * 6;
        var n = dt * 140;
        for (var k = 0; k < Math.floor(n + pr()); k++) {
          var a = pr() * 6.283, d = 380 + pr() * 380;
          digits.push({ x0: cx + Math.cos(a) * d * 1.6, y0: cy + Math.sin(a) * d * 0.85, t: 0, dur: 0.45 + pr() * 0.45, s: pr() < 0.5 ? '1' : '0', sw: (pr() - 0.5) * 120, c: pr() < 0.6 ? CY : MG });
        }
        ctx.font = '700 28px ' + MONO; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
        for (var i = digits.length - 1; i >= 0; i--) {
          var q = digits[i]; q.t += dt;
          var f = q.t / q.dur;
          if (f >= 1) { digits.splice(i, 1); pulse = Math.min(1, pulse + 0.1); continue; }
          var e = f * f;
          var x = lerp(q.x0, cx, e) + Math.sin(f * 3.14) * q.sw;
          var y = lerp(q.y0, cy, e) + Math.sin(f * 3.14) * q.sw * 0.4;
          ctx.globalAlpha *= 1;
          ctx.fillStyle = q.c; glow(q.c, 10);
          ctx.fillText(q.s, x, y);
        }
        noGlow(); ctx.textAlign = 'left';
        pulse = Math.max(0, pulse - dt * 1.5);
        drone(cx, cy, 0.9, { pulse: pulse });
        // progress bar
        var bw = 520, bx = cx - bw / 2, by = 640;
        ctx.strokeStyle = CY; ctx.lineWidth = 2; glow(CY, 10); ctx.strokeRect(bx, by, bw, 18);
        ctx.fillStyle = MG; glow(MG, 12); ctx.fillRect(bx + 3, by + 3, (bw - 6) * clamp(u / 1.35), 12);
        noGlow();
      }
    };
  }

  // ---------- Pollution control ----------
  var haze = [];
  (function () {
    seed = 99;
    for (var i = 0; i < 70; i++) haze.push({ x: 480 + rnd() * 660, y: 520 + rnd() * 230, r: 30 + rnd() * 44, a: 0.3 + rnd() * 0.25, ph: rnd() * 6 });
    seed = 123;
  })();
  var S1 = {
    dur: 5, fade: 0.4, name: 'pollution control',
    reset: function () { parts = []; },
    draw: function (u, dt) {
      ground();
      var dx = lerp(330, 1250, sm((u - 0.5) / 3.9)), dy = 330 + Math.sin(T * 3) * 6;
      for (var j = 0; j < haze.length; j++) {
        var h = haze[j];
        var clear = sm((dx - h.x + 80) / 260);
        var a = h.a * (1 - clear);
        if (a < 0.01) continue;
        circle(h.x + Math.sin(T + h.ph) * 10, h.y + Math.cos(T * 0.7 + h.ph) * 6, h.r, 'rgba(190,60,210,' + a * 0.8 + ')');
      }
      if (u > 0.7 && u < 4.5) {
        var k = Math.round(dt * 110);
        for (var m = 0; m < k; m++) parts.push({ x: dx + (pr() - 0.5) * 70, y: dy + 55, vx: (pr() - 0.5) * 90 + 60, vy: 60 + pr() * 120, life: 0, max: 3 });
      }
      stepParts(dt, 700);
      drawParts(CY, 3);
      drone(dx, dy, 0.3, { tilt: 0.06 });
    }
  };

  // ---------- Firefighting ----------
  var FIRE_AT = { x: winX(1) + 19, y: winY(2) + 17 };
  function flame(x, y, s) {
    if (s <= 0.02) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); glow(HOT, 20);
    for (var i = 0; i < 3; i++) {
      var ox = (i - 1) * 12, hh = 30 + Math.sin(T * 12 + i * 2) * 7 - Math.abs(i - 1) * 8;
      ctx.fillStyle = i === 1 ? YL : HOT;
      ctx.beginPath(); ctx.moveTo(ox - 9, 14); ctx.quadraticCurveTo(ox - 9, -hh * 0.3, ox, -hh); ctx.quadraticCurveTo(ox + 9, -hh * 0.3, ox + 9, 14); ctx.closePath(); ctx.fill();
    }
    ctx.restore(); noGlow();
  }
  var S2 = {
    dur: 6.5, fade: 0.4, name: 'firefighting',
    reset: function () { parts = []; },
    draw: function (u, dt) {
      var f = 1 - sm((u - 3.4) / 1.8);
      building(function (r, c, x, y, w, h) {
        dimWin(x, y, w, h);
        if (r === 2 && c === 1) { ctx.fillStyle = 'rgba(255,61,110,' + (0.45 * f + 0.05) + ')'; ctx.fillRect(x, y, w, h); }
      });
      flame(FIRE_AT.x, FIRE_AT.y + 8, f * 1.1);
      if (f > 0.05) for (var s = 0; s < 3; s++) circle(FIRE_AT.x + Math.sin(T * 2 + s) * 14, FIRE_AT.y - 40 - ((T * 30 + s * 25) % 75), 10 + s * 3, 'rgba(190,60,210,' + 0.35 * f + ')');
      ctx.fillStyle = '#0b0520'; ctx.strokeStyle = MG; ctx.lineWidth = 3; glow(MG, 12);
      ctx.fillRect(470, GROUND - 42, 80, 42); ctx.strokeRect(470, GROUND - 42, 80, 42); noGlow();
      var t0 = sm(u / 2.6);
      var dx = lerp(540, 975, t0), dy = lerp(700, 300, t0) + (u > 2.6 ? Math.sin(T * 3) * 6 : 0);
      var nx = dx + 52, ny = dy + 50;
      ctx.strokeStyle = MG; ctx.lineWidth = 7; ctx.lineCap = 'round'; glow(MG, 14);
      ctx.beginPath(); ctx.moveTo(510, GROUND - 42); ctx.quadraticCurveTo((510 + nx) / 2, Math.max(GROUND - 42, ny) + 30 * (1 - t0 * 0.5), nx, ny); ctx.stroke(); noGlow();
      if (u > 2.7 && f > 0.02) {
        var k = Math.round(dt * 130);
        for (var m = 0; m < k; m++) {
          var ang = Math.atan2(FIRE_AT.y - ny, FIRE_AT.x - nx) + (pr() - 0.5) * 0.12, sp = 520 + pr() * 90;
          parts.push({ x: nx, y: ny, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 40, life: 0, max: 0.34 });
        }
      }
      stepParts(dt, 200);
      for (var z = parts.length - 1; z >= 0; z--) if (Math.hypot(parts[z].x - FIRE_AT.x, parts[z].y - FIRE_AT.y) < 24) parts.splice(z, 1);
      drawParts(CY, 3.2);
      drone(dx, dy, 0.3, { tilt: 0.05 });
    }
  };

  // ---------- Hyperlocal delivery ----------
  var DW = { x: winX(2), y: winY(5), w: 38, h: 34 };
  var S3 = {
    dur: 5, fade: 0.4, name: 'hyperlocal delivery',
    reset: function () { parts = []; },
    draw: function (u) {
      var open = sm((u - 2.8) / 0.6);
      building(function (r, c, x, y, w, h) {
        dimWin(x, y, w, h);
        if (r === 5 && c === 2 && open > 0) { ctx.fillStyle = 'rgba(252,238,9,' + (0.85 * open) + ')'; glow(YL, 14 * open); ctx.fillRect(x, y, w, h); noGlow(); }
      });
      var dx, dy;
      if (u < 2.4) { var t = sm(u / 2.4); dx = lerp(250, 975, t); dy = lerp(640, 430, t); }
      else if (u < 3.6) { dx = 975; dy = 430 + Math.sin(T * 3) * 5; }
      else { var t2 = sm((u - 3.6) / 1.4); dx = lerp(975, 650, t2); dy = lerp(430, 220, t2); }
      var px = dx, py = dy + 78, sc = 1;
      if (u >= 2.8 && u < 3.7) {
        var q = sm((u - 2.8) / 0.9);
        ctx.strokeStyle = 'rgba(25,240,255,.8)'; ctx.lineWidth = 2; glow(CY, 8);
        ctx.beginPath(); ctx.moveTo(dx + 40, dy + 50); ctx.lineTo(DW.x + 19, DW.y + 17); ctx.stroke(); noGlow();
        px = lerp(dx, DW.x + 19, q); py = lerp(dy + 78, DW.y + 17, q); sc = lerp(1, 0.45, q);
      }
      if (u < 3.7) {
        ctx.strokeStyle = CY; ctx.lineWidth = 2;
        if (u < 2.8) { ctx.beginPath(); ctx.moveTo(dx - 14, dy + 40); ctx.lineTo(px - 14 * sc, py - 18); ctx.moveTo(dx + 14, dy + 40); ctx.lineTo(px + 14 * sc, py - 18); ctx.stroke(); }
        ctx.fillStyle = YL; glow(YL, 14); ctx.fillRect(px - 20 * sc, py - 18 * sc, 40 * sc, 36 * sc); noGlow();
        ctx.strokeStyle = MG; ctx.lineWidth = 4 * sc; ctx.beginPath(); ctx.moveTo(px, py - 18 * sc); ctx.lineTo(px, py + 18 * sc); ctx.stroke();
      }
      if (u > 3.7) {
        var a = sm((u - 3.7) / 0.4);
        ctx.strokeStyle = CY; ctx.globalAlpha *= a; ctx.lineWidth = 5; ctx.lineCap = 'round'; glow(CY, 14);
        ctx.beginPath(); ctx.arc(DW.x + 19, DW.y + 17, 34, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(DW.x + 5, DW.y + 17); ctx.lineTo(DW.x + 16, DW.y + 28); ctx.lineTo(DW.x + 36, DW.y + 6); ctx.stroke(); noGlow();
        ctx.globalAlpha /= (a || 1);
      }
      drone(dx, dy, 0.3, { tilt: u < 2.4 ? 0.08 : (u > 3.6 ? -0.08 : 0) });
    }
  };

  // ---------- Window washing ----------
  var PASSES = 6;
  var S4 = {
    dur: 6, fade: 0.4, name: 'window washing',
    reset: function () { parts = []; },
    draw: function (u, dt) {
      var prog = clamp((u - 0.9) / 4.5);
      var pass = Math.min(PASSES - 1, Math.floor(prog * PASSES));
      var f = prog * PASSES - pass; if (prog >= 1) f = 1;
      var dir = pass % 2 === 0 ? 1 : -1;
      var xl = 1060, xr = 1250;
      var dx = u < 0.9 ? lerp(600, xl, sm(u / 0.9)) : (dir > 0 ? lerp(xl, xr, f) : lerp(xr, xl, f));
      var rowMid = function (k) { return (winY(2 * k) + winY(2 * k + 1) + 34) / 2; };
      var targetY = rowMid(pass);
      var dy = u < 0.9 ? lerp(300, rowMid(0), sm(u / 0.9)) : (f > 0.92 && pass < PASSES - 1 ? lerp(targetY, rowMid(pass + 1), sm((f - 0.92) / 0.08)) : targetY);
      if (prog >= 1) dy = rowMid(PASSES - 1);
      building(function (r, c, x, y, w, h) {
        var k = Math.floor(r / 2), cx = x + w / 2;
        var clean = prog > 0 && (k < pass || (k === pass && (dir > 0 ? cx <= dx : cx >= dx)) || prog >= 1);
        if (u < 0.9) clean = false;
        if (clean) {
          ctx.fillStyle = 'rgba(25,240,255,.85)'; glow(CY, 10); ctx.fillRect(x, y, w, h); noGlow();
          ctx.fillStyle = 'rgba(232,249,255,.9)'; ctx.fillRect(x + 4, y + 4, 8, h - 8);
        } else {
          ctx.fillStyle = '#1a0f33'; ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = EDGE; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
          ctx.fillStyle = 'rgba(255,43,214,.35)'; ctx.fillRect(x + 6, y + 8, 14, 5); ctx.fillRect(x + 18, y + 22, 12, 5);
        }
      });
      if (u > 0.8 && prog < 1) {
        var n = Math.round(dt * 70);
        for (var m = 0; m < n; m++) parts.push({ x: dx + (pr() - 0.5) * 100, y: dy + 10 + pr() * 40, vx: (pr() - 0.5) * 40, vy: 20 + pr() * 40, life: 0, max: 0.35 });
      }
      for (var i = parts.length - 1; i >= 0; i--) { var p = parts[i]; p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.life > p.max) parts.splice(i, 1); }
      drawParts(WH, 3);
      ctx.strokeStyle = MG; ctx.lineWidth = 6; ctx.lineCap = 'round'; glow(MG, 12);
      ctx.beginPath(); ctx.moveTo(dx - 45, dy + 58); ctx.lineTo(dx + 45, dy + 58); ctx.stroke(); noGlow();
      drone(dx, dy, 0.3);
    }
  };

  // program, job, program, job ...
  var scenes = [
    makeProgram('pollution control'), S1,
    makeProgram('firefighting'), S2,
    makeProgram('hyperlocal delivery'), S3,
    makeProgram('window washing'), S4
  ];
  var idx = 0, u = 0, running = false, last = 0, raf = 0;
  scenes[0].reset();

  function hud(sc) {
    // corner brackets
    ctx.strokeStyle = 'rgba(25,240,255,.7)'; ctx.lineWidth = 3; glow(CY, 8);
    var m = 36, l = 46;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(function (c) {
      ctx.beginPath(); ctx.moveTo(c[0] + c[2] * l, c[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0], c[1] + c[3] * l); ctx.stroke();
    });
    ctx.font = '600 26px ' + MONO; ctx.textBaseline = 'alphabetic';
    var flick = (Math.sin(T * 31) > 0.92) ? 0.55 : 1;
    ctx.globalAlpha = flick;
    ctx.fillStyle = sc.prog ? MG : CY; glow(sc.prog ? MG : CY, 12);
    ctx.fillText('> ' + sc.name.toUpperCase() + (Math.floor(T * 2) % 2 ? '_' : ' '), 78, 842);
    var job = Math.floor(idx / 2) + 1;
    ctx.fillStyle = YL; glow(YL, 10); ctx.textAlign = 'right';
    ctx.fillText('JOB 0' + job + '/04', W - 78, 842); ctx.textAlign = 'left';
    ctx.globalAlpha = 1; noGlow();
  }

  function glitch() {
    if ((T % 4.7) > 0.09) return;
    for (var k = 0; k < 3; k++) {
      var y = pr() * (H - 80), h = 14 + pr() * 46, dx = (pr() - 0.5) * 44;
      ctx.drawImage(cv, 0, y, W, h, dx, y, W, h);
    }
  }

  function frame(dt) {
    T += dt; u += dt;
    var sc = scenes[idx];
    if (u >= sc.dur) { u = 0; idx = (idx + 1) % scenes.length; sc = scenes[idx]; sc.reset(); }
    ctx.globalAlpha = 1; noGlow();
    ctx.drawImage(bgc, 0, 0);
    ctx.globalAlpha = clamp(Math.min(u / sc.fade, (sc.dur - u) / sc.fade));
    sc.draw(u, dt);
    ctx.globalAlpha = 1; noGlow();
    hud(sc);
    glitch();
  }
  function loop(ts) {
    if (!running) return;
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
    last = ts; frame(dt);
    raf = requestAnimationFrame(loop);
  }
  function start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    for (var i = 0; i < 70; i++) frame(1 / 60);
    return;
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(cv);
  } else start();
})();
