import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';
import './EmergencyHotlines.css';
import { useAuth } from '../hooks/useAuth';

import icon from '../assets/icon-call.svg';

// Define proper types
interface HotlineSection {
  label?: string;
  type?:  'main' | 'alert' | 'secondary' | 'sectionLabel';
  text?: string;
  divider?: boolean;
}

interface HotlineItem {
  title: string;
  sections: HotlineSection[];
  type?:  'sectionLabel';
  text?: string;
}

interface DistrictHotlines {
  district1: HotlineItem[];
  district2: HotlineItem[];
}

interface HotlinesData {
  general: HotlineItem[];
  marikina: HotlineItem[];
  barangay: DistrictHotlines;
  evacuation: DistrictHotlines;
}

const HOTLINES: HotlinesData = {
    general: [
        {
        title: 'NATIONAL EMERGENCY HOTLINE',
        sections: [
            { label: 'MAIN OPERATIONS HOTLINE' },
            { type: 'main', text: 'Call 911' },
        ],
        },

        {
            title: 'NATIONAL DISASTER RISK REDUCTION AND MANAGEMENT COUNCIL (NDRRMC)',
            sections: [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text: 'Call (02) 8911-5061 to 65' },
                { divider: true },
                { label: 'OTHER LANDLINE HOTLINES' },
                { type:  'secondary', text: 'Call (02) 8911-1406' },
                { type: 'secondary', text: 'Call (02) 8912-2665' },
                { type: 'secondary', text: 'Call (02) 8912-5668' },
                { type: 'secondary', text: 'Call (02) 8911-1873' },
            ],
        },

        {
            title: 'PHILIPPINE RED CROSS',
            sections: [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text:  'Call 143' },
                { divider: true },
                { label: 'NATIONAL BLOOD CENTER' },
                { type: 'alert', text: 'Call (02) 8527-8385 to 95' },
                { divider: true },
                { label: 'ADMINISTRATIVE LINES' },
                { type: 'secondary', text: 'Call (02) 8527-000' },
                { type: 'secondary', text: 'Call (02) 8790-2300' },
            ],
        },

        {
            title: 'DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT (DSWD)',
            sections:  [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text: 'Call (02) 931-81-01 to 07' },
                { divider:  true },
                { label: 'DISASTER RESPONSE UNIT' },
                { type: 'alert', text: 'Call (02) 8856-3665' },
                { type: 'alert', text: 'Call (02) 8852-8081' },
                { divider:  true },
                { label: 'OTHER LINES' },
                { type: 'secondary', text: 'Call/Text 0918-912-813' },
            ],
        },

        {
            title: 'PHILIPPINE ATMOSPHERIC, GEOPHYSICAL AND ASTRONOMICAL SERVICES ADMINISTRATION (PAGASA)',
            sections: [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text: 'Call (02) 8284-0800' },
            ],
        },

        {
            title: 'PHILIPPINE INSTITUTE OF VOLCANOLOGY AND SEISMOLOGY (PHIVOLCS)',
            sections: [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text: 'Call (02) 8426-1468 to 79' },
            ],
        },

        {
            title: 'METRO MANILA DEVELOPMENT AUTHORITY (MMDA)',
            sections: [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text: 'Call 136' },
                { divider: true },
                { label: 'OTHER LANDLINE HOTLINES' },
                { type: 'secondary', text: 'Call (02) 8882-4151 to 77' },
            ],
        },

        {
            title: 'BUREAU OF FIRE PROTECTION (BFP)',
            sections: [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text: 'Call (02) 8426-0219' },
                { divider: true },
                { label: 'OTHER LANDLINE HOTLINES' },
                { type: 'secondary', text: 'Call (02) 8426-0246' },
            ],
        },

        {
            title: 'PHILIPPINE COAST GUARD',
            sections: [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text:  'Call (02) 8527-8481 to 89' },
                { divider:  true },
                { label: 'OTHER LANDLINE HOTLINES' },
                { type: 'secondary', text: 'Call (02) 8527-3877' },
                { type: 'secondary', text: 'Call (02) 8527-3880 to 85' },
                { type: 'secondary', text: 'Call/Text 0917-724-3682' },
                { type: 'secondary', text: 'Call/Text 0918-967-4697' },
            ],
        },

        {
            title: 'MANILA WATER',
            sections: [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text:  'Call 1627' },
            ],
        },

        {
            title: 'PHILIPPINE NATIONAL POLICE (PNP)',
            sections:  [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text: 'Call 117' },
                { divider:  true },
                { label: 'OTHER LANDLINE HOTLINES' },
                { type: 'secondary', text: 'Call (02) 8722-0650' },
                { type: 'secondary', text: 'Call 0917-847-5757' },
            ],
        },

        {
            title: 'MERALCO',
            sections: [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text:  'Call (02) 16211' },
                { divider: true },
                { label: 'OTHER LANDLINE HOTLINES' },
                { type: 'secondary', text: 'Call 0920-971-6211' },
                { type: 'secondary', text: 'Call 0917-551-6211' },
            ],
        },
    ],

    marikina: [
        {
            title: 'MARIKINA CITY RESCUE',
            sections: [
                { label: 'POLICE/FIRE OPERATION HOTLINE' },
                { type: 'main', text: 'Call 161' },
            ],
        },

        {
            title: 'MARIKINA COMMAND CENTER',
            sections: [
                { label: 'MAIN OPERATION HOTLINE' },
                { type: 'main', text:  'Call (02) 8646-0427' },
            ],
        },

        {
            title: 'MARIKINA CITY',
            sections: [
                { label: 'MAIN OPERATION HOTLINE' },
                { type: 'main', text:  'Call (02) 8646-1631' },
            ],
        },

        {
            title: 'VOLUNTEERS MANAGEMENT OFFICE (VMO) OF MARIKINA',
            sections: [
                { label: 'MAIN OPERATION HOTLINE' },
                { type: 'main', text: 'Call 647-4421' },
            ],
        },

        {
            title: 'DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT (DSWD) OF MARIKINA',
            sections: [
                { label: 'MAIN OPERATION HOTLINE' },
                { type: 'main', text: 'Call 369-4132' },
            ],
        },

        {
            title: 'OFFICE OF PUBLIC SAFETY AND SECURITY (OPSS) OF MARIKINA',
            sections: [
                { label: 'MAIN OPERATION HOTLINE' },
                { type: 'main', text: 'Call 682-9572' },
            ],
        },

        {
            title: 'MARIKINA LANDLINE HOTLINES (PLDT)',
            sections: [
                { label: 'PLDT' },
                { type: 'main', text: 'Call 8-646-2436 to 38' },
            ],
        },
        
        {
            title: 'MARIKINA LANDLINE HOTLINES (GLOBE)',
            sections: [
                { label: 'GLOBE' },
                { type: 'main', text: 'Call 7-273-6563' },
            ],
        },

        {
            title: 'MARIKINA CITY HEALTH OFFICE',
            sections: [
                { label: 'MAIN OPERATION HOTLINE' },
                { type: 'main', text: 'Call 997-1108' },
                { type: 'main', text: 'Call 942-2359' },
            ],
        },

        {
            title: 'MARIKINA MOBILE HOTLINES',
            sections: [
                { label: 'GLOBE' },
                { type: 'secondary', text: 'Call 0917-584-2168' },
                { type: 'secondary', text: 'Text 0917-584-2168' },
                { type: 'secondary', text: 'Call 0917-804-6352' },
                { type: 'secondary', text: 'Text 0917-804-6352' },

                { divider: true },

                { label: 'SMART' },
                { type: 'secondary', text: 'Call 0928-559-3341' },
                { type: 'secondary', text: 'Text 0928-559-3341' },
                { type: 'secondary', text: 'Call 0998-579-6435' },
                { type: 'secondary', text: 'Text 0998-579-6435' },
                { type: 'secondary', text: 'Call 0998-997-0115' },
                { type: 'secondary', text: 'Text 0998-997-0115' },
            ],
        },
    ],

    barangay:  {
        district1: [
            {
                title: 'BARANGAY BARANGKA',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 997-4951' },
                    { type: 'secondary', text: 'Text 997-4951' },
                ],
            },

            {
                title: 'BARANGAY INDUSTRIAL VALLEY',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 369-5833' },
                    { type: 'secondary', text: 'Text 369-5833' },
                ],
            },

            {
                title: 'BARANGAY JESUS DELA PEÑA',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 89486963' },
                    { type: 'secondary', text: 'Text 89486963' },
                ],
            },

            {
                title: 'BARANGAY KALUMPANG',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 647-7205' },
                    { type: 'secondary', text: 'Text 647-7205' },
                ],
            },

            {
                title: 'BARANGAY MALANDAY',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 0289421346' },
                    { type: 'secondary', text: 'Text 0289421346' },
                ],
            },

            {
                title: 'BARANGAY SAN ROQUE',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 646-8479' },
                    { type: 'secondary', text: 'Text 646-8479' },
                ],
            },

            {
                title: 'BARANGAY STA. ELENA',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 8646-1877' },
                    { type: 'secondary', text: 'Text 8646-1877' },
                    { type: 'main', text: 'Call 8682-4423' },
                    { type: 'secondary', text: 'Text 8682-4423' },
                ],
            },

            {
                title: 'BARANGAY STO. NIÑO',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call (02) 5349 703' },
                    { type: 'secondary', text: 'Text (02) 5349 703' },
                ],
            },

            {
                title: 'BARANGAY TAÑONG',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 8477 8853' },
                    { type: 'secondary', text: 'Text 8477 8853' },
                ],
            },
        ],

        district2: [
            {
                title: 'BARANGAY CONCEPCION UNO',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 948-6454' },
                    { type: 'secondary', text: 'Text 948-6454' },
                ],
            },

            {
                title: 'BARANGAY CONCEPCION DOS',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 942-0599' },
                    { type: 'secondary', text: 'Text 942-0599' },
                ],
            },

            {
                title: 'BARANGAY FORTUNE',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 480-7368' },
                    { type: 'secondary', text: 'Text 480-7368' },
                ],
            },

            {
                title: 'BARANGAY MARIKINA HEIGHTS',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 942-0572' },
                    { type: 'secondary', text: 'Text 942-0572' },
                ],
            },

            {
                title: 'BARANGAY NANGKA',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 7934-8626' },
                    { type: 'secondary', text: 'Text 7934-8626' },
                    { type: 'main', text: 'Call 7934-8625' },
                    { type: 'secondary', text: 'Text 7934-8625' }
                ],
            },

            {
                title: 'BARANGAY TUMANA',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 477-3817' },
                    { type: 'secondary', text: 'Text 477-3817' },
                ],
            },

            {
                title: 'BARANGAY PARANG',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 451-1291' },
                    { type: 'secondary', text: 'Text 451-1291' },
                ],
            },
        ],
    },
    
    evacuation: {
        district1: [
            {
                title:  'MALANDAY ELEMENTARY SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 950-4630' },
                ],
            },
            
            {
                title: 'STO. NIÑO ELEMENTARY SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 621-7031' },
                ],
            },

            {
                title: 'STO. NIÑO NATIONAL HIGH SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 934-0257' },
                ],
            },

            {
                title: 'LEODEGARIO VICTORINO ELEMENTARY SCHOOL',
                sections: [
                    { label:  'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 945-6621' },
                ],
            },
            
            {
                title: 'SAMPAGUITA GYM',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call (02) 8942-0129' },
                ],
            },

            {
                title: 'MARIKINA ELEMENTARY SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text:  'Call 646-1738' },
                ],
            },
            {
                title: 'STA ELENA HIGH SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 646-9793' },
                ],
            },
            
            {
                title: 'KALUMPANG ELEMENTARY SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call (02) 7799-6013' },
                ],
            },

            {
                title: 'KALUMPANG NHS',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 358-9135' },
                ],
            },
            
            {
                title:  'SAN ROQUE ELEMENTARY SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 645-3235' },
                ],
            },
            {
                title: 'SAN ROQUE NATIONAL HIGH SCHOOL',
                sections: [
                    { label:  'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 654-4323' },
                ],
            },
            {
                title: 'BARANGKA ELEMENTARY SCHOOL',
                sections: [
                    { label:  'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 635-5851' },
                ],
            },
            {
                title: 'TAÑONG HIGH SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 948-8403' },
                ],
            },
            
            {
                title: 'IVS COVERED COURT',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call (02) 8681-9457' },
                ],
            },
            {
                title: 'JESUS DELA PEÑA NHS',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call (02) 7358-5790' },
                ],
            },
        ],

        district2: [
            {
                title: 'H.  BAUTISTA ELEMENTARY SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 696-4075' },
                ],
            },

            {
                title: 'NANGKA ELEMENTARY SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 576-4681' },
                ],
            },

            {
                title: 'CONCEPCION INTEGRATED SCHOOL (ES)',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 650-1906' },
                ],
            },

            {
                title: 'CONCEPCION INTEGRATED SCHOOL (SL)',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 656-8404' },
                ],
            },

            {
                title: 'CONCEPCION ELEMENTARY SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 942-0023' },
                ],
            },

            {
                title: 'FILIPINAS GYM',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 02-8942-1346' },
                ],
            },

            {
                title: 'BULELAK GYM',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 0966 406 2407' },
                ],
            },

            {
                title: 'NANGKA GYM',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call (02) 8942-0453' },
                ],
            },

            {
                title: 'KAP.  MOY ELEMENTARY',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 356-6827' },
                ],
            },

            {
                title: 'PLMAR (GREENHEIGHTS)',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 369-8650' },
                ],
            },

            {
                title: 'MARIKINA HIGH SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 239-8206' },
                ],
            },
            
            {
                title: 'PARANG ELEMENTARY SCHOOL',
                sections: [
                    { label:  'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 621-2294' },
                ],
            },

            {
                title: 'PARANG HIGH SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 941-9374' },
                ],
            },

            {
                title: 'FORTUNE ELEMENTARY SCHOOL',
                sections: [
                    { label:  'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 621-4492' },
                ],
            },

            {
                title: 'FORTUNE HIGH SCHOOL',
                sections:  [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type:  'main', text: 'Call 941-4892' },
                ],
            },

            {
                title: 'STA. ELENA CHAPEL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call (02) 8647-7505' },
                ],
            },

            {
                title: 'ST. MARY ELEMENTARY SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 717-0496' },
                ],
            },

            {
                title: 'SSS VILLAGE ELEMENTARY SCHOOL',
                sections:  [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type:  'main', text: 'Call 941-4135' },
                ],
            },

            {
                title: 'SSS NATIONAL HIGH SCHOOL',
                sections:  [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type:  'main', text: 'Call (02) 7624 7386' },
                ],
            },

            {
                title: 'MARIKINA HEIGHTS HIGH SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 279348913' },
                ],
            },
        ],
    },
};

