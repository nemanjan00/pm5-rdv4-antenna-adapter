/**
 * PM5 ↔ RDV4 antenna adapter board.
 *
 *   PM5 mainboard (ICX301 male)
 *        │  plugs into
 *   ┌──────────────────────┐
 *   │  ICX301-F  x2 (LF/HF) │  ← PM5 side (this board's connectors)
 *   │        …RF path…      │  ← function-to-function, optional trim pads (DNP)
 *   │  RDV4 pads x2 + M1.6  │  ← RDV4 antenna solders/bolts on
 *   └──────────────────────┘
 *
 * Wiring is FUNCTION-TO-FUNCTION per band (never straight-through by position,
 * because the two boards mirror + band-swap — see README):
 *   PM5 DRV(PWR) → RDV4 PWR
 *   PM5 RAW      → RDV4 RAW
 *   PM5 GND      → RDV4 GND
 *
 * Matching is drive-first (PM5 BOOST); the three passive footprints per band are
 * DO-NOT-PLACE fallbacks only.
 *
 * ⚠️ All placement coordinates and the board outline are STUBS pending the
 * ICX301PT-FGY datasheet and a real mechanical layout.
 */

import { Icx301 } from "./icx301";
import { Rdv4Pads } from "./rdv4-pads";

// ── Board / placement stubs ───────────────────────────────────────────────
// TODO: real layout once ICX301PT-FGY + RDV4 mechanicals are confirmed.
const BOARD_W = 40; // mm  TODO
const BOARD_H = 30; // mm  TODO
const BAND_DX = 12; // mm, LF/HF horizontal separation  TODO
const CONN_Y = -8; // mm, PM5-side connector row  TODO
const PADS_Y = 8; // mm, RDV4-side pad row  TODO
const HOLE_DIAMETER = "1.7mm"; // M1.6 clearance  TODO

/**
 * One band's worth of the adapter: PM5 connector, RDV4 pads, the three optional
 * trim footprints, and the function-to-function traces between them.
 *
 * @param {object} props
 * @param {string} props.band - "LF" or "HF" (used for refdes + placement)
 * @param {number} props.x    - band centre X on the board (mm)
 */
const Band = (props: { band: string; x: number }) => {
	const j = "J_" + props.band; // PM5-side ICX301
	const rd = "RDV4_" + props.band; // RDV4-side pads

	// TODO: verify tscircuit trace-selector syntax (".Ref > .Port").
	return (
		<>
			<Icx301 name={j} pcbX={props.x} pcbY={CONN_Y} />
			<Rdv4Pads name={rd} pcbX={props.x} pcbY={PADS_Y} />

			{/* Function-to-function RF path — primary, always connected.
			    This is the whole adapter electrically. */}
			<trace from={"." + j + " > .PWR"} to={"." + rd + " > .PWR"} />
			<trace from={"." + j + " > .RAW"} to={"." + rd + " > .RAW"} />
			<trace from={"." + j + " > .GND"} to={"." + rd + " > .GND"} />

			{/* Optional trim footprints — DO NOT PLACE, and left UNCONNECTED on
			    purpose. They are fallback lands only (drive-first via PM5 BOOST is
			    the primary matching path — see README). To actually use one, cut
			    the relevant direct trace above and bridge through the footprint:
			      R_*_DRV  → series-R in the DRV path (damping/Q)
			      C_*_RAW  → series-C in the RAW/sense path
			      C_*_TRIM → shunt-C for f0 re-tune
			    TODO: relocate C_*_TRIM to the RAW-GND (resonant) node — see the
			    README "Trim-C placement footgun" note.
			    TODO: confirm tscircuit `doNotPlace` prop name/behaviour. */}
			<resistor name={"R_" + props.band + "_DRV"} resistance="0" footprint="0805" doNotPlace />
			<capacitor name={"C_" + props.band + "_RAW"} capacitance="0" footprint="0805" doNotPlace />
			<capacitor name={"C_" + props.band + "_TRIM"} capacitance="0" footprint="0805" doNotPlace />
		</>
	);
};

export const Adapter = () => (
	<board width={BOARD_W} height={BOARD_H}>
		<Band band="LF" x={-BAND_DX} />
		<Band band="HF" x={BAND_DX} />

		{/* M1.6 mounting holes (RDV4 antenna bolts on). Placed clear of the pad
		    rows for now. TODO: real positions from the RDV4 mechanical. */}
		<hole diameter={HOLE_DIAMETER} pcbX={-BOARD_W / 2 + 2} pcbY={0} />
		<hole diameter={HOLE_DIAMETER} pcbX={BOARD_W / 2 - 2} pcbY={0} />
	</board>
);

export default Adapter;
