type PageDefinition = {
  label: string;
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
    element: () => new ButtonsPage(),
  },
  {
    label: "Button",
    element: () => new ButtonPage(),
  },
  {
    label: "Controls",
    element: () => new ControlPage(),
  },
  {
    label: "Forms",
    element: () => new FormPage(),
  },
  {
    label: "Tables",
    element: () => new TablePage(),
  },
  {
    label: "Toolbar",
    element: () => new ToolBarPage(),
  },
  {
    label: "Windows",
    element: () => new WindowsPage(),
  },
  {
    label: "Card",
    element: () => new CardPage(),
  },
  {
    label: "Input",
    element: () => new InputPage(),
  },
  {
    label: "Select",
    element: () => new SelectPage(),
  },
  {
    label: "Textarea",
    element: () => new TextareaPage(),
  },
  {
    label: "Avatar",
    element: () => new AvatarPage(),
  },
];

const SIDEBAR_DEFINITIONS: SidebarDefinition[] = [
  {
    label: "Qooxdoo UI",
    iconName: "graduation-cap",
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
        disabled: true,
      },
    ],
  },
  {
    label: "Basecoat UI",
    iconName: "box",
    children: [
      {
        label: "Button",
        iconName: "mouse-pointer",
      },
      {
        label: "Card",
        iconName: "credit-card",
      },
      {
        label: "Input",
        iconName: "edit",
      },
      {
        label: "Select",
        iconName: "chevron-down",
      },
      {
        label: "Textarea",
        iconName: "align-left",
      },
      {
        label: "Avatar",
        iconName: "user",
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
