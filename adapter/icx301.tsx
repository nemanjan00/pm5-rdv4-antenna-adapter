/**
 * AMASS ICX301PT-FGY connector — custom tscircuit component.
 *
 * IMPORTANT: ICX301 is NOT an XT30, despite what distributors claim. It is the
 * IC3-style body and has its own geometry, so no stock footprint (KiCad, EasyEDA,
 * LCSC) fits. This footprint is built by hand.
 *
 * Package: PCB SMT, female socket, 3 contacts = 2 power blades + 1 small signal
 * pin. The small signal pin is mapped to RAW; the two power blades are PWR(DRV)
 * and GND.
 *
 * The part is hand-soldered (not on LCSC / not JLC-assembled), so pads are drawn
 * slightly EXTENDED past the connector body for iron access.
 *
 * ⚠️ ALL geometry below is a STUB. Confirm every value against the real
 * ICX301PT-FGY mechanical drawing before fabricating.
 */

// ── Mechanical constants ──────────────────────────────────────────────────
// From AMASS_ICX301PT_SPEC.pdf (ICX301PT-F, page 2), cross-checked against the
// PM5 drawing (proxmark3/doc/img/pm5/icx301-and-10p-header.jpg): three in-line
// contacts — two power blades with the small RAW signal pin centred between them.
const POWER_PITCH = 6.1; // mm, blade-to-blade (±3.05 from centre)     [datasheet]
const PAD_SPAN = 9.7; // mm, outer edge-to-edge across the power pads  [datasheet]
const BODY_W = 11.1; // mm, connector body width                       [datasheet]
const BODY_D = 4.9; // mm, connector body depth (female)               [datasheet]
// Land sizes: span-minus-pitch gives the power land width; exact SMT land L×W and
// the signal land are not dimensioned in the V1.0 spec — estimated, hand-solder
// friendly (extended in Y).  TODO: confirm SMT land sizes.
const POWER_PAD_W = PAD_SPAN - POWER_PITCH; // = 3.6 mm power land width
const POWER_PAD_H = 4.0; // mm, land length (extended for iron access)    TODO
const SIGNAL_PAD_W = 1.0; // mm, centre RAW signal land                   TODO
const SIGNAL_PAD_H = 2.0; // mm                                           TODO
const COURTYARD_W = BODY_W; // body outline
const COURTYARD_H = BODY_D + 1.0; // depth + small margin

// Pin numbering. The two blades are physically identical; which one is GND vs
// DRV depends on band (LF: GND|RAW|DRV, HF: DRV|RAW|GND — mirror). We expose
// generic PWR/RAW/GND ports and wire function-to-function; the HF connector is
// placed mirrored in adapter.tsx.  TODO: set pcbRotation so pads match the PM5.
const PIN_PWR = "1"; // power blade -> DRV/PWR
const PIN_GND = "2"; // power blade -> GND
const PIN_RAW = "3"; // small centre signal pin -> RAW

/**
 * ICX301PT-FGY connector.
 *
 * @param {object} props
 * @param {string} props.name        - component refdes (e.g. "J_LF")
 * @param {number} [props.pcbX]      - board X placement (mm)
 * @param {number} [props.pcbY]      - board Y placement (mm)
 * @param {number} [props.pcbRotation] - rotation (deg)
 */
export const Icx301 = (props: {
	name: string;
	pcbX?: number;
	pcbY?: number;
	pcbRotation?: number;
	schX?: number;
	schY?: number;
}) => (
	<chip
		name={props.name}
		pcbX={props.pcbX}
		pcbY={props.pcbY}
		pcbRotation={props.pcbRotation}
		schX={props.schX}
		schY={props.schY}
		manufacturerPartNumber="ICX301PT-FGY"
		pinLabels={{
			[PIN_PWR]: "PWR",
			[PIN_GND]: "GND",
			[PIN_RAW]: "RAW",
		}}
		footprint={
			// Right-angle SMT connector: the plug mates from the front (+Y) face,
			// so the part must sit on a board edge with +Y pointing off-board.
			<footprint insertionDirection="from_top">
				{/* Left power blade */}
				<smtpad
					portHints={[PIN_PWR]}
					pcbX={-POWER_PITCH / 2}
					pcbY={0}
					width={POWER_PAD_W}
					height={POWER_PAD_H}
					shape="rect"
				/>
				{/* Right power blade */}
				<smtpad
					portHints={[PIN_GND]}
					pcbX={POWER_PITCH / 2}
					pcbY={0}
					width={POWER_PAD_W}
					height={POWER_PAD_H}
					shape="rect"
				/>
				{/* Small signal pin (RAW) — centred between the two blades */}
				<smtpad
					portHints={[PIN_RAW]}
					pcbX={0}
					pcbY={0}
					width={SIGNAL_PAD_W}
					height={SIGNAL_PAD_H}
					shape="rect"
				/>
				{/* Body courtyard (IPC) */}
				<courtyardrect
					pcbX={0}
					pcbY={0}
					width={COURTYARD_W}
					height={COURTYARD_H}
					strokeWidth={0.1}
				/>
			</footprint>
		}
	/>
);

export default Icx301;
