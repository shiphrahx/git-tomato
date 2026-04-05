import React, { useEffect, useRef } from 'react';

function populateStars(svgEl) {
  const g = svgEl.getElementById('stars');
  if (!g) return;
  // Clear existing
  while (g.firstChild) g.removeChild(g.firstChild);

  const ns = 'http://www.w3.org/2000/svg';
  const twinkle = [1.8, 2.4, 3.1, 2.0, 3.8, 1.5, 4.2, 2.8];
  for (let i = 0; i < 170; i++) {
    const x = Math.random() * 960;
    const y = Math.random() * 410;
    if (x > 812 && x < 888 && y < 118) continue;
    if (y > 390 && y < 445) continue;
    const r = document.createElementNS(ns, 'rect');
    const big = i < 18;
    r.setAttribute('x', x.toFixed(1));
    r.setAttribute('y', y.toFixed(1));
    r.setAttribute('width', big ? 3 : 2);
    r.setAttribute('height', big ? 3 : 2);
    const base = 0.3 + Math.random() * 0.7;
    r.setAttribute('fill', 'rgba(255,248,220,' + base.toFixed(2) + ')');
    if (i % 4 === 0) {
      const dur = twinkle[i % twinkle.length] + Math.random();
      const delay = (Math.random() * 4).toFixed(2);
      const anim = document.createElementNS(ns, 'animate');
      anim.setAttribute('attributeName', 'opacity');
      anim.setAttribute('values', `${base.toFixed(2)};${(base * 0.15).toFixed(2)};${base.toFixed(2)}`);
      anim.setAttribute('dur', dur.toFixed(1) + 's');
      anim.setAttribute('repeatCount', 'indefinite');
      anim.setAttribute('begin', delay + 's');
      r.appendChild(anim);
    }
    g.appendChild(r);
  }
}

