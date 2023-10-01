export const questions = [
  {
    section: 'Startup Identifier Information',
    uid: 'startupIdentifier',
    questions: [
      {
        uid: 'startupName',
        question: '1. Startup Name as per Incorporation',
        answer_type: 'text',
      },
      {
        uid: 'companyLogo',
        question: '2. Please provide the company Logo',
        answer_type: 'startup_logo',
      },
      {
        uid: 'summarizedParagraph',
        question: '3. Provide a brief summarized paragraph about your startup',
        answer_type: 'text',
      },

      {
        uid: 'registeredAddress',
        question: '4. Registered Address',
        answer_type: 'text',
      },
      {
        uid: 'cin',
        question: '5. Company Identification Number (CIN)',
        answer_type: 'text',
      },
      {
        uid: 'incorporationDate',
        question: '6. Incorporation Date',
        answer_type: 'date',
      },
      {
        uid: 'numEmployees',
        question: '7. Number of Employees',
        answer_type: 'number',
      },
      {
        uid: 'fullTimeEmployees',
        question: 'a. Full-time employees?',
        style: { paddingLeft: 16 },
        answer_type: 'number',
      },
      {
        uid: 'partTimeEmployees',
        question: 'b. Part-time employees?',
        style: { paddingLeft: 16 },
        answer_type: 'number',
      },
    ],
  },
  {
    section: 'Basic Founder Details',
    uid: 'founderDetails',
    questions: [
      {
        uid: 'founderPhotos',
        question: '9. Upload Founder Photos',
        answer_type: 'images',
      },
      {
        uid: 'founderBiographies',
        question: '9. Upload Biographies of the Founders',
        answer_type: 'files',
      },
      {
        uid: 'founderLinkedInProfiles',
        question: '10. LinkedIn Profiles of Founders',
        answer_type: 'text',
      },
      {
        uid: 'aadharCard',
        question: '11. Upload Aadhar Card',
        answer_type: 'file',
      },
      { uid: 'panCard', question: '12. Upload Pan Card', answer_type: 'file' },
    ],
  },
  {
    section: 'Digital Presence',
    uid: 'digitalPresence',
    questions: [
      {
        uid: 'mobileAppLink',
        question:
          '13. If applicable, provide a link to your startup’s mobile application',
        answer_type: 'text',
      },
      {
        uid: 'websiteLink',
        question: '14. If applicable, provide a link to your website',
        answer_type: 'text',
      },
      {
        uid: 'linkedinCompanyWebsite',
        question: '15. LinkedIn website of Company',
        answer_type: 'text',
      },
    ],
  },
  {
    section: 'Pitch your startup',
    uid: 'pitchYourStartup',
    questions: [
      {
        uid: 'elevatorPitch',
        question: '16. Elevator pitch - 90 seconds',
        answer_type: 'video',
      },
    ],
  },

  {
    section: 'Characteristics of startup',
    uid: 'startupCharacteristics',
    questions: [
      {
        uid: 'stageOfStartup',
        question: '17. Stage of the startup',
        answer_type: 'dropdown',
        meta_data: [
          {
            label: 'IDEATION',
            key: 'IDEATION',
          },
          {
            label: 'PROTOTYPING',
            key: 'PROTOTYPING',
          },
          {
            label: 'MINIMUM VIABLE PRODUCT (MVP)',
            key: 'MVP',
          },
          {
            label: 'PRODUCT MARKET FIT (PMF)',
            key: 'PMF',
          },
        ],
      },
      {
        uid: 'startupNature',
        question: '18. Please define the nature of your startup',
        answer_type: 'dropdown',
        meta_data: [
          {
            label: 'INNOVATIVE AND SCALABLE',
            key: 'IAS',
          },
          {
            label: 'ONLY INNOVATIVE',
            key: 'INNOVATIVE',
          },
          {
            label: 'ONLY SCALABLE',
            key: 'SCALABLE',
          },
        ],
      },
      {
        uid: 'problemToSolve',
        question: '19. What problem does the startup aim to solve?',
        answer_type: 'text',
      },
      {
        uid: 'valueProposition',
        question:
          '20. Please explain the value proposition that the startup envisions providing to its customers',
        answer_type: 'text',
      },
      {
        uid: 'uniquenessOfSolution',
        question: '21. What is the uniqueness of the solution?',
        answer_type: 'text',
      },
      {
        uid: 'uniqueSellingPoints',
        question:
          '22. Please explain the unique selling points of your startup and its products/services',
        answer_type: 'text',
      },
      {
        uid: 'targetCustomerSegment',
        question:
          '23. Please state and explain the target customer segment your startup is focusing on',
        answer_type: 'text',
      },
      {
        uid: 'keyCompetitors',
        question:
          '24. Provide information about your key competitors in the business',
        answer_type: 'text',
      },
      {
        uid: 'startupScaling',
        question:
          '25. How do you plan to scale up your startup in the next three to five years?',
        answer_type: 'text',
      },
      {
        uid: 'revenueModel',
        question: '26. Can you please explain the startup revenue model?',
        answer_type: 'text',
      },
    ],
  },
  {
    section: 'Key Performance Metrics for Business',
    uid: 'keyPerformanceMetrics',
    questions: [
      { uid: 'metric1', question: 'Metric 1', answer_type: 'text' },
      { uid: 'metric2', question: 'Metric 2', answer_type: 'text' },
      { uid: 'metric3', question: 'Metric 3', answer_type: 'text' },
      { uid: 'metric4', question: 'Metric 4', answer_type: 'text' },
    ],
  },
  {
    section: 'Achievements',
    uid: 'achievements',
    questions: [
      {
        uid: 'recognitionOrRewards',
        question:
          '27. Any recognition or rewards received by the startup? (Yes/No) If yes, please explain',
        answer_type: 'text',
      },
    ],
  },
  {
    section: 'Incubator Fund Deployment Plan',
    uid: 'fundDeploymentPlan',
    questions: [
      {
        uid: 'expenseBracket',
        question: 'Expense Bracket',
        answer_type: 'text',
      },
      {
        uid: 'expenseAmount',
        question: 'Expense Amount',
        answer_type: 'number',
      },
      {
        uid: 'deploymentStartDate',
        question: 'Planned Deployment Start Date',
        answer_type: 'date',
      },
      {
        uid: 'deploymentEndDate',
        question: 'Planned Deployment End Date',
        answer_type: 'date',
      },
    ],
  },
  {
    section: 'Funding Details',
    uid: 'fundingDetails',
    questions: [
      {
        uid: 'fundingReceived',
        question: '28. Has your startup received any funding? (Yes/No)',
        answer_type: 'dropdown',
        meta_data: [
          {
            label: 'Yes',
            key: 'YES',
          },
          {
            label: 'No',
            key: 'NO',
          },
        ],
      },
      {
        uid: 'fundingDetailsInfo',
        question: '29. Please provide funding details relating to the below:',
        answer_type: 'text',
        subQuestions: [
          {
            uid: 'amountRaised',
            question: 'i) Amount Raised',
            answer_type: 'number',
          },
          {
            uid: 'dateOfRaise',
            question: 'ii) Date of Raise',
            answer_type: 'date',
          },
          {
            uid: 'stakeDiluted',
            question: 'iii) % Stake Diluted',
            answer_type: 'number',
          },
          {
            uid: 'investorInfo',
            question: 'iv) Investor Information',
            answer_type: 'text',
          },
          {
            uid: 'valuation',
            question: 'v) Valuation [pre money]',
            answer_type: 'number',
          },
        ],
      },
    ],
  },
  {
    section: 'Intellectual Property',
    uid: 'intellectualProperty',
    questions: [
      {
        uid: 'ipRights',
        question:
          '30. Does the startup have any intellectual property rights? If yes, please explain',
        answer_type: 'text',
      },
    ],
  },
  {
    section: 'Other Questions',
    uid: 'customQuestions',
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center',
    },
    questions: [
      {
        uid: 'customQuestion1',
        number: '1. ',
        question: '',
        answer_type: 'text',
      },
      {
        uid: 'customQuestion2',
        number: '2. ',
        question: '',
        answer_type: 'text',
      },
      {
        uid: 'customQuestion3',
        number: '3. ',
        question: '',
        answer_type: 'text',
      },
    ],
  },
];

