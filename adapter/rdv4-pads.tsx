/**
 * RDV4 antenna landing pads — the side the RDV4 antenna solders/bolts onto.
 *
 * The RDV4 antenna presents six outer pads (per band: GND / RAW / PWR). This
 * component is one band's worth of exposed copper pads that the antenna sits on.
 * Hand-solder friendly (large-ish exposed pads). M1.6 mounting holes live on the
 * board (adapter.tsx), not here.
 *
 * ⚠️ Geometry is a STUB. Pad pitch is taken loosely from the RDV4 physical
 * drawing (images/rdv4-antenna-physical.webp) but must be confirmed.
 */

// TODO: confirm from the RDV4 antenna mechanical drawing.
const PAD_W = 2.0; // mm exposed pad width                                TODO
const PAD_H = 2.5; // mm exposed pad height                               TODO
const PAD_PITCH = 4.5; // mm centre-to-centre between pads within a band  TODO

/**
 * One band of RDV4 landing pads (GND / RAW / PWR, left-to-right).
 *
 * @param {object} props
 * @param {string} props.name  - refdes (e.g. "RDV4_LF")
 * @param {number} [props.pcbX]
 * @param {number} [props.pcbY]
 * @param {number} [props.pcbRotation]
 */
export const Rdv4Pads = (props: {
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
		pinLabels={{
			"1": "GND",
			"2": "RAW",
			"3": "PWR",
		}}
		footprint={
			<footprint>
				<smtpad
					portHints={["1"]}
					pcbX={-PAD_PITCH}
					pcbY={0}
					width={PAD_W}
					height={PAD_H}
					shape="rect"
				/>
				<smtpad
					portHints={["2"]}
					pcbX={0}
					pcbY={0}
					width={PAD_W}
					height={PAD_H}
					shape="rect"
				/>
				<smtpad
					portHints={["3"]}
					pcbX={PAD_PITCH}
					pcbY={0}
					width={PAD_W}
					height={PAD_H}
					shape="rect"
				/>
			</footprint>
		}
	/>
);

export default Rdv4Pads;
