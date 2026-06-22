class FullscreenLayout extends qx.ui.container.Composite {
  static events = {
    login: "qx.event.type.Event",
  };

  private __config: AppConfig;

  constructor(config?: Partial<AppConfig>) {
    super(
      new qx.ui.layout.VBox(12).set({ alignX: "center", alignY: "middle" }),
    );
    this.__config = { ...DEFAULT_APP_CONFIG, ...config };
    this.setBackgroundColor(AppColors.background());

    const card = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
    card.setWidth(350);
    card.setAllowGrowX(false);
    card.setPadding(20);
    card.setBackgroundColor(AppColors.card());
    card.setDecorator(
      new qx.ui.decoration.Decorator().set({
        width: 1,
        style: "solid",
        color: AppColors.border(),
        radius: 10,
      }),
    );

    const schoolLogo = new qx.ui.basic.Image(this.__config.resources.logo);
    schoolLogo.setAlignX("center");
    schoolLogo.set({
      scale: true,
      width: 64,
      height: 64,
    });
    card.add(schoolLogo);

    const title = new qx.ui.basic.Label(this.__config.login.title);
    title.setTextAlign("center");
    title.setAlignX("center");
    title.setAllowGrowX(true);
    title.setFont(
      // @ts-ignore
      new qx.bom.Font(16, ["Inter", "sans-serif"]).set({ bold: true }),
    );
    title.setTextColor(AppColors.foreground());
    title.setMarginBottom(10);
    card.add(title);

    const location = new qx.ui.basic.Label(this.__config.login.subtitle);
    location.setTextAlign("center");
    location.setAlignX("center");
    location.setAllowGrowX(true);
    location.setFont(
      // @ts-ignore
      new qx.bom.Font(12, ["Inter", "sans-serif"]).set({ bold: true }),
    );
    location.setTextColor(AppColors.foreground());
    location.setMarginBottom(30);
    card.add(location);

    const username = new BsInput("", "Username");
    const password = new BsPassword("", "Password");
    card.add(username);
    card.add(password);

    const loginError = new qx.ui.basic.Label("");
    loginError.setVisibility("excluded");
    loginError.setTextAlign("center");
    loginError.setTextColor(AppColors.destructive());
    loginError.setMarginTop(4);
    card.add(loginError);

    const submit = new BsButton("Sign in", undefined, {
      variant: "default",
      className: "w-full",
    });
    submit.setAllowGrowX(true);
    card.add(submit);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;

      const activeElement = document.activeElement;
      const cardElement = card.getContentElement().getDomElement();
      if (
        !activeElement ||
        !cardElement ||
        !cardElement.contains(activeElement)
      )
        return;

      event.preventDefault();
    };

    document.addEventListener("keydown", onKeyDown);
    this.addListenerOnce("disappear", () => {
      document.removeEventListener("keydown", onKeyDown);
    });

    this.add(card);
  }
}

class MainLayout extends qx.ui.container.Composite {
  static events = {
    logout: "qx.event.type.Event",
  };

  constructor(
    content: qx.ui.core.Widget,
    sidebarItems: SidebarItem[],
    pageMap: Map<string, () => qx.ui.core.Widget>,
    pageTitle?: string,
    config?: Partial<AppConfig>,
  ) {
    super();
    this.setLayout(new qx.ui.layout.Grow());
    this.setBackgroundColor(AppColors.background());

    const cfg = { ...DEFAULT_APP_CONFIG, ...config };
    InlineSvgIcon.iconsBaseUrl = cfg.resources.iconsBaseUrl;

    const MOBILE_BREAKPOINT = 768;
    let isSidebarCollapsed = false;
    let isMobileMode = qx.bom.Viewport.getWidth() < MOBILE_BREAKPOINT;
    let sidebarDrawer: BsDrawer | null = null;

    const sidebar = new Sidebar(sidebarItems, pageTitle, cfg);

    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(),
    );

    const mobileTopBar = new qx.ui.container.Composite(
      new qx.ui.layout.HBox().set({ alignY: "middle" }),
    );
    mobileTopBar.set({
      paddingTop: 8,
      paddingRight: 6,
      paddingBottom: 8,
      paddingLeft: 10,
      minHeight: 48,
      backgroundColor: AppColors.background(),
    });
    mobileTopBar.setDecorator(
      new qx.ui.decoration.Decorator().set({
        widthBottom: 1,
        styleBottom: "solid",
        colorBottom: AppColors.border(),
      }),
    );

