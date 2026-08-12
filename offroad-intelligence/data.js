window.OFFROAD_DATA = {
  segments: ["Agriculture", "Construction", "Material Handling", "Turf & Grounds Care", "Specialty Offroad", "Mining"],
  perspectives: ["Sales", "R&D", "Product Mgmt", "Innovation", "Procurement", "Strategy"],
  signals: [
    {
      id: "INT-001",
      time: "08:15",
      perspective: "Sales",
      priority: "High",
      segment: "Agriculture / Construction",
      entity: "Integrated cabin suppliers",
      category: "Products, technology, and customers",
      signal: "Integrated cabin capabilities become more visible in offroad and adjacent operator environments",
      why: "Customers may expect more bundled seating, controls, comfort and interior modules rather than individual components.",
      action: "Review which GRAMMER components can be bundled into customer-specific offroad package logic.",
      owner: "Sales / Product Mgmt"
    },
    {
      id: "INT-002",
      time: "09:40",
      perspective: "R&D",
      priority: "High",
      segment: "Material Handling / Construction",
      entity: "Automation ecosystem",
      category: "Products, technology, and customers",
      signal: "Automation changes operator role and future seat/cabin requirements",
      why: "Material handling and construction machines may need more intelligent operator environment concepts.",
      action: "Map seats, armrests, HMI and sensor-related ideas against automated offroad use cases.",
      owner: "Innovation / R&D"
    },
    {
      id: "INT-003",
      time: "10:30",
      perspective: "Product Mgmt",
      priority: "Medium",
      segment: "Agriculture / Turf & Grounds Care",
      entity: "Premium comfort and materials",
      category: "Consumer preferences",
      signal: "Comfort, ergonomics and tactile quality remain relevant differentiators",
      why: "Operators spend long hours in machines, making comfort and durability important in purchasing discussions.",
      action: "Create sample and argumentation logic for comfort, ergonomics, durability and surface quality.",
      owner: "Product Mgmt"
    },
    {
      id: "INT-004",
      time: "11:05",
      perspective: "Procurement",
      priority: "High",
      segment: "All Offroad segments",
      entity: "Geopolitics / materials",
      category: "Geopolitical and regulation",
      signal: "Critical materials and geopolitical uncertainty remain supply chain watch items",
      why: "Potential material access, cost and supplier reliability issues may affect future product and sourcing decisions.",
      action: "Keep geopolitical risk linked to supplier mapping and alternative materials.",
      owner: "Procurement"
    },
    {
      id: "INT-005",
      time: "13:20",
      perspective: "Sales",
      priority: "Medium",
      segment: "Material Handling",
      entity: "Material handling OEMs",
      category: "Products, technology, and customers",
      signal: "Warehouse automation investments reshape industrial truck value proposition",
      why: "Connected and semi-autonomous operations may alter seating and operator environment requirements.",
      action: "Prepare customer-specific opportunity cards for material handling accounts.",
      owner: "KAM / Sales"
    }
  ],
  competitors: [
    {
      name: "Isringhausen",
      relevance: "High",
      positioning: "Offroad seating / operator seating",
      segments: "Agriculture; Construction; Material Handling",
      overlaps: "John Deere; CNH; AGCO; CAT; JCB; KION; Jungheinrich",
      wins: ["Global engineering and Offroad seating expertise", "Long-term OEM partnership capability", "Cross-segment know-how"],
      loses: ["Incumbent position may be strong", "Local response speed can matter", "Customer-specific project history may favor competitor"],
      questions: ["Which customer projects are at risk?", "Which product gap is exploited?", "Where does GRAMMER have clear differentiation?"],
      counter: "Emphasize global engineering depth, proven Offroad seating expertise, comfort, ergonomics, durability and long-term OEM partnership capability."
    },
    {
      name: "Sears Seating",
      relevance: "High",
      positioning: "Offroad and industrial seating",
      segments: "Agriculture; Construction; Turf & Grounds Care",
      overlaps: "John Deere; CNH; AGCO; turf and grounds-care OEMs",
      wins: ["GRAMMER global footprint", "Premium comfort story", "Engineering and durability positioning"],
      loses: ["Regional familiarity", "Existing relationships", "Price-driven decisions"],
      questions: ["Where does regional customer familiarity matter most?", "Which accounts need stronger GRAMMER counter-message?", "Which applications require benchmarking?"],
      counter: "Position GRAMMER as global partner with premium comfort, cross-segment knowledge and scalable support."
    },
    {
      name: "KAB Seating",
      relevance: "Medium",
      positioning: "Suspension and operator seating",
      segments: "Construction; Agriculture; Material Handling",
      overlaps: "Construction and industrial equipment OEMs",
      wins: ["Broader GRAMMER platform capability", "Lifecycle quality", "Integrated operator environment logic"],
      loses: ["Focused niche offering", "Fast customization", "Simple suspension solution requests"],
      questions: ["Is the customer buying a component or a system solution?", "Where can GRAMMER bundle extra value?", "Which niche applications require closer monitoring?"],
      counter: "Counter with lifecycle quality, broader engineering scope and integrated operator environment logic."
    }
  ],
  technologies: [
    { theme: "Automation / operator assist", maturity: "Emerging", relevance: "High", segments: "Material Handling; Construction", watch: "OEM partnerships; sensor integration; autonomous fleet announcements", owner: "Innovation / R&D" },
    { theme: "Electrification", maturity: "Scaling", relevance: "High", segments: "Agriculture; Construction; Material Handling", watch: "EV platform launches; battery packaging changes", owner: "Product Management" },
    { theme: "Ergonomics and comfort", maturity: "Established / evolving", relevance: "High", segments: "All Offroad segments", watch: "New premium seat options; customer comfort claims", owner: "Product Management" },
    { theme: "HMI / sensors", maturity: "Emerging", relevance: "Medium", segments: "Material Handling; Construction", watch: "New HMI cockpit concepts; partner announcements", owner: "R&D" },
    { theme: "Sustainable materials", maturity: "Evolving", relevance: "Medium", segments: "Agriculture; Construction; Turf & Grounds Care", watch: "Bio-based materials; recycled content; regulation", owner: "Sustainability / Product Mgmt" }
  ],
  roadmap: [
    { theme: "AI technology", deliverables: "AI summary, tagging, Why it matters, Recommended action, score proposal, PDF summarization later" },
    { theme: "Data visualizations", deliverables: "Trend radar, competitor radar, customer-competitor map, risk heatmap, opportunity funnel" },
    { theme: "User engagement", deliverables: "Filters by segment, customer, competitor, region and function; saved views; weekly digest" },
    { theme: "Competitive enablement", deliverables: "Competitor profiles, win/loss, battlecards, benchmarking and questions to ask" },
    { theme: "Near real-time + weekly", deliverables: "Daily source monitoring, weekly digest and immediate high-priority alerts" }
  ],
  weeklyDigest: [
    { section: "Top Offroad Signals", content: "Top 10 signals based on priority score and analyst review", audience: "Sales, Product Mgmt, R&D, Innovation" },
    { section: "Customer Alerts", content: "Signals linked to key customers and OEMs", audience: "Sales / KAM" },
    { section: "Competitor Alerts", content: "New competitor moves, strategy shifts and footprint changes", audience: "Sales, Product Mgmt" },
    { section: "Technology Watch", content: "Automation, electrification, HMI, sensors, ergonomics and sustainable materials", audience: "R&D, Innovation, Product Mgmt" },
    { section: "Opportunities", content: "Open opportunities created or updated this week", audience: "Sales, Innovation" },
    { section: "Risks", content: "High or changed risks", audience: "Procurement, Product Mgmt, Strategy" },
    { section: "Optional Management Radar", content: "Only top priorities that may need management visibility", audience: "Management optional" }
  ]
};
