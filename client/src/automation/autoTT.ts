import { clash } from './clash';
import { CourseData, ClassPeriod, filterOutClasses, ClassData } from '@notangles/common';
 
let classDict: Record<string, ClassData[]> = {}
let keys : string[]
export const autoTT = (courses: CourseData[], calc: Function) => {
    courses.forEach(course => {
        Object.keys(course.activities).forEach(act => {
            let classString = course.code + "_" + act
            classDict[classString] = []
            course.activities[act].forEach(clas => {
                classDict[classString].push(clas)
            })
        })
    })

    keys = Object.keys(classDict)
    let maxScore : number = -1
    let index : number = 0
    let bestTT : ClassPeriod[] = []
    if (keys.length === 0) {
        return []
    }
    classDict[keys[index]].forEach(classSlot => {
        let tt : ClassPeriod[] = []
        classSlot.periods.forEach(period => {
            tt.push(period)
        })
        tt = fillTT(index, tt, calc)
        let score = calc(tt)
        if (score > maxScore) {
            bestTT = tt.slice(0)
            maxScore = score
        }
    })

    return bestTT
}

const fillTT = (index : number, tt : ClassPeriod[], calc : Function) => {
    index += 1
    if (index >= keys.length) {
        return tt
    }
    let maxScore : number = -1
    let bestTT : ClassPeriod[] = []
    classDict[keys[index]].forEach(classSlot => {
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
            
            newTT = fillTT(index, newTT, calc)
            let score = calc(newTT)

            if (score > maxScore) {
                maxScore = score
                bestTT = newTT
            }
        }
    }) 

    return bestTT
}
 
 
/*const fillTT = (keyNum: number, timetable: Period[], calc: Function) => {
   return timetable
   let newKeyNum = keyNum + 1
   if (newKeyNum >= keys.length) {
       return timetable
   }
 
   let bestTT: ClassTime[] = []
   let maxScore: number = -1
   let key = keys[newKeyNum]
   classDict[key].forEach(periods => {
       let clashing = false;
       periods.forEach(period => {
           timetable.forEach(time => {
               if (clash(period.time, time) == true) {
                   clashing = true;
               }
           })
       })
 
       if (clashing == false) {
           let newTT = timetable.slice(0)
           periods.forEach(period => {
               newTT.push(period.time)
           })
           newTT = fillTT(newKeyNum, newTT, calc)
           let score = calc(newTT)
           if (score > maxScore) {
               bestTT = newTT
               maxScore = score
           }
       }
   })
 
   return bestTT
}
 */
/*let classDict: Record<string, Period[][]> = {}
let keys : string[]
 
export const leastDays = (courses: CourseData[], calc: Function) => {
   courses.forEach(course => {
       Object.keys(course["classes"]).forEach(classID => {
           let classString = course.courseCode + "_" + classID
           classDict[classString] = []
           course["classes"][classID].forEach(timeObject => {
               if (timeObject != null) {
                   classDict[classString].push(timeObject.periods)
               }
           })
       })
   })
   console.log(classDict)
   let maxScore: number = -1
   let bestTT: ClassTime[] = []
   keys = Object.keys(classDict)
   if (Object.keys(classDict).length > 0) {
       const firstkey: string = keys[0]
       let timetable: ClassTime[] = []
       classDict[firstkey].forEach(periods => {
           periods.forEach(period => {
               console.log("Period")
               console.log(period)
               timetable.push(period.time)
           })
 
           timetable = fillTT(0, timetable, calc)
           let score = calc(timetable)
           if (score > maxScore) {
               maxScore = score
               bestTT = timetable
           }
       })
       console.log("BestTT")
       console.log(bestTT)
       console.log("Rec")
       return reconstruct(bestTT)
   } else {
       console.log("BestTT")
       console.log(bestTT)
       console.log("Rec")
       return reconstruct(bestTT)
   }
}
 
const fillTT = (keyNum: number, timetable: ClassTime[], calc: Function) => {
   let newKeyNum = keyNum + 1
   if (newKeyNum >= keys.length) {
       return timetable
   }
 
   let bestTT: ClassTime[] = []
   let maxScore: number = -1
   let key = keys[newKeyNum]
   classDict[key].forEach(periods => {
       let clashing = false;
       periods.forEach(period => {
           timetable.forEach(time => {
               if (clash(period.time, time) == true) {
                   clashing = true;
               }
           })
       })
 
       if (clashing == false) {
           let newTT = timetable.slice(0)
           periods.forEach(period => {
               newTT.push(period.time)
           })
           newTT = fillTT(newKeyNum, newTT, calc)
           let score = calc(newTT)
           if (score > maxScore) {
               bestTT = newTT
               maxScore = score
           }
       }
   })
 
   return bestTT
}
 
const reconstruct = (timetable: ClassTime[]) => {
   let bestTT : Record<string, ClassTime[]> = {}
   let classNum = 0
   keys.forEach(key => {
       if (classDict[key].length > 0) {
           bestTT[key] = []
           for (let i = 0; i < classDict[key].length; i ++) {
               bestTT[key].push(timetable[classNum])
               classNum++
           }
       }
   })
   return bestTT
}
*/
