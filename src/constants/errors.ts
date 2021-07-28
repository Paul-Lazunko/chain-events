
export const errors: { [key: string]: (event?: string) => string } =  {
  invalidEventName: () => `Event name should be a non-empty string`,
  invalidEventHandler: () => `Provided event handler is invalid`,
  errorHandlerIsAbsent: (event: string) => `Error Handler wasn't set for "${event}" event`
}
