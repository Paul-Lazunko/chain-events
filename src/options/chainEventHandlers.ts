export type TChainEventHandler = (data: any, event: string, next: Function) => void;
export type TChainEventErrorHandler = (error: Error, data: any, event: string) => void;
