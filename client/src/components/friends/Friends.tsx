import React, { useEffect } from 'react';
import {
  makeStyles, createStyles,
} from '@material-ui/core/styles';
import styled from 'styled-components';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

import Drawer from '@material-ui/core/Drawer';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import ProfileSettings from './ProfileSettings';
import storage from '../../utils/storage';
import LoggedOutImg from '../../assets/sidebar_cat.svg';

export const drawerWidth = process.env.REACT_APP_SHOW_PREVIEW === 'true' ? 240 : 0;

const StyledDrawer = styled(Drawer)`
    width: drawerWidth;
    flex-shrink: 0;
`;

const StyledLink = styled(Link)`
    font-size: 10px;
    cursor: pointer;
    margin-left: 10px;
`;

const StyledListItems = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const StyledListItemText = styled(ListItemText)`
    overflow: hidden;
    text-overflow: ellipsis;
`;

const DrawerContainer = styled.div`
    margin-top: 64px; /* navbar height */
    overflow: auto;
`;

const LoginComponent = styled.div`
    text-align: center;
    padding: 20px;
    margin-top: 45%;
`;
const StyledActionButtonGroup = styled(ButtonGroup)`
    width: 100%;
`;
// ???
// https://stackoverflow.com/questions/49656531/styling-material-ui-drawer-component-with-styled-components
const useStyles = makeStyles(() => createStyles({
  drawerPaper: {
    width: drawerWidth,
  },
}));

interface FriendsListItemProps {
  name: string,
  imageSrc: string,
  courses?: Array<string>,
  id?: string
  isFavourite?: boolean
}

const FriendListSuggestion: React.FC<FriendsListItemProps> = ({
  name,
  imageSrc,
}) => (
  <ListItem>
    <ListItemAvatar>
      <Avatar alt={name} src={imageSrc} />
    </ListItemAvatar>
    <StyledListItems>
      <StyledListItemText
        primary={name}
      />
      <StyledActionButtonGroup size="small" aria-label="small outlined button group">
        <Button>REQUEST </Button>
        <Button>DELETE</Button>
      </StyledActionButtonGroup>
    </StyledListItems>
  </ListItem>
);

const FriendListRequest: React.FC<FriendsListItemProps> = ({
  name,
  imageSrc,
}) => (
  <ListItem alignItems="flex-start">
    <ListItemAvatar>
      <Avatar alt={name} src={imageSrc} />
    </ListItemAvatar>
    <StyledListItems>

      <StyledListItemText
        primary={name}
      />
      <StyledActionButtonGroup size="small" aria-label="small outlined button group">
        <Button>ACCEPT</Button>
        <Button>DECLINE</Button>
      </StyledActionButtonGroup>
    </StyledListItems>

  </ListItem>
);

