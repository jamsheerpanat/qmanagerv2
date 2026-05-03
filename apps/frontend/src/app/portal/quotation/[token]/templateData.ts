// Preloaded template data matching the PDF templates per service type

export interface ValueCard { icon: string; title: string; text: string; }
export interface ScopeItem { number: string; icon: string; title: string; intro: string; features: string[]; }
export interface TemplateData {
  tagline: string;
  aboutTitle: string;
  aboutHighlight: string;
  introParagraphs: string[];
  vendors: string[];
  valueCards: ValueCard[];
  scopeTitle: string;
  scopeHighlight: string;
  scopeIntro: string;
  scopes: ScopeItem[];
  deliverables: string[];
  coverLayers?: { icon: string; label: string }[];
}

const IT_INFRA: TemplateData = {
  tagline: "A secure, reliable, and scalable IT infrastructure solution designed to support modern business operations.",
  aboutTitle: "RELIABLE IT INFRASTRUCTURE FOR",
  aboutHighlight: "SECURE BUSINESS OPERATIONS",
  introParagraphs: [
    "Octonics Innovations provides complete IT infrastructure solutions for businesses that require stable, secure, and high-performance technology environments.",
    "A strong IT infrastructure is the foundation of every modern business. It supports communication, internet connectivity, data access, security, business applications, surveillance systems, access control systems, cloud services, and daily operations.",
    "Our IT infrastructure service includes network design, firewall implementation, structured cabling, Wi-Fi deployment, server setup, storage solutions, backup systems, remote access, monitoring, and ongoing support.",
    "We design every infrastructure solution based on the client's office layout, number of users, business requirements, security needs, future expansion plans, and budget.",
    "Octonics Innovations focuses on professional implementation, proper documentation, clean installation, security best practices, and long-term reliability.",
  ],
  vendors: ["Cisco", "Fortinet", "Ubiquiti", "MikroTik", "Synology", "HPE", "Dell", "Veeam"],
  valueCards: [
    { icon: "🛡️", title: "SECURE NETWORK", text: "Firewall, access control, secure VPN, and protected internal network design." },
    { icon: "🌐", title: "STABLE CONNECTIVITY", text: "Reliable wired and wireless connectivity for users, devices, and business systems." },
    { icon: "🔌", title: "PROFESSIONAL CABLING", text: "Structured cabling, rack dressing, labeling, and tested network points." },
    { icon: "💾", title: "BUSINESS CONTINUITY", text: "Backup, redundancy, remote access, and disaster recovery planning." },
    { icon: "📈", title: "SCALABLE DESIGN", text: "Infrastructure designed to support future users, branches, systems, and services." },
    { icon: "🔧", title: "SUPPORT READY", text: "Proper documentation and support structure for smooth maintenance." },
  ],
  scopeTitle: "PROPOSED IT",
  scopeHighlight: "INFRASTRUCTURE SCOPE",
  scopeIntro: "The proposed IT infrastructure solution can include the following systems and services based on the selected project scope and approved quotation items.",
  scopes: [
    { number: "01", icon: "🌐", title: "NETWORK DESIGN & IMPLEMENTATION", intro: "A professional network design ensures stable connectivity, proper segmentation, reliable performance, and easier maintenance.", features: ["Network architecture planning", "IP address planning", "LAN design", "VLAN configuration", "Switch configuration", "Router configuration", "Internet failover", "Network documentation"] },
    { number: "02", icon: "🛡️", title: "FIREWALL & CYBERSECURITY", intro: "Firewall and security configuration protect the business network from unauthorized access, threats, misuse, and unsafe traffic.", features: ["Firewall installation", "Security policy", "Internet access control", "VPN configuration", "Remote access security", "Web filtering", "Application control", "Security best practices"] },
    { number: "03", icon: "🔌", title: "STRUCTURED CABLING", intro: "Structured cabling provides the physical foundation for reliable network, telephone, CCTV, access control, and other low-voltage systems.", features: ["Cat6 / Cat6A cabling", "Fiber backbone", "Patch panel termination", "Faceplate installation", "Rack installation", "Cable labeling", "Cable testing", "Clean rack dressing"] },
    { number: "04", icon: "📡", title: "WI-FI INFRASTRUCTURE", intro: "Enterprise-grade Wi-Fi provides reliable wireless connectivity for staff, guests, mobile devices, and business applications.", features: ["AP placement planning", "Wi-Fi coverage design", "Staff Wi-Fi network", "Guest Wi-Fi network", "VLAN-based separation", "Controller-based management", "Secure wireless auth", "Roaming support"] },
    { number: "05", icon: "🖥️", title: "SERVER & STORAGE SOLUTIONS", intro: "Servers and storage systems support centralized data, applications, user access, backup, and business continuity.", features: ["File server setup", "Application server", "Virtualization support", "NAS storage setup", "User & permission mgmt", "Shared folder config", "Storage planning", "Server hardening"] },
    { number: "06", icon: "💾", title: "BACKUP & DISASTER RECOVERY", intro: "Backup and disaster recovery solutions protect business data from accidental deletion, hardware failure, ransomware, and disruption.", features: ["Local backup config", "Cloud backup option", "Scheduled backup jobs", "Backup monitoring", "Retention policy", "Recovery testing", "DR planning", "Critical data protection"] },
    { number: "07", icon: "🔧", title: "IT SUPPORT & MAINTENANCE", intro: "Ongoing IT support maintains performance, reduces downtime, and resolves issues quickly for smooth daily operations.", features: ["Preventive maintenance", "Troubleshooting", "Remote support", "On-site support", "Network health check", "Firewall health check", "Server health check", "Asset documentation"] },
  ],
  deliverables: ["IT infrastructure assessment", "Network design and planning", "Firewall configuration", "Switch and router configuration", "Structured cabling implementation", "Wi-Fi deployment", "Server and storage setup", "Backup configuration", "VPN setup", "Testing and verification", "Documentation and labeling", "Admin/user handover", "Support as per agreement"],
  coverLayers: [{ icon: "🛡️", label: "Firewall" }, { icon: "🌐", label: "Network" }, { icon: "📡", label: "Wi-Fi" }, { icon: "🔌", label: "Cabling" }, { icon: "🖥️", label: "Servers" }, { icon: "💾", label: "Backup" }, { icon: "🔧", label: "Support" }],
};

