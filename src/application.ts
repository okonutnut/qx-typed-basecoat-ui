function qooxdooMain(app: qx.application.Standalone) {
  const root = <qx.ui.container.Composite>app.getRoot();
  type AppLayoutMode = "login" | "main";

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
    );
    mainLayout.addListener("logout", () => {
      setAppLayout("login");
    });
    return mainLayout;
  };

  const createLoginLayout = () => {
    const loginLayout = new LoginLayout();
    loginLayout.addListener("login", () => {
      setAppLayout("main");
    });
    return loginLayout;
  };

  const setAppLayout = (mode: AppLayoutMode): void => {
    root.removeAll();
    root.add(mode === "main" ? createMainLayout() : createLoginLayout(), {
      edge: 0,
    });
  };

  setAppLayout("main");
}

qx.registry.registerMainMethod(qooxdooMain);
