import { CourseData, ClassPeriod, filterOutClasses, ClassData, ClassTime } from '@notangles/common';
import { clash } from './clash';
import Database from '../database'
import { dbReadParams } from '../database'
import { dbCourseToCourseData } from './DbCourse'

 interface DbCourse {
    courseCode: string
    name: string
    classes: DbClass[]
  }
  
   interface DbClass {
    activity: string
    times: DbTimes[]
    courseEnrolment: DbCourseEnrolment
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


export interface autoCourses {
    courses: [],
    term: string,
    year: number,
    criteria: {}
}

interface sortClass {
    time: ClassTime ,
    id: string
}

interface activityObject {
    code: string,
    activity: string,
    classes: sortClass[]
}

const dbReadToSort = (course : DbCourse) => {
    const activities = []
    course.classes.forEach(c => {
        if (!activities.includes(c.activity)) {
            activities.push(c.activity)
        }
    })

    const activityObjects : activityObject[] = []
    activities.forEach(activity => {
        const act : activityObject = {
            code: course.courseCode,
            activity: activity,
            classes: []
        }
        activityObjects.push(act)
    })

    course.classes.forEach(c => {
        activityObjects.forEach(activityObject => {

        })
    })
}
 
const autoInit = async (courses: autoCourses) => {
    const ttCourses : ClassData[] = []
    for (const course of courses["courses"]) {
        const args : dbReadParams = {
            dbName: courses["year"].toString(10),
            termColName: courses["term"],
            courseCode: courses["code"]
        }
        ttCourses.push(await Database.dbRead(args))
    }

}

export const autoTT = (classes: ClassData[], calc: Function) => {
    let maxScore : number = -1
    let index : number = 0
    let bestTT : ClassPeriod[] = []
    if (classes.length === 0) {
        return []
    }

    classes.forEach(classSlot => {
        let tt : ClassPeriod[] = []
        classSlot.periods.forEach(period => {
            tt.push(period)
        })
        tt = fillTT(index, tt, calc, classes)
        let score = calc(tt)
        if (score > maxScore) {
            bestTT = tt.slice(0)
            maxScore = score
        }
    })

    return bestTT
}

const fillTT = (index : number, tt : ClassPeriod[], calc : Function, classes : ClassData[]) => {
    index += 1
    if (index >= classes.length) {
        return tt
    }
    let maxScore : number = -1
    let bestTT : ClassPeriod[] = []
    classes.forEach(classSlot => {
        let clashing : boolean = false
        classSlot.periods.forEach(p1 => {
            tt.forEach(p2 => {
                if (clash(p1.time, p2.time) === true) {
                    clashing = true
                }
            })
        })

        if (clashing === false) {
            let newTT = tt.slice(0)
            classSlot.periods.forEach(period => {
                newTT.push(period)
            })
            
            newTT = fillTT(index, newTT, calc, classes)
            let score = calc(newTT)

            if (score > maxScore) {
                maxScore = score
                bestTT = newTT
            }
        }
    }) 

    return bestTT
}