import {CourseData, ClassData, ClassTime} from '@notangles/common'

export const clash = (time1: ClassTime, time2: ClassTime): boolean => {
    var clashing = false
    if (time1.start >= time2.start && time1.start < time2.end) {
        clashing = true
    }
  
    if (time1.end > time2.start && time1.end <= time2.end) {
        clashing = true
    }
  
    if (time2.start >= time1.start && time2.start < time1.end) {
        clashing = true
    }
  
    if (time2.end > time1.start && time2.end <= time1.end) {
        clashing = true
    }
  
    if (time1.day != time2.day) {
        clashing = false
    }
  
    return clashing;
 }
 