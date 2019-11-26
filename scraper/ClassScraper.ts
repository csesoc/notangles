import { reverseDayAndMonth, formatDates, removeHtmlSpecials } from './helper'
import {
  Term,
  Class,
  Status,
  classWarnings,
  Chunk,
  Time,
  Day,
} from './interfaces'

// TODO: Split parseClassChunk into parts, find a better name for it, perhaps create a link in ChunkScraper
// TODO: Perhaps extract the regexes out

/**
 * Finds the Term for a class. Term is defined in interfaces.ts
 * @param cls: Class to find the term for
 * @param reference: Refernce dates to find the term.
 * Format of each element: { term: Term, dates: { start: number[], length: number[] } }
 * start is an array of possible start dates and length is
 */
const classTermFinder = (
  cls: Class,
  reference = [
    {
      term: Term.Summer,
      dates: [{ start: 11, length: 3 }, { start: 12, length: 2 }],
    },
    {
      term: Term.T1,
      dates: [
        { start: 1, length: 2 },
        { start: 1, length: 3 },
        { start: 1, length: 4 },
        { start: 2, length: 1 },
        { start: 2, length: 3 },
        { start: 3, length: 1 },
      ],
    },
    {
      term: Term.T2,
      dates: [
        { start: 3, length: 2 },
        { start: 4, length: 2 },
        { start: 4, length: 3 },
        { start: 5, length: 1 },
        { start: 5, length: 3 },
        { start: 6, length: 1 },
        { start: 6, length: 3 },
        { start: 7, length: 1 },
        { start: 7, length: 2 },
        { start: 8, length: 1 },
      ],
    },
    {
      term: Term.T3,
      dates: [
        { start: 8, length: 2 },
        { start: 8, length: 3 },
        { start: 9, length: 1 },
        { start: 9, length: 2 },
        { start: 9, length: 3 },
        { start: 10, length: 1 },
        { start: 10, length: 2 },
      ],
    },
    {
      term: Term.S1,
      dates: [{ start: 2, length: 4 }],
    },
    { term: Term.S2, dates: [{ start: 7, length: 4 }] },
  ]
): Term => {
  // Error check
  if (!(cls && cls.termDates)) {
    throw new Error('no start and end dates for class: ' + cls)
  }

  const [start, end] = formatDates(
    [cls.termDates.start, cls.termDates.end].map(date =>
      reverseDayAndMonth(date, '/')
    )
  )

  for (const termData of reference) {
    // A term could have any number of start dates
    for (const termDate of termData.dates) {
      // If start date and length match, then term is found
      if (
        start.getMonth() + 1 === termDate.start &&
        end.getMonth() -
          start.getMonth() +
          (end.getFullYear() - start.getFullYear()) * 12 ===
          termDate.length
      ) {
        return termData.term
      }
    }
  }

  throw new Error('Could not find term for class: ' + cls)
}

/**
 * Parses data from the data array into a class object
 * @param data: array of text from elements with a data class
 * from a class chunk
 */
