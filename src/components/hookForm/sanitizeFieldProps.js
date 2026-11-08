/** Props that must not be spread onto MUI root/DOM nodes in MUI v9 (use `slotProps` / `sx`). */
const BLOCKED_DOM_PROPS = [
  'inputProps',
  'InputProps',
  'PaperProps',
  'InputLabelProps',
  'FormHelperTextProps',
  'SelectProps',
  'alignItems',
  'justifyContent',
  'flexWrap',
];

export function sanitizeFieldProps(props = {}) {
  const next = { ...props };

  const picked = {};
  BLOCKED_DOM_PROPS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(next, key)) {
      picked[key] = next[key];
      delete next[key];
    }
  });

  const { sx, slotProps, ...rest } = next;

  const layoutSx = {
    ...(picked.alignItems != null && { alignItems: picked.alignItems }),
    ...(picked.justifyContent != null && { justifyContent: picked.justifyContent }),
    ...(picked.flexWrap != null && { flexWrap: picked.flexWrap }),
  };

  const hasLayout = Object.keys(layoutSx).length > 0;
  const mergedSx = hasLayout ? [layoutSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])] : sx;

  return {
    ...rest,
    sx: mergedSx,
    slotProps,
    inputProps: picked.inputProps,
    InputProps: picked.InputProps,
    PaperProps: picked.PaperProps,
    InputLabelProps: picked.InputLabelProps,
    FormHelperTextProps: picked.FormHelperTextProps,
    SelectProps: picked.SelectProps,
  };
}

export function omitBlockedDomProps(props = {}) {
  const next = { ...props };
  BLOCKED_DOM_PROPS.forEach((key) => {
    delete next[key];
  });
  return next;
}

/** Safe spread onto non-TextField roots (e.g. FormControlLabel, Box) after `sanitizeFieldProps`. */
export function spreadSanitizedRootProps(sanitized = {}) {
  const { sx: _sx, slotProps: _slotProps, ...rest } = omitBlockedDomProps(sanitized);
  return rest;
}

/** Merge legacy TextField props into MUI v9 `slotProps`. */
export function buildTextFieldSlotProps(slotProps = {}, legacy = {}) {
  const {
    inputProps,
    InputProps,
    InputLabelProps,
    FormHelperTextProps,
    SelectProps,
    PaperProps,
  } = legacy;

  const selectSlot = {
    ...SelectProps,
    ...slotProps?.select,
  };

  if (PaperProps) {
    selectSlot.MenuProps = {
      ...SelectProps?.MenuProps,
      ...slotProps?.select?.MenuProps,
      slotProps: {
        ...SelectProps?.MenuProps?.slotProps,
        ...slotProps?.select?.MenuProps?.slotProps,
        paper: {
          ...PaperProps,
          ...SelectProps?.MenuProps?.slotProps?.paper,
          ...slotProps?.select?.MenuProps?.slotProps?.paper,
        },
      },
    };
  }

  return {
    ...slotProps,
    input: { ...InputProps, ...slotProps?.input },
    htmlInput: { ...inputProps, ...slotProps?.htmlInput },
    inputLabel: { ...InputLabelProps, ...slotProps?.inputLabel },
    formHelperText: { ...FormHelperTextProps, ...slotProps?.formHelperText },
    select: selectSlot,
  };
}

/** Split props safe for `<TextField />` root vs `slotProps`. */
export function splitTextFieldProps(props = {}) {
  const {
    inputProps,
    InputProps,
    PaperProps,
    InputLabelProps,
    FormHelperTextProps,
    SelectProps,
    sx,
    slotProps,
    ...textFieldProps
  } = sanitizeFieldProps(props);

  return {
    textFieldProps: omitBlockedDomProps(textFieldProps),
    sx,
    slotProps: buildTextFieldSlotProps(slotProps, {
      inputProps,
      InputProps,
      PaperProps,
      InputLabelProps,
      FormHelperTextProps,
      SelectProps,
    }),
  };
}