const getSortedDistricts = (data:  DistrictHotlines): [string, HotlineItem[]][] =>
    Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([districtKey, items]) => [
            districtKey,
            [...items].sort((a, b) => a.title.localeCompare(b.title)),
    ]);


const matchesSearch = (
    item: any,
    search: string,
    scope: 'all' | 'title' | 'numbers'
) => {
    if (!search) return true;

    const term = search.toLowerCase();

    const titleMatch = item.title?.toLowerCase().includes(term);
    const numberMatch = item.sections?.some((section: any) =>
        section.text?.toLowerCase().includes(term)
    );

    if (scope === 'title') return titleMatch;
    if (scope === 'numbers') return numberMatch;

    return titleMatch || numberMatch;
};

const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark key={index} style={{ backgroundColor: '#FFE082', padding: '0 2px' }}>
                {part}
            </mark>
        ) : (
            part
        )
    );
};

// Confirm Dialog for emergency numbers
// Emergency numbers that require confirmation
const EMERGENCY_NUMBERS = [
    '911', // National Emergency
    '161', // Marikina City Rescue
    '143', // Philippine Red Cross
    '136', // MMDA
    '117', // Philippine National Police
];

// sub feature 1: this remove words like "call", "Text", spaces, and non-dialable characters
const extractPhoneNumber = (text: string) => {
    if (!text) return '';
    return text.replace(/call|text/gi, '').replace(/[^\d]/g, '');
};

