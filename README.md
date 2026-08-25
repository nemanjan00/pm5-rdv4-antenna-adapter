# PM5 RDV4 Antenna Adapter

## Antenna interface

Both the Proxmark3 RDV4 and the PM5 expose **two 3-pin antenna connectors** —
one for the HF antenna and one for the LF antenna — each with the same signals:

| Pin       | Description         |
| --------- | ------------------- |
| GND       | Ground              |
| RAW       | Raw antenna signal  |
| PWR (DRV) | Drive / power       |

On the RDV4 the pins are labelled `GND` / `LF_RAW` / `LF_PWR` (and the `HF_*`
equivalents); on the PM5 silkscreen the drive pin is labelled `DRV`.

### RDV4 antenna interface

![RDV4 antenna interface](images/rdv4-antenna-interface.webp)

### PM5 (ICX301) antenna interface

![PM5 ICX301 antenna interface](images/icx301-interface.webp)

The PM5 uses ICX301 connectors:

| Part number    | Gender |
| -------------- | ------ |
| ICX301PT-MGY   | Male   |
| ICX301PT-FGY   | Female |

## Reference measurements — Proxmark3 RDV4 default antenna

Output of `hw tune` on a Proxmark3 RDV4 with the stock/default antenna, used
as a baseline reference. Q factor must be measured **without a tag on the
antenna**.

### LF Antenna (RDV4)

| Measurement            | Value     |
| ---------------------- | --------- |
| 125.00 kHz             | 36.84 V   |
| 134.83 kHz             | 25.92 V   |
| 123.71 kHz (optimal)   | 36.88 V   |
| Frequency bandwidth    | 5.7       |
| Peak voltage           | 6.4       |
| LF antenna             | ok        |

### HF Antenna (RDV4)

| Measurement            | Value     |
| ---------------------- | --------- |
| 13.56 MHz              | 48.46 V   |
| Peak voltage           | 8.5       |
| HF antenna             | ok        |

### LF tuning graph (RDV4)

- Orange line — divisor 95 / 125.00 kHz
- Blue line — divisor 88 / 134.83 kHz

## Reference measurements — PM5 default antenna

Output of `hw tune` on a PM5 with the stock/default antenna. Q factor must be
measured **without a tag on the antenna**.

### LF Antenna (PM5)

| Measurement            | Value     |
| ---------------------- | --------- |
| 125.00 kHz             | 23.83 V   |
| 134.83 kHz             | 18.30 V   |
| 121.21 kHz (optimal)   | 24.15 V   |
| Frequency bandwidth    | 3.9       |
| Peak voltage           | 7.0       |
| LF antenna             | ok        |

### HF Antenna (PM5)

| Measurement            | Value     |
| ---------------------- | --------- |
| 13.56 MHz              | 41.78 V   |
| Peak voltage           | 12.1      |
| HF antenna             | ok        |

### LF tuning graph (PM5)

- Orange line — divisor 95 / 125.00 kHz
- Blue line — divisor 88 / 134.83 kHz