const parseClassChunk = (
  data: Chunk
): { classData: Class; warnings: classWarnings[] } | false => {
  let index = 0
  const warnings: classWarnings[] = []

  // ClassID is a 4 or 5 digit number
  const classID = parseInt(data[index])
  const classIDChecker = /^[0-9]{4,5}$/
  if (!classIDChecker.test(data[index])) {
    throw new Error('Invalid Class Id: ' + classID)
  }
  index++

  // Section is an 4 character alphanumeric code
  const section = data[index]
  const sectionChecker = /^[A-Z0-9]{0,4}$/
  if (!sectionChecker.test(section)) {
    throw new Error('Invalid Section: ' + section)
  }
  index++

  let term: string
  const termFinderRegex = /^([A-Z][A-Z0-9][A-Z0-9]?).*/
  if (termFinderRegex.test(data[index])) {
    term = termFinderRegex.exec(data[index])[1]
  }
  index++

  // Check if the class is actually course enrolment
  // which is not needed
  const courseEnrolmentChecker = /[Cc]ourse [Ee]nrolment/
  if (courseEnrolmentChecker.test(data[index])) {
    // Abort
    return false
  }

  const activity = data[index]
  if (!activity) {
    throw new Error('Unknown activity: ' + activity)
  }
  index++

  const status: Status = <Status>data[index]
  if (!Object.values(Status).includes(status)) {
    throw new Error('Invalid Status: ' + status)
  }
  index++

  const enrAndCap = data[index].split('/')
  const courseEnrolment = {
    enrolments: parseInt(enrAndCap[0]),
    capacity: parseInt(enrAndCap[1]),
  }
  // Enrolments and capacity are both numbers and enrolment less than capacity
  // (Strict requirement)
  if (
    !courseEnrolment ||
    !(courseEnrolment.enrolments >= 0 && courseEnrolment.capacity > 0) ||
    courseEnrolment.enrolments > courseEnrolment.capacity
  ) {
    // Lax requirement
    if (
      !courseEnrolment ||
      !(courseEnrolment.enrolments >= 0 && courseEnrolment.capacity >= 0)
    ) {
      throw new Error(
        'Invalid Course Enrolment: ' +
          courseEnrolment.enrolments +
          ' ' +
          courseEnrolment.capacity
      )
    } else {
      // Add warning
      const warning: classWarnings = {
        classID: classID,
        term: term,
        errKey: 'courseEnrolment',
        errValue: courseEnrolment,
      }
      warnings.push(warning)
    }
  }
  index++

  // Start and end dates can be used to classify each term code
  const runDates = data[index].split(' - ')
  if (!runDates || runDates.length === 0) {
    throw new Error('Could not find start and end dates in: ' + runDates)
  }
  const termDates = {
    start: runDates[0],
    end: runDates[1],
  }
  // Checking the format of the dates
  const dateCheckerRegex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/
  if (
    !(
      dateCheckerRegex.test(termDates.start) &&
      dateCheckerRegex.test(termDates.end)
    )
  ) {
    throw new Error('Invalid Date(s): ' + termDates)
  }
  index++

  // Skip meeting and census dates
  index += 2

  // class mode
  const mode = data[index]
  if (!mode || mode === ' ') {
    throw new Error('Invalid Mode: ' + mode)
  }
  index++

  // Skip consent
  index++

  // Any notes for the class (found later with dates)
  let notes: string
  // Dates
  const dateList: Time[] = []
  while (index < data.length) {
    // Check if there are any dates
    const dayCheckRegex = /^[A-Z][a-z]{2}$/
    if (!dayCheckRegex.test(data[index])) {
      // Add data as notes field and end checking
      notes = data[index]
      break
    }

    // Otherwise parse the date data
    // Day
    const day: Day = <Day>data[index]
    if (!(day && Object.values(Day).includes(day))) {
      throw new Error('Invalid day: ' + day)
    }
    index++

    // Start and end times
    const times = data[index].split(' - ')
    if (!times || times.length === 0) {
      throw new Error('Could not find start and end times in: ' + times)
    }
    const time = { start: times[0], end: times[1] }
    // Checking the format of the dates
    const timeCheckerRegex = /^[0-9]{2}:[0-9]{2}$/
    if (
      !(timeCheckerRegex.test(time.start) && timeCheckerRegex.test(time.end))
    ) {
      throw new Error('Invalid Time(s): ' + time)
    }
    index++

    // location
    let location: string | false = removeHtmlSpecials(data[index])
    // Check if location exists
    const locationTesterRegex = /[A-Za-z]/
    if (!(location && locationTesterRegex.test(location))) {
      // Add to warnings
      const warning: classWarnings = {
        classID: classID,
        term: term,
        errKey: 'location',
        errValue: location,
      }

      warnings.push(warning)

      // Remove location.
      location = false
    }
    index++

    // weeks
    const weeks = data[index]
    // Weeks is an alphanumeric string consisting of numbers, - and ,
    // (Strict requirement)
    let weeksTesterRegex = /^[0-9, <>-]+$/
    if (!weeksTesterRegex.test(weeks)) {
      weeksTesterRegex = /^[0-9A-Z, <>-]+$/
      if (!weeksTesterRegex.test(weeks)) {
        throw new Error('Invalid Weeks data: ' + weeks)
      } else {
        // Just warn.
        const warning: classWarnings = {
          classID: classID,
          term: term,
          errKey: 'weeks',
          errValue: weeks,
        }
        warnings.push(warning)
      }
    }
    index++

    // Extra newline
    index++

    const timeData: Time = { day: day, time: time, weeks: weeks }
    if (location) {
      timeData.location = location
    }
    dateList.push(timeData)
  }

  const classData: Class = {
    classID: classID,
    section: section,
    term: term,
    activity: activity,
    status: status,
    courseEnrolment: courseEnrolment,
    termDates: termDates,
    mode: mode,
    times: dateList,
  }

  if (notes) {
    classData.notes = notes
  }

  return { classData: classData, warnings: warnings }
}

export { parseClassChunk, classTermFinder }