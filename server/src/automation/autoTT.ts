import { Activity } from '@notangles/common'
import Database from '../database'
import { dbReadParams } from '../database'

interface DbCourse {
  courseCode: string
  name: string
  classes: DbClass[]
}

interface DbClass {
  activity: string
  times: DbTimes[]
  courseEnrolment: DbCourseEnrolment
  term: string
  classID: string
}

interface DbCourseEnrolment {
  enrolments: number
  capacity: number
}

interface DbTimes {
  time: DbTime
  day: string
  location: string
  weeks: string
}

interface DbTime {
  start: string
  end: string
}

interface autoCourse {
  code: string
  exclude: Activity[]
}

interface SortClass {
  id: string
  code: string
  time: DbTimes[]
  activity: string
}

export interface autoCourses {
  courses: autoCourse[]
  term: string
  year: number
  criteria: Record<string, number>
  includeClashes: boolean
}

interface FillTTParams {
  classGroups: SortClass[][]
  TT: SortClass[]
  index: number
  criteria: Record<string, number>
  includeClashes: boolean
}

export interface ClashParams {
  time1: DbTimes[]
  time2: DbTimes[]
}

interface CalcParams {
  TT: SortClass[]
  criteria: Record<string, number>
}

interface CalcFuncParams {
  TT: SortClass[]
  criteria: Record<string, number>
  maxVal: number
}

export const autoTT = async (courses: autoCourses) => {
  // get course data from db
  const dbCourses: DbCourse[] = await Promise.all(
    courses.courses.map(async (course) => {
      const args: dbReadParams = {
        dbName: courses.year.toString(),
        termColName: courses.term,
        courseCode: course.code,
      }
      try {
        return await Database.dbRead(args)
      } catch (error) {
        console.log('error')
        return []
      }
    })
  )

  // preprocessing the excludes
  const excludedDict: Record<string, Set<string>> = {}
  courses.courses.forEach((course) => {
    excludedDict[course.code] = new Set()
    for (const excluded of course.exclude) {
      excludedDict[course.code].add(excluded)
    }
  })

  // maps an activity and course group to an index
  const mapper: Record<string, Record<string, number>> = {}
  const classGroups: SortClass[][] = []
  let next = 0
  dbCourses.forEach((course) => {
    mapper[course.courseCode] = {}
    course.classes.forEach((cls) => {
      if (excludedDict[course.courseCode].has(cls.activity)) {
        return
      }
      if (!mapper[course.courseCode][cls.activity]) {
        mapper[course.courseCode][cls.activity] = next
        next++
      }
      const index = mapper[course.courseCode][cls.activity]
      if (!classGroups[index]) {
        classGroups[index] = []
      }
      const sortClass: SortClass = {
        id: cls.classID,
        code: course.courseCode,
        time: cls.times,
        activity: cls.activity,
      }
      classGroups[index].push(sortClass)
    })
  })
  
  // find best tt
  let maxScore: number = -1
  let index: number = 0
  let bestTT: SortClass[] = []

  classGroups[index].forEach((clas) => {
    let newTT: SortClass[] = []
    newTT.push(clas)
    const fillTTParams: FillTTParams = {
      classGroups: classGroups,
      TT: newTT,
      index: index + 1,
      criteria: courses.criteria,
      includeClashes: courses.includeClashes
    }

    newTT = fillTT(fillTTParams)
    const calcParams: CalcParams = {
      TT: newTT,
      criteria: courses.criteria
    }

    let score = calc(fillTTParams)
    if (score > maxScore) {
      bestTT = newTT.slice(0)
      maxScore = score
    }
  })

  const formatedTT: Record<string, Record<string, string>> = {}
  bestTT.forEach((act) => {
    if (!formatedTT[act.code]) {
      formatedTT[act.code] = {}
    }
    formatedTT[act.code][act.activity] = act.id
  })

  return formatedTT
}

const fillTT = ({
  classGroups,
  TT,
  index,
  criteria,
  includeClashes
}: FillTTParams): SortClass[] => {
  if (index >= classGroups.length) {
    return TT
  }

  let maxScore: number = -1
  let bestTT: SortClass[] = []
  classGroups[index].forEach((clas) => {
    let newTT: SortClass[] = TT.slice(0)

    let clashing = false

    if (!includeClashes) {
      newTT.forEach((t) => {
        const clashParams : ClashParams = {
          time1: clas.time,
          time2: t.time
        }
        if (clash(clashParams)) {
          clashing = true
        }
      })
    }

    if (!clashing) {
      newTT.push(clas)
      const fillTTParams: FillTTParams = {
        classGroups: classGroups,
        TT: newTT,
        index: index + 1,
        criteria: criteria,
        includeClashes: includeClashes
      }

      newTT = fillTT(fillTTParams)
      const calcParams: CalcParams = {
        TT: newTT,
        criteria: criteria
      }
      let score = calc(calcParams)
      if (score > maxScore) {
        bestTT = newTT.slice(0)
        maxScore = score
      }
    }
  })

  return bestTT
}