    const mobileSchoolLogo = new qx.ui.basic.Image(cfg.resources.logo);
    mobileSchoolLogo.set({
      scale: true,
      width: 32,
      height: 32,
    });
    mobileTopBar.add(mobileSchoolLogo);
    mobileTopBar.add(new qx.ui.core.Spacer(), { flex: 1 });

    const mobileAccount = new BsSidebarAccount(
      cfg.user.name,
      cfg.user.role,
      cfg.resources.userAvatar,
      "RB",
      "px-0 py-0",
    );
    mobileAccount.setCollapsed(true);
    mobileAccount.setAllowGrowX(false);
    mobileAccount.setAlignY("middle");
    const mobileAccountSlot = new qx.ui.container.Composite(
      new qx.ui.layout.Grow(),
    );
    mobileAccountSlot.setAllowGrowX(false);
    mobileAccountSlot.setAlignY("middle");
    mobileAccountSlot.setWidth(40);
    mobileAccountSlot.setHeight(40);
    mobileAccountSlot.add(mobileAccount);
    mobileAccount.onAction((action) => {
      if (action === "logout") this.fireEvent("logout");
    });
    mobileTopBar.add(mobileAccountSlot);
    mobileTopBar.exclude();

    const desktopShell = new qx.ui.container.Composite(new qx.ui.layout.HBox());

    const mountDesktop = () => {
      sidebarDrawer?.close();
      sidebar.setDrawerMode(false);
      mobileTopBar.exclude();

      desktopShell.removeAll();
      desktopShell.add(sidebar);
      desktopShell.add(contentContainer, { flex: 1 });

      this.removeAll();
      this.add(desktopShell);
    };

    const mountMobile = () => {
      sidebar.setCollapsed(false);
      sidebar.setDrawerMode(true);
      mobileTopBar.show();
      sidebarDrawer = new BsDrawer(contentContainer, sidebar);

      this.removeAll();
      this.add(sidebarDrawer);
    };

    const navbar = new Navbar(pageTitle, () => {
      if (isMobileMode) {
        sidebarDrawer?.toggle();
      } else {
        isSidebarCollapsed = !isSidebarCollapsed;
        sidebar.setCollapsed(isSidebarCollapsed);
      }
    }, cfg);
    contentContainer.add(mobileTopBar);
    contentContainer.add(navbar);

    const mainContentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.Grow(),
    );
    const mainContentScroll = new qx.ui.container.Scroll();
    const pageCache = new Map<string, qx.ui.core.Widget>();
    if (pageTitle) {
      pageCache.set(pageTitle, content);
    }
    let currentPage = content;

    const getPage = (label: string): qx.ui.core.Widget | null => {
      const cached = pageCache.get(label);
      if (cached) return cached;

      const factory = pageMap.get(label);
      if (!factory) return null;

      const page = factory();
      pageCache.set(label, page);
      return page;
    };

    mainContentContainer.setPadding(10);
    mainContentContainer.add(content, { edge: 0 });

    globalThis.setContent = (contentOrFactory, title) => {
      const nextPage =
        typeof contentOrFactory === "function"
          ? contentOrFactory()
          : contentOrFactory;
      if (nextPage === currentPage) return;

      mainContentContainer.removeAll();
      mainContentContainer.add(nextPage, { edge: 0 });
      currentPage = nextPage;

      if (title) navbar.setPageTitle(title);
      if (isMobileMode) sidebarDrawer?.close();
    };

    sidebar.addListener("select", (ev: qx.event.type.Data) => {
      const label = ev.getData() as string;
      const nextPage = getPage(label);
      if (!nextPage) return;

      globalThis.setContent(nextPage, label);
    });

    sidebar.addListener("action", (ev: qx.event.type.Data) => {
      if ((ev.getData() as string) === "logout") {
        this.fireEvent("logout");
      }
    });

    mainContentScroll.add(mainContentContainer);
    contentContainer.add(mainContentScroll, { flex: 1, edge: 0 });

    const syncResponsiveMode = () => {
      const nextIsMobile = qx.bom.Viewport.getWidth() < MOBILE_BREAKPOINT;
      if (nextIsMobile === isMobileMode && this.getChildren().length > 0)
        return;

      isMobileMode = nextIsMobile;
      if (isMobileMode) {
        mountMobile();
      } else {
        mountDesktop();
        sidebar.setCollapsed(isSidebarCollapsed);
      }
    };

    qx.event.Registration.addListener(window, "resize", () => {
      syncResponsiveMode();
    });

    syncResponsiveMode();
  }
}
