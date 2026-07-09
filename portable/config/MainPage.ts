class MainPage extends BasePage {
  private __config: AppConfig;

  constructor(config?: Partial<AppConfig>) {
    super();
    this.__config = { ...DEFAULT_APP_CONFIG, ...config };

    this.setLayout(new qx.ui.layout.Grow());
    this.setBackgroundColor(AppColors.background());

    const center = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const welcomeCard = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(8).set({ alignX: "center" }),
    );
    welcomeCard.setMaxWidth(520);
    welcomeCard.setMinWidth(0);
    welcomeCard.setAllowGrowX(true);
    welcomeCard.setPadding(24);
    welcomeCard.setBackgroundColor(AppColors.background());

    const userName = this.__config.user?.name ?? "User";
    const title = new qx.ui.basic.Label(`Welcome, ${userName}`);
    title.setTextColor(AppColors.mutedForeground());
    title.setTextAlign("center");
    title.setAlignX("center");
    title.setFont(
      // @ts-ignore
      new qx.bom.Font(26).set({ bold: true }),
    );

    const appName = this.__config.appName;
    const appVersion = this.__config.appVersion;
    const subtitleText = appName && appVersion
      ? `${appName} v${appVersion} is ready. Use the sidebar to navigate or create pages via AppPages.ROUTE_DEFINITIONS.`
      : "QX-TYPED with TypeScript and Qooxdoo is ready! Define your AppConfig and pages to get started.";
    const subtitle = new qx.ui.basic.Label(subtitleText);
    subtitle.setWidth(400);
    subtitle.setTextColor(AppColors.mutedForeground());
    subtitle.setTextAlign("center");
    subtitle.setWrap(true);
    subtitle.setAlignX("center");

    welcomeCard.add(title);
    welcomeCard.add(subtitle);

    const syncWelcomeCardWidth = () => {
      const width = Math.max(
        240,
        Math.min(520, qx.bom.Viewport.getWidth() - 32),
      );
      welcomeCard.setWidth(width);
    };
    qx.event.Registration.addListener(window, "resize", syncWelcomeCardWidth);
    syncWelcomeCardWidth();

    center.add(welcomeCard);
    this.add(center);
  }
}