export const clash = ({time1, time2}: ClashParams): boolean => {
  // need to convert to numbers
  let clashing = false
  for (let t1 = 1; t1 < time1.length; t1++) {
    for (let t2 = 1; t2 < time2.length; t2++) {
      if (time1[t1].day === time2[t2].day) {
        const t1start: number = extractTime(time1[t1].time.start)
        const t1end: number = extractTime(time1[t1].time.end)
        const t2start: number = extractTime(time2[t2].time.start)
        const t2end: number = extractTime(time2[t2].time.end)
        if (t1start >= t2start && t1start < t2end) {
          clashing = true
        }

        if (t1end > t2start && t1end <= t2end) {
          clashing = true
        }

        if (t2start >= t1start && t2start < t1end) {
          clashing = true
        }

        if (t2end > t1start && t2end <= t1end) {
          clashing = true
        }

        if (clashing === true) {
          return clashing
        }
      }
    }
  }

  return clashing
}

const daysAtUni = ({TT, criteria, maxVal}: CalcFuncParams): number => {
  const maxDaysAtUni = 5
  let score : number = 0
  const days: Record<string, boolean> = {}
  TT.forEach((act) => {
    act.time.forEach((t) => {
      if (!days[t.day]) {
        days[t.day] = true
      }
    })
  })

  let count = 0
  Object.keys(days).forEach((day) => {
    count++
  })

  if (criteria['daysAtUni'] < 0) {
    // least amount of days at uni
    score += ((maxDaysAtUni - count) / maxDaysAtUni) * maxVal * -1 * criteria['daysAtUni']
  } else {
    // most amount of days at uni
    score += (count / maxDaysAtUni) * maxVal * criteria['daysAtUni']
  }

  return score
}

const napTime = ({TT, criteria, maxVal}: CalcFuncParams): number => {
  const earliestStartTime: number = 8 * 60
  const latestTime: number = 21 * 60
  let score: number = 0
  let max: number = 0
  let total: number = 0
  TT.forEach((clas) => {
    clas.time.forEach((t) => {
      const start: number = extractTime(t.time.start)
      total += start - earliestStartTime
      max += (latestTime - earliestStartTime)
    })
  })
  if (criteria['napTime'] < 0) {
    // least nap time
    score += (1 - total / max) * maxVal * -1 * criteria['napTime']
  } else {
    // most nap time
    score += (total / max) * maxVal * criteria['napTime']
  }

  return score
}

const breakTime = ({TT, criteria, maxVal}: CalcFuncParams): number => {
  const maxBreakTime: number = 11 * 60
  let total: number = 0
  let max: number = 0
  let score: number = 0
  TT.forEach((clas1) => {
    clas1.time.forEach((t1) => {
      TT.forEach((clas2) => {
        clas2.time.forEach((t2) => {
          if (t1.day === t2.day) {
            const t1start: number = extractTime(t1.time.start)
            const t1end: number = extractTime(t1.time.end)
            const t2start: number = extractTime(t2.time.start)
            const t2end: number = extractTime(t2.time.end)

            if (t1start < t2start) {
              total += t2start - t1end
            } else {
              total += t1start - t2end
            }
            max += maxBreakTime
          }
        })
      })
    })
  })

  if (criteria['breakTime'] < 0) {
    // least amount of break time
    score += (1 - total / max) * maxVal * -1 * criteria['breakTime']
  } else {
    // most amount of break time
    score += (total / max) * maxVal * criteria['breakTime']
  }

  return score
}

const criterias: Record<string, Function> = { "daysAtUni": daysAtUni, "napTime" : napTime, "breakTime" :breakTime }

const calc = ({TT, criteria}: CalcParams): number => {
  let score: number = 0
  const maxVal: number = 10
  const calcFuncParams: CalcFuncParams = {
    TT: TT,
    criteria: criteria,
    maxVal: maxVal
  }

  Object.keys(criteria).forEach((key) => { score += criterias[key](calcFuncParams) } )
  return score
}


const extractTime = (time: string): number => {
  return (parseInt(time.split(":")[0]) * 60) + parseInt(time.split(":")[1])
}