type RouteDefinition = {
  label: string;
  iconName?: string;
  element?: () => qx.ui.core.Widget;
  disabled?: boolean;
  hidden?: boolean;
  children?: RouteDefinition[];
};

class AppPages {
  static ROUTE_DEFINITIONS: RouteDefinition[] = [];

  static createSidebarItems(
    definitions: RouteDefinition[] = AppPages.ROUTE_DEFINITIONS,
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

  static manipulateSidebarItems(
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
}