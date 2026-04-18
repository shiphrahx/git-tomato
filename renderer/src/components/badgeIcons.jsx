import React from 'react';

// Pixel-art SVG icons for each badge slug.
// Locked state renders a greyscale placeholder.

export function BadgeIcon({ slug, locked = false }) {
  const icon = BADGE_ICONS[slug];
  if (!icon) return null;
  return (
    <span className={`badge-svg-icon${locked ? ' badge-svg-icon--locked' : ''}`}>
      {icon}
    </span>
  );
}

const BADGE_ICONS = {

  // ── OUTPUT ──────────────────────────────────────────────────────────────

  first_blood: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="12" y="8" width="26" height="24" fill="#7a1a1a"/>
      <rect x="10" y="10" width="30" height="22" fill="#c02020"/>
      <rect x="12" y="8" width="26" height="4" fill="#e03030"/>
      <rect x="10" y="10" width="4" height="18" fill="#e03030"/>
      <rect x="36" y="10" width="4" height="18" fill="#e03030"/>
      <rect x="14" y="30" width="22" height="4" fill="#c02020"/>
      <rect x="16" y="34" width="18" height="4" fill="#a01818"/>
      <rect x="18" y="38" width="14" height="2" fill="#a01818"/>
      <rect x="20" y="40" width="10" height="2" fill="#801010"/>
      <rect x="22" y="42" width="6" height="2" fill="#801010"/>
      <rect x="24" y="44" width="2" height="2" fill="#601010"/>
      <rect x="22" y="16" width="6" height="2" fill="#ff6060"/>
      <rect x="20" y="18" width="10" height="2" fill="#ff4040"/>
      <rect x="20" y="20" width="10" height="2" fill="#ff4040"/>
      <rect x="22" y="22" width="6" height="4" fill="#ff3030"/>
      <rect x="24" y="26" width="2" height="2" fill="#ff3030"/>
      <rect x="14" y="10" width="4" height="2" fill="#ff8080" opacity="0.5"/>
    </svg>
  ),

  firestarter: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="20" y="40" width="10" height="4" fill="#e06000"/>
      <rect x="18" y="36" width="14" height="4" fill="#e07000"/>
      <rect x="16" y="32" width="18" height="4" fill="#f08000"/>
      <rect x="14" y="28" width="22" height="4" fill="#f09000"/>
      <rect x="16" y="24" width="18" height="4" fill="#f0a000"/>
      <rect x="18" y="20" width="14" height="4" fill="#f0b000"/>
      <rect x="20" y="16" width="10" height="4" fill="#f0c000"/>
      <rect x="22" y="12" width="6" height="4" fill="#f8d000"/>
      <rect x="24" y="8" width="2" height="4" fill="#fff000"/>
      <rect x="22" y="36" width="6" height="4" fill="#ff8000"/>
      <rect x="20" y="32" width="10" height="4" fill="#ff9000"/>
      <rect x="20" y="28" width="10" height="4" fill="#ffa000"/>
      <rect x="22" y="24" width="6" height="4" fill="#ffb000"/>
      <rect x="22" y="20" width="6" height="4" fill="#ffc000"/>
      <rect x="24" y="16" width="2" height="4" fill="#ffd000"/>
      <rect x="12" y="20" width="2" height="2" fill="#ff8000"/>
      <rect x="36" y="22" width="2" height="2" fill="#ff8000"/>
      <rect x="14" y="14" width="2" height="2" fill="#ffc000"/>
      <rect x="34" y="16" width="2" height="2" fill="#ffc000"/>
      <rect x="10" y="30" width="2" height="2" fill="#ff6000"/>
    </svg>
  ),

  the_refactorer: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="8" y="20" width="6" height="4" fill="#6080c0"/>
      <rect x="8" y="18" width="4" height="2" fill="#8090d0"/>
      <rect x="10" y="16" width="4" height="2" fill="#8090d0"/>
      <rect x="10" y="14" width="6" height="2" fill="#a0b0e0"/>
      <rect x="14" y="16" width="4" height="2" fill="#8090d0"/>
      <rect x="14" y="18" width="4" height="2" fill="#6080c0"/>
      <rect x="14" y="22" width="28" height="6" fill="#4060a0"/>
      <rect x="14" y="22" width="28" height="2" fill="#6080c0"/>
      <rect x="36" y="22" width="4" height="4" fill="#3050a0"/>
      <rect x="24" y="10" width="4" height="2" fill="#60d080"/>
      <rect x="22" y="12" width="2" height="2" fill="#60d080"/>
      <rect x="28" y="12" width="2" height="2" fill="#60d080"/>
      <rect x="20" y="14" width="2" height="4" fill="#40c060"/>
      <rect x="30" y="14" width="2" height="4" fill="#40c060"/>
      <rect x="20" y="18" width="2" height="2" fill="#40c060"/>
      <rect x="28" y="18" width="4" height="2" fill="#40c060"/>
      <rect x="22" y="20" width="4" height="2" fill="#40c060"/>
      <rect x="26" y="20" width="2" height="2" fill="#60d080"/>
      <rect x="18" y="16" width="2" height="2" fill="#80e0a0"/>
      <rect x="30" y="18" width="2" height="2" fill="#80e0a0"/>
    </svg>
  ),

  deleter: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="12" y="18" width="26" height="26" fill="#404040"/>
      <rect x="12" y="18" width="26" height="4" fill="#606060"/>
      <rect x="14" y="22" width="22" height="20" fill="#383838"/>
      <rect x="18" y="26" width="2" height="12" fill="#202020"/>
      <rect x="24" y="26" width="2" height="12" fill="#202020"/>
      <rect x="30" y="26" width="2" height="12" fill="#202020"/>
      <rect x="10" y="14" width="30" height="4" fill="#707070"/>
      <rect x="18" y="10" width="14" height="4" fill="#606060"/>
      <rect x="20" y="8" width="10" height="2" fill="#505050"/>
      <rect x="6" y="6" width="14" height="4" fill="#cc2020"/>
      <rect x="6" y="6" width="14" height="2" fill="#ee3030"/>
    </svg>
  ),

  polyglot: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="6" y="6" width="14" height="18" fill="#c0a000"/>
      <rect x="6" y="6" width="14" height="3" fill="#e0c000"/>
      <rect x="14" y="6" width="6" height="6" fill="#806800"/>
      <rect x="14" y="6" width="6" height="3" fill="#c0a000"/>
      <rect x="8" y="16" width="8" height="2" fill="#806800"/>
      <rect x="8" y="20" width="6" height="2" fill="#806800"/>
      <rect x="30" y="6" width="14" height="18" fill="#2060c0"/>
      <rect x="30" y="6" width="14" height="3" fill="#4080e0"/>
      <rect x="30" y="6" width="6" height="6" fill="#103080"/>
      <rect x="30" y="6" width="6" height="3" fill="#2060c0"/>
      <rect x="32" y="16" width="8" height="2" fill="#103080"/>
      <rect x="32" y="20" width="6" height="2" fill="#103080"/>
      <rect x="6" y="30" width="14" height="14" fill="#c05000"/>
      <rect x="6" y="30" width="14" height="3" fill="#e07000"/>
      <rect x="14" y="30" width="6" height="6" fill="#803000"/>
      <rect x="14" y="30" width="6" height="3" fill="#c05000"/>
      <rect x="8" y="36" width="8" height="2" fill="#803000"/>
      <rect x="30" y="30" width="14" height="14" fill="#208040"/>
      <rect x="30" y="30" width="14" height="3" fill="#40a060"/>
      <rect x="30" y="30" width="6" height="6" fill="#106030"/>
      <rect x="30" y="30" width="6" height="3" fill="#208040"/>
      <rect x="32" y="36" width="8" height="2" fill="#106030"/>
      <rect x="22" y="20" width="6" height="10" fill="#8070a0"/>
      <rect x="18" y="23" width="14" height="4" fill="#8070a0"/>
      <rect x="22" y="20" width="6" height="4" fill="#a090c0"/>
    </svg>
  ),

  century: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="18" y="8" width="14" height="16" fill="#c8900c"/>
      <rect x="18" y="8" width="14" height="4" fill="#e0b020"/>
      <rect x="16" y="10" width="4" height="10" fill="#e0b020"/>
      <rect x="30" y="10" width="4" height="10" fill="#e0b020"/>
      <rect x="12" y="10" width="4" height="6" fill="#c0800c"/>
      <rect x="34" y="10" width="4" height="6" fill="#c0800c"/>
      <rect x="20" y="24" width="10" height="4" fill="#a07008"/>
      <rect x="18" y="28" width="14" height="4" fill="#906008"/>
      <rect x="16" y="32" width="18" height="4" fill="#c8900c"/>
      <rect x="14" y="36" width="22" height="4" fill="#a07008"/>
      <rect x="24" y="12" width="2" height="8" fill="#fff080"/>
      <rect x="20" y="14" width="10" height="4" fill="#fff080"/>
      <rect x="22" y="12" width="2" height="2" fill="#ffffc0"/>
      <rect x="18" y="38" width="14" height="2" fill="#806000" opacity="0.6"/>
    </svg>
  ),

  deep_cut: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="8" y="22" width="30" height="6" fill="#9090a0"/>
      <rect x="8" y="22" width="30" height="2" fill="#c0c0d0"/>
      <rect x="34" y="18" width="8" height="4" fill="#a0a0b0"/>
      <rect x="36" y="22" width="6" height="4" fill="#c0c0d0"/>
      <rect x="38" y="26" width="4" height="2" fill="#909090"/>
      <rect x="6" y="22" width="8" height="6" fill="#604040"/>
      <rect x="6" y="22" width="8" height="2" fill="#806060"/>
      <rect x="10" y="10" width="16" height="2" fill="#60d060"/>
      <rect x="8" y="13" width="22" height="2" fill="#60d060"/>
      <rect x="10" y="34" width="20" height="2" fill="#d04040"/>
      <rect x="12" y="37" width="24" height="2" fill="#d04040"/>
      <rect x="8" y="40" width="18" height="2" fill="#d04040"/>
      <rect x="6" y="10" width="2" height="2" fill="#40e040"/>
      <rect x="6" y="13" width="2" height="2" fill="#40e040"/>
      <rect x="6" y="34" width="2" height="2" fill="#e04040"/>
      <rect x="6" y="37" width="2" height="2" fill="#e04040"/>
      <rect x="6" y="40" width="2" height="2" fill="#e04040"/>
    </svg>
  ),

  // ── CONSISTENCY ──────────────────────────────────────────────────────────

  creature_of_habit: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="8" y="10" width="34" height="32" fill="#1a2030"/>
      <rect x="8" y="10" width="34" height="6" fill="#4060c0"/>
      <rect x="8" y="16" width="34" height="2" fill="#2a3040"/>
      <rect x="8" y="22" width="34" height="2" fill="#2a3040"/>
      <rect x="8" y="28" width="34" height="2" fill="#2a3040"/>
      <rect x="8" y="34" width="34" height="2" fill="#2a3040"/>
      <rect x="14" y="16" width="2" height="26" fill="#2a3040"/>
      <rect x="20" y="16" width="2" height="26" fill="#2a3040"/>
      <rect x="26" y="16" width="2" height="26" fill="#2a3040"/>
      <rect x="32" y="16" width="2" height="26" fill="#2a3040"/>
      <rect x="10" y="18" width="3" height="3" fill="#60d080"/>
      <rect x="16" y="18" width="3" height="3" fill="#60d080"/>
      <rect x="22" y="18" width="3" height="3" fill="#60d080"/>
      <rect x="28" y="18" width="3" height="3" fill="#60d080"/>
      <rect x="34" y="18" width="3" height="3" fill="#60d080"/>
      <rect x="10" y="24" width="3" height="3" fill="#60d080"/>
      <rect x="16" y="24" width="3" height="3" fill="#60d080"/>
      <rect x="30" y="6" width="4" height="4" fill="#f08000"/>
      <rect x="32" y="4" width="2" height="2" fill="#f0c000"/>
      <rect x="28" y="8" width="8" height="2" fill="#f06000"/>
    </svg>
  ),

  iron_week: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="12" y="8" width="26" height="28" fill="#506070"/>
      <rect x="12" y="8" width="26" height="4" fill="#708090"/>
      <rect x="10" y="10" width="4" height="22" fill="#708090"/>
      <rect x="36" y="10" width="4" height="22" fill="#708090"/>
      <rect x="14" y="34" width="22" height="4" fill="#506070"/>
      <rect x="16" y="38" width="18" height="3" fill="#405060"/>
      <rect x="18" y="41" width="14" height="2" fill="#304050"/>
      <rect x="22" y="43" width="6" height="2" fill="#304050"/>
      <rect x="24" y="45" width="2" height="2" fill="#203040"/>
      <rect x="15" y="14" width="3" height="3" fill="#a0d0f0"/>
      <rect x="20" y="14" width="3" height="3" fill="#a0d0f0"/>
      <rect x="25" y="14" width="3" height="3" fill="#a0d0f0"/>
      <rect x="30" y="14" width="3" height="3" fill="#a0d0f0"/>
      <rect x="15" y="20" width="3" height="3" fill="#a0d0f0"/>
      <rect x="20" y="20" width="3" height="3" fill="#a0d0f0"/>
      <rect x="25" y="20" width="3" height="3" fill="#a0d0f0"/>
      <rect x="18" y="28" width="4" height="4" fill="#40e0a0"/>
      <rect x="22" y="30" width="4" height="2" fill="#40e0a0"/>
      <rect x="26" y="26" width="4" height="4" fill="#40e0a0"/>
    </svg>
  ),

  monthly_committer: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="28" y="6" width="12" height="2" fill="#e0d080"/>
      <rect x="26" y="8" width="16" height="2" fill="#e8d890"/>
      <rect x="24" y="10" width="18" height="8" fill="#e8d890"/>
      <rect x="26" y="18" width="16" height="4" fill="#e8d890"/>
      <rect x="28" y="22" width="12" height="2" fill="#e0d080"/>
      <rect x="28" y="6" width="12" height="18" fill="#0a0a18"/>
      <rect x="30" y="4" width="10" height="22" fill="#0a0a18"/>
      <rect x="8" y="30" width="3" height="3" fill="#6080d0"/>
      <rect x="13" y="30" width="3" height="3" fill="#6080d0"/>
      <rect x="18" y="30" width="3" height="3" fill="#6080d0"/>
      <rect x="23" y="30" width="3" height="3" fill="#6080d0"/>
      <rect x="28" y="30" width="3" height="3" fill="#6080d0"/>
      <rect x="33" y="30" width="3" height="3" fill="#6080d0"/>
      <rect x="8" y="35" width="3" height="3" fill="#6080d0"/>
      <rect x="13" y="35" width="3" height="3" fill="#6080d0"/>
      <rect x="18" y="35" width="3" height="3" fill="#6080d0"/>
      <rect x="23" y="35" width="3" height="3" fill="#6080d0"/>
      <rect x="28" y="35" width="3" height="3" fill="#6080d0"/>
      <rect x="33" y="35" width="3" height="3" fill="#6080d0"/>
      <rect x="8" y="40" width="3" height="3" fill="#6080d0"/>
      <rect x="13" y="40" width="3" height="3" fill="#6080d0"/>
      <rect x="18" y="40" width="3" height="3" fill="#6080d0"/>
      <rect x="23" y="40" width="3" height="3" fill="#6080d0"/>
      <rect x="28" y="40" width="3" height="3" fill="#4060a0"/>
      <rect x="33" y="40" width="3" height="3" fill="#303050"/>
    </svg>
  ),

  mono_tasker: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="10" y="20" width="30" height="10" fill="#203020"/>
      <rect x="12" y="18" width="26" height="14" fill="#284028"/>
      <rect x="16" y="16" width="18" height="4" fill="#40c040"/>
      <rect x="16" y="30" width="18" height="4" fill="#40c040"/>
      <rect x="12" y="18" width="4" height="14" fill="#40c040"/>
      <rect x="34" y="18" width="4" height="14" fill="#40c040"/>
      <rect x="20" y="20" width="10" height="2" fill="#60e060"/>
      <rect x="20" y="28" width="10" height="2" fill="#60e060"/>
      <rect x="18" y="22" width="2" height="6" fill="#60e060"/>
      <rect x="30" y="22" width="2" height="6" fill="#60e060"/>
      <rect x="22" y="22" width="6" height="6" fill="#80ff80"/>
      <rect x="23" y="23" width="4" height="4" fill="#c0ffc0"/>
      <rect x="6" y="14" width="8" height="2" fill="#30a030"/>
      <rect x="6" y="14" width="2" height="8" fill="#30a030"/>
      <rect x="36" y="14" width="8" height="2" fill="#30a030"/>
      <rect x="42" y="14" width="2" height="8" fill="#30a030"/>
      <rect x="6" y="34" width="8" height="2" fill="#30a030"/>
      <rect x="6" y="28" width="2" height="8" fill="#30a030"/>
      <rect x="36" y="34" width="8" height="2" fill="#30a030"/>
      <rect x="42" y="28" width="2" height="8" fill="#30a030"/>
    </svg>
  ),

  comeback_kid: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="8" y="42" width="34" height="4" fill="#403020"/>
      <rect x="10" y="40" width="30" height="2" fill="#604030"/>
      <rect x="20" y="24" width="10" height="10" fill="#e06020"/>
      <rect x="18" y="26" width="14" height="6" fill="#f07030"/>
      <rect x="8" y="22" width="12" height="4" fill="#e08020"/>
      <rect x="6" y="18" width="12" height="4" fill="#f09030"/>
      <rect x="6" y="14" width="8" height="4" fill="#f0a040"/>
      <rect x="8" y="10" width="6" height="4" fill="#f0c060"/>
      <rect x="30" y="22" width="12" height="4" fill="#e08020"/>
      <rect x="32" y="18" width="12" height="4" fill="#f09030"/>
      <rect x="36" y="14" width="8" height="4" fill="#f0a040"/>
      <rect x="36" y="10" width="6" height="4" fill="#f0c060"/>
      <rect x="22" y="18" width="6" height="6" fill="#f08030"/>
      <rect x="22" y="18" width="6" height="2" fill="#f0c060"/>
      <rect x="26" y="22" width="4" height="2" fill="#f0d080"/>
      <rect x="22" y="20" width="2" height="2" fill="#fff"/>
      <rect x="20" y="34" width="4" height="6" fill="#e06020"/>
      <rect x="26" y="34" width="4" height="6" fill="#e06020"/>
      <rect x="24" y="34" width="2" height="8" fill="#f08040"/>
    </svg>
  ),

  // ── TIME ─────────────────────────────────────────────────────────────────

  early_bird: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="0" y="28" width="50" height="22" fill="#1a0a2a"/>
      <rect x="0" y="26" width="50" height="4" fill="#3a1a4a"/>
      <rect x="14" y="22" width="22" height="6" fill="#f09030"/>
      <rect x="16" y="20" width="18" height="2" fill="#f0b040"/>
      <rect x="18" y="18" width="14" height="2" fill="#f0c060"/>
      <rect x="10" y="24" width="6" height="2" fill="#f09030"/>
      <rect x="34" y="24" width="6" height="2" fill="#f09030"/>
      <rect x="12" y="20" width="4" height="2" fill="#f0a040"/>
      <rect x="34" y="20" width="4" height="2" fill="#f0a040"/>
      <rect x="22" y="14" width="6" height="4" fill="#f0c060"/>
      <rect x="8" y="14" width="6" height="2" fill="#302040"/>
      <rect x="6" y="12" width="6" height="2" fill="#302040"/>
      <rect x="10" y="10" width="4" height="2" fill="#302040"/>
      <rect x="12" y="12" width="4" height="2" fill="#302040"/>
      <rect x="14" y="14" width="2" height="2" fill="#302040"/>
      <rect x="0" y="28" width="50" height="2" fill="#602040"/>
    </svg>
  ),

  night_owl: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="8" y="6" width="2" height="2" fill="#e0e0f0"/>
      <rect x="18" y="4" width="2" height="2" fill="#c0c0e0"/>
      <rect x="30" y="8" width="2" height="2" fill="#e0e0f0"/>
      <rect x="40" y="4" width="2" height="2" fill="#c0c0e0"/>
      <rect x="44" y="14" width="2" height="2" fill="#e0e0f0"/>
      <rect x="6" y="16" width="2" height="2" fill="#a0a0d0"/>
      <rect x="32" y="6" width="8" height="2" fill="#e8d890"/>
      <rect x="30" y="8" width="12" height="8" fill="#e8d890"/>
      <rect x="32" y="16" width="8" height="2" fill="#e8d890"/>
      <rect x="34" y="6" width="6" height="12" fill="#040414"/>
      <rect x="32" y="8" width="4" height="8" fill="#040414"/>
      <rect x="16" y="22" width="18" height="20" fill="#604828"/>
      <rect x="14" y="24" width="22" height="16" fill="#806040"/>
      <rect x="18" y="14" width="14" height="10" fill="#806040"/>
      <rect x="16" y="16" width="18" height="6" fill="#a08060"/>
      <rect x="16" y="12" width="4" height="4" fill="#806040"/>
      <rect x="30" y="12" width="4" height="4" fill="#806040"/>
      <rect x="18" y="10" width="2" height="2" fill="#a08060"/>
      <rect x="30" y="10" width="2" height="2" fill="#a08060"/>
      <rect x="18" y="18" width="6" height="4" fill="#f0e000"/>
      <rect x="26" y="18" width="6" height="4" fill="#f0e000"/>
      <rect x="20" y="18" width="2" height="4" fill="#101010"/>
      <rect x="28" y="18" width="2" height="4" fill="#101010"/>
      <rect x="22" y="22" width="6" height="2" fill="#e0a020"/>
      <rect x="24" y="24" width="2" height="2" fill="#e0a020"/>
      <rect x="16" y="28" width="6" height="2" fill="#604828"/>
      <rect x="28" y="28" width="6" height="2" fill="#604828"/>
      <rect x="20" y="40" width="4" height="4" fill="#806040"/>
      <rect x="26" y="40" width="4" height="4" fill="#806040"/>
      <rect x="18" y="42" width="2" height="2" fill="#604828"/>
      <rect x="22" y="44" width="2" height="2" fill="#604828"/>
      <rect x="26" y="44" width="2" height="2" fill="#604828"/>
      <rect x="30" y="42" width="2" height="2" fill="#604828"/>
    </svg>
  ),

  deep_work: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="12" y="6" width="26" height="4" fill="#8060c0"/>
      <rect x="14" y="10" width="22" height="2" fill="#6040a0"/>
      <rect x="16" y="12" width="18" height="2" fill="#c0a020"/>
      <rect x="18" y="14" width="14" height="2" fill="#d0b030"/>
      <rect x="20" y="16" width="10" height="2" fill="#e0c040"/>
      <rect x="22" y="18" width="6" height="2" fill="#f0d050"/>
      <rect x="23" y="20" width="4" height="4" fill="#d0a020"/>
      <rect x="23" y="24" width="4" height="2" fill="#d0a020"/>
      <rect x="21" y="26" width="8" height="2" fill="#c09018"/>
      <rect x="18" y="28" width="14" height="2" fill="#c09018"/>
      <rect x="16" y="30" width="18" height="2" fill="#b08010"/>
      <rect x="14" y="32" width="22" height="2" fill="#b08010"/>
      <rect x="14" y="34" width="22" height="2" fill="#6040a0"/>
      <rect x="12" y="36" width="26" height="4" fill="#8060c0"/>
      <rect x="10" y="44" width="6" height="4" fill="#e06020"/>
      <rect x="18" y="44" width="6" height="4" fill="#e06020"/>
      <rect x="26" y="44" width="6" height="4" fill="#e06020"/>
      <rect x="34" y="44" width="6" height="4" fill="#e06020"/>
    </svg>
  ),

  marathon: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="28" y="6" width="6" height="6" fill="#e0b080"/>
      <rect x="26" y="12" width="8" height="8" fill="#2060d0"/>
      <rect x="18" y="14" width="8" height="4" fill="#2060d0"/>
      <rect x="32" y="16" width="8" height="4" fill="#2060d0"/>
      <rect x="22" y="20" width="4" height="10" fill="#104080"/>
      <rect x="28" y="20" width="4" height="8" fill="#104080"/>
      <rect x="18" y="28" width="4" height="4" fill="#104080"/>
      <rect x="28" y="26" width="4" height="6" fill="#104080"/>
      <rect x="16" y="32" width="6" height="4" fill="#404040"/>
      <rect x="28" y="30" width="6" height="4" fill="#404040"/>
      <rect x="6" y="10" width="4" height="32" fill="#f0f0f0"/>
      <rect x="6" y="10" width="4" height="4" fill="#e04040"/>
      <rect x="6" y="18" width="4" height="4" fill="#e04040"/>
      <rect x="6" y="26" width="4" height="4" fill="#e04040"/>
      <rect x="6" y="34" width="4" height="4" fill="#e04040"/>
      <rect x="10" y="40" width="34" height="2" fill="#302020"/>
      <rect x="10" y="44" width="4" height="4" fill="#e04020"/>
      <rect x="16" y="44" width="4" height="4" fill="#e04020"/>
      <rect x="22" y="44" width="4" height="4" fill="#e04020"/>
      <rect x="28" y="44" width="4" height="4" fill="#e04020"/>
      <rect x="34" y="44" width="4" height="4" fill="#e04020"/>
      <rect x="40" y="44" width="4" height="4" fill="#e04020"/>
      <rect x="10" y="43" width="4" height="1" fill="#40a030"/>
      <rect x="16" y="43" width="4" height="1" fill="#40a030"/>
      <rect x="22" y="43" width="4" height="1" fill="#40a030"/>
    </svg>
  ),

  lunch_break_hacker: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="8" y="28" width="34" height="2" fill="#505050"/>
      <rect x="8" y="22" width="34" height="6" fill="#303030"/>
      <rect x="10" y="14" width="30" height="14" fill="#202020"/>
      <rect x="12" y="16" width="26" height="10" fill="#0a1a0a"/>
      <rect x="14" y="18" width="10" height="2" fill="#40d040"/>
      <rect x="14" y="21" width="6" height="2" fill="#40a040"/>
      <rect x="22" y="21" width="8" height="2" fill="#208020"/>
      <rect x="14" y="32" width="22" height="2" fill="#e0c060"/>
      <rect x="12" y="34" width="26" height="4" fill="#80c060"/>
      <rect x="12" y="38" width="26" height="2" fill="#d04020"/>
      <rect x="12" y="40" width="26" height="2" fill="#f0e040"/>
      <rect x="12" y="42" width="26" height="4" fill="#e0c060"/>
      <rect x="34" y="6" width="12" height="12" fill="#102030"/>
      <rect x="36" y="8" width="8" height="8" fill="#1a3050"/>
      <rect x="39" y="8" width="2" height="4" fill="#80d0f0"/>
      <rect x="39" y="10" width="4" height="2" fill="#80d0f0"/>
    </svg>
  ),

  // ── STYLE ─────────────────────────────────────────────────────────────────

  ghost_mode: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="14" y="12" width="22" height="2" fill="#c0c0e0" opacity="0.6"/>
      <rect x="12" y="14" width="26" height="2" fill="#d0d0f0" opacity="0.7"/>
      <rect x="10" y="16" width="30" height="16" fill="#c0c0e0" opacity="0.65"/>
      <rect x="10" y="32" width="4" height="4" fill="#d0d0f0" opacity="0.5"/>
      <rect x="14" y="34" width="4" height="4" fill="#a0a0c0" opacity="0.4"/>
      <rect x="18" y="32" width="4" height="4" fill="#d0d0f0" opacity="0.5"/>
      <rect x="22" y="34" width="4" height="4" fill="#a0a0c0" opacity="0.4"/>
      <rect x="26" y="32" width="4" height="4" fill="#d0d0f0" opacity="0.5"/>
      <rect x="30" y="34" width="4" height="4" fill="#a0a0c0" opacity="0.4"/>
      <rect x="34" y="32" width="4" height="4" fill="#d0d0f0" opacity="0.5"/>
      <rect x="16" y="20" width="6" height="4" fill="#2020a0" opacity="0.8"/>
      <rect x="28" y="20" width="6" height="4" fill="#2020a0" opacity="0.8"/>
      <rect x="17" y="21" width="4" height="2" fill="#4040ff"/>
      <rect x="29" y="21" width="4" height="2" fill="#4040ff"/>
      <rect x="6" y="22" width="4" height="2" fill="#8080c0" opacity="0.4"/>
      <rect x="40" y="22" width="4" height="2" fill="#8080c0" opacity="0.4"/>
      <rect x="4" y="26" width="6" height="2" fill="#8080c0" opacity="0.3"/>
      <rect x="40" y="26" width="6" height="2" fill="#8080c0" opacity="0.3"/>
    </svg>
  ),

  greenfield: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="0" y="36" width="50" height="14" fill="#1a3010"/>
      <rect x="0" y="34" width="50" height="2" fill="#2a5020"/>
      <rect x="8" y="24" width="4" height="10" fill="#308040"/>
      <rect x="6" y="22" width="6" height="4" fill="#40c060"/>
      <rect x="10" y="20" width="4" height="4" fill="#50e070"/>
      <rect x="22" y="20" width="4" height="14" fill="#308040"/>
      <rect x="18" y="16" width="8" height="6" fill="#40c060"/>
      <rect x="20" y="12" width="6" height="6" fill="#50e070"/>
      <rect x="24" y="10" width="4" height="4" fill="#60ff80"/>
      <rect x="38" y="26" width="4" height="8" fill="#308040"/>
      <rect x="36" y="24" width="6" height="4" fill="#40c060"/>
      <rect x="38" y="20" width="4" height="6" fill="#50e070"/>
      <rect x="24" y="6" width="2" height="2" fill="#ffffc0"/>
      <rect x="22" y="8" width="2" height="2" fill="#ffffc0"/>
      <rect x="26" y="8" width="2" height="2" fill="#ffffc0"/>
      <rect x="20" y="10" width="2" height="2" fill="#c0c0a0"/>
      <rect x="28" y="10" width="2" height="2" fill="#c0c0a0"/>
      <rect x="4" y="38" width="4" height="2" fill="#204010" opacity="0.5"/>
      <rect x="20" y="40" width="6" height="2" fill="#204010" opacity="0.5"/>
      <rect x="38" y="38" width="6" height="2" fill="#204010" opacity="0.5"/>
    </svg>
  ),

  silent_majority: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="8" y="8" width="34" height="26" fill="#1a1a2a"/>
      <rect x="8" y="8" width="34" height="4" fill="#2a2a3a"/>
      <rect x="6" y="10" width="4" height="20" fill="#2a2a3a"/>
      <rect x="40" y="10" width="4" height="20" fill="#2a2a3a"/>
      <rect x="8" y="32" width="16" height="4" fill="#1a1a2a"/>
      <rect x="12" y="36" width="8" height="4" fill="#1a1a2a"/>
      <rect x="14" y="40" width="6" height="4" fill="#1a1a2a"/>
      <rect x="12" y="14" width="10" height="2" fill="#8080c0"/>
      <rect x="12" y="19" width="14" height="2" fill="#8080c0"/>
      <rect x="12" y="24" width="8" height="2" fill="#8080c0"/>
      <rect x="24" y="14" width="2" height="2" fill="#5050a0"/>
      <rect x="28" y="19" width="2" height="2" fill="#5050a0"/>
      <rect x="22" y="24" width="2" height="2" fill="#5050a0"/>
      <rect x="32" y="14" width="6" height="8" fill="#4040a0"/>
      <rect x="30" y="16" width="2" height="4" fill="#6060c0"/>
      <rect x="36" y="16" width="4" height="2" fill="#2a2a50"/>
      <rect x="36" y="20" width="4" height="2" fill="#2a2a50"/>
    </svg>
  ),

  the_cleaner: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="32" y="6" width="4" height="4" fill="#a06030"/>
      <rect x="30" y="10" width="4" height="4" fill="#a06030"/>
      <rect x="28" y="14" width="4" height="4" fill="#906020"/>
      <rect x="26" y="18" width="4" height="4" fill="#906020"/>
      <rect x="24" y="22" width="4" height="4" fill="#806010"/>
      <rect x="22" y="26" width="4" height="4" fill="#806010"/>
      <rect x="16" y="30" width="12" height="4" fill="#c0c0c0"/>
      <rect x="14" y="34" width="16" height="4" fill="#d0d0d0"/>
      <rect x="14" y="38" width="4" height="4" fill="#e0e0e0"/>
      <rect x="18" y="38" width="4" height="4" fill="#b0b0b0"/>
      <rect x="22" y="38" width="4" height="4" fill="#e0e0e0"/>
      <rect x="26" y="36" width="4" height="4" fill="#b0b0b0"/>
      <rect x="6" y="12" width="16" height="2" fill="#c04040" opacity="0.7"/>
      <rect x="6" y="18" width="14" height="2" fill="#c04040" opacity="0.5"/>
      <rect x="6" y="24" width="10" height="2" fill="#c04040" opacity="0.3"/>
      <rect x="36" y="36" width="2" height="2" fill="#ffffff"/>
      <rect x="40" y="30" width="2" height="2" fill="#e0e0ff"/>
      <rect x="42" y="38" width="2" height="2" fill="#ffffff"/>
    </svg>
  ),

  // ── MASTERY ───────────────────────────────────────────────────────────────

  level_up_unlocked: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="22" y="8" width="6" height="26" fill="#60a0f0"/>
      <rect x="16" y="18" width="6" height="4" fill="#60a0f0"/>
      <rect x="28" y="18" width="6" height="4" fill="#60a0f0"/>
      <rect x="14" y="20" width="4" height="4" fill="#60a0f0"/>
      <rect x="32" y="20" width="4" height="4" fill="#60a0f0"/>
      <rect x="22" y="8" width="6" height="4" fill="#a0d0ff"/>
      <rect x="8" y="36" width="14" height="6" fill="#204010"/>
      <rect x="28" y="36" width="14" height="6" fill="#204080"/>
      <rect x="10" y="37" width="10" height="2" fill="#40c060"/>
      <rect x="30" y="37" width="10" height="2" fill="#4060d0"/>
      <rect x="10" y="40" width="8" height="1" fill="#208040"/>
      <rect x="30" y="40" width="8" height="1" fill="#2040a0"/>
      <rect x="22" y="38" width="6" height="2" fill="#c0c040"/>
      <rect x="24" y="36" width="2" height="2" fill="#c0c040"/>
      <rect x="24" y="40" width="2" height="2" fill="#c0c040"/>
      <rect x="10" y="8" width="2" height="8" fill="#f0d040" opacity="0.6"/>
      <rect x="7" y="11" width="8" height="2" fill="#f0d040" opacity="0.6"/>
      <rect x="38" y="10" width="2" height="6" fill="#f0d040" opacity="0.5"/>
      <rect x="36" y="12" width="6" height="2" fill="#f0d040" opacity="0.5"/>
    </svg>
  ),

  principal_engineer: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="20" y="6" width="10" height="2" fill="#c0d0ff"/>
      <rect x="16" y="8" width="18" height="4" fill="#d0e0ff"/>
      <rect x="12" y="12" width="26" height="10" fill="#e0f0ff"/>
      <rect x="14" y="22" width="22" height="2" fill="#c0d0ff"/>
      <rect x="16" y="24" width="18" height="4" fill="#a0b0e0"/>
      <rect x="18" y="28" width="14" height="4" fill="#8090c0"/>
      <rect x="20" y="32" width="10" height="4" fill="#6070a0"/>
      <rect x="22" y="36" width="6" height="4" fill="#4050a0"/>
      <rect x="24" y="40" width="2" height="4" fill="#304080"/>
      <rect x="18" y="12" width="2" height="8" fill="#ffffff" opacity="0.4"/>
      <rect x="30" y="14" width="6" height="2" fill="#ffffff" opacity="0.3"/>
      <rect x="14" y="14" width="4" height="2" fill="#8090c0" opacity="0.6"/>
      <rect x="8" y="42" width="6" height="6" fill="#c0a020"/>
      <rect x="22" y="44" width="6" height="4" fill="#c0a020"/>
      <rect x="36" y="42" width="6" height="6" fill="#c0a020"/>
      <rect x="9" y="43" width="4" height="4" fill="#f0d040"/>
      <rect x="23" y="45" width="4" height="2" fill="#f0d040"/>
      <rect x="37" y="43" width="4" height="4" fill="#f0d040"/>
    </svg>
  ),

  ten_thousand_lines: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="6" y="34" width="6" height="8" fill="#4080c0"/>
      <rect x="14" y="28" width="6" height="14" fill="#4090d0"/>
      <rect x="22" y="22" width="6" height="20" fill="#40a0e0"/>
      <rect x="30" y="14" width="6" height="28" fill="#40b0f0"/>
      <rect x="38" y="6" width="6" height="36" fill="#60d0ff"/>
      <rect x="6" y="34" width="6" height="2" fill="#60a0e0"/>
      <rect x="14" y="28" width="6" height="2" fill="#60b0f0"/>
      <rect x="22" y="22" width="6" height="2" fill="#60c0ff"/>
      <rect x="30" y="14" width="6" height="2" fill="#80d0ff"/>
      <rect x="38" y="6" width="6" height="2" fill="#a0e0ff"/>
      <rect x="4" y="42" width="42" height="2" fill="#304050"/>
      <rect x="38" y="4" width="6" height="2" fill="#ffffff" opacity="0.5"/>
      <rect x="40" y="2" width="2" height="2" fill="#ffffff" opacity="0.8"/>
      <rect x="10" y="8" width="6" height="2" fill="#40d040"/>
      <rect x="12" y="6" width="2" height="6" fill="#40d040"/>
    </svg>
  ),

  session_centurion: (
    <svg width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">

      <rect x="22" y="4" width="6" height="2" fill="#d04040"/>
      <rect x="20" y="6" width="10" height="2" fill="#e05050"/>
      <rect x="18" y="8" width="14" height="4" fill="#e06060"/>
      <rect x="20" y="12" width="10" height="2" fill="#d05050"/>
      <rect x="16" y="14" width="18" height="2" fill="#c09030"/>
      <rect x="14" y="16" width="22" height="8" fill="#d0a040"/>
      <rect x="12" y="18" width="26" height="4" fill="#e0b050"/>
      <rect x="14" y="22" width="22" height="2" fill="#c09030"/>
      <rect x="14" y="24" width="22" height="12" fill="#b08020"/>
      <rect x="16" y="26" width="8" height="6" fill="#806000"/>
      <rect x="26" y="26" width="8" height="6" fill="#806000"/>
      <rect x="14" y="36" width="22" height="2" fill="#907010"/>
      <rect x="10" y="26" width="4" height="10" fill="#c09030"/>
      <rect x="36" y="26" width="4" height="10" fill="#c09030"/>
      <rect x="14" y="38" width="22" height="4" fill="#b08020"/>
      <rect x="16" y="44" width="4" height="4" fill="#f04020"/>
      <rect x="22" y="44" width="4" height="4" fill="#f04020"/>
      <rect x="28" y="44" width="4" height="4" fill="#f04020"/>
      <rect x="34" y="44" width="4" height="4" fill="#f04020"/>
    </svg>
  ),
};
