const { eventConnector } = require("./clevertap/clevertap_connector");

export function pushEvents(eventName, eventData) {
  const connectors = process.env.NEXT_PUBLIC_EVENT_LOGGER;
  if (connectors?.length) {
    connectors.split(",").forEach(connector => {
      switch (connector.trim()) {
        case 'Clevertap':
          eventConnector(eventName, eventData);
        case 'Google_Analytics':
          break;
        case 'Iterable':
          break;
        default:
          break;
      }
    })
  }
}
