import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './EmergencyHotlines.css';

import icon from '../assets/icon-call.svg';

const HOTLINES: Record<string, any> = {
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
                { type: 'secondary', text: 'Call (02) 8911-1406' },
                { type: 'secondary', text: 'Call (02) 8912-2665' },
                { type: 'secondary', text: 'Call (02) 8912-5668' },
                { type: 'secondary', text: 'Call (02) 8911-1873' },
            ],
        },

        {
            title: 'PHILIPPINE RED CROSS',
            sections: [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text: 'Call 143' },
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
            sections: [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text: 'Call (02) 931-81-01 to 07' },
                { divider: true },
                { label: 'DISASTER RESPONSE UNIT' },
                { type: 'alert', text: 'Call (02) 8856-3665' },
                { type: 'alert', text: 'Call (02) 8852-8081' },
                { divider: true },
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
                { type: 'main', text: 'Call (02) 8527-8481 to 89' },
                { divider: true },
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
                { type: 'main', text: 'Call 1627' },
            ],
        },

        {
            title: 'PHILIPPINE NATIONAL POLICE (PNP)',
            sections: [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text: 'Call 117' },
                { divider: true },
                { label: 'OTHER LANDLINE HOTLINES' },
                { type: 'secondary', text: 'Call (02) 8722-0650' },
                { type: 'secondary', text: 'Call 0917-847-5757' },
            ],
        },

        {
            title: 'MERALCO',
            sections: [
                { label: 'MAIN OPERATIONS HOTLINE' },
                { type: 'main', text: 'Call (02) 16211' },
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
                { type: 'main', text: 'Call (02) 8646-0427' },
            ],
        },

        {
            title: 'MARIKINA CITY',
            sections: [
                { label: 'MAIN OPERATION HOTLINE' },
                { type: 'main', text: 'Call (02) 8646-1631' },
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
            title: 'MARIKINA LANDLINE HOTLINES',
            sections: [
                { label: 'PLDT' },
                { type: 'main', text: 'Call 8-646-2436 to 38' },
            ],
        },
        
        {
            title: 'MARIKINA LANDLINE HOTLINES',
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
            type: 'sectionLabel',
            text: 'Mobile Hotlines',
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

    barangay: {
        district1: [
            {
                title: 'BARANGAY BARANGKA',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 997-4951' },
                ],
            },

            {
                title: 'BARANGAY INDUSTRIAL VALLEY',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 369-5833' },
                ],
            },

            {
                title: 'BARANGAY JESUS DELA PEÑA',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 89486963' },
                ],
            },

            {
                title: 'BARANGAY KALUMPANG',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 647-7205' },
                ],
            },

            {
                title: 'BARANGAY MALANDAY',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 0289421346' },
                ],
            },

            {
                title: 'BARANGAY SAN ROQUE',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 646-8479' },
                ],
            },

            {
                title: 'BARANGAY STA. ELENA',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 8646-1877' },
                ],
            },

            {
                title: 'BARANGAY STO. NIÑO',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call (02) 5349 703' },
                ],
            },

            {
                title: 'BARANGAY TAÑONG',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 8477 8853' },
                ],
            },
        ],

        district2: [
            {
                title: 'BARANGAY CONCEPCION UNO',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 948-6454' },
                ],
            },

            {
                title: 'BARANGAY CONCEPCION DOS',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 942-0599' },
                ],
            },

            {
                title: 'BARANGAY FORTUNE',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 480-7368' },
                ],
            },

            {
                title: 'BARANGAY MARIKINA HEIGHTS',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 942-0572' },
                ],
            },

            {
                title: 'BARANGAY NANGKA',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 7934-8626' },
                ],
            },

            {
                title: 'BARANGAY TUMANA',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 477-3817' },
                ],
            },

            {
                title: 'BARANGAY ',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call ' },
                ],
            },
        ],
    },
    evacuation: {
        district1: [
            {
                title: 'MALANDAY ELEMENTARY SCHOOL',
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
                    { label: 'MAIN OPERATION HOTLINE' },
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
                    { type: 'main', text: 'Call 646-1738' },
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
                title: 'SAN ROQUE ELEMENTARY SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 645-3235' },
                ],
            },
            {
                title: 'SAN ROQUE NATIONAL HIGH SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 654-4323' },
                ],
            },
            {
                title: 'BARANGKA ELEMENTARY SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
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
                title: 'H. BAUTISTA ELEMENTARY SCHOOL',
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
                title: 'KAP. MOY ELEMENTARY',
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
                    { label: 'MAIN OPERATION HOTLINE' },
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
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 621-4492' },
                ],
            },

            {
                title: 'FORTUNE HIGH SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 941-4892' },
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
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call 941-4135' },
                ],
            },

            {
                title: 'SSS NATIONAL HIGH SCHOOL',
                sections: [
                    { label: 'MAIN OPERATION HOTLINE' },
                    { type: 'main', text: 'Call (02) 7624 7386' },
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

const getSortedDistricts = (data: Record<string, any[]>) =>
    Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([districtKey, items]) => [
            districtKey,
            [...items].sort((a, b) => a.title.localeCompare(b.title)),
    ]);

const EmergencyHotlines = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'general' | 'marikina' | 'barangay' | 'evacuation'>('general');

    // districts and barangays
    const sortedBarangayDistricts = getSortedDistricts(HOTLINES.barangay);
    const sortedEvacuationDistricts = getSortedDistricts(HOTLINES.evacuation);


    const [collapsedDistricts, setCollapsedDistricts] =
    useState<Record<string, boolean>>({});

    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="hotlines-container">
            <Sidebar isOpen={isSidebarOpen} />

            <main className="hotlines-main">
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

                <section className="hotlines-content">

                    {/* TABS */}
                    <div className="hotlines-tabs">
                        {[
                            { key: 'general', label: 'General Hotlines' },
                            { key: 'marikina', label: 'Marikina Rescue' },
                            { key: 'barangay', label: 'Barangay Contact' },
                            { key: 'evacuation', label: 'Evacuation Center' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.key as any)}
                            >
                                {tab.label}
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
                    </div>


                    {/* GRID */}
                    {activeTab !== 'barangay' && Array.isArray(HOTLINES[activeTab]) && (
                    <div className="hotlines-grid animated-grid" key={activeTab}>
                        {HOTLINES[activeTab]
                        .filter((item: any) => item.type !== 'sectionLabel' && item.title !== 'MARIKINA MOBILE HOTLINES')
                        .map((item: any, idx: number) => (
                            <Card key={idx} title={item.title}>
                            {item.sections.map((section: any, i: number) => {
                                if (section.divider) return <Divider key={i} />;
                                if (section.label) return <Label key={i} text={section.label} />;
                                if (section.type === 'main') return <MainBtn key={i} text={section.text} />;
                                if (section.type === 'alert') return <AlertBtn key={i} text={section.text} />;
                                return <SecondaryBtn key={i} text={section.text} />;
                            })}
                            </Card>
                        ))}
                    </div>
                    )}

                        
                    {/* MOBILE HOTLINES SECTION */}
                    {activeTab === 'marikina' && (
                    <>
                        <h3 className="section-label">Mobile Hotlines</h3>

                        <div className="hotlines-grid">
                            {HOTLINES.marikina
                                .filter((item: any) => item.title === 'MARIKINA MOBILE HOTLINES')
                                .map((item: any, idx: number) => (
                                <Card key={idx} title={item.title}>
                                    {item.sections.map((section: any, i: number) => {
                                    if (section.divider) return <Divider key={i} />;
                                    if (section.label) return <Label key={i} text={section.label} />;
                                    return <SecondaryBtn key={i} text={section.text} />;
                                    })}
                                </Card>
                            ))}
                            </div>
                        </>
                    )}

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
                                        onClick={() =>
                                            setCollapsedDistricts(prev => ({
                                            ...prev,
                                            [districtKey]: !prev[districtKey],
                                            }))
                                        }
                                        >
                                        {districtKey === 'district1' ? 'District I' : 'District II'}
                                        <span style={{ marginLeft: 8 }}>
                                            {isCollapsed ? '▸' : '▾'}
                                        </span>
                                    </h3>

                                        {!isCollapsed && (
                                            <div className="hotlines-grid">
                                                {items
                                                    .filter((item: any) =>
                                                        item.title.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map((item: any, idx: number) => (
                                                    <Card key={idx} title={item.title}>
                                                        {item.sections.map((section: any, i: number) => {
                                                            if (section.divider) return <Divider key={i} />;
                                                            if (section.label) return <Label key={i} text={section.label} />;
                                                            return <MainBtn key={i} text={section.text} />;
                                                        })}
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                );
                            })}
                        </>
                    )}
                </section>
            </main>
        </div>
    );
};

// HELPERS

const Card = ({ title, children }: any) => (
    <div className="hotline-card">
        <div className="hotline-header">
        <img src={icon} alt="" />
        <h4>{title}</h4>
        </div>
        {children}
    </div>
);


const Label = ({ text }: any) => (
    <p className="hotline-label">{text}</p>
);

const Divider = () => (
    <div style={{ height: '1px', background: '#E9ECEF', margin: '10px 0' }} />
);

const MainBtn = ({ text }: any) => (
    <button className="hotline-btn main">
        <img src={icon} alt="" />
        {text}
    </button>
);

const AlertBtn = ({ text }: any) => (
    <button className="hotline-btn alert">
        <img src={icon} alt="" />
        {text}
    </button>
);

const SecondaryBtn = ({ text }: any) => (
    <button className="hotline-btn secondary">
        <img src={icon} alt="" />
        {text}
    </button>
);

export default EmergencyHotlines;