const HOME_AUTO: TemplateData = {
  tagline: "Transform your living space with intelligent automation that brings comfort, security, and efficiency to every corner of your home.",
  aboutTitle: "INTELLIGENT HOME AUTOMATION FOR",
  aboutHighlight: "MODERN LIVING EXPERIENCES",
  introParagraphs: [
    "Octonics Innovations delivers premium smart home automation solutions that seamlessly integrate lighting, climate, security, and entertainment systems into one unified experience.",
    "A smart home is more than technology — it's about creating an environment that adapts to your lifestyle, enhances comfort, improves energy efficiency, and provides peace of mind through intelligent security.",
    "Our home automation service includes KNX programming, smart lighting design, HVAC integration, motorized curtains, multi-room audio, video intercom, security integration, and centralized control.",
    "Every project is designed around the homeowner's preferences, architectural layout, existing electrical systems, and desired automation scenarios.",
  ],
  vendors: ["KNX", "Lutron", "Crestron", "Sonos", "Hikvision", "ABB", "Schneider", "Jung"],
  valueCards: [
    { icon: "💡", title: "SMART LIGHTING", text: "Scene-based lighting control, dimming, color tuning, and automated schedules." },
    { icon: "❄️", title: "CLIMATE CONTROL", text: "Intelligent HVAC integration for comfort and energy efficiency." },
    { icon: "🎵", title: "MULTI-ROOM AUDIO", text: "Distributed audio systems with zone control and streaming." },
    { icon: "🔒", title: "SMART SECURITY", text: "Video intercom, CCTV, alarm integration, and access control." },
    { icon: "🪟", title: "MOTORIZED BLINDS", text: "Automated curtains and blinds with sun tracking and scheduling." },
    { icon: "📱", title: "CENTRAL CONTROL", text: "Control everything from a single app, touch panel, or voice command." },
  ],
  scopeTitle: "PROPOSED SMART HOME",
  scopeHighlight: "AUTOMATION SCOPE",
  scopeIntro: "The proposed smart home solution includes the following automation systems and services based on the project requirements.",
  scopes: [
    { number: "01", icon: "💡", title: "LIGHTING CONTROL SYSTEM", intro: "Intelligent lighting design with scene control, dimming, and automated scheduling for every room.", features: ["Scene programming", "Dimming control", "Color temperature", "Motion-triggered", "Sunrise/sunset automation", "Party/movie scenes"] },
    { number: "02", icon: "❄️", title: "HVAC & CLIMATE INTEGRATION", intro: "Smart climate management for optimal comfort and energy savings throughout the home.", features: ["Thermostat integration", "Zone-based control", "Schedule automation", "Energy monitoring", "Away mode", "Occupancy-based"] },
    { number: "03", icon: "🪟", title: "MOTORIZED CURTAINS & BLINDS", intro: "Automated window treatments that respond to time, sunlight, and custom schedules.", features: ["Motor installation", "Sun tracking", "Scene integration", "Timer-based", "Group control", "Manual override"] },
    { number: "04", icon: "🔒", title: "SECURITY & SURVEILLANCE", intro: "Comprehensive security with smart cameras, video intercom, and alarm integration.", features: ["CCTV integration", "Video intercom", "Door sensors", "Alarm system", "Motion detection", "Remote monitoring"] },
    { number: "05", icon: "🎵", title: "MULTI-ROOM AUDIO/VIDEO", intro: "Distributed entertainment with zone-based audio and centralized media management.", features: ["Zone audio", "Streaming sources", "Intercom", "Volume control", "Background music", "AV integration"] },
    { number: "06", icon: "📱", title: "CENTRAL CONTROL & PROGRAMMING", intro: "Unified control through apps, touch panels, and voice assistants.", features: ["KNX programming", "Touch panel setup", "Mobile app config", "Voice assistant", "Scene creation", "Remote access"] },
  ],
  deliverables: ["Site survey and planning", "KNX system programming", "Lighting scene configuration", "HVAC integration", "Curtain motor installation", "Audio system setup", "Security integration", "Touch panel configuration", "Mobile app setup", "Testing and handover", "User training", "Documentation"],
  coverLayers: [{ icon: "💡", label: "Lighting" }, { icon: "❄️", label: "Climate" }, { icon: "🪟", label: "Blinds" }, { icon: "🔒", label: "Security" }, { icon: "🎵", label: "Audio" }, { icon: "📱", label: "Control" }],
};