const FriendListAdded: React.FC<FriendsListItemProps> = ({
  name,
  imageSrc,
  courses,
  isFavourite,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <ListItem button alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt={name} src={imageSrc} />
      </ListItemAvatar>
      <StyledListItemText
        primary={name}
        secondary={courses ? courses.join(' ') : `${name} has no courses selected`}
      />
      <ListItemSecondaryAction>
        <IconButton
          disableRipple
          size="small"
          aria-label="menu"
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>
            {isFavourite ? 'F' : 'Unf'}
            avourite
          </MenuItem>
          <MenuItem onClick={handleClose}>Unfriend</MenuItem>
          <MenuItem onClick={handleClose}>Block</MenuItem>
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

interface FriendsProps {
  isFriendsListOpen: boolean,
  isLoggedIn: boolean
  setIsLoggedIn(value: boolean): void
}

const FriendsDrawer: React.FC<FriendsProps> = ({
  isFriendsListOpen,
  isLoggedIn,
  setIsLoggedIn,
}) => {
  const classes = useStyles();
  const [suggestedFriends, setSuggestedFriends] = React.useState<Array<FriendsListItemProps>>([]);
  const [mePhoto, setMePhoto] = React.useState<string>('');

  const handleFailure = (err: any) => {
    storage.set('userID', '');
    storage.set('accessToken', '');
    storage.set('userPicture', '');
    console.log(err);
    setIsLoggedIn(false);
  };

  const doLogin = (
    userID: string,
    accessToken: string,
    pictureUrl: string,
  ) => {
    setIsLoggedIn(true);

    fetch(`https://graph.facebook.com/${userID}/friends?fields=data&access_token=${accessToken}`)
      .then((r) => r.json())
      .then(
        (r) => {
          r.data.forEach((friendId: any) => {
            fetch(`https://graph.facebook.com/${friendId.id}?fields=id,name,picture&access_token=${accessToken}`)
              .then((res) => res.json())
              .then((friend) => {
                setSuggestedFriends((old) => [...old, {
                  id: friend.id,
                  name: friend.name,
                  imageSrc: friend.picture.data.url,
                }]);
              });
          });
          setMePhoto(pictureUrl);
        },
      )
      .catch(
        (err) => {
          handleFailure(err);
        },
      );
  };

  useEffect(() => {
    const loggedInUserId = storage.get('userID');
    if (loggedInUserId) {
      try {
        doLogin(loggedInUserId, storage.get('accessToken'), storage.get('userPicture'));
      } catch (err) {
        handleFailure(err);
      }
    }
  }, []);

  const responseFacebook = async (response: any) => {
    try {
      doLogin(response.userID, response.accessToken, response.picture.data.url);
      storage.set('userID', response.userID);
      storage.set('accessToken', response.accessToken);
      storage.set('userPicture', response.picture.data.url);
    } catch (err) {
      handleFailure(err);
    }
  };

  const loginOnClick = () => {
    console.log('login');
  };

  const logout = () => {
    setSuggestedFriends([]);
    storage.set('userID', '');
    storage.set('accessToken', '');
    storage.set('userPicture', '');
    setIsLoggedIn(false);
  };

  const mockClassArray = ['COMP1511', 'COMP1531', 'MATH1081'];

  return (

    <StyledDrawer
      transitionDuration={200}
      variant="persistent"
      anchor="left"
      open={isFriendsListOpen}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <DrawerContainer>
        { isLoggedIn ? (
          <>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar alt="You" src={mePhoto} />
                </ListItemAvatar>
                <StyledListItems>
                  <ProfileSettings />
                  <Button size="small" onClick={logout}>Log out</Button>
                </StyledListItems>
              </ListItem>

              <ListSubheader disableSticky>
                Friend Requests
                {' '}
                <StyledLink> Sent Requests</StyledLink>
              </ListSubheader>
              <FriendListRequest name="Placeholder Name" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" />

              <ListSubheader disableSticky>Friends</ListSubheader>
              <FriendListAdded name="Placeholder 2" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" isFavourite />
              <FriendListAdded name="Placeholder 3" imageSrc="https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2013/08/facebook-silhouette_thumb.jpg?w=250" courses={mockClassArray} />

              <ListSubheader disableSticky>Suggested Friends</ListSubheader>
              {suggestedFriends.map((friend) => (
                <FriendListSuggestion
                  key={friend.id}
                  name={friend.name}
                  imageSrc={friend.imageSrc}
                />
              ))}
            </List>
          </>
        ) : (
          <LoginComponent>
            <img src={LoggedOutImg} alt="You are logged out!" width="132" />
            <h3> Log In to Notangles! </h3>
            <p>
              Add friends on Notangles to view each other&apos;s timetables,
              coordinate classes, and plan events
            </p>
            <FacebookLogin
              appId="2637085919726160"
              autoLoad={false}
              fields="name,email,picture"
              scope="user_friends"
              onClick={loginOnClick}
              callback={responseFacebook}
              render={(renderProps: { onClick: () => void }) => (
                <Button variant="contained" color="primary" onClick={renderProps.onClick}>Log In With Facebook</Button>
              )}
            />
          </LoginComponent>
        )}


      </DrawerContainer>
    </StyledDrawer>

  );
};

export default FriendsDrawer;
