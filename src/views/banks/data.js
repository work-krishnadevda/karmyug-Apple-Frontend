exports.data = [
  {
    fields: [
      {
        key: 'Branch Name',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Type of Case',
        type: 'select',
        options: ['FRESH LAP'],
        role: 'COO',
      },
      {
        key: 'Valuer Name',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Date of Visit',
        type: 'date',
        role: 'COO',
      },
      {
        key: 'Case Ref. No',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Valuation Report- Negative/Positive',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Date of Report',
        type: 'date',
        role: 'COO',
      },
      {
        key: 'Contacted Person for property inspection (Name/ Mobile)',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Applicant’s Name’s',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Originally type of property',
        type: 'select',
        options: ['Residential', 'Residential Cum Commercial', 'Commercial', 'Industrial'],
        role: 'COO',
      },
      {
        key: 'Current Usage',
        type: 'select',
        options: [
          'Under Construction',
          'Residential',
          'Residential Cum Commercial',
          'Commercial',
          'Industrial',
        ],
        role: 'COO',
      },
      {
        key: 'Address as per request',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Address at site',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Address as per document',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Name Of Document Holder',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Micro Location of Property',
        type: 'select',
        options: ['Residential', 'Residential Cum Commercial', 'Commercial', 'Industrial'],
        role: 'COO',
      },
      {
        key: 'Landmark',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Latitude',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Longitude',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Main Locality of the Property',
        type: 'select',
        options: ['Residential', 'Residential Cum Commercial', 'Commercial', 'Industrial'],
        role: 'COO',
      },
      {
        key: 'Sub Locality of the Property',
        type: 'select',
        options: ['Residential', 'Residential Cum Commercial', 'Commercial', 'Industrial'],
        role: 'COO',
      },
      {
        key: 'Has the valuator done valuation of this property before this? If yes, when, for whom?',
        type: 'select',
        options: ['yes', 'No'],
        role: 'COO',
      },
      {
        key: 'Building / Project Category of property',
        type: 'select',
        options: [
          'Apartment / Villas/ Row house /Individual House/Flat/Commercial Units/ Industrial Units',
        ],
        role: 'COO',
      },
      {
        key: 'Technical documents received',
        type: 'select',
        options: ['Complete', 'Partly', 'Nil'],
        role: 'COO',
      },
      {
        key: 'Building / Project amenities of property',
        type: 'select',
        options: ['Nil', 'average', 'good', 'excellent', 'Not Applicable'],
        role: 'COO',
      },
      {
        key: 'Type of Property - Main Type',
        type: 'select',
        options: ['Residential', 'Residential Cum Commercial', 'Commercial', 'Industrial'],
        role: 'COO',
      },
      {
        key: 'Type of Property - Sub-type',
        type: 'select',
        options: ['Residential', 'Residential Cum Commercial', 'Commercial', 'Industrial'],
        role: 'COO',
      },
      {
        key: 'Location - Locality',
        type: 'select',
        options: ['Low', 'Medium', 'Posh'],
        role: 'COO',
      },
      {
        key: 'Site is',
        type: 'select',
        options: ['Developed', 'Under Developed'],
        role: 'COO',
      },
      {
        key: 'Proximity to civic amenities/public transport - Railway Station',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Proximity to civic amenities/public transport - Bus Stop',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Property surrounding infrastructure and development',
        type: 'select',
        options: ['Developed', 'Under Developed'],
        role: 'COO',
      },
      {
        key: 'Distance from City Center',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Condition and approx. width of approach road to reach the property',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Is Approach road of the Property',
        type: 'select',
        options: [
          'Width >40ft',
          'Width 20 to 40ft',
          'Width 10 to 20ft',
          'Clear width <10ft',
          'Mud Road',
          'Illegal Road (Without document)',
        ],
        role: 'COO',
      },
      {
        key: 'Legal approach to the property as per documents',
        type: 'select',
        options: ['Clear', 'Not Clear'],
        role: 'DM',
      },
      {
        key: 'Any other features like board of other financier indicating mortgage, notice of Court/any authority which may affect the security',
        type: 'select',
        options: ['Yes', 'No', 'NA'],
        role: 'DM',
      },
      {
        key: 'Occupant Status',
        type: 'select',
        options: ['Vacant', 'Self Occupied', 'Rented', 'Self + Rented'],
        role: 'COO',
      },
      {
        key: 'Name of Occupant',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Relation with applicant',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Building details - Property Demarcation',
        type: 'select',
        options: ['Yes', 'No'],
        role: 'FE',
      },
      {
        key: 'Property Identified',
        type: 'select',
        options: ['Yes', 'No'],
        role: 'FE',
      },
      {
        key: 'Property Identified through',
        type: 'select',
        options: ['Provided Document', 'Local Enquiry'],
        role: 'FE',
      },
      {
        key: 'Type of structure',
        type: 'text',
        role: 'FE',
      },
      {
        key: 'Land/Plot Area',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'No of Blocks if applicable',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'No of Units on floor',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'No. of Floors',
        type: 'text',
        role: 'FE',
      },
      {
        key: 'No. of Lifts',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Delivery Agency',
        type: 'select',
        role: 'FE',
      },
      {
        key: 'Unit details - No. of rooms',
        type: 'select',
        options: ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK', '6BHK', '7BHK', '8BHK', '9BHK', '10BHK'],
        role: 'FE',
      },
      {
        key: 'Parking facilities is available',
        type: 'select',
        options: ['Yes', 'No'],
        role: 'FE',
      },
      {
        key: 'Property located on Floor Number.',
        type: 'text',
        role: 'FE',
      },
      {
        key: 'Age of the property',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Residual life',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Age of the property - DD',
        type: 'select',
        options: [
          'Under construction',
          'New Built (<1 years)',
          '1 to 4 Years',
          '5 to 10 Years',
          '11 to 20 Years',
          '21 to 30 Years',
          'Very old (>30 Years)',
          'Not Applicable',
        ],
        role: 'FE',
      },
      {
        key: 'Quality of construction - Exteriors',
        type: 'select',
        options: ['excellent', 'good', 'average', 'Nil', 'Not applicable'],
        role: 'FE',
      },
      {
        key: 'Quality of construction - Interiors',
        type: 'select',
        options: ['excellent', 'good', 'average', 'Nil', 'Not applicable'],
        role: 'FE',
      },
      {
        key: 'Additional Property Details - Type of property',
        type: 'select',
        options: ['normal flat', 'duplex', 'penthouse', 'Not Applicable'],
        role: 'FE',
      },
      {
        key: 'Remarks on view / Facing from property',
        type: 'select',
        options: [
          'normal view',
          'Sea or lake or river',
          'Garden or golf or monument',
          'internal project',
          'Slums, LIG',
          'Nalla or drain',
          'Cemetery or burial ground',
          'Not Applicable',
        ],
        role: 'FE',
      },

      {
        key: 'Setbacks - Deviation',
        type: 'select',
        options: ['Yes', 'No', 'NA'],
        role: 'FE',
      },
      {
        key: 'Area (in sq. ft.) - Carpet area as per measurement',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Area (in sq. ft.) - Built up area as per measurement',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Area (in sq. ft.) - Super built up area as per documents',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Area (in sq. ft.) - Terrace / Garden area (If Applicable)',
        type: 'text',
        role: 'FE',
      },
      {
        key: 'Area (in sq. ft.) - Total Area to considered',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Area (in sq. ft.) - Loading considered',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Deviations Details - Usage Deviations of Property',
        type: 'select',
        options: ['Yes', 'No'],
        role: 'FE',
      },
      {
        key: 'Is property with Horizontal Deviation',
        type: 'select',
        options: ['0 to 50%', '>50%', 'Not Applicable'],
        role: 'FE',
      },
      {
        key: 'Is Property with Vertical Deviation',
        type: 'select',
        options: ['1 floor', '2 floors', '3 &>3 Floors', 'Not Applicable'],
        role: 'FE',
      },
      {
        key: 'Tenement / Multi units’ deviation in the property',
        type: 'select',
        options: ['Yes', 'No'],
        role: 'FE',
      },

      {
        key: 'Valuation - Land Area',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Land Rate (Rs. per sq. ft.)',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Land Amount (Rs.)',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Construction Area (RCC)',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Construction rate (RCC)',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Construction Amount (RCC)',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Construction Area (Industrial Shed)',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Construction rate (Industrial Shed)',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Construction Amount (Industrial Shed)',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Applicable / Considered Area (SBUA)',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Rate (SBUA)',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Amount (SBUA)',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Sub Total Value of property',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Stage of construction in %',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Stage of Recommendation in %',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Car Parking',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - PLC',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - IDC',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - EDC',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Power Backup',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Other',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Total Amenities charges',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Total Market Value of Property as on Date',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Guideline Value of The Property',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Forced Sale Value (80%)',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Valuation - Approx. Rentals in case of 100% complete property',
        type: 'number',
        role: 'FE',
      },
      {
        key: 'Boundaries - EAST - As per deed',
        type: 'text',
        role: 'FE',
      },
      {
        key: 'Boundaries - EAST - At site',
        type: 'text',
        role: 'FE',
      },
      {
        key: 'Boundaries - WEST - As per deed & At site',
        type: 'text',
        role: 'FE',
      },
      {
        key: 'Boundaries - NORTH - As per deed & At site',
        type: 'text',
        role: 'FE',
      },
      {
        key: 'Boundaries - SOUTH - As per deed',
        type: 'text',
        role: 'FE',
      },
      {
        key: 'Boundaries - SOUTH - At site',
        type: 'text',
        role: 'FE',
      },
      {
        key: 'Boundaries Matching',
        type: 'select',
        options: ['yes', 'No'],
        role: 'FE',
      },
      {
        key: 'Remarks',
        type: 'textarea',
        role: 'FE',
      },
      {
        key: 'Name of Engineer who visited the property',
        type: 'text',
        role: 'FE',
      },
      {
        key: 'Date',
        type: 'date',
        role: 'FE',
      },
      {
        key: 'GPS Coordinates',
        type: 'text',
        role: 'COO',
      },
      {
        key: 'Name Of Applicant',
        type: 'text',
        role: 'COO',
      },

      {
        key: 'Landmark',
        type: 'text',
        page: 1,
        role: 'DM',
      },
      {
        key: 'Date of Report 19 04 2024',
        type: 'text',
        page: 1,
        role: 'DM',
      },
      {
        key: 'Name Of Document Holder',
        type: 'text',
        page: 1,
        role: 'DM',
      },
      {
        key: 'Proximity to civic amenities public transport',
        type: 'text',
        page: 2,
        role: 'DM',
      },
      {
        key: 'Side2 Right',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Remarks if any',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Carpet area as per measurement',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Carpet area as per documents',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Carpet Area as per sanction plan',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Built up area as per measurement',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Rear',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Side1 Left',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'As per plan Bye laws',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Built up area as per documents',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Actual at site Proposed',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Setbacks',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Built up area as per Sanction Plan',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Yes No NA',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Deviation',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Front',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'Property documents verified',
        type: 'text',
        page: 6,
        role: 'DM',
      },
      {
        key: 'For Property with Land Building',
        type: 'text',
        page: 7,
        role: 'DM',
      },
      {
        key: 'Is property in any Caution location like Costal Regulatory Zone Conservancy zones River line below High Tension Electric Line Negative areas Community Dominated areas Risk of Demolish by Road widening is Notified Not Applicable',
        type: 'text',
        page: 7,
        role: 'DM',
      },
      {
        key: 'Super built up area as per documents',
        type: 'text',
        page: 7,
        role: 'DM',
      },
      {
        key: 'Land Area',
        type: 'text',
        page: 7,
        role: 'DM',
      },
      {
        key: 'Less Depreciation',
        type: 'text',
        page: 7,
        role: 'DM',
      },
      {
        key: 'Construction rate RCC',
        type: 'text',
        page: 7,
        role: 'DM',
      },
      {
        key: 'Description',
        type: 'text',
        page: 7,
        role: 'DM',
      },
      {
        key: 'Sees eee Kee Dommone Niveercers Comets acer pe cemmere cm bed ee nemarlec aie cee Less Depreciation Tol ee eerie reese',
        type: 'text',
        page: 7,
        role: 'DM',
      },
      {
        key: 'Usage Deviations of Property Yes No',
        type: 'text',
        page: 7,
        role: 'DM',
      },
      {
        key: 'Boundaries Matching DD yes No Remarks',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'pp Total Amenities charges',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'Boundaries',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'BOUNDARIES',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'As per deed',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'Stage of construction in',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'For Property with SBUA',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'EAST',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'NORTH',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'WE Sil',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'Power Backup',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'Stage of Recommendation in',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'SOUTH',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'PLC',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'Approx Rentals in case of 100 complete property',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'Car Parking',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'Guideline Value of The Property',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'Boundaries Mi DD yes No Remarks',
        type: 'text',
        page: 8,
        role: 'DM',
      },
      {
        key: 'EDC',
        type: 'text',
        page: 8,
        role: 'DM',
      },
  
      {
        key: 'Main Locality of the Property ',
        type: 'select',
        options: ['Residential','Commercial'],
        page: 1,
        role: 'DM',
      },
      {
        key: 'Current Usage',
        type: 'select',
        options: [
          'Under,Construction','Residential','Residential,Cum,Commercial','Commercial','Industrial',
        ],
        page: 1,
        role: 'DM',
      },
      {
        key: 'Sub Locality of the Property ',
        type: 'select',
        options: ['Residential','Commercial'],
        page: 1,
        role: 'DM',
      },
  
      {
        key: 'Usage Deviations of Property',
        type: 'select',
        options: ['No','Yes'],
        page: 7,
        role: 'DM',
      },

      {
        key: 'Ownership Type',
        type: 'select',
        options: ['In The Name Of The Borrower', 'In The Name Of Other Then The Borrower'],
        page: 1,
        role: 'DM',
      },
      {
        key: 'Tenure',
        type: 'select',
        options: ['Freehold','Freehold','Perpetual','Lease'],
        page: 1,
        role: 'DM',
      },
    ],
    deleted_at: null,
    created_at: {
      $date: '2024-05-01T12:38:25.803Z',
    },
    updated_at: {
      $date: '2024-05-01T12:38:25.803Z',
    },
    __v: 0,
  },
]

















