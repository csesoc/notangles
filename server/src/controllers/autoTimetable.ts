import { Request, Response } from 'express'

export const autoTimetable = async (req: Request, res: Response) => {
    res.send('{"COMP1511" : {"Tutorial-Laboratory" : 8724}}');
}