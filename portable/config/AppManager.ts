class AppManager {
  private __root: qx.ui.container.Composite;
  private __config: AppConfig;
  private __routes: RouteDefinition[];
  private __mainLayout: MainLayout | null = null;
  private __fullscreenLayout: FullscreenLayout | null = null;
  private __currentMode: "main" | "fullscreen" = "main";

  constructor(
    root: qx.ui.container.Composite,
    config?: Partial<AppConfig>,
    routes?: RouteDefinition[],
  ) {
    this.__root = root;
    this.__config = {
      ...DEFAULT_APP_CONFIG,
      ...config,
      resources: { ...DEFAULT_APP_CONFIG.resources, ...config?.resources },
      user: { ...DEFAULT_APP_CONFIG.user, ...config?.user },
      login: { ...DEFAULT_APP_CONFIG.login, ...config?.login },
      callbacks: { ...DEFAULT_APP_CONFIG.callbacks, ...config?.callbacks },
      sidebar: { ...DEFAULT_APP_CONFIG.sidebar, ...config?.sidebar },
    };
    this.__routes = routes ?? [];
    this.__config.resources.logo =
      this.__config.appLogo ||
      this.__config.callbacks.onNoLogo?.() ||
      DEFAULT_APP_CONFIG.resources.logo;
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
    const sidebarItems = AppPages.manipulateSidebarItems(
      AppPages.createSidebarItems(this.__routes),
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
    this.__currentMode = mode;
    this.__root.removeAll();
    if (mode === "main") {
      this.__mainLayout = this.__createMainLayout();
      this.__root.add(this.__mainLayout, { edge: 0 });
    } else {
      this.__fullscreenLayout = this.__createFullscreenLayout();
      this.__root.add(this.__fullscreenLayout, { edge: 0 });
    }
  }

  setLogo(path: string): void {
    this.__config.resources.logo = path;
    if (this.__currentMode === "main" && this.__mainLayout) {
      this.__mainLayout.setLogo(path);
    } else if (this.__currentMode === "fullscreen" && this.__fullscreenLayout) {
      this.__fullscreenLayout.setLogo(path);
    }
  }

  start(initialMode: "main" | "fullscreen" = "main"): void {
    (globalThis as any).appManager = this;
    this.setLayout(initialMode);
  }
}
