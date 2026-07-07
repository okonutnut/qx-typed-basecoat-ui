interface SidebarItem {
  label: string;
  icon?: InlineSvgIcon;
  disabled?: boolean;
  hidden?: boolean;
  children?: SidebarItem[];
}

class FullscreenLayout extends qx.ui.container.Composite {
  static events = {
    login: "qx.event.type.Event",
  };

  private __config: AppConfig;
  private __loginLogo: qx.ui.basic.Image;

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

    this.__loginLogo = new qx.ui.basic.Image(this.__config.resources.logo);
    this.__loginLogo.setAlignX("center");
    this.__loginLogo.set({
      scale: true,
      width: 64,
      height: 64,
    });
    card.add(this.__loginLogo);

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

  setLogo(path: string): void {
    this.__loginLogo.setSource(path);
  }
}

class Sidebar extends qx.ui.container.Composite {
  static events = {
    select: "qx.event.type.Data",
    action: "qx.event.type.Data",
  };

  private __collapsed = false;
  private __drawerMode = false;
  private __schoolLogo: qx.ui.basic.Image;
  private __header: qx.ui.basic.Label;
  private __appVersion: qx.ui.basic.Label;
  private __searchInput: BsInput;
  private __backContainer: qx.ui.container.Composite;
  private __itemsViewport: qx.ui.container.Scroll;
  private __listContainer: qx.ui.container.Composite | null = null;
  private __footer: BsSidebarAccount;
  private __backButton!: BsSidebarButton;
  private __buttons: BsSidebarButton[] = [];
  private __buttonStates = new Map<string, BsSidebarButton>();
  private __rootItems: SidebarItem[];
  private __activeLeafLabel: string | null = null;
  private __searchQuery = "";
  private __isAnimating = false;
  private __hasRendered = false;
  private __stack: Array<{ label: string; items: SidebarItem[] }> = [];
  private __config: AppConfig;

  constructor(
    sidebarItems: SidebarItem[],
    initialActiveLabel?: string,
    config?: Partial<AppConfig>,
  ) {
    super(new qx.ui.layout.VBox(0).set({ alignX: "center" }));
    this.__config = { ...DEFAULT_APP_CONFIG, ...config };

    this.__rootItems = sidebarItems;
    this.__activeLeafLabel =
      initialActiveLabel ?? this.__findFirstLeafLabel(sidebarItems);
    this.setWidth(this.__config.sidebar.width);
    this.setAlignX("center");
    this.setBackgroundColor(AppColors.sidebar());
    this.setDecorator(
      new qx.ui.decoration.Decorator().set({
        widthRight: 1,
        styleRight: "solid",
        colorRight: AppColors.sidebarBorder(),
      }),
    );

    const schoolLogo = new qx.ui.basic.Image(this.__config.resources.logo);
    schoolLogo.set({
      scale: true,
      width: 42,
      height: 42,
    });
    this.__schoolLogo = schoolLogo;
    this.add(schoolLogo);

    const header = new qx.ui.basic.Label(this.__config.appName);
    this.__header = header;
    header.setFont(
      //@ts-ignore
      new qx.bom.Font(12).set({ bold: true }),
    );
    header.setTextAlign("center");
    header.setPadding(5);
    header.setTextColor(AppColors.sidebarForeground());
    this.add(header);

    const appVersion = new qx.ui.basic.Label(this.__config.appVersion);
    this.__appVersion = appVersion;
    appVersion.setTextColor(AppColors.sidebarForeground());
    appVersion.setTextAlign("center");
    appVersion.setOpacity(0.7);
    appVersion.setFont(
      // @ts-ignore
      new qx.bom.Font(10, ["Inter", "sans-serif"]),
    );
    appVersion.setMarginTop(6);
    appVersion.setMarginBottom(12);
    this.add(appVersion);

    this.__searchInput = new BsInput("", "Search pages...", "w-full input-sm");
    this.__searchInput.setLeadingHtml(
      '<img src="' + InlineSvgIcon.iconsBaseUrl + 'search.svg" alt="" width="16" height="16" style="display:block;opacity:0.7" />',
    );
    this.__searchInput.setAllowGrowX(true);
    this.__searchInput.onInput((value) => {
      this.__searchQuery = value.trim();
      this.__renderVisibleItems(false);
    });
    this.__searchInput.setTabIndex(20);
    this.add(this.__searchInput);

    this.__backContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(0),
    );
    this.__backContainer.setAllowGrowX(true);
    const backButton = new BsSidebarButton(
      "Back",
      new InlineSvgIcon("arrow-left", 16),
    );
    backButton.setAllowGrowX(true);
    backButton.setWidth(this.__config.sidebar.width);
    backButton.setCentered(true);
    this.__backButton = backButton;
    backButton.onClick(() => {
      if (this.__stack.length === 0 || this.__isAnimating) return;
      this.__stack.pop();
      this.__renderVisibleItems(true);
    });
    this.__backContainer.add(backButton);
    this.add(this.__backContainer);

