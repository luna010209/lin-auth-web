import { Radio, FormLabel, RadioGroup, FormControl, FormControlLabel } from '@mui/material';

export default function SnsInput() {
  return (
    <FormControl sx={{ paddingX: 1 }}>
      <FormLabel id="demo-row-radio-buttons-group-label">SNS</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
      >
        <FormControlLabel value="What's App" control={<Radio />} label="What's App" />
        <FormControlLabel value="Line" control={<Radio />} label="Line" />
        <FormControlLabel value="We Chat" control={<Radio />} label="We Chat" />
      </RadioGroup>
    </FormControl>
  );
}
