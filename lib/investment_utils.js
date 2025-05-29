// Function to convert interest rates to ViewFD popup format
function transformInterestDataToPopUpFormat(interestDetails) {
  let interestData = {}
  Object.keys(interestDetails).forEach(function (key) {
    for (let i = 0; i < Object.keys(interestDetails[key]).length; i++) {
      if (interestData.hasOwnProperty(Object.keys(interestDetails[key][i]).toString())) {
        interestData[Object.keys(interestDetails[key][i]).toString()].push(Object.values(interestDetails[key][i]).toString())
      } else {
        interestData[Object.keys(interestDetails[key][i]).toString()] = [Object.values(interestDetails[key][i]).toString()]
      }
    }
  })
  return interestData
}

//function to filter deposit amount quick tip values
function filterDepositAmountQuickTipArray(minDepositAmountToDisplay, maxDepositAmountToDisplay) {
  let depositAmountArray = [10000, 20000, 40000, 100000, 250000, 500000, 1000000, 1500000];
  let filteredDepositQuickTipArray = []
  depositAmountArray.push(minDepositAmountToDisplay, maxDepositAmountToDisplay)

  filteredDepositQuickTipArray = depositAmountArray.filter((item,
    index) => depositAmountArray.indexOf(item) === index)
  depositAmountArray.sort(function (a, b) { return a - b })
  filteredDepositQuickTipArray.sort(function (a, b) { return a - b })

  if (minDepositAmountToDisplay > depositAmountArray[0]) {

    let idx = 0
    for (let i = 0; i < filteredDepositQuickTipArray.length; i++) {
      if (filteredDepositQuickTipArray[i] == minDepositAmountToDisplay) {
        idx = i;
        break;
      }
    }
    filteredDepositQuickTipArray.splice(0, idx)

  }
  if (maxDepositAmountToDisplay < depositAmountArray[(depositAmountArray).length - 1]) {

    let idx = 0
    for (let i = 0; i < filteredDepositQuickTipArray.length; i++) {
      if (filteredDepositQuickTipArray[i] == maxDepositAmountToDisplay) {
        idx = i;
        break;
      }
    }
    filteredDepositQuickTipArray.splice(idx + 1, ((filteredDepositQuickTipArray.length) - 1))

  }
  return filteredDepositQuickTipArray;
}
export {
  transformInterestDataToPopUpFormat, filterDepositAmountQuickTipArray,
};
