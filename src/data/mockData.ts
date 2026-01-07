export interface EvacuationCenter {
  id: number;
  name: string;
  barangay: string;
  capacity: number;
  contactPerson: string;
  contactNumber: string;
  status: "Available" | "Full";
}

export interface Hotline {
  id: number;
  agency: string;
  description?: string;
  contacts: {
    label: string;
    value: string;
  }[];
  socials?: {
    platform: "Facebook" | "Email";
    value: string;
  }[];
  type: "National" | "Local";
}

export interface User {
  id: number;
  username: string;
  email: string;
  contactNumber: string;
  barangay: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  avatarUrl: string;
  status: "Safe" | "Need Assistance" | "Evacuated";
}

// --- PLACEHOLDER DATA ---

export const MOCK_EVACUATION_CENTERS: EvacuationCenter[] = [
  {
    id: 1,
    name: "Tañong High School",
    barangay: "Tañong",
    capacity: 500,
    contactPerson: "Mr. Richard Federico",
    contactNumber: "0917-123-4567",
    status: "Available",
  },
  {
    id: 2,
    name: "H. Bautista Elementary School",
    barangay: "Concepcion Uno",
    capacity: 2725,
    contactPerson: "Mr. Julius Divinagracia",
    contactNumber: "0998-987-6543",
    status: "Full",
  },
  {
    id: 3,
    name: "Marikina Elementary School",
    barangay: "Sta. Elena",
    capacity: 1950,
    contactPerson: "Mr. John Carlo Layesa",
    contactNumber: "0917-555-0199",
    status: "Available",
  }
];

export const MOCK_HOTLINES: Hotline[] = [
  {
    id: 1,
    agency: "National Emergency Hotline",
    type: "National",
    description: "For police, fire, and medical assistance",
    contacts: [
      { label: "Emergency", value: "911" }
    ]
  },
  {
    id: 2,
    agency: "NDRRMC",
    type: "National",
    description: "Disaster preparedness, response, and recovery coordination",
    contacts: [
      { label: "Trunkline", value: "(02) 8911-5061 to 65 loc 100" },
      { label: "Operations", value: "(02) 8911-1406" },
      { label: "Operations", value: "(02) 8912-2665" },
      { label: "Operations", value: "(02) 8912-5668" },
      { label: "Operations", value: "(02) 8911-1873" }
    ]
  },
  {
    id: 3,
    agency: "Philippine Red Cross",
    type: "National",
    description: "Humanitarian organization, disaster relief, and blood donation",
    contacts: [
      { label: "Hotline", value: "143" },
      { label: "National Blood Ctr", value: "(02) 8527-8385 to 95" },
      { label: "Trunkline", value: "(02) 8527-0000" },
      { label: "Trunkline", value: "(02) 8790-2300" }
    ]
  },
  {
    id: 4,
    agency: "Marikina City Emergency Hotline",
    type: "Local",
    description: "City Command Center & Rescue",
    contacts: [
      { label: "Rescue (Police/Fire)", value: "161" },
      { label: "Command Center", value: "(02) 8646-0427" },
      { label: "City Hall", value: "(02) 8646-1631" },
      { label: "Direct Line", value: "(02) 8646-2436 to 38" }
    ]
  },
  {
    id: 5,
    agency: "Marikina Rescue 161 (Direct)",
    type: "Local",
    description: "Dedicated Rescue Unit Mobile & Landlines",
    contacts: [
      { label: "PLDT", value: "8-646-2436 to 38" },
      { label: "PLDT", value: "8-646-0427" },
      { label: "GLOBE Landline", value: "7-273-6563" },
      { label: "GLOBE Mobile", value: "0917-584-2168" },
      { label: "GLOBE Mobile", value: "0917-804-6352" },
      { label: "SMART Mobile", value: "0928-559-3341" },
      { label: "SMART Mobile", value: "0998-997-0115" },
      { label: "SMART Mobile", value: "0998-579-6435" }
    ],
    socials: [
      { platform: "Facebook", value: "Reskyu Onesixone" },
      { platform: "Facebook", value: "Marikina City Rescue 161" },
      { platform: "Email", value: "drrmo.marikinacity@gmail.com" }
    ]
  }
];

export const MOCK_USER: User = {
  id: 101,
  username: "JuanDelaCruz",
  email: "juan.delacruz@student.pup.edu.ph",
  contactNumber: "0917-111-2222",
  barangay: "Malanday",
  age: 21,
  gender: "Male",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  status: "Safe"
};