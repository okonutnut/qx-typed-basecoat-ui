type RouteDefinition = {
  label: string;
  iconName?: string;
  element?: () => qx.ui.core.Widget;
  disabled?: boolean;
  hidden?: boolean;
  children?: RouteDefinition[];
};

const ROUTE_DEFINITIONS: RouteDefinition[] = [
  {
    label: "Qooxdoo UI",
    iconName: "graduation-cap",
    children: [
      {
        label: "Buttons",
        iconName: "book-open",
        element: () => new ButtonPage(),
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
        label: "Toolbar",
        iconName: "wrench",
        element: () => new ToolBarPage(),
      },
      {
        label: "Windows",
        iconName: "app-window",
        element: () => new WindowsPage(),
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
        element: () => new ButtonPage(),
      },
      {
        label: "Card",
        iconName: "credit-card",
        element: () => new CardPage(),
      },
      {
        label: "Input",
        iconName: "edit",
        element: () => new InputPage(),
      },
      {
        label: "Select",
        iconName: "chevron-down",
        element: () => new SelectPage(),
      },
      {
        label: "Textarea",
        iconName: "align-left",
        element: () => new TextareaPage(),
      },
      {
        label: "Avatar",
        iconName: "user",
        element: () => new AvatarPage(),
      },
      {
        label: "Alert Dialog",
        iconName: "alert-circle",
        element: () => new AlertDialogPage(),
      },
      {
        label: "Label",
        iconName: "tag",
        element: () => new LabelPage(),
      },
      {
        label: "Toast",
        iconName: "bell",
        element: () => new ToastPage(),
      },
    ],
  },
];

function createSidebarItems(
  definitions: RouteDefinition[] = ROUTE_DEFINITIONS,
) {
  const createItems = (items: RouteDefinition[]): SidebarItem[] => {
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