// sub feature 2: similar to above, but this is to separate from calls
const extractSmsNumber = (text: string) => {
    if (!text) return '';
    return text
        .replace(/text|call/gi, '')
        .replace(/[^\d]/g, '');
};

// Check if number is an emergency hotline
const isEmergencyNumber = (phone: string) =>
    EMERGENCY_NUMBERS.some(num => phone.startsWith(num));


const EmergencyHotlines = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'general' | 'marikina' | 'barangay' | 'evacuation'>('general');
    const { profile } = useAuth();

    // Get user's first name for header
    const userName = profile?.first_name || 'User';
        
    // districts and barangays
    const sortedBarangayDistricts = getSortedDistricts(HOTLINES.barangay);
    const sortedEvacuationDistricts = getSortedDistricts(HOTLINES.evacuation);


    const [collapsedDistricts, setCollapsedDistricts] =
    useState<Record<string, boolean>>({});

    const [searchTerm, setSearchTerm] = useState(() =>
    localStorage.getItem('hotlinesSearch') || ''
    );

    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);


    const [searchScope, setSearchScope] = useState<'all' | 'title' | 'numbers'>(
        () => (localStorage.getItem('hotlinesScope') as any) || 'all'
    );

    /* 
    Stores: Which  number is being called
     label is shown to the user; null means no dialog is visible
    */
    const [confirmDialog, setConfirmDialog] = useState<{
        phone: string;
        label: string;
    } | null>(null);

    useEffect(() => {
    const timeout = setTimeout(() => {
        setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeout);
    }, [searchTerm]);
    
    useEffect(() => {
        localStorage.setItem('hotlinesSearch', searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        localStorage.setItem('hotlinesScope', searchScope);
    }, [searchScope]);

    useEffect(() => {
        if (!debouncedSearch) return;

        setCollapsedDistricts({});
    }, [debouncedSearch]);

    return (
        <div className="hotlines-container">
            <Sidebar isOpen={isSidebarOpen} />

            <main className="hotlines-main">
                <Header onMenuClick={() => setIsSidebarOpen(! isSidebarOpen)} username={userName} />

                <section className="hotlines-content">

                    {/* TABS */}
                    <div className="hotlines-tabs">
                        {[
                            { key: 'general' as const, label: 'General Hotlines' },
                            { key: 'marikina' as const, label: 'Marikina Rescue' },
                            { key:  'barangay' as const, label: 'Barangay Contact' },
                            { key:  'evacuation' as const, label: 'Evacuation Center' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={`tab-btn ${activeTab === tab.key ?  'active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab. label}
                            </button>
                        ))}
                    </div>

                    {/* SEARCH */}
                    <div className="hotlines-search">
                        <input
                            type="text"
                            placeholder="Search for hotlines..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />

                        <div className="search-scope">
                            {[
                                { key: 'all', label: 'All' },
                                { key: 'title', label: 'By Title' },
                                { key: 'numbers', label: 'By Contact Number' },
                            ].map(option => (
                                <button
                                    key={option.key}
                                    className={`scope-btn ${
                                        searchScope === option.key ? 'active' : ''
                                    }`}
                                    onClick={() =>
                                        setSearchScope(option.key as any)
                                    }
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* GRID */}
                    {activeTab !== 'barangay' && Array.isArray(HOTLINES[activeTab]) && (
                        <>
                            {HOTLINES[activeTab]
                                .filter((item: any) =>
                                    item.type !== 'sectionLabel' &&
                                    item.title !== 'MARIKINA MOBILE HOTLINES' &&
                                    matchesSearch(item, debouncedSearch, searchScope)
                                ).length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#6C757D', marginTop: 40 }}>
                                        No hotlines found matching "<strong>{searchTerm}</strong>"
                                    </p>
                                ) : (
                                    <div className="hotlines-grid animated-grid" key={activeTab}>
                                        {HOTLINES[activeTab]
                                            .filter((item: any) =>
                                                item.type !== 'sectionLabel' &&
                                                item.title !== 'MARIKINA MOBILE HOTLINES' &&
                                                matchesSearch(item, debouncedSearch, searchScope)
                                            )
                                            .map((item: any, idx: number) => (
                                                <Card
                                                    key={idx}
                                                    title={item.title}
                                                    searchTerm={searchTerm}
                                                >
                                                    {item.sections.map((section: any, i: number) => {
                                                        if (section.divider) return <Divider key={i} />;
                                                        if (section.label) return <Label key={i} text={section.label} />;
                                                        if (section.type === 'main')
                                                            return <MainBtn
                                                                key={i}
                                                                text={section.text}
                                                                searchTerm={searchTerm}
                                                                onConfirm={(phone: string, label: string) =>
                                                                    setConfirmDialog({ phone, label })
                                                                }
                                                            />;
                                                        if (section.type === 'alert')
                                                            return <AlertBtn key={i} text={section.text} searchTerm={searchTerm} />;
                                                        return <SecondaryBtn key={i} text={section.text} searchTerm={searchTerm} />;
                                                    })}
                                                </Card>
                                            ))}
                                    </div>
                                )}
                        </>
                    )}


                        
                    {/* MOBILE HOTLINES SECTION */}
                    {activeTab === 'marikina' && (
                        <>
                            <div className="hotlines-grid animated-grid" key={activeTab}>
                                {renderHotlineItems(HOTLINES.marikina)}
                            </div>

                        <div className="hotlines-grid">
                            {HOTLINES.marikina
                                .filter((item: any) => item.title === 'MARIKINA MOBILE HOTLINES')
                                .map((item: any, idx: number) => (
                                <Card key={idx} title={item.title} searchTerm={searchTerm}>
                                    {item.sections.map((section: any, i: number) => {
                                        if (section.divider) return <Divider key={i} />;
                                        if (section.label) return <Label key={i} text={section.label} />;

                                        return (
                                            <SecondaryBtn
                                                key={i}
                                                text={section.text}
                                                searchTerm={searchTerm}
                                            />
                                        );
                                    })}
                                </Card>
                            ))}
                            </div>
                        </>
                    )}

                    {/* District-based tabs (barangay & evacuation) */}
                    {(activeTab === 'barangay' || activeTab === 'evacuation') && (
                    <>
                        {(activeTab === 'barangay'
                            ? sortedBarangayDistricts
                            : sortedEvacuationDistricts
                        ).map(([districtKey, items]: any) => {

                            const isCollapsed = collapsedDistricts[districtKey];
                            return (
                                <section key={districtKey}>
                                    <h3
                                        className="section-label"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            if (debouncedSearch) return;

                                            setCollapsedDistricts(prev => ({
                                                ...prev,
                                                [districtKey]: !prev[districtKey],
                                            }));
                                        }}

                                        >
                                            {districtKey === 'district1' ?  'District I' : 'District II'}
                                            <span style={{ marginLeft: 8 }}>
                                                {isCollapsed ? '▸' : '▾'}
                                            </span>
                                        </h3>

                                        {!isCollapsed && (
                                            items.filter((item: any) =>
                                                matchesSearch(item, debouncedSearch, searchScope)
                                            ).length === 0 ? (
                                                <p style={{ color: '#6C757D', marginBottom: 24 }}>
                                                    No results found in this district
                                                </p>
                                            ) : (
                                                <div className="hotlines-grid">
                                                    {items
                                                        .filter((item: any) =>
                                                            matchesSearch(item, debouncedSearch, searchScope)
                                                        )
                                                        .map((item: any, idx: number) => (
                                                            <Card
                                                                key={idx}
                                                                title={item.title}
                                                                searchTerm={debouncedSearch}
                                                            >
                                                                {item.sections.map((section: any, i: number) => {
                                                                    if (section.divider) return <Divider key={i} />;
                                                                    if (section.label) return <Label key={i} text={section.label} />;
                                                                    // SMS support ONLY for Barangay & Evacuation
                                                                    if (section.text?.toLowerCase().includes('text')) {
                                                                        return (
                                                                            <SmsBtn
                                                                                key={i}
                                                                                text={section.text}
                                                                                searchTerm={debouncedSearch}
                                                                            />
                                                                        );
                                                                    }

                                                                    return (
                                                                        <MainBtn
                                                                            key={i}
                                                                            text={section.text}
                                                                            searchTerm={debouncedSearch}
                                                                        />
                                                                    );

                                                                })}
                                                            </Card>
                                                        ))}
                                                </div>
                                            )
                                        )}
                                    </section>
                                );
                            })}
                        </>
                    )}

                    {/* for conifrming dialog */}
                    {confirmDialog && (
                        <div className="confirm-overlay">
                            <div className="confirm-modal">
                                <h3 className="confirm-title">
                                    Confirm Emergency Call
                                </h3>

                                <p className="confirm-text">
                                    You are about to call an <strong>emergency hotline</strong>:<br />
                                    <strong>{confirmDialog.label}</strong>
                                </p>

                                <div className="confirm-actions">
                                    <button
                                        className="hotline-btn secondary"
                                        onClick={() => setConfirmDialog(null)}
                                    >
                                        Cancel
                                    </button>

                                    <a
                                        href={`tel:${confirmDialog.phone}`}
                                        className="hotline-btn main"
                                        onClick={() => setConfirmDialog(null)}
                                    >
                                        Call Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                </section>
            </main>
        </div>
    );
};

// HELPERS - with proper types

interface CardProps {
    title: string;
    children: React.ReactNode;
}

const Card = ({ title, children, searchTerm }: any) => (
    <div className="hotline-card">
        <div className="hotline-header">
            <img src={icon} alt="" />
            <h4>{highlightText(title, searchTerm)}</h4>
        </div>
        {children}
    </div>
);

const Label: React.FC<LabelProps> = ({ text }) => (
    <p className="hotline-label">{text}</p>
);

const Divider: React.FC = () => (
    <div style={{ height: '1px', background: '#E9ECEF', margin: '10px 0' }} />
);

const MainBtn = ({ text, searchTerm, onConfirm }: any) => {
    const phone = extractPhoneNumber(text);

    const handleClick = () => {
        if (!phone) return;

        if (isEmergencyNumber(phone) && onConfirm) {
            onConfirm(phone, text);
        } else {
            window.location.href = `tel:${phone}`;
        }
    };

    return (
        <button className="hotline-btn main" onClick={handleClick}>
            <img src={icon} alt="" />
            {highlightText(text, searchTerm)}
        </button>
    );
};

const AlertBtn = ({ text, searchTerm, onConfirm }: any) => {
    const phone = extractPhoneNumber(text);

    const handleClick = () => {
        if (!phone) return;

        if (isEmergencyNumber(phone) && onConfirm) {
            onConfirm(phone, text);
        } else {
            window.location.href = `tel:${phone}`;
        }
    };

    return (
        <button className="hotline-btn alert" onClick={handleClick}>
            <img src={icon} alt="" />
            {highlightText(text, searchTerm)}
        </button>
    );
};

// sub feature 2: button for sending sms
const SmsBtn = ({ text, searchTerm }: any) => {
    const phone = extractSmsNumber(text);

    if (!phone) return null;

    return (
        <a
            href={`sms:${phone}`}
            className="hotline-btn secondary"
        >
            💬 {highlightText(text, searchTerm)}
        </a>
    );
};

const SecondaryBtn = ({ text, searchTerm }: any) => {
    const phone = extractPhoneNumber(text);

    return (
        <a
            href={phone ? `tel:${phone}` : undefined}
            className="hotline-btn secondary"
        >
            <img src={icon} alt="" />
            {highlightText(text, searchTerm)}
        </a>
    );
};

export default EmergencyHotlines;