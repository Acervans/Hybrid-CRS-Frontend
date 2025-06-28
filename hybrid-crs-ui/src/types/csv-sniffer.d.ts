declare module 'csv-sniffer' {
  const CSVSniffer: () => new () => {
    sniff(csv: string): SniffResult
    hasHeader(csv: string): boolean
  }
  export default CSVSniffer
}
