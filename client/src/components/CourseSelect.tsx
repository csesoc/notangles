// excerpts from [https://codesandbox.io/s/material-demo-33l5y]

import React, { useState, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Autocomplete } from '@material-ui/lab';
import {
  TextField,
  InputAdornment,
  Box,
  Chip,
  Theme,
} from '@material-ui/core';
import {
  CloseRounded,
  SearchRounded,
  AddRounded,
  CheckRounded,
} from '@material-ui/icons';
import styled, { css } from 'styled-components';
import { CourseData } from '@notangles/common';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { CoursesList, CourseOverview } from '../interfaces/CourseOverview';
import { year, term } from '../constants/timetable';
import getCoursesList from '../api/getCoursesList';
import NetworkError from '../interfaces/NetworkError';

const SEARCH_DELAY = 300;

interface SearchOptions {
  threshold: number
  keys: {
    name: string
    weight: number
  }[]
}

const searchOptions: SearchOptions = {
  threshold: 0.4,
  keys: [
    {
      name: 'code',
      weight: 0.9,
    },
    {
      name: 'name',
      weight: 0.1,
    },
  ],
};

let fuzzy = new Fuse<CourseOverview, any>([], searchOptions);

const StyledSelect = styled(Box)`
  width: 100%;
  text-align: left;
  position: relative;
  left: -1px;
`;

const StyledTextField = styled(TextField) <{
  theme: Theme
}>`
  .MuiOutlinedInput-root {
    fieldset {
      border-color: ${({ theme }) => theme.palette.secondary.main};
      transition: border-color 0.1s;
    }
    &:hover fieldset {
      border-color: ${({ theme }) => theme.palette.secondary.dark};
    }
    &.Mui-focused fieldset {
      border-color: ${({ theme }) => theme.palette.secondary.dark};
    }
  }

  label {
    color: ${({ theme }) => theme.palette.secondary.dark} !important;
    transition: 0.2s;
  }
`;

const StyledInputAdornment = styled(InputAdornment)`
  margin-left: 7px;
  color: ${({ theme }) => theme.palette.secondary.dark};
`;

const StyledChip = styled(Chip).withConfig({
  shouldForwardProp: (prop) => !['backgroundColor'].includes(prop),
}) <{
  backgroundColor: string
}>`
  transition: none !important;
  background-color: ${({ backgroundColor, theme }) => (
    backgroundColor || theme.palette.secondary.main
  )} !important;
`;

const StyledOption = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
`;

const weakStyle = css`
  opacity: 0.6
`;

const StyledIcon = styled.span`
  position: relative;
  top: 3px;
  margin-right: 12px;
  ${weakStyle}
`;

const Weak = styled.span`
  margin-left: 7px;
  ${weakStyle}
`;

const StyledUl = styled.ul`
  padding: 0;
  margin: 0;
