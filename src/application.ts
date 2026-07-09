function qooxdooMain(app: qx.application.Standalone) {
  const root = <qx.ui.container.Composite>app.getRoot();

  const appManager = new AppManager(root, {
    appName: "SIAS Online",
    appVersion: "3.8.0",  
    user: { name: "John Doe", role: "TECHSUP" },
    login: {
      title: "Aldersgate College Inc.",
      subtitle: "Solano, Nueva Vizcaya",
    },
    callbacks: {
      onLogout: () => appManager.setLayout("fullscreen"),
      onAbout: () => showAboutDialog(),
    },
  }, AppPages.ROUTE_DEFINITIONS);

  appManager.start();
}

qx.registry.registerMainMethod(qooxdooMain);