// {
//   image: 'http://mern.foduu.com:3036/images/2024/4/1714136988904-Screenshot from 2024-04-25 19-14-58.png'
//   image: 'http://mern.foduu.com:3036/images/2024/4/1714136989453-Screenshot from 2024-04-25 19-14-58.png'
//   image: 'http://mern.foduu.com:3036/images/2024/4/1714138103878-GSP_2023-24_SRCS.png'
//   image: 'http://mern.foduu.com:3036/images/2024/4/1714138533008-1713614325565-letter-f-in-orange-circle-vector-4199938.jpg'

//   remark: 'Hii broh this remark from my side you are very ..'
// }



// {
//   rrmark:'sjkhfsdahjkf',
//   images:[
//     {
//       image:
//         'http://mern.foduu.com:3036/images/2024/4/1714136988904-Screenshot from 2024-04-25 19-14-58.png',
//       position: 1,
//       page: 1,
//     },
//     {
//       image:
//         'http://mern.foduu.com:3036/images/2024/4/1714136989453-Screenshot from 2024-04-25 19-14-58.png',
  
//       position: 2,
//       page: 1,
//     },
//     {
//       image: 'http://mern.foduu.com:3036/images/2024/4/1714138103878-GSP_2023-24_SRCS.png',
//       position: 2,
//       page: 1,
//     },
//     {
//       image: 'http://mern.foduu.com:3036/images/2024/4/1714138103878-GSP_2023-24_SRCS.png',
//       position: 2,
//       page: 1,
//     },
  
//   ]
// }