`;

interface CourseSelectProps {
  selectedCourses: CourseData[]
  assignedColors: Record<string, string>
  handleSelect(data: string | string[]): void
  handleRemove(courseCode: string): void
  setErrorMsg(errorMsg: string): void
  setErrorVisibility(visibility: boolean): void
}

const CourseSelect: React.FC<CourseSelectProps> = React.memo(({
  selectedCourses,
  assignedColors,
  handleSelect,
  handleRemove,
  setErrorMsg,
  setErrorVisibility,
}) => {
  const [coursesList, setCoursesList] = useState<CoursesList>([]);
  const [options, setOptionsState] = useState<CoursesList>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<CoursesList>([]);
  const searchTimer = useRef<number | undefined>();
  const listRef = useRef<VariableSizeList | null>(null);

  const setOptions = (newOptions: CoursesList) => {
    listRef?.current?.scrollTo(0);
    setOptionsState(newOptions);
  };

  const diffCourses = (a: {code: string}[], b: {code: string}[]) => {
    const codes = a.map((x) => x.code);
    return b.filter((x) => !codes.includes(x.code));
  };

  const checkExternallyAdded = () => {
    const addedCodes = diffCourses(selectedValue, selectedCourses).map((x) => x.code);
    const coursesListCodes = coursesList.map((x) => x.code);

    // if we have info about the new courses already fetched, update the value now
    // (otherwise, `checkExternallyAdded` will be called later once the data is fetched)
    if (addedCodes.length > 0 && addedCodes.every((code) => coursesListCodes.includes(code))) {
      setSelectedValue([...selectedValue, ...coursesList.filter(
        (course) => addedCodes.includes(course.code),
      )]);
    }
  };

  checkExternallyAdded();

  let defaultOptions = coursesList;
  // show relevant default options based of selected courses (TODO: improve)
  const getCourseArea = (courseCode: string) => courseCode.substring(0, 4);
  const courseAreas = selectedValue.map((course) => getCourseArea(course.code));
  if (selectedValue.length) {
    defaultOptions = defaultOptions.filter((course) => (
      courseAreas.includes(getCourseArea(course.code))
      && !selectedValue.includes(course)
    ));
  }

  const search = (query: string) => {
    query = query.trim();

    if (query.length === 0) {
      setOptions(defaultOptions);
      return defaultOptions;
    }

    const newOptions = fuzzy.search(
      query,
    ).map(
      (result) => result.item,
    );

    setOptions(newOptions);
    return newOptions;
  };

  const onChange = (_: any, value: any) => {
    const before = selectedCourses;
    const after = value;

    // find what was added/removed in the update
    const added = diffCourses(before, after);

    // return before the input value and options are reset
    if (added.length === 0) return;

    if (searchTimer.current) {
      // run a search now and cancel the current search timer
      const newOptions = search(inputValue);
      clearInterval(searchTimer.current);
      searchTimer.current = undefined;

      // revert back to the original value by removing what was added
      const originalValue = value.filter((course: CourseOverview) => (
        !added.includes(course)
      ));

      // we need to add something, and our best guess is the top
      // result of the new search
      const newSelectedOption = newOptions[0];

      if (newSelectedOption && !selectedValue.includes(newSelectedOption)) {
        // otherwise, add the new option and call the handler
        setSelectedValue([...originalValue, newSelectedOption]);
        handleSelect(newSelectedOption.code);
      } else {
        // just revert it back without adding anything
        setSelectedValue(originalValue);
        // return before the input value and options are reset
        return;
      }
    } else {
      handleSelect(added.map((course) => course.code));
      setSelectedValue([...selectedValue, ...(added as CourseOverview[])]);
    }

    setOptions(defaultOptions);
    setInputValue('');
  };

  const fetchCoursesList = async () => {
    try {
      const fetchedCoursesList = await getCoursesList(year, term);
      setCoursesList(fetchedCoursesList);
      checkExternallyAdded();
      fuzzy = new Fuse(fetchedCoursesList, searchOptions);
    } catch (e) {
      if (e instanceof NetworkError) {
        setErrorMsg(e.message);
        setErrorVisibility(true);
      }
    }
  };

  useEffect(() => {
    fetchCoursesList();
  }, []);

  useEffect(() => {
    setOptions(defaultOptions);
  }, [coursesList]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      search(inputValue);
      searchTimer.current = undefined;
    }, SEARCH_DELAY);
  }, [inputValue, coursesList]);

  const shrinkLabel = inputValue.length > 0 || selectedValue.length > 0;

  const OuterElementContext = React.createContext({});

  // React.DetailedHTMLProps<
  const OuterElementType = React.forwardRef<
  HTMLDivElement, React.HTMLProps<HTMLDivElement>
  >((props, ref) => {
    const outerProps = React.useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
  });

  const ListboxComponent = React.useCallback(
    React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
      const { children, ...other } = props;

      const itemCount = Array.isArray(children) ? children.length : 0;
      const getItemSize = () => 45;
      const maxResultsVisible = 6;
      const paddingTop = 7;
      const height = Math.min(itemCount, maxResultsVisible) * getItemSize();

      const Row: React.FC<ListChildComponentProps> = ({ data, index, style }) => (
        React.cloneElement(data[index], {
          style: {
            ...style,
            top: typeof style.top === 'number' ? style.top + paddingTop : 0,
          },
        })
      );

      return (
        <div ref={ref} style={{ overflow: 'hidden' }}>
          <OuterElementContext.Provider value={other}>
            <VariableSizeList
              ref={listRef}
              style={{ overflowX: 'hidden' }}
              width="100%"
              height={height}
              itemData={children}
              itemCount={itemCount}
              itemSize={getItemSize}
              outerElementType={OuterElementType}
              innerElementType={StyledUl}
              overscanCount={5}
            >
              {Row}
            </VariableSizeList>
          </OuterElementContext.Provider>
        </div>
      );
    }), [],
  );

  return (
    <StyledSelect>
      <Autocomplete
        multiple
        // autoHighlight
        disableClearable
        disableListWrap
        noOptionsText="No Results"
        selectOnFocus={false}
        options={options}
        value={selectedValue}
        onChange={onChange}
        inputValue={inputValue}
        // prevent built-in option filtering
        filterOptions={(o) => o}
        ListboxComponent={ListboxComponent}
        renderOption={(option) => (
          <StyledOption>
            <StyledIcon>
              {
                selectedValue.find((course: CourseOverview) => (
                  course.code === option.code
                )) ? <CheckRounded /> : <AddRounded />
              }
            </StyledIcon>
            <span>{option.code}</span>
            <Weak>{option.name}</Weak>
          </StyledOption>
        )}
        renderInput={(params) => (
          <StyledTextField
            {...params}
            autoFocus
            variant="outlined"
            label="Select your courses"
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event: any) => {
              if (event.key === 'Backspace') {
                event.stopPropagation();
              }
            }}
            InputLabelProps={{
              ...params.InputLabelProps,
              shrink: shrinkLabel,
              style: {
                marginLeft: shrinkLabel ? 2 : 38,
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <StyledInputAdornment position="start">
                    <SearchRounded />
                  </StyledInputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
        renderTags={(value: CoursesList, getTagProps) => (
          value.map((option: CourseOverview, index: number) => (
            <StyledChip
              label={option.code}
              color="primary"
              backgroundColor={assignedColors[option.code]}
              deleteIcon={<CloseRounded />}
              {...getTagProps({ index })}
              onDelete={() => {
                setSelectedValue(selectedValue.filter((course) => course.code !== option.code));
                handleRemove(option.code);
              }}
            />
          ))
        )}
      />
    </StyledSelect>
  );
}, (prev, next) => !(
  prev.selectedCourses.length !== next.selectedCourses.length
  || prev.selectedCourses.some((course, i) => course.code !== next.selectedCourses[i].code)
  || JSON.stringify(prev.assignedColors) !== JSON.stringify(next.assignedColors)
));

export default CourseSelect;