const BUILDING_AUTO: TemplateData = {
  ...IT_INFRA,
  tagline: "Intelligent building management systems for efficient, sustainable, and comfortable commercial environments.",
  aboutTitle: "INTELLIGENT BUILDING AUTOMATION FOR",
  aboutHighlight: "EFFICIENT COMMERCIAL SPACES",
  introParagraphs: [
    "Octonics Innovations delivers comprehensive building automation solutions that integrate HVAC, lighting, access control, fire safety, and energy management into a centralized BMS platform.",
    "Building automation reduces operational costs, improves occupant comfort, enhances security, and supports sustainability goals through intelligent control and monitoring.",
    "Our building automation services include BMS integration, HVAC automation, lighting control, energy metering, access control, fire alarm integration, and centralized monitoring dashboards.",
  ],
  vendors: ["Siemens", "Schneider", "Honeywell", "KNX", "ABB", "Johnson Controls", "Tridium", "BACnet"],
  coverLayers: [{ icon: "🏢", label: "BMS" }, { icon: "❄️", label: "HVAC" }, { icon: "💡", label: "Lighting" }, { icon: "🔐", label: "Access" }, { icon: "🔥", label: "Fire" }, { icon: "⚡", label: "Energy" }],
};

const SOFTWARE_DEV: TemplateData = {
  ...IT_INFRA,
  tagline: "Custom software solutions engineered to digitize, automate, and scale your business operations.",
  aboutTitle: "CUSTOM SOFTWARE DEVELOPMENT FOR",
  aboutHighlight: "DIGITAL TRANSFORMATION",
  introParagraphs: [
    "Octonics Innovations builds custom web applications, mobile apps, and enterprise software platforms tailored to your specific business processes and growth objectives.",
    "Our software development approach combines modern architectures, agile methodology, and user-centered design to deliver reliable, scalable, and maintainable solutions.",
    "Services include requirements analysis, UI/UX design, full-stack development, API integration, cloud deployment, testing, and ongoing maintenance.",
  ],
  vendors: ["React", "Next.js", "Node.js", "PostgreSQL", "AWS", "Docker", "TypeScript", "Flutter"],
  coverLayers: [{ icon: "🎨", label: "UI/UX" }, { icon: "⚙️", label: "Backend" }, { icon: "📱", label: "Mobile" }, { icon: "☁️", label: "Cloud" }, { icon: "🔗", label: "API" }, { icon: "🧪", label: "Testing" }],
};

