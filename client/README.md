# CSESOC Projects - Notangles - Client

## Summary

The Notangles client allows users to interactively plan out their timetables with the latest course information using a simple drag-and-drop system. 

## Installation

The client has been verified to work with 

* NPM v6.12.1
* Node.js v12.13.1

Run `npm install` in the root client directory `notangles/client` to install all the NPM dependencies. 

## Deployment 

Use `npm start` to host the Notangles client locally. The client will be hosted on http://localhost:3000.

## Tech stack

The Notangles client uses 

* [React](https://reactjs.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [React DND](https://react-dnd.github.io/react-dnd/)
* [Styled Components](https://www.styled-components.com/) 

## Logic

* The drag and drop feature uses 3 layers. The first and bottommost layer displays the timetable skeleton. The second and middle layer displays all the drop zones for a class. The third and topmost layer displays the class objects that have been dropped into the timetable. 
* The client initially fetches details of all courses from the backend and displays them in the dropdown menu.
* When a user selects a course in the dropdown menu, the client fetches more information about the selected course from the backend, which it then uses to generate draggeable class objects for that course. 
* When a class object is being dragged, the second layer is used to show all the drop zones for it according to its class times. 