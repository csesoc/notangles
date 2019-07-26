import { MongoClient, Db } from 'mongodb'
import { config } from './config'

const url = config.database

// DB Name
const dbName = 'Notangles'

class Database {
  private client: MongoClient | undefined

  connect = async () => {
    const client = new MongoClient(url, { useNewUrlParser: true })
    this.client = await client.connect()
  }

  disconnect = () => {
    if (this.client) {
      this.client.close()
    }
  }

  getDb = async (): Promise<Db> => {
    if (!this.client) await this.connect()
    const db = this.client.db(dbName)
    return db
  }

  dbAdd = async (termColName: string, doc) => {
    const db = await this.getDb()
    const col = db.collection(termColName)
    await col.insertOne(doc)
  }

  dbRead = async (termColName: string, courseCode: string) => {
    const db = await this.getDb()
    const col = db.collection(termColName)
    const doc = await col.findOne({ courseCode })
    return doc
  }

  dbUpdate = async (termColName: string, courseCode: string, doc) => {
    const db = await this.getDb()
    const col = db.collection(termColName)
    try {
      await col.updateOne({ courseCode }, { $set: doc })
    } catch (e) {
      console.log(e)
    }
  }

  dbDel = async (termColName: string, courseCode: string) => {
    const db = await this.getDb()
    const col = db.collection(termColName)
    await col.deleteOne({ courseCode })
  }
}

const db = new Database()
export default db
