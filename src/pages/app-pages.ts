type PageDefinition = {
  label: string;
  iconName: string;
  element?: () => qx.ui.core.Widget;
};

type SidebarDefinition = {
  label: string;
  iconName?: string;
  disabled?: boolean;
  hidden?: boolean;
  children?: SidebarDefinition[];
};

const PAGE_DEFINITIONS: PageDefinition[] = [
  {
    label: "Buttons",
    iconName: "book-open",
    element: () => new ButtonsPage(),
  },
  {
    label: "Controls",
    iconName: "users",
    element: () => new ControlPage(),
  },
  {
    label: "Forms",
    iconName: "door-open",
    element: () => new FormPage(),
  },
  {
    label: "Tables",
    iconName: "calendar",
    element: () => new TablePage(),
  },
  {
    label: "Toolbar",
    iconName: "clock",
    element: () => new ToolBarPage(),
  },
  {
    label: "Windows",
    iconName: "circle",
    element: () => new WindowsPage(),
  },
];

const SIDEBAR_DEFINITIONS: SidebarDefinition[] = [
  {
    label: "Items",
    iconName: "graduation-cap",
    children: [
      {
        label: "Forms & inputs",
        iconName: "layout-grid",
        children: [
          {
            label: "Buttons",
            iconName: "book-open",
          },
          {
            label: "Controls",
            iconName: "users",
          },
          {
            label: "Forms",
            iconName: "door-open",
          },
        ],
      },
      {
        label: "Data & windows",
        iconName: "panels-top-left",
        children: [
          {
            label: "Tables",
            iconName: "calendar",
          },
          {
            label: "Toolbar",
            iconName: "clock",
          },
          {
            label: "Windows",
            iconName: "circle",
          },
        ],
      },
    ],
  },
];

function createSidebarItems(
  definitions: SidebarDefinition[] = SIDEBAR_DEFINITIONS,
) {
  const createItems = (items: SidebarDefinition[]): SidebarItem[] => {
    return items.map((definition) => ({
      label: definition.label,
      icon: definition.iconName
        ? new InlineSvgIcon(definition.iconName, 16)
        : undefined,
      disabled: definition.disabled,
      hidden: definition.hidden,
      children: definition.children
        ? createItems(definition.children)
        : undefined,
    }));
  };

  return createItems(definitions);
}

function manipulateSidebarItems(
  items: SidebarItem[],
  pageMap: Map<string, () => qx.ui.core.Widget>,
): SidebarItem[] {
  const normalizeItems = (source: SidebarItem[]): SidebarItem[] => {
    const normalizedItems: SidebarItem[] = [];

    source.forEach((item) => {
      if (item.hidden) return;

      const normalizedLabel = item.label.trim();
      const normalizedChildren = item.children
        ? normalizeItems(item.children)
        : undefined;

      const isLeaf = !normalizedChildren || normalizedChildren.length === 0;
      if (isLeaf && !pageMap.has(normalizedLabel)) return;

      normalizedItems.push({
        ...item,
        label: normalizedLabel,
        children:
          normalizedChildren && normalizedChildren.length > 0
            ? normalizedChildren
            : undefined,
      });
    });

    return normalizedItems;
  };

  return normalizeItems(items);
}
