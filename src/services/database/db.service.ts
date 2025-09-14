import Dexie from 'dexie';


export class AppDatabase extends Dexie {

  constructor() {
    super('acueductosDB');
    
    this.version(1).stores({
      // Placeholder for future tables
    });
  }
}

export const db = new AppDatabase();