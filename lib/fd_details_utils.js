// Function to extract FD Ratings and agencies for provided product info
export function getFDRatingsAndAgencies(response) {
  let fdRatings = [];
  let fdRatingAgencies = [];
  for (let index = 0; index < response.data.data.ratings.length; index++) {
    fdRatings.push(response.data.data.ratings[index].hasOwnProperty("fdRating") ? response.data.data.ratings[index]["fdRating"] : "--")
    fdRatingAgencies.push(response.data.data.ratings[index].hasOwnProperty("fdRatingAgency") ? response.data.data.ratings[index]["fdRatingAgency"] : "--")
  }
  return [fdRatings, fdRatingAgencies]
}

export const getInterestRate = (interestRates, param, payout) => {
  console.log(interestRates, param, payout)
  let interestRateDetails = [];
  if (interestRates && payout) {
    if(interestRates[param])
    {
          const key = Object.keys(interestRates[param])[payout];
          interestRateDetails = interestRates[param][payout];
    }
     else
  {
     const key = Object.keys(interestRates["regular"])[0];
    interestRateDetails = interestRates['regular'][key];
  }
  
  }
 
   else {
    const key = Object.keys(interestRates[param])[0];
    interestRateDetails = interestRates[param][key];
  }
  return interestRateDetails;
}

export const getInterestDorpDownItems = (interestRates) => {
  let interestRateDetails = [];
  if (interestRates) {
    const keys = Object.keys(interestRates);
    interestRateDetails = keys
  }
  return interestRateDetails;
}
