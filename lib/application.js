class AppColors {
    static resolveCssVar(cssVarName, fallback) {
        const cacheKey = `${cssVarName}|${fallback !== null && fallback !== void 0 ? fallback : ""}`;
        const cached = this.__cache.get(cacheKey);
        if (cached)
            return cached;
        if (typeof document === "undefined" || !document.body) {
            return fallback !== null && fallback !== void 0 ? fallback : "";
        }
        const probe = document.createElement("span");
        probe.style.position = "absolute";
        probe.style.visibility = "hidden";
        probe.style.pointerEvents = "none";
        probe.style.color = `var(${cssVarName}${fallback ? `, ${fallback}` : ""})`;
        document.body.appendChild(probe);
        const computed = window.getComputedStyle(probe).color;
        probe.remove();
        const resolved = computed || fallback || "";
        this.__cache.set(cacheKey, resolved);
        return resolved;
    }
    static primary() {
        return this.resolveCssVar("--color-primary", "#f6f7f9");
    }
    static background() {
        return this.resolveCssVar("--color-background", "#f6f7f9");
    }
    static card() {
        return this.resolveCssVar("--color-card", "#fcfcfc");
    }
    static foreground() {
        return this.resolveCssVar("--color-foreground", "#0f1729");
    }
    static border() {
        return this.resolveCssVar("--color-border", "#e5e7eb");
    }
    static sidebar() {
        return this.resolveCssVar("--color-sidebar", "#fcfcfc");
    }
    static sidebarForeground() {
        return this.resolveCssVar("--color-sidebar-foreground", "#0f1729");
    }
    static sidebarBorder() {
        return this.resolveCssVar("--color-sidebar-border", "#e5e7eb");
    }
    static accent() {
        return this.resolveCssVar("--color-accent", "#f8f9fa");
    }
    static accentForeground() {
        return this.resolveCssVar("--color-accent-foreground", "#0f1729");
    }
    static destructive() {
        return this.resolveCssVar("--color-destructive", "#dc2626");
    }
    static mutedForeground() {
        return this.resolveCssVar("--color-muted-foreground", "#64748b");
    }
    static overlay(alpha = 0.35) {
        const foreground = this.foreground();
        const match = foreground.match(/rgba?\((\d+)\D+(\d+)\D+(\d+)/i);
        if (!match)
            return `rgba(15, 23, 42, ${alpha})`;
        const [, red, green, blue] = match;
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
}
AppColors.__cache = new Map();
function qooxdooMain(app) {
    const root = app.getRoot();
    const createMainLayout = () => {
        // Filter pages by the logged-in user's role
        const pageMap = new Map();
        PAGE_DEFINITIONS.forEach((definition) => {
            if (!definition.element)
                return;
            pageMap.set(definition.label, definition.element);
        });
        const sidebarItems = manipulateSidebarItems(createSidebarItems(), pageMap);
        const initialPage = new MainPage();
        const initialTitle = "Welcome";
        const mainLayout = new MainLayout(initialPage, sidebarItems, pageMap, initialTitle);
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
    const setAppLayout = (mode) => {
        root.removeAll();
        root.add(mode === "main" ? createMainLayout() : createLoginLayout(), {
            edge: 0,
        });
    };
    const currentLayout = "main"; // TODO: replace with actual authentication check
    setAppLayout(currentLayout);
}
qx.registry.registerMainMethod(qooxdooMain);
class Navbar extends qx.ui.container.Composite {
    constructor(pageTitle, onToggleSidebar) {
        super(new qx.ui.layout.HBox(2));
        this.__isActionsOpen = false;
        this.setAlignY("middle");
        this.setPadding(8);
        this.setHeight(55);
        this.setBackgroundColor(AppColors.background());
        this.setDecorator(new qx.ui.decoration.Decorator().set({
            widthBottom: 1,
            styleBottom: "solid",
            colorBottom: AppColors.border(),
        }));
        // SIDEBAR TRIGGER
        const collapseSidebarBtn = new BsButton("", new InlineSvgIcon("menu", 16), {
            size: "sm-icon",
            variant: "ghost",
        });
        collapseSidebarBtn.setWidth(50);
        collapseSidebarBtn.onClick(() => {
            this.fireEvent("toggleSidebar");
            if (onToggleSidebar)
                onToggleSidebar();
        });
        this.add(collapseSidebarBtn);
        // PAGE TITLE
        this.__titleLabel = new qx.ui.basic.Label(pageTitle !== null && pageTitle !== void 0 ? pageTitle : "Dashboard");
        this.__titleLabel.setTextColor(AppColors.foreground());
        this.__titleLabel.setFont(
        // @ts-ignore
        new qx.bom.Font(18).set({ bold: true }));
        this.__titleLabel.setAlignY("middle");
        this.add(this.__titleLabel);
        const spacer = new qx.ui.core.Spacer();
        this.add(spacer, { flex: 1 });
        // OTHER ACTIONS
        const otherActionsBtn = new BsButton("", new InlineSvgIcon("ellipsis", 8), {
            size: "sm-icon",
            variant: "ghost",
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
        this.__actionsPopup.setDecorator(new qx.ui.decoration.Decorator().set({
            width: 1,
            style: "solid",
            color: AppColors.border(),
            radius: 10,
            shadowVerticalLength: 2,
            shadowBlurRadius: 10,
            shadowColor: AppColors.overlay(0.1),
        }));
        const actionsMenu = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
        actionsMenu.set({
            minWidth: 160,
            paddingTop: 6,
            paddingRight: 6,
            paddingBottom: 6,
            paddingLeft: 6,
            backgroundColor: AppColors.background(),
            textColor: AppColors.foreground(),
        });
        actionsMenu.add(this.__createActionsMenuButton("Support", new InlineSvgIcon("help-circle", 16), "support"));
        actionsMenu.add(this.__createActionsMenuButton("About", new InlineSvgIcon("info", 16), "show-about-dialog"));
        this.addListener("action", (ev) => {
            if (ev.getData() === "show-about-dialog") {
                showAboutDialog();
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
    __createActionsMenuButton(label, icon, action) {
        const button = new BsSidebarButton(label, icon, "btn-sm-outline");
        button.setAllowGrowX(true);
        button.setHeight(40);
        button.onClick(() => {
            this.fireDataEvent("action", action);
            this.__closeActionsPopup();
        });
        return button;
    }
    __toggleActionsPopup(target) {
        if (this.__isActionsOpen) {
            this.__closeActionsPopup();
            return;
        }
        this.__actionsPopup.show();
        this.__isActionsOpen = true;
        this.__actionsPopup.placeToWidget(target, true);
        qx.event.Timer.once(() => this.__actionsPopup.placeToWidget(target, true), this, 0);
    }
    __closeActionsPopup() {
        if (!this.__isActionsOpen)
            return;
        this.__isActionsOpen = false;
        this.__actionsPopup.hide();
    }
    setPageTitle(value) {
        this.__titleLabel.setValue(value);
    }
    setTitle(value) {
        this.setPageTitle(value);
    }
}
Navbar.events = {
    toggleSidebar: "qx.event.type.Event",
    action: "qx.event.type.Data",
};
class Sidebar extends qx.ui.container.Composite {
    constructor(sidebarItems, initialActiveLabel) {
        super(new qx.ui.layout.VBox(0).set({ alignX: "center" }));
        this.__collapsed = false;
        this.__drawerMode = false;
        this.__listContainer = null;
        this.__buttons = [];
        this.__buttonStates = new Map();
        this.__activeLeafLabel = null;
        this.__searchQuery = "";
        this.__isAnimating = false;
        this.__hasRendered = false;
        this.__stack = [];
        this.__rootItems = sidebarItems;
        this.__activeLeafLabel =
            initialActiveLabel !== null && initialActiveLabel !== void 0 ? initialActiveLabel : this.__findFirstLeafLabel(sidebarItems);
        this.setWidth(230);
        this.setPadding(10);
        this.setAlignX("center");
        this.setBackgroundColor(AppColors.sidebar());
        this.setDecorator(new qx.ui.decoration.Decorator().set({
            widthRight: 1,
            styleRight: "solid",
            colorRight: AppColors.sidebarBorder(),
        }));
        const schoolLogo = new qx.ui.basic.Image("resource/app/app_logo.png");
        schoolLogo.set({
            scale: true,
            width: 42,
            height: 42,
        });
        this.__schoolLogo = schoolLogo;
        this.add(schoolLogo);
        const header = new qx.ui.basic.Label("Aldersgate College Inc.");
        this.__header = header;
        header.setFont(
        //@ts-ignore
        new qx.bom.Font(12).set({ bold: true }));
        header.setTextAlign("center");
        header.setPadding(5);
        header.setTextColor(AppColors.sidebarForeground());
        this.add(header);
        const appVersion = new qx.ui.basic.Label("Class Scheduler v1.0.0");
        this.__appVersion = appVersion;
        appVersion.setTextColor(AppColors.sidebarForeground());
        appVersion.setTextAlign("center");
        appVersion.setOpacity(0.7);
        appVersion.setFont(
        // @ts-ignore
        new qx.bom.Font(10, ["Inter", "sans-serif"]));
        appVersion.setMarginTop(6);
        appVersion.setMarginBottom(12);
        this.add(appVersion);
        this.__searchInput = new BsInput("", "Search pages...", "w-full input-sm");
        this.__searchInput.setLeadingHtml('<img src="resource/app/icons/search.svg" alt="" width="16" height="16" style="display:block;opacity:0.7" />');
        this.__searchInput.setAllowGrowX(true);
        this.__searchInput.onInput((value) => {
            this.__searchQuery = value.trim();
            this.__renderVisibleItems(false);
        });
        this.__searchInput.setTabIndex(20);
        this.add(this.__searchInput);
        this.__backContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
        this.__backContainer.setAllowGrowX(true);
        const backButton = new BsSidebarButton("Back", new InlineSvgIcon("arrow-left", 16));
        backButton.setAllowGrowX(true);
        backButton.setWidth(230);
        backButton.setCentered(true);
        this.__backButton = backButton;
        backButton.onClick(() => {
            if (this.__stack.length === 0 || this.__isAnimating)
                return;
            this.__stack.pop();
            this.__renderVisibleItems(true);
        });
        this.__backContainer.add(backButton);
        this.add(this.__backContainer);
        this.__itemsViewport = new qx.ui.container.Composite(new qx.ui.layout.Grow());
        this.__itemsViewport.setAllowGrowX(true);
        this.__itemsViewport.setAllowGrowY(true);
        this.__itemsViewport.setMinHeight(10);
        this.add(this.__itemsViewport, { flex: 1 });
        this.__itemsViewport.addListenerOnce("appear", () => {
            this.__setDomStyles(this.__itemsViewport, {
                overflow: "hidden",
            });
        });
        const footer = new BsSidebarAccount("User", // TODO: replace with actual user name,
        "Role", // TODO: replace with actual role,
        "resource/app/user.png", "RB");
        this.__footer = footer;
        this.__footer.onAction((action) => {
            this.fireDataEvent("action", action);
        });
        this.add(footer);
        this.__renderVisibleItems(false);
    }
    __findFirstLeafLabel(items) {
        for (const item of items) {
            if (item.children && item.children.length > 0) {
                const nestedLabel = this.__findFirstLeafLabel(item.children);
                if (nestedLabel)
                    return nestedLabel;
            }
            else {
                return item.label;
            }
        }
        return null;
    }
    __getCurrentLevelItems() {
        if (this.__stack.length === 0)
            return this.__rootItems;
        return this.__stack[this.__stack.length - 1].items;
    }
    __collectLeafEntries(source, path = [], out = []) {
        source.forEach((item) => {
            const nextPath = [...path, item.label];
            if (item.children && item.children.length > 0) {
                this.__collectLeafEntries(item.children, nextPath, out);
            }
            else {
                out.push({ item, path: nextPath });
            }
        });
        return out;
    }
    __setPathFromLeaf(path) {
        const nextStack = [];
        let source = this.__rootItems;
        for (let i = 0; i < path.length - 1; i++) {
            const label = path[i];
            const match = source.find((entry) => entry.label === label);
            if (!match || !match.children || match.children.length === 0)
                break;
            nextStack.push({ label: match.label, items: match.children });
            source = match.children;
        }
        this.__stack = nextStack;
    }
    __syncBackVisibility() {
        const shouldShow = !this.__collapsed &&
            this.__searchQuery.length === 0 &&
            this.__stack.length > 0;
        if (shouldShow) {
            const parentLabel = this.__stack[this.__stack.length - 1].label;
            this.__backButton.setText(parentLabel);
            this.__backContainer.show();
        }
        else {
            this.__backContainer.exclude();
        }
    }
    __renderVisibleItems(animated) {
        this.__syncBackVisibility();
        const nextList = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
        nextList.setAllowGrowX(true);
        this.__buttons = [];
        this.__buttonStates.clear();
        if (this.__searchQuery.length > 0) {
            const query = this.__searchQuery.toLowerCase();
            const matches = this.__collectLeafEntries(this.__rootItems).filter(({ item, path }) => {
                const haystack = `${path.join(" ")} ${item.label}`.toLowerCase();
                return haystack.includes(query);
            });
            matches.forEach(({ item, path }) => {
                const parentTrail = path.slice(0, path.length - 1).join(" / ");
                const displayLabel = parentTrail
                    ? `${item.label} - ${parentTrail}`
                    : item.label;
                const row = this.__createListRow();
                const button = this.__createSidebarButton(displayLabel, item.icon, false);
                button.onClick(() => {
                    this.__activeLeafLabel = item.label;
                    this.__searchQuery = "";
                    this.__searchInput.setValue("");
                    this.__setPathFromLeaf(path);
                    this.fireDataEvent("select", item.label);
                    this.__renderVisibleItems(false);
                });
                row.add(button, { flex: 1 });
                nextList.add(row);
            });
        }
        else {
            const currentItems = this.__getCurrentLevelItems();
            currentItems.forEach((item) => {
                const hasChildren = !!item.children && item.children.length > 0;
                const row = this.__createListRow();
                const button = this.__createSidebarButton(item.label, item.icon, hasChildren);
                if (hasChildren) {
                    button.onClick(() => {
                        if (this.__isAnimating || !item.children)
                            return;
                        this.__stack.push({ label: item.label, items: item.children });
                        this.__renderVisibleItems(true);
                    });
                }
                else {
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
            this.__itemsViewport.removeAll();
            this.__itemsViewport.add(nextList);
            this.__listContainer = nextList;
            return;
        }
        const previousList = this.__listContainer;
        this.__isAnimating = true;
        this.__itemsViewport.add(nextList);
        this.__setDomStyles(nextList, {
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            opacity: "0",
            transform: "translateX(30px)",
            transition: "opacity 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        });
        this.__setDomStyles(previousList, {
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            opacity: "1",
            transform: "translateX(0px)",
            transition: "opacity 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        });
        qx.event.Timer.once(() => {
            this.__setDomStyles(previousList, {
                opacity: "0",
                transform: "translateX(-30px)",
            });
            this.__setDomStyles(nextList, {
                opacity: "1",
                transform: "translateX(0px)",
            });
        }, this, 20);
        qx.event.Timer.once(() => {
            this.__itemsViewport.remove(previousList);
            this.__setDomStyles(nextList, {
                position: "relative",
                transform: "none",
            });
            this.__listContainer = nextList;
            this.__isAnimating = false;
        }, this, 320);
    }
    __createListRow() {
        const row = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({ alignY: "middle" }));
        row.set({
            allowGrowX: true,
            height: 40,
        });
        return row;
    }
    __createSidebarButton(label, icon, hasChildren) {
        const button = new BsSidebarButton(label, icon);
        button.setAllowGrowX(true);
        button.setCollapsed(this.__collapsed);
        button.setWidth(this.__collapsed ? 56 : 230);
        if (hasChildren) {
            button.setTrailingHtml("&rsaquo;");
        }
        this.__buttons.push(button);
        this.__buttonStates.set(label, button);
        return button;
    }
    __setDomStyles(widget, styles) {
        const contentElement = widget.getContentElement();
        if (!contentElement || !contentElement.setStyle)
            return;
        for (const key in styles) {
            if (!Object.prototype.hasOwnProperty.call(styles, key))
                continue;
            contentElement.setStyle(key, styles[key]);
        }
    }
    setCollapsed(collapsed) {
        this.__collapsed = collapsed;
        const DURATION = 280;
        const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
        const skipAnimation = !this.__hasRendered;
        this.__hasRendered = true;
        if (collapsed) {
            if (skipAnimation) {
                this.setWidth(0);
                this.setMinWidth(0);
                this.__setDomStyles(this, { overflow: "hidden", opacity: "0" });
                return;
            }
            this.setMinWidth(0);
            this.__setDomStyles(this, {
                overflow: "hidden",
                willChange: "width, opacity",
                transition: `width ${DURATION}ms ${EASING}, min-width ${DURATION}ms ${EASING}, opacity ${DURATION}ms ${EASING}`,
                width: "0px",
                minWidth: "0px",
                opacity: "0",
            });
            qx.event.Timer.once(() => {
                this.setWidth(0);
                this.setMinWidth(0);
                this.__setDomStyles(this, { transition: "none", willChange: "auto" });
            }, this, DURATION + 20);
            return;
        }
        if (skipAnimation) {
            this.show();
            this.setMinWidth(230);
            this.setWidth(230);
            this.__setDomStyles(this, { overflow: "visible", opacity: "1" });
        }
        else {
            this.show();
            this.setMinWidth(0);
            this.setWidth(0);
            this.__setDomStyles(this, {
                overflow: "hidden",
                opacity: "0",
                width: "0px",
                minWidth: "0px",
                willChange: "width, opacity",
                transition: "none",
            });
            qx.event.Timer.once(() => {
                this.__setDomStyles(this, {
                    transition: `width ${DURATION}ms ${EASING}, min-width ${DURATION}ms ${EASING}, opacity ${DURATION}ms ${EASING}`,
                    width: "230px",
                    minWidth: "230px",
                    opacity: "1",
                });
            }, this, 20);
            qx.event.Timer.once(() => {
                this.setMinWidth(230);
                this.setWidth(230);
                this.__setDomStyles(this, {
                    overflow: "visible",
                    transition: "none",
                    willChange: "auto",
                });
            }, this, DURATION + 40);
        }
        this.__applyChromeMode();
    }
    setDrawerMode(enabled) {
        this.__drawerMode = enabled;
        if (this.__collapsed)
            return;
        this.__applyChromeMode();
        this.__renderVisibleItems(false);
    }
    __applyChromeMode() {
        if (this.__drawerMode) {
            this.setPadding(8);
            this.setDecorator(new qx.ui.decoration.Decorator().set({
                widthRight: 0,
            }));
            this.__schoolLogo.exclude();
            this.__header.exclude();
            this.__appVersion.exclude();
            this.__footer.exclude();
            this.__searchInput.show();
            this.__syncBackVisibility();
            return;
        }
        this.setPadding(10);
        this.setDecorator(new qx.ui.decoration.Decorator().set({
            widthRight: 1,
            styleRight: "solid",
            colorRight: AppColors.sidebarBorder(),
        }));
        this.__schoolLogo.show();
        this.__header.show();
        this.__appVersion.show();
        this.__footer.show();
        this.__searchInput.show();
        this.__syncBackVisibility();
    }
    isCollapsed() {
        return this.__collapsed;
    }
}
Sidebar.events = {
    select: "qx.event.type.Data",
    action: "qx.event.type.Data",
};
class InlineSvgIcon extends qx.ui.embed.Html {
    constructor(name, size = 20) {
        super("");
        this.__name = name;
        this.__size = size;
        this.set({
            width: size,
            height: size,
            minWidth: size,
            minHeight: size,
            selectable: false,
        });
        this.__loadAndRender();
    }
    setIcon(name) {
        this.__name = name;
        this.__loadAndRender();
    }
    setSize(size) {
        this.__size = size;
        this.setWidth(size);
        this.setHeight(size);
        this.setMinWidth(size);
        this.setMinHeight(size);
        this.__loadAndRender();
    }
    __loadAndRender() {
        const url = "resource/app/icons/" + this.__name + ".svg";
        fetch(url)
            .then((r) => r.text())
            .then((svg) => {
            // Force width/height and make sure it uses currentColor
            // (If your SVG already has stroke="currentColor", this is harmless.)
            let out = svg;
            // Ensure currentColor (covers hardcoded strokes)
            out = out.replace(/stroke="[^"]*"/g, `stroke="currentColor"`);
            // Ensure sizing on root <svg> only (do not touch child element sizes)
            out = out.replace(/<svg\b[^>]*>/, (tag) => {
                const cleanedTag = tag
                    .replace(/\swidth="[^"]*"/g, "")
                    .replace(/\sheight="[^"]*"/g, "")
                    .replace(/\sstyle="[^"]*"/g, "");
                return cleanedTag.replace("<svg", `<svg width="${this.__size}" height="${this.__size}" style="display:block;"`);
            });
            this.setHtml(out);
            // Qooxdoo nudge after DOM update
            this.invalidateLayoutCache();
        })
            .catch(() => this.setHtml(""));
    }
}
/**
 * Singleton modal dialog. One shared <dialog> element is reused for every
 * invocation — content, title, and buttons are swapped dynamically.
 * Footer buttons use event delegation via data-action attributes.
 */
class BsAlertDialog {
    constructor() { }
    static show(config) {
        var _a, _b, _c, _d;
        const dialog = BsAlertDialog.__getOrCreateDialog();
        // Dispose previous qooxdoo widget tree
        BsAlertDialog.__disposeBody();
        // Title
        BsAlertDialog.__titleEl.textContent = config.title;
        // Body
        const body = BsAlertDialog.__body;
        if (config.children) {
            dialog.removeAttribute("aria-describedby");
            const bodyHost = document.createElement("div");
            body.appendChild(bodyHost);
            BsAlertDialog.__bodyRoot = new qx.ui.root.Inline(bodyHost);
            BsAlertDialog.__bodyRoot.setLayout(new qx.ui.layout.Grow());
            BsAlertDialog.__bodyRoot.add(config.children);
        }
        else if (config.description) {
            dialog.setAttribute("aria-describedby", "bs-dialog-desc");
            const p = document.createElement("p");
            p.id = "bs-dialog-desc";
            p.textContent = config.description;
            body.appendChild(p);
        }
        // Footer buttons (rebuilt each time for correct labels)
        const footer = BsAlertDialog.__footer;
        footer.innerHTML = "";
        const buttons = (_a = config.footerButtons) !== null && _a !== void 0 ? _a : "ok-cancel";
        const cancelLabel = (_b = config.cancelLabel) !== null && _b !== void 0 ? _b : "Cancel";
        const continueLabel = (_c = config.continueLabel) !== null && _c !== void 0 ? _c : "Continue";
        if (buttons === "ok-cancel" || buttons === "cancel") {
            const cancelBtn = document.createElement("button");
            cancelBtn.className = "btn-sm-primary";
            cancelBtn.textContent = cancelLabel;
            cancelBtn.type = "button";
            cancelBtn.dataset.action = "cancel";
            footer.appendChild(cancelBtn);
        }
        if (buttons === "ok-cancel" || buttons === "ok") {
            const continueBtn = document.createElement("button");
            continueBtn.className = "btn-sm-primary";
            continueBtn.textContent = continueLabel;
            continueBtn.type = "button";
            continueBtn.dataset.action = "continue";
            footer.appendChild(continueBtn);
        }
        BsAlertDialog.__onContinue = (_d = config.onContinue) !== null && _d !== void 0 ? _d : null;
        dialog.showModal();
    }
    static __disposeBody() {
        if (BsAlertDialog.__bodyRoot) {
            BsAlertDialog.__bodyRoot.removeAll();
            BsAlertDialog.__bodyRoot.destroy();
            BsAlertDialog.__bodyRoot = null;
        }
        BsAlertDialog.__body.innerHTML = "";
    }
    static __getOrCreateDialog() {
        if (BsAlertDialog.__dialog)
            return BsAlertDialog.__dialog;
        const dialog = document.createElement("dialog");
        dialog.id = "bs-global-dialog";
        dialog.className = "dialog";
        dialog.setAttribute("aria-labelledby", "bs-dialog-title");
        const wrapper = document.createElement("div");
        const header = document.createElement("header");
        const title = document.createElement("h2");
        title.id = "bs-dialog-title";
        header.appendChild(title);
        const body = document.createElement("div");
        const footer = document.createElement("footer");
        wrapper.appendChild(header);
        wrapper.appendChild(body);
        wrapper.appendChild(footer);
        dialog.appendChild(wrapper);
        document.body.appendChild(dialog);
        // Event delegation — single handler for all footer button clicks
        footer.addEventListener("click", (e) => {
            var _a;
            const target = e.target.closest("button[data-action]");
            if (!target)
                return;
            const action = target.dataset.action;
            if (action === "cancel") {
                dialog.close();
            }
            else if (action === "continue") {
                dialog.close();
                (_a = BsAlertDialog.__onContinue) === null || _a === void 0 ? void 0 : _a.call(BsAlertDialog);
            }
        });
        BsAlertDialog.__dialog = dialog;
        BsAlertDialog.__titleEl = title;
        BsAlertDialog.__body = body;
        BsAlertDialog.__footer = footer;
        return dialog;
    }
}
BsAlertDialog.__dialog = null;
BsAlertDialog.__titleEl = null;
BsAlertDialog.__body = null;
BsAlertDialog.__footer = null;
BsAlertDialog.__bodyRoot = null;
BsAlertDialog.__onContinue = null;
class BsAvatar extends qx.ui.basic.Atom {
    constructor(src, alt, fallback, className, shape = "full") {
        super();
        this.__imgEl = null;
        this.__fallbackEl = null;
        this.__hasImageError = false;
        this._setLayout(new qx.ui.layout.Grow());
        this.__src = src !== null && src !== void 0 ? src : "";
        this.__alt = alt !== null && alt !== void 0 ? alt : "User avatar";
        this.__fallback = fallback !== null && fallback !== void 0 ? fallback : "?";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__shape = shape;
        this.__htmlAvatar = new qx.ui.embed.Html("");
        this.__render();
        this._add(this.__htmlAvatar);
        this.__htmlAvatar.addListenerOnce("appear", () => {
            this.__bindDom();
        });
    }
    __escape(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
    __resolveShapeClass() {
        if (this.__shape === "rounded")
            return "rounded-md";
        if (this.__shape === "square")
            return "rounded-none";
        return "rounded-full";
    }
    __bindDom() {
        var _a, _b;
        const root = this.__htmlAvatar.getContentElement().getDomElement();
        this.__imgEl = (_a = root === null || root === void 0 ? void 0 : root.querySelector("img")) !== null && _a !== void 0 ? _a : null;
        this.__fallbackEl =
            (_b = root === null || root === void 0 ? void 0 : root.querySelector("[data-avatar-fallback]")) !== null && _b !== void 0 ? _b : null;
        if (!this.__imgEl)
            return;
        this.__imgEl.onerror = () => {
            this.__hasImageError = true;
            this.__syncVisibility();
        };
        this.__imgEl.onload = () => {
            this.__hasImageError = false;
            this.__syncVisibility();
        };
        this.__syncVisibility();
    }
    __syncVisibility() {
        if (!this.__fallbackEl)
            return;
        const shouldShowFallback = !this.__src || this.__hasImageError;
        this.__fallbackEl.style.display = shouldShowFallback ? "flex" : "none";
    }
    __render() {
        const src = this.__escape(this.__src);
        const alt = this.__escape(this.__alt);
        const fallback = this.__escape(this.__fallback);
        const shapeClass = this.__resolveShapeClass();
        const wrapperClass = [
            "relative",
            "inline-flex",
            "size-8",
            "shrink-0",
            shapeClass,
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        const imageClass = ["size-full", "object-cover", shapeClass]
            .filter(Boolean)
            .join(" ");
        const fallbackClass = [
            "absolute",
            "inset-0",
            "items-center",
            "justify-center",
            "bg-muted",
            "text-muted-foreground",
            "text-xs",
            "font-medium",
            shapeClass,
        ]
            .filter(Boolean)
            .join(" ");
        this.__htmlAvatar.setHtml(`
			<div class="p-1">
				<span class="${wrapperClass}">
					<img
						class="${imageClass}"
						alt="${alt}"
						src="${src}"
					/>
					<span class="${fallbackClass}" data-avatar-fallback>
						${fallback}
					</span>
				</span>
			</div>
		`);
        qx.event.Timer.once(() => this.__bindDom(), this, 0);
    }
    setSrc(src) {
        this.__src = src !== null && src !== void 0 ? src : "";
        this.__hasImageError = false;
        this.__render();
        return this;
    }
    setAlt(alt) {
        this.__alt = alt !== null && alt !== void 0 ? alt : "User avatar";
        this.__render();
        return this;
    }
    setFallback(fallback) {
        this.__fallback = fallback !== null && fallback !== void 0 ? fallback : "?";
        this.__render();
        return this;
    }
    setShape(shape) {
        this.__shape = shape;
        this.__render();
        return this;
    }
}
/**
 * Widget-based Basecoat button matching new_proj `myapp.components.ui.Button`:
 * `btn` + optional `btn-{variant}` + `btn-{size}`, native click, {@link BsTooltip} helpers.
 * For the Atom-based control used across the app, see {@link BsButton} in Button.ts.
 */
class BsBasecoatButton extends qx.ui.core.Widget {
    constructor(text, icon, options) {
        var _a, _b, _c;
        super();
        this.__buttonEl = null;
        this.__label = "";
        this.__iconHtml = "";
        this.__toolTip = null;
        this._setLayout(new qx.ui.layout.Canvas());
        this.setFocusable(true);
        this.setAllowGrowX(true);
        this.__label = text !== null && text !== void 0 ? text : "";
        this.__iconHtml = icon ? icon.getHtml() : "";
        this.__variant = (_a = options === null || options === void 0 ? void 0 : options.variant) !== null && _a !== void 0 ? _a : "default";
        this.__size = (_b = options === null || options === void 0 ? void 0 : options.size) !== null && _b !== void 0 ? _b : "default";
        this.__extraClassName = (_c = options === null || options === void 0 ? void 0 : options.className) !== null && _c !== void 0 ? _c : "";
        this.__html = new qx.ui.embed.Html("");
        this._add(this.__html, { edge: 0 });
        this.__render();
        this.__html.addListenerOnce("appear", () => {
            this.__bindButton();
        });
        this.addListener("focusin", () => {
            var _a;
            (_a = this.__buttonEl) === null || _a === void 0 ? void 0 : _a.focus();
        });
        this.addListener("changeTabIndex", () => {
            this.__syncTabIndex();
        });
        if (icon) {
            icon.addListener("changeHtml", () => {
                this.__iconHtml = icon.getHtml();
                this.__render();
            });
        }
    }
    __variantClassSegment() {
        const map = {
            default: "primary",
            secondary: "secondary",
            destructive: "destructive",
            outline: "outline",
            ghost: "ghost",
            link: "link",
        };
        return map[this.__variant];
    }
    __sizeClassSegment() {
        if (this.__size === "default")
            return "";
        return this.__size;
    }
    __buildButtonClasses() {
        const parts = ["btn"];
        const v = this.__variantClassSegment();
        if (v)
            parts.push(`btn-${v}`);
        const s = this.__sizeClassSegment();
        if (s)
            parts.push(`btn-${s}`);
        if (this.__extraClassName) {
            parts.push(this.__extraClassName);
        }
        return parts.join(" ");
    }
    __escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
    __render() {
        const classes = this.__buildButtonClasses();
        const hasIcon = this.__iconHtml.length > 0;
        const iconGap = hasIcon && this.__label.length > 0
            ? "me-2 inline-flex shrink-0 items-center"
            : "inline-flex shrink-0 items-center";
        const iconPart = hasIcon
            ? `<span class="${iconGap}">${this.__iconHtml}</span>`
            : "";
        const labelPart = this.__label.length
            ? `<span class="truncate min-w-0">${this.__escapeHtml(this.__label)}</span>`
            : "";
        this.__html.setHtml(`
      <div style="margin: 2px; min-width: 0; flex-shrink: 1;">
        <button type="button" class="${classes}" style="width: 100%; display: inline-flex; align-items: center; justify-content: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; min-width: 0;" tabindex="-1">
          ${iconPart}
          ${labelPart}
        </button>
      </div>
    `);
        qx.event.Timer.once(() => this.__bindButton(), this, 0);
    }
    __bindButton() {
        var _a, _b;
        const root = (_a = this.__html.getContentElement()) === null || _a === void 0 ? void 0 : _a.getDomElement();
        this.__buttonEl =
            (_b = root === null || root === void 0 ? void 0 : root.querySelector("button")) !== null && _b !== void 0 ? _b : null;
        if (!this.__buttonEl)
            return;
        this.__buttonEl.onclick = () => {
            this.fireEvent("execute");
        };
        this.__syncTabIndex();
        this.__refreshTooltipOnDom();
    }
    __syncTabIndex() {
        if (!this.__buttonEl)
            return;
        this.__buttonEl.setAttribute("tabindex", "-1");
    }
    __refreshTooltipOnDom() {
        if (this.__toolTip) {
            this.__toolTip.attachTo(this);
        }
    }
    setLabel(label) {
        this.__label = String(label || "");
        this.__render();
        return this;
    }
    getLabel() {
        return this.__label;
    }
    setBasecoatToolTip(text, side = "top", align = "center") {
        if (!this.__toolTip) {
            this.__toolTip = new BsTooltip(String(text || ""), side || "top", align || "center");
            this.__toolTip.attachTo(this);
        }
        else {
            this.__toolTip.setText(String(text || ""));
            this.__toolTip.setSide(side || "top");
            this.__toolTip.setAlign(align || "center");
            this.__toolTip.attachTo(this);
        }
        return this;
    }
    clearBasecoatToolTip() {
        if (!this.__toolTip)
            return this;
        this.__toolTip.detachFrom(this);
        this.__toolTip.dispose();
        this.__toolTip = null;
        return this;
    }
    getBasecoatToolTip() {
        return this.__toolTip;
    }
    getVariant() {
        return this.__variant;
    }
    getSize() {
        return this.__size;
    }
    onClick(handler) {
        this.addListener("execute", handler);
        return this;
    }
    destruct() {
        this.clearBasecoatToolTip();
        super.destruct();
    }
}
BsBasecoatButton.events = {
    execute: "qx.event.type.Event",
};
/**
 * Basecoat-style checkbox: label + native input.
 * API aligned with qx.ui.form.CheckBox: setLabel/getLabel, setValue/getValue (boolean), changeValue.
 */
class BsCheckBox extends qx.ui.core.Widget {
    constructor(label = "") {
        super();
        this.__label = "";
        this.__value = false;
        this.__initialLabel = label;
        this._setLayout(new qx.ui.layout.Canvas());
        const labelEsc = this.__escapeHtml(label || "");
        this.__html = new qx.ui.embed.Html(`
      <label class="label gap-3" style="margin: 0; padding: 0; display: inline-flex; align-items: center; cursor: pointer; min-width: 0;">
        <input type="checkbox" class="input" style="margin: 0;">
        <span class="checkbox-label-text">${labelEsc}</span>
      </label>
    `);
        this._add(this.__html, { edge: 0 });
        this.__html.addListenerOnce("appear", () => {
            if (this.__initialLabel) {
                this.setLabel(this.__initialLabel);
            }
            this.__applyValueToDom(this.__value);
            this.__attachInputListener();
        });
    }
    __escapeHtml(text) {
        if (!text)
            return "";
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
    __getRootElement() {
        var _a;
        const dom = (_a = this.__html.getContentElement()) === null || _a === void 0 ? void 0 : _a.getDomElement();
        return dom ? dom.querySelector("label") : null;
    }
    __getInputElement() {
        const root = this.__getRootElement();
        return root ? root.querySelector('input[type="checkbox"]') : null;
    }
    __getLabelTextElement() {
        const root = this.__getRootElement();
        return root ? root.querySelector(".checkbox-label-text") : null;
    }
    __attachInputListener() {
        const input = this.__getInputElement();
        if (!input)
            return;
        input.addEventListener("change", () => {
            if (this.isDisposed())
                return;
            this.setValue(input.checked);
        });
    }
    __applyValueToDom(value) {
        const input = this.__getInputElement();
        if (input)
            input.checked = !!value;
    }
    getLabel() {
        return this.__label;
    }
    setLabel(value) {
        const next = value !== null && value !== void 0 ? value : "";
        if (this.__label === next)
            return this;
        const old = this.__label;
        this.__label = next;
        const span = this.__getLabelTextElement();
        if (span)
            span.textContent = next;
        this.fireDataEvent("changeLabel", next, old);
        return this;
    }
    getValue() {
        return this.__value;
    }
    setValue(value) {
        const next = !!value;
        if (this.__value === next) {
            this.__applyValueToDom(next);
            return this;
        }
        const old = this.__value;
        this.__value = next;
        this.__applyValueToDom(next);
        this.fireDataEvent("changeValue", next, old);
        return this;
    }
}
BsCheckBox.events = {
    changeValue: "qx.event.type.Data",
    changeLabel: "qx.event.type.Data",
};
/**
 * Basecoat-style custom select: button + listbox, popover portaled to body / dialog.
 */
class BsComboBox extends qx.ui.core.Widget {
    constructor() {
        super();
        this.__buttonElement = null;
        this.__popoverElement = null;
        this.__listboxElement = null;
        this.__valueSpan = null;
        this.__items = [];
        this.__itemMap = new Map();
        this.__isOpen = false;
        this.__selectedItem = null;
        this.__popoverContainer = null;
        this.__updatePositionHandler = null;
        this.__clickHandler = null;
        this.__mobileSidePadding = 12;
        this.__storedValue = "";
        this.setAllowGrowX(false);
        this.setMinWidth(160);
        this.setMaxWidth(BsComboBox.__fieldMaxWidthPx);
        this._setLayout(new qx.ui.layout.Canvas());
        this.__comboId = `select-${this.toHashCode()}`;
        this.__html = new qx.ui.embed.Html(`
      <div class="select bs-combobox-root" id="${this.__comboId}" style="position: relative; display: block; width: min(100%, ${BsComboBox.__fieldMaxWidthPx}px); max-width: min(${BsComboBox.__fieldMaxWidthPx}px, 100vw - 1.5rem); min-width: 0; margin: 0; padding: 0; box-sizing: border-box; overflow: visible;">
        <button
          type="button"
          class="btn-outline"
          id="${this.__comboId}-trigger"
          style="display: flex; width: 100%; min-width: 10rem; max-width: 100%; box-sizing: border-box; justify-content: space-between;"
          aria-haspopup="listbox"
          aria-expanded="false"
          aria-controls="${this.__comboId}-listbox"
        >
          <span class="truncate" style="flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;"></span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; flex-shrink: 0; margin-left: 0.5rem; transition: transform 0.2s;">
            <path d="m7 15 5 5 5-5" />
            <path d="m7 9 5-5 5 5" />
          </svg>
        </button>
        <div
          id="${this.__comboId}-popover"
          data-popover
          aria-hidden="true"
          style="display: none !important; visibility: hidden !important; position: absolute; top: 100%; left: 0; margin-top: 2px; z-index: 10001; min-width: 100%;"
        >
          <div role="listbox" id="${this.__comboId}-listbox" aria-orientation="vertical" aria-labelledby="${this.__comboId}-trigger" style="max-height: 300px; overflow-y: auto;">
          </div>
        </div>
        <input type="hidden" name="${this.__comboId}-value" value="" />
      </div>
    `);
        this._add(this.__html, { edge: 0 });
        this.addListener("changeEnabled", (e) => {
            this.__applyEnabled(!!e.getData());
        }, this);
        this.__html.addListenerOnce("appear", () => {
            const widgetElement = this.getContentElement();
            if (widgetElement) {
                widgetElement.setStyle("overflow", "visible");
                const domElement = widgetElement.getDomElement();
                if (domElement) {
                    domElement.addEventListener("focusin", (e) => {
                        const button = this.__buttonElement;
                        if (button && e.target === domElement) {
                            button.focus();
                        }
                    });
                }
            }
            this.__pinCompactFieldWidth();
            qx.event.Timer.once(() => this.__pinCompactFieldWidth(), this, 0);
            this.__setupDropdownEvents();
            this.__syncItemsToDOM();
            this.__applyEnabled(this.getEnabled());
            if (this.__storedValue) {
                this.__applyValueToSelection(this.__storedValue);
            }
        });
    }
    __pinCompactFieldWidth() {
        var _a, _b;
        const m = BsComboBox.__fieldMaxWidthPx;
        const pin = (el) => {
            if (!el)
                return;
            el.style.setProperty("width", `min(100%, ${m}px)`, "important");
            el.style.setProperty("max-width", `min(${m}px, calc(100vw - 1.5rem))`, "important");
            el.style.setProperty("min-width", "0", "important");
            el.style.setProperty("box-sizing", "border-box", "important");
        };
        pin((_a = this.getContentElement()) === null || _a === void 0 ? void 0 : _a.getDomElement());
        pin((_b = this.__html.getContentElement()) === null || _b === void 0 ? void 0 : _b.getDomElement());
        const slot = this.__getContainerElement();
        pin(slot);
        if (slot) {
            pin(slot.querySelector(".bs-combobox-root"));
        }
    }
    __getViewportWidth() {
        return window.innerWidth || document.documentElement.clientWidth || 1200;
    }
    __setupDropdownEvents() {
        const container = this.__html.getContentElement().getDomElement();
        this.__buttonElement = container.querySelector(`#${this.__comboId}-trigger`);
        this.__popoverElement = container.querySelector(`#${this.__comboId}-popover`);
        this.__listboxElement = container.querySelector(`#${this.__comboId}-listbox`);
        this.__valueSpan = container.querySelector(".truncate");
        if (!this.__buttonElement ||
            !this.__popoverElement ||
            !this.__listboxElement ||
            !this.__valueSpan) {
            return;
        }
        const widgetElement = this.getContentElement();
        if (widgetElement) {
            const domElement = widgetElement.getDomElement();
            if (domElement) {
                domElement.setAttribute("tabindex", "-1");
            }
        }
        const wrapperDiv = container.querySelector("div.select");
        if (wrapperDiv) {
            wrapperDiv.setAttribute("tabindex", "-1");
        }
        this.__buttonElement.removeAttribute("tabindex");
        this.__buttonElement.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.getEnabled()) {
                this.__toggleDropdown();
            }
        }, true);
        const clickHandler = (e) => {
            const target = e.target;
            if (this.__isOpen &&
                target &&
                !container.contains(target) &&
                !this.__popoverElement.contains(target)) {
                this.__closeDropdown();
            }
        };
        document.addEventListener("click", clickHandler);
        this.__clickHandler = clickHandler;
        this.__buttonElement.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
                e.stopPropagation();
                return;
            }
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                e.preventDefault();
                if (!this.__isOpen) {
                    this.__openDropdown();
                }
            }
            else if (e.key === "Escape" && this.__isOpen) {
                e.preventDefault();
                this.__closeDropdown();
            }
        });
        this.__listboxElement.addEventListener("click", (e) => {
            const target = e.target;
            const option = target && target.closest ? target.closest("[role='option']") : null;
            if (option) {
                const value = option.getAttribute("data-value");
                this.__selectValue(value);
                this.__closeDropdown();
            }
        });
        this.__listboxElement.addEventListener("keydown", (e) => {
            const options = Array.from(this.__listboxElement.querySelectorAll("[role='option']"));
            const currentIndex = options.findIndex((opt) => opt === document.activeElement);
            if (e.key === "ArrowDown") {
                e.preventDefault();
                const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                if (options[nextIndex])
                    options[nextIndex].focus();
            }
            else if (e.key === "ArrowUp") {
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                if (options[prevIndex])
                    options[prevIndex].focus();
            }
            else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const option = document.activeElement;
                if (option && option.getAttribute("role") === "option") {
                    const value = option.getAttribute("data-value");
                    this.__selectValue(value);
                    this.__closeDropdown();
                }
            }
            else if (e.key === "Escape") {
                e.preventDefault();
                this.__closeDropdown();
                this.__buttonElement.focus();
            }
        });
    }
    __getContainerElement() {
        var _a;
        return ((_a = this.__html.getContentElement().getDomElement()) !== null && _a !== void 0 ? _a : null);
    }
    __toggleDropdown() {
        if (this.__isOpen) {
            this.__closeDropdown();
        }
        else {
            this.__openDropdown();
        }
    }
    __updatePopoverPosition() {
        if (!this.__isOpen || !this.__buttonElement || !this.__popoverElement) {
            return;
        }
        const buttonRect = this.__buttonElement.getBoundingClientRect();
        const viewportWidth = this.__getViewportWidth();
        const minLeft = this.__mobileSidePadding;
        const maxAllowedWidth = Math.max(180, viewportWidth - this.__mobileSidePadding * 2);
        const width = Math.min(buttonRect.width, maxAllowedWidth);
        const leftPx = Math.max(minLeft, Math.min(buttonRect.left, viewportWidth - width - this.__mobileSidePadding));
        const top = buttonRect.bottom + window.scrollY + 2;
        const left = leftPx + window.scrollX;
        this.__popoverElement.style.setProperty("top", `${top}px`, "important");
        this.__popoverElement.style.setProperty("left", `${left}px`, "important");
        this.__popoverElement.style.setProperty("width", `${width}px`, "important");
        this.__popoverElement.style.setProperty("min-width", `${width}px`, "important");
        this.__popoverElement.style.setProperty("max-width", `${width}px`, "important");
        this.__popoverElement.style.setProperty("max-height", "45vh", "important");
        if (this.__listboxElement) {
            this.__listboxElement.style.maxHeight = "45vh";
        }
    }
    __openDropdown() {
        if (!this.__popoverElement || !this.__buttonElement) {
            return;
        }
        this.__isOpen = true;
        const dialogElement = this.__buttonElement.closest("dialog");
        let targetContainer = document.body;
        if (dialogElement) {
            targetContainer = dialogElement;
        }
        if (!this.__popoverContainer) {
            this.__popoverContainer = document.createElement("div");
            this.__popoverContainer.className = "select";
            this.__popoverContainer.style.position = "fixed";
            this.__popoverContainer.style.pointerEvents = "none";
            this.__popoverContainer.style.zIndex = "2147483646";
            this.__popoverContainer.style.top = "0";
            this.__popoverContainer.style.left = "0";
            targetContainer.appendChild(this.__popoverContainer);
        }
        else if (this.__popoverContainer.parentNode !== targetContainer) {
            targetContainer.appendChild(this.__popoverContainer);
        }
        if (this.__popoverElement.parentNode !== this.__popoverContainer) {
            this.__popoverContainer.appendChild(this.__popoverElement);
        }
        this.__popoverElement.style.pointerEvents = "auto";
        this.__popoverElement.removeAttribute("aria-hidden");
        this.__popoverElement.style.position = "fixed";
        this.__popoverElement.style.zIndex = "2147483647";
        this.__popoverElement.style.setProperty("transition", "none", "important");
        this.__popoverElement.style.setProperty("transform", "none", "important");
        this.__popoverElement.style.setProperty("scale", "1", "important");
        this.__popoverElement.style.setProperty("opacity", "1", "important");
        this.__popoverElement.style.setProperty("translate", "none", "important");
        this.__popoverElement.style.setProperty("display", "none", "important");
        this.__updatePopoverPosition();
        this.__popoverElement.style.setProperty("display", "block", "important");
        this.__popoverElement.style.setProperty("visibility", "visible", "important");
        this.__buttonElement.setAttribute("aria-expanded", "true");
        this.__updatePositionHandler = this.__updatePopoverPosition.bind(this);
        window.addEventListener("scroll", this.__updatePositionHandler, true);
        window.addEventListener("resize", this.__updatePositionHandler);
        const svg = this.__buttonElement.querySelector("svg");
        if (svg) {
            svg.style.transform = "rotate(180deg)";
        }
        const firstOption = this.__listboxElement.querySelector("[role='option']");
        if (firstOption) {
            setTimeout(() => firstOption.focus(), 0);
        }
    }
    __closeDropdown() {
        if (!this.__popoverElement || !this.__buttonElement) {
            return;
        }
        this.__isOpen = false;
        if (this.__updatePositionHandler) {
            window.removeEventListener("scroll", this.__updatePositionHandler, true);
            window.removeEventListener("resize", this.__updatePositionHandler);
            this.__updatePositionHandler = null;
        }
        this.__popoverElement.style.setProperty("display", "none", "important");
        this.__popoverElement.style.setProperty("visibility", "hidden", "important");
        this.__popoverElement.setAttribute("aria-hidden", "true");
        this.__buttonElement.setAttribute("aria-expanded", "false");
        const container = this.__getContainerElement();
        if (container && this.__popoverElement.parentNode !== container) {
            container.appendChild(this.__popoverElement);
        }
        this.__popoverElement.style.position = "absolute";
        this.__popoverElement.style.top = "100%";
        this.__popoverElement.style.left = "0";
        const svg = this.__buttonElement.querySelector("svg");
        if (svg) {
            svg.style.transform = "rotate(0deg)";
        }
    }
    __selectValue(value) {
        if (!value) {
            return;
        }
        const item = this.__itemMap.get(value);
        if (item) {
            this.__selectedItem = item;
            this.setValue(value);
            this.fireDataEvent("changeSelection", value);
        }
    }
    __syncItemsToDOM() {
        if (!this.__listboxElement) {
            return;
        }
        this.__listboxElement.innerHTML = "";
        this.__items.forEach((item) => {
            const option = document.createElement("div");
            option.setAttribute("role", "option");
            option.setAttribute("data-value", item._value);
            option.setAttribute("tabindex", "0");
            option.textContent = item._label;
            this.__listboxElement.appendChild(option);
        });
        this.__updateSelectedDisplay();
    }
    __updateSelectedDisplay() {
        if (!this.__valueSpan) {
            return;
        }
        if (this.__selectedItem) {
            this.__valueSpan.textContent = this.__selectedItem._label;
        }
        else {
            this.__valueSpan.textContent = "";
        }
        if (this.__listboxElement) {
            const options = this.__listboxElement.querySelectorAll("[role='option']");
            options.forEach((option) => {
                const value = option.getAttribute("data-value");
                if (this.__selectedItem && value === this.__selectedItem._value) {
                    option.setAttribute("aria-selected", "true");
                }
                else {
                    option.removeAttribute("aria-selected");
                }
            });
        }
    }
    __applyValueToSelection(value, _old) {
        if (value) {
            const item = this.__itemMap.get(value);
            if (item) {
                this.__selectedItem = item;
            }
        }
        else {
            this.__selectedItem = null;
        }
        this.__updateSelectedDisplay();
    }
    __applyEnabled(enabled) {
        if (this.__buttonElement) {
            this.__buttonElement.disabled = !enabled;
            if (!enabled && this.__isOpen) {
                this.__closeDropdown();
            }
        }
    }
    add(item) {
        let label;
        let value;
        if (item && typeof item.getLabel === "function") {
            const li = item;
            label = li.getLabel();
            value = typeof li.getValue === "function" ? li.getValue() : label;
        }
        else if (typeof item === "string") {
            label = item;
            value = item;
        }
        else {
            return;
        }
        const listItem = {
            getLabel: () => label,
            getValue: () => value,
            _label: label,
            _value: value,
        };
        this.__items.push(listItem);
        this.__itemMap.set(value, listItem);
        if (this.__listboxElement) {
            const option = document.createElement("div");
            option.setAttribute("role", "option");
            option.setAttribute("data-value", value);
            option.setAttribute("tabindex", "0");
            option.textContent = label;
            this.__listboxElement.appendChild(option);
        }
    }
    getSelection() {
        return this.__selectedItem ? [this.__selectedItem] : [];
    }
    resetSelection() {
        this.__selectedItem = null;
        this.setValue("");
        this.__updateSelectedDisplay();
    }
    getValue() {
        return this.__selectedItem
            ? this.__selectedItem._value
            : this.__storedValue || "";
    }
    setValue(valueOrLabel) {
        var _a;
        if (!valueOrLabel) {
            if (this.__storedValue !== "") {
                const oldValue = this.__storedValue;
                this.__storedValue = "";
                this.__applyValueToSelection("", oldValue);
                this.fireDataEvent("changeValue", "", oldValue);
            }
            return;
        }
        let foundItem = null;
        let foundValue = null;
        for (const item of this.__items) {
            if (item._label === valueOrLabel) {
                foundItem = item;
                foundValue = item._value;
                break;
            }
        }
        if (!foundItem) {
            foundItem = (_a = this.__itemMap.get(valueOrLabel)) !== null && _a !== void 0 ? _a : null;
            if (foundItem) {
                foundValue = foundItem._value;
            }
            else {
                foundValue = valueOrLabel;
            }
        }
        const next = foundValue !== null && foundValue !== void 0 ? foundValue : "";
        if (this.__storedValue !== next) {
            const oldValue = this.__storedValue;
            this.__storedValue = next;
            this.__applyValueToSelection(next, oldValue);
            this.fireDataEvent("changeValue", next, oldValue);
        }
    }
    focus() {
        var _a;
        (_a = this.__buttonElement) === null || _a === void 0 ? void 0 : _a.focus();
    }
    blur() {
        var _a;
        (_a = this.__buttonElement) === null || _a === void 0 ? void 0 : _a.blur();
        this.__closeDropdown();
    }
    destruct() {
        var _a;
        if (this.__isOpen) {
            this.__closeDropdown();
        }
        if (this.__clickHandler) {
            document.removeEventListener("click", this.__clickHandler);
            this.__clickHandler = null;
        }
        if (this.__updatePositionHandler) {
            window.removeEventListener("scroll", this.__updatePositionHandler, true);
            window.removeEventListener("resize", this.__updatePositionHandler);
            this.__updatePositionHandler = null;
        }
        if ((_a = this.__popoverContainer) === null || _a === void 0 ? void 0 : _a.parentNode) {
            this.__popoverContainer.parentNode.removeChild(this.__popoverContainer);
            this.__popoverContainer = null;
        }
        super.destruct();
    }
}
BsComboBox.events = {
    changeValue: "qx.event.type.Data",
    changeSelection: "qx.event.type.Data",
};
/** Match BsDateField / popover (280px); still fills narrow parents via min(100%, …). */
BsComboBox.__fieldMaxWidthPx = 280;
/**
 * Basecoat-style date field with calendar popover (port of new_proj DateField).
 */
class BsDateField extends qx.ui.core.Widget {
    constructor() {
        super();
        this.__inputElement = null;
        this.__iconButton = null;
        this.__popoverElement = null;
        this.__calendarElement = null;
        this.__isOpen = false;
        this.__selectedDate = null;
        this.__value = null;
        this.__popoverContainer = null;
        this.__updatePositionHandler = null;
        this.__clickHandler = null;
        this.__calendarClickHandler = null;
        this.__calendarMouseDownHandler = null;
        /** Which panel is shown inside the calendar popover. */
        this.__calendarView = "days";
        /** First year shown in the year grid (12-year page). */
        this.__yearPageStart = 2000;
        this.__mobileSidePadding = 12;
        /** Do not consume full VBox stretch width — stay aligned with popover (see __fieldMaxWidthPx). */
        this.setAllowGrowX(false);
        this.setMinWidth(224);
        this.setMaxWidth(BsDateField.__fieldMaxWidthPx);
        this._setLayout(new qx.ui.layout.Canvas());
        this.__dateId = `date-${this.toHashCode()}`;
        const now = new Date();
        this.__currentMonth = now.getMonth();
        this.__currentYear = now.getFullYear();
        this.__html = new qx.ui.embed.Html(`
      <div class="bs-datefield-root" style="margin: 0; padding: 0; box-sizing: border-box; width: min(100%, ${BsDateField.__popoverPreferredWidth}px); max-width: min(${BsDateField.__popoverPreferredWidth}px, 100vw - 1.5rem); display: flex; align-items: center; height: 100%; position: relative; min-width: 0;">
        <input
          type="text"
          class="input"
          id="${this.__dateId}-trigger"
          style="box-sizing: border-box; flex: 1 1 auto; min-width: 0; max-width: 100%; padding-right: calc(var(--spacing) * 8); cursor: text;"
          aria-haspopup="dialog"
          aria-expanded="false"
          aria-controls="${this.__dateId}-calendar"
          placeholder="MM/DD/YYYY"
          maxlength="10"
        />
        <button
          type="button"
          id="${this.__dateId}-icon-btn"
          style="position: absolute; right: calc(var(--spacing) * 1); top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: calc(var(--spacing) * 0.5); display: flex; align-items: center; pointer-events: auto; z-index: 1;"
          aria-label="Open calendar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" x2="16" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="2" y2="6"></line>
            <line x1="3" x2="21" y1="10" y2="10"></line>
          </svg>
        </button>
        <div
          id="${this.__dateId}-popover"
          data-basecoat-ignore="true"
          aria-hidden="true"
          style="display: none !important; visibility: hidden !important; position: absolute; top: 100%; left: 0; margin-top: 2px; z-index: 10001; width: ${BsDateField.__popoverPreferredWidth}px; max-width: min(${BsDateField.__popoverPreferredWidth}px, calc(100vw - 24px)); min-width: 0; box-sizing: border-box; background-color: var(--popover); color: var(--popover-foreground); border-radius: calc(var(--radius) - 2px); border: 1px solid var(--border); box-shadow: var(--shadow-md);"
        >
          <div id="${this.__dateId}-calendar" role="dialog" aria-label="Calendar" style="padding: calc(var(--spacing) * 0.75); box-sizing: border-box; width: 100%; max-width: 100%; pointer-events: auto !important;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: calc(var(--spacing) * 0.75); gap: calc(var(--spacing) * 0.25);">
              <button type="button" id="${this.__dateId}-prev-month" aria-label="Previous" style="background: none; border: none; cursor: pointer; padding: calc(var(--spacing) * 0.5); display: flex; align-items: center; color: var(--foreground); pointer-events: auto; z-index: 10; position: relative; flex-shrink: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m15 18-6-6 6-6"></path>
                </svg>
              </button>
              <div id="${this.__dateId}-header-center" style="position: relative; z-index: 11; display: flex; flex: 1; align-items: center; justify-content: center; gap: calc(var(--spacing) * 0.15); min-width: 0; font-weight: 500; font-size: var(--text-sm); user-select: none; -webkit-user-select: none;">
                <button type="button" id="${this.__dateId}-month-label" aria-label="Choose month" style="${BsDateField.__headerPickBtnStyle}">
                </button>
                <button type="button" id="${this.__dateId}-year-label" aria-label="Choose year" style="${BsDateField.__headerPickBtnStyle}">
                </button>
                <span id="${this.__dateId}-year-range-label" style="display: none; font-weight: 500; font-size: var(--text-sm); color: var(--muted-foreground); pointer-events: none;"></span>
              </div>
              <button type="button" id="${this.__dateId}-next-month" aria-label="Next" style="background: none; border: none; cursor: pointer; padding: calc(var(--spacing) * 0.5); display: flex; align-items: center; color: var(--foreground); pointer-events: auto; z-index: 10; position: relative; flex-shrink: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </button>
            </div>
            <div id="${this.__dateId}-weekdays-row" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: calc(var(--spacing) * 0.15); margin-bottom: calc(var(--spacing) * 0.4);">
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Sun</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Mon</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Tue</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Wed</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Thu</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Fri</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Sat</div>
            </div>
            <div id="${this.__dateId}-days" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: calc(var(--spacing) * 0.15);"></div>
            <div id="${this.__dateId}-months-panel" style="display: none; grid-template-columns: repeat(3, 1fr); gap: calc(var(--spacing) * 0.35); margin-top: calc(var(--spacing) * 0.25);"></div>
            <div id="${this.__dateId}-years-panel" style="display: none; grid-template-columns: repeat(3, 1fr); gap: calc(var(--spacing) * 0.35); margin-top: calc(var(--spacing) * 0.25);"></div>
          </div>
        </div>
        <input type="hidden" name="${this.__dateId}-value" value="" />
      </div>
    `);
        this._add(this.__html, { edge: 0 });
        this.addListener("changeEnabled", (e) => {
            this.__applyEnabled(!!e.getData());
        });
        this.addListener("dispose", () => {
            this.__destructCleanup();
        });
        this.__html.addListenerOnce("appear", () => {
            const widgetElement = this.getContentElement();
            if (widgetElement) {
                widgetElement.setStyle("overflow", "visible");
                widgetElement.setStyle("z-index", "1");
                const domElement = widgetElement.getDomElement();
                if (domElement) {
                    domElement.style.overflow = "visible";
                    domElement.addEventListener("focusin", (e) => {
                        const input = this.__inputElement;
                        if (input && e.target === domElement) {
                            input.focus();
                        }
                    });
                }
            }
            this.__pinCompactFieldWidth();
            qx.event.Timer.once(() => this.__pinCompactFieldWidth(), this, 0);
            this.__setupDatePickerEvents();
            this.__renderCalendar();
            this.__applyEnabled(this.getEnabled());
            if (this.__value) {
                this.__applyValueToDom(this.__value);
            }
        });
    }
    /** Qooxdoo’s outer DOM stays full row width unless pinned; Basecoat `.input` is width:100% of that. */
    __pinCompactFieldWidth() {
        var _a, _b;
        const m = BsDateField.__fieldMaxWidthPx;
        const pin = (el) => {
            if (!el)
                return;
            el.style.setProperty("width", `min(100%, ${m}px)`, "important");
            el.style.setProperty("max-width", `min(${m}px, calc(100vw - 1.5rem))`, "important");
            el.style.setProperty("min-width", "0", "important");
            el.style.setProperty("box-sizing", "border-box", "important");
        };
        pin((_a = this.getContentElement()) === null || _a === void 0 ? void 0 : _a.getDomElement());
        pin((_b = this.__html.getContentElement()) === null || _b === void 0 ? void 0 : _b.getDomElement());
        const slot = this.__getContainerElement();
        pin(slot);
        if (slot) {
            pin(slot.querySelector(".bs-datefield-root"));
        }
    }
    static __pad2(n) {
        const s = String(n);
        return s.length < 2 ? "0" + s : s;
    }
    __destructCleanup() {
        this.__closeCalendar();
        if (this.__popoverContainer && this.__popoverContainer.parentNode) {
            this.__popoverContainer.parentNode.removeChild(this.__popoverContainer);
            this.__popoverContainer = null;
        }
    }
    __getViewportWidth() {
        return (window.innerWidth ||
            document.documentElement.clientWidth ||
            1200);
    }
    __setupDatePickerEvents() {
        const container = this.__getContainerElement();
        if (!container)
            return;
        this.__inputElement = container.querySelector(`#${this.__dateId}-trigger`);
        this.__iconButton = container.querySelector(`#${this.__dateId}-icon-btn`);
        this.__popoverElement = container.querySelector(`#${this.__dateId}-popover`);
        this.__calendarElement = container.querySelector(`#${this.__dateId}-calendar`);
        if (!this.__inputElement ||
            !this.__popoverElement ||
            !this.__calendarElement) {
            return;
        }
        const widgetElement = this.getContentElement();
        if (widgetElement) {
            const domElement = widgetElement.getDomElement();
            if (domElement) {
                domElement.setAttribute("tabindex", "-1");
            }
        }
        const wrapperDiv = container.querySelector("div");
        if (wrapperDiv) {
            wrapperDiv.setAttribute("tabindex", "-1");
        }
        this.__inputElement.removeAttribute("tabindex");
        this.__inputElement.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
                e.stopPropagation();
            }
        });
        this.__inputElement.addEventListener("input", (e) => {
            const target = e.target;
            if (!target)
                return;
            this.__formatDateInput(target);
            this.__handleDateInput(target.value);
        });
        this.__inputElement.addEventListener("keypress", (e) => {
            const char = String.fromCharCode(e.which || e.keyCode);
            if (!/[0-9/]/.test(char) &&
                !/[0-8]/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Delete" &&
                e.key !== "Tab" &&
                e.key !== "ArrowLeft" &&
                e.key !== "ArrowRight" &&
                e.key !== "ArrowUp" &&
                e.key !== "ArrowDown" &&
                !e.ctrlKey &&
                !e.metaKey) {
                e.preventDefault();
            }
        });
        this.__inputElement.addEventListener("paste", (e) => {
            e.preventDefault();
            const pastedText = e.clipboardData
                ? e.clipboardData.getData("text")
                : "";
            const cleaned = pastedText.replace(/[^\d/]/g, "");
            const formatted = this.__formatDateString(cleaned);
            if (this.__inputElement) {
                this.__inputElement.value = formatted;
                this.__handleDateInput(formatted);
            }
        });
        if (this.__iconButton) {
            this.__iconButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.getEnabled()) {
                    this.__toggleCalendar();
                }
            }, true);
        }
        const prevBtn = container.querySelector(`#${this.__dateId}-prev-month`);
        const nextBtn = container.querySelector(`#${this.__dateId}-next-month`);
        if (prevBtn) {
            prevBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.__calendarNav(-1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.__calendarNav(1);
            });
        }
        this.__clickHandler = (e) => {
            var _a, _b;
            if (!this.__isOpen)
                return;
            const target = e.target;
            if (!target)
                return;
            const prevBtn = (_a = this.__popoverElement) === null || _a === void 0 ? void 0 : _a.querySelector(`#${this.__dateId}-prev-month`);
            const nextBtn = (_b = this.__popoverElement) === null || _b === void 0 ? void 0 : _b.querySelector(`#${this.__dateId}-next-month`);
            if ((prevBtn && (prevBtn === target || prevBtn.contains(target))) ||
                (nextBtn && (nextBtn === target || nextBtn.contains(target)))) {
                return;
            }
            const t = target instanceof Node ? target : null;
            const isInPopover = t &&
                this.__popoverElement &&
                this.__popoverElement.contains(t);
            const isInCalendar = t &&
                this.__calendarElement &&
                this.__calendarElement.contains(t);
            const isInInput = t && this.__inputElement && this.__inputElement.contains(t);
            const isInIcon = t && this.__iconButton && this.__iconButton.contains(t);
            if (!isInPopover && !isInCalendar && !isInInput && !isInIcon) {
                this.__closeCalendar();
            }
        };
    }
    __getContainerElement() {
        const ce = this.__html.getContentElement();
        if (ce) {
            return ce.getDomElement();
        }
        return null;
    }
    __updatePopoverPosition() {
        if (!this.__isOpen || !this.__inputElement || !this.__popoverElement) {
            return;
        }
        const buttonRect = this.__inputElement.getBoundingClientRect();
        const viewportWidth = this.__getViewportWidth();
        const minLeft = this.__mobileSidePadding;
        const maxByViewport = Math.max(200, viewportWidth - this.__mobileSidePadding * 2);
        const width = Math.min(BsDateField.__popoverPreferredWidth, maxByViewport);
        const leftPx = Math.max(minLeft, Math.min(buttonRect.left, viewportWidth - width - this.__mobileSidePadding));
        const top = buttonRect.bottom + window.scrollY + 2;
        const left = leftPx + window.scrollX;
        this.__popoverElement.style.setProperty("top", `${top}px`, "important");
        this.__popoverElement.style.setProperty("left", `${left}px`, "important");
        this.__popoverElement.style.setProperty("width", `${width}px`, "important");
        const calendarElement = this.__popoverElement.querySelector(`#${this.__dateId}-calendar`);
        if (calendarElement) {
            calendarElement.style.setProperty("width", `${width}px`, "important");
            calendarElement.style.setProperty("max-width", `${width}px`, "important");
            calendarElement.style.setProperty("min-width", `${width}px`, "important");
        }
    }
    __toggleCalendar() {
        if (this.__isOpen) {
            this.__closeCalendar();
        }
        else {
            this.__openCalendar();
        }
    }
    __openCalendar() {
        if (!this.__popoverElement || !this.__inputElement)
            return;
        if (typeof this.__popoverElement.querySelector !== "function")
            return;
        this.__isOpen = true;
        if (!this.__popoverContainer) {
            this.__popoverContainer = document.createElement("div");
            this.__popoverContainer.className = "datefield-popover-container";
            this.__popoverContainer.setAttribute("data-basecoat-ignore", "true");
            this.__popoverContainer.style.position = "fixed";
            this.__popoverContainer.style.pointerEvents = "none";
            this.__popoverContainer.style.zIndex = "10000";
            this.__popoverContainer.style.top = "0";
            this.__popoverContainer.style.left = "0";
            document.body.appendChild(this.__popoverContainer);
        }
        if (this.__popoverElement.parentNode !== this.__popoverContainer) {
            this.__popoverContainer.appendChild(this.__popoverElement);
        }
        this.__popoverElement.style.pointerEvents = "auto";
        this.__calendarElement = this.__popoverElement.querySelector(`#${this.__dateId}-calendar`);
        if (this.__calendarElement) {
            if (this.__calendarClickHandler) {
                this.__calendarElement.removeEventListener("click", this.__calendarClickHandler, true);
            }
            if (this.__calendarMouseDownHandler) {
                this.__calendarElement.removeEventListener("mousedown", this.__calendarMouseDownHandler, true);
            }
            this.__calendarMouseDownHandler = (e) => {
                let target = e.target;
                while (target && target !== this.__calendarElement) {
                    const id = target.id;
                    if (id === `${this.__dateId}-month-label` ||
                        id === `${this.__dateId}-year-label`) {
                        e.preventDefault();
                        return;
                    }
                    target = target.parentElement;
                }
            };
            this.__calendarClickHandler = (e) => {
                let target = e.target;
                while (target && target !== this.__calendarElement) {
                    if (target.id === `${this.__dateId}-prev-month`) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        this.__calendarNav(-1);
                        return;
                    }
                    if (target.id === `${this.__dateId}-next-month`) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        this.__calendarNav(1);
                        return;
                    }
                    if (target.id === `${this.__dateId}-month-label`) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        if (!this.getEnabled())
                            return;
                        this.__calendarView = "months";
                        this.__renderCalendar();
                        return;
                    }
                    if (target.id === `${this.__dateId}-year-label`) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        if (!this.getEnabled())
                            return;
                        this.__yearPageStart =
                            Math.floor(this.__currentYear / 12) * 12;
                        this.__yearPageStart = Math.max(1889, Math.min(this.__yearPageStart, 2089));
                        this.__calendarView = "years";
                        this.__renderCalendar();
                        return;
                    }
                    target = target.parentElement;
                }
            };
            this.__calendarElement.addEventListener("mousedown", this.__calendarMouseDownHandler, true);
            this.__calendarElement.addEventListener("click", this.__calendarClickHandler, true);
        }
        this.__popoverElement.removeAttribute("aria-hidden");
        this.__popoverElement.style.position = "fixed";
        this.__popoverElement.style.zIndex = "10001";
        this.__popoverElement.style.setProperty("transition", "none", "important");
        this.__popoverElement.style.setProperty("transform", "none", "important");
        this.__popoverElement.style.setProperty("scale", "1", "important");
        this.__popoverElement.style.setProperty("opacity", "1", "important");
        this.__popoverElement.style.setProperty("display", "none", "important");
        this.__updatePopoverPosition();
        this.__popoverElement.style.setProperty("display", "block", "important");
        this.__popoverElement.style.setProperty("visibility", "visible", "important");
        this.__inputElement.setAttribute("aria-expanded", "true");
        this.__updatePositionHandler = this.__updatePopoverPosition.bind(this);
        window.addEventListener("scroll", this.__updatePositionHandler, true);
        window.addEventListener("resize", this.__updatePositionHandler);
        if (this.__clickHandler) {
            setTimeout(() => {
                document.addEventListener("click", this.__clickHandler, true);
            }, 0);
        }
        this.__renderCalendar();
    }
    __closeCalendar() {
        if (!this.__popoverElement || !this.__inputElement)
            return;
        this.__isOpen = false;
        this.__calendarView = "days";
        if (this.__updatePositionHandler) {
            window.removeEventListener("scroll", this.__updatePositionHandler, true);
            window.removeEventListener("resize", this.__updatePositionHandler);
            this.__updatePositionHandler = null;
        }
        if (this.__clickHandler) {
            document.removeEventListener("click", this.__clickHandler, true);
        }
        if (this.__calendarElement) {
            if (this.__calendarClickHandler) {
                this.__calendarElement.removeEventListener("click", this.__calendarClickHandler, true);
                this.__calendarClickHandler = null;
            }
            if (this.__calendarMouseDownHandler) {
                this.__calendarElement.removeEventListener("mousedown", this.__calendarMouseDownHandler, true);
                this.__calendarMouseDownHandler = null;
            }
        }
        this.__popoverElement.setAttribute("aria-hidden", "true");
        this.__popoverElement.style.setProperty("display", "none", "important");
        this.__popoverElement.style.setProperty("visibility", "hidden", "important");
        this.__inputElement.setAttribute("aria-expanded", "false");
        const container = this.__getContainerElement();
        if (container &&
            this.__popoverElement.parentNode === this.__popoverContainer) {
            container.appendChild(this.__popoverElement);
        }
    }
    __changeMonth(delta) {
        this.__currentMonth += delta;
        if (this.__currentMonth < 0) {
            this.__currentMonth = 11;
            this.__currentYear--;
        }
        else if (this.__currentMonth > 11) {
            this.__currentMonth = 0;
            this.__currentYear++;
        }
        this.__renderCalendar();
    }
    __calendarNav(delta) {
        if (this.__calendarView === "days") {
            this.__changeMonth(delta);
        }
        else if (this.__calendarView === "months") {
            this.__currentYear += delta;
            this.__renderCalendar();
        }
        else {
            this.__yearPageStart += delta * 12;
            this.__yearPageStart = Math.max(1889, Math.min(this.__yearPageStart, 2089));
            this.__renderCalendar();
        }
    }
    __renderCalendar() {
        let searchRoot = null;
        if (this.__popoverElement) {
            searchRoot = this.__popoverElement;
        }
        else {
            searchRoot = this.__getContainerElement();
        }
        if (!searchRoot)
            return;
        const daysContainer = searchRoot.querySelector(`#${this.__dateId}-days`);
        const weekdaysRow = searchRoot.querySelector(`#${this.__dateId}-weekdays-row`);
        const monthsPanel = searchRoot.querySelector(`#${this.__dateId}-months-panel`);
        const yearsPanel = searchRoot.querySelector(`#${this.__dateId}-years-panel`);
        const monthBtn = searchRoot.querySelector(`#${this.__dateId}-month-label`);
        const yearBtn = searchRoot.querySelector(`#${this.__dateId}-year-label`);
        const yearRangeLabel = searchRoot.querySelector(`#${this.__dateId}-year-range-label`);
        const prevNav = searchRoot.querySelector(`#${this.__dateId}-prev-month`);
        const nextNav = searchRoot.querySelector(`#${this.__dateId}-next-month`);
        if (!daysContainer ||
            !weekdaysRow ||
            !monthsPanel ||
            !yearsPanel ||
            !monthBtn ||
            !yearBtn ||
            !yearRangeLabel) {
            return;
        }
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        const shortMonthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];
        if (this.__calendarView === "days") {
            if (prevNav)
                prevNav.setAttribute("aria-label", "Previous month");
            if (nextNav)
                nextNav.setAttribute("aria-label", "Next month");
            monthBtn.style.display = "";
            yearBtn.style.display = "";
            yearRangeLabel.style.display = "none";
            weekdaysRow.style.display = "grid";
            daysContainer.style.display = "grid";
            monthsPanel.style.display = "none";
            yearsPanel.style.display = "none";
            monthBtn.textContent = monthNames[this.__currentMonth];
            yearBtn.textContent = String(this.__currentYear);
            daysContainer.innerHTML = "";
            const firstDay = new Date(this.__currentYear, this.__currentMonth, 1).getDay();
            const daysInMonth = new Date(this.__currentYear, this.__currentMonth + 1, 0).getDate();
            const today = new Date();
            const selectedDate = this.__selectedDate;
            for (let i = 0; i < firstDay; i++) {
                const cell = document.createElement("div");
                cell.style.padding = "calc(var(--spacing) * 0.25)";
                daysContainer.appendChild(cell);
            }
            for (let day = 1; day <= daysInMonth; day++) {
                const cell = document.createElement("button");
                cell.type = "button";
                cell.textContent = String(day);
                cell.style.cssText = `
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: calc(var(--radius) - 4px);
          font-size: var(--text-xs);
          transition: all 0.2s;
          padding: calc(var(--spacing) * 0.25);
          min-width: 0;
        `;
                const cellDate = new Date(this.__currentYear, this.__currentMonth, day);
                const isToday = cellDate.toDateString() === today.toDateString();
                const isSelected = selectedDate &&
                    cellDate.toDateString() === selectedDate.toDateString();
                if (isSelected) {
                    cell.style.backgroundColor = "var(--primary)";
                    cell.style.color = "var(--primary-foreground)";
                }
                else if (isToday) {
                    cell.style.border = "1px solid var(--ring)";
                }
                cell.addEventListener("mouseenter", () => {
                    if (!isSelected) {
                        cell.style.backgroundColor = "var(--accent)";
                        cell.style.color = "var(--accent-foreground)";
                    }
                });
                cell.addEventListener("mouseleave", () => {
                    if (!isSelected) {
                        cell.style.backgroundColor = "transparent";
                        cell.style.color = "";
                        if (isToday) {
                            cell.style.border = "1px solid var(--ring)";
                        }
                        else {
                            cell.style.border = "none";
                        }
                    }
                });
                cell.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.__selectDate(cellDate);
                });
                daysContainer.appendChild(cell);
            }
            return;
        }
        if (this.__calendarView === "months") {
            if (prevNav)
                prevNav.setAttribute("aria-label", "Previous year");
            if (nextNav)
                nextNav.setAttribute("aria-label", "Next year");
            monthBtn.style.display = "none";
            yearBtn.style.display = "";
            yearRangeLabel.style.display = "none";
            weekdaysRow.style.display = "none";
            daysContainer.style.display = "none";
            monthsPanel.style.display = "grid";
            yearsPanel.style.display = "none";
            yearBtn.textContent = String(this.__currentYear);
            monthsPanel.innerHTML = "";
            for (let m = 0; m < 12; m++) {
                const cell = document.createElement("button");
                cell.type = "button";
                cell.textContent = shortMonthNames[m];
                cell.style.cssText = BsDateField.__gridPickBtnStyle;
                const isCurrent = m === this.__currentMonth;
                if (isCurrent) {
                    cell.style.backgroundColor = "var(--primary)";
                    cell.style.color = "var(--primary-foreground)";
                }
                cell.addEventListener("mouseenter", () => {
                    if (!isCurrent) {
                        cell.style.backgroundColor = "var(--accent)";
                        cell.style.color = "var(--accent-foreground)";
                    }
                });
                cell.addEventListener("mouseleave", () => {
                    if (!isCurrent) {
                        cell.style.backgroundColor = "transparent";
                        cell.style.color = "";
                    }
                });
                const monthIndex = m;
                cell.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.__currentMonth = monthIndex;
                    this.__calendarView = "days";
                    this.__renderCalendar();
                });
                monthsPanel.appendChild(cell);
            }
            return;
        }
        if (prevNav)
            prevNav.setAttribute("aria-label", "Previous years");
        if (nextNav)
            nextNav.setAttribute("aria-label", "Next years");
        monthBtn.style.display = "none";
        yearBtn.style.display = "none";
        yearRangeLabel.style.display = "";
        weekdaysRow.style.display = "none";
        daysContainer.style.display = "none";
        monthsPanel.style.display = "none";
        yearsPanel.style.display = "grid";
        const yStart = this.__yearPageStart;
        yearRangeLabel.textContent = `${yStart} – ${yStart + 11}`;
        yearsPanel.innerHTML = "";
        for (let i = 0; i < 12; i++) {
            const y = yStart + i;
            const cell = document.createElement("button");
            cell.type = "button";
            cell.textContent = String(y);
            cell.style.cssText = BsDateField.__gridPickBtnStyle;
            const inRange = y >= 1900 && y <= 2100;
            const isCurrent = y === this.__currentYear;
            if (!inRange) {
                cell.disabled = true;
                cell.style.opacity = "0.35";
                cell.style.cursor = "default";
            }
            else if (isCurrent) {
                cell.style.backgroundColor = "var(--primary)";
                cell.style.color = "var(--primary-foreground)";
            }
            cell.addEventListener("mouseenter", () => {
                if (!inRange || isCurrent)
                    return;
                cell.style.backgroundColor = "var(--accent)";
                cell.style.color = "var(--accent-foreground)";
            });
            cell.addEventListener("mouseleave", () => {
                if (!inRange || isCurrent)
                    return;
                cell.style.backgroundColor = "transparent";
                cell.style.color = "";
            });
            cell.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!inRange)
                    return;
                this.__currentYear = y;
                this.__calendarView = "days";
                this.__renderCalendar();
            });
            yearsPanel.appendChild(cell);
        }
    }
    __selectDate(date) {
        this.__selectedDate = date;
        this.setValue(date);
        this.__updateDisplay();
        this.__closeCalendar();
    }
    __updateDisplay() {
        if (!this.__inputElement)
            return;
        if (this.__selectedDate) {
            const month = BsDateField.__pad2(this.__selectedDate.getMonth() + 1);
            const day = BsDateField.__pad2(this.__selectedDate.getDate());
            const year = this.__selectedDate.getFullYear();
            this.__inputElement.value = `${month}/${day}/${year}`;
        }
        else {
            this.__inputElement.value = "";
        }
    }
    __handleDateInput(value) {
        if (!value || value.trim() === "") {
            this.__selectedDate = null;
            this.setValue(null);
            return;
        }
        const date = this.__parseDateInput(value);
        if (date && !isNaN(date.getTime())) {
            this.__selectedDate = date;
            this.setValue(date);
            this.__currentMonth = date.getMonth();
            this.__currentYear = date.getFullYear();
            if (this.__isOpen) {
                this.__renderCalendar();
            }
        }
    }
    __formatDateString(digits) {
        let formatted = "";
        if (digits.length > 0) {
            formatted = digits.substring(0, 2);
        }
        if (digits.length > 2) {
            formatted += "/" + digits.substring(2, 4);
        }
        if (digits.length > 4) {
            formatted += "/" + digits.substring(4, 8);
        }
        return formatted;
    }
    __formatDateInput(input) {
        var _a;
        const value = input.value;
        const cursorPos = (_a = input.selectionStart) !== null && _a !== void 0 ? _a : input.value.length;
        let digits = value.replace(/[^\d]/g, "");
        if (digits.length > 8) {
            digits = digits.substring(0, 8);
        }
        const formatted = this.__formatDateString(digits);
        if (digits.length >= 2) {
            const month = parseInt(digits.substring(0, 2), 10);
            if (month > 12) {
                digits = digits.substring(0, 1);
                const newFormatted = this.__formatDateString(digits);
                input.value = newFormatted;
                setTimeout(() => {
                    input.setSelectionRange(newFormatted.length, newFormatted.length);
                }, 0);
                return;
            }
        }
        if (digits.length >= 4) {
            const day = parseInt(digits.substring(2, 4), 10);
            if (day > 31) {
                digits = digits.substring(0, 3);
                const newFormatted = this.__formatDateString(digits);
                input.value = newFormatted;
                setTimeout(() => {
                    input.setSelectionRange(newFormatted.length, newFormatted.length);
                }, 0);
                return;
            }
        }
        if (input.value !== formatted) {
            input.value = formatted;
            let newCursorPos = cursorPos;
            const oldLength = value.length;
            const newLength = formatted.length;
            if (newLength > oldLength) {
                newCursorPos = cursorPos + (newLength - oldLength);
            }
            else if (newLength < oldLength) {
                newCursorPos = Math.max(0, cursorPos - (oldLength - newLength));
            }
            newCursorPos = Math.min(newCursorPos, formatted.length);
            setTimeout(() => {
                input.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
        }
    }
    __parseDateInput(value) {
        if (!value)
            return null;
        const cleaned = value.replace(/[^\d/]/g, "");
        const parts = cleaned.split("/");
        if (parts.length !== 3)
            return null;
        const month = parseInt(parts[0], 10);
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (isNaN(month) || month < 1 || month > 12)
            return null;
        if (isNaN(day) || day < 1 || day > 31)
            return null;
        if (isNaN(year) || year < 1900 || year > 2100)
            return null;
        const date = new Date(year, month - 1, day);
        if (date.getMonth() !== month - 1 ||
            date.getDate() !== day ||
            date.getFullYear() !== year) {
            return null;
        }
        return date;
    }
    __applyValueToDom(value) {
        if (value && value instanceof Date) {
            this.__selectedDate = value;
            this.__currentMonth = value.getMonth();
            this.__currentYear = value.getFullYear();
            this.__updateDisplay();
            if (this.__isOpen) {
                this.__renderCalendar();
            }
        }
        else {
            this.__selectedDate = null;
            this.__updateDisplay();
        }
    }
    __applyEnabled(enabled) {
        if (this.__inputElement) {
            this.__inputElement.disabled = !enabled;
        }
        if (this.__iconButton) {
            this.__iconButton.disabled = !enabled;
            this.__iconButton.style.pointerEvents = enabled ? "auto" : "none";
            this.__iconButton.style.opacity = enabled ? "1" : "0.5";
        }
        const container = this.__getContainerElement();
        if (container) {
            const monthPick = container.querySelector(`#${this.__dateId}-month-label`);
            const yearPick = container.querySelector(`#${this.__dateId}-year-label`);
            if (monthPick)
                monthPick.disabled = !enabled;
            if (yearPick)
                yearPick.disabled = !enabled;
        }
    }
    getValue() {
        return this.__value;
    }
    setValue(value) {
        const next = value && value instanceof Date && !isNaN(value.getTime()) ? value : null;
        const prevTime = this.__value ? this.__value.getTime() : null;
        const nextTime = next ? next.getTime() : null;
        if (prevTime === nextTime) {
            this.__applyValueToDom(next);
            return this;
        }
        const old = this.__value;
        this.__value = next;
        this.__applyValueToDom(next);
        this.fireDataEvent("changeValue", next, old);
        return this;
    }
    resetValue() {
        this.setValue(null);
    }
    focus() {
        if (this.__inputElement) {
            this.__inputElement.focus();
        }
    }
    blur() {
        if (this.__inputElement) {
            this.__inputElement.blur();
        }
        this.__closeCalendar();
    }
}
BsDateField.events = {
    changeValue: "qx.event.type.Data",
};
/** Calendar popover width; day grid stays compact (not stretched to full input width). */
BsDateField.__popoverPreferredWidth = 280;
/** Input caps at the same width as the popover so the field does not look oversized. */
BsDateField.__fieldMaxWidthPx = BsDateField.__popoverPreferredWidth;
BsDateField.__headerPickBtnStyle = "background: none; border: none; cursor: pointer; padding: calc(var(--spacing) * 0.25) calc(var(--spacing) * 0.35); border-radius: calc(var(--radius) - 4px); color: inherit; font: inherit; font-weight: 500; user-select: none; -webkit-user-select: none;";
BsDateField.__gridPickBtnStyle = "display: flex; align-items: center; justify-content: center; border: none; background: transparent; cursor: pointer; border-radius: calc(var(--radius) - 4px); font-size: var(--text-xs); padding: calc(var(--spacing) * 0.4); min-width: 0; transition: background-color 0.15s, color 0.15s;";
/**
 * Basecoat-style dialog using native &lt;dialog&gt;. Instance-based (vs BsAlertDialog singleton).
 */
class BsDialog extends qx.ui.core.Widget {
    constructor(title = "", description = "") {
        super();
        this.__boundDialogEl = null;
        this.__pendingSectionContent = null;
        this.__closeIcon = null;
        this.__titleText = "";
        this.__descriptionText = "";
        this.__cancelLabel = "Cancel";
        this.__saveLabel = "Save changes";
        this.__saveIntent = "primary";
        this.__size = "md";
        this.__dialogMaxWidth = "425px";
        this.__dialogMaxHeight = "612px";
        this.__richSectionContent = false;
        this._setLayout(new qx.ui.layout.Canvas());
        this.__titleText = title;
        this.__descriptionText = description;
        this.__dialogId = "dialog-" + this.toHashCode();
        this.__titleId = this.__dialogId + "-title";
        this.__descriptionId = this.__dialogId + "-description";
        const titleEsc = this.__escapeHtml(title || "");
        const descEsc = this.__escapeHtml(description || "");
        this.__html = new qx.ui.embed.Html(`
      <dialog id="${this.__dialogId}" class="dialog" aria-labelledby="${this.__titleId}" aria-describedby="${this.__descriptionId}" style="margin: 0; max-width: 425px; max-height: 612px;">
        <div>
          <header>
            <h2 id="${this.__titleId}">${titleEsc}</h2>
            <p id="${this.__descriptionId}">${descEsc}</p>
          </header>
          <section>
            <div class="dialog-section-content"></div>
          </section>
          <footer>
            <button type="button" class="btn-outline dialog-cancel-btn">Cancel</button>
            <button type="button" class="btn dialog-save-btn">Save changes</button>
          </footer>
          <button type="button" class="dialog-close-btn" aria-label="Close dialog" style="position: absolute; top: 0; right: 0; margin: 0.5rem; padding: 0.25rem; background: transparent; border: none; cursor: pointer; color: inherit;">
            <span class="dialog-close-icon-host" style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;"></span>
          </button>
        </div>
      </dialog>
    `);
        this._add(this.__html, { edge: 0 });
        this.__html.addListenerOnce("appear", () => {
            this.__wireCloseIcon();
            this.__applyTitle(this.__titleText);
            this.__applyDescription(this.__descriptionText);
            this.__applyCancelLabel(this.__cancelLabel);
            this.__applySaveLabel(this.__saveLabel);
            this.__applySaveIntent(this.__saveIntent);
            this.__applyDialogSizing();
            this.__attachListeners();
        });
    }
    __wireCloseIcon() {
        const dialog = this.__getDialogElement();
        if (!dialog)
            return;
        const host = dialog.querySelector(".dialog-close-icon-host");
        if (!host)
            return;
        const icon = new InlineSvgIcon("x", 24);
        this.__closeIcon = icon;
        const sync = () => {
            host.innerHTML = icon.getHtml() || "";
        };
        sync();
        icon.addListener("changeHtml", sync, this);
    }
    __escapeHtml(text) {
        if (!text)
            return "";
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
    __getDialogElement() {
        var _a;
        const root = (_a = this.__html.getContentElement()) === null || _a === void 0 ? void 0 : _a.getDomElement();
        if (!root)
            return null;
        if (root.tagName && root.tagName.toLowerCase() === "dialog") {
            return root;
        }
        const nested = root.querySelector("dialog");
        if (nested)
            return nested;
        const first = root.firstElementChild;
        if (first && first.tagName.toLowerCase() === "dialog") {
            return first;
        }
        return null;
    }
    __getSectionContentElement() {
        const dialog = this.__getDialogElement();
        if (!dialog)
            return null;
        return dialog.querySelector(".dialog-section-content");
    }
    __attachListeners() {
        const dialog = this.__getDialogElement();
        if (!dialog || this.__boundDialogEl === dialog)
            return;
        dialog.addEventListener("click", (e) => {
            if (e.target === dialog) {
                dialog.close();
                this.fireEvent("cancel");
            }
        });
        const closeBtn = dialog.querySelector(".dialog-close-btn");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                dialog.close();
                this.fireEvent("cancel");
            });
        }
        const cancelBtn = dialog.querySelector(".dialog-cancel-btn");
        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                dialog.close();
                this.fireEvent("cancel");
            });
        }
        const saveBtn = dialog.querySelector(".dialog-save-btn");
        if (saveBtn) {
            saveBtn.addEventListener("click", () => {
                this.fireEvent("save");
                dialog.close();
            });
        }
        this.__boundDialogEl = dialog;
    }
    __applyTitle(value) {
        const dialog = this.__getDialogElement();
        if (!dialog)
            return;
        const h2 = dialog.querySelector("#" + this.__titleId);
        if (h2)
            h2.textContent = value || "";
    }
    __applyDescription(value) {
        const dialog = this.__getDialogElement();
        if (!dialog)
            return;
        const p = dialog.querySelector("#" + this.__descriptionId);
        if (p)
            p.textContent = value || "";
    }
    __applyCancelLabel(value) {
        const dialog = this.__getDialogElement();
        if (!dialog)
            return;
        const btn = dialog.querySelector(".dialog-cancel-btn");
        if (btn)
            btn.textContent = value || "Cancel";
    }
    __applySaveLabel(value) {
        const dialog = this.__getDialogElement();
        if (!dialog)
            return;
        const btn = dialog.querySelector(".dialog-save-btn");
        if (btn)
            btn.textContent = value || "Save changes";
    }
    __applySaveIntent(value) {
        const dialog = this.__getDialogElement();
        if (!dialog)
            return;
        const btn = dialog.querySelector(".dialog-save-btn");
        if (!btn)
            return;
        if (value === "destructive") {
            btn.style.background = "var(--destructive)";
            btn.style.color = "var(--destructive-foreground)";
            btn.style.borderColor = "var(--destructive)";
        }
        else {
            btn.style.background = "";
            btn.style.color = "";
            btn.style.borderColor = "";
        }
    }
    __applyDialogSizing() {
        const dialog = this.__getDialogElement();
        if (!dialog)
            return;
        const size = this.__size;
        const widthBySize = {
            sm: "360px",
            md: "425px",
            lg: "720px",
            xl: "980px",
            full: "1200px",
        };
        const heightBySize = {
            sm: "520px",
            md: "612px",
            lg: "760px",
            xl: "85vh",
            full: "92vh",
        };
        const maxWidth = this.__dialogMaxWidth;
        const maxHeight = this.__dialogMaxHeight;
        const hasCustomMaxWidth = maxWidth && maxWidth !== "425px";
        const hasCustomMaxHeight = maxHeight && maxHeight !== "612px";
        const useCustomSizing = size === "custom" || hasCustomMaxWidth || hasCustomMaxHeight;
        const targetWidth = useCustomSizing
            ? maxWidth || "425px"
            : widthBySize[size] || widthBySize.md;
        const targetHeight = useCustomSizing
            ? maxHeight || "612px"
            : heightBySize[size] || heightBySize.md;
        const panel = dialog.firstElementChild;
        if (!(panel === null || panel === void 0 ? void 0 : panel.style))
            return;
        const widthExpr = `min(${targetWidth}, calc(100vw - 2rem))`;
        const heightExpr = `min(${targetHeight}, calc(100vh - 2rem))`;
        panel.style.setProperty("width", widthExpr, "important");
        panel.style.setProperty("max-width", widthExpr, "important");
        panel.style.setProperty("max-height", heightExpr, "important");
        panel.style.setProperty("overflow", "auto", "important");
        const footer = dialog.querySelector("footer");
        if (footer === null || footer === void 0 ? void 0 : footer.style) {
            footer.style.setProperty("display", "flex", "important");
            footer.style.setProperty("flex-wrap", "wrap", "important");
            footer.style.setProperty("gap", "0.5rem", "important");
        }
    }
    getTitle() {
        return this.__titleText;
    }
    setTitle(value) {
        this.__titleText = value !== null && value !== void 0 ? value : "";
        this.__applyTitle(this.__titleText);
        return this;
    }
    getDescription() {
        return this.__descriptionText;
    }
    setDescription(value) {
        this.__descriptionText = value !== null && value !== void 0 ? value : "";
        this.__applyDescription(this.__descriptionText);
        return this;
    }
    getCancelLabel() {
        return this.__cancelLabel;
    }
    setCancelLabel(value) {
        this.__cancelLabel = value !== null && value !== void 0 ? value : "Cancel";
        this.__applyCancelLabel(this.__cancelLabel);
        return this;
    }
    getSaveLabel() {
        return this.__saveLabel;
    }
    setSaveLabel(value) {
        this.__saveLabel = value !== null && value !== void 0 ? value : "Save changes";
        this.__applySaveLabel(this.__saveLabel);
        return this;
    }
    getSaveIntent() {
        return this.__saveIntent;
    }
    setSaveIntent(value) {
        this.__saveIntent = value;
        this.__applySaveIntent(this.__saveIntent);
        return this;
    }
    getSize() {
        return this.__size;
    }
    setSize(value) {
        this.__size = value;
        this.__applyDialogSizing();
        return this;
    }
    getDialogMaxWidth() {
        return this.__dialogMaxWidth;
    }
    setDialogMaxWidth(value) {
        this.__dialogMaxWidth = value !== null && value !== void 0 ? value : "425px";
        this.__applyDialogSizing();
        return this;
    }
    getDialogMaxHeight() {
        return this.__dialogMaxHeight;
    }
    setDialogMaxHeight(value) {
        this.__dialogMaxHeight = value !== null && value !== void 0 ? value : "612px";
        this.__applyDialogSizing();
        return this;
    }
    getRichSectionContent() {
        return this.__richSectionContent;
    }
    setRichSectionContent(value) {
        this.__richSectionContent = !!value;
        return this;
    }
    show() {
        const tryShow = (retriesLeft = 10) => {
            const dialog = this.__getDialogElement();
            if (!dialog) {
                if (retriesLeft > 0) {
                    qx.event.Timer.once(() => tryShow(retriesLeft - 1), this, 25);
                }
                return;
            }
            this.__applyTitle(this.__titleText);
            this.__applyDescription(this.__descriptionText);
            this.__applyCancelLabel(this.__cancelLabel);
            this.__applySaveLabel(this.__saveLabel);
            this.__applySaveIntent(this.__saveIntent);
            this.__applyDialogSizing();
            this.__attachListeners();
            if (this.__pendingSectionContent != null) {
                this.setSectionContent(this.__pendingSectionContent);
            }
            if (typeof dialog.showModal === "function" && !dialog.open) {
                dialog.showModal();
            }
            this.__applyDialogSizing();
            qx.event.Timer.once(() => this.__applyDialogSizing(), this, 60);
        };
        tryShow();
    }
    close() {
        const dialog = this.__getDialogElement();
        if (dialog && typeof dialog.close === "function") {
            dialog.close();
        }
    }
    setSectionContent(html) {
        const el = this.__getSectionContentElement();
        if (el) {
            el.innerHTML = this.__richSectionContent
                ? html || ""
                : this.__escapeHtml(String(html || ""));
            this.__pendingSectionContent = null;
        }
        else {
            this.__pendingSectionContent = html != null ? String(html) : "";
        }
    }
    getSectionElement() {
        return this.__getSectionContentElement();
    }
    getDialogElement() {
        return this.__getDialogElement();
    }
    destruct() {
        if (this.__closeIcon) {
            this.__closeIcon.destroy();
            this.__closeIcon = null;
        }
        this.__boundDialogEl = null;
        this.__pendingSectionContent = null;
        super.destruct();
    }
}
BsDialog.events = {
    save: "qx.event.type.Event",
    cancel: "qx.event.type.Event",
};
/**
 * Standalone Basecoat-styled pagination (port of new_proj Pagination).
 */
