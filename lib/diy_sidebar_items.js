export const listWithProfessionalDetails = [
  { "id": 1, "label": "personalDetails", "parent_id": 0, "link": "customer_personal_details", "previousPage": "", "nextPage": "basic_details", "optional": false },
  { "id": 2, "label": "basicDetails", "parent_id": 1, "link": "basic_details", "previousPage": "customer_personal_details", "nextPage": "customer_address", "optional": false },
  // { "id": 3, "label": "contactDetails", "parent_id": 1, "link": "contact_details", "previousPage": "basic_details", "nextPage": "customer_address", "optional": false },
  { "id": 4, "label": "addressDetails", "parent_id": 1, "link": "customer_address", "previousPage": "basic_details", "nextPage": "parents_spouse_details", "optional": false },
  { "id": 6, "label": "parentsAndSpouseDetails", "parent_id": 1, "link": "parents_spouse_details", "previousPage": "customer_address", "nextPage": "professional_details", "optional": false },
  { "id": 7, "label": "professionalDetails", "parent_id": 1, "link": "professional_details", "previousPage": "parents_spouse_details", "nextPage": "add_nominee", "optional": false },
  { "id": 8, "label": "Nominee", "parent_id": 0, "link": "add_nominee", "previousPage": "professional_details", "nextPage": "declaration", "optional": false },
  { "id": 9, "label": "declaration", "parent_id": 0, "link": "declaration", "previousPage": "add_nominee", "nextPage": "investment_details", "optional": false },
  { "id": 10, "label": "investmentDetails", "parent_id": 0, "link": "investment_details", "previousPage": "declaration", "nextPage": "bank_details", "optional": false },
  { "id": 11, "label": "bankAccountDetails", "parent_id": 0, "link": "bank_details", "previousPage": "investment_details", "nextPage": "review_invest", "optional": false },
  { "id": 12, "label": "reviewAndInvest", "parent_id": 0, "link": "review_invest", "previousPage": "bank_details", "nextPage": "", "optional": false }
]

export const listWithoutProfessionalDetails = [
  { "id": 1, "label": "personalDetails", "parent_id": 0, "link": "customer_personal_details", "previousPage": "", "nextPage": "basic_details", "optional": false },
  { "id": 2, "label": "basicDetails", "parent_id": 1, "link": "basic_details", "previousPage": "customer_personal_details", "nextPage": "customer_address", "optional": false },
  // { "id": 3, "label": "contactDetails", "parent_id": 1, "link": "contact_details", "previousPage": "basic_details", "nextPage": "customer_address", "optional": false },
  { "id": 4, "label": "addressDetails", "parent_id": 1, "link": "customer_address", "previousPage": "basic_details", "nextPage": "parents_spouse_details", "optional": false },
  { "id": 6, "label": "parentsAndSpouseDetails", "parent_id": 1, "link": "parents_spouse_details", "previousPage": "customer_address", "nextPage": "add_nominee", "optional": false },
  { "id": 7, "label": "Nominee", "parent_id": 0, "link": "add_nominee", "previousPage": "parents_spouse_details", "nextPage": "declaration", "optional": false },
  { "id": 8, "label": "declaration", "parent_id": 0, "link": "declaration", "previousPage": "add_nominee", "nextPage": "investment_details", "optional": false },
  { "id": 9, "label": "investmentDetails", "parent_id": 0, "link": "investment_details", "previousPage": "declaration", "nextPage": "bank_details", "optional": false },
  { "id": 10, "label": "bankAccountDetails", "parent_id": 0, "link": "bank_details", "previousPage": "investment_details", "nextPage": "review_invest", "optional": false },
  { "id": 11, "label": "reviewAndInvest", "parent_id": 0, "link": "review_invest", "previousPage": "bank_details", "nextPage": "", "optional": false }
]

