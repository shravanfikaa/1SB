// Function will generate a whereClause for ALSQL query
// @Param: Input
// selectedItems: List (example: selectedItems: [1,2,3])
// filterLabel: string (example: filterLabel: "manufacturer")
// valueDateType: string (example: valueDateType: "range")
function generateALSQLWhereClause(
  selectedItems,
  filterLabel,
  valueDateType = "number"
) {
  let queryItem = "";
  for (var i in selectedItems) {
    switch (valueDateType) {
      case "string":
        if (filterLabel === "manufacturerName") {
          queryItem += " " + filterLabel + "='" + selectedItems[i] + "' OR";
        } else {
          queryItem += " " + filterLabel + "='" + selectedItems[i].toUpperCase() + "' OR";
        }
        break;
      case "number":
        queryItem += " " + filterLabel + "=" + selectedItems[i] + " OR";
        break;
      case "doublenumber":
        var numbers = selectedItems[i].match(/\d+/g).map(Number);
        if (numbers.length == 1) {
          numbers[1] = numbers[0]
        }
        if (selectedItems[i].includes("day") && selectedItems[i].includes("year")) {
          numbers[1] = numbers[1] * 360
        }
        else if (!selectedItems[i].includes("day") && selectedItems[i].includes("year")) {
          numbers[0] = numbers[0] * 360
          numbers[1] = numbers[1] * 360
        }
        queryItem += " ( (" + numbers[0] + " >= minTenure AND " + numbers[0] + " <= maxTenure ) OR ( " + numbers[1] + " >= minTenure AND " + numbers[1] + " <= maxTenure ) ) OR"
        break;
      case "range":
        // We can define range option here
        queryItem += " " + filterLabel + " >= '" + selectedItems[i] + "' OR";
        break;
      case "nested":
        // We can define range option here
        for (let j = 0; j < 2; j++) {
          queryItem += " " + filterLabel + "->" + [j] + "= " + selectedItems[i] + " OR";
        }
        break;
      case "nestedString":
        // We can define range option here
        for (let j = 0; j < 2; j++) {
          queryItem += " " + filterLabel + "->" + [j] + "='" + selectedItems[i] + "' OR";
        }
        break;
      case "nestedString2":
        // We can define range option here
        for (let j = 0; j < 5; j++) {
          queryItem += " " + filterLabel + "->" + [j] + "='" + selectedItems[i] + "' OR";
        }
        break;
      case "nestednestedString":
        // We can define range option here
        queryItem += " " + filterLabel + "->" + [0] + "-> category='" + selectedItems[i] + "' OR";
        break;
      case "between":
        // We can define range option here
        queryItem += " " + filterLabel + " between (" + selectedItems[0] + "," + selectedItems[1] + ") AND ";
        break;
      case "order":
        if (selectedItems == 'ASC') {
          queryItem = " " + "ORDER BY " + filterLabel + " ->[0] " + selectedItems + " ";
        }
        else if (selectedItems == 'DESC') {
          queryItem = " " + "ORDER BY " + filterLabel + " ->[1] " + selectedItems + " ";
        }
        break;
      case "orderRating":
        queryItem = " " + "ORDER BY " + filterLabel + " ->[0]-> category " + selectedItems + " ";
      case "orderString":
        // We can define range option here
        queryItem = " " + "ORDER BY " + filterLabel + " " + selectedItems + " ";
        break;
      default:
        break;
    }
  }
  if (queryItem.length == 0) {
    queryItem = " " + filterLabel.length + " >= 0  ";
  }
  var filter = queryItem.split(" ");
  filter.pop();
  return filter.join(" ");
}
export { generateALSQLWhereClause };
