import React from 'react';
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

const StyledOptionLabel = styled(Box)`
 margin-right:40px;
`;


interface DropdownOptionProps {
  optionName: string
  optionState: string | null
  setOptionState(value: string | null): void
  optionChoices: string[]

}

interface DisplayOptionsProps {
  setIsDarkMode(mode: boolean): void,
  isDarkMode: boolean,
  setIs12HourMode(mode: boolean): void,
  is12HourMode: boolean,
  setIsCompactMode(mode: boolean): void,
  isCompactMode: boolean,
}
const DisplayOptions: React.FC<DisplayOptionsProps> = ({
  setIsDarkMode,
  isDarkMode,
  is12HourMode,
  setIs12HourMode,
  isCompactMode,
  setIsCompactMode,
}) => {
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
            <StyledOptionLabel flexGrow={1}> Dark mode </StyledOptionLabel>
            <Switch
              checked={isDarkMode}
              onChange={() => {
                setIsDarkMode(!isDarkMode);
              }}
              color="primary"
            />
          </ListItem>


          <ListItem key="dark mode">
            <StyledOptionLabel flexGrow={1}> 24-hour time </StyledOptionLabel>
            <Switch
              checked={!is12HourMode}
              onChange={() => {
                setIs12HourMode(!is12HourMode);
              }}
              color="primary"
            />
          </ListItem>


          <ListItem key="dark mode">
            <StyledOptionLabel flexGrow={1}> Compact mode </StyledOptionLabel>
            <Switch
              checked={isCompactMode}
              onChange={() => {
                setIsCompactMode(!isCompactMode);
              }}
              color="primary"
            />
          </ListItem>

        </List>
      </Popover>
    </div>
  );
};
export default DisplayOptions;
