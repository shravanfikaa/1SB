export const eventData = {
  "<<distributorID>>": {
    "pages": {
      "<<PAGENAME>>": {
        "buttonClick": {
          "eventName": "<<EVENT NAME>>",
          "eventDetails": {}
        },
        "pageLoad": {
          "eventName": "<<EVENT NAME>>",
          "eventDetails": {}
        },
        "apiCall": {
          "eventName": "<<EVENT NAME>>",
          "eventDetails": {}
        }
      }
    }
  }
}

export const eventList = {
  ONESB: {
    pages: [
      "dashboard",
      "customer_personal_details",
      "basic_details",
      "contact_details",
      "customer_address",
      "parents_spouse_details",
      "professional_details",
      "fd_review",
      "add_nominee",
      "review_invest",
      "declaration",
      "investment_details",
      "bank_details",
      "after_review",
    ],
    events: ["buttonClick", "pageLoad", "apiCall"]
  }
}


export const eventLogger = {
  "HSL": {
    "pages": {
      "dashboard": {
        "button": {
          "eventName": "Dashboard button clicked",
          "eventDetails": {}
        },
        "onLoad": {
          "eventName": "Dashboard page loaded",
          "eventDetails": {}
        },
        "apiCall": {
          "eventName": "API call invoked on Dashboard page",
          "eventDetails": {}
        }
      },
      "productDetails": {
        "button": {
          "eventName": "Invest button clicked",
          "eventDetails": {}
        },
        "onLoad": {
          "eventName": "Dashboard page loaded",
          "eventDetails": {}
        },
        "apiCall": {
          "eventName": "API call invoked on Dashboard page",
          "eventDetails": {}
        }
      },
      "compareProducts": {
        "button": {
          "eventName": "CompareProducts button clicked",
          "eventDetails": {}
        },
        "onLoad": {
          "eventName": "Compare products page loaded",
          "eventDetails": {}
        },
        "apiCall": {
          "eventName": "API call invoked on Compare products page",
          "eventDetails": {}
        }
      },
      "personalDetails": {
        "button": {
          "eventName": "Personal detals button clicked",
          "eventDetails": {}
        },
        "onLoad": {
          "eventName": "Personal detals page loaded",
          "eventDetails": {}
        },
        "apiCall": {
          "eventName": "API call invoked on Personal detals page",
          "eventDetails": {}
        }
      },
      "myProfile": {
        "button": {}, // Keep it blank or remove this 'button' key if not required to capture any events for button click
        "onLoad": {
          "eventName": "My profile page loaded",
          "eventDetails": {}
        },
        "apiCall": {
          "eventName": "API call invoked on My profile page",
          "eventDetails": {}
        }
      }
    }
  },
  "IIFL": {
    "pages": {
      "dashboard": {
        "button": {
          "eventName": "Dashboard button clicked",
          "eventDetails": {}
        },
        "onLoad": {
          "eventName": "Dashboard page loaded",
          "eventDetails": {}
        },
        "apiCall": {
          "eventName": "API call invoked on Dashboard page",
          "eventDetails": {}
        }
      },
      "productDetails": {
        "button": {
          "eventName": "Invest button clicked",
          "eventDetails": {}
        },
        "onLoad": {
          "eventName": "Dashboard page loaded",
          "eventDetails": {}
        },
        "apiCall": {
          "eventName": "API call invoked on Dashboard page",
          "eventDetails": {}
        }
      },
      "compareProducts": {
        "button": {
          "eventName": "CompareProducts button clicked",
          "eventDetails": {}
        },
        "onLoad": {
          "eventName": "Compare products page loaded",
          "eventDetails": {}
        },
        "apiCall": {
          "eventName": "API call invoked on Compare products page",
          "eventDetails": {}
        }
      },
      "personalDetails": {
        "button": {
          "eventName": "Personal detals button clicked",
          "eventDetails": {}
        },
        "onLoad": {
          "eventName": "Personal detals page loaded",
          "eventDetails": {}
        },
        "apiCall": {
          "eventName": "API call invoked on Personal detals page",
          "eventDetails": {}
        }
      },
      "myProfile": {
        "button": {
          "eventName": "My profile page button clicked",
          "eventDetails": {}
        },
        "onLoad": {},// Keep it blank or remove this 'button' key if not required to capture any events for button click
        "apiCall": {}// Keep it blank or remove this 'button' key if not required to capture any events for button click
      }
    }
  }
}