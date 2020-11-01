import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Switch from '@material-ui/core/Switch';


const DropdownButton = styled(Button)`
    width: 100%;
    text-align: left;
    text-transform: none;
`;


interface DropdownOptionProps {
  optionName: string
  optionState: string | null
  setOptionState(value: string | null): void
  optionChoices: string[]

}

interface DisplayOptionsProps {
  setIsDarkMode(mode: boolean): void,
  isDarkMode: boolean
}
const DisplayOptions: FunctionComponent<DisplayOptionsProps> = React.memo((
  { setIsDarkMode, isDarkMode },
) => {
  // for opening popover
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const popoverId = open ? 'simple-popover' : undefined;
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // execute autotimetabling
    setAnchorEl(event.currentTarget);
  };

  const handleChange = () => {
    setIsDarkMode(!isDarkMode);
  };


  return (
    <div>
      <DropdownButton disableElevation aria-describedby={popoverId} color="inherit" onClick={handleClick}>
        <Box flexGrow={1}>OPTIONS</Box>
        {open ? (
          <ArrowDropUpIcon />
        ) : <ArrowDropDownIcon />}
      </DropdownButton>


      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List>

          <ListItem key="dark mode">
            <Box flexGrow={1}> Dark mode </Box>

            <Switch
              checked={isDarkMode}
              onChange={handleChange}
              color="primary"
            />

          </ListItem>

        </List>
      </Popover>
    </div>
  );
});
export default DisplayOptions;
