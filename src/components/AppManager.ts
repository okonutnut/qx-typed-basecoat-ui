class AppManager {
  private __root: qx.ui.container.Composite;
  private __config: AppConfig;
  private __routes: RouteDefinition[];

  constructor(
    root: qx.ui.container.Composite,
    config?: Partial<AppConfig>,
    routes?: RouteDefinition[],
  ) {
    this.__root = root;
    this.__config = { ...DEFAULT_APP_CONFIG, ...config };
    this.__routes = routes ?? [];
    InlineSvgIcon.iconsBaseUrl = this.__config.resources.iconsBaseUrl;
  }

  private __extractPageMap(): Map<string, () => qx.ui.core.Widget> {
    const map = new Map<string, () => qx.ui.core.Widget>();
    const processRoute = (route: RouteDefinition) => {
      if (route.element) {
        map.set(route.label, route.element);
      }
      route.children?.forEach(processRoute);
    };
    this.__routes.forEach(processRoute);
    return map;
  }

  private __createMainLayout(): MainLayout {
    const pageMap = this.__extractPageMap();
    const sidebarItems = manipulateSidebarItems(
      createSidebarItems(this.__routes),
      pageMap,
    );
    const initialPage = new MainPage();

    const mainLayout = new MainLayout(
      initialPage,
      sidebarItems,
      pageMap,
      "Welcome",
      this.__config,
    );
    mainLayout.addListener("logout", () => {
      this.setLayout("fullscreen");
    });
    return mainLayout;
  }

  private __createFullscreenLayout(): FullscreenLayout {
    const layout = new FullscreenLayout(this.__config);
    layout.addListener("login", () => {
      this.setLayout("main");
    });
    return layout;
  }

  setLayout(mode: "main" | "fullscreen"): void {
    this.__root.removeAll();
    this.__root.add(
      mode === "main"
        ? this.__createMainLayout()
        : this.__createFullscreenLayout(),
      { edge: 0 },
    );
  }

  start(initialMode: "main" | "fullscreen" = "main"): void {
    (globalThis as any).appManager = this;
    this.setLayout(initialMode);
  }
}