const SLUG_MAP: Record<string, TemplateData> = {
  // Actual DB slugs
  "it-infrastructure": IT_INFRA,
  "smart-home-automation": HOME_AUTO,
  "software-development": SOFTWARE_DEV,
  "cctv-access-control": IT_INFRA,
  "amc-maintenance": IT_INFRA,
  "general-trading": IT_INFRA,
  // Aliases
  "it-infra": IT_INFRA,
  "smart-home": HOME_AUTO,
  "home-automation": HOME_AUTO,
  "building-automation": BUILDING_AUTO,
  "software-dev": SOFTWARE_DEV,
};

// ═══ ARABIC TEMPLATES ═══
const IT_INFRA_AR: TemplateData = {
  tagline: "حلول بنية تحتية تقنية آمنة وموثوقة وقابلة للتوسع، مصممة لدعم عمليات الأعمال الحديثة.",
  aboutTitle: "بنية تحتية تقنية موثوقة",
  aboutHighlight: "لعمليات أعمال آمنة",
  introParagraphs: [
    "تقدم أوكتونيكس للابتكارات حلول بنية تحتية تقنية متكاملة للشركات التي تحتاج إلى بيئة تقنية مستقرة وآمنة وعالية الأداء.",
    "البنية التحتية التقنية القوية هي أساس كل عمل تجاري حديث. فهي تدعم الاتصالات، والإنترنت، والوصول إلى البيانات، والأمان، والتطبيقات، وأنظمة المراقبة، والخدمات السحابية، والعمليات اليومية.",
    "تشمل خدماتنا تصميم الشبكات، وتطبيق جدران الحماية، والتمديدات المهيكلة، ونشر شبكات الواي فاي، وإعداد السيرفرات، وحلول التخزين، وأنظمة النسخ الاحتياطي، والوصول عن بُعد، والمراقبة، والدعم المستمر.",
    "نصمم كل حل بناءً على تخطيط مقر العميل، وعدد المستخدمين، ومتطلبات العمل، واحتياجات الأمان، وخطط التوسع المستقبلية، والميزانية.",
    "تركز أوكتونيكس على التنفيذ الاحترافي، والتوثيق السليم، والتركيب النظيف، وأفضل ممارسات الأمان، والموثوقية طويلة المدى.",
  ],
  vendors: ["Cisco", "Fortinet", "Ubiquiti", "MikroTik", "Synology", "HPE", "Dell", "Veeam"],
  valueCards: [
    { icon: "🛡️", title: "شبكة آمنة", text: "جدار حماية، تحكم بالوصول، VPN آمن، وتصميم شبكة داخلية محمية." },
    { icon: "🌐", title: "اتصال مستقر", text: "اتصال سلكي ولاسلكي موثوق للمستخدمين والأجهزة وأنظمة العمل." },
    { icon: "🔌", title: "تمديدات احترافية", text: "تمديدات مهيكلة، تنظيم الراك، ترقيم الكيابل، ونقاط شبكة مفحوصة." },
    { icon: "💾", title: "استمرارية الأعمال", text: "نسخ احتياطي، أنظمة بديلة، وصول عن بُعد، وخطة تعافي من الكوارث." },
    { icon: "📈", title: "تصميم قابل للتوسع", text: "بنية تحتية مصممة لدعم المستخدمين والفروع والأنظمة المستقبلية." },
    { icon: "🔧", title: "جاهز للدعم", text: "توثيق سليم وهيكل دعم فني لصيانة سلسة." },
  ],
  scopeTitle: "نطاق البنية التحتية",
  scopeHighlight: "التقنية المقترح",
  scopeIntro: "يشمل الحل المقترح للبنية التحتية التقنية الأنظمة والخدمات التالية بناءً على نطاق المشروع المحدد وبنود العرض المعتمدة.",
  scopes: [
    { number: "01", icon: "🌐", title: "تصميم وتنفيذ الشبكات", intro: "تصميم شبكة احترافي يضمن اتصالاً مستقراً وتقسيماً سليماً وأداءً موثوقاً وصيانة أسهل.", features: ["تخطيط بنية الشبكة", "تخطيط عناوين IP", "تصميم LAN", "إعداد VLAN", "إعداد السويتشات", "إعداد الراوترات", "تحويل الإنترنت التلقائي", "توثيق الشبكة"] },
    { number: "02", icon: "🛡️", title: "جدار الحماية والأمن السيبراني", intro: "إعداد جدار الحماية والأمان يحمي شبكة الأعمال من الوصول غير المصرح به والتهديدات.", features: ["تركيب جدار حماية", "سياسة أمنية", "التحكم بالوصول للإنترنت", "إعداد VPN", "أمن الوصول عن بُعد", "تصفية المحتوى", "التحكم بالتطبيقات", "أفضل ممارسات الأمان"] },
    { number: "03", icon: "🔌", title: "التمديدات المهيكلة", intro: "التمديدات المهيكلة توفر الأساس المادي لشبكات موثوقة وأنظمة الهاتف والكاميرات والتحكم بالوصول.", features: ["كيابل Cat6 / Cat6A", "ألياف بصرية", "لوحات التوزيع", "تركيب نقاط الشبكة", "تركيب الراك", "ترقيم الكيابل", "فحص الكيابل", "تنظيم الراك"] },
    { number: "04", icon: "📡", title: "شبكة الواي فاي", intro: "شبكة واي فاي بمستوى المؤسسات توفر اتصالاً لاسلكياً موثوقاً للموظفين والزوار والأجهزة.", features: ["تخطيط مواقع نقاط الوصول", "تصميم تغطية الواي فاي", "شبكة الموظفين", "شبكة الضيوف", "فصل بـ VLAN", "إدارة مركزية", "مصادقة آمنة", "دعم التجوال"] },
    { number: "05", icon: "🖥️", title: "حلول السيرفرات والتخزين", intro: "السيرفرات وأنظمة التخزين تدعم البيانات المركزية والتطبيقات ووصول المستخدمين.", features: ["إعداد خادم الملفات", "خادم التطبيقات", "دعم الحوسبة الافتراضية", "إعداد NAS", "إدارة المستخدمين والصلاحيات", "إعداد المجلدات المشتركة", "تخطيط التخزين", "تأمين السيرفر"] },
    { number: "06", icon: "💾", title: "النسخ الاحتياطي والتعافي", intro: "حلول النسخ الاحتياطي تحمي بيانات الأعمال من الحذف العرضي وأعطال الأجهزة والفيروسات.", features: ["نسخ احتياطي محلي", "نسخ احتياطي سحابي", "جدولة النسخ", "مراقبة النسخ", "سياسة الاحتفاظ", "اختبار الاسترجاع", "خطة التعافي", "حماية البيانات الحرجة"] },
    { number: "07", icon: "🔧", title: "الدعم الفني والصيانة", intro: "الدعم الفني المستمر يحافظ على الأداء ويقلل التوقف ويحل المشاكل بسرعة.", features: ["صيانة وقائية", "حل المشاكل", "دعم عن بُعد", "دعم في الموقع", "فحص صحة الشبكة", "فحص جدار الحماية", "فحص السيرفر", "توثيق الأصول"] },
  ],
  deliverables: ["تقييم البنية التحتية التقنية", "تصميم وتخطيط الشبكة", "إعداد جدار الحماية", "إعداد السويتشات والراوترات", "تنفيذ التمديدات المهيكلة", "نشر شبكة الواي فاي", "إعداد السيرفرات والتخزين", "إعداد النسخ الاحتياطي", "إعداد VPN", "الاختبار والتحقق", "التوثيق والترقيم", "تسليم المسؤول/المستخدم", "الدعم حسب الاتفاقية"],
  coverLayers: [{ icon: "🛡️", label: "جدار حماية" }, { icon: "🌐", label: "شبكات" }, { icon: "📡", label: "واي فاي" }, { icon: "🔌", label: "تمديدات" }, { icon: "🖥️", label: "سيرفرات" }, { icon: "💾", label: "نسخ احتياطي" }, { icon: "🔧", label: "دعم فني" }],
};

const HOME_AUTO_AR: TemplateData = {
  tagline: "حوّل مساحة معيشتك بالأتمتة الذكية التي توفر الراحة والأمان والكفاءة في كل زاوية من منزلك.",
  aboutTitle: "أتمتة منزلية ذكية",
  aboutHighlight: "لتجارب معيشية عصرية",
  introParagraphs: [
    "تقدم أوكتونيكس للابتكارات حلول أتمتة منزلية ذكية متميزة تدمج أنظمة الإضاءة والتكييف والأمان والترفيه في تجربة موحدة.",
    "المنزل الذكي أكثر من مجرد تقنية — إنه بيئة تتكيف مع أسلوب حياتك، وتعزز الراحة، وتحسن كفاءة الطاقة، وتوفر راحة البال من خلال الأمان الذكي.",
    "تشمل خدماتنا برمجة KNX، وتصميم الإضاءة الذكية، ودمج التكييف، والستائر الآلية، والصوت متعدد الغرف، وانتركم الفيديو، ودمج الأمان، والتحكم المركزي.",
    "كل مشروع مصمم حول تفضيلات صاحب المنزل والتخطيط المعماري والأنظمة الكهربائية الموجودة وسيناريوهات الأتمتة المطلوبة.",
  ],
  vendors: ["KNX", "Lutron", "Crestron", "Sonos", "Hikvision", "ABB", "Schneider", "Jung"],
  valueCards: [
    { icon: "💡", title: "إضاءة ذكية", text: "تحكم بالإضاءة بالمشاهد، خفت، تعديل الألوان، وجداول تلقائية." },
    { icon: "❄️", title: "تحكم بالمناخ", text: "دمج ذكي للتكييف لراحة وكفاءة في استهلاك الطاقة." },
    { icon: "🎵", title: "صوت متعدد الغرف", text: "أنظمة صوت موزعة مع تحكم بالمناطق وبث مباشر." },
    { icon: "🔒", title: "أمان ذكي", text: "انتركم فيديو، كاميرات مراقبة، دمج إنذار، وتحكم بالوصول." },
    { icon: "🪟", title: "ستائر آلية", text: "ستائر وبرادي آلية مع تتبع الشمس وجدولة زمنية." },
    { icon: "📱", title: "تحكم مركزي", text: "تحكم بكل شيء من تطبيق واحد أو لوحة لمس أو الأوامر الصوتية." },
  ],
  scopeTitle: "نطاق الأتمتة المنزلية",
  scopeHighlight: "الذكية المقترح",
  scopeIntro: "يشمل الحل المقترح للمنزل الذكي أنظمة الأتمتة والخدمات التالية بناءً على متطلبات المشروع.",
  scopes: [
    { number: "01", icon: "💡", title: "نظام التحكم بالإضاءة", intro: "تصميم إضاءة ذكي مع تحكم بالمشاهد والخفت والجدولة التلقائية لكل غرفة.", features: ["برمجة المشاهد", "تحكم بالخفت", "درجة حرارة اللون", "تفعيل بالحركة", "أتمتة شروق/غروب", "مشاهد الحفلات والأفلام"] },
    { number: "02", icon: "❄️", title: "دمج التكييف والمناخ", intro: "إدارة ذكية للمناخ لراحة مثالية وتوفير في الطاقة في جميع أنحاء المنزل.", features: ["دمج الثرموستات", "تحكم بالمناطق", "جدولة تلقائية", "مراقبة الطاقة", "وضع الخروج", "حسب الإشغال"] },
    { number: "03", icon: "🪟", title: "الستائر والبرادي الآلية", intro: "معالجات نوافذ آلية تستجيب للوقت وضوء الشمس والجداول المخصصة.", features: ["تركيب المحركات", "تتبع الشمس", "دمج المشاهد", "تحكم بالمؤقت", "تحكم جماعي", "تجاوز يدوي"] },
    { number: "04", icon: "🔒", title: "الأمان والمراقبة", intro: "أمان شامل مع كاميرات ذكية وانتركم فيديو ودمج نظام الإنذار.", features: ["دمج كاميرات المراقبة", "انتركم فيديو", "حساسات الأبواب", "نظام الإنذار", "كشف الحركة", "مراقبة عن بُعد"] },
    { number: "05", icon: "🎵", title: "صوت ومرئيات متعددة الغرف", intro: "ترفيه موزع مع صوت بالمناطق وإدارة وسائط مركزية.", features: ["صوت بالمناطق", "مصادر البث", "انتركم", "تحكم بالصوت", "موسيقى خلفية", "دمج صوت ومرئيات"] },
    { number: "06", icon: "📱", title: "التحكم المركزي والبرمجة", intro: "تحكم موحد من خلال التطبيقات ولوحات اللمس والمساعدات الصوتية.", features: ["برمجة KNX", "إعداد لوحة اللمس", "إعداد التطبيق", "المساعد الصوتي", "إنشاء المشاهد", "وصول عن بُعد"] },
  ],
  deliverables: ["مسح الموقع والتخطيط", "برمجة نظام KNX", "إعداد مشاهد الإضاءة", "دمج التكييف", "تركيب محركات الستائر", "إعداد نظام الصوت", "دمج الأمان", "إعداد لوحة اللمس", "إعداد التطبيق", "الاختبار والتسليم", "تدريب المستخدم", "التوثيق"],
  coverLayers: [{ icon: "💡", label: "إضاءة" }, { icon: "❄️", label: "تكييف" }, { icon: "🪟", label: "ستائر" }, { icon: "🔒", label: "أمان" }, { icon: "🎵", label: "صوت" }, { icon: "📱", label: "تحكم" }],
};

