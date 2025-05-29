const { eventConnector } = require("./clevertap/clevertap_connector");

export function pushEvents(eventName, eventData) {
  // verify whether /setup or provided API response contains any information related to integrations
  switch ("Clevertap") {
    case 'Clevertap':
      eventConnector(eventName, eventData);
    case 'Google_Analytics':
      break;
    case 'Iterable':
      break;
    default:
      break;
  }
}