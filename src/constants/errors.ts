interface Errors {
  invalidEventName: string,
  invalidEventHandler: string,
  errorHandlerIsAbsent: Function
}

export const errors: Errors =  {
  invalidEventName: `Event name should be a non-empty string` ,
  invalidEventHandler: `Provided event handler isn't valid`,
  errorHandlerIsAbsent: (event: string) => `Error Handler wasn't set for "${event}" event`
}