    this.__itemsViewport = new qx.ui.container.Scroll();
    this.__itemsViewport.setAllowGrowX(true);
    this.__itemsViewport.setAllowGrowY(true);
    this.__itemsViewport.setMinHeight(10);
    this.add(this.__itemsViewport, { flex: 1 });

    const footer = new BsSidebarAccount(
      this.__config.user.name,
      this.__config.user.role,
      this.__config.resources.userAvatar,
      "RB",
    );
    this.__footer = footer;
    this.__footer.onAction((action) => {
      if (action === "logout" && this.__config.callbacks.onLogout) {
        this.__config.callbacks.onLogout();
      }
      this.fireDataEvent("action", action);
    });
    this.add(footer);

    this.__renderVisibleItems(false);
  }

  private __findFirstLeafLabel(items: SidebarItem[]): string | null {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        const nestedLabel = this.__findFirstLeafLabel(item.children);
        if (nestedLabel) return nestedLabel;
      } else {
        return item.label;
      }
    }
    return null;
  }

  private __getCurrentLevelItems(): SidebarItem[] {
    if (this.__stack.length === 0) return this.__rootItems;
    return this.__stack[this.__stack.length - 1].items;
  }

  private __collectLeafEntries(
    source: SidebarItem[],
    path: string[] = [],
    out: Array<{ item: SidebarItem; path: string[] }> = [],
  ): Array<{ item: SidebarItem; path: string[] }> {
    source.forEach((item) => {
      const nextPath = [...path, item.label];
      if (item.children && item.children.length > 0) {
        this.__collectLeafEntries(item.children, nextPath, out);
      } else {
        out.push({ item, path: nextPath });
      }
    });
    return out;
  }

  private __setPathFromLeaf(path: string[]): void {
    const nextStack: Array<{ label: string; items: SidebarItem[] }> = [];
    let source = this.__rootItems;

    for (let i = 0; i < path.length - 1; i++) {
      const label = path[i];
      const match = source.find((entry) => entry.label === label);
      if (!match || !match.children || match.children.length === 0) break;

      nextStack.push({ label: match.label, items: match.children });
      source = match.children;
    }

    this.__stack = nextStack;
  }

  private __syncBackVisibility(): void {
    const shouldShow =
      !this.__collapsed &&
      this.__searchQuery.length === 0 &&
      this.__stack.length > 0;
    if (shouldShow) {
      const parentLabel = this.__stack[this.__stack.length - 1].label;
      this.__backButton.setText(parentLabel);
      this.__backContainer.show();
    } else {
      this.__backContainer.exclude();
    }
  }

  private __renderVisibleItems(animated: boolean): void {
    this.__syncBackVisibility();

    const nextList = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
    nextList.setAllowGrowX(true);

    this.__buttons = [];
    this.__buttonStates.clear();

    if (this.__searchQuery.length > 0) {
      const query = this.__searchQuery.toLowerCase();
      const matches = this.__collectLeafEntries(this.__rootItems).filter(
        ({ item, path }) => {
          const haystack = `${path.join(" ")} ${item.label}`.toLowerCase();
          return haystack.includes(query);
        },
      );

      matches.forEach(({ item, path }) => {
        const parentTrail = path.slice(0, path.length - 1).join(" / ");
        const displayLabel = parentTrail
          ? `${item.label} - ${parentTrail}`
          : item.label;
        const row = this.__createListRow();
        const button = this.__createSidebarButton(
          displayLabel,
          item.icon,
          false,
        );

        if (item.disabled) {
          button.setEnabled(false);
        } else {
          button.onClick(() => {
            this.__activeLeafLabel = item.label;
            this.__searchQuery = "";
            this.__searchInput.setValue("");
            this.__setPathFromLeaf(path);
            this.fireDataEvent("select", item.label);
            this.__renderVisibleItems(false);
          });
        }

        row.add(button, { flex: 1 });
        nextList.add(row);
      });
    } else {
      const currentItems = this.__getCurrentLevelItems();

      currentItems.forEach((item) => {
        const hasChildren = !!item.children && item.children.length > 0;
        const row = this.__createListRow();
        const button = this.__createSidebarButton(
          item.label,
          item.icon,
          hasChildren,
        );

        if (item.disabled) {
          button.setEnabled(false);
        } else if (hasChildren) {
          button.onClick(() => {
            if (this.__isAnimating || !item.children) return;
            this.__stack.push({ label: item.label, items: item.children });
            this.__renderVisibleItems(true);
          });
        } else {
          button.setActive(item.label === this.__activeLeafLabel);
          button.onClick(() => {
            this.__activeLeafLabel = item.label;
            this.fireDataEvent("select", item.label);
            this.__buttonStates.forEach((entry, label) => {
              entry.setActive(label === item.label);
            });
          });
        }

        row.add(button, { flex: 1 });
        nextList.add(row);
      });
    }

    if (!this.__listContainer || !animated || this.__collapsed) {
      this.__itemsViewport.getChildren().slice().forEach((c) => this.__itemsViewport.remove(c))
      this.__itemsViewport.add(nextList);
      this.__listContainer = nextList;
      return;
    }

    const previousList = this.__listContainer;
    this.__isAnimating = true;

    const wrapper = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
    wrapper.setAllowGrowX(true);
    wrapper.setAllowGrowY(true);

    this.__itemsViewport.getChildren().slice().forEach((c) => this.__itemsViewport.remove(c))
    this.__itemsViewport.add(wrapper);
    wrapper.add(previousList);
    wrapper.add(nextList);

    this.__setDomStyles(nextList, {
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      opacity: "0",
      transform: "translateX(30px)",
      transition:
        "opacity 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
    });
    this.__setDomStyles(previousList, {
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      opacity: "1",
      transform: "translateX(0px)",
      transition:
        "opacity 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
    });

    qx.event.Timer.once(
      () => {
        this.__setDomStyles(previousList, {
          opacity: "0",
          transform: "translateX(-30px)",
        });
        this.__setDomStyles(nextList, {
          opacity: "1",
          transform: "translateX(0px)",
        });
      },
      this,
      20,
    );

    qx.event.Timer.once(
      () => {
        this.__setDomStyles(nextList, {
          position: "relative",
          transform: "none",
        });
        this.__itemsViewport.getChildren().slice().forEach((c) => this.__itemsViewport.remove(c))
        this.__itemsViewport.add(nextList);
        wrapper.dispose();
        this.__listContainer = nextList;
        this.__isAnimating = false;
      },
      this,
      320,
    );
  }

  private __createListRow(): qx.ui.container.Composite {
    const row = new qx.ui.container.Composite(
      new qx.ui.layout.HBox().set({ alignY: "middle" }),
    );
    row.set({
      allowGrowX: true,
      height: 40,
    });
    return row;
  }

  private __createSidebarButton(
    label: string,
    icon: InlineSvgIcon | undefined,
    hasChildren: boolean,
  ): BsSidebarButton {
    const button = new BsSidebarButton(label, icon);
    button.setAllowGrowX(true);
    button.setCollapsed(this.__collapsed);
    button.setWidth(this.__collapsed ? this.__config.sidebar.collapsedWidth : this.__config.sidebar.width);
    if (hasChildren) {
      button.setTrailingHtml("&rsaquo;");
    }

    this.__buttons.push(button);
    this.__buttonStates.set(label, button);
    return button;
  }

  private __setDomStyles(
    widget: qx.ui.core.Widget,
    styles: Record<string, string>,
  ): void {
    const contentElement = widget.getContentElement() as any;
    if (!contentElement || !contentElement.setStyle) return;
    for (const key in styles) {
      if (!Object.prototype.hasOwnProperty.call(styles, key)) continue;
      contentElement.setStyle(key, styles[key]);
    }
  }

  public setCollapsed(collapsed: boolean): void {
    this.__collapsed = collapsed;
    const DURATION = 280;
    const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
    const skipAnimation = !this.__hasRendered;
    this.__hasRendered = true;

    const w = this.__config.sidebar.width;
    const startWidth = collapsed ? w : 0;
    const endWidth = collapsed ? 0 : w;
    const startOpacity = collapsed ? "1" : "0";
    const endOpacity = collapsed ? "0" : "1";

    if (skipAnimation) {
      this.setWidth(endWidth);
      this.setMinWidth(endWidth);
      this.__setDomStyles(this, {
        overflow: collapsed ? "hidden" : "visible",
        opacity: endOpacity,
      });
      this.show();
      if (!collapsed) this.__applyChromeMode();
      return;
    }

    this.setWidth(startWidth);
    this.setMinWidth(startWidth);
    this.__setDomStyles(this, {
      overflow: "hidden",
      willChange: "width, opacity",
      transition: "none",
      width: startWidth + "px",
      opacity: startOpacity,
    });
    if (!collapsed) this.show();

    requestAnimationFrame(() => {
      this.__setDomStyles(this, {
        transition: `width ${DURATION}ms ${EASING}, opacity ${DURATION}ms ${EASING}`,
        width: endWidth + "px",
        opacity: endOpacity,
      });

      qx.event.Timer.once(() => {
        this.setWidth(endWidth);
        this.setMinWidth(endWidth);
        this.__setDomStyles(this, {
          overflow: collapsed ? "hidden" : "visible",
          transition: "none",
          willChange: "auto",
        });
        if (!collapsed) this.__applyChromeMode();
      }, this, DURATION + 20);
    });
  }

  public setDrawerMode(enabled: boolean): void {
    this.__drawerMode = enabled;
    if (this.__collapsed) return;
    this.__applyChromeMode();
    this.__renderVisibleItems(false);
  }

  private __applyChromeMode(): void {
    if (this.__drawerMode) {
      this.setPadding(8, 0, 8, 8);
      this.setDecorator(
        new qx.ui.decoration.Decorator().set({
          widthRight: 0,
        }),
      );
      this.__schoolLogo.exclude();
      this.__header.exclude();
      this.__appVersion.exclude();
      this.__footer.exclude();
      this.__searchInput.show();
      this.__syncBackVisibility();
      return;
    }

    this.setPadding(5, 5, 0, 10);
    this.setDecorator(
      new qx.ui.decoration.Decorator().set({
        widthRight: 1,
        styleRight: "solid",
        colorRight: AppColors.sidebarBorder(),
      }),
    );
    this.__schoolLogo.show();
    this.__header.show();
    this.__appVersion.show();
    this.__footer.show();
    this.__searchInput.show();
    this.__syncBackVisibility();
  }

  public isCollapsed(): boolean {
    return this.__collapsed;
  }

  setLogo(path: string): void {
    this.__schoolLogo.setSource(path);
  }
}

