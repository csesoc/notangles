import { ClassWarnings, Time } from '../../../interfaces'
import { getDays } from './TimeHelpers/GetDays'
import { getTime } from './TimeHelpers/GetTime'
import { getLocation } from './TimeHelpers/GetLocation'
import { getWeeks } from './TimeHelpers/GetWeeks'
import { getInstructor } from './TimeHelpers/GetInstructor'

/**
 * Compares two class times.
 * @param { Time } date1:
 * @param { Time } date2: time data to be compared
 */
const areTimesEqual = ({
  date1,
  date2,
}: {
  date1: Time
  date2: Time
}): [boolean, Time | null] => {
  // Should never happen
  if (!date1 || !date2) {
    if (date1) {
      return [false, date1]
    }
    return [false, date2]
  }
  let trueDate = date1

  for (const prop in date1) {
    if (!date1[prop]) {
      trueDate = date2
      continue
    } else if (!date2[prop]) {
      continue
    } else if (JSON.stringify(date1[prop]) !== JSON.stringify(date2[prop])) {
      return [false, trueDate]
    }
  }
  return [true, trueDate]
}

/**
 * De-duplicates the times of a class
 * Duplicates are: two times which have all the same values,
 * if values don't exist then they are ignored
 * @param { Time[] } dateList: List of class times
 */
const dedupTimes = (dateList: Time[]): Time[] => {
  if (!dateList) {
    return []
  }
  const uniqueDates: Time[] = [dateList[0]]
  for (const date of dateList) {
    const len = uniqueDates.length
    for (let i = 0; i < len; i++) {
      const uniqueDate = uniqueDates?.pop() || null
      const [equal, trueDate] = areTimesEqual({
        date1: date,
        date2: uniqueDate,
      })
      if (!equal) {
        uniqueDates.push(trueDate)
      }
      if (trueDate) {
        uniqueDates.push(trueDate)
      }
    }
  }
  return [...uniqueDates]
}

interface GetTimeDataParams {
  data: string[]
  index: number
  classID: number
  term: string
}

interface GetTimeDataReturn {
  dateList: Time[]
  timeDataWarnings: ClassWarnings[]
}

/**
 * Extracts all the times a class is offered through the term
 * @param { string[] } data: The ClassChunk that contains data about the class
 * @param { number } index: The index marking the start of the time data
 * @param { number } classID: Class id of the class being parsed
 * @param { string } term: The term the current class runs in
 * @returns { GetTimeDataReturn }: Array of times during which the class runs, and any warnings representing data errors that were found
 */
const getTimeData = ({
  data,
  index,
  classID,
  term,
}: GetTimeDataParams): GetTimeDataReturn => {
  const timeDataWarnings: ClassWarnings[] = []

  // Any notes for the class (found later with dates)
  // Dates
  const dateList: Time[] = []
  while (index < data.length) {
    // Parse the date data
    // Days: There can be multiple days for a single time/class
    const days = getDays(data[index])
    index++

    // Start and end times
    const time = getTime(data[index])
    index++

    // location
    const { location, locationWarnings } = getLocation({
      data: data[index],
      classID,
      term,
    })
    timeDataWarnings.concat(locationWarnings)
    index++

    // weeks
    const { weeks, weeksWarnings } = getWeeks({
      data: data[index],
      classID,
      term,
    })
    timeDataWarnings.concat(weeksWarnings)
    index++

    // Instructor (if listed)
    const instructor = getInstructor(data[index])
    index++

    // Make copies for each day the class runs
    for (const day of days) {
      const timeData: Time = { day: day, time: time, weeks: weeks }
      if (location) {
        timeData.location = location
      }
      if (instructor) {
        timeData.instructor = instructor
      }
      dateList.push(timeData)
    }
  }

  return { dateList: dedupTimes(dateList), timeDataWarnings }
}

export { getTimeData }
