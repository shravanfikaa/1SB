export const rmListWithProfessionalDetails = [
  {
    "id": 1,
    "label": "basicDetails",
    "parent_id": 0,
    "link": "basic_details",
    "previousPage": "",
    "nextPage": "parents_spouse_details",
    "optional": false
  },
  {
    "id": 2,
    "label": "parentsAndSpouseDetails",
    "parent_id": 1,
    "link": "parents_spouse_details",
    "previousPage": "basic_details",
    "nextPage": "professional_details",
    "optional": false
  },
  {
    "id": 3,
    "label": "professionalDetails",
    "parent_id": 1,
    "link": "professional_details",
    "previousPage": "parents_spouse_details",
    "nextPage": "add_nominee",
    "optional": false
  },
  {
    "id": 4,
    "label": "Nominee",
    "parent_id": 0,
    "link": "add_nominee",
    "previousPage": "professional_details",
    "nextPage": "declaration",
    "optional": false
  },
  {
    "id": 5,
    "label": "declaration",
    "parent_id": 0,
    "link": "declaration",
    "previousPage": "add_nominee",
    "nextPage": "investment_details",
    "optional": false
  },
  {
    "id": 6,
    "label": "investmentDetails",
    "parent_id": 0,
    "link": "investment_details",
    "previousPage": "declaration",
    "nextPage": "bank_details",
    "optional": false
  },
  {
    "id": 7,
    "label": "bankAccountDetails",
    "parent_id": 0,
    "link": "bank_details",
    "previousPage": "investment_details",
    "nextPage": "review_invest",
    "optional": false
  },
  {
    "id": 8,
    "label": "reviewAndInvest",
    "parent_id": 0,
    "link": "review_invest",
    "previousPage": "bank_details",
    "nextPage": "",
    "optional": false
  }
];

export const rmListWithoutProfessionalDetails = [
  {
    "id": 1,
    "label": "basicDetails",
    "parent_id": 0,
    "link": "basic_details",
    "previousPage": "",
    "nextPage": "parents_spouse_details",
    "optional": false
  },
  {
    "id": 2,
    "label": "parentsAndSpouseDetails",
    "parent_id": 1,
    "link": "parents_spouse_details",
    "previousPage": "basic_details",
    "nextPage": "add_nominee",
    "optional": false
  },
  {
    "id": 3,
    "label": "Nominee",
    "parent_id": 0,
    "link": "add_nominee",
    "previousPage": "parents_spouse_details",
    "nextPage": "declaration",
    "optional": false
  },
  {
    "id": 4,
    "label": "declaration",
    "parent_id": 0,
    "link": "declaration",
    "previousPage": "add_nominee",
    "nextPage": "investment_details",
    "optional": false
  },
  {
    "id": 5,
    "label": "investmentDetails",
    "parent_id": 0,
    "link": "investment_details",
    "previousPage": "declaration",
    "nextPage": "bank_details",
    "optional": false
  },
  {
    "id": 6,
    "label": "bankAccountDetails",
    "parent_id": 0,
    "link": "bank_details",
    "previousPage": "investment_details",
    "nextPage": "review_invest",
    "optional": false
  },
  {
    "id": 7,
    "label": "reviewAndInvest",
    "parent_id": 0,
    "link": "review_invest",
    "previousPage": "bank_details",
    "nextPage": "",
    "optional": false
  }
];