class Navbar extends qx.ui.container.Composite {
  static events = {
    toggleSidebar: "qx.event.type.Event",
    action: "qx.event.type.Data",
  };

  private __titleLabel: qx.ui.basic.Label;
  private __actionsPopup: qx.ui.popup.Popup;
  private __isActionsOpen = false;
  private __config: AppConfig;

  constructor(
    pageTitle?: string,
    onToggleSidebar?: () => void,
    config?: Partial<AppConfig>,
  ) {
    super(new qx.ui.layout.HBox(2));
    this.__config = { ...DEFAULT_APP_CONFIG, ...config };
    this.setAlignY("middle");
    this.setPadding(8);
    this.setHeight(55);
    this.setBackgroundColor(AppColors.background());
    this.setDecorator(
      new qx.ui.decoration.Decorator().set({
        widthBottom: 1,
        styleBottom: "solid",
        colorBottom: AppColors.border(),
      }),
    );

    // SIDEBAR TRIGGER
    const collapseSidebarBtn = new BsButton("", new InlineSvgIcon("menu", 16), {
      size: "sm-icon",
      variant: "ghost",
      className: "!w-[50px]"
    });
    collapseSidebarBtn.setWidth(50);
    collapseSidebarBtn.onClick(() => {
      this.fireEvent("toggleSidebar");
      if (onToggleSidebar) onToggleSidebar();
    });
    this.add(collapseSidebarBtn);

    // PAGE TITLE
    this.__titleLabel = new qx.ui.basic.Label(pageTitle ?? "Dashboard");
    this.__titleLabel.setTextColor(AppColors.foreground());
    this.__titleLabel.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    this.__titleLabel.setAlignY("middle");
    this.add(this.__titleLabel);

    const spacer = new qx.ui.core.Spacer();
    this.add(spacer, { flex: 1 });

    // OTHER ACTIONS
    const otherActionsBtn = new BsButton("", new InlineSvgIcon("ellipsis", 8), {
      size: "sm-icon",
      variant: "ghost",
      className: "!w-[50px]"
    });
    otherActionsBtn.setWidth(50);
    otherActionsBtn.onClick(() => this.__toggleActionsPopup(otherActionsBtn));
    this.add(otherActionsBtn);

    this.__actionsPopup = new qx.ui.popup.Popup(new qx.ui.layout.Grow());
    this.__actionsPopup.setAutoHide(true);
    this.__actionsPopup.setDomMove(true);
    this.__actionsPopup.setZIndex(100000);
    this.__actionsPopup.setAllowGrowX(false);
    this.__actionsPopup.setAllowGrowY(true);
    this.__actionsPopup.setPadding(0);
    this.__actionsPopup.setBackgroundColor("transparent");
    this.__actionsPopup.setDecorator(
      new qx.ui.decoration.Decorator().set({
        width: 1,
        style: "solid",
        color: AppColors.border(),
        radius: 10,
        shadowVerticalLength: 2,
        shadowBlurRadius: 10,
        shadowColor: AppColors.overlay(0.1),
      }),
    );

    const actionsMenu = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
    actionsMenu.set({
      minWidth: 160,
      padding: 2,
      backgroundColor: AppColors.background(),
      textColor: AppColors.foreground(),
    });

    actionsMenu.add(
      this.__createActionsMenuButton(
        "Support",
        new InlineSvgIcon("help-circle", 16),
        "support",
      ),
    );
    actionsMenu.add(
      this.__createActionsMenuButton(
        "About",
        new InlineSvgIcon("info", 16),
        "show-about-dialog",
      ),
    );
    this.addListener("action", (ev: qx.event.type.Data) => {
      const action = ev.getData() as string;
      if (action === "support" && this.__config.callbacks.onSupport) {
        this.__config.callbacks.onSupport();
      } else if (action === "show-about-dialog" && this.__config.callbacks.onAbout) {
        this.__config.callbacks.onAbout();
      }
    });

    this.__actionsPopup.add(actionsMenu);

    this.__actionsPopup.addListener("disappear", () => {
      this.__isActionsOpen = false;
    });

    this.addListenerOnce("disappear", () => {
      this.__actionsPopup.hide();
    });
  }

