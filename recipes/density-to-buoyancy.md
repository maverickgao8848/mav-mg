# Density to buoyancy

Components: `structure-spacing-expand`, `conserved-set-compare`, `interface-support`

Use when a fixed amount of matter changes structure, which changes occupied volume or density and then changes its support behavior at an interface.

1. Run `structure-spacing-expand` to preserve object identity while changing spacing.
2. Hand the object set to `conserved-set-compare`; keep count and object scale identical on both sides.
3. Resolve the selected result into the subject anchor of `interface-support`.
4. Draw the interface before the support vector; settle the subject only after the direction is readable.

Trim explanatory holds before removing a causal stage. Quantitative labels require source values; otherwise use qualitative deltas.