function MorningScene() {
  return (
    <svg id="bg-svg" width="100%" height="100%"
      viewBox="0 0 960 540"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg">

      <rect x="0" y="0"   width="960" height="55"  fill="#62b8e0"/>
      <rect x="0" y="55"  width="960" height="55"  fill="#80c8e8"/>
      <rect x="0" y="110" width="960" height="55"  fill="#9ed4f0"/>
      <rect x="0" y="165" width="960" height="50"  fill="#b8e0f5"/>
      <rect x="0" y="215" width="960" height="50"  fill="#cce9f8"/>
      <rect x="0" y="265" width="960" height="45"  fill="#dcf0f8"/>
      <rect x="0" y="310" width="960" height="40"  fill="#eaf5f8"/>
      <rect x="0" y="350" width="960" height="30"  fill="#f4f8f0"/>
      <rect x="0" y="380" width="960" height="25"  fill="#f8f0e0"/>
      <rect x="0" y="405" width="960" height="20"  fill="#f8e8cc"/>

      <circle cx="108" cy="82" r="54" fill="rgba(252,224,64,0.14)"/>
      <circle cx="108" cy="82" r="44" fill="rgba(252,220,50,0.20)"/>
      <rect x="100" y="18"  width="16" height="24" fill="#fcd840"/>
      <rect x="100" y="122" width="16" height="24" fill="#fcd840"/>
      <rect x="34"  y="74"  width="24" height="16" fill="#fcd840"/>
      <rect x="150" y="74"  width="24" height="16" fill="#fcd840"/>
      <rect x="46"  y="36"  width="18" height="10" fill="#fcd840" transform="rotate(-45 55 41)"/>
      <rect x="152" y="36"  width="18" height="10" fill="#fcd840" transform="rotate(45 161 41)"/>
      <rect x="46"  y="118" width="18" height="10" fill="#fcd840" transform="rotate(45 55 123)"/>
      <rect x="152" y="118" width="18" height="10" fill="#fcd840" transform="rotate(-45 161 123)"/>
      <circle cx="108" cy="82" r="36" fill="#fce848"/>
      <ellipse cx="96" cy="68" rx="14" ry="10" fill="rgba(255,255,200,0.4)"/>

      <rect x="218" y="76"  width="52"  height="18" fill="#fafcff"/>
      <rect x="200" y="88"  width="36"  height="16" fill="#fafcff"/>
      <rect x="196" y="98"  width="108" height="22" fill="#fafcff"/>
      <rect x="232" y="60"  width="32"  height="16" fill="#fafcff"/>
      <rect x="196" y="116" width="108" height="6"  fill="#e8f0f8" opacity="0.7"/>

      <rect x="648" y="58" width="36" height="14" fill="#fafcff"/>
      <rect x="636" y="66" width="72" height="18" fill="#fafcff"/>
      <rect x="636" y="80" width="72" height="5"  fill="#e8f0f8" opacity="0.65"/>

      <rect x="780" y="108" width="44" height="14" fill="#fafcff"/>
      <rect x="764" y="118" width="88" height="20" fill="#fafcff"/>
      <rect x="764" y="134" width="88" height="5"  fill="#e8f0f8" opacity="0.65"/>

      <rect x="880" y="70" width="28" height="12" fill="#fafcff" opacity="0.85"/>
      <rect x="872" y="78" width="56" height="16" fill="#fafcff" opacity="0.85"/>

      <rect x="350" y="38" width="32" height="12" fill="#fafcff" opacity="0.9"/>
      <rect x="338" y="46" width="64" height="16" fill="#fafcff" opacity="0.9"/>

      <polygon fill="#80c060"
        points="0,385 50,368 105,378 162,358 218,372 275,352 330,367 388,348 445,362 502,344 558,359 614,340 668,356 723,336 778,352 832,334 886,348 960,335 960,540 0,540"/>

      <polygon fill="#5a9e40"
        points="0,420 58,408 118,418 180,403 242,416 305,400 368,412 430,397 494,410 556,395 618,408 680,393 742,406 804,391 866,404 960,393 960,540 0,540"/>

      <rect x="88"  y="414" width="6"  height="14" fill="#3a7030"/>
      <rect x="80"  y="408" width="22" height="6"  fill="#448038"/>
      <rect x="82"  y="402" width="18" height="6"  fill="#4a8a3e"/>
      <rect x="85"  y="396" width="12" height="6"  fill="#509444"/>
      <rect x="258" y="413" width="6"  height="13" fill="#3a7030"/>
      <rect x="250" y="407" width="22" height="6"  fill="#448038"/>
      <rect x="252" y="401" width="18" height="6"  fill="#4a8a3e"/>
      <rect x="255" y="395" width="12" height="6"  fill="#509444"/>
      <rect x="508" y="412" width="6"  height="15" fill="#3a7030"/>
      <rect x="500" y="406" width="22" height="6"  fill="#448038"/>
      <rect x="502" y="400" width="18" height="6"  fill="#4a8a3e"/>
      <rect x="505" y="394" width="12" height="6"  fill="#509444"/>
      <rect x="718" y="414" width="6"  height="13" fill="#3a7030"/>
      <rect x="710" y="408" width="22" height="6"  fill="#448038"/>
      <rect x="712" y="402" width="18" height="6"  fill="#4a8a3e"/>
      <rect x="715" y="396" width="12" height="6"  fill="#509444"/>
      <rect x="878" y="411" width="6"  height="15" fill="#3a7030"/>
      <rect x="870" y="405" width="22" height="6"  fill="#448038"/>
      <rect x="872" y="399" width="18" height="6"  fill="#4a8a3e"/>
      <rect x="875" y="393" width="12" height="6"  fill="#509444"/>

      <polygon fill="#428030"
        points="0,456 78,442 156,452 234,438 312,450 390,436 468,448 546,434 624,446 702,432 780,444 858,432 960,438 960,540 0,540"/>

      <rect x="0" y="490" width="960" height="50" fill="#306020"/>

      <rect x="40"  y="458" width="4" height="6" fill="#e84040" opacity="0.9"/>
      <rect x="38"  y="454" width="8" height="4" fill="#e84040" opacity="0.9"/>
      <rect x="142" y="460" width="4" height="6" fill="#f8c820" opacity="0.9"/>
      <rect x="140" y="456" width="8" height="4" fill="#f8c820" opacity="0.9"/>
      <rect x="288" y="457" width="4" height="6" fill="#e84080" opacity="0.9"/>
      <rect x="286" y="453" width="8" height="4" fill="#e84080" opacity="0.9"/>
      <rect x="410" y="459" width="4" height="6" fill="#e84040" opacity="0.9"/>
      <rect x="408" y="455" width="8" height="4" fill="#e84040" opacity="0.9"/>
      <rect x="540" y="456" width="4" height="6" fill="#f8c820" opacity="0.9"/>
      <rect x="538" y="452" width="8" height="4" fill="#f8c820" opacity="0.9"/>
      <rect x="660" y="458" width="4" height="6" fill="#e84080" opacity="0.9"/>
      <rect x="658" y="454" width="8" height="4" fill="#e84080" opacity="0.9"/>
      <rect x="790" y="456" width="4" height="6" fill="#e84040" opacity="0.9"/>
      <rect x="788" y="452" width="8" height="4" fill="#e84040" opacity="0.9"/>
      <rect x="900" y="460" width="4" height="6" fill="#f8c820" opacity="0.9"/>
      <rect x="898" y="456" width="8" height="4" fill="#f8c820" opacity="0.9"/>

      <g opacity="0.7">
        <path d="M200,140 Q206,136 212,140 Q218,136 224,140" stroke="#2a4a6a" strokeWidth="2" fill="none">
          <animateTransform attributeName="transform" type="translate" values="-50,0;960,0" dur="28s" repeatCount="indefinite" begin="0s"/>
        </path>
        <path d="M0,180 Q7,175 14,180 Q21,175 28,180" stroke="#2a4a6a" strokeWidth="2" fill="none">
          <animateTransform attributeName="transform" type="translate" values="-40,0;960,0" dur="34s" repeatCount="indefinite" begin="5s"/>
        </path>
        <path d="M100,110 Q106,106 112,110 Q118,106 124,110" stroke="#2a4a6a" strokeWidth="2" fill="none">
          <animateTransform attributeName="transform" type="translate" values="-120,0;960,0" dur="22s" repeatCount="indefinite" begin="12s"/>
        </path>
        <path d="M300,95 Q308,90 316,95 Q324,90 332,95" stroke="#2a4a6a" strokeWidth="2.5" fill="none">
          <animateTransform attributeName="transform" type="translate" values="-350,0;960,0" dur="40s" repeatCount="indefinite" begin="3s"/>
        </path>
      </g>

      <rect x="0" y="402" width="960" height="8" fill="#f8e0b0" opacity="0.20"/>
    </svg>
  );
}

