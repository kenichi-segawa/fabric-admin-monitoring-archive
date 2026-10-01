const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const reportName = "Admin Monitoring Governance & Adoption";
const reportDir = path.join(root, `${reportName}.Report`);
const definitionDir = path.join(reportDir, "definition");
const pagesDir = path.join(definitionDir, "pages");
const themeId = "a1c9e7d4";
const themeFile = `AdminGovernanceCool-${themeId}.json`;

const schemas = {
  report: "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/report/3.2.0/schema.json",
  pages: "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/pagesMetadata/1.0.0/schema.json",
  page: "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/2.1.0/schema.json",
  visual: "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.9.0/schema.json",
  version: "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/versionMetadata/1.0.0/schema.json",
};

function id(seed, length = 20) {
  return crypto.createHash("sha256").update(seed).digest("hex").slice(0, length);
}

function pageId(seed) {
  return `ReportSection${id(seed, 24)}`;
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function litString(value) {
  return { expr: { Literal: { Value: `'${String(value).replace(/'/g, "''")}'` } } };
}

function litBool(value) {
  return { expr: { Literal: { Value: value ? "true" : "false" } } };
}

function litNumber(value) {
  return { expr: { Literal: { Value: `${value}D` } } };
}

function litInteger(value) {
  return { expr: { Literal: { Value: `${value}L` } } };
}

function literalColor(value) {
  return { solid: { color: litString(value) } };
}

function columnField(entity, property) {
  return {
    Column: {
      Expression: { SourceRef: { Entity: entity } },
      Property: property,
    },
  };
}

function measureField(entity, property) {
  return {
    Measure: {
      Expression: { SourceRef: { Entity: entity } },
      Property: property,
    },
  };
}

function projection(binding) {
  const field =
    binding.kind === "measure"
      ? measureField(binding.table, binding.name)
      : columnField(binding.table, binding.name);
  return {
    field,
    queryRef: `${binding.table}.${binding.name}`,
    nativeQueryRef: binding.name,
    ...(binding.active ? { active: true } : {}),
  };
}

function position(x, y, width, height, order) {
  return {
    x,
    y,
    z: 1000 + order * 100,
    width,
    height,
    tabOrder: order,
  };
}

function baseVco(title, altText, options = {}) {
  const showTitle = Boolean(title);
  return {
    title: [
      {
        properties: {
          show: litBool(showTitle),
          ...(showTitle
            ? {
                text: litString(title),
                heading: litString("Heading3"),
                fontSize: litNumber(12),
                fontColor: literalColor("#243447"),
                bold: litBool(true),
              }
            : {}),
        },
      },
    ],
    general: [
      {
        properties: {
          altText:
            typeof altText === "object"
              ? { expr: altText }
              : litString(altText || title || "Report visual"),
        },
      },
    ],
    background: [
      {
        properties: {
          show: litBool(options.background !== false),
          color: literalColor(options.backgroundColor || "#FFFFFF"),
          transparency: litNumber(0),
        },
      },
    ],
    border: [
      {
        properties: {
          show: litBool(options.border !== false),
          color: literalColor("#DCE3EA"),
          width: litNumber(1),
          radius: litNumber(8),
        },
      },
    ],
    padding: [
      {
        properties: {
          top: litNumber(options.padding ?? 8),
          bottom: litNumber(options.padding ?? 8),
          left: litNumber(options.padding ?? 8),
          right: litNumber(options.padding ?? 8),
        },
      },
    ],
    visualHeader: [{ properties: { show: litBool(false) } }],
  };
}

function visualContainer(name, pos, visual) {
  return {
    $schema: schemas.visual,
    name,
    position: pos,
    visual: {
      ...visual,
      drillFilterOtherVisuals: true,
    },
  };
}

function textbox(name, pos, text, fontSize = 24, color = "#243447", weight = "bold") {
  return visualContainer(name, pos, {
    visualType: "textbox",
    objects: {
      general: [
        {
          properties: {
            paragraphs: [
              {
                textRuns: [
                  {
                    value: text,
                    textStyle: {
                      fontFamily: "Segoe UI Semibold",
                      fontSize: `${fontSize}px`,
                      color,
                      fontWeight: weight,
                    },
                  },
                ],
                horizontalTextAlignment: "left",
              },
            ],
          },
        },
      ],
    },
    visualContainerObjects: {
      background: [{ properties: { show: litBool(false) } }],
      border: [{ properties: { show: litBool(false) } }],
      padding: [
        {
          properties: {
            top: litNumber(0),
            bottom: litNumber(0),
            left: litNumber(0),
            right: litNumber(0),
          },
        },
      ],
      general: [{ properties: { altText: litString(text) } }],
    },
  });
}

function card(name, pos, measures, altText) {
  return visualContainer(name, pos, {
    visualType: "cardVisual",
    query: {
      queryState: {
        Data: {
          projections: measures.map((m) => projection({ ...m, kind: "measure" })),
        },
      },
    },
    objects: {
      cardCalloutArea: [
        {
          properties: {
            show: litBool(true),
            paddingUniform: litInteger(8),
            rectangleRoundedCurve: litInteger(6),
            backgroundFillColor: literalColor("#FFFFFF"),
            backgroundTransparency: litNumber(0),
          },
        },
      ],
      layout: [
        {
          properties: {
            style: litString("Table"),
            customizeLines: litBool(true),
            gridlineWidth: litNumber(1),
            gridlineColor: literalColor("#DCE3EA"),
            gridlineTransparency: litNumber(0),
            gridlineStyle: litString("solid"),
            topOuterMargin: litInteger(0),
            bottomOuterMargin: litInteger(0),
            leftOuterMargin: litInteger(0),
            rightOuterMargin: litInteger(0),
            paddingUniform: litInteger(0),
          },
          selector: { id: "default" },
        },
      ],
      value: [
        {
          properties: {
            fontSize: litNumber(24),
            fontColor: literalColor("#0078D4"),
            bold: litBool(true),
          },
          selector: { id: "default" },
        },
      ],
      label: [
        {
          properties: {
            show: litBool(true),
            fontSize: litNumber(10),
            fontColor: literalColor("#52606D"),
          },
          selector: { id: "default" },
        },
      ],
      outline: [
        {
          properties: { show: litBool(false) },
          selector: { id: "default" },
        },
      ],
    },
    visualContainerObjects: baseVco(null, altText, { padding: 0 }),
  });
}

function chart(name, pos, type, roles, title, altText, sortMeasure) {
  const queryState = {};
  for (const [role, bindings] of Object.entries(roles)) {
    const values = Array.isArray(bindings) ? bindings : [bindings];
    queryState[role] = { projections: values.map(projection) };
  }
  const query = { queryState };
  if (sortMeasure) {
    query.sortDefinition = {
      sort: [{ field: measureField(sortMeasure.table, sortMeasure.name), direction: "Descending" }],
      isDefaultSort: false,
    };
  }
  const objects = {};
  if (["barChart", "clusteredBarChart"].includes(type)) {
    objects.valueAxis = [
      {
        properties: {
          start: litNumber(0),
          show: litBool(false),
          gridlineShow: litBool(false),
        },
      },
    ];
    objects.labels = [{ properties: { show: litBool(true), fontSize: litNumber(9) } }];
  }
  if (type === "lineChart") {
    objects.lineStyles = [
      {
        properties: {
          strokeWidth: litNumber(2.5),
          lineChartType: litString("linear"),
          showMarker: litBool(false),
        },
      },
    ];
    objects.dataPoint = [{ properties: { transparency: litNumber(10) } }];
  }
  return visualContainer(name, pos, {
    visualType: type,
    query,
    objects,
    visualContainerObjects: baseVco(title, altText),
  });
}

function tableVisual(name, pos, bindings, title, altText) {
  return visualContainer(name, pos, {
    visualType: "tableEx",
    query: {
      queryState: {
        Values: { projections: bindings.map(projection) },
      },
    },
    objects: {
      columnHeaders: [
        {
          properties: {
            columnAdjustment: litString("growToFit"),
            autoSizeColumnWidth: litBool(true),
          },
        },
      ],
    },
    visualContainerObjects: {
      ...baseVco(title, altText),
      stylePreset: [{ properties: { name: litString("None") } }],
    },
  });
}

function slicer(name, pos, binding, label, mode = "Dropdown", syncGroup) {
  return visualContainer(name, pos, {
    visualType: "slicer",
    ...(syncGroup
      ? { syncGroup: { groupName: syncGroup, fieldChanges: true, filterChanges: true } }
      : {}),
    query: {
      queryState: {
        Values: { projections: [projection(binding)] },
      },
    },
    objects: {
      data: [{ properties: { mode: litString(mode) } }],
      header: [
        {
          properties: {
            show: litBool(true),
            text: litString(label),
          },
        },
      ],
    },
    visualContainerObjects: baseVco(null, `Filter by ${label}`, { padding: 0 }),
  });
}

function navigator(name, pos) {
  return visualContainer(name, pos, {
    visualType: "pageNavigator",
    visualContainerObjects: baseVco(null, "Navigate report pages", {
      padding: 0,
      background: false,
      border: false,
    }),
  });
}

function backButton(name, pos) {
  return visualContainer(name, pos, {
    visualType: "actionButton",
    objects: {
      text: [
        {
          properties: {
            show: litBool(true),
            text: litString("Back"),
            fontFamily: litString("Segoe UI Semibold"),
            fontSize: litNumber(12),
            fontColor: literalColor("#0078D4"),
            horizontalAlignment: litString("center"),
            verticalAlignment: litString("middle"),
          },
          selector: { id: "default" },
        },
      ],
    },
    visualContainerObjects: {
      ...baseVco(null, "Return to the previous report page", { padding: 0 }),
      visualLink: [
        {
          properties: {
            show: litBool(true),
            type: litString("Back"),
            enabledTooltip: litString("Return to the previous page"),
          },
        },
      ],
    },
  });
}

const pages = [];

function createPage(seed, displayName, options = {}) {
  const name = pageId(seed);
  const page = {
    name,
    displayName,
    visuals: [],
    drillthrough: options.drillthrough,
  };
  pages.push(page);
  return page;
}

function add(page, seed, factory) {
  const visualName = id(`${page.name}:${seed}`);
  page.visuals.push({ name: visualName, json: factory(visualName) });
}

const M = (table, name) => ({ table, name, kind: "measure" });
const C = (table, name, active = false) => ({ table, name, kind: "column", active });

const p1 = createPage("executive", "Usage concentrates in a small set of workspaces");
add(p1, "title", (n) => textbox(n, position(32, 24, 1120, 56, 1), p1.displayName, 28));
add(p1, "period", (n) => slicer(n, position(1392, 16, 240, 80, 2), C("Date", "Year Month"), "Period", "Dropdown", "PeriodSync"));
add(p1, "itemtype", (n) => slicer(n, position(1648, 16, 240, 80, 3), C("Items", "Item Type"), "Item Type"));
add(p1, "kpis", (n) =>
  card(
    n,
    position(32, 112, 1856, 144, 4),
    [
      M("Usage Activity", "Total Activities"),
      M("Usage Activity", "Report Views"),
      M("Usage Activity", "Active Users"),
      M("Usage Activity", "Active Workspaces"),
      M("Usage Activity", "Report Adoption Rate"),
      M("Usage Activity", "Inactive Reports 90D"),
    ],
    "Tenant activity, report views, users, workspaces, report adoption, and inactive-report counts."
  )
);
add(p1, "trend", (n) =>
  chart(
    n,
    position(32, 280, 1080, 400, 5),
    "lineChart",
    { Category: C("Date", "Date", true), Y: [M("Usage Activity", "Total Activities"), M("Usage Activity", "Report Views")] },
    "Activity and report views over time",
    measureField("Usage Activity", "Activity Trend Alt Text")
  )
);
add(p1, "ranking", (n) =>
  chart(
    n,
    position(1136, 280, 752, 400, 6),
    "barChart",
    { Category: C("Workspaces", "Workspace Name", true), Y: M("Usage Activity", "Report Views") },
    "Workspaces ranked by report views",
    "Sorted workspace comparison showing where report viewing is concentrated.",
    M("Usage Activity", "Report Views")
  )
);
add(p1, "risk", (n) =>
  tableVisual(
    n,
    position(32, 704, 1856, 280, 7),
    [
      C("Items", "Item Name"),
      C("Workspaces", "Workspace Name"),
      M("Usage Activity", "Last Activity Date"),
      M("Usage Activity", "Days Since Last Activity"),
      C("Items", "Endorsement"),
      C("Items", "Sensitivity Label"),
    ],
    "Reports requiring governance review",
    "Report action queue with workspace, last activity, dormancy, endorsement, and sensitivity label."
  )
);
add(p1, "nav", (n) => navigator(n, position(32, 1000, 1856, 48, 8)));

const p2 = createPage("adoption", "Activity trends reveal how adoption changes over time");
add(p2, "title", (n) => textbox(n, position(32, 24, 960, 56, 1), p2.displayName, 28));
add(p2, "date", (n) => slicer(n, position(1120, 16, 248, 80, 2), C("Date", "Date"), "Date Range", "Between", "DateSync"));
add(p2, "workspace", (n) => slicer(n, position(1384, 16, 240, 80, 3), C("Workspaces", "Workspace Name"), "Workspace"));
add(p2, "operation", (n) => slicer(n, position(1640, 16, 248, 80, 4), C("Usage Activity", "Operation"), "Operation"));
add(p2, "trend", (n) =>
  chart(
    n,
    position(32, 112, 1856, 432, 5),
    "lineChart",
    {
      Category: C("Date", "Date", true),
      Y: [M("Usage Activity", "Total Activities"), M("Usage Activity", "Report Views"), M("Usage Activity", "Active Users")],
    },
    "Daily adoption trend",
    measureField("Usage Activity", "Activity Trend Alt Text")
  )
);
add(p2, "operations", (n) =>
  chart(
    n,
    position(32, 568, 602, 208, 6),
    "barChart",
    { Category: C("Usage Activity", "Operation", true), Y: M("Usage Activity", "Total Activities") },
    "Top operations",
    "Operations ranked by archived activity count.",
    M("Usage Activity", "Total Activities")
  )
);
add(p2, "consumption", (n) =>
  chart(
    n,
    position(658, 568, 602, 208, 7),
    "barChart",
    { Category: C("Usage Activity", "Consumption Method", true), Y: M("Usage Activity", "Report Views") },
    "Report consumption methods",
    "Consumption methods ranked by report views.",
    M("Usage Activity", "Report Views")
  )
);
add(p2, "workspaceusers", (n) =>
  chart(
    n,
    position(1284, 568, 604, 208, 8),
    "barChart",
    { Category: C("Workspaces", "Workspace Name", true), Y: M("Usage Activity", "Active Users") },
    "Workspace user reach",
    "Workspaces ranked by distinct active users.",
    M("Usage Activity", "Active Users")
  )
);
add(p2, "detail", (n) =>
  tableVisual(
    n,
    position(32, 800, 1856, 216, 9),
    [
      C("Date", "Date"),
      C("Workspaces", "Workspace Name"),
      C("Usage Activity", "Operation"),
      C("Usage Activity", "Consumption Method"),
      M("Usage Activity", "Total Activities"),
      M("Usage Activity", "Active Users"),
    ],
    "Activity detail",
    "Daily aggregate activity detail by workspace, operation, and consumption method."
  )
);
add(p2, "nav", (n) => navigator(n, position(32, 1032, 1856, 32, 10)));

const p3 = createPage("inactive", "Inactive reports surface the strongest retirement candidates");
add(p3, "title", (n) => textbox(n, position(32, 24, 1000, 56, 1), p3.displayName, 28));
add(p3, "window", (n) => slicer(n, position(1392, 16, 240, 80, 2), C("Dormancy Window", "Window"), "Dormancy Window"));
add(p3, "workspace", (n) => slicer(n, position(1648, 16, 240, 80, 3), C("Workspaces", "Workspace Name"), "Workspace"));
add(p3, "kpis", (n) =>
  card(
    n,
    position(32, 112, 1856, 144, 4),
    [
      M("Usage Activity", "Total Reports"),
      M("Usage Activity", "Viewed Reports"),
      M("Usage Activity", "Inactive Reports Selected Window"),
      M("Usage Activity", "Reports Never Viewed"),
    ],
    "Report inventory, viewed reports, selected-window inactive reports, and reports never viewed."
  )
);
add(p3, "history", (n) =>
  chart(
    n,
    position(32, 280, 1080, 400, 5),
    "lineChart",
    { Category: C("Date", "Year Month", true), Series: C("Items", "Item Name"), Y: M("Usage Activity", "Report Views") },
    "Report view history",
    "Report-level view trends reveal sustained inactivity and recovery."
  )
);
add(p3, "ranking", (n) =>
  chart(
    n,
    position(1136, 280, 752, 400, 6),
    "barChart",
    { Category: C("Items", "Item Name", true), Y: M("Usage Activity", "Days Since Last Activity") },
    "Longest report inactivity",
    measureField("Usage Activity", "Inactivity Alt Text"),
    M("Usage Activity", "Days Since Last Activity")
  )
);
add(p3, "candidates", (n) =>
  tableVisual(
    n,
    position(32, 704, 1856, 280, 7),
    [
      C("Items", "Item Name"),
      C("Workspaces", "Workspace Name"),
      M("Usage Activity", "Last Activity Date"),
      M("Usage Activity", "Days Since Last Activity"),
      M("Usage Activity", "Report Views 365D"),
      C("Items", "Endorsement"),
      C("Items", "Sensitivity Label"),
      C("Items", "Item URL"),
    ],
    "Retirement candidates",
    "Reports ranked for governance review by inactivity, recent views, endorsement, and sensitivity label."
  )
);
add(p3, "nav", (n) => navigator(n, position(32, 1000, 1856, 48, 8)));

const p4 = createPage("workspace", "Workspace and capacity comparisons expose adoption gaps");
add(p4, "title", (n) => textbox(n, position(32, 24, 1060, 56, 1), p4.displayName, 28));
add(p4, "type", (n) => slicer(n, position(1392, 16, 240, 80, 2), C("Workspaces", "Workspace Type"), "Workspace Type"));
add(p4, "capacity", (n) => slicer(n, position(1648, 16, 240, 80, 3), C("Capacities", "Capacity Name"), "Capacity"));
add(p4, "ranking", (n) =>
  chart(
    n,
    position(32, 112, 1080, 432, 4),
    "barChart",
    { Category: C("Workspaces", "Workspace Name", true), Y: M("Usage Activity", "Report Views") },
    "Workspace report-view ranking",
    "Workspaces ranked by report views.",
    M("Usage Activity", "Report Views")
  )
);
add(p4, "capacitycomp", (n) =>
  chart(
    n,
    position(1136, 112, 752, 432, 5),
    "clusteredBarChart",
    {
      Category: C("Capacities", "Capacity Name", true),
      Y: [M("Usage Activity", "Total Activities"), M("Usage Activity", "Active Users")],
    },
    "Capacity activity and users",
    "Capacity comparison of total activities and active users.",
    M("Usage Activity", "Total Activities")
  )
);
add(p4, "multiples", (n) =>
  chart(
    n,
    position(32, 568, 1856, 208, 6),
    "lineChart",
    { Category: C("Date", "Date", true), Rows: C("Workspaces", "Workspace Name"), Y: M("Usage Activity", "Report Views") },
    "Workspace report-view trends",
    "Shared-scale workspace trends reveal consistent and intermittent adoption."
  )
);
add(p4, "detail", (n) =>
  tableVisual(
    n,
    position(32, 800, 1856, 216, 7),
    [
      C("Workspaces", "Workspace Name"),
      C("Workspaces", "Workspace Type"),
      C("Capacities", "Capacity Name"),
      M("Usage Activity", "Report Views"),
      M("Usage Activity", "Active Users"),
      M("Usage Activity", "Active Items"),
      M("Usage Activity", "Last Activity Date"),
    ],
    "Workspace adoption detail",
    "Workspace-level activity, users, items, and recency."
  )
);
add(p4, "nav", (n) => navigator(n, position(32, 1032, 1856, 32, 8)));

const p5 = createPage("governance", "Sharing and governance controls reveal concentration of risk");
add(p5, "title", (n) => textbox(n, position(32, 24, 960, 56, 1), p5.displayName, 28));
add(p5, "itemtype", (n) => slicer(n, position(1120, 16, 248, 80, 2), C("Governance Items", "Item Type"), "Item Type"));
add(p5, "workspace", (n) => slicer(n, position(1384, 16, 240, 80, 3), C("Workspaces", "Workspace Name"), "Workspace"));
add(p5, "label", (n) => slicer(n, position(1640, 16, 248, 80, 4), C("Sensitivity Labels", "Label Name"), "Sensitivity Label"));
add(p5, "kpis", (n) =>
  card(
    n,
    position(32, 112, 1856, 144, 5),
    [
      M("Sharing Items", "Shared Items"),
      M("Sharing Items", "Whole-Organization Shared Items"),
      M("Sharing Items", "DLP Violations"),
      M("Governance Items", "Label Coverage %"),
      M("Governance Items", "Endorsement Coverage %"),
    ],
    "Sharing, whole-organization exposure, DLP violations, label coverage, and endorsement coverage."
  )
);
add(p5, "coverage", (n) =>
  chart(
    n,
    position(32, 280, 1240, 400, 6),
    "clusteredColumnChart",
    {
      Category: C("Governance Items", "Item Type", true),
      Y: [
        M("Governance Items", "Label Coverage %"),
        M("Governance Items", "Endorsement Coverage %"),
        M("Governance Items", "Domain Assignment %"),
      ],
      Rows: C("Governance Items", "Item Type"),
    },
    "Governance coverage by item type",
    "Small multiples compare label, endorsement, and domain coverage by item type."
  )
);
add(p5, "risk", (n) =>
  chart(
    n,
    position(1296, 280, 592, 400, 7),
    "barChart",
    { Category: C("Workspaces", "Workspace Name", true), Y: M("Sharing Items", "Governance Risk Items") },
    "Workspace sharing and DLP risk",
    measureField("Sharing Items", "Governance Risk Alt Text"),
    M("Sharing Items", "Governance Risk Items")
  )
);
add(p5, "detail", (n) =>
  tableVisual(
    n,
    position(32, 704, 1856, 280, 8),
    [
      C("Governance Items", "Item Name"),
      C("Governance Items", "Item Type"),
      C("Workspaces", "Workspace Name"),
      C("Governance Items", "Labeled"),
      C("Governance Items", "Endorsement"),
      C("Governance Items", "Shared With Whole Organization"),
      C("Governance Items", "DLP Policy Violation"),
      C("Governance Items", "Last Access Date"),
      C("Governance Items", "Item URL"),
    ],
    "Governance action queue",
    "Items requiring label, endorsement, sharing, DLP, or access review."
  )
);
add(p5, "nav", (n) => navigator(n, position(32, 1000, 1856, 48, 9)));

const p6 = createPage("users", "User activity detail explains adoption patterns safely", {
  drillthrough: { table: "Users", column: "User UPN" },
});
add(p6, "title", (n) => textbox(n, position(32, 24, 1480, 56, 1), p6.displayName, 28));
add(p6, "back", (n) => backButton(n, position(1648, 24, 240, 56, 2)));
add(p6, "privacy", (n) =>
  textbox(
    n,
    position(32, 112, 288, 96, 2),
    "Restricted detail: user identities are shown only to authorized governance reviewers.",
    14,
    "#D13438",
    "normal"
  )
);
add(p6, "user", (n) => slicer(n, position(32, 224, 288, 80, 3), C("Users", "User UPN"), "User"));
add(p6, "date", (n) => slicer(n, position(32, 320, 288, 112, 4), C("Date", "Date"), "Date Range", "Between"));
add(p6, "workspace", (n) => slicer(n, position(32, 448, 288, 80, 5), C("Workspaces", "Workspace Name"), "Workspace"));
add(p6, "operation", (n) => slicer(n, position(32, 544, 288, 80, 6), C("Usage Activity", "Operation"), "Operation"));
add(p6, "trend", (n) =>
  chart(
    n,
    position(344, 112, 1544, 432, 7),
    "lineChart",
    { Category: C("Date", "Date", true), Y: [M("Usage Activity", "Current User Activities"), M("Usage Activity", "Current User Report Views")] },
    "Selected-user activity trend",
    "Restricted user activity and report views over time."
  )
);
add(p6, "operations", (n) =>
  chart(
    n,
    position(344, 568, 760, 208, 8),
    "barChart",
    { Category: C("Usage Activity", "Operation", true), Y: M("Usage Activity", "Current User Activities") },
    "Selected-user operations",
    "Operations ranked for the selected user.",
    M("Usage Activity", "Current User Activities")
  )
);
add(p6, "workspaces", (n) =>
  chart(
    n,
    position(1128, 568, 760, 208, 9),
    "barChart",
    { Category: C("Workspaces", "Workspace Name", true), Y: M("Usage Activity", "Current User Activities") },
    "Selected-user workspaces",
    "Workspaces ranked by selected-user activities.",
    M("Usage Activity", "Current User Activities")
  )
);
add(p6, "detail", (n) =>
  tableVisual(
    n,
    position(344, 800, 1544, 216, 10),
    [
      C("Date", "Date"),
      C("Users", "User UPN"),
      C("Workspaces", "Workspace Name"),
      C("Items", "Item Name"),
      C("Usage Activity", "Operation"),
      C("Usage Activity", "Consumption Method"),
      C("Usage Activity", "Result Status"),
      M("Usage Activity", "Total Activities"),
    ],
    "Selected-user activity detail",
    "Restricted detailed activity for the selected user."
  )
);
add(p6, "nav", (n) => navigator(n, position(32, 1032, 1856, 32, 11)));

fs.rmSync(reportDir, { recursive: true, force: true });
fs.mkdirSync(path.join(definitionDir, "pages"), { recursive: true });

writeJson(path.join(root, `${reportName}.pbip`), {
  $schema: "https://developer.microsoft.com/json-schemas/fabric/pbip/pbipProperties/1.0.0/schema.json",
  version: "1.0",
  artifacts: [{ report: { path: `${reportName}.Report` } }],
  settings: { enableAutoRecovery: true },
});

writeJson(path.join(reportDir, "definition.pbir"), {
  $schema: "https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/2.0.0/schema.json",
  version: "4.0",
  datasetReference: {
    byPath: { path: "../Admin Monitoring Historical Analytics.SemanticModel" },
  },
});

writeJson(path.join(reportDir, ".platform"), {
  $schema: "https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json",
  metadata: { type: "Report", displayName: reportName },
  config: { version: "2.0", logicalId: "11111111-1111-4111-8111-111111111111" },
});

writeJson(path.join(definitionDir, "version.json"), {
  $schema: schemas.version,
  version: "2.0.0",
});

writeJson(path.join(definitionDir, "report.json"), {
  $schema: schemas.report,
  themeCollection: {
    customTheme: {
      name: themeFile,
      reportVersionAtImport: { visual: "2.9.0", report: "3.2.0", page: "2.1.0" },
      type: "RegisteredResources",
    },
  },
  resourcePackages: [
    {
      name: "RegisteredResources",
      type: "RegisteredResources",
      items: [{ name: themeFile, path: themeFile, type: "CustomTheme" }],
    },
  ],
  settings: {
    useStylableVisualContainerHeader: true,
    defaultDrillFilterOtherVisuals: true,
    allowChangeFilterTypes: true,
    useEnhancedTooltips: true,
  },
});

writeJson(path.join(definitionDir, "pages", "pages.json"), {
  $schema: schemas.pages,
  pageOrder: pages.map((p) => p.name),
  activePageName: pages[0].name,
});

for (const page of pages) {
  const pagePath = path.join(pagesDir, page.name);
  const pageJson = {
    $schema: schemas.page,
    name: page.name,
    displayName: page.displayName,
    displayOption: "FitToPage",
    height: 1080,
    width: 1920,
    objects: {
      background: [
        {
          properties: {
            color: literalColor("#F1F5F9"),
            transparency: litNumber(0),
          },
        },
      ],
      outspace: [
        {
          properties: {
            color: literalColor("#E2E8F0"),
            transparency: litNumber(0),
          },
        },
      ],
    },
  };
  if (page.drillthrough) {
    const filterName = `Filter${id(`${page.name}:drill`, 24)}`;
    pageJson.filterConfig = {
      filters: [
        {
          name: filterName,
          field: columnField(page.drillthrough.table, page.drillthrough.column),
          type: "Categorical",
          howCreated: "Drillthrough",
        },
      ],
    };
    pageJson.pageBinding = {
      name: "Pod",
      type: "Drillthrough",
      parameters: [
        {
          name: `Param_${filterName}`,
          boundFilter: filterName,
          fieldExpr: columnField(page.drillthrough.table, page.drillthrough.column),
        },
      ],
    };
  }
  writeJson(path.join(pagePath, "page.json"), pageJson);
  for (const visual of page.visuals) {
    writeJson(path.join(pagePath, "visuals", visual.name, "visual.json"), visual.json);
  }
}

const theme = {
  $schema: "https://raw.githubusercontent.com/microsoft/powerbi-desktop-samples/main/Report%20Theme%20JSON%20Schema/reportThemeSchema-2.153.json",
  name: themeFile,
  dataColors: ["#0078D4", "#00A4EF", "#5C2D91", "#008272", "#FFB900", "#D13438", "#107C10", "#52606D"],
  good: "#107C10",
  neutral: "#FFB900",
  bad: "#D13438",
  maximum: "#0078D4",
  center: "#FFB900",
  minimum: "#DCEEFF",
  null: "#94A3B8",
  foreground: "#243447",
  foregroundNeutralSecondary: "#52606D",
  background: "#FFFFFF",
  backgroundNeutral: "#F1F5F9",
  tableAccent: "#0078D4",
  textClasses: {
    callout: { fontSize: 24, fontFace: "Segoe UI Semibold", color: "#243447" },
    title: { fontSize: 14, fontFace: "Segoe UI Semibold", color: "#243447" },
    header: { fontSize: 12, fontFace: "Segoe UI Semibold", color: "#243447" },
    label: { fontSize: 10, fontFace: "Segoe UI", color: "#243447" },
  },
  visualStyles: {
    "*": {
      "*": {
        border: [{ show: true, color: { solid: { color: "#DCE3EA" } }, radius: 8 }],
        dropShadow: [{ show: false }],
        padding: [{ top: 8, bottom: 8, left: 8, right: 8 }],
        visualHeader: [{ show: false }],
        title: [{ show: true, fontFamily: "Segoe UI Semibold", fontSize: 12, fontColor: { solid: { color: "#243447" } } }],
      },
    },
    cardVisual: {
      "*": {
        value: [{ bold: true, $id: "default" }],
        label: [{ show: true, $id: "default" }],
        cardCalloutArea: [{ paddingUniform: 0 }],
        title: [{ show: false }],
      },
    },
    tableEx: {
      "*": {
        columnHeaders: [
          {
            autoSizeColumnWidth: true,
            columnAdjustment: "growToFit",
            backColor: { solid: { color: "#E8F1FB" } },
            fontColor: { solid: { color: "#243447" } },
            bold: true,
          },
        ],
        values: [
          {
            backColorPrimary: { solid: { color: "#FFFFFF" } },
            backColorSecondary: { solid: { color: "#F8FAFC" } },
            fontColorPrimary: { solid: { color: "#243447" } },
            fontColorSecondary: { solid: { color: "#243447" } },
          },
        ],
      },
    },
    slicer: {
      "*": {
        header: [
          {
            fontFamily: "Segoe UI Semibold",
            textSize: 10,
            fontColor: { solid: { color: "#243447" } },
            outlineStyle: 0,
          },
        ],
        items: [
          {
            fontFamily: "Segoe UI",
            textSize: 9,
            fontColor: { solid: { color: "#243447" } },
            outlineStyle: 0,
            padding: 2,
          },
        ],
      },
    },
  },
};

writeJson(path.join(reportDir, "StaticResources", "RegisteredResources", themeFile), theme);
console.log(
  JSON.stringify(
    {
      report: reportDir,
      pages: pages.length,
      visuals: pages.reduce((sum, page) => sum + page.visuals.length, 0),
      theme: themeFile,
    },
    null,
    2
  )
);
