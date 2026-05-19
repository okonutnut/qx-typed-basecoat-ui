function qooxdooMain(app: qx.application.Standalone) {
  const root = <qx.ui.container.Composite>app.getRoot();
  type AppLayoutMode = "fullscreen" | "main";

  const appConfig: AppConfig = {
    ...DEFAULT_APP_CONFIG,
    appName: "QX-Typed App",
    appVersion: "1.0.0",
    user: { name: "User", role: "Role" },
    login: {
      title: "Aldersgate College Inc.",
      subtitle: "Solano, Nueva Vizcaya",
    },
    callbacks: {
      onLogout: () => setAppLayout("fullscreen"),
      onAbout: () => showAboutDialog(),
    },
  };

  InlineSvgIcon.iconsBaseUrl = appConfig.resources.iconsBaseUrl;

  const createMainLayout = () => {
    const extractPageMap = (routes: RouteDefinition[]): Map<string, () => qx.ui.core.Widget> => {
      const map = new Map<string, () => qx.ui.core.Widget>();
      const processRoute = (route: RouteDefinition) => {
        if (route.element) {
          map.set(route.label, route.element);
        }
        route.children?.forEach(processRoute);
      };
      routes.forEach(processRoute);
      return map;
    };

    const pageMap = extractPageMap(ROUTE_DEFINITIONS);

    const sidebarItems = manipulateSidebarItems(createSidebarItems(), pageMap);
    const initialPage = new MainPage();
    const initialTitle = "Welcome";

    const mainLayout = new MainLayout(
      initialPage,
      sidebarItems,
      pageMap,
      initialTitle,
      appConfig,
    );
    mainLayout.addListener("logout", () => {
      setAppLayout("fullscreen");
    });
    return mainLayout;
  };

  const createFullscreenLayout = () => {
    const layout = new FullscreenLayout(appConfig);
    layout.addListener("login", () => {
      setAppLayout("main");
    });
    return layout;
  };

  const setAppLayout = (mode: AppLayoutMode): void => {
    root.removeAll();
    root.add(mode === "main" ? createMainLayout() : createFullscreenLayout(), {
      edge: 0,
    });
  };

  setAppLayout("main");
}

qx.registry.registerMainMethod(qooxdooMain);