function TwilightScene() {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current) populateStars(svgRef.current);
  }, []);

  return (
    <svg ref={svgRef} id="bg-svg" width="100%" height="100%"
      viewBox="0 0 960 540"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg">

      <rect x="0" y="0"   width="960" height="60"  fill="#080418"/>
      <rect x="0" y="60"  width="960" height="55"  fill="#110630"/>
      <rect x="0" y="115" width="960" height="55"  fill="#1e0c48"/>
      <rect x="0" y="170" width="960" height="50"  fill="#341560"/>
      <rect x="0" y="220" width="960" height="48"  fill="#4e2070"/>
      <rect x="0" y="268" width="960" height="44"  fill="#6a2c78"/>
      <rect x="0" y="312" width="960" height="40"  fill="#8a3070"/>
      <rect x="0" y="352" width="960" height="35"  fill="#a83858"/>
      <rect x="0" y="387" width="960" height="28"  fill="#cc5048"/>
      <rect x="0" y="415" width="960" height="22"  fill="#e07050"/>
      <rect x="0" y="437" width="960" height="12"  fill="#f09058"/>
      <rect x="0" y="444" width="960" height="6"   fill="#f4a870" opacity="0.35"/>

      <defs>
        <mask id="moonmask">
          <circle cx="848" cy="78" r="30" fill="white"/>
          <circle cx="863" cy="68" r="24" fill="black"/>
        </mask>
      </defs>
      <circle cx="848" cy="78" r="30" fill="#f5e8a8" mask="url(#moonmask)" opacity="0.88"/>
      <circle cx="848" cy="78" r="36" fill="none" stroke="#f5e8a8" strokeWidth="6" opacity="0.06"/>

      <g id="stars"></g>

      <polygon fill="#1c3628"
        points="0,388 45,372 90,380 145,362 200,374 258,355 315,368 375,350 430,364 490,347 548,360 605,343 660,357 715,340 768,354 825,338 882,352 960,338 960,540 0,540"/>

      <polygon fill="#152a1e"
        points="0,422 55,410 115,420 178,406 240,417 305,402 368,413 430,399 494,411 558,397 620,409 682,395 744,407 806,393 868,405 960,395 960,540 0,540"/>

      <rect x="78"  y="416" width="5"  height="13" fill="#0c1c12"/>
      <rect x="71"  y="411" width="19" height="5"  fill="#102016"/>
      <rect x="73"  y="406" width="15" height="5"  fill="#122416"/>
      <rect x="76"  y="401" width="9"  height="5"  fill="#142816"/>
      <rect x="218" y="415" width="5"  height="12" fill="#0c1c12"/>
      <rect x="211" y="410" width="19" height="5"  fill="#102016"/>
      <rect x="213" y="405" width="15" height="5"  fill="#122416"/>
      <rect x="216" y="400" width="9"  height="5"  fill="#142816"/>
      <rect x="478" y="414" width="5"  height="14" fill="#0c1c12"/>
      <rect x="471" y="409" width="19" height="5"  fill="#102016"/>
      <rect x="473" y="404" width="15" height="5"  fill="#122416"/>
      <rect x="476" y="399" width="9"  height="5"  fill="#142816"/>
      <rect x="678" y="416" width="5"  height="12" fill="#0c1c12"/>
      <rect x="671" y="411" width="19" height="5"  fill="#102016"/>
      <rect x="673" y="406" width="15" height="5"  fill="#122416"/>
      <rect x="676" y="401" width="9"  height="5"  fill="#142816"/>
      <rect x="859" y="413" width="5"  height="14" fill="#0c1c12"/>
      <rect x="852" y="408" width="19" height="5"  fill="#102016"/>
      <rect x="854" y="403" width="15" height="5"  fill="#122416"/>
      <rect x="857" y="398" width="9"  height="5"  fill="#142816"/>

      <polygon fill="#0e1e14"
        points="0,458 75,444 150,454 228,440 306,451 384,438 460,450 538,436 616,448 694,434 770,446 848,434 960,440 960,540 0,540"/>

      <rect x="0" y="488" width="960" height="52" fill="#090d0a"/>

      <circle cx="160" cy="435" r="2" fill="#d0f8a0" opacity="0.0">
        <animate attributeName="opacity" values="0;0.8;0" dur="2.8s" repeatCount="indefinite" begin="0s"/>
      </circle>
      <circle cx="320" cy="428" r="2" fill="#c8f0a0" opacity="0.0">
        <animate attributeName="opacity" values="0;0.7;0" dur="3.4s" repeatCount="indefinite" begin="1.2s"/>
      </circle>
      <circle cx="580" cy="440" r="2" fill="#d4f8b0" opacity="0.0">
        <animate attributeName="opacity" values="0;0.9;0" dur="2.2s" repeatCount="indefinite" begin="0.6s"/>
      </circle>
      <circle cx="760" cy="432" r="2" fill="#c8f8a8" opacity="0.0">
        <animate attributeName="opacity" values="0;0.75;0" dur="3.8s" repeatCount="indefinite" begin="2s"/>
      </circle>
      <circle cx="430" cy="450" r="1.5" fill="#d0f8a0" opacity="0.0">
        <animate attributeName="opacity" values="0;0.8;0" dur="4.2s" repeatCount="indefinite" begin="0.8s"/>
      </circle>
      <circle cx="880" cy="442" r="2" fill="#c8f8a8" opacity="0.0">
        <animate attributeName="opacity" values="0;0.6;0" dur="2.6s" repeatCount="indefinite" begin="1.8s"/>
      </circle>
    </svg>
  );
}

export function BackgroundScene({ theme }) {
  return (
    <div id="scene" style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {theme === 'morning' ? <MorningScene /> : <TwilightScene />}
    </div>
  );
}