const BUILDING_AUTO_AR: TemplateData = { ...IT_INFRA_AR, tagline: "أنظمة إدارة مباني ذكية لبيئات تجارية فعالة ومستدامة ومريحة.", aboutTitle: "أتمتة مباني ذكية", aboutHighlight: "لمساحات تجارية فعالة", coverLayers: [{ icon: "🏢", label: "إدارة مباني" }, { icon: "❄️", label: "تكييف" }, { icon: "💡", label: "إضاءة" }, { icon: "🔐", label: "تحكم وصول" }, { icon: "🔥", label: "إنذار حريق" }, { icon: "⚡", label: "طاقة" }] };
const SOFTWARE_DEV_AR: TemplateData = { ...IT_INFRA_AR, tagline: "حلول برمجية مخصصة لرقمنة وأتمتة وتوسيع عملياتك التجارية.", aboutTitle: "تطوير برمجيات مخصصة", aboutHighlight: "للتحول الرقمي", coverLayers: [{ icon: "🎨", label: "تصميم" }, { icon: "⚙️", label: "باك إند" }, { icon: "📱", label: "موبايل" }, { icon: "☁️", label: "سحابي" }, { icon: "🔗", label: "API" }, { icon: "🧪", label: "اختبار" }] };

const SLUG_MAP_AR: Record<string, TemplateData> = {
  "it-infrastructure": IT_INFRA_AR,
  "smart-home-automation": HOME_AUTO_AR,
  "software-development": SOFTWARE_DEV_AR,
  "cctv-access-control": IT_INFRA_AR,
  "amc-maintenance": IT_INFRA_AR,
  "general-trading": IT_INFRA_AR,
  "it-infra": IT_INFRA_AR,
  "smart-home": HOME_AUTO_AR,
  "home-automation": HOME_AUTO_AR,
  "building-automation": BUILDING_AUTO_AR,
  "software-dev": SOFTWARE_DEV_AR,
};

export function getTemplateData(slug: string, lang: string = "en"): TemplateData {
  const map = lang === "ar" ? SLUG_MAP_AR : SLUG_MAP;
  return map[slug] || (lang === "ar" ? IT_INFRA_AR : IT_INFRA);
}
