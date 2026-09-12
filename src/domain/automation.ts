export type Automation = {
  id: string;
  // type: <Enum> (e.g. 'exact-match' | 'regexp' | <others>) - to support more cases than just `triggerKeyword`
  // `triggerKeyword` then would be part of more generic `context` or `payload` field
  version: number; // in case customer changes
  triggerKeyword: string;
  finalLink: string;
};