class BsPagination extends qx.ui.core.Widget {
    constructor() {
        super();
        this.__paginationContainer = null;
        this.__paginationPages = null;
        this.__paginationPrev = null;
        this.__paginationNext = null;
        this.__paginationEllipsis = null;
        this.__paginationClickHandler = null;
        this.__currentPage = 1;
        this.__totalPages = 0;
        this._setLayout(new qx.ui.layout.Canvas());
        this.__paginationId = "pagination-" + this.toHashCode();
        this.__html = new qx.ui.embed.Html(`
      <nav role="navigation" aria-label="pagination" class="pagination-container mx-auto flex w-full justify-center" id="${this.__paginationId}" style="display: flex; flex-shrink: 0; padding: 16px 0; margin-top: 0; border-top: 1px solid var(--border); width: 100%; min-width: 0; overflow: visible;">
        <ul class="pagination-pages-list flex flex-row items-center gap-1" style="display: flex; flex-direction: row; flex-wrap: nowrap; list-style: none; margin: 0; padding: 0; gap: 4px; overflow: visible; align-items: center;">
          <li style="flex-shrink: 0;">
            <a href="#" class="btn-ghost pagination-prev" tabindex="0" style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; overflow: visible; width: auto; min-width: max-content; padding: 0 10px; height: 36px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="m15 18-6-6 6-6" /></svg>
              <span>Previous</span>
            </a>
          </li>
          <li class="pagination-pages" style="display: flex; flex-direction: row; flex-wrap: nowrap;"></li>
          <li>
            <div class="pagination-ellipsis size-9 flex items-center justify-center" style="display: none;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 shrink-0"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
            </div>
          </li>
          <li style="flex-shrink: 0;">
            <a href="#" class="btn-ghost pagination-next" tabindex="0" style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; overflow: visible; width: auto; min-width: max-content; padding: 0 10px; height: 36px;">
              <span>Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="m9 18 6-6-6-6" /></svg>
            </a>
          </li>
        </ul>
      </nav>
    `);
        this._add(this.__html, { edge: 0 });
        this.setMinWidth(380);
        this.addListener("dispose", () => {
            if (this.__paginationContainer && this.__paginationClickHandler) {
                this.__paginationContainer.removeEventListener("click", this.__paginationClickHandler);
                this.__paginationClickHandler = null;
            }
        });
        this.__html.addListenerOnce("appear", () => {
            const container = this.__html.getContentElement().getDomElement();
            this.__paginationContainer =
                container.querySelector("#" + this.__paginationId) || container;
            this.__paginationPages =
                this.__paginationContainer.querySelector(".pagination-pages");
            this.__paginationPrev =
                this.__paginationContainer.querySelector(".pagination-prev");
            this.__paginationNext =
                this.__paginationContainer.querySelector(".pagination-next");
            this.__paginationEllipsis =
                this.__paginationContainer.querySelector(".pagination-ellipsis");
            this.__updatePagination();
            this.__setupPaginationClickHandlers();
        });
    }
    getCurrentPage() {
        return this.__currentPage;
    }
    setCurrentPage(page) {
        const total = this.getTotalPages();
        let next = Math.floor(page);
        if (next < 1)
            next = 1;
        if (total > 0 && next > total)
            next = total;
        if (this.__currentPage === next)
            return this;
        this.__currentPage = next;
        this.__updatePagination();
        this.fireDataEvent("changePage", { page: next });
        return this;
    }
    getTotalPages() {
        return this.__totalPages;
    }
    setTotalPages(total) {
        const next = Math.max(0, Math.floor(total));
        if (this.__totalPages === next) {
            this.__updatePagination();
            return this;
        }
        this.__totalPages = next;
        if (this.__currentPage > next && next > 0) {
            this.__currentPage = next;
            this.fireDataEvent("changePage", { page: this.__currentPage });
        }
        else if (next === 0) {
            this.__currentPage = 1;
        }
        this.__updatePagination();
        return this;
    }
    __updatePagination() {
        if (!this.__paginationContainer)
            return;
        const totalPages = this.getTotalPages();
        const currentPage = this.getCurrentPage();
        if (this.__paginationPrev) {
            this.__paginationPrev.style.pointerEvents =
                currentPage <= 1 ? "none" : "";
            this.__paginationPrev.style.opacity = currentPage <= 1 ? "0.5" : "1";
        }
        if (this.__paginationNext) {
            this.__paginationNext.style.pointerEvents =
                currentPage >= totalPages || totalPages === 0 ? "none" : "";
            this.__paginationNext.style.opacity =
                currentPage >= totalPages || totalPages === 0 ? "0.5" : "1";
        }
        if (this.__paginationPages) {
            this.__paginationPages.innerHTML = this.__renderPageNumbers(currentPage, totalPages);
        }
        if (this.__paginationEllipsis) {
            const showEllipsis = totalPages > 7 && currentPage < totalPages - 2;
            this.__paginationEllipsis.style.display = showEllipsis ? "flex" : "none";
        }
        this.__setupPaginationClickHandlers();
    }
    __renderPageNumbers(currentPage, totalPages) {
        if (totalPages <= 0)
            return "";
        let pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }
        else if (currentPage <= 3) {
            pages = [1, 2, 3, 4, totalPages];
        }
        else if (currentPage >= totalPages - 2) {
            pages = [
                1,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }
        else {
            pages = [
                1,
                currentPage - 1,
                currentPage,
                currentPage + 1,
                totalPages,
            ];
        }
        let html = "";
        let lastPage = 0;
        pages.forEach((page, idx) => {
            if (idx > 0 && page - lastPage > 1) {
                html += `<li style="display: inline-block;"><div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;"><span>...</span></div></li>`;
            }
            const isActive = page === currentPage;
            const btnStyle = isActive
                ? "background-color: transparent; border: 1px solid var(--border); color: inherit;"
                : "background-color: transparent; border: none; color: inherit;";
            html += `
          <li style="display: inline-block;">
            <a href="#" class="pagination-page-btn ${isActive ? "btn-icon-outline" : "btn-icon-ghost"}" data-page="${page}" tabindex="0" style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; ${btnStyle} text-decoration: none; border-radius: var(--radius); cursor: pointer;">
              ${page}
            </a>
          </li>
        `;
            lastPage = page;
        });
        return html;
    }
    __setupPaginationClickHandlers() {
        if (!this.__paginationContainer)
            return;
        if (this.__paginationClickHandler) {
            this.__paginationContainer.removeEventListener("click", this.__paginationClickHandler);
        }
        this.__paginationClickHandler = (e) => {
            e.preventDefault();
            const target = e.target;
            if (target.closest(".pagination-prev")) {
                if (this.getCurrentPage() > 1) {
                    this.setCurrentPage(this.getCurrentPage() - 1);
                }
                return;
            }
            if (target.closest(".pagination-next")) {
                if (this.getCurrentPage() < this.getTotalPages()) {
                    this.setCurrentPage(this.getCurrentPage() + 1);
                }
                return;
            }
            const pageBtn = target.closest(".pagination-page-btn");
            if (pageBtn) {
                const raw = pageBtn.getAttribute("data-page");
                const page = raw ? parseInt(raw, 10) : NaN;
                if (!isNaN(page)) {
                    this.setCurrentPage(page);
                }
            }
        };
        this.__paginationContainer.addEventListener("click", this.__paginationClickHandler);
    }
}
BsPagination.events = {
    changePage: "qx.event.type.Data",
};
/**
 * Basecoat-style radio + group. Native &lt;input type="radio"&gt; with shared group name.
 */
