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
            padding: 2,
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
        const header = new qx.ui.basic.Label("APP_NAME");
        this.__header = header;
        header.setFont(
        //@ts-ignore
        new qx.bom.Font(12).set({ bold: true }));
        header.setTextAlign("center");
        header.setPadding(5);
        header.setTextColor(AppColors.sidebarForeground());
        this.add(header);
        const appVersion = new qx.ui.basic.Label("APP_VERSION");
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
                if (item.disabled) {
                    button.setEnabled(false);
                }
                else {
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
        }
        else {
            const currentItems = this.__getCurrentLevelItems();
            currentItems.forEach((item) => {
                const hasChildren = !!item.children && item.children.length > 0;
                const row = this.__createListRow();
                const button = this.__createSidebarButton(item.label, item.icon, hasChildren);
                if (item.disabled) {
                    button.setEnabled(false);
                }
                else if (hasChildren) {
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
        this.__resizeObserver = null;
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
            this.__setupResizeObserver();
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
        if (this.__imgEl) {
            this.__imgEl.style.display = shouldShowFallback ? "none" : "block";
        }
    }
    __setupResizeObserver() {
        const root = this.__htmlAvatar.getContentElement().getDomElement();
        if (!root)
            return;
        this.__resizeObserver = new ResizeObserver(() => {
            this.scheduleLayoutUpdate();
        });
        this.__resizeObserver.observe(root);
        this.addListener("disappear", () => {
            var _a;
            (_a = this.__resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
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
            "flex",
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
class BsButton extends qx.ui.basic.Atom {
    constructor(text, icon, options) {
        var _a, _b, _c;
        super();
        this.__variant = "default";
        this.__size = "default";
        this.__buttonEl = null;
        this.__resizeObserver = null;
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
            this.__setupResizeObserver();
        });
        this.addListener("focusin", () => { var _a; return (_a = this.__buttonEl) === null || _a === void 0 ? void 0 : _a.focus(); });
        this.addListener("changeTabIndex", () => this.__syncTabIndex());
        this.addListener("changeEnabled", () => this.__syncDisabled());
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
        this.__syncMinWidth();
        this.__syncDisabled();
    }
    __syncMinWidth() {
        if (!this.__buttonEl)
            return;
        const width = this.__buttonEl.offsetWidth;
        if (width > 0) {
            this.setMinWidth(width);
        }
    }
    __syncTabIndex() {
        if (!this.__buttonEl)
            return;
        this.__buttonEl.setAttribute("tabindex", "-1");
    }
    __syncDisabled() {
        if (!this.__buttonEl)
            return;
        if (this.getEnabled()) {
            this.__buttonEl.removeAttribute("disabled");
        }
        else {
            this.__buttonEl.setAttribute("disabled", "true");
        }
    }
    __setupResizeObserver() {
        const root = this.__htmlButton.getContentElement().getDomElement();
        if (!root)
            return;
        this.__resizeObserver = new ResizeObserver(() => {
            this.scheduleLayoutUpdate();
        });
        this.__resizeObserver.observe(root);
        this.addListener("disappear", () => {
            var _a;
            (_a = this.__resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
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
        <button type="button" class="w-full ${classes}" ${tabIndexAttr} style="user-select:none">
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
class BsCard extends qx.ui.container.Composite {
    constructor(options) {
        super(new qx.ui.layout.VBox(0).set({ alignY: "middle", alignX: "center" }));
        this.__content = null;
        this.__resizeObserver = null;
        this.setAllowGrowX(true);
        this.setAllowGrowY(true);
        this.setBackgroundColor("var(--card)");
        this.setDecorator(new qx.ui.decoration.Decorator().set({
            radius: 8,
            style: "solid",
            width: 1,
            color: "var(--border)",
        }));
    }
    setContent(widget) {
        if (this.__content) {
            this.__content.dispose();
        }
        const layout = new qx.ui.layout.VBox(0).set({
            alignY: "middle",
            alignX: "center",
        });
        this.__content = new qx.ui.container.Composite(layout);
        this.__content.setAllowGrowX(true);
        this.__content.setAllowGrowY(true);
        this.__content.setPadding(24);
        this._add(this.__content);
        this.__content.add(widget);
        this.__setupResizeObserver();
        return this;
    }
    __setupResizeObserver() {
        var _a, _b, _c, _d;
        if (!this.__content)
            return;
        const root = (_d = (_b = (_a = this.__content).getContentElement) === null || _b === void 0 ? void 0 : (_c = _b.call(_a)).getDomElement) === null || _d === void 0 ? void 0 : _d.call(_c);
        if (!root) {
            qx.event.Timer.once(() => this.__setupResizeObserver(), this, 50);
            return;
        }
        this.__resizeObserver = new ResizeObserver(() => {
            this.scheduleLayoutUpdate();
        });
        this.__resizeObserver.observe(root);
        this.addListener("disappear", () => {
            var _a;
            (_a = this.__resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
    }
    removeContent() {
        if (this.__content) {
            this._remove(this.__content);
            this.__content.dispose();
            this.__content = null;
        }
        return this;
    }
}
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
        this.__resizeObserver = null;
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
            this.__setupResizeObserver();
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
    __setupResizeObserver() {
        const root = this.__htmlInput.getContentElement().getDomElement();
        if (!root)
            return;
        this.__resizeObserver = new ResizeObserver(() => {
            this.scheduleLayoutUpdate();
        });
        this.__resizeObserver.observe(root);
        this.addListener("disappear", () => {
            var _a;
            (_a = this.__resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
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
        this.__resizeObserver = null;
        this.setAllowGrowX(true);
        this.setAllowGrowY(true);
        this.__label = new qx.ui.basic.Label(labelText);
        this.__input = new BsInput(initialValue !== null && initialValue !== void 0 ? initialValue : "", placeholder !== null && placeholder !== void 0 ? placeholder : "", inputClassName);
        this.__input.setAllowGrowX(true);
        this.__input.setAllowGrowY(true);
        this.__error = new qx.ui.basic.Label("");
        this.__error.setVisibility("excluded");
        this.add(this.__label);
        this.add(this.__input);
        this.add(this.__error);
        this.__setupResizeObserver();
    }
    __setupResizeObserver() {
        var _a, _b, _c;
        const root = (_c = (_a = this.getContentElement) === null || _a === void 0 ? void 0 : (_b = _a.call(this)).getDomElement) === null || _c === void 0 ? void 0 : _c.call(_b);
        if (!root) {
            qx.event.Timer.once(() => this.__setupResizeObserver(), this, 50);
            return;
        }
        this.__resizeObserver = new ResizeObserver(() => {
            this.scheduleLayoutUpdate();
        });
        this.__resizeObserver.observe(root);
        this.addListener("disappear", () => {
            var _a;
            (_a = this.__resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
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
        this.__resizeObserver = null;
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
            this.__setupResizeObserver();
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
    __setupResizeObserver() {
        const root = this.__htmlInput.getContentElement().getDomElement();
        if (!root)
            return;
        this.__resizeObserver = new ResizeObserver(() => {
            this.scheduleLayoutUpdate();
        });
        this.__resizeObserver.observe(root);
        this.addListener("disappear", () => {
            var _a;
            (_a = this.__resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
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
        this.__resizeObserver = null;
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
            this.__setupResizeObserver();
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
    __setupResizeObserver() {
        const root = this.__htmlSelect.getContentElement().getDomElement();
        if (!root)
            return;
        this.__resizeObserver = new ResizeObserver(() => {
            this.scheduleLayoutUpdate();
        });
        this.__resizeObserver.observe(root);
        this.addListener("disappear", () => {
            var _a;
            (_a = this.__resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
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
        this.__resizeObserver = null;
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
        this.__setupResizeObserver();
    }
    __setupResizeObserver() {
        const root = this.__htmlSeparator.getContentElement().getDomElement();
        if (!root) {
            qx.event.Timer.once(() => this.__setupResizeObserver(), this, 50);
            return;
        }
        this.__resizeObserver = new ResizeObserver(() => {
            this.scheduleLayoutUpdate();
        });
        this.__resizeObserver.observe(root);
        this.addListener("disappear", () => {
            var _a;
            (_a = this.__resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
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
        this.__resizeObserver = null;
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
            this.__setupResizeObserver();
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
    __setupResizeObserver() {
        const root = this.__htmlButton.getContentElement().getDomElement();
        if (!root)
            return;
        this.__resizeObserver = new ResizeObserver(() => {
            this.scheduleLayoutUpdate();
        });
        this.__resizeObserver.observe(root);
        this.addListener("disappear", () => {
            var _a;
            (_a = this.__resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
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
        this.__enabled = true;
        this.__resizeObserver = null;
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
            this.__setupResizeObserver();
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
    __setupResizeObserver() {
        const root = this.__htmlButton.getContentElement().getDomElement();
        if (!root)
            return;
        this.__resizeObserver = new ResizeObserver(() => {
            this.scheduleLayoutUpdate();
        });
        this.__resizeObserver.observe(root);
        this.addListener("disappear", () => {
            var _a;
            (_a = this.__resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
    }
    __renderButton() {
        const iconPart = this.__iconHtml ? `<span>${this.__iconHtml}</span>` : "";
        const textPart = this.__collapsed ? "" : this.__buttonText;
        const trailingPart = !this.__collapsed && this.__trailingHtml
            ? `<span style="margin-left:auto;opacity:0.75;line-height:1">${this.__trailingHtml}</span>`
            : "";
        const activeClass = this.__active
            ? "font-semibold btn-sm-primary"
            : this.__enabled
                ? "btn-sm-ghost"
                : "btn-sm-ghost opacity-50 cursor-not-allowed";
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
          style="user-select:none"
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
    setEnabled(enabled) {
        if (this.__enabled === enabled)
            return this;
        this.__enabled = enabled;
        this.__scheduleRender();
        return this;
    }
    isEnabled() {
        return this.__enabled;
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
        this.__resizeObserver = null;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.setAllowGrowY(true);
        this.setFocusable(true);
        this.__value = value !== null && value !== void 0 ? value : "";
        this.__placeholder = placeholder !== null && placeholder !== void 0 ? placeholder : "";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__rows = rows;
        this.__htmlTextarea = new qx.ui.embed.Html("");
        this.__htmlTextarea.setAllowGrowX(true);
        this.__htmlTextarea.setAllowGrowY(true);
        this.__render();
        this._add(this.__htmlTextarea);
        this.setMinHeight(110);
        this.__htmlTextarea.addListenerOnce("appear", () => {
            this.__bindNativeTextarea();
            this.__setupResizeObserver();
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
    __setupResizeObserver() {
        const root = this.__htmlTextarea.getContentElement().getDomElement();
        if (!root)
            return;
        this.__resizeObserver = new ResizeObserver(() => {
            this.scheduleLayoutUpdate();
        });
        this.__resizeObserver.observe(root);
        this.addListener("disappear", () => {
            var _a;
            (_a = this.__resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
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
        const rowsStyle = `min-height: ${this.__rows * 24}px;`;
        this.__htmlTextarea.setHtml(`
      <div class="p-1">
        <textarea
          class="${classes}"
          placeholder="${placeholder}"
          rows="${this.__rows}"
          style="${rowsStyle}"
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
        label: "Button",
        iconName: "mouse-pointer",
        element: () => new ButtonPage(),
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
    {
        label: "Card",
        iconName: "credit-card",
        element: () => new CardPage(),
    },
    {
        label: "Input",
        iconName: "edit",
        element: () => new InputPage(),
    },
    {
        label: "Select",
        iconName: "chevron-down",
        element: () => new SelectPage(),
    },
    {
        label: "Textarea",
        iconName: "align-left",
        element: () => new TextareaPage(),
    },
    {
        label: "Avatar",
        iconName: "user",
        element: () => new AvatarPage(),
    },
];
const SIDEBAR_DEFINITIONS = [
    {
        label: "Qooxdoo UI",
        iconName: "graduation-cap",
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
                disabled: true,
            },
        ],
    },
    {
        label: "Basecoat UI",
        iconName: "box",
        children: [
            {
                label: "Button",
                iconName: "mouse-pointer",
            },
            {
                label: "Card",
                iconName: "credit-card",
            },
            {
                label: "Input",
                iconName: "edit",
            },
            {
                label: "Select",
                iconName: "chevron-down",
            },
            {
                label: "Textarea",
                iconName: "align-left",
            },
            {
                label: "Avatar",
                iconName: "user",
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
class AvatarPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(20));
        this.__responsiveWidth = 0;
        this.setPadding(20);
        this.__responsiveWidth = qx.bom.Viewport.getWidth();
        this.add(this.createShapesSection());
        this.add(this.createFallbackSection());
        this.add(this.createSizesSection());
        this.add(this.createGroupSection());
        qx.event.Registration.addListener(window, "resize", this.__onResize, this);
    }
    __onResize() {
        this.__responsiveWidth = qx.bom.Viewport.getWidth();
    }
    __isMobile() {
        return this.__responsiveWidth < 768;
    }
    createShapesSection() {
        const sectionTitle = new qx.ui.basic.Label("Shapes");
        sectionTitle.setFont(
        // @ts-ignore
        new qx.bom.Font(18).set({ bold: true }));
        sectionTitle.setTextColor("var(--foreground)");
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const shapesContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(16).set({ alignX: "center", alignY: "middle" }));
        shapesContainer.add(new BsAvatar("resource/app/morty.png", "Morty", "M", "", "full"));
        shapesContainer.add(new BsAvatar("resource/app/morty.png", "Morty", "M", "", "rounded"));
        shapesContainer.add(new BsAvatar("resource/app/morty.png", "Morty", "M", "", "square"));
        card.setContent(shapesContainer);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
        container.add(sectionTitle);
        container.add(card);
        return container;
    }
    createFallbackSection() {
        const sectionTitle = new qx.ui.basic.Label("Fallback");
        sectionTitle.setFont(
        // @ts-ignore
        new qx.bom.Font(18).set({ bold: true }));
        sectionTitle.setTextColor("var(--foreground)");
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const fallbackContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(16).set({ alignX: "center", alignY: "middle" }));
        fallbackContainer.add(new BsAvatar("resource/app/morty.png", "Morty", "M"));
        fallbackContainer.add(new BsAvatar(undefined, "User", "A"));
        fallbackContainer.add(new BsAvatar(undefined, "User", "B"));
        fallbackContainer.add(new BsAvatar(undefined, "User", "John Doe", "", "full"));
        card.setContent(fallbackContainer);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
        container.add(sectionTitle);
        container.add(card);
        return container;
    }
    createSizesSection() {
        const sectionTitle = new qx.ui.basic.Label("Sizes");
        sectionTitle.setFont(
        // @ts-ignore
        new qx.bom.Font(18).set({ bold: true }));
        sectionTitle.setTextColor("var(--foreground)");
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const sizesContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(16).set({
            alignX: "center",
            alignY: "middle",
        }));
        sizesContainer.setHeight(100);
        sizesContainer.setAlignX("center");
        sizesContainer.setAlignY("middle");
        const small = new BsAvatar("resource/app/morty.png", "Morty", "M", "size-6");
        const defaultSize = new BsAvatar("resource/app/morty.png", "Morty", "M", "size-8");
        const large = new BsAvatar("resource/app/morty.png", "Morty", "M", "size-12");
        const xl = new BsAvatar("resource/app/morty.png", "Morty", "M", "size-16");
        sizesContainer.add(small);
        sizesContainer.add(defaultSize);
        sizesContainer.add(large);
        sizesContainer.add(xl);
        card.setContent(sizesContainer);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
        container.add(sectionTitle);
        container.add(card);
        return container;
    }
    createGroupSection() {
        const sectionTitle = new qx.ui.basic.Label("Avatar Group");
        sectionTitle.setFont(
        // @ts-ignore
        new qx.bom.Font(18).set({ bold: true }));
        sectionTitle.setTextColor("var(--foreground)");
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const groupContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(0).set({ alignX: "center", alignY: "middle" }));
        const avatars = [
            new BsAvatar("resource/app/morty.png", "Morty", "M", "-ml-2 border-2 border-background"),
            new BsAvatar("resource/app/morty.png", "Morty", "M", "-ml-2 border-2 border-background"),
            new BsAvatar("resource/app/morty.png", "Morty", "M", "-ml-2 border-2 border-background"),
            new BsAvatar("resource/app/morty.png", "Morty", "M", "-ml-2 border-2 border-background"),
            new BsAvatar(undefined, "More", "+2", "-ml-2 border-2 border-background"),
        ];
        avatars.forEach((avatar) => groupContainer.add(avatar));
        card.setContent(groupContainer);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
        container.add(sectionTitle);
        container.add(card);
        return container;
    }
}
class ButtonPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(20));
        this.__responsiveWidth = 0;
        this.setPadding(20);
        this.__responsiveWidth = qx.bom.Viewport.getWidth();
        this.add(this.createVariantSection());
        this.add(this.createSizeSection());
        this.add(this.createWithIconSection());
        this.add(this.createDisabledSection());
        qx.event.Registration.addListener(window, "resize", this.__onResize, this);
    }
    __onResize() {
        this.__responsiveWidth = qx.bom.Viewport.getWidth();
    }
    __isMobile() {
        return this.__responsiveWidth < 768;
    }
    createVariantSection() {
        const sectionTitle = new qx.ui.basic.Label("Variants");
        sectionTitle.setFont(
        // @ts-ignore
        new qx.bom.Font(18).set({ bold: true }));
        sectionTitle.setTextColor("var(--foreground)");
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const variantsContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(12).set({ alignX: "center" }));
        const row1 = new qx.ui.container.Composite(new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }));
        row1.add(new BsButton("Default"));
        row1.add(new BsButton("Secondary", undefined, { variant: "secondary" }));
        row1.add(new BsButton("Destructive", undefined, { variant: "destructive" }));
        variantsContainer.add(row1);
        const row2 = new qx.ui.container.Composite(new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }));
        row2.add(new BsButton("Outline", undefined, { variant: "outline" }));
        row2.add(new BsButton("Ghost", undefined, { variant: "ghost" }));
        row2.add(new BsButton("Link", undefined, { variant: "link" }));
        variantsContainer.add(row2);
        card.setContent(variantsContainer);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
        container.add(sectionTitle);
        container.add(card);
        return container;
    }
    createSizeSection() {
        const sectionTitle = new qx.ui.basic.Label("Sizes");
        sectionTitle.setFont(
        // @ts-ignore
        new qx.bom.Font(18).set({ bold: true }));
        sectionTitle.setTextColor("var(--foreground)");
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const sizesContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(16).set({ alignX: "center" }));
        const row1 = new qx.ui.container.Composite(new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }));
        row1.add(new BsButton("Small", undefined, { size: "sm" }));
        row1.add(new BsButton("Default", undefined, { size: "default" }));
        row1.add(new BsButton("Large", undefined, { size: "lg" }));
        sizesContainer.add(row1);
        const row2 = new qx.ui.container.Composite(new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }));
        row2.add(new BsButton(undefined, new InlineSvgIcon("search", 16), {
            size: "icon",
        }));
        row2.add(new BsButton(undefined, new InlineSvgIcon("search", 18), {
            size: "sm-icon",
        }));
        row2.add(new BsButton(undefined, new InlineSvgIcon("search", 20), {
            size: "lg-icon",
        }));
        sizesContainer.add(row2);
        card.setContent(sizesContainer);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
        container.add(sectionTitle);
        container.add(card);
        return container;
    }
    createWithIconSection() {
        const sectionTitle = new qx.ui.basic.Label("With Icons");
        sectionTitle.setFont(
        // @ts-ignore
        new qx.bom.Font(18).set({ bold: true }));
        sectionTitle.setTextColor("var(--foreground)");
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const iconContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(12).set({ alignX: "center" }));
        const row1 = new qx.ui.container.Composite(new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }));
        row1.add(new BsButton("Search", new InlineSvgIcon("search", 16)).set({
            width: 120,
        }));
        row1.add(new BsButton("Download", new InlineSvgIcon("download", 16)).set({
            width: 120,
        }));
        row1.add(new BsButton("Settings", new InlineSvgIcon("settings", 16)).set({
            width: 120,
        }));
        iconContainer.add(row1);
        const row2 = new qx.ui.container.Composite(new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }));
        row2.add(new BsButton("Email", new InlineSvgIcon("mail", 16), {
            variant: "outline",
        }).set({ width: 120 }));
        row2.add(new BsButton("User", new InlineSvgIcon("user", 16), {
            variant: "secondary",
        }).set({ width: 120 }));
        row2.add(new BsButton("Delete", new InlineSvgIcon("trash", 16), {
            variant: "destructive",
        }).set({ width: 120 }));
        iconContainer.add(row2);
        card.setContent(iconContainer);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
        container.add(sectionTitle);
        container.add(card);
        return container;
    }
    createDisabledSection() {
        const sectionTitle = new qx.ui.basic.Label("Disabled State");
        sectionTitle.setFont(
        // @ts-ignore
        new qx.bom.Font(18).set({ bold: true }));
        sectionTitle.setTextColor("var(--foreground)");
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const disabledContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }));
        const defaultDisabled = new BsButton("Disabled");
        defaultDisabled.setEnabled(false);
        disabledContainer.add(defaultDisabled);
        const outlineDisabled = new BsButton("Disabled", undefined, {
            variant: "outline",
        });
        outlineDisabled.setEnabled(false);
        disabledContainer.add(outlineDisabled);
        const destructiveDisabled = new BsButton("Disabled", undefined, {
            variant: "destructive",
        });
        destructiveDisabled.setEnabled(false);
        disabledContainer.add(destructiveDisabled);
        card.setContent(disabledContainer);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
        container.add(sectionTitle);
        container.add(card);
        return container;
    }
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
class CardPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(20));
        this.__responsiveWidth = 0;
        this.setPadding(20);
        this.__responsiveWidth = qx.bom.Viewport.getWidth();
        this.add(this.createBasicCard());
        this.add(this.createCardWithList());
        this.add(this.createCardWithImage());
        qx.event.Registration.addListener(window, "resize", this.__onResize, this);
    }
    __onResize() {
        const newWidth = qx.bom.Viewport.getWidth();
        if (newWidth !== this.__responsiveWidth) {
            this.__responsiveWidth = newWidth;
        }
    }
    __isMobile() {
        return this.__responsiveWidth < 768;
    }
    createBasicCard() {
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const emailInput = new qx.ui.form.TextField();
        emailInput.setPlaceholder("Email");
        const passwordInput = new qx.ui.form.PasswordField();
        passwordInput.setPlaceholder("Password");
        const formContent = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
        formContent.setPadding(0, 24, 16, 24);
        const emailLabel = new qx.ui.basic.Label("Email");
        emailLabel.setTextColor("var(--foreground)");
        formContent.add(emailLabel);
        formContent.add(emailInput);
        const passwordLabel = new qx.ui.basic.Label("Password");
        passwordLabel.setTextColor("var(--foreground)");
        formContent.add(passwordLabel);
        formContent.add(passwordInput);
        const submitButton = new BsButton("Submit");
        submitButton.setMarginTop(12);
        formContent.add(submitButton);
        submitButton.addListener("execute", () => {
            const email = emailInput.getValue();
            const password = passwordInput.getValue();
            if (email && password) {
                alert(`Email: ${email}\nPassword: ${password}`);
            }
        });
        card.setContent(formContent);
        return card;
    }
    createCardWithList() {
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const contentSection = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
        contentSection.setPadding(24);
        const contentText = new qx.ui.basic.Label("Client requested dashboard redesign with focus on mobile responsiveness.");
        contentText.setTextColor("var(--foreground)");
        contentSection.add(contentText);
        const listItems = [
            "New analytics widgets for daily/weekly metrics",
            "Simplified navigation menu",
            "Dark mode support",
            "Timeline: 6 weeks",
            "Follow-up meeting scheduled for next Tuesday",
        ];
        const listContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));
        listContainer.setPadding(16, 0, 0, 0);
        listItems.forEach((item) => {
            const label = new qx.ui.basic.Label(`• ${item}`);
            label.setTextColor("var(--foreground)");
            listContainer.add(label);
        });
        contentSection.add(listContainer);
        card.setContent(contentSection);
        return card;
    }
    createCardWithImage() {
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const imageContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
        const image = new qx.ui.basic.Image("https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80&w=1080&q=75");
        image.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 400);
        image.setMaxHeight(200);
        image.setScale(true);
        imageContainer.add(image);
        card.setContent(imageContainer);
        const actionContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
        actionContainer.setPadding(24, 24, 16, 24);
        const badge1 = new qx.ui.basic.Label("1");
        badge1.setBackgroundColor("var(--muted)");
        badge1.setTextColor("var(--muted-foreground)");
        badge1.setPadding(4, 8, 4, 8);
        const badge2 = new qx.ui.basic.Label("2");
        badge2.setBackgroundColor("var(--muted)");
        badge2.setTextColor("var(--muted-foreground)");
        badge2.setPadding(4, 8, 4, 8);
        const badge3 = new qx.ui.basic.Label("350m²");
        badge3.setBackgroundColor("var(--muted)");
        badge3.setTextColor("var(--muted-foreground)");
        badge3.setPadding(4, 8, 4, 8);
        const spacer = new qx.ui.core.Spacer();
        spacer.setAllowGrowX(true);
        const price = new qx.ui.basic.Label("$135,000");
        price.setTextColor("var(--foreground)");
        actionContainer.add(badge1);
        actionContainer.add(badge2);
        actionContainer.add(badge3);
        actionContainer.add(spacer);
        actionContainer.add(price);
        const contentWrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
        contentWrapper.add(imageContainer);
        contentWrapper.add(actionContainer);
        card.setContent(contentWrapper);
        return card;
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
        super(new qx.ui.layout.VBox(20));
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
class InputPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(20));
        this.__responsiveWidth = 0;
        this.setPadding(20);
        this.__responsiveWidth = qx.bom.Viewport.getWidth();
        this.add(this.createBasicInput());
        this.add(this.createInputWithSearchIcon());
        this.add(this.createInputWithSearchButton());
        this.add(this.createInputWithLabel());
        qx.event.Registration.addListener(window, "resize", this.__onResize, this);
    }
    __onResize() {
        const newWidth = qx.bom.Viewport.getWidth();
        if (newWidth !== this.__responsiveWidth) {
            this.__responsiveWidth = newWidth;
        }
    }
    __isMobile() {
        return this.__responsiveWidth < 768;
    }
    createBasicInput() {
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const input = new BsInput("", "Enter your text...");
        input.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
        container.setPadding(24);
        const label = new qx.ui.basic.Label("Basic Input");
        label.setTextColor("var(--foreground)");
        container.add(label);
        container.add(input);
        card.setContent(container);
        return card;
    }
    createInputWithSearchIcon() {
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const input = new BsInput("", "Search...");
        input.setLeadingHtml('<img src="resource/app/icons/search.svg" alt="" width="16" height="16" style="display:block;opacity:0.7" />');
        input.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
        container.setPadding(24);
        const label = new qx.ui.basic.Label("Input with Search Icon");
        label.setTextColor("var(--foreground)");
        container.add(label);
        container.add(input);
        card.setContent(container);
        return card;
    }
    createInputWithSearchButton() {
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const inputContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
        inputContainer.setAllowGrowX(true);
        const input = new BsInput("", "Search pages...");
        input.setLeadingHtml('<img src="resource/app/icons/search.svg" alt="" width="16" height="16" style="display:block;opacity:0.7" />');
        input.setAllowGrowX(true);
        input.setWidth(300);
        const searchButton = new BsButton("Search");
        searchButton.setWidth(80);
        inputContainer.add(input);
        inputContainer.add(searchButton);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
        container.setPadding(24);
        const label = new qx.ui.basic.Label("Input with Search Button");
        label.setTextColor("var(--foreground)");
        container.add(label);
        container.add(inputContainer);
        card.setContent(container);
        return card;
    }
    createInputWithLabel() {
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
        container.setPadding(24);
        const label = new qx.ui.basic.Label("Input with Label");
        label.setTextColor("var(--foreground)");
        const labelText = new qx.ui.basic.Label("Email address");
        labelText.setTextColor("var(--foreground)");
        const input = new BsInput("", "you@example.com");
        input.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);
        const description = new qx.ui.basic.Label("We'll never share your email with anyone else.");
        description.setTextColor("var(--muted-foreground)");
        container.add(label);
        container.add(labelText);
        container.add(input);
        container.add(description);
        card.setContent(container);
        return card;
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
        const subtitle = new qx.ui.basic.Label("QX-TYPED with TypeScript and Qooxdoo is ready to use! Edit src/pages/main.ts to get started.");
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
class SelectPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(20));
        this.__responsiveWidth = 0;
        this.setPadding(20);
        this.__responsiveWidth = qx.bom.Viewport.getWidth();
        this.add(this.createBasicSelect());
        this.add(this.createSelectWithLabel());
        qx.event.Registration.addListener(window, "resize", this.__onResize, this);
    }
    __onResize() {
        const newWidth = qx.bom.Viewport.getWidth();
        if (newWidth !== this.__responsiveWidth) {
            this.__responsiveWidth = newWidth;
        }
    }
    __isMobile() {
        return this.__responsiveWidth < 768;
    }
    createBasicSelect() {
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const select = new BsSelect([
            "Option 1",
            "Option 2",
            "Option 3",
            "Option 4",
        ]);
        select.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
        container.setPadding(24);
        const label = new qx.ui.basic.Label("Basic Select");
        label.setTextColor("var(--foreground)");
        container.add(label);
        container.add(select);
        card.setContent(container);
        return card;
    }
    createSelectWithLabel() {
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
        container.setPadding(24);
        const label = new qx.ui.basic.Label("Select with Label");
        label.setTextColor("var(--foreground)");
        const labelText = new qx.ui.basic.Label("Country");
        labelText.setTextColor("var(--foreground)");
        const select = new BsSelect([
            "United States",
            "Canada",
            "United Kingdom",
            "Germany",
            "France",
            "Japan",
            "Australia",
        ], "w-full");
        select.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);
        const description = new qx.ui.basic.Label("Select your country from the list.");
        description.setTextColor("var(--muted-foreground)");
        container.add(label);
        container.add(labelText);
        container.add(select);
        container.add(description);
        card.setContent(container);
        return card;
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
class TextareaPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(20));
        this.__responsiveWidth = 0;
        this.setPadding(20);
        this.__responsiveWidth = qx.bom.Viewport.getWidth();
        this.add(this.createBasicTextarea());
        this.add(this.createTextareaWithLabel());
        qx.event.Registration.addListener(window, "resize", this.__onResize, this);
    }
    __onResize() {
        const newWidth = qx.bom.Viewport.getWidth();
        if (newWidth !== this.__responsiveWidth) {
            this.__responsiveWidth = newWidth;
        }
    }
    __isMobile() {
        return this.__responsiveWidth < 768;
    }
    createBasicTextarea() {
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        card.setAllowGrowY(true);
        const textarea = new BsTextarea("", "Enter your text here...");
        textarea.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
        container.setPadding(24);
        const label = new qx.ui.basic.Label("Basic Textarea");
        label.setTextColor("var(--foreground)");
        container.add(label);
        container.add(textarea);
        card.setContent(container);
        return card;
    }
    createTextareaWithLabel() {
        const card = new BsCard();
        card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
        const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
        container.setPadding(24);
        const label = new qx.ui.basic.Label("Textarea with Label");
        label.setTextColor("var(--foreground)");
        const labelText = new qx.ui.basic.Label("Description");
        labelText.setTextColor("var(--foreground)");
        const textarea = new BsTextarea("", "Enter your description here...", "w-full", 4);
        textarea.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);
        const description = new qx.ui.basic.Label("Provide a detailed description of your request.");
        description.setTextColor("var(--muted-foreground)");
        container.add(label);
        container.add(labelText);
        container.add(textarea);
        container.add(description);
        card.setContent(container);
        return card;
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
