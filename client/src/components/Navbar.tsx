import React, { FunctionComponent } from 'react';

import styled from 'styled-components';
import { StylesProvider } from '@material-ui/styles'; // make styled components styling have priority

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import Tooltip from '@material-ui/core/Tooltip';
import Link from '@material-ui/core/Link';
import Switch from '@material-ui/core/Switch';
import About from './About';
import DisplayOptions from './DisplayOptions';

import CSESocLogo from '../assets/notangles_one_n_with_grey.png';

const LogoImg = styled.img`
  height: 40px;
  margin-right: 20px;
`;
const NavbarBox = styled.div`
  flex-grow: 1;
  z-index: 10;
`;
const StyledNavBar = styled(AppBar)`
  position: fixed;
`;
const NavbarTitle = styled(Typography)`
  flex-grow: 1;
`;
const DarkModeButton = styled(ToggleButton)`
  border: none;
  border-radius:40px;
  margin-right: 20px;
  width:40px;
  height: 40px;
`;
const DarkModeIcon = styled(Brightness2Icon)`
  transform: rotate(180deg);
  color: #bde0ff;
`;
const NavButton = styled(Button)`
  margin-right: 20px;
`;

interface NavBarProps {
  setIsDarkMode(mode: boolean): void,
  isDarkMode: boolean,
  setIs12HourMode(mode: boolean): void,
  is12HourMode: boolean,
  setIsCompactMode(mode: boolean): void,
  isCompactMode: boolean,
}

const Navbar: FunctionComponent<NavBarProps> = React.memo(({
  setIsDarkMode,
  isDarkMode,
  is12HourMode,
  setIs12HourMode,
  isCompactMode,
  setIsCompactMode,
}) => (
  <StylesProvider injectFirst>
    <NavbarBox>
      <StyledNavBar>
        <Toolbar>

          <LogoImg src={CSESocLogo} />
          <NavbarTitle variant="h6">
            Notangles
          </NavbarTitle>
          <DisplayOptions
            setIsDarkMode={setIsDarkMode}
            isDarkMode={isDarkMode}
            is12HourMode={is12HourMode}
            setIs12HourMode={setIs12HourMode}
            isCompactMode={isCompactMode}
            setIsCompactMode={setIsCompactMode}
          />
          <Switch
            checked={isDarkMode}
            onChange={() => {
              setIsDarkMode(!isDarkMode);
            }}
          />

          <DarkModeButton
            value={isDarkMode}
            selected={isDarkMode}
            onChange={() => {
              setIsDarkMode(!isDarkMode);
            }}
          >
            <DarkModeIcon fontSize="small" />
          </DarkModeButton>

          <NavButton color="inherit">
            <Link
              href="https://forms.gle/rV3QCwjsEbLNyESE6"
              target="_blank"
              underline="none"
              color="inherit"
            >
              Feedback
            </Link>
          </NavButton>

          <Tooltip title="Coming Soon" placement="bottom">
            <div>
              <NavButton color="inherit" disabled>Login</NavButton>
              <NavButton color="inherit" disabled>Sign Up</NavButton>
            </div>
          </Tooltip>

          <About />
        </Toolbar>
      </StyledNavBar>
    </NavbarBox>
  </StylesProvider>
));

export default Navbar;