export const fmListWithProfessionalDetails = [
  { "id": 1, "label": "personalDetails", "parent_id": 0, "link": "customer_personal_details", "previousPage": "", "nextPage": "basic_details", "optional": false },
  { "id": 2, "label": "basicDetails", "parent_id": 1, "link": "basic_details", "previousPage": "customer_personal_details", "nextPage": "parents_spouse_details", "optional": false },
  // { "id": 3, "label": "contactDetails", "parent_id": 1, "link": "contact_details", "previousPage": "basic_details", "nextPage": "customer_address", "optional": false },
  // { "id": 4, "label": "addressDetails", "parent_id": 1, "link": "customer_address", "previousPage": "basic_details", "nextPage": "parents_spouse_details", "optional": false },
  { "id": 6, "label": "parentsAndSpouseDetails", "parent_id": 1, "link": "parents_spouse_details", "previousPage": "basic_details", "nextPage": "professional_details", "optional": false },
  { "id": 7, "label": "professionalDetails", "parent_id": 1, "link": "professional_details", "previousPage": "parents_spouse_details", "nextPage": "add_nominee", "optional": false },
  { "id": 8, "label": "Nominee", "parent_id": 0, "link": "add_nominee", "previousPage": "professional_details", "nextPage": "declaration", "optional": false },
  { "id": 9, "label": "declaration", "parent_id": 0, "link": "declaration", "previousPage": "add_nominee", "nextPage": "investment_details", "optional": false },
  { "id": 10, "label": "investmentDetails", "parent_id": 0, "link": "investment_details", "previousPage": "declaration", "nextPage": "bank_details", "optional": false },
  { "id": 11, "label": "bankAccountDetails", "parent_id": 0, "link": "bank_details", "previousPage": "investment_details", "nextPage": "review_invest", "optional": false },
  { "id": 12, "label": "reviewAndInvest", "parent_id": 0, "link": "review_invest", "previousPage": "bank_details", "nextPage": "", "optional": false }
]

export const fmListWithoutProfessionalDetails = [
  { "id": 1, "label": "personalDetails", "parent_id": 0, "link": "customer_personal_details", "previousPage": "", "nextPage": "basic_details", "optional": false },
  { "id": 2, "label": "basicDetails", "parent_id": 1, "link": "basic_details", "previousPage": "customer_personal_details", "nextPage": "parents_spouse_details", "optional": false },
  // { "id": 3, "label": "Contact Details", "parent_id": 1, "link": "contact_details", "previousPage": "basic_details", "nextPage": "customer_address", "optional": false },
  // { "id": 4, "label": "Address Details", "parent_id": 1, "link": "customer_address", "previousPage": "basic_details", "nextPage": "parents_spouse_details", "optional": false },
  { "id": 6, "label": "parentsAndSpouseDetails", "parent_id": 1, "link": "parents_spouse_details", "previousPage": "basic_details", "nextPage": "add_nominee", "optional": false },
  { "id": 7, "label": "Nominee", "parent_id": 0, "link": "add_nominee", "previousPage": "parents_spouse_details", "nextPage": "declaration", "optional": false },
  { "id": 8, "label": "declaration", "parent_id": 0, "link": "declaration", "previousPage": "add_nominee", "nextPage": "investment_details", "optional": false },
  { "id": 9, "label": "investmentDetails", "parent_id": 0, "link": "investment_details", "previousPage": "declaration", "nextPage": "bank_details", "optional": false },
  { "id": 10, "label": "bankAccountDetails", "parent_id": 0, "link": "bank_details", "previousPage": "investment_details", "nextPage": "review_invest", "optional": false },
  { "id": 11, "label": "reviewAndInvest", "parent_id": 0, "link": "review_invest", "previousPage": "bank_details", "nextPage": "", "optional": false }
]

export const unityList = [
  { "id": 1, "label": "personalDetails", "parent_id": 0, "link": "customer_personal_details", "previousPage": "", "nextPage": "add_nominee", "optional": false },
  // { "id": 2, "label": "basicDetails", "parent_id": 1, "link": "basic_details", "previousPage": "customer_personal_details", "nextPage": "add_nominee", "optional": false },
  // { "id": 3, "label": "contactDetails", "parent_id": 1, "link": "contact_details", "previousPage": "basic_details", "nextPage": "customer_address", "optional": false },
  // { "id": 4, "label": "addressDetails", "parent_id": 1, "link": "customer_address", "previousPage": "basic_details", "nextPage": "parents_spouse_details", "optional": false },
  // { "id": 6, "label": "parentsAndSpouseDetails", "parent_id": 1, "link": "parents_spouse_details", "previousPage": "customer_address", "nextPage": "professional_details", "optional": false },
  // { "id": 7, "label": "professionalDetails", "parent_id": 1, "link": "professional_details", "previousPage": "parents_spouse_details", "nextPage": "add_nominee", "optional": false },
  { "id": 8, "label": "Nominee", "parent_id": 0, "link": "add_nominee", "previousPage": "customer_personal_details", "nextPage": "investment_details", "optional": false },
  // { "id": 9, "label": "declaration", "parent_id": 0, "link": "declaration", "previousPage": "add_nominee", "nextPage": "investment_details", "optional": false },
  { "id": 10, "label": "investmentDetails", "parent_id": 0, "link": "investment_details", "previousPage": "add_nominee", "nextPage": "bank_details", "optional": false },
  { "id": 11, "label": "bankAccountDetails", "parent_id": 0, "link": "bank_details", "previousPage": "investment_details", "nextPage": "review_invest", "optional": false },
  { "id": 12, "label": "reviewAndInvest", "parent_id": 0, "link": "review_invest", "previousPage": "bank_details", "nextPage": "", "optional": false }
]