class BsRadioButton extends qx.ui.core.Widget {
    constructor(label = "") {
        super();
        this.__inputElement = null;
        this.__labelTextElement = null;
        this.__label = "";
        this.__value = "";
        this.__checked = false;
        this.__groupName = "radio-group";
        this._setLayout(new qx.ui.layout.HBox(8).set({ alignY: "middle" }));
        this.setAllowGrowX(true);
        this.setMinWidth(0);
        this.__html = new qx.ui.embed.Html(`
      <label class="label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0; padding: 4px 0; min-width: 120px;">
        <input type="radio" class="input" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary); flex-shrink: 0;">
        <span class="label-text" style="line-height: 1.2; white-space: nowrap; color: inherit; font-size: 14px; flex-shrink: 0; min-width: 80px;"></span>
      </label>
    `);
        this._add(this.__html);
        if (label) {
            this.setLabel(label);
        }
        this.addListener("changeEnabled", (e) => {
            this.__applyEnabled(!!e.getData());
        }, this);
        this.__html.addListenerOnce("appear", () => {
            this.__initDom();
        });
    }
    __initDom() {
        const dom = this.__html.getContentElement().getDomElement();
        if (!dom)
            return;
        this.__inputElement = dom.querySelector("input");
        this.__labelTextElement = dom.querySelector(".label-text");
        this.__applyLabel(this.__label);
        this.__applyValue(this.__value);
        this.__applyChecked(this.__checked);
        this.__applyGroupName(this.__groupName);
        this.__applyEnabled(this.getEnabled());
        if (this.__inputElement) {
            this.__inputElement.addEventListener("change", () => {
                if (this.__inputElement) {
                    this.setChecked(this.__inputElement.checked);
                }
            });
        }
        dom.addEventListener("click", () => {
            if (this.getEnabled()) {
                this.toggle();
            }
        });
    }
    toggle() {
        if (this.getEnabled() && !this.getChecked()) {
            this.setChecked(true);
        }
    }
    __applyLabel(label) {
        if (this.__labelTextElement) {
            this.__labelTextElement.textContent = label;
        }
    }
    __applyValue(value) {
        if (this.__inputElement) {
            this.__inputElement.value = value;
        }
    }
    __applyChecked(checked) {
        if (this.__inputElement) {
            this.__inputElement.checked = checked;
        }
    }
    __applyGroupName(groupName) {
        if (this.__inputElement) {
            this.__inputElement.name = groupName;
        }
    }
    __applyEnabled(enabled) {
        if (this.__inputElement) {
            this.__inputElement.disabled = !enabled;
        }
        const dom = this.__html.getContentElement().getDomElement();
        if (dom) {
            dom.style.cursor = enabled ? "pointer" : "not-allowed";
            dom.style.opacity = enabled ? "1" : "0.5";
        }
    }
    getLabel() {
        return this.__label;
    }
    setLabel(label) {
        this.__label = label !== null && label !== void 0 ? label : "";
        this.__applyLabel(this.__label);
        return this;
    }
    getValue() {
        return this.__value;
    }
    setValue(value) {
        this.__value = value !== null && value !== void 0 ? value : "";
        this.__applyValue(this.__value);
        return this;
    }
    getChecked() {
        return this.__checked;
    }
    setChecked(checked) {
        const next = !!checked;
        if (this.__checked === next) {
            this.__applyChecked(next);
            return this;
        }
        const old = this.__checked;
        this.__checked = next;
        this.__applyChecked(next);
        this.fireDataEvent("changeChecked", next, old);
        return this;
    }
    getGroupName() {
        return this.__groupName;
    }
    setGroupName(name) {
        this.__groupName = name !== null && name !== void 0 ? name : "radio-group";
        this.__applyGroupName(this.__groupName);
        return this;
    }
}
BsRadioButton.events = {
    changeChecked: "qx.event.type.Data",
};
class BsRadioButtonGroup extends qx.ui.core.Widget {
    constructor() {
        super();
        this.__radioButtons = [];
        this.__groupName = "radio-group";
        this.__value = null;
        this._setLayout(new qx.ui.layout.VBox(12).set({ alignX: "left" }));
    }
    add(radioButton) {
        radioButton.setGroupName(this.__groupName);
        radioButton.addListener("changeChecked", this.__onRadioButtonChange, this);
        this.__radioButtons.push(radioButton);
        this._add(radioButton, { flex: 1 });
    }
    __onRadioButtonChange(e) {
        const radioButton = e.getTarget();
        if (radioButton.getChecked()) {
            const oldValue = this.__value;
            this.setValue(radioButton.getValue());
            this.fireDataEvent("changeSelection", {
                value: radioButton.getValue(),
                oldValue: oldValue,
            });
        }
    }
    __applyGroupName(groupName) {
        this.__radioButtons.forEach((btn) => {
            btn.setGroupName(groupName);
        });
    }
    __applyValueToRadios(value) {
        this.__radioButtons.forEach((btn) => {
            if (btn.getValue() === value) {
                btn.setChecked(true);
            }
            else {
                btn.setChecked(false);
            }
        });
    }
    getGroupName() {
        return this.__groupName;
    }
    setGroupName(name) {
        this.__groupName = name !== null && name !== void 0 ? name : "radio-group";
        this.__applyGroupName(this.__groupName);
        return this;
    }
    getValue() {
        return this.__value;
    }
    setValue(value) {
        if (this.__value === value) {
            return this;
        }
        const oldValue = this.__value;
        this.__value = value;
        this.__applyValueToRadios(value);
        this.fireDataEvent("changeValue", value, oldValue);
        return this;
    }
    getRadioChildren() {
        return this.__radioButtons.slice();
    }
    clearSelection() {
        this.__radioButtons.forEach((btn) => {
            btn.setChecked(false);
        });
        this.setValue(null);
    }
}
BsRadioButtonGroup.events = {
    changeValue: "qx.event.type.Data",
    changeSelection: "qx.event.type.Data",
};
class BsTable extends qx.ui.core.Widget {
    constructor(caption = "") {
        super();
        this.__tableElement = null;
        this.__captionElement = null;
        this.__theadElement = null;
        this.__tbodyElement = null;
        this.__tfootElement = null;
        this.__headers = [];
        this.__allRows = [];
        this.__rows = [];
        this.__footerRows = [];
        this.__columnWidths = [];
        this.__isResizing = false;
        this.__resizeColumnIndex = null;
        this.__resizeStartX = null;
        this.__resizeStartWidth = null;
        this.__rowClickHandler = null;
        this.__paginationContainer = null;
        this.__paginationPages = null;
        this.__paginationPrev = null;
        this.__paginationNext = null;
        this.__paginationEllipsis = null;
        this.__paginationClickHandler = null;
        this.__currentPage = 1;
        this.__pageSize = 10;
        this.__totalRows = 0;
        this.__paginationEnabled = false;
        this.__caption = "";
        this._setLayout(new qx.ui.layout.Canvas());
        this.__initialCaption = caption;
        this.__tableId = `table-${this.toHashCode()}`;
        this.__html = new qx.ui.embed.Html(`
      <div class="table-container" style="width: 100%; height: 100%; display: flex; flex-direction: column;">
        <div class="overflow-x-auto" style="flex: 1; overflow: auto;">
          <table class="table" id="${this.__tableId}" style="border: 1px solid var(--border); border-collapse: collapse; width: 100%;">
            <caption></caption>
            <thead></thead>
            <tbody></tbody>
            <tfoot></tfoot>
          </table>
        </div>
        <nav role="navigation" aria-label="pagination" class="pagination-container mx-auto flex w-full justify-center" style="display: none; padding: 16px 0; margin-top: 8px; border-top: 1px solid var(--border); overflow: visible; flex-shrink: 0; min-height: 60px;">
          <ul class="pagination-pages-list flex flex-row items-center gap-1" style="display: flex; flex-direction: row; flex-wrap: nowrap; list-style: none; margin: 0; padding: 0; gap: 4px; overflow: visible; align-items: center;">
            <li style="flex-shrink: 0;">
              <a href="#" class="btn-ghost pagination-prev" tabindex="0" style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; overflow: visible; width: auto; min-width: max-content; padding: 0 10px; height: 36px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="m15 18-6-6 6-6" /></svg>
                <span>Previous</span>
              </a>
            </li>
            <li class="pagination-pages" style="display: flex; flex-direction: row; flex-wrap: nowrap;"></li>
            <li>
              <div class="pagination-ellipsis size-9 flex items-center justify-center" style="display: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 shrink-0"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
              </div>
            </li>
            <li style="flex-shrink: 0;">
              <a href="#" class="btn-ghost pagination-next" tabindex="0" style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; overflow: visible; width: auto; min-width: max-content; padding: 0 10px; height: 36px;">
                <span>Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="m9 18 6-6-6-6" /></svg>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    `);
        this._add(this.__html, { edge: 0 });
        this.__html.addListenerOnce("appear", () => {
            const container = this.__html.getContentElement().getDomElement();
            this.__tableElement = container.querySelector(`#${this.__tableId}`);
            this.__captionElement = this.__tableElement
                ? this.__tableElement.querySelector("caption")
                : null;
            this.__theadElement = this.__tableElement
                ? this.__tableElement.querySelector("thead")
                : null;
            this.__tbodyElement = this.__tableElement
                ? this.__tableElement.querySelector("tbody")
                : null;
            this.__tfootElement = this.__tableElement
                ? this.__tableElement.querySelector("tfoot")
                : null;
            this.__paginationContainer = container.querySelector(".pagination-container");
            this.__paginationPages = container.querySelector(".pagination-pages");
            this.__paginationPrev = container.querySelector(".pagination-prev");
            this.__paginationNext = container.querySelector(".pagination-next");
            this.__paginationEllipsis = container.querySelector(".pagination-ellipsis");
            if (this.__paginationEnabled && this.__paginationContainer) {
                this.__paginationContainer.style.display = "flex";
                this.__updatePagination();
            }
            if (this.__tableElement) {
                this.__tableElement.style.border = "1px solid var(--border)";
                this.__tableElement.style.borderCollapse = "collapse";
                this.__tableElement.style.tableLayout = "auto";
                this.__tableElement.style.width = "100%";
            }
            if (this.__initialCaption) {
                this.setCaption(this.__initialCaption);
            }
            this.__renderTable();
            if (this.__rows.length > 0 && !this.__hasExplicitColumnWidths()) {
                qx.event.Timer.once(() => {
                    this.__autoAdjustColumnWidths();
                }, this, 100);
            }
            this.__setupColumnResizing();
            this.__setupRowClickEvents();
        });
    }
    __escapeHtml(text) {
        if (text === null || text === undefined)
            return "";
        const div = document.createElement("div");
        div.textContent = String(text);
        return div.innerHTML;
    }
    getCaption() {
        return this.__caption;
    }
    setCaption(caption) {
        const next = caption !== null && caption !== void 0 ? caption : "";
        if (this.__caption === next)
            return this;
        this.__caption = next;
        if (this.__captionElement) {
            this.__captionElement.textContent = next || "";
            this.__captionElement.style.display = next ? "" : "none";
        }
        return this;
    }
    getPageSize() {
        return this.__pageSize;
    }
    setPageSize(pageSize) {
        this.__pageSize = pageSize;
        if (this.__paginationEnabled) {
            this.__currentPage = 1;
            this.__updateCurrentPageRows();
            this.__updatePagination();
            this.__renderTable();
        }
        return this;
    }
    getCurrentPage() {
        return this.__currentPage;
    }
    setCurrentPage(currentPage) {
        const totalPages = this.getTotalPages();
        let page = currentPage;
        if (page < 1)
            page = 1;
        else if (page > totalPages && totalPages > 0)
            page = totalPages;
        this.__currentPage = page;
        if (this.__paginationEnabled) {
            this.__updateCurrentPageRows();
            this.__updatePagination();
            this.__renderTable();
        }
        return this;
    }
    getTotalRows() {
        return this.__totalRows;
    }
    setTotalRows(totalRows) {
        this.__totalRows = totalRows;
        if (this.__paginationEnabled) {
            const totalPages = this.getTotalPages();
            if (this.__currentPage > totalPages) {
                this.__currentPage = totalPages > 0 ? totalPages : 1;
            }
            this.__updateCurrentPageRows();
            this.__updatePagination();
            this.__renderTable();
        }
        return this;
    }
    getPagination() {
        return this.__paginationEnabled;
    }
    setPagination(enabled) {
        this.__paginationEnabled = enabled;
        if (enabled) {
            if (this.__allRows.length === 0 && this.__rows.length > 0) {
                this.__allRows = [...this.__rows];
                this.__totalRows = this.__allRows.length;
            }
            this.__updateCurrentPageRows();
            this.__updatePagination();
        }
        else {
            if (this.__allRows.length > 0) {
                this.__rows = [...this.__allRows];
                this.__renderTable();
            }
        }
        if (this.__paginationContainer) {
            this.__paginationContainer.style.display = enabled ? "flex" : "none";
        }
        return this;
    }
    getTotalPages() {
        if (this.__pageSize <= 0)
            return 0;
        return Math.ceil(this.__totalRows / this.__pageSize);
    }
    setPaginationEnabled(enabled) {
        return this.setPagination(enabled);
    }
    goToPage(page) {
        const totalPages = this.getTotalPages();
        let p = page;
        if (p < 1)
            p = 1;
        if (totalPages > 0 && p > totalPages)
            p = totalPages;
        const oldPage = this.__currentPage;
        this.__currentPage = p;
        if (this.__paginationEnabled) {
            this.__updateCurrentPageRows();
        }
        this.__updatePagination();
        this.__renderTable();
        if (oldPage !== p) {
            this.fireDataEvent("pageChange", {
                currentPage: p,
                pageSize: this.__pageSize,
                totalPages,
            });
        }
    }
    nextPage() {
        const totalPages = this.getTotalPages();
        if (this.__currentPage < totalPages) {
            this.goToPage(this.__currentPage + 1);
        }
    }
    previousPage() {
        if (this.__currentPage > 1) {
            this.goToPage(this.__currentPage - 1);
        }
    }
    __updatePagination() {
        if (!this.__paginationContainer || !this.__paginationEnabled) {
            return;
        }
        const totalPages = this.getTotalPages();
        const currentPage = this.__currentPage;
        if (this.__paginationPrev) {
            this.__paginationPrev.style.pointerEvents =
                currentPage <= 1 ? "none" : "";
            this.__paginationPrev.style.opacity = currentPage <= 1 ? "0.5" : "1";
        }
        if (this.__paginationNext) {
            this.__paginationNext.style.pointerEvents =
                currentPage >= totalPages ? "none" : "";
            this.__paginationNext.style.opacity =
                currentPage >= totalPages ? "0.5" : "1";
        }
        if (this.__paginationPages) {
            this.__paginationPages.innerHTML = this.__renderPageNumbers(currentPage, totalPages);
        }
        if (this.__paginationEllipsis) {
            const showEllipsis = totalPages > 7 && currentPage < totalPages - 2;
            this.__paginationEllipsis.style.display = showEllipsis ? "flex" : "none";
        }
        this.__setupPaginationClickHandlers();
    }
    __renderPageNumbers(currentPage, totalPages) {
        if (totalPages <= 0)
            return "";
        let pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }
        else if (currentPage <= 3) {
            pages = [1, 2, 3, 4, totalPages];
        }
        else if (currentPage >= totalPages - 2) {
            pages = [
                1,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }
        else {
            pages = [
                1,
                currentPage - 1,
                currentPage,
                currentPage + 1,
                totalPages,
            ];
        }
        let html = "";
        let lastPage = 0;
        pages.forEach((page, idx) => {
            if (idx > 0 && page - lastPage > 1) {
                html += `<li style="display: inline-block;"><div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;"><span>...</span></div></li>`;
            }
            const isActive = page === currentPage;
            const btnStyle = isActive
                ? "background-color: transparent; border: 1px solid var(--border); color: inherit;"
                : "background-color: transparent; border: none; color: inherit;";
            html += `
          <li style="display: inline-block;">
            <a href="#" class="pagination-page-btn ${isActive ? "btn-icon-outline" : "btn-icon-ghost"}" data-page="${page}" tabindex="0" style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; ${btnStyle} text-decoration: none; border-radius: var(--radius); cursor: pointer;">
              ${page}
            </a>
          </li>
        `;
            lastPage = page;
        });
        return html;
    }
    __setupPaginationClickHandlers() {
        if (!this.__paginationContainer)
            return;
        if (this.__paginationClickHandler) {
            this.__paginationContainer.removeEventListener("click", this.__paginationClickHandler);
        }
        this.__paginationClickHandler = (e) => {
            e.preventDefault();
            const target = e.target;
            if (target.closest(".pagination-prev")) {
                this.previousPage();
                return;
            }
            if (target.closest(".pagination-next")) {
                this.nextPage();
                return;
            }
            const pageBtn = target.closest(".pagination-page-btn");
            if (pageBtn) {
                const raw = pageBtn.getAttribute("data-page");
                const pageNum = raw ? parseInt(raw, 10) : NaN;
                if (!isNaN(pageNum)) {
                    this.goToPage(pageNum);
                }
            }
        };
        this.__paginationContainer.addEventListener("click", this.__paginationClickHandler);
    }
    __normalizeCell(cell) {
        if (typeof cell === "string" || typeof cell === "number") {
            return { text: String(cell), classes: "", align: "" };
        }
        if (cell && typeof cell === "object") {
            return {
                text: String(cell.text || cell.value || ""),
                classes: cell.classes || cell.className || "",
                align: cell.align || cell.textAlign || "",
            };
        }
        return { text: "", classes: "", align: "" };
    }
    __normalizeFooterCell(cell) {
        const base = this.__normalizeCell(cell);
        if (cell && typeof cell === "object" && "colspan" in cell) {
            const c = cell;
            return Object.assign(Object.assign({}, base), { colspan: c.colspan || 1 });
        }
        return Object.assign(Object.assign({}, base), { colspan: 1 });
    }
    setHeaders(headers) {
        this.__headers = headers || [];
        this.__renderTable();
    }
    addRow(rowData, index = null, rowDataObj = null) {
        if (!rowData || !Array.isArray(rowData)) {
            return;
        }
        const row = {
            cells: rowData.map((cell) => this.__normalizeCell(cell)),
            data: rowDataObj || null,
        };
        if (this.__paginationEnabled) {
            if (index === null || index === undefined) {
                this.__allRows.push(row);
            }
            else {
                this.__allRows.splice(index, 0, row);
            }
            this.__totalRows = this.__allRows.length;
            this.__updateCurrentPageRows();
        }
        else {
            if (index === null || index === undefined) {
                this.__rows.push(row);
            }
            else {
                this.__rows.splice(index, 0, row);
            }
        }
        this.__renderTable();
        if (this.__tableElement && !this.__hasExplicitColumnWidths()) {
            qx.event.Timer.once(() => {
                this.__autoAdjustColumnWidths();
            }, this, 100);
        }
    }
    __updateCurrentPageRows() {
        if (!this.__paginationEnabled || this.__allRows.length === 0) {
            this.__rows = [];
            return;
        }
        const startIndex = (this.__currentPage - 1) * this.__pageSize;
        const endIndex = Math.min(startIndex + this.__pageSize, this.__allRows.length);
        this.__rows = this.__allRows.slice(startIndex, endIndex);
    }
    removeRow(index) {
        if (this.__paginationEnabled) {
            const actualIndex = (this.__currentPage - 1) * this.__pageSize + index;
            if (actualIndex >= 0 && actualIndex < this.__allRows.length) {
                this.__allRows.splice(actualIndex, 1);
                this.__totalRows = this.__allRows.length;
                this.__updateCurrentPageRows();
                this.__updatePagination();
                this.__renderTable();
            }
        }
        else {
            if (index >= 0 && index < this.__rows.length) {
                this.__rows.splice(index, 1);
                this.__renderTable();
            }
        }
    }
    clearRows() {
        if (this.__paginationEnabled) {
            this.__allRows = [];
            this.__rows = [];
            this.__totalRows = 0;
            this.__updatePagination();
        }
        else {
            this.__rows = [];
        }
        this.__renderTable();
    }
    addFooterRow(rowData) {
        if (!rowData || !Array.isArray(rowData)) {
            return;
        }
        const row = {
            cells: rowData.map((cell) => this.__normalizeFooterCell(cell)),
            data: null,
        };
        this.__footerRows.push(row);
        this.__renderTable();
    }
    clearFooterRows() {
        this.__footerRows = [];
        this.__renderTable();
    }
    getRows() {
        const rows = this.__paginationEnabled ? this.__allRows : this.__rows;
        return rows.map((row) => ({
            cells: row.cells.map((cell) => ({
                text: cell.text,
                classes: cell.classes,
                align: cell.align,
            })),
        }));
    }
    getAllRows() {
        return this.__allRows.map((row) => ({
            cells: row.cells.map((cell) => ({
                text: cell.text,
                classes: cell.classes,
                align: cell.align,
            })),
        }));
    }
    setRows(rows) {
        if (!rows || !Array.isArray(rows)) {
            return;
        }
        this.__allRows = rows.map((rowData) => ({
            cells: (rowData || []).map((cell) => this.__normalizeCell(cell)),
            data: null,
        }));
        this.__totalRows = this.__allRows.length;
        if (this.__paginationEnabled) {
            this.__currentPage = 1;
            this.__updateCurrentPageRows();
            this.__updatePagination();
        }
        else {
            this.__rows = [...this.__allRows];
        }
        this.__renderTable();
        if (this.__tableElement && !this.__hasExplicitColumnWidths()) {
            qx.event.Timer.once(() => {
                this.__autoAdjustColumnWidths();
            }, this, 100);
        }
    }
    getRowCount() {
        return this.__paginationEnabled
            ? this.__totalRows
            : this.__rows.length;
    }
    getTotalRowCount() {
        return this.__totalRows;
    }
    __renderTable() {
        if (!this.__tableElement) {
            return;
        }
        if (this.__theadElement && this.__headers.length > 0) {
            this.__theadElement.innerHTML = "";
            const headerRow = document.createElement("tr");
            headerRow.style.borderBottom = "1px solid var(--border)";
            headerRow.style.backgroundColor = "var(--secondary)";
            headerRow.style.minHeight = "44px";
            headerRow.style.height = "auto";
            this.__headers.forEach((headerText, index) => {
                const th = document.createElement("th");
                const w = this.__columnWidths[index];
                if (w != null) {
                    th.style.width = w + "px";
                    th.style.minWidth = w + "px";
                    th.style.maxWidth = w + "px";
                }
                else {
                    th.style.minWidth = "80px";
                    th.style.width = "auto";
                }
                th.style.borderRight = "1px solid var(--border)";
                th.style.borderBottom = "1px solid var(--border)";
                th.style.position = "relative";
                th.style.backgroundColor = "var(--secondary)";
                th.style.color = "var(--secondary-foreground)";
                th.style.fontWeight = "600";
                th.textContent = this.__escapeHtml(headerText);
                th.style.padding = "12px 16px";
                th.style.paddingRight =
                    index < this.__headers.length - 1 ? "16px" : "12px";
                th.style.paddingLeft = index === 0 ? "16px" : "16px";
                th.style.verticalAlign = "middle";
                th.style.overflow = "visible";
                th.style.textOverflow = "ellipsis";
                th.style.whiteSpace = "normal";
                th.style.wordWrap = "break-word";
                if (index < this.__headers.length - 1) {
                    const resizeHandle = document.createElement("div");
                    resizeHandle.className = "table-resize-handle";
                    resizeHandle.style.position = "absolute";
                    resizeHandle.style.right = "-4px";
                    resizeHandle.style.top = "0";
                    resizeHandle.style.width = "8px";
                    resizeHandle.style.height = "100%";
                    resizeHandle.style.cursor = "col-resize";
                    resizeHandle.style.zIndex = "10";
                    resizeHandle.style.userSelect = "none";
                    resizeHandle.setAttribute("data-column-index", String(index));
                    resizeHandle.addEventListener("mouseenter", () => {
                        if (!this.__isResizing) {
                            th.style.borderRight = "2px solid var(--border)";
                            resizeHandle.style.backgroundColor = "var(--muted)";
                        }
                    });
                    resizeHandle.addEventListener("mouseleave", () => {
                        if (!this.__isResizing) {
                            th.style.borderRight = "1px solid var(--border)";
                            resizeHandle.style.backgroundColor = "transparent";
                        }
                    });
                    th.appendChild(resizeHandle);
                }
                if (index === this.__headers.length - 1) {
                    th.style.borderRight = "none";
                }
                headerRow.appendChild(th);
            });
            this.__theadElement.appendChild(headerRow);
        }
        else if (this.__theadElement) {
            this.__theadElement.innerHTML = "";
        }
        if (this.__tbodyElement) {
            this.__tbodyElement.innerHTML = "";
            this.__rows.forEach((row, rowIndex) => {
                const tr = document.createElement("tr");
                const actualIndex = this.__paginationEnabled
                    ? (this.__currentPage - 1) * this.__pageSize + rowIndex
                    : rowIndex;
                tr.setAttribute("data-row-index", String(actualIndex));
                tr.style.minHeight = "44px";
                tr.style.height = "auto";
                tr.style.cursor = "pointer";
                tr.addEventListener("mouseenter", () => {
                    tr.style.backgroundColor = "var(--muted)";
                });
                tr.addEventListener("mouseleave", () => {
                    tr.style.backgroundColor = "";
                });
                row.cells.forEach((cell, index) => {
                    const td = document.createElement("td");
                    td.textContent = this.__escapeHtml(cell.text);
                    const cw = this.__columnWidths[index];
                    if (cw != null) {
                        td.style.width = cw + "px";
                        td.style.minWidth = cw + "px";
                        td.style.maxWidth = cw + "px";
                    }
                    else {
                        td.style.minWidth = "80px";
                        td.style.width = "auto";
                    }
                    td.style.borderRight = "1px solid var(--border)";
                    td.style.borderBottom = "1px solid var(--border)";
                    td.style.backgroundColor = "var(--card)";
                    td.style.color = "var(--card-foreground)";
                    if (index === row.cells.length - 1) {
                        td.style.borderRight = "none";
                    }
                    td.style.padding = "12px 16px";
                    td.style.paddingRight =
                        index < row.cells.length - 1 ? "16px" : "12px";
                    td.style.paddingLeft = index === 0 ? "16px" : "16px";
                    td.style.verticalAlign = "middle";
                    td.style.lineHeight = "1.5";
                    td.style.wordWrap = "break-word";
                    td.style.overflowWrap = "break-word";
                    td.style.whiteSpace = "normal";
                    td.style.overflow = "visible";
                    if (cell.classes) {
                        td.className = cell.classes;
                    }
                    if (cell.align) {
                        td.style.textAlign = cell.align;
                    }
                    tr.appendChild(td);
                });
                this.__tbodyElement.appendChild(tr);
            });
            if (this.__tbodyElement.parentNode) {
                this.__setupRowClickEvents();
            }
            if (this.__rows.length > 0 && !this.__hasExplicitColumnWidths()) {
                qx.event.Timer.once(() => {
                    this.__autoAdjustColumnWidths();
                }, this, 50);
            }
        }
        if (this.__tfootElement) {
            this.__tfootElement.innerHTML = "";
            this.__footerRows.forEach((row) => {
                const tr = document.createElement("tr");
                tr.style.minHeight = "44px";
                tr.style.height = "auto";
                row.cells.forEach((cell, index) => {
                    const td = document.createElement("td");
                    td.textContent = this.__escapeHtml(cell.text);
                    if (!cell.colspan || cell.colspan === 1) {
                        const cw = this.__columnWidths[index];
                        if (cw != null) {
                            td.style.width = cw + "px";
                            td.style.minWidth = cw + "px";
                            td.style.maxWidth = cw + "px";
                        }
                        else {
                            td.style.minWidth = "80px";
                            td.style.width = "auto";
                        }
                    }
                    td.style.borderRight = "1px solid var(--border)";
                    td.style.borderBottom = "1px solid var(--border)";
                    if (index === row.cells.length - 1 &&
                        (!cell.colspan || cell.colspan === 1)) {
                        td.style.borderRight = "none";
                    }
                    td.style.padding = "12px 16px";
                    td.style.paddingRight =
                        index < row.cells.length - 1 ? "16px" : "12px";
                    td.style.paddingLeft = index === 0 ? "16px" : "16px";
                    td.style.verticalAlign = "middle";
                    td.style.lineHeight = "1.5";
                    if (cell.colspan && cell.colspan > 1) {
                        td.setAttribute("colspan", String(cell.colspan));
                    }
                    if (cell.classes) {
                        td.className = cell.classes;
                    }
                    if (cell.align) {
                        td.style.textAlign = cell.align;
                    }
                    tr.appendChild(td);
                });
                this.__tfootElement.appendChild(tr);
            });
            this.__tfootElement.style.display =
                this.__footerRows.length > 0 ? "" : "none";
        }
    }
    __setupRowClickEvents() {
        if (!this.__tbodyElement) {
            return;
        }
        if (this.__rowClickHandler) {
            this.__tbodyElement.removeEventListener("click", this.__rowClickHandler);
        }
        this.__rowClickHandler = (e) => {
            const t = e.target;
            const tr = t.closest("tr");
            if (!tr) {
                return;
            }
            const rowIndex = parseInt(tr.getAttribute("data-row-index") || "", 10);
            const rows = this.__paginationEnabled ? this.__allRows : this.__rows;
            if (isNaN(rowIndex) || rowIndex < 0 || rowIndex >= rows.length) {
                return;
            }
            const row = rows[rowIndex];
            this.fireDataEvent("rowClick", {
                rowIndex: rowIndex,
                rowData: row.data || null,
            });
        };
        this.__tbodyElement.addEventListener("click", this.__rowClickHandler);
    }
    __setupColumnResizing() {
        if (!this.__theadElement) {
            return;
        }
        this.__theadElement.addEventListener("mousedown", (e) => {
            const t = e.target;
            const handle = t.closest(".table-resize-handle");
            if (!handle) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            const columnIndex = parseInt(handle.getAttribute("data-column-index") || "", 10);
            if (isNaN(columnIndex)) {
                return;
            }
            const th = handle.closest("th");
            if (!th) {
                return;
            }
            this.__isResizing = true;
            this.__resizeColumnIndex = columnIndex;
            this.__resizeStartX = e.clientX;
            this.__resizeStartWidth = th.offsetWidth;
            th.style.borderRight = "2px solid var(--border)";
            handle.style.backgroundColor = "var(--muted)";
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            const mouseMoveHandler = (ev) => {
                if (!this.__isResizing) {
                    return;
                }
                const diff = ev.clientX - this.__resizeStartX;
                const newWidth = Math.max(50, this.__resizeStartWidth + diff);
                if (this.__resizeColumnIndex !== null) {
                    this.__columnWidths[this.__resizeColumnIndex] = newWidth;
                    this.__applyColumnWidth(this.__resizeColumnIndex, newWidth);
                }
            };
            const mouseUpHandler = () => {
                this.__isResizing = false;
                this.__resizeColumnIndex = null;
                this.__resizeStartX = null;
                this.__resizeStartWidth = null;
                th.style.borderRight = "1px solid var(--border)";
                handle.style.backgroundColor = "transparent";
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
                document.removeEventListener("mousemove", mouseMoveHandler);
                document.removeEventListener("mouseup", mouseUpHandler);
            };
            document.addEventListener("mousemove", mouseMoveHandler);
            document.addEventListener("mouseup", mouseUpHandler);
        });
    }
    __hasExplicitColumnWidths() {
        return (this.__columnWidths &&
            this.__columnWidths.some((width) => width !== null && width !== undefined));
    }
    __autoAdjustColumnWidths() {
        if (!this.__tableElement || !this.__tbodyElement || this.__rows.length === 0) {
            return;
        }
        const numColumns = this.__headers.length;
        if (numColumns === 0) {
            return;
        }
        const headerRow = this.__theadElement
            ? this.__theadElement.querySelector("tr")
            : null;
        const rows = this.__tbodyElement.querySelectorAll("tr");
        for (let i = 0; i < numColumns; i++) {
            if (this.__columnWidths[i] == null) {
                if (headerRow && headerRow.children[i]) {
                    const th = headerRow.children[i];
                    th.style.width = "";
                    th.style.minWidth = "80px";
                    th.style.maxWidth = "";
                }
                rows.forEach((tr) => {
                    if (tr.children[i]) {
                        const td = tr.children[i];
                        td.style.width = "";
                        td.style.minWidth = "80px";
                        td.style.maxWidth = "";
                    }
                });
            }
        }
        if (this.__tableElement) {
            this.__tableElement.offsetHeight;
        }
    }
    __applyColumnWidth(columnIndex, width) {
        if (!this.__tableElement) {
            return;
        }
        const headerRow = this.__theadElement
            ? this.__theadElement.querySelector("tr")
            : null;
        if (headerRow) {
            const th = headerRow.children[columnIndex];
            if (th) {
                th.style.width = width + "px";
                th.style.minWidth = width + "px";
                th.style.maxWidth = width + "px";
            }
        }
        if (this.__tbodyElement) {
            const rows = this.__tbodyElement.querySelectorAll("tr");
            rows.forEach((tr) => {
                const td = tr.children[columnIndex];
                if (td) {
                    td.style.width = width + "px";
                    td.style.minWidth = width + "px";
                    td.style.maxWidth = width + "px";
                }
            });
        }
        if (this.__tfootElement) {
            const rows = this.__tfootElement.querySelectorAll("tr");
            rows.forEach((tr) => {
                const td = tr.children[columnIndex];
                if (td && !td.hasAttribute("colspan")) {
                    td.style.width = width + "px";
                    td.style.minWidth = width + "px";
                    td.style.maxWidth = width + "px";
                }
            });
        }
    }
}
BsTable.events = {
    rowClick: "qx.event.type.Data",
    pageChange: "qx.event.type.Data",
};
/**
 * Basecoat-style toaster. Listens for `basecoat:toast` on document (capture).
 */
