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
// TODO: confirm from ICX301PT-FGY datasheet — every number here is a guess.
const POWER_PAD_W = 3.0; // mm, power blade land width                    TODO
const POWER_PAD_H = 5.0; // mm, extended for hand-soldering               TODO
const SIGNAL_PAD_W = 1.2; // mm, signal pin land width                    TODO
const SIGNAL_PAD_H = 2.5; // mm, extended for hand-soldering              TODO
const POWER_PITCH = 5.0; // mm, centre-to-centre between the two blades   TODO
const SIGNAL_OFFSET_Y = 3.5; // mm, signal pin offset from blade row      TODO
const COURTYARD_W = 12.5; // mm, body outline width                       TODO
const COURTYARD_H = 6.0; // mm, body outline height                       TODO

// Pin numbering on the physical part.
// TODO: confirm which physical blade is PWR vs GND from the drawing.
const PIN_PWR = "1"; // power blade -> DRV/PWR
const PIN_GND = "2"; // power blade -> GND
const PIN_RAW = "3"; // small signal pin -> RAW

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
}) => (
	<chip
		name={props.name}
		pcbX={props.pcbX}
		pcbY={props.pcbY}
		pcbRotation={props.pcbRotation}
		manufacturerPartNumber="ICX301PT-FGY"
		pinLabels={{
			[PIN_PWR]: "PWR",
			[PIN_GND]: "GND",
			[PIN_RAW]: "RAW",
		}}
		footprint={
			<footprint>
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
				{/* Small signal pin (RAW) */}
				<smtpad
					portHints={[PIN_RAW]}
					pcbX={0}
					pcbY={SIGNAL_OFFSET_Y}
					width={SIGNAL_PAD_W}
					height={SIGNAL_PAD_H}
					shape="rect"
				/>
				{/* Body courtyard / silkscreen outline */}
				<silkscreenrect
					pcbX={0}
					pcbY={0}
					width={COURTYARD_W}
					height={COURTYARD_H}
				/>
			</footprint>
		}
	/>
);

export default Icx301;
