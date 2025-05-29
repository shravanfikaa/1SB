import { initializeClevertap } from "../../lib/util";

const handleEventPushClick = async (eventName, eventDesc) => {
  if (typeof clevertap !== 'undefined') {
    clevertap.event.push(eventName, eventDesc);
  }
  else{
    let clevertap = await initializeClevertap();
    clevertap.event.push(eventName, eventDesc);
  }
}

export const eventConnector = (eventName, eventDesc) => {
  handleEventPushClick(eventName, eventDesc);
}
