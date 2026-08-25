# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is
A **tscircuit** PCB (electronics-as-code, React/TSX) that adapts a **PM5
mainboard** (AMASS ICX301 connectors) to a passive **RDV4 antenna**. Design
rationale, pinouts, `hw tune` measurements, and the matching strategy live in
[README.md](./README.md) — read it for the *why*; this file is the *how*.

Two git submodules, both **reference-only** (never edited here):
- `proxmark3/` — upstream proxmark3 source; the authority for PM5/RDV4 hardware
  (`proxmark3/doc/md/Development/PM5_VERE_Hardware_RM.md`,
  `proxmark3/doc/md/PM5_Controllers/PM5_ANT_Controller_RM.md`,
  `proxmark3/doc/datasheets/AMASS_ICX301PT_SPEC.pdf`,
  `proxmark3/doc/img/pm5/icx301-and-10p-header.jpg`).
- `tscircuit-skill/` — authoritative tscircuit agent docs (SKILL.md, SYNTAX.md,
  FOOTPRINTS.md, `elements/*.md`). **Read these before writing TSX — don't guess
  props.** Note the installed `@tscircuit/core` (`0.0.x`) lags the skill (e.g.
  `<pcbkeepout>` isn't registered yet), so verify an element builds.

## Commands
- `yarn build` — compile the board (`tsci build adapter/adapter.tsx` → `dist/`).
- `yarn dev` — interactive browser preview (rarely needed for AI iteration).
- `yarn render` — build with `--pcb-png --schematic-png` and copy the two PNGs
  into `images/`. **Run before every commit** so `images/adapter-{pcb,schematic}.png`
  match the source (`dist/` is gitignored).
- Validation (run in this order; placement DRC must be **0 errors**):
  `./node_modules/.bin/tsci check netlist adapter/adapter.tsx` →
  `tsci check schematic-placement …` → `tsci check placement …`.
- No test suite — validation *is* the `tsci check` chain + a clean build.

## Environment gotchas
- **Runtime is `bun` via asdf** (`tsci` runs on Bun), pinned in `.tool-versions`.
  The container is ephemeral: after a fresh boot, `node_modules` persists but
  `yarn` may be gone — reinstall with `npm i -g yarn`.
- **Use `yarn`, never `npm`.** npm floods `ERESOLVE` warnings (tscircuit's early
  `0.0.x` sub-packages pin mismatched `circuit-json` ranges); yarn classic
  resolves them quietly. Do **not** `npm audit fix --force` — the reported vulns
  are all in the build-tooling tree (nothing is deployed) and the upgrades break
  tscircuit.
- `typescript` is pinned to **v5** — tscircuit's rollup plugin breaks on the TS 7
  native preview. `three` is a required peer of the 3D export.

## Architecture (adapter/)
Three files, composed into one `<board>`:
- `icx301.tsx` — custom `<footprint>` for the **PM5 side** AMASS ICX301PT-F
  connector (2 power blades + centred small RAW signal pin). No stock footprint
  fits (ICX301 is **not** an XT30, despite distributor labels), so it's built by
  hand from the datasheet (blade pitch 6.10 mm, span 9.70 mm, body 11.10 mm).
- `rdv4-pads.tsx` — the **RDV4-antenna side**: one vertical column of six round
  M1.6 **SMT-nut** lands (PEM SMTSO-M1.6-style), LF trio top / HF trio bottom,
  with the unused centre-connector region as a keep-out. Matches the antenna's
  own drawing (`images/rdv4-antenna-physical.webp`).
- `adapter.tsx` — the board + a `Band("LF"|"HF")` helper that instantiates one
  ICX301 and wires it **function-to-function** to the shared RDV4 interface, plus
  three DNP trim footprints per band.

tscircuit conventions that matter here: footprint child coords are **relative to
the component origin**, so place a component with the chip's `pcbX`/`pcbY` — do
**not** offset individual pads (that fights the layout engine and packs the part
to the origin). Give every component explicit `pcbX`/`pcbY` (and `schX`/`schY`
for a readable schematic) or DNP parts stack at 0,0.

## `/implement-js` skill — usage and deviation
Per the parent `~/CLAUDE.md`, JS/TS work uses the `/implement-js` skill.
**Deviation by necessity:** tscircuit requires JSX/TSX + ESM, so the skill's
Node-backend conventions (CommonJS, `forever`/herokuish/Procfile, services
layout, no-JSX) do **not** apply. Keep its general hygiene: tabs + double quotes,
`.gitignore` node_modules, `yarn`, constants-at-top, `// TODO` markers, docs kept
in sync.

## Key design invariants (do not regress)
- Wire **function-to-function** per band (`DRV`↔`PWR`, `RAW`↔`RAW`, `GND`↔`GND`),
  never straight-through — the boards mirror **and** band-swap (RDV4 HF-left /
  LF-right; PM5 LF-left / HF-right).
- The ICX301 connector is **hand-soldered** (not on LCSC / not JLC-assembled);
  pads are drawn extended for iron access.
- Matching is **drive-first** (PM5 BOOST voltage); the trim passives are DNP
  fallback lands only. `C_*_TRIM` should ultimately sit on the RAW-GND resonant
  node (see the README "Trim-C placement footgun").
- No controlled-impedance PCB — lumped regime at 125 kHz / 13.56 MHz.

## Status: SKELETON
Net topology + validation are solid; **mechanical geometry is partly stubbed.**
Real (datasheet-backed): ICX301 pad pitch/body. Still stubbed (search `TODO`):
exact ICX301 SMT land L×W, SMT-nut land Ø, RDV4 column spacings, and the real
board-level mating layout (PM5 wants the two connectors side-by-side at ~22.1 mm
pitch; the current placement is a stub stack).