class BsToast extends qx.ui.core.Widget {
    constructor() {
        super();
        this.__timers = {};
        this.__removeTimers = {};
        this.__documentToastListener = null;
        this.__idSeq = 0;
        this.__toasterRetryScheduled = false;
        this.__placement = "top-end";
        this.__align = "end";
        this.__offsetX = 16;
        this.__offsetY = 16;
        this.__defaultDuration = 4000;
        this.__stackLimit = 5;
        this.__richDescription = false;
        this._setLayout(new qx.ui.layout.Canvas());
        this.__toasterId = "toaster-" + this.toHashCode();
        this.__html = new qx.ui.embed.Html(`
      <div id="${this.__toasterId}" class="toaster" data-align="${this.__align}"></div>
    `);
        this._add(this.__html, { edge: 0 });
        this.__html.addListenerOnce("appear", () => {
            this.__applyPlacement(this.__placement);
        });
        this.__documentToastListener = (evt) => {
            if (this.isDisposed())
                return;
            evt.stopImmediatePropagation();
            const ce = evt;
            const detail = ce && ce.detail ? ce.detail : {};
            const config = detail.config || {};
            this.show(config);
        };
        document.addEventListener("basecoat:toast", this.__documentToastListener, true);
    }
    __escapeHtml(text) {
        if (!text)
            return "";
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
    __getToasterElement() {
        var _a;
        const host = (_a = this.__html.getContentElement()) === null || _a === void 0 ? void 0 : _a.getDomElement();
        return host ? host.querySelector("#" + this.__toasterId) : null;
    }
    setAlign(value) {
        this.__align = value || "end";
        const toaster = this.__getToasterElement();
        if (toaster)
            toaster.setAttribute("data-align", this.__align);
        this.__applyPlacement(this.__placement);
        return this;
    }
    getAlign() {
        return this.__align;
    }
    setPlacement(value) {
        this.__placement = value || "top-end";
        this.__applyPlacement(this.__placement);
        return this;
    }
    getPlacement() {
        return this.__placement;
    }
    setOffsetX(value) {
        this.__offsetX = value;
        this.__applyPlacement(this.__placement);
        return this;
    }
    getOffsetX() {
        return this.__offsetX;
    }
    setOffsetY(value) {
        this.__offsetY = value;
        this.__applyPlacement(this.__placement);
        return this;
    }
    getOffsetY() {
        return this.__offsetY;
    }
    setDefaultDuration(value) {
        this.__defaultDuration = value;
        return this;
    }
    getDefaultDuration() {
        return this.__defaultDuration;
    }
    setStackLimit(value) {
        this.__stackLimit = value;
        return this;
    }
    getStackLimit() {
        return this.__stackLimit;
    }
    setRichDescription(value) {
        this.__richDescription = !!value;
        return this;
    }
    getRichDescription() {
        return this.__richDescription;
    }
    __applyPlacement(_value) {
        const toaster = this.__getToasterElement();
        if (!toaster)
            return;
        const placement = this.__placement || "top-end";
        const offsetX = this.__offsetX;
        const offsetY = this.__offsetY;
        const align = this.__align || "end";
        toaster.style.position = "fixed";
        toaster.style.zIndex = "10000";
        toaster.style.left = "";
        toaster.style.right = "";
        toaster.style.top = "";
        toaster.style.bottom = "";
        toaster.style.transform = "";
        if (placement !== "custom") {
            const [vertical, horizontal] = placement.split("-");
            if (vertical === "bottom") {
                toaster.style.bottom = `${offsetY}px`;
            }
            else {
                toaster.style.top = `${offsetY}px`;
            }
            if (horizontal === "start") {
                toaster.style.left = `${offsetX}px`;
            }
            else if (horizontal === "center") {
                toaster.style.left = "50%";
                toaster.style.transform = "translateX(-50%)";
            }
            else {
                toaster.style.right = `${offsetX}px`;
            }
            toaster.setAttribute("data-align", horizontal || align);
        }
        else {
            toaster.style.top = `${offsetY}px`;
            if (align === "start") {
                toaster.style.left = `${offsetX}px`;
            }
            else if (align === "center") {
                toaster.style.left = "50%";
                toaster.style.transform = "translateX(-50%)";
            }
            else {
                toaster.style.right = `${offsetX}px`;
            }
        }
    }
    __getCategoryIcon(category) {
        const c = (category || "").toLowerCase();
        if (c === "success") {
            return '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>';
        }
        if (c === "error" || c === "destructive" || c === "danger") {
            return '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>';
        }
        if (c === "warning") {
            return '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
        }
        return '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>';
    }
    __nextToastId() {
        this.__idSeq += 1;
        return this.__toasterId + "-toast-" + this.__idSeq;
    }
    __clearToastTimers(toastId) {
        if (this.__timers[toastId]) {
            clearTimeout(this.__timers[toastId]);
            delete this.__timers[toastId];
        }
        if (this.__removeTimers[toastId]) {
            clearTimeout(this.__removeTimers[toastId]);
            delete this.__removeTimers[toastId];
        }
    }
    __enforceStackLimit() {
        const limit = this.__stackLimit;
        if (!limit || limit <= 0)
            return;
        const toaster = this.__getToasterElement();
        if (!toaster)
            return;
        const visibleToasts = Array.from(toaster.querySelectorAll(".toast"));
        if (visibleToasts.length <= limit)
            return;
        const toRemove = visibleToasts.slice(limit);
        toRemove.forEach((node) => {
            const id = node.id;
            if (id) {
                this.__clearToastTimers(id);
            }
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
            if (id) {
                this.fireDataEvent("hide", id);
            }
        });
    }
    show(config = {}) {
        const tryShow = () => {
            const toaster = this.__getToasterElement();
            if (!toaster) {
                if (!this.__toasterRetryScheduled) {
                    this.__toasterRetryScheduled = true;
                    setTimeout(() => {
                        this.__toasterRetryScheduled = false;
                        tryShow();
                    }, 100);
                }
                return null;
            }
            const toastId = this.__nextToastId();
            const category = String(config.category || "info").toLowerCase();
            const title = this.__escapeHtml(String(config.title || "Notification"));
            const descRaw = config.description != null ? String(config.description) : "";
            const description = this.__richDescription
                ? descRaw
                : this.__escapeHtml(descRaw);
            const action = config.action && typeof config.action === "object"
                ? config.action
                : null;
            const cancel = config.cancel && typeof config.cancel === "object"
                ? config.cancel
                : null;
            const actionLabel = action && action.label
                ? this.__escapeHtml(String(action.label))
                : "";
            const cancelLabel = cancel && cancel.label
                ? this.__escapeHtml(String(cancel.label))
                : "Dismiss";
            const toast = document.createElement("div");
            toast.className = "toast";
            toast.id = toastId;
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-atomic", "true");
            toast.setAttribute("aria-hidden", "false");
            toast.setAttribute("data-category", category);
            const actionHtml = actionLabel
                ? `<button type="button" class="btn btn-sm" data-toast-action>${actionLabel}</button>`
                : "";
            const cancelHtml = cancel !== null
                ? `<button type="button" class="btn btn-sm" data-toast-cancel style="background: var(--secondary); color: var(--secondary-foreground); border: 1px solid var(--border); white-space: nowrap;">${cancelLabel}</button>`
                : "";
            const footerHtml = actionHtml || cancelHtml
                ? `<footer style="display: flex; gap: 8px; margin-top: 12px;">${actionHtml}${cancelHtml}</footer>`
                : "";
            toast.innerHTML = `
          <div class="toast-content" style="display: flex; gap: 12px; align-items: flex-start;">
            <div style="flex-shrink: 0;">${this.__getCategoryIcon(category)}</div>
            <section style="flex: 1; min-width: 0;">
              <h2 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${title}</h2>
              <p style="margin: 0; font-size: 14px; color: var(--muted-foreground);">${description}</p>
            </section>
            ${footerHtml}
          </div>
        `;
            toaster.insertBefore(toast, toaster.firstChild);
            this.__enforceStackLimit();
            const actionBtn = toast.querySelector("[data-toast-action]");
            if (actionBtn && action) {
                actionBtn.addEventListener("click", () => {
                    if (typeof action.onClick === "function") {
                        action.onClick({ id: toastId, toast, category });
                    }
                    this.dismiss(toastId);
                });
            }
            const cancelBtn = toast.querySelector("[data-toast-cancel]");
            if (cancelBtn) {
                cancelBtn.addEventListener("click", () => {
                    this.dismiss(toastId);
                });
            }
            const duration = typeof config.duration === "number"
                ? config.duration
                : this.__defaultDuration;
            if (duration > 0) {
                this.__timers[toastId] = setTimeout(() => this.dismiss(toastId), duration);
            }
            this.fireDataEvent("show", toastId);
            return toastId;
        };
        return tryShow();
    }
    toast(config = {}) {
        return this.show(config);
    }
    dismiss(toastId) {
        const toaster = this.__getToasterElement();
        if (!toaster || !toastId)
            return;
        const toast = toaster.ownerDocument.getElementById(toastId);
        if (!toast)
            return;
        this.__clearToastTimers(toastId);
        toast.setAttribute("aria-hidden", "true");
        this.__removeTimers[toastId] = setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            delete this.__removeTimers[toastId];
            this.fireDataEvent("hide", toastId);
        }, 320);
    }
    clear() {
        const toaster = this.__getToasterElement();
        if (!toaster)
            return;
        const ids = Object.keys(this.__timers).concat(Object.keys(this.__removeTimers));
        ids.forEach((id) => this.__clearToastTimers(id));
        toaster.querySelectorAll(".toast").forEach((node) => {
            if (node.parentNode)
                node.parentNode.removeChild(node);
        });
    }
    destruct() {
        this.clear();
        if (this.__documentToastListener) {
            document.removeEventListener("basecoat:toast", this.__documentToastListener, true);
            this.__documentToastListener = null;
        }
        this.__timers = {};
        this.__removeTimers = {};
        super.destruct();
    }
}
BsToast.events = {
    show: "qx.event.type.Data",
    hide: "qx.event.type.Data",
};
/**
 * Port of new_proj `myapp.components.ui.ToolTip` (ToolTip.ts): Basecoat tooltip helper.
 *
 * Uses Basecoat attribute API on target elements:
 * - `data-tooltip="..."`
 * - `data-side="top|bottom|left|right"`
 * - `data-align="start|center|end"`
 *
 * One instance can attach to multiple widgets (shared tooltip).
 */