  private __createActionsMenuButton(
    label: string,
    icon: InlineSvgIcon,
    action: string,
  ): BsSidebarButton {
    const button = new BsSidebarButton(label, icon, "btn-sm-outline");
    button.setAllowGrowX(true);
    button.setHeight(40);
    button.onClick(() => {
      this.fireDataEvent("action", action);
      this.__closeActionsPopup();
    });
    return button;
  }

  private __toggleActionsPopup(target: qx.ui.core.Widget): void {
    if (this.__isActionsOpen) {
      this.__closeActionsPopup();
      return;
    }

    this.__actionsPopup.show();
    this.__isActionsOpen = true;
    this.__actionsPopup.placeToWidget(target, true);
    qx.event.Timer.once(
      () => this.__actionsPopup.placeToWidget(target, true),
      this,
      0,
    );
  }

  private __closeActionsPopup(): void {
    if (!this.__isActionsOpen) return;
    this.__isActionsOpen = false;
    this.__actionsPopup.hide();
  }

  public setPageTitle(value: string): void {
    this.__titleLabel.setValue(value);
  }

  public setTitle(value: string): void {
    this.setPageTitle(value);
  }
}

class MainLayout extends qx.ui.container.Composite {
  static events = {
    logout: "qx.event.type.Event",
  };