export const startupProfileQuestions = [
  {
    section: 'Company Details',
    uid: 'startupIdentifier',
    questions: [
      {
        uid: 'startupName',
        question: 'Startup Name as per Incorporation',
        answer_type: 'text',
      },
      // {
      //   uid: 'companyLogo',
      //   question: '2. Please provide the company Logo',
      //   answer_type: 'startup_logo',
      // },
      {
        uid: 'dpiitNumber',
        question: 'DPIIT  Number',
        answer_type: 'basicInfoField',
        field_name: 'dpiitNumber',
      },
      {
        uid: 'industrySegment',
        question: 'Industry Segment',
        answer_type: 'basicInfoField',
        field_name: 'industrySegment',
      },
      {
        uid: 'registeredAddress',
        question: 'Registered Address',
        answer_type: 'text',
      },

      // {
      //   uid: 'summarizedParagraph',
      //   question: '3. Provide a brief summarized paragraph about your startup',
      //   answer_type: 'text',
      // },

      {
        uid: 'cin',
        question: 'Company Identification Number (CIN)',
        answer_type: 'text',
      },
      {
        uid: 'incorporationDate',
        question: 'Incorporation Date',
        answer_type: 'date',
      },
      {
        uid: 'numEmployees',
        question: 'Number of Employees',
        answer_type: 'number',
      },
      {
        uid: 'fullTimeEmployees',
        question: 'a. Full-time employees?',
        style: { paddingLeft: 16 },
        answer_type: 'number',
      },
      {
        uid: 'partTimeEmployees',
        question: 'b. Part-time employees?',
        style: { paddingLeft: 16 },
        answer_type: 'number',
      },
    ],
  },
  {
    section: 'Founder Information',
    uid: 'founderDetails',
    questions: [
      {
        uid: 'founders',
        question: 'Founders',
        answer_type: 'founderDetails',
      },
      {
        uid: 'founderPhotos',
        question: `Founder's Photos`,
        answer_type: 'images',
      },
      {
        uid: 'founderBiographies',
        question: 'Biographies of Founders',
        answer_type: 'files',
      },
      {
        uid: 'founderLinkedInProfiles',
        question: 'LinkedIn Profiles of Founders',
        answer_type: 'text',
      },
      {
        uid: 'aadharCard',
        question: 'Aadhar Card',
        answer_type: 'file',
      },
      { uid: 'panCard', question: 'Pan Card', answer_type: 'file' },
    ],
  },

  {
    section: 'Digital Presence',
    uid: 'digitalPresence',
    questions: [
      {
        uid: 'mobileAppLink',
        question: 'Mobile Application',
        answer_type: 'text',
      },
      {
        uid: 'websiteLink',
        question: 'Website',
        answer_type: 'text',
      },
      {
        uid: 'linkedinCompanyWebsite',
        question: 'LinkedIn Company Page',
        answer_type: 'text',
      },
    ],
  },
  {
    section: 'Pitch your startup',
    uid: 'pitchYourStartup',
    questions: [
      {
        uid: 'elevatorPitch',
        question: 'Elevator pitch',
        answer_type: 'video',
      },
    ],
  },

  {
    section: 'Characteristics of Startup',
    uid: 'startupCharacteristics',
    questions: [
      {
        uid: 'stageOfStartup',
        question: 'Stage',
        answer_type: 'dropdown',
        meta_data: [
          {
            label: 'IDEATION',
            key: 'IDEATION',
          },
          {
            label: 'PROTOTYPING',
            key: 'PROTOTYPING',
          },
          {
            label: 'MINIMUM VIABLE PRODUCT (MVP)',
            key: 'MVP',
          },
          {
            label: 'PRODUCT MARKET FIT (PMF)',
            key: 'PMF',
          },
        ],
      },
      {
        uid: 'startupNature',
        question: 'Nature',
        answer_type: 'dropdown',
        meta_data: [
          {
            label: 'INNOVATIVE AND SCALABLE',
            key: 'IAS',
          },
          {
            label: 'ONLY INNOVATIVE',
            key: 'INNOVATIVE',
          },
          {
            label: 'ONLY SCALABLE',
            key: 'SCALABLE',
          },
        ],
      },
      {
        uid: 'problemToSolve',
        question: 'Problem',
        answer_type: 'text',
      },
      {
        uid: 'valueProposition',
        question: 'Value proposition',
        answer_type: 'text',
      },
      // {
      //   uid: 'uniquenessOfSolution',
      //   question: '21. What is the uniqueness of the solution?',
      //   answer_type: 'text',
      // },
      {
        uid: 'uniqueSellingPoints',
        question: 'Unique Selling Points',
        answer_type: 'text',
      },
      {
        uid: 'targetCustomerSegment',
        question: 'Target Customer Segment',
        answer_type: 'text',
      },
      {
        uid: 'keyCompetitors',
        question: 'Key Competitors',
        answer_type: 'text',
      },
      {
        uid: 'startupScaling',
        question: 'Scaling Plan',
        answer_type: 'text',
      },
      {
        uid: 'revenueModel',
        question: 'Revenue Model',
        answer_type: 'text',
      },
    ],
  },
  // {
  //   section: 'Key Performance Metrics for Business',
  //   uid: 'keyPerformanceMetrics',
  //   questions: [
  //     { uid: 'metric1', question: 'Metric 1', answer_type: 'text' },
  //     { uid: 'metric2', question: 'Metric 2', answer_type: 'text' },
  //     { uid: 'metric3', question: 'Metric 3', answer_type: 'text' },
  //     { uid: 'metric4', question: 'Metric 4', answer_type: 'text' },
  //   ],
  // },

  {
    section: 'Incubator Fund Deployment Plan',
    uid: 'fundDeploymentPlan',
    questions: [
      {
        uid: 'expenseBracket',
        question: 'Expense Bracket',
        answer_type: 'text',
      },
      {
        uid: 'expenseAmount',
        question: 'Expense Amount',
        answer_type: 'number',
      },
      {
        uid: 'deploymentStartDate',
        question: 'Planned Deployment Start Date',
        answer_type: 'date',
      },
      {
        uid: 'deploymentEndDate',
        question: 'Planned Deployment End Date',
        answer_type: 'date',
      },
    ],
  },
  {
    section: 'Funding Details',
    uid: 'fundingDetails',
    questions: [
      {
        uid: 'fundingReceived',
        question: 'Received funding? (Yes/No)',
        answer_type: 'dropdown',
        meta_data: [
          {
            label: 'Yes',
            key: 'YES',
          },
          {
            label: 'No',
            key: 'NO',
          },
        ],
      },
      {
        uid: 'fundingDetailsInfo',
        question: 'Funding details',
        answer_type: 'text',
        subQuestions: [
          {
            uid: 'amountRaised',
            question: 'Amount Raised',
            answer_type: 'number',
          },
          {
            uid: 'dateOfRaise',
            question: 'Date of Raise',
            answer_type: 'date',
          },
          {
            uid: 'stakeDiluted',
            question: ' % Stake Diluted',
            answer_type: 'number',
          },
          {
            uid: 'investorInfo',
            question: 'Investor Information',
            answer_type: 'text',
          },
          // {
          //   uid: 'valuation',
          //   question: 'v) Valuation [pre money]',
          //   answer_type: 'number',
          // },
        ],
      },
    ],
  },
  {
    section: 'Intellectual Property',
    uid: 'intellectualProperty',
    questions: [
      {
        uid: 'ipRights',
        question: 'Intellectual property rights',
        answer_type: 'text',
      },
    ],
  },
  {
    section: 'Achievements',
    uid: 'achievements',
    questions: [
      {
        uid: 'recognitionOrRewards',
        question: 'Recognition/Rewards',
        answer_type: 'text',
      },
    ],
  },
  {
    section: 'Other Questions',
    uid: 'customQuestions',
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center',
    },
    questions: [
      {
        uid: 'customQuestion1',
        number: '1. ',
        question: '',
        answer_type: 'text',
      },
      {
        uid: 'customQuestion2',
        number: '2. ',
        question: '',
        answer_type: 'text',
      },
      {
        uid: 'customQuestion3',
        number: '3. ',
        question: '',
        answer_type: 'text',
      },
    ],
  },
];