class BsTooltip extends qx.core.Object {
    constructor(text = "", side = "top", align = "center") {
        super();
        this.__targets = [];
        this.__text = "";
        this.__side = "top";
        this.__align = "center";
        this.__enabled = true;
        this.__text = String(text || "");
        this.__side = side || "top";
        this.__align = align || "center";
    }
    getText() {
        return this.__text;
    }
    setText(text) {
        this.__text = String(text || "");
        this.__applyAll();
    }
    getSide() {
        return this.__side;
    }
    setSide(side) {
        this.__side = side || "top";
        this.__applyAll();
    }
    getAlign() {
        return this.__align;
    }
    setAlign(align) {
        this.__align = align || "center";
        this.__applyAll();
    }
    getEnabled() {
        return this.__enabled;
    }
    setEnabled(enabled) {
        this.__enabled = !!enabled;
        this.__applyAll();
    }
    __getTargetDom(widget) {
        if (!widget || widget.isDisposed())
            return null;
        const contentEl = widget.getContentElement
            ? widget.getContentElement()
            : null;
        const dom = contentEl ? contentEl.getDomElement() : null;
        if (!dom)
            return null;
        return (dom.querySelector("button, input, textarea, select, [role='button']") || dom);
    }
    __applyToWidget(widget) {
        const el = this.__getTargetDom(widget);
        if (!el)
            return;
        if (!this.__enabled || !this.__text) {
            el.removeAttribute("data-tooltip");
            el.removeAttribute("data-side");
            el.removeAttribute("data-align");
            return;
        }
        el.setAttribute("data-tooltip", this.__text);
        el.setAttribute("data-side", this.__side);
        el.setAttribute("data-align", this.__align);
    }
    __applyAll() {
        this.__targets.forEach((entry) => {
            if (!entry.widget || entry.widget.isDisposed())
                return;
            this.__applyToWidget(entry.widget);
        });
    }
    attachTo(widget) {
        if (!widget || widget.isDisposed())
            return;
        const existing = this.__targets.find((e) => e.widget === widget);
        if (existing) {
            this.__applyToWidget(widget);
            return;
        }
        const entry = {
            widget,
            appearId: null,
        };
        entry.appearId = widget.addListener("appear", () => {
            this.__applyToWidget(widget);
        }, this);
        this.__targets.push(entry);
        this.__applyToWidget(widget);
    }
    detachFrom(widget) {
        if (!widget)
            return;
        const index = this.__targets.findIndex((e) => e.widget === widget);
        if (index < 0)
            return;
        const entry = this.__targets[index];
        if (entry.appearId != null &&
            widget &&
            !widget.isDisposed() &&
            widget.removeListenerById) {
            widget.removeListenerById(entry.appearId);
        }
        const dom = this.__getTargetDom(widget);
        if (dom) {
            dom.removeAttribute("data-tooltip");
            dom.removeAttribute("data-side");
            dom.removeAttribute("data-align");
        }
        this.__targets.splice(index, 1);
    }
    detachAll() {
        const copy = this.__targets.slice();
        copy.forEach((entry) => this.detachFrom(entry.widget));
    }
    getTargets() {
        return this.__targets.map((e) => e.widget);
    }
    destruct() {
        this.detachAll();
        this.__targets = [];
        super.destruct();
    }
}
class BsButton extends qx.ui.basic.Atom {
    constructor(text, icon, options) {
        var _a, _b, _c;
        super();
        this.__variant = "default";
        this.__size = "default";
        this.__buttonEl = null;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.setFocusable(true);
        this.__iconHtml = icon ? icon.getHtml() : "";
        this.__buttonText = text !== null && text !== void 0 ? text : "";
        this.__className = (_a = options === null || options === void 0 ? void 0 : options.className) !== null && _a !== void 0 ? _a : "";
        this.__variant = (_b = options === null || options === void 0 ? void 0 : options.variant) !== null && _b !== void 0 ? _b : "default";
        this.__size = (_c = options === null || options === void 0 ? void 0 : options.size) !== null && _c !== void 0 ? _c : "default";
        this.__htmlButton = new qx.ui.embed.Html("");
        this.__renderButton();
        this._add(this.__htmlButton);
        this.__htmlButton.addListener("tap", () => this.fireEvent("execute"));
        this.__htmlButton.addListenerOnce("appear", () => {
            this.__bindNativeButton();
        });
        this.addListener("focusin", () => { var _a; return (_a = this.__buttonEl) === null || _a === void 0 ? void 0 : _a.focus(); });
        this.addListener("changeTabIndex", () => this.__syncTabIndex());
        if (icon) {
            icon.addListener("changeHtml", () => {
                this.__iconHtml = icon.getHtml();
                this.__renderButton();
            });
        }
    }
    __bindNativeButton() {
        var _a;
        const root = this.__htmlButton.getContentElement().getDomElement();
        this.__buttonEl =
            (_a = root === null || root === void 0 ? void 0 : root.querySelector("button")) !== null && _a !== void 0 ? _a : null;
        if (!this.__buttonEl)
            return;
        this.__syncTabIndex();
    }
    __syncTabIndex() {
        if (!this.__buttonEl)
            return;
        this.__buttonEl.setAttribute("tabindex", "-1");
    }
    __renderButton() {
        const isIconSize = this.__size === "icon" || this.__size === "sm-icon";
        const iconPart = this.__iconHtml
            ? `<span class="${isIconSize ? "" : "me-2"}">${this.__iconHtml}</span>`
            : "";
        const tabIndexAttr = 'tabindex="-1"';
        const variantClass = this.__resolveVariantClass();
        const sizeClass = this.__resolveSizeClass();
        const classes = [variantClass, sizeClass, this.__className]
            .filter(Boolean)
            .join(" ");
        this.__htmlButton.setHtml(`
      <div class="p-1">
        <button type="button" class="w-full ${classes}" ${tabIndexAttr}>
          ${iconPart}
          ${this.__buttonText}
        </button>
      </div>
    `);
        qx.event.Timer.once(() => this.__bindNativeButton(), this, 0);
    }
    __resolveVariantClass() {
        const variantMap = {
            default: "primary",
            secondary: "secondary",
            destructive: "destructive",
            outline: "outline",
            ghost: "ghost",
            link: "link",
        };
        const variantSuffix = variantMap[this.__variant];
        const isIconSize = this.__size === "icon" ||
            this.__size === "sm-icon" ||
            this.__size === "lg-icon";
        const sizePrefix = isIconSize ? "icon" : this.__size;
        if (sizePrefix === "default") {
            return `btn-${variantSuffix}`;
        }
        return `btn-${sizePrefix}-${variantSuffix}`;
    }
    __resolveSizeClass() {
        return "";
    }
    getVariant() {
        return this.__variant;
    }
    getSize() {
        return this.__size;
    }
    onClick(handler) {
        this.addListener("execute", handler);
        return this;
    }
}
BsButton.events = {
    execute: "qx.event.type.Event",
};
class BsDrawer extends qx.ui.container.Composite {
    constructor(content, drawerPanel) {
        var _a, _b;
        super(new qx.ui.layout.Canvas());
        this.__open = false;
        this.__isAnimating = false;
        this.__animationToken = 0;
        this.__dragStartY = null;
        this.__dragOffset = 0;
        this.add(content, { left: 0, right: 0, top: 0, bottom: 0 });
        this.__backdrop = new qx.ui.core.Widget();
        this.__backdrop.set({
            backgroundColor: AppColors.overlay(0.45),
            zIndex: 20,
        });
        this.__backdrop.addListener("tap", () => this.close());
        this.add(this.__backdrop, { left: 0, right: 0, top: 0, bottom: 0 });
        this.__drawerPanel = drawerPanel;
        (_b = (_a = this.__drawerPanel).resetWidth) === null || _b === void 0 ? void 0 : _b.call(_a);
        this.__drawerPanel.setAllowGrowX(true);
        this.__drawerPanel.setAllowGrowY(true);
        const handleRow = new qx.ui.container.Composite(new qx.ui.layout.HBox());
        handleRow.set({
            alignY: "middle",
            paddingTop: 10,
            paddingBottom: 8,
        });
        const spacerLeft = new qx.ui.core.Spacer();
        const spacerRight = new qx.ui.core.Spacer();
        this.__dragHandle = new qx.ui.core.Widget();
        this.__dragHandle.set({
            width: 56,
            height: 6,
            backgroundColor: AppColors.primary(),
            cursor: "ns-resize",
        });
        this.__dragHandle.setDecorator(new qx.ui.decoration.Decorator().set({
            radius: 999,
        }));
        handleRow.add(spacerLeft, { flex: 1 });
        handleRow.add(this.__dragHandle);
        handleRow.add(spacerRight, { flex: 1 });
        this.__bodyScroll = new qx.ui.container.Scroll();
        this.__bodyScroll.add(this.__drawerPanel);
        const sheetHeight = Math.floor(qx.bom.Viewport.getHeight() * 0.5);
        this.__sheet = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        this.__sheet.set({
            zIndex: 30,
            minHeight: sheetHeight,
            maxHeight: sheetHeight,
        });
        this.__sheet.add(handleRow);
        this.__sheet.add(this.__bodyScroll, { flex: 1 });
        this.add(this.__sheet, { left: 0, right: 0, bottom: 0 });
        this.__sheet.setDecorator(new qx.ui.decoration.Decorator().set({
            radiusTopLeft: 16,
            radiusTopRight: 16,
            shadowBlurRadius: 45,
            shadowVerticalLength: -20,
            shadowColor: "rgba(0,0,0,0.22)",
        }));
        this.__sheet.setBackgroundColor(AppColors.sidebar());
        // Start hidden off-screen
        this.__hideImmediate();
        this.__wireDragToClose();
    }
    __hideImmediate() {
        this.__setDomStyles(this.__backdrop, {
            opacity: "0",
            visibility: "hidden",
            pointerEvents: "none",
            transition: "none",
        });
        this.__setDomStyles(this.__sheet, {
            transform: "translateY(110%)",
            visibility: "hidden",
            pointerEvents: "none",
            transition: "none",
            willChange: "transform",
        });
    }
    open() {
        if (this.__open)
            return;
        this.__open = true;
        this.__isAnimating = true;
        const token = ++this.__animationToken;
        // Make visible at off-screen position, no transition yet
        this.__setDomStyles(this.__backdrop, {
            visibility: "visible",
            pointerEvents: "auto",
            opacity: "0",
            transition: "none",
        });
        this.__setDomStyles(this.__sheet, {
            visibility: "visible",
            pointerEvents: "auto",
            transform: "translateY(110%)",
            transition: "none",
        });
        // Force reflow so the browser registers the initial position
        this.__forceReflow();
        // Now enable transitions and animate to final position
        this.__setDomStyles(this.__backdrop, {
            opacity: "1",
            transition: "opacity 200ms ease",
        });
        this.__setDomStyles(this.__sheet, {
            transform: "translateY(0px)",
            transition: "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)",
        });
        qx.event.Timer.once(() => {
            if (token !== this.__animationToken)
                return;
            this.__isAnimating = false;
        }, this, 280);
    }
    close() {
        if (!this.__open)
            return;
        this.__open = false;
        this.__isAnimating = true;
        const token = ++this.__animationToken;
        this.__setDomStyles(this.__backdrop, {
            opacity: "0",
            transition: "opacity 180ms ease",
        });
        this.__setDomStyles(this.__sheet, {
            transform: "translateY(110%)",
            transition: "transform 220ms cubic-bezier(0.4, 0, 1, 1)",
        });
        qx.event.Timer.once(() => {
            if (token !== this.__animationToken)
                return;
            this.__setDomStyles(this.__backdrop, {
                visibility: "hidden",
                pointerEvents: "none",
            });
            this.__setDomStyles(this.__sheet, {
                visibility: "hidden",
                pointerEvents: "none",
            });
            this.__isAnimating = false;
            this.__dragStartY = null;
            this.__dragOffset = 0;
        }, this, 240);
    }
    toggle() {
        this.__open ? this.close() : this.open();
    }
    isOpen() {
        return this.__open;
    }
    __forceReflow() {
        const el = this.__sheet
            .getContentElement()
            .getDomElement();
        if (el)
            el.offsetHeight;
    }
    __wireDragToClose() {
        this.__dragHandle.addListener("pointerdown", (ev) => {
            if (!this.__open || this.__isAnimating)
                return;
            this.__dragStartY = ev.getDocumentTop();
            this.__dragOffset = 0;
            this.__setDomStyles(this.__sheet, {
                transition: "none",
            });
            ev.stopPropagation();
        });
        this.addListener("pointermove", (ev) => {
            if (this.__dragStartY === null || !this.__open || this.__isAnimating)
                return;
            const y = ev.getDocumentTop();
            const delta = Math.max(0, y - this.__dragStartY);
            this.__dragOffset = delta;
            this.__setDomStyles(this.__sheet, {
                transform: `translateY(${delta}px)`,
            });
            const fadeProgress = Math.min(1, delta / Math.max(1, this.__getPanelHeight() * 0.8));
            this.__setDomStyles(this.__backdrop, {
                opacity: `${1 - fadeProgress}`,
            });
        });
        const finishDrag = (ev) => {
            if (this.__dragStartY === null)
                return;
            const shouldClose = this.__dragOffset > Math.max(80, this.__getPanelHeight() * 0.22);
            this.__dragStartY = null;
            if (ev)
                ev.stopPropagation();
            if (shouldClose) {
                this.close();
                return;
            }
            this.__setDomStyles(this.__sheet, {
                transition: "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
                transform: "translateY(0px)",
            });
            this.__setDomStyles(this.__backdrop, {
                transition: "opacity 180ms ease",
                opacity: "1",
            });
            this.__dragOffset = 0;
        };
        this.addListener("pointerup", finishDrag);
        this.addListener("pointercancel", finishDrag);
    }
    __getPanelHeight() {
        var _a;
        const element = this.__sheet
            .getContentElement()
            .getDomElement();
        return (_a = element === null || element === void 0 ? void 0 : element.offsetHeight) !== null && _a !== void 0 ? _a : qx.bom.Viewport.getHeight() * 0.5;
    }
    __setDomStyles(widget, styles) {
        const contentElement = widget.getContentElement();
        if (!contentElement || !contentElement.setStyle)
            return;
        for (const key in styles) {
            if (!Object.prototype.hasOwnProperty.call(styles, key))
                continue;
            contentElement.setStyle(key, styles[key]);
        }
    }
}
class BsInput extends qx.ui.basic.Atom {
    constructor(value, placeholder, className) {
        super();
        this.__leadingHtml = "";
        this.__inputEl = null;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        // important for qooxdoo focus manager
        this.setFocusable(true);
        this.__value = value !== null && value !== void 0 ? value : "";
        this.__placeholder = placeholder !== null && placeholder !== void 0 ? placeholder : "";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__htmlInput = new qx.ui.embed.Html("");
        this.__htmlInput.setAllowGrowX(true);
        this.__render();
        this._add(this.__htmlInput);
        this.__htmlInput.addListenerOnce("appear", () => {
            var _a;
            const root = this.__htmlInput.getContentElement().getDomElement();
            this.__inputEl = (_a = root === null || root === void 0 ? void 0 : root.querySelector("input")) !== null && _a !== void 0 ? _a : null;
            if (!this.__inputEl)
                return;
            this.__syncTabIndex();
            this.__inputEl.addEventListener("input", () => {
                var _a, _b;
                const next = (_b = (_a = this.__inputEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "";
                const prev = this.__value;
                this.__value = next;
                this.fireDataEvent("input", next);
                if (prev !== next)
                    this.fireDataEvent("changeValue", next);
            });
        });
        // when widget gets focus from Tab, move focus to native input
        this.addListener("focusin", () => {
            var _a;
            (_a = this.__inputEl) === null || _a === void 0 ? void 0 : _a.focus();
        });
        // keep native tabindex in sync
        this.addListener("changeTabIndex", () => {
            this.__syncTabIndex();
        });
    }
    __syncTabIndex() {
        if (!this.__inputEl)
            return;
        this.__inputEl.setAttribute("tabindex", "1");
    }
    __escapeAttr(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
    __render() {
        const hasLeadingIcon = this.__leadingHtml.length > 0;
        const classes = [
            "input",
            "bg-card",
            "text-foreground",
            "border-border",
            "placeholder:text-muted-foreground",
            hasLeadingIcon ? "pl-9" : "",
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        const value = this.__escapeAttr(this.__value);
        const placeholder = this.__escapeAttr(this.__placeholder);
        const tabIndexAttr = 'tabindex="-1"';
        this.__htmlInput.setHtml(`
        <div class="relative p-1">
            ${hasLeadingIcon
            ? `<span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">${this.__leadingHtml}</span>`
            : ""}
            <input
            type="text"
            class="${classes}"
            value="${value}"
            placeholder="${placeholder}"
            ${tabIndexAttr}
            />
        </div>
    `);
    }
    getValue() {
        var _a, _b;
        return (_b = (_a = this.__inputEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : this.__value;
    }
    setValue(value) {
        this.__value = value !== null && value !== void 0 ? value : "";
        if (this.__inputEl)
            this.__inputEl.value = this.__value;
        else
            this.__render();
        return this;
    }
    setPlaceholder(value) {
        this.__placeholder = value !== null && value !== void 0 ? value : "";
        if (this.__inputEl)
            this.__inputEl.placeholder = this.__placeholder;
        else
            this.__render();
        return this;
    }
    setLeadingHtml(html) {
        this.__leadingHtml = html !== null && html !== void 0 ? html : "";
        this.__render();
        return this;
    }
    onInput(handler) {
        this.addListener("input", (ev) => {
            var _a;
            handler((_a = ev.getData()) !== null && _a !== void 0 ? _a : "");
        });
        return this;
    }
}
BsInput.events = {
    input: "qx.event.type.Data",
    changeValue: "qx.event.type.Data",
};
class BsInputGroup extends qx.ui.container.Composite {
    constructor(labelText, placeholder, initialValue, inputClassName) {
        super(new qx.ui.layout.VBox(3));
        this.setAllowGrowX(true);
        this.__label = new qx.ui.basic.Label(labelText);
        this.__input = new BsInput(initialValue !== null && initialValue !== void 0 ? initialValue : "", placeholder !== null && placeholder !== void 0 ? placeholder : "", inputClassName);
        this.__input.setAllowGrowX(true);
        this.__error = new qx.ui.basic.Label("");
        this.__error.setVisibility("excluded");
        this.add(this.__label);
        this.add(this.__input);
        this.add(this.__error);
    }
    onInput(handler) {
        this.__input.onInput(handler);
        return this;
    }
    getValue() {
        var _a;
        return (_a = this.__input.getValue()) !== null && _a !== void 0 ? _a : "";
    }
    setValue(value) {
        this.__input.setValue(value);
        return this;
    }
    setError(message) {
        const text = (message !== null && message !== void 0 ? message : "").trim();
        this.__error.setValue(text);
        if (text) {
            this.__error.show();
        }
        else {
            this.__error.exclude();
        }
        return this;
    }
    clearError() {
        return this.setError("");
    }
    getInputWidget() {
        return this.__input;
    }
    setInputTabIndex(value) {
        this.__input.setTabIndex(value);
        return this;
    }
    resetInputTabIndex() {
        this.__input.resetTabIndex();
        return this;
    }
}
class BsPassword extends qx.ui.basic.Atom {
    constructor(value, placeholder, className) {
        super();
        this.__inputEl = null;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.setFocusable(true);
        this.__value = value !== null && value !== void 0 ? value : "";
        this.__placeholder = placeholder !== null && placeholder !== void 0 ? placeholder : "";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__htmlInput = new qx.ui.embed.Html("");
        this.__htmlInput.setAllowGrowX(true);
        this.__render();
        this._add(this.__htmlInput);
        this.__htmlInput.addListenerOnce("appear", () => {
            var _a;
            const root = this.__htmlInput.getContentElement().getDomElement();
            this.__inputEl = (_a = root === null || root === void 0 ? void 0 : root.querySelector("input")) !== null && _a !== void 0 ? _a : null;
            if (!this.__inputEl)
                return;
            this.__syncTabIndex();
            this.__inputEl.addEventListener("input", () => {
                var _a, _b;
                const next = (_b = (_a = this.__inputEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "";
                const prev = this.__value;
                this.__value = next;
                this.fireDataEvent("input", next);
                if (prev !== next)
                    this.fireDataEvent("changeValue", next);
            });
        });
        this.addListener("focusin", () => {
            var _a;
            (_a = this.__inputEl) === null || _a === void 0 ? void 0 : _a.focus();
        });
        this.addListener("changeTabIndex", () => {
            this.__syncTabIndex();
        });
    }
    __syncTabIndex() {
        if (!this.__inputEl)
            return;
        this.__inputEl.setAttribute("tabindex", "1");
    }
    __escapeAttr(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
    __render() {
        const classes = [
            "input",
            "bg-card",
            "text-foreground",
            "border-border",
            "placeholder:text-muted-foreground",
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        const value = this.__escapeAttr(this.__value);
        const placeholder = this.__escapeAttr(this.__placeholder);
        const tabIndexAttr = 'tabindex="-1"';
        this.__htmlInput.setHtml(`
        <div class="p-1">
            <input
            type="password"
            class="${classes}"
            value="${value}"
            placeholder="${placeholder}"
            ${tabIndexAttr}
            />
        </div>
    `);
    }
    getValue() {
        var _a, _b;
        return (_b = (_a = this.__inputEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : this.__value;
    }
    setValue(value) {
        this.__value = value !== null && value !== void 0 ? value : "";
        if (this.__inputEl)
            this.__inputEl.value = this.__value;
        else
            this.__render();
        return this;
    }
    setPlaceholder(value) {
        this.__placeholder = value !== null && value !== void 0 ? value : "";
        if (this.__inputEl)
            this.__inputEl.placeholder = this.__placeholder;
        else
            this.__render();
        return this;
    }
    onInput(handler) {
        this.addListener("input", (ev) => {
            var _a;
            handler((_a = ev.getData()) !== null && _a !== void 0 ? _a : "");
        });
        return this;
    }
}
BsPassword.events = {
    input: "qx.event.type.Data",
    changeValue: "qx.event.type.Data",
};
class BsSelect extends qx.ui.basic.Atom {
    constructor(options = [], className) {
        super();
        this.__value = "";
        this.__selectEl = null;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.setFocusable(true);
        this.__options = options;
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__htmlSelect = new qx.ui.embed.Html("");
        this.__htmlSelect.setAllowGrowX(true);
        this.__render();
        this._add(this.__htmlSelect);
        this.__htmlSelect.addListenerOnce("appear", () => {
            this.__bindNativeSelect();
        });
        this.addListener("focusin", () => { var _a; return (_a = this.__selectEl) === null || _a === void 0 ? void 0 : _a.focus(); });
        this.addListener("changeTabIndex", () => this.__syncTabIndex());
    }
    __escape(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
    __syncTabIndex() {
        if (!this.__selectEl)
            return;
        this.__selectEl.setAttribute("tabindex", "-1");
    }
    __bindNativeSelect() {
        var _a;
        const root = this.__htmlSelect.getContentElement().getDomElement();
        this.__selectEl =
            (_a = root === null || root === void 0 ? void 0 : root.querySelector("select")) !== null && _a !== void 0 ? _a : null;
        if (!this.__selectEl)
            return;
        this.__syncTabIndex();
        this.__selectEl.onchange = () => {
            var _a, _b;
            this.__value = (_b = (_a = this.__selectEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "";
            this.fireDataEvent("changeValue", this.__value);
        };
    }
    __render() {
        const optionsHtml = [
            `<option value="">Select an option</option>`,
            ...this.__options.map((opt) => {
                const v = this.__escape(opt);
                const selected = this.__value === opt ? "selected" : "";
                return `<option value="${v}" ${selected}>${v}</option>`;
            }),
        ].join("");
        const tabIndexAttr = 'tabindex="-1"';
        const classes = ["select", this.__className].filter(Boolean).join(" ");
        this.__htmlSelect.setHtml(`
      <div class="p-1">
        <select class="w-full ${classes}" ${tabIndexAttr}>
          ${optionsHtml}
        </select>
      </div>
    `);
        qx.event.Timer.once(() => this.__bindNativeSelect(), this, 0);
    }
    getSelectedValue() {
        var _a, _b;
        return (_b = (_a = this.__selectEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : this.__value;
    }
    setSelectedByLabel(label) {
        this.__value = this.__options.indexOf(label) !== -1 ? label : "";
        if (this.__selectEl)
            this.__selectEl.value = this.__value;
        else
            this.__render();
        return this;
    }
    resetSelection() {
        this.__value = "";
        if (this.__selectEl)
            this.__selectEl.value = "";
        else
            this.__render();
        return this;
    }
    onChange(handler) {
        this.addListener("changeValue", (ev) => {
            var _a;
            handler((_a = ev.getData()) !== null && _a !== void 0 ? _a : "");
        });
        return this;
    }
}
BsSelect.events = {
    changeValue: "qx.event.type.Data",
};
class BsSeparator extends qx.ui.basic.Atom {
    constructor(orientation = "horizontal", decorative = true, className, label) {
        super();
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.setAllowGrowY(true);
        this.__orientation = orientation;
        this.__decorative = decorative;
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__label = label !== null && label !== void 0 ? label : "";
        this.__htmlSeparator = new qx.ui.embed.Html("");
        this.__htmlSeparator.setAllowGrowX(true);
        this.__render();
        this._add(this.__htmlSeparator);
    }
    __escapeHtml(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
    __render() {
        const isHorizontal = this.__orientation === "horizontal";
        const baseClasses = isHorizontal
            ? "divider w-full"
            : "divider divider-horizontal h-full";
        const roleAttr = this.__decorative ? "" : 'role="separator"';
        const ariaOrientation = this.__decorative
            ? ""
            : `aria-orientation="${this.__orientation}"`;
        const content = this.__label ? this.__escapeHtml(this.__label) : "";
        this.__htmlSeparator.setHtml(`
      <div class="${baseClasses} ${this.__className}" ${roleAttr} ${ariaOrientation}>
        ${content}
      </div>
    `);
    }
    setLabel(value) {
        this.__label = value !== null && value !== void 0 ? value : "";
        this.__render();
        return this;
    }
}
class BsSidebarAccount extends qx.ui.basic.Atom {
    constructor(name, username, avatarSrc, avatarFallback, className) {
        super();
        this.__collapsed = false;
        this.__buttonEl = null;
        this.__avatarEl = null;
        this.__avatarFallbackEl = null;
        this.__hasImageError = false;
        this.__isMenuOpen = false;
        this.__outsideClickHandler = null;
        this.__rootClickHandler = null;
        this.__boundRootEl = null;
        this.__menuAnimToken = 0;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.__htmlButton = new qx.ui.embed.Html("");
        this.__htmlButton.setAllowGrowX(true);
        this.__menuPopup = new qx.ui.popup.Popup(new qx.ui.layout.Grow());
        this.__menuPopup.setAutoHide(false);
        this.__menuPopup.setDomMove(true);
        this.__menuPopup.setZIndex(100000);
        this.__menuPopup.setAllowGrowX(false);
        this.__menuPopup.setAllowGrowY(true);
        this.__menuPopup.setPadding(0);
        this.__menuPopup.setBackgroundColor("transparent");
        this.__menuPopup.setDecorator(new qx.ui.decoration.Decorator().set({
            width: 1,
            style: "solid",
            color: AppColors.border(),
            radius: 10,
            shadowVerticalLength: 2,
            shadowBlurRadius: 10,
            shadowColor: AppColors.overlay(0.1),
        }));
        this.__menuContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
        this.__menuContainer.set({
            minWidth: 224,
            paddingTop: 6,
            paddingRight: 6,
            paddingBottom: 6,
            paddingLeft: 6,
            backgroundColor: AppColors.card(),
            textColor: AppColors.foreground(),
        });
        this.__menuPopup.add(this.__menuContainer);
        this.__buildMenuWidgets();
        this.__chevronUpDownIcon = new InlineSvgIcon("chevrons-up-down", 16);
        this.__chevronUpDownHTML = this.__chevronUpDownIcon.getHtml();
        this.__chevronUpDownIcon.addListener("changeHtml", () => {
            this.__chevronUpDownHTML = this.__chevronUpDownIcon.getHtml();
            this.__renderButton();
        });
        this.__name = name !== null && name !== void 0 ? name : "Ronan Berder";
        this.__username = username !== null && username !== void 0 ? username : "@hunvreus";
        this.__avatarSrc = avatarSrc !== null && avatarSrc !== void 0 ? avatarSrc : "resource/app/user.png";
        this.__avatarFallback = avatarFallback !== null && avatarFallback !== void 0 ? avatarFallback : "RB";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__renderButton();
        this._add(this.__htmlButton);
        this.__htmlButton.addListener("appear", () => {
            this.__bindNativeButton();
        });
        this.__menuPopup.addListener("disappear", () => {
            if (!this.__isMenuOpen)
                return;
            this.__isMenuOpen = false;
            this.__renderButton();
        });
        this.addListener("disappear", () => {
            this.__isMenuOpen = false;
            this.__unbindOutsideClick();
            this.__unbindNativeButton();
            this.__menuPopup.hide();
            this.__renderButton();
        });
    }
    __escape(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
    __bindNativeButton() {
        var _a, _b, _c;
        const root = this.__htmlButton.getContentElement().getDomElement();
        if (!root)
            return;
        if (this.__boundRootEl !== root) {
            this.__unbindNativeButton();
            this.__rootClickHandler = (ev) => {
                const target = ev.target;
                if (!target)
                    return;
                const trigger = target.closest("[data-account-trigger]");
                if (!trigger)
                    return;
                ev.preventDefault();
                ev.stopPropagation();
                this.fireEvent("execute");
                this.__toggleMenu();
            };
            root.addEventListener("click", this.__rootClickHandler);
            this.__boundRootEl = root;
        }
        const btn = (_a = root === null || root === void 0 ? void 0 : root.querySelector("[data-account-trigger]")) !== null && _a !== void 0 ? _a : null;
        this.__buttonEl = btn;
        if (!this.__buttonEl)
            return;
        this.__avatarEl =
            (_b = root === null || root === void 0 ? void 0 : root.querySelector("img")) !== null && _b !== void 0 ? _b : null;
        this.__avatarFallbackEl =
            (_c = root === null || root === void 0 ? void 0 : root.querySelector("[data-avatar-fallback]")) !== null && _c !== void 0 ? _c : null;
        if (this.__avatarEl) {
            this.__avatarEl.onerror = () => {
                this.__hasImageError = true;
                this.__syncAvatarFallback();
            };
            this.__avatarEl.onload = () => {
                this.__hasImageError = false;
                this.__syncAvatarFallback();
            };
        }
        this.__syncAvatarFallback();
    }
    __unbindNativeButton() {
        if (this.__boundRootEl && this.__rootClickHandler) {
            this.__boundRootEl.removeEventListener("click", this.__rootClickHandler);
        }
        this.__boundRootEl = null;
        this.__rootClickHandler = null;
    }
    __toggleMenu() {
        if (this.__isMenuOpen) {
            this.__closeMenu();
            return;
        }
        this.__openMenu();
    }
    __closeMenu() {
        if (!this.__isMenuOpen)
            return;
        this.__isMenuOpen = false;
        this.__unbindOutsideClick();
        const token = ++this.__menuAnimToken;
        this.__setPopupAnimationStyles({
            opacity: "0",
            transform: "translateY(-4px) scale(0.98)",
            transition: "opacity 100ms ease, transform 120ms ease",
            pointerEvents: "none",
        });
        qx.event.Timer.once(() => {
            if (token !== this.__menuAnimToken)
                return;
            this.__menuPopup.hide();
            this.__renderButton();
        }, this, 120);
    }
    __openMenu() {
        const token = ++this.__menuAnimToken;
        this.__menuPopup.show();
        this.__isMenuOpen = true;
        this.__renderButton();
        this.__bindOutsideClick();
        this.__placeMenuPopup();
        this.__setPopupAnimationStyles({
            opacity: "0",
            transform: "translateY(-6px) scale(0.985)",
            transition: "opacity 120ms ease, transform 140ms cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: "auto",
            transformOrigin: this.__collapsed ? "top right" : "top left",
        });
        qx.event.Timer.once(() => {
            if (token !== this.__menuAnimToken)
                return;
            this.__placeMenuPopup();
            this.__setPopupAnimationStyles({
                opacity: "1",
                transform: "translateY(0) scale(1)",
            });
        }, this, 0);
    }
    __setPopupAnimationStyles(styles) {
        const popupElement = this.__menuPopup.getContentElement();
        if (!(popupElement === null || popupElement === void 0 ? void 0 : popupElement.setStyle))
            return;
        for (const key in styles) {
            if (!Object.prototype.hasOwnProperty.call(styles, key))
                continue;
            popupElement.setStyle(key, styles[key]);
        }
    }
    __bindOutsideClick() {
        if (this.__outsideClickHandler)
            return;
        this.__outsideClickHandler = (ev) => {
            const target = ev.target;
            if (!target)
                return;
            const triggerRoot = this.__htmlButton.getContentElement().getDomElement();
            const popupRoot = this.__menuPopup.getContentElement().getDomElement();
            const clickedTrigger = !!triggerRoot && triggerRoot.contains(target);
            const clickedPopup = !!popupRoot && popupRoot.contains(target);
            if (!clickedTrigger && !clickedPopup)
                this.__closeMenu();
        };
        document.addEventListener("mousedown", this.__outsideClickHandler, true);
    }
    __unbindOutsideClick() {
        if (!this.__outsideClickHandler)
            return;
        document.removeEventListener("mousedown", this.__outsideClickHandler, true);
        this.__outsideClickHandler = null;
    }
    __placeMenuPopup() {
        var _a;
        const triggerRoot = this.__htmlButton.getContentElement().getDomElement();
        const triggerEl = (_a = triggerRoot === null || triggerRoot === void 0 ? void 0 : triggerRoot.querySelector("[data-account-trigger]")) !== null && _a !== void 0 ? _a : null;
        if (!triggerEl)
            return;
        const triggerRect = triggerEl.getBoundingClientRect();
        const popupEl = this.__menuPopup.getContentElement().getDomElement();
        if (!popupEl)
            return;
        const popupRect = popupEl.getBoundingClientRect();
        const gap = 6;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        let left;
        let top;
        if (this.__collapsed) {
            const preferredLeft = Math.round(triggerRect.right - popupRect.width);
            left = Math.min(Math.max(8, preferredLeft), Math.max(8, viewportWidth - popupRect.width - 8));
            const preferredTop = Math.round(triggerRect.bottom + gap);
            top = Math.min(Math.max(8, preferredTop), Math.max(8, viewportHeight - popupRect.height - 8));
        }
        else {
            const preferredLeft = Math.round(triggerRect.left);
            left = Math.min(Math.max(8, preferredLeft), Math.max(8, viewportWidth - popupRect.width - 8));
            const preferredTop = Math.round(triggerRect.top - popupRect.height - gap);
            const fallbackTop = Math.round(triggerRect.bottom + gap);
            const hasSpaceAbove = preferredTop >= 8;
            top = hasSpaceAbove
                ? preferredTop
                : Math.min(Math.max(8, fallbackTop), Math.max(8, viewportHeight - popupRect.height - 8));
        }
        this.__menuPopup.moveTo(left, top);
    }
    __buildMenuWidgets() {
        const heading = new qx.ui.basic.Label("My Account");
        heading.set({
            paddingTop: 4,
            paddingRight: 8,
            paddingBottom: 4,
            paddingLeft: 8,
            textColor: AppColors.mutedForeground(),
        });
        this.__menuContainer.add(heading);
        this.__menuContainer.add(this.__createMenuButton("Profile", new InlineSvgIcon("user-cog", 16), "⇧⌘P"));
        this.__menuContainer.add(this.__createMenuButton("Settings", new InlineSvgIcon("settings", 16), "⌘S"));
        const separator = new qx.ui.core.Widget();
        separator.set({
            height: 1,
            marginTop: 4,
            marginBottom: 4,
            backgroundColor: AppColors.border(),
        });
        this.__menuContainer.add(separator);
        this.__menuContainer.add(this.__createMenuButton("Log out", new InlineSvgIcon("log-out", 16), "logout-account"));
    }
    __createMenuButton(label, icon, action) {
        const button = new BsSidebarButton(`${label}`, icon, "btn-sm-outline");
        button.setAllowGrowX(true);
        button.setHeight(40);
        button.onClick(() => {
            const normalizedAction = action === "logout-account" ? "logout" : action;
            this.fireDataEvent("action", normalizedAction);
            this.__closeMenu();
        });
        return button;
    }
    __syncAvatarFallback() {
        if (!this.__avatarFallbackEl)
            return;
        const shouldShow = !this.__avatarSrc || this.__hasImageError;
        this.__avatarFallbackEl.style.display = shouldShow ? "flex" : "none";
    }
    __renderButton() {
        const name = this.__escape(this.__name);
        const username = this.__escape(this.__username);
        const avatarSrc = this.__escape(this.__avatarSrc);
        const avatarFallback = this.__escape(this.__avatarFallback);
        const chevronUpDown = this.__chevronUpDownHTML;
        const contentPart = this.__collapsed
            ? `
        <span class="relative inline-flex size-8 shrink-0 rounded-full overflow-hidden">
          <img class="size-full object-cover" alt="${name}" src="${avatarSrc}" />
          <span class="absolute inset-0 hidden items-center justify-center bg-muted text-muted-foreground text-xs font-medium" data-avatar-fallback>
            ${avatarFallback}
          </span>
        </span>
      `
            : `
        <span class="relative inline-flex size-8 shrink-0 rounded-full overflow-hidden">
          <img class="size-full object-cover" alt="${name}" src="${avatarSrc}" />
          <span class="absolute inset-0 hidden items-center justify-center bg-muted text-muted-foreground text-xs font-medium" data-avatar-fallback>
            ${avatarFallback}
          </span>
        </span>
        <span class="min-w-0 flex-1 text-left">
          <span class="block truncate text-sm font-medium text-foreground leading-tight">${name}</span>
          <span class="block truncate text-xs text-muted-foreground leading-tight">${username}</span>
        </span>
        <span class="flex flex-col text-muted-foreground leading-none items-center justify-center">
          ${chevronUpDown}
        </span>
      `;
        const classes = [
            "w-full",
            "h-10",
            "flex",
            "items-center",
            "gap-2",
            "rounded-md",
            "btn-sm-ghost",
            this.__collapsed ? "px-0 py-0" : "px-0.5",
            this.__collapsed ? "py-0" : "py-1.5",
            this.__collapsed ? "justify-center" : "justify-start",
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        this.__htmlButton.setHtml(`
      <div class="${this.__collapsed ? "p-0" : "p-1"} relative" data-account-root data-account-open="${this.__isMenuOpen ? "true" : "false"}">
        <button
          type="button"
          data-account-trigger
          aria-haspopup="menu"
          aria-expanded="${this.__isMenuOpen ? "true" : "false"}"
          class="${classes}"
        >
          ${contentPart}
        </button>
      </div>
    `);
        this.__bindNativeButton();
    }
    setCollapsed(collapsed) {
        this.__collapsed = collapsed;
        if (collapsed)
            this.__closeMenu();
        this.__renderButton();
        return this;
    }
    setName(name) {
        this.__name = name !== null && name !== void 0 ? name : "";
        this.__renderButton();
        return this;
    }
    setUsername(username) {
        this.__username = username !== null && username !== void 0 ? username : "";
        this.__renderButton();
        return this;
    }
    setAvatar(src, fallback) {
        this.__avatarSrc = src !== null && src !== void 0 ? src : "";
        this.__hasImageError = false;
        if (typeof fallback === "string")
            this.__avatarFallback = fallback;
        this.__renderButton();
        return this;
    }
    onAction(handler) {
        this.addListener("action", (ev) => {
            var _a;
            handler((_a = ev.getData()) !== null && _a !== void 0 ? _a : "");
        });
        return this;
    }
    onClick(handler) {
        this.addListener("execute", handler);
        return this;
    }
}
BsSidebarAccount.events = {
    execute: "qx.event.type.Event",
    action: "qx.event.type.Data",
};
class BsSidebarButton extends qx.ui.basic.Atom {
    constructor(text, icon, className) {
        super();
        this.__trailingHtml = "";
        this.__active = false;
        this.__collapsed = false;
        this.__centered = false;
        this.__buttonEl = null;
        this.__renderPending = false;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.__htmlButton = new qx.ui.embed.Html("");
        this.__htmlButton.setAllowGrowX(true);
        this.__iconHtml = icon ? icon.getHtml() : "";
        this.__buttonText = text !== null && text !== void 0 ? text : "";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__renderButton();
        this._add(this.__htmlButton);
        this.__htmlButton.addListener("tap", () => this.fireEvent("execute"));
        this.__htmlButton.addListenerOnce("appear", () => {
            this.__bindNativeButton();
        });
        if (icon) {
            icon.addListener("changeHtml", () => {
                this.__iconHtml = icon.getHtml();
                this.__renderButton();
            });
        }
    }
    __bindNativeButton() {
        var _a;
        const root = this.__htmlButton.getContentElement().getDomElement();
        const btn = (_a = root === null || root === void 0 ? void 0 : root.querySelector("button")) !== null && _a !== void 0 ? _a : null;
        this.__buttonEl = btn;
        if (!this.__buttonEl)
            return;
    }
    __renderButton() {
        const iconPart = this.__iconHtml ? `<span>${this.__iconHtml}</span>` : "";
        const textPart = this.__collapsed ? "" : this.__buttonText;
        const trailingPart = !this.__collapsed && this.__trailingHtml
            ? `<span style="margin-left:auto;opacity:0.75;line-height:1">${this.__trailingHtml}</span>`
            : "";
        const activeClass = this.__active
            ? "font-semibold btn-sm-primary"
            : "btn-sm-ghost";
        const layoutClass = this.__collapsed
            ? "justify-center"
            : this.__centered
                ? "justify-center relative"
                : "justify-start";
        const classes = [
            "w-full",
            "items-center",
            "gap-2",
            "transition",
            "duration-200",
            "ease-in-out",
            "border-sidebar-border",
            "select-none",
            layoutClass,
            activeClass,
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        const centeredIconPart = this.__centered && this.__iconHtml
            ? `<span style="position:absolute;left:8px;display:flex;align-items:center">${this.__iconHtml}</span>`
            : iconPart;
        this.__htmlButton.setHtml(`
      <div class="p-1">
        <button
          type="button"
          class="${classes}"
        >
          ${centeredIconPart}
          ${textPart}
          ${trailingPart}
        </button>
      </div>
    `);
        qx.event.Timer.once(() => this.__bindNativeButton(), this, 0);
    }
    setActive(active) {
        if (this.__active === active)
            return this;
        this.__active = active;
        this.__scheduleRender();
        return this;
    }
    setCollapsed(collapsed) {
        if (this.__collapsed === collapsed)
            return this;
        this.__collapsed = collapsed;
        this.__scheduleRender();
        return this;
    }
    onClick(handler) {
        this.addListener("execute", handler);
        return this;
    }
    setText(text) {
        if (this.__buttonText === text)
            return this;
        this.__buttonText = text;
        this.__scheduleRender();
        return this;
    }
    setCentered(centered) {
        if (this.__centered === centered)
            return this;
        this.__centered = centered;
        this.__scheduleRender();
        return this;
    }
    setTrailingHtml(html) {
        if (this.__trailingHtml === html)
            return this;
        this.__trailingHtml = html;
        this.__scheduleRender();
        return this;
    }
    __scheduleRender() {
        if (this.__renderPending)
            return;
        this.__renderPending = true;
        queueMicrotask(() => {
            this.__renderPending = false;
            this.__renderButton();
        });
    }
}
BsSidebarButton.events = {
    execute: "qx.event.type.Event",
};
class BsTextarea extends qx.ui.basic.Atom {
    constructor(value, placeholder, className, rows = 4) {
        super();
        this.__textareaEl = null;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.setFocusable(true);
        this.__value = value !== null && value !== void 0 ? value : "";
        this.__placeholder = placeholder !== null && placeholder !== void 0 ? placeholder : "";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__rows = rows;
        this.__htmlTextarea = new qx.ui.embed.Html("");
        this.__htmlTextarea.setAllowGrowX(true);
        this.__render();
        this._add(this.__htmlTextarea);
        this.__htmlTextarea.addListenerOnce("appear", () => {
            this.__bindNativeTextarea();
        });
        this.addListener("focusin", () => { var _a; return (_a = this.__textareaEl) === null || _a === void 0 ? void 0 : _a.focus(); });
        this.addListener("changeTabIndex", () => this.__syncTabIndex());
    }
    __bindNativeTextarea() {
        var _a;
        const root = this.__htmlTextarea.getContentElement().getDomElement();
        this.__textareaEl =
            (_a = root === null || root === void 0 ? void 0 : root.querySelector("textarea")) !== null && _a !== void 0 ? _a : null;
        if (!this.__textareaEl)
            return;
        this.__syncTabIndex();
        this.__textareaEl.oninput = () => {
            var _a, _b;
            const next = (_b = (_a = this.__textareaEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "";
            const prev = this.__value;
            this.__value = next;
            this.fireDataEvent("input", next);
            if (prev !== next)
                this.fireDataEvent("changeValue", next);
        };
    }
    __syncTabIndex() {
        if (!this.__textareaEl)
            return;
        this.__textareaEl.setAttribute("tabindex", "-1");
    }
    __escapeAttr(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
    __render() {
        const classes = [
            "textarea",
            "bg-card",
            "text-foreground",
            "border-border",
            "placeholder:text-muted-foreground",
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        const value = this.__escapeAttr(this.__value);
        const placeholder = this.__escapeAttr(this.__placeholder);
        const tabIndexAttr = 'tabindex="-1"';
        this.__htmlTextarea.setHtml(`
      <div class="p-1">
        <textarea
          class="${classes}"
          placeholder="${placeholder}"
          rows="${this.__rows}"
          ${tabIndexAttr}
        >${value}</textarea>
      </div>
    `);
        qx.event.Timer.once(() => this.__bindNativeTextarea(), this, 0);
    }
    getValue() {
        var _a, _b;
        return (_b = (_a = this.__textareaEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : this.__value;
    }
    setValue(value) {
        this.__value = value !== null && value !== void 0 ? value : "";
        if (this.__textareaEl)
            this.__textareaEl.value = this.__value;
        else
            this.__render();
        return this;
    }
    setPlaceholder(value) {
        this.__placeholder = value !== null && value !== void 0 ? value : "";
        if (this.__textareaEl)
            this.__textareaEl.placeholder = this.__placeholder;
        else
            this.__render();
        return this;
    }
    setRows(rows) {
        this.__rows = rows;
        if (this.__textareaEl)
            this.__textareaEl.rows = rows;
        else
            this.__render();
        return this;
    }
    onInput(handler) {
        this.addListener("input", (ev) => {
            var _a;
            handler((_a = ev.getData()) !== null && _a !== void 0 ? _a : "");
        });
        return this;
    }
}
BsTextarea.events = {
    input: "qx.event.type.Data",
    changeValue: "qx.event.type.Data",
};
function showAboutDialog() {
    const aboutContent = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    aboutContent.setBackgroundColor(AppColors.card());
    const aboutTable = new qx.ui.container.Composite(new qx.ui.layout.Grid(8, 14));
    const tableLayout = aboutTable.getLayout();
    tableLayout.setColumnFlex(1, 1);
    const headerLabel = new qx.ui.basic.Label("SIAS Online v3.7.3.2").set({
        font: new qx.bom.Font("16", ["Inter", "sans-serif"]).set({ bold: true }),
        textColor: AppColors.primary(),
    });
    const headerTitle = new qx.ui.basic.Label("Copyright @ 2014 - 2020 Digital Software").set({
        font: new qx.bom.Font("14", ["Inter", "sans-serif"]).set({ bold: true })
    });
    aboutTable.add(new qx.ui.basic.Label("Chief Architect"), { row: 1, column: 0 });
    aboutTable.add(new qx.ui.basic.Label("Thomas C. Saddul, BSMath, MCS, MSIT").set({
        font: new qx.bom.Font("14", ["Inter", "sans-serif"]).set({ bold: true }),
    }), {
        row: 1,
        column: 1,
    });
    aboutTable.add(new qx.ui.basic.Label("Website"), { row: 2, column: 0 });
    aboutTable.add(new qx.ui.basic.Label("https://www.digisoftph.com").set({
        rich: true,
        font: new qx.bom.Font("14", ["Inter", "sans-serif"]).set({ bold: true }),
    }), { row: 2, column: 1 });
    aboutTable.add(new qx.ui.basic.Label("Facebook"), { row: 3, column: 0 });
    aboutTable.add(new qx.ui.basic.Label("https://www.facebook.com/digisoftph").set({
        rich: true,
        font: new qx.bom.Font("14", ["Inter", "sans-serif"]).set({ bold: true }),
    }), { row: 3, column: 1 });
    aboutContent.add(headerLabel);
    aboutContent.add(headerTitle);
    aboutContent.add(aboutTable);
    BsAlertDialog.show({
        title: "About",
        children: aboutContent,
        cancelLabel: "Okay",
        footerButtons: "cancel",
    });
}
class LoginLayout extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(12).set({ alignX: "center", alignY: "middle" }));
        this.setBackgroundColor(AppColors.background());
        const card = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
        card.setWidth(350);
        card.setAllowGrowX(false);
        card.setPadding(20);
        card.setBackgroundColor(AppColors.card());
        card.setDecorator(new qx.ui.decoration.Decorator().set({
            width: 1,
            style: "solid",
            color: AppColors.border(),
            radius: 10,
        }));
        const schoolLogo = new qx.ui.basic.Image("resource/app/app_logo.png");
        schoolLogo.setAlignX("center");
        schoolLogo.set({
            scale: true,
            width: 64,
            height: 64,
        });
        card.add(schoolLogo);
        const title = new qx.ui.basic.Label("Aldersgate College Inc.");
        title.setTextAlign("center");
        title.setAlignX("center");
        title.setAllowGrowX(true);
        title.setFont(
        // @ts-ignore
        new qx.bom.Font(16, ["Inter", "sans-serif"]).set({ bold: true }));
        title.setTextColor(AppColors.foreground());
        title.setMarginBottom(10);
        card.add(title);
        const location = new qx.ui.basic.Label("Solano, Nueva Vizcaya");
        location.setTextAlign("center");
        location.setAlignX("center");
        location.setAllowGrowX(true);
        location.setFont(
        // @ts-ignore
        new qx.bom.Font(12, ["Inter", "sans-serif"]).set({ bold: true }));
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
        const onKeyDown = (event) => {
            if (event.key !== "Enter")
                return;
            const activeElement = document.activeElement;
            const cardElement = card.getContentElement().getDomElement();
            if (!activeElement ||
                !cardElement ||
                !cardElement.contains(activeElement))
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
LoginLayout.events = {
    login: "qx.event.type.Event",
};
class MainLayout extends qx.ui.container.Composite {
    constructor(content, sidebarItems, pageMap, pageTitle) {
        super();
        this.setLayout(new qx.ui.layout.Grow());
        this.setBackgroundColor(AppColors.background());
        const MOBILE_BREAKPOINT = 768;
        let isSidebarCollapsed = false;
        let isMobileMode = qx.bom.Viewport.getWidth() < MOBILE_BREAKPOINT;
        let drawer = null;
        const sidebar = new Sidebar(sidebarItems, pageTitle);
        const contentContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        const mobileTopBar = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({ alignY: "middle" }));
        mobileTopBar.set({
            paddingTop: 8,
            paddingRight: 6,
            paddingBottom: 8,
            paddingLeft: 10,
            minHeight: 48,
            backgroundColor: AppColors.background(),
        });
        mobileTopBar.setDecorator(new qx.ui.decoration.Decorator().set({
            widthBottom: 1,
            styleBottom: "solid",
            colorBottom: AppColors.border(),
        }));
        const mobileSchoolLogo = new qx.ui.basic.Image("resource/app/app_logo.png");
        mobileSchoolLogo.set({
            scale: true,
            width: 32,
            height: 32,
        });
        mobileTopBar.add(mobileSchoolLogo);
        mobileTopBar.add(new qx.ui.core.Spacer(), { flex: 1 });
        const mobileAccount = new BsSidebarAccount("User", // TODO: replace with actual username
        "role", // TODO: replace with actual role
        "resource/app/user.png", "RB", "px-0 py-0");
        mobileAccount.setCollapsed(true);
        mobileAccount.setAllowGrowX(false);
        mobileAccount.setAlignY("middle");
        const mobileAccountSlot = new qx.ui.container.Composite(new qx.ui.layout.Grow());
        mobileAccountSlot.setAllowGrowX(false);
        mobileAccountSlot.setAlignY("middle");
        mobileAccountSlot.setWidth(40);
        mobileAccountSlot.setHeight(40);
        mobileAccountSlot.add(mobileAccount);
        mobileAccount.onAction((action) => {
            if (action === "logout")
                this.fireEvent("logout");
        });
        mobileTopBar.add(mobileAccountSlot);
        mobileTopBar.exclude();
        const desktopShell = new qx.ui.container.Composite(new qx.ui.layout.HBox());
        const mountDesktop = () => {
            drawer === null || drawer === void 0 ? void 0 : drawer.close();
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
            drawer = new BsDrawer(contentContainer, sidebar);
            this.removeAll();
            this.add(drawer);
        };
        const navbar = new Navbar(pageTitle, () => {
            if (isMobileMode) {
                drawer === null || drawer === void 0 ? void 0 : drawer.toggle();
            }
            else {
                isSidebarCollapsed = !isSidebarCollapsed;
                sidebar.setCollapsed(isSidebarCollapsed);
            }
        });
        contentContainer.add(mobileTopBar);
        contentContainer.add(navbar);
        const mainContentContainer = new qx.ui.container.Composite(new qx.ui.layout.Grow());
        const mainContentScroll = new qx.ui.container.Scroll();
        const pageCache = new Map();
        if (pageTitle) {
            pageCache.set(pageTitle, content);
        }
        let currentPage = content;
        const getPage = (label) => {
            const cached = pageCache.get(label);
            if (cached)
                return cached;
            const factory = pageMap.get(label);
            if (!factory)
                return null;
            const page = factory();
            pageCache.set(label, page);
            return page;
        };
        mainContentContainer.setPadding(10);
        mainContentContainer.add(content, { edge: 0 });
        globalThis.setContent = (contentOrFactory, title) => {
            const nextPage = typeof contentOrFactory === "function"
                ? contentOrFactory()
                : contentOrFactory;
            if (nextPage === currentPage)
                return;
            mainContentContainer.removeAll();
            mainContentContainer.add(nextPage, { edge: 0 });
            currentPage = nextPage;
            if (title)
                navbar.setPageTitle(title);
            if (isMobileMode)
                drawer === null || drawer === void 0 ? void 0 : drawer.close();
        };
        sidebar.addListener("select", (ev) => {
            const label = ev.getData();
            const nextPage = getPage(label);
            if (!nextPage)
                return;
            globalThis.setContent(nextPage, label);
        });
        sidebar.addListener("action", (ev) => {
            if (ev.getData() === "logout") {
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
            }
            else {
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
MainLayout.events = {
    logout: "qx.event.type.Event",
};
const PAGE_DEFINITIONS = [
    {
        label: "Buttons",
        iconName: "book-open",
        element: () => new ButtonsPage(),
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
        label: "Tables",
        iconName: "calendar",
        element: () => new TablePage(),
    },
    {
        label: "Toolbar",
        iconName: "clock",
        element: () => new ToolBarPage(),
    },
    {
        label: "Windows",
        iconName: "circle",
        element: () => new WindowsPage(),
    },
];
const SIDEBAR_DEFINITIONS = [
    {
        label: "Items",
        iconName: "graduation-cap",
        children: [
            {
                label: "Forms & inputs",
                iconName: "layout-grid",
                children: [
                    {
                        label: "Buttons",
                        iconName: "book-open",
                    },
                    {
                        label: "Controls",
                        iconName: "users",
                    },
                    {
                        label: "Forms",
                        iconName: "door-open",
                    },
                ],
            },
            {
                label: "Data & windows",
                iconName: "panels-top-left",
                children: [
                    {
                        label: "Tables",
                        iconName: "calendar",
                    },
                    {
                        label: "Toolbar",
                        iconName: "clock",
                    },
                    {
                        label: "Windows",
                        iconName: "circle",
                    },
                ],
            },
        ],
    },
];
function createSidebarItems(definitions = SIDEBAR_DEFINITIONS) {
    const createItems = (items) => {
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
function manipulateSidebarItems(items, pageMap) {
    const normalizeItems = (source) => {
        const normalizedItems = [];
        source.forEach((item) => {
            if (item.hidden)
                return;
            const normalizedLabel = item.label.trim();
            const normalizedChildren = item.children
                ? normalizeItems(item.children)
                : undefined;
            const isLeaf = !normalizedChildren || normalizedChildren.length === 0;
            if (isLeaf && !pageMap.has(normalizedLabel))
                return;
            normalizedItems.push(Object.assign(Object.assign({}, item), { label: normalizedLabel, children: normalizedChildren && normalizedChildren.length > 0
                    ? normalizedChildren
                    : undefined }));
        });
        return normalizedItems;
    };
    return normalizeItems(items);
}
class ButtonsPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(10));
        const button1 = new qx.ui.form.Button("Hello", "resource/app/internet-web-browser.png");
        const button2 = new qx.ui.form.Button("Dark Theme", "resource/app/preferences-theme.png");
        const button3 = new qx.ui.form.Button("Light Theme", "resource/app/preferences-theme.png");
        const button4 = new qx.ui.form.Button("Change Layout", "@MaterialIcons/face"); // use an icon font
        const meta = qx.theme.manager.Meta.getInstance();
        button1.addListener("execute", function () {
            alert("Hello World!");
        });
        button2.addListener("execute", function () {
            meta.setTheme(qx.theme.TangibleDark);
        });
        button3.addListener("execute", function () {
            meta.setTheme(qx.theme.TangibleLight);
        });
        button4.addListener("execute", function () {
            container.getLayout() == layout1
                ? container.setLayout(layout2)
                : container.setLayout(layout1);
        });
        const layout1 = new qx.ui.layout.HBox();
        const layout2 = new qx.ui.layout.VBox();
        const container = new qx.ui.container.Composite(layout1);
        container.add(button1);
        container.add(button2);
        container.add(button3);
        container.add(button4);
        this.add(container);
    }
}
class ControlPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(20));
        this.vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
        this.add(this.vbox, { top: 0 });
        this.initWidgets();
    }
    initWidgets() {
        // ColorSelector
        var label = new qx.ui.basic.Label("ColorSelector");
        var colorSelector = new qx.ui.control.ColorSelector();
        this.vbox.add(label);
        this.vbox.add(colorSelector);
        // ColorPopup
        label = new qx.ui.basic.Label("ColorPopup");
        var colorPopup = new qx.ui.control.ColorPopup();
        colorPopup.exclude();
        var openColorPopup = new qx.ui.form.Button("Open Color Popup").set({
            maxWidth: 150,
        });
        this.vbox.add(label);
        this.vbox.add(openColorPopup);
        openColorPopup.addListener("execute", function () {
            colorPopup.placeToWidget(openColorPopup, true);
            colorPopup.show();
        });
        // DateChooser
        var dateChooser = new qx.ui.control.DateChooser().set({ maxWidth: 240 });
        label = new qx.ui.basic.Label("DateChooser");
        this.vbox.add(label);
        this.vbox.add(dateChooser);
    }
}
class FormPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(20).set({ alignX: "stretch" }));
        const form = new qx.ui.form.Form();
        this.addSection1(form);
        this.addSection2(form);
        // send button with validation
        const sendButton = new qx.ui.form.Button("Send");
        sendButton.addListener("execute", function () {
            if (form.validate()) {
                alert("send...");
            }
        }, this);
        form.addButton(sendButton);
        // reset button
        const resetButton = new qx.ui.form.Button("Reset");
        resetButton.addListener("execute", function () {
            form.reset("");
        }, this);
        form.addButton(resetButton);
        const formRenderer = new qx.ui.form.renderer.Single(form);
        this.add(formRenderer);
        this.add(this.__buildBasecoatDemoSection());
    }
    __buildBasecoatDemoSection() {
        const section = new qx.ui.container.Composite(new qx.ui.layout.VBox(16).set({ alignX: "stretch" }));
        section.set({ paddingTop: 8 });
        const toastHost = new BsToast();
        const heading = new qx.ui.basic.Label("Basecoat widgets (Bs*)");
        heading.set({ font: "bold" });
        section.add(heading);
        const dataHeading = new qx.ui.basic.Label("Data widgets");
        dataHeading.set({ font: "bold" });
        section.add(dataHeading);
        const dateLabel = new qx.ui.basic.Label("BsDateField");
        section.add(dateLabel);
        const dateField = new BsDateField();
        dateField.setMinHeight(44);
        dateField.addListener("changeValue", (e) => {
            const d = e.getData();
            toastHost.show({
                category: "info",
                title: "Date changed",
                description: d ? d.toDateString() : "Cleared",
                cancel: { label: "Dismiss" },
            });
        });
        section.add(dateField);
        const tableLabel = new qx.ui.basic.Label("BsTable (row click → toast, paginated)");
        section.add(tableLabel);
        const table = new BsTable("Sample inventory");
        table.setAllowGrowX(true);
        table.setMinHeight(260);
        table.setHeaders(["SKU", "Item", "Qty"]);
        const tableRows = [];
        for (let i = 1; i <= 22; i++) {
            tableRows.push([`SKU-${i}`, `Product ${i}`, String((i * 7) % 100)]);
        }
        table.setRows(tableRows);
        table.setPageSize(5);
        table.setPagination(true);
        table.addListener("rowClick", (e) => {
            const payload = e.getData();
            toastHost.show({
                category: "info",
                title: "Row selected",
                description: `Row index ${payload.rowIndex}`,
                cancel: { label: "Dismiss" },
            });
        });
        section.add(table);
        const agree = new BsCheckBox("I agree to the terms");
        section.add(agree);
        const radioGroup = new BsRadioButtonGroup();
        radioGroup.setGroupName("demo-plan");
        const rFree = new BsRadioButton("Free tier");
        rFree.setValue("free");
        const rPro = new BsRadioButton("Pro tier");
        rPro.setValue("pro");
        radioGroup.add(rFree);
        radioGroup.add(rPro);
        section.add(radioGroup);
        const combo = new BsComboBox();
        combo.add("Apple");
        combo.add("Banana");
        combo.add("Orange");
        section.add(combo);
        const sampleDialog = new BsDialog("Demo dialog", "Native dialog with Basecoat styling.");
        sampleDialog.setSectionContent("You can put forms or copy here.");
        const openDialogBtn = new BsButton("Open BsDialog", undefined, {
            variant: "outline",
        });
        openDialogBtn.onClick(() => sampleDialog.show());
        section.add(openDialogBtn);
        sampleDialog.addListener("save", () => {
            toastHost.show({
                category: "success",
                title: "Saved",
                description: "Save was clicked on the demo dialog.",
                cancel: { label: "Dismiss" },
            });
        });
        const toastBtn = new BsButton("Show BsToast", undefined, {
            variant: "secondary",
        });
        toastBtn.onClick(() => {
            toastHost.show({
                category: "info",
                title: "Toast",
                description: "Inline toaster demo.",
                cancel: { label: "Dismiss" },
            });
        });
        section.add(toastBtn);
        const host = new qx.ui.container.Composite(new qx.ui.layout.VBox(0).set({ alignX: "stretch" }));
        host.add(section);
        host.add(sampleDialog);
        host.add(toastHost);
        return host;
    }
    addSection1(form) {
        form.addGroupHeader("Registration");
        const userName = new qx.ui.form.TextField();
        userName.setRequired(true);
        form.add(userName, "Name");
        const password = new qx.ui.form.PasswordField();
        password.setRequired(true);
        form.add(password, "Password");
        form.add(new qx.ui.form.CheckBox(), "Save?");
    }
    addSection2(form) {
        // add the second header
        form.addGroupHeader("Personal Information");
        form.add(new qx.ui.form.Spinner(0, 50, 100), "Age");
        form.add(new qx.ui.form.TextField(), "Country");
        const genderBox = new qx.ui.form.SelectBox();
        genderBox.add(new qx.ui.form.ListItem("Man"));
        genderBox.add(new qx.ui.form.ListItem("Woman"));
        genderBox.add(new qx.ui.form.ListItem("Genderqueer/Non-Binary"));
        genderBox.add(new qx.ui.form.ListItem("Prefer not to disclose"));
        form.add(genderBox, "Gender");
        form.add(new qx.ui.form.TextArea(), "Bio");
    }
}
class MainPage extends qx.ui.container.Composite {
    constructor() {
        super();
        this.setLayout(new qx.ui.layout.Grow());
        this.setBackgroundColor(AppColors.background());
        const center = new qx.ui.container.Composite(new qx.ui.layout.VBox(12).set({ alignX: "center", alignY: "middle" }));
        const welcomeCard = new qx.ui.container.Composite(new qx.ui.layout.VBox(8).set({ alignX: "center" }));
        welcomeCard.setMaxWidth(520);
        welcomeCard.setMinWidth(0);
        welcomeCard.setAllowGrowX(true);
        welcomeCard.setPadding(24);
        welcomeCard.setBackgroundColor(AppColors.background());
        const name = "User";
        const title = new qx.ui.basic.Label(`Welcome, ${name}`);
        title.setTextColor(AppColors.mutedForeground());
        title.setTextAlign("center");
        title.setAlignX("center");
        title.setFont(
        // @ts-ignore
        new qx.bom.Font(26).set({ bold: true }));
        const subtitle = new qx.ui.basic.Label("SIAS Online — Class Scheduling & Faculty Management. Use the sidebar to manage subjects, faculty, rooms, semesters, and class schedules.");
        subtitle.setWidth(400);
        subtitle.setTextColor(AppColors.mutedForeground());
        subtitle.setTextAlign("center");
        subtitle.setWrap(true);
        subtitle.setAlignX("center");
        welcomeCard.add(title);
        welcomeCard.add(subtitle);
        const syncWelcomeCardWidth = () => {
            const width = Math.max(240, Math.min(520, qx.bom.Viewport.getWidth() - 32));
            welcomeCard.setWidth(width);
        };
        qx.event.Registration.addListener(window, "resize", syncWelcomeCardWidth);
        syncWelcomeCardWidth();
        center.add(welcomeCard);
        this.add(center);
    }
}
class TablePage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(20));
        const table = this.createTable();
        table.setFocusedCell(2, 5);
        this.add(table);
    }
    createTable() {
        const rowData = this.createRandomRows(500);
        const tableModel = new qx.ui.table.model.Simple();
        tableModel.setColumns(["ID", "A number", "A date", "Boolean"]);
        tableModel.setData(rowData);
        tableModel.setColumnEditable(1, true);
        tableModel.setColumnEditable(2, true);
        tableModel.setColumnSortable(3, false);
        const table = new qx.ui.table.Table(tableModel);
        table.set({
            width: 600,
            height: 400,
            decorator: null,
        });
        table
            .getSelectionModel()
            .setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);
        const tcm = table.getTableColumnModel();
        tcm.setDataCellRenderer(3, new qx.ui.table.cellrenderer.Boolean());
        tcm.setHeaderCellRenderer(2, new qx.ui.table.headerrenderer.Icon("resource/app/office-calendar.png", "A date"));
        return table;
    }
    /**
     * Create random rows for the table example
     */
    createRandomRows(rowCount) {
        const rowData = [];
        var nextId = 0;
        const now = new Date().getTime();
        var dateRange = 400 * 24 * 60 * 60 * 1000; // 400 days
        for (var row = 0; row < rowCount; row++) {
            const date = new Date(now + Math.random() * dateRange - dateRange / 2);
            rowData.push([
                nextId++,
                Math.random() * 10000,
                date,
                Math.random() > 0.5,
            ]);
        }
        return rowData;
    }
}
class ToolBarPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(20));
        this.add(this.getToolBar());
    }
    getToolBar() {
        const toolBar = new qx.ui.toolbar.ToolBar();
        toolBar.add(new qx.ui.toolbar.Button("Item 1"));
        toolBar.add(new qx.ui.toolbar.Button("Item 2"));
        toolBar.add(new qx.ui.toolbar.Separator());
        const menuButton = new qx.ui.toolbar.MenuButton("Menu");
        const menu = new qx.ui.menu.Menu();
        for (let n = 1; n < 5; n++)
            menu.add(new qx.ui.menu.Button("item-" + n));
        menuButton.setMenu(menu);
        toolBar.add(menuButton);
        const menuButton2 = new qx.ui.toolbar.MenuButton("ButtonMenu");
        menuButton2.setMenu(this.getButtonMenu());
        toolBar.add(menuButton2);
        return toolBar;
    }
    getButtonMenu() {
        const menu = new qx.ui.menu.Menu();
        const button = new qx.ui.menu.Button("Menu MenuButton", "icon/16/actions/document-new.png");
        const checkBox = new qx.ui.menu.CheckBox("Menu MenuCheckBox");
        const checkBoxChecked = new qx.ui.menu.CheckBox("Menu MenuCheckBox").set({
            value: true,
        });
        // RadioButton
        const radioButton = new qx.ui.menu.RadioButton("Menu RadioButton");
        // RadioButton (active)
        const radioButtonActive = new qx.ui.menu.RadioButton("Menu RadioButton").set({ value: true });
        menu.add(button);
        menu.add(checkBox);
        menu.add(checkBoxChecked);
        menu.add(radioButton);
        menu.add(radioButtonActive);
        return menu;
    }
}
function createTree() {
    // create the tree
    const tree = new qx.ui.tree.Tree();
    tree.set({ width: 150, height: 300 });
    const root = new qx.ui.tree.TreeFolder("root");
    root.setOpen(true);
    tree.setRoot(root);
    // Make some dummy entries
    for (let x = 1; x < 5; x++) {
        const folder = new qx.ui.tree.TreeFolder("folder-" + x);
        root.add(folder);
        for (let y = 1; y < 9; y++) {
            const file = new qx.ui.tree.TreeFolder("file-" + y);
            folder.add(file);
        }
    }
    const page = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
    page.add(tree);
    return page;
}
class WindowsPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(20));
        const desktop = new qx.ui.window.Desktop();
        for (let n = 1; n <= 5; n++) {
            const win = new qx.ui.window.Window("Window " + n);
            win.setShowStatusbar(true);
            win.setMinWidth(200);
            win.setDraggable(true);
            win.open();
            desktop.add(win, { left: n * 50, top: n * 50 });
        }
        this.add(desktop, { edge: 0, top: 0 });
    }
}