  private __sidebar: Sidebar;
  private __mobileSchoolLogo: qx.ui.basic.Image;

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

    this.__sidebar = new Sidebar(sidebarItems, pageTitle, cfg);

    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(),
    );
    contentContainer.setBackgroundColor(AppColors.background());

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

    this.__mobileSchoolLogo = new qx.ui.basic.Image(cfg.resources.logo);
    this.__mobileSchoolLogo.set({
      scale: true,
      width: 32,
      height: 32,
    });
    mobileTopBar.add(this.__mobileSchoolLogo);
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
      this.__sidebar.setDrawerMode(false);
      mobileTopBar.exclude();

      desktopShell.removeAll();
      desktopShell.add(this.__sidebar);
      desktopShell.add(contentContainer, { flex: 1 });

      this.removeAll();
      this.add(desktopShell);
    };

    const mountMobile = () => {
      this.__sidebar.setCollapsed(false);
      this.__sidebar.setDrawerMode(true);
      mobileTopBar.show();
      sidebarDrawer = new BsDrawer(contentContainer, this.__sidebar);

      this.removeAll();
      this.add(sidebarDrawer);
    };

    const navbar = new Navbar(pageTitle, () => {
      if (isMobileMode) {
        sidebarDrawer?.toggle();
      } else {
        isSidebarCollapsed = !isSidebarCollapsed;
        this.__sidebar.setCollapsed(isSidebarCollapsed);
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

    this.__sidebar.addListener("select", (ev: qx.event.type.Data) => {
      const label = ev.getData() as string;
      const nextPage = getPage(label);
      if (!nextPage) return;

      globalThis.setContent(nextPage, label);
    });

    this.__sidebar.addListener("action", (ev: qx.event.type.Data) => {
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
        this.__sidebar.setCollapsed(isSidebarCollapsed);
      }
    };

    qx.event.Registration.addListener(window, "resize", () => {
      syncResponsiveMode();
    });

    syncResponsiveMode();
  }

  setLogo(path: string): void {
    this.__sidebar.setLogo(path);
    this.__mobileSchoolLogo.setSource(path);
  }
}
