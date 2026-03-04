declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar
    static fromDate(date: Date): Solar
    getLunar(): Lunar
    getYear(): number
    getMonth(): number
    getDay(): number
    getWeek(): number
    toYmd(): string
  }
  
  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar
    getSolar(): Solar
    getYear(): number
    getMonth(): number
    getDay(): number
    getYearInChinese(): string
    getMonthInChinese(): string
    getDayInChinese(): string
    getYearInGanZhi(): string
    getMonthInGanZhi(): string
    getDayInGanZhi(): string
    getYearShengXiao(): string
    getJieQi(): string
    getFestivals(): string[]
    getOtherFestivals(): string[]
  }
}

declare module 'relationship.js' {
  interface RelationshipOptions {
    text: string
    sex: number
    reverse?: boolean
  }
  
  function relationship(options: RelationshipOptions): string[]
  export default relationship
}
