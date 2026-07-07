class BsCombobox extends qx.ui.basic.Atom {
  static events = {
    changeValue: "qx.event.type.Data",
  };

  private __htmlTrigger: qx.ui.embed.Html;
  private __options: { value: string; label: string }[];
  private __placeholder: string;
  private __className: string;
  private __value = "";
  private __triggerEl: HTMLButtonElement | null = null;
  private __searchInputEl: HTMLInputElement | null = null;
  private __displayEl: HTMLSpanElement | null = null;
  private __resizeObserver: ResizeObserver | null = null;
  private __outsideClickHandler: ((ev: MouseEvent) => void) | null = null;
  private __popup: qx.ui.popup.Popup;
  private __popupContainer: qx.ui.container.Composite;
  private __searchContainer: qx.ui.container.Composite;
  private __listContainer: qx.ui.container.Composite;
  private __optionWidgets: BsButton[] = [];
  private __filteredOptions: { value: string; label: string }[] = [];
  private __isOpen = false;
  private __direction: "bottom" | "top" | "left" | "right" = "bottom";
  private __disabled = false;
  private __cachedContentWidth = 0;
  private __cachedContentHeight = 0;

  constructor(
    options: { value: string; label: string }[] = [],
    placeholder?: string,
    className?: string,
    direction?: "bottom" | "top" | "left" | "right",
  ) {
    super();

    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);
    this.setFocusable(true);

    this.__options = options;
    this.__placeholder = placeholder ?? "Search...";
    this.__className = className ?? "";
    this.__direction = direction ?? "bottom";
    this.__filteredOptions = [...this.__options];

    this.__htmlTrigger = new qx.ui.embed.Html("");
    this.__htmlTrigger.setAllowGrowX(true);

    this.__setupPopup();
    this.__renderTrigger();
    this._add(this.__htmlTrigger);

    this.__htmlTrigger.addListenerOnce("appear", () => {
      this.__bindTrigger();
      this.__setupResizeObserver();
    });

    this.addListener("disappear", () => {
      this.__closePopup();
      this.__unbindOutsideClick();
    });

    this.addListener("focusin", () => this.__triggerEl?.focus());
  }

  private __setupPopup(): void {
    this.__popup = new qx.ui.popup.Popup(new qx.ui.layout.VBox(0));
    this.__popup.setAutoHide(false);
    this.__popup.setDomMove(true);
    this.__popup.setZIndex(100000);
    this.__popup.setAllowGrowX(false);
    this.__popup.setAllowGrowY(true);
    this.__popup.setPadding(0);
    this.__popup.setBackgroundColor("transparent");
    this.__popup.setDecorator(
      new qx.ui.decoration.Decorator().set({
        width: 1,
        style: "solid",
        color: "var(--border)",
        radius: 8,
        shadowVerticalLength: 4,
        shadowBlurRadius: 12,
        shadowColor: "rgba(0,0,0,0.1)",
      }),
    );

    this.__popupContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(0),
    );
    this.__popupContainer.setMargin(2);
    this.__popupContainer.set({
      minWidth: 250,
      maxWidth: 300,
      backgroundColor: "var(--card)",
      textColor: "var(--foreground)",
    });

    this.__popup.add(this.__popupContainer);
    this.__buildPopupContent();
  }

  private __buildPopupContent(): void {
    const separator = new qx.ui.core.Widget();
    separator.setHeight(1);
    separator.setBackgroundColor("var(--border)");

    const searchContainer = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(8).set({ alignY: "middle" }),
    );
    searchContainer.setAlignY("middle");

    const searchInput = new BsInput("", this.__placeholder);
    searchInput.setValue("");
    searchInput.setLeadingHtml(
      '<img src="resource/app/icons/search.svg" alt="" width="16" height="16" style="display:block;opacity:0.7" />',
    );
    searchInput.onInput((value: string) => {
      this.__filteredOptions = this.__options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(value.toLowerCase()) ||
          opt.value.toLowerCase().includes(value.toLowerCase()),
      );
      this.__renderOptions();
    });
    this.__searchContainer = searchContainer;
    searchContainer.add(searchInput, { flex: 1 });

    const listContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(0),
    );
    listContainer.set({
      maxHeight: 250,
    });
    listContainer.getContentElement().setStyle("overflow-y", "auto");
    listContainer.getContentElement().setStyle("overflow-x", "hidden");
    this.__listContainer = listContainer;

    this.__popupContainer.add(searchContainer);
    this.__popupContainer.add(separator);
    this.__popupContainer.add(listContainer);

    this.__renderOptions();
  }

  private __renderOptions(): void {
    this.__listContainer.removeAll();
    this.__optionWidgets = [];

    if (this.__filteredOptions.length === 0) {
      const emptyLabel = new qx.ui.basic.Label("No result found.");
      emptyLabel.setTextColor("var(--muted-foreground)");
      emptyLabel.setPadding(8);
      this.__listContainer.add(emptyLabel);
      return;
    }

    this.__filteredOptions.forEach((opt) => {
      const btn = new BsButton(opt.label, undefined, {
        variant: "ghost",
        className: "w-full justify-start text-left",
      });
      btn.setHeight(36);
      btn.setPaddingLeft(8);
      btn.setPaddingRight(8);

      btn.onClick(() => {
        this.__selectOption(opt);
      });

      this.__optionWidgets.push(btn);
      this.__listContainer.add(btn);
    });
  }

  private __selectOption(opt: { value: string; label: string }): void {
    this.__value = opt.value;
    this.__updateDisplay();
    this.__closePopup();
    this.fireDataEvent("changeValue", this.__value);
  }

  private __updateDisplay(): void {
    if (!this.__displayEl) return;
    const selected = this.__options.find((o) => o.value === this.__value);
    this.__displayEl.textContent = selected?.label ?? "";
    if (this.__searchInputEl) {
      this.__searchInputEl.value = "";
    }
    this.__filteredOptions = [...this.__options];
    this.__renderOptions();
  }

  private __bindTrigger(): void {
    const root = this.__htmlTrigger.getContentElement().getDomElement();
    if (!root) return;

    if (this.__triggerEl) {
      this.__triggerEl.removeEventListener(
        "click",
        this.__togglePopup as EventListener,
      );
    }

    this.__triggerEl = root?.querySelector(
      "button",
    ) as HTMLButtonElement | null;
    this.__displayEl = root?.querySelector(
      ".truncate",
    ) as HTMLSpanElement | null;

    if (!this.__triggerEl) return;

    this.__triggerEl.addEventListener(
      "click",
      this.__togglePopup as EventListener,
    );
  }

  private __togglePopup = (): void => {
    if (this.__disabled) return;
    if (this.__isOpen) {
      this.__closePopup();
    } else {
      this.__openPopup();
    }
  };

  private __openPopup(): void {
    this.__isOpen = true;
    this.__popup.show();
    this.__placePopup();
    this.__bindOutsideClick();
    this.__updateTriggerAria(true);

    qx.event.Timer.once(
      () => {
        this.__placePopup();
        const children = this.__searchContainer.getChildren();
        const searchInput = children.length > 1 ? children[1] : null;
        if (searchInput && (searchInput as any).focus) {
          (searchInput as any).focus();
        }
      },
      this,
      50,
    );
  }

  private __closePopup(): void {
    this.__isOpen = false;
    this.__unbindOutsideClick();
    this.__popup.hide();
    this.__updateTriggerAria(false);
    this.__filteredOptions = [...this.__options];
    this.__renderOptions();
  }

  private __updateTriggerAria(expanded: boolean): void {
    if (this.__triggerEl) {
      this.__triggerEl.setAttribute(
        "aria-expanded",
        expanded ? "true" : "false",
      );
    }
  }

  private __placePopup(): void {
    const triggerRoot = this.__htmlTrigger.getContentElement().getDomElement();
    if (!triggerRoot) return;

    const buttonEl = triggerRoot.querySelector("button") as HTMLElement;
    const triggerRect = buttonEl?.getBoundingClientRect() ?? triggerRoot.getBoundingClientRect();
    const popupEl = this.__popup.getContentElement().getDomElement();
    if (!popupEl) return;

    this.__popupContainer.setWidth(triggerRect.width);

    const popupRect = popupEl.getBoundingClientRect();
    const gap = 2;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left: number;
    let top: number;
    const dir = this.__direction;

    if (dir === "left") {
      const preferredLeft = Math.round(
        triggerRect.left - popupRect.width - gap,
      );
      left = Math.min(
        Math.max(8, preferredLeft),
        Math.max(8, viewportWidth - popupRect.width - 8),
      );
      top = Math.round(triggerRect.top);
    } else if (dir === "right") {
      const preferredLeft = Math.round(triggerRect.right + gap);
      left = Math.min(
        Math.max(8, preferredLeft),
        Math.max(8, viewportWidth - popupRect.width - 8),
      );
      top = Math.round(triggerRect.top);
    } else if (dir === "top") {
      const preferredLeft = Math.round(triggerRect.left);
      left = Math.min(
        Math.max(8, preferredLeft),
        Math.max(8, viewportWidth - popupRect.width - 8),
      );
      top = Math.round(triggerRect.top - popupRect.height - gap);
    } else {
      const preferredLeft = Math.round(triggerRect.left);
      left = Math.min(
        Math.max(8, preferredLeft),
        Math.max(8, viewportWidth - popupRect.width - 8),
      );
      top = Math.round(triggerRect.bottom + gap);
    }

    if (dir === "left" || dir === "right") {
      const preferredTop = Math.round(triggerRect.top);
      const hasSpaceBelow =
        preferredTop + popupRect.height <= viewportHeight - 8;
      const hasSpaceAbove = preferredTop >= 8;
      if (!hasSpaceBelow && hasSpaceAbove) {
        top = Math.max(8, viewportHeight - popupRect.height - 8);
      } else if (!hasSpaceBelow && !hasSpaceAbove) {
        top = 8;
      }
    } else {
      if (dir === "top") {
        const hasSpaceAbove = top >= 8;
        if (!hasSpaceAbove) {
          top = Math.round(triggerRect.bottom + gap);
        }
      } else {
        const hasSpaceBelow = top + popupRect.height <= viewportHeight - 8;
        if (!hasSpaceBelow) {
          const preferredTopAlt = Math.round(
            triggerRect.top - popupRect.height - gap,
          );
          if (preferredTopAlt >= 8) {
            top = preferredTopAlt;
          }
        }
      }
    }

    this.__popup.moveTo(left, top);
  }

  private __bindOutsideClick(): void {
    if (this.__outsideClickHandler) return;

    this.__outsideClickHandler = (ev: MouseEvent) => {
      const target = ev.target as Node | null;
      if (!target) return;

      const triggerRoot = this.__htmlTrigger
        .getContentElement()
        .getDomElement();
      const popupRoot = this.__popup.getContentElement().getDomElement();
      const clickedTrigger = !!triggerRoot && triggerRoot.contains(target);
      const clickedPopup = !!popupRoot && popupRoot.contains(target);
      if (!clickedTrigger && !clickedPopup) this.__closePopup();
    };

    document.addEventListener("mousedown", this.__outsideClickHandler, true);
  }

  private __unbindOutsideClick(): void {
    if (!this.__outsideClickHandler) return;
    document.removeEventListener("mousedown", this.__outsideClickHandler, true);
    this.__outsideClickHandler = null;
  }

  private __renderTrigger(): void {
    const selected = this.__options.find((o) => o.value === this.__value);
    const displayText = selected ? this.__escape(selected.label) : this.__escape(this.__placeholder);
    const disabledAttr = this.__disabled ? "disabled" : "";
    const disabledClass = this.__disabled ? "opacity-50 cursor-not-allowed" : "";

    const classes = ["btn-outline", "w-full", this.__className, disabledClass]
      .filter(Boolean)
      .join(" ");

    this.__htmlTrigger.setHtml(`
      <div class="p-1">
        <button type="button" class="${classes}" aria-haspopup="listbox" aria-expanded="false" ${disabledAttr}>
          <span class="truncate ${!selected ? "text-muted-foreground" : ""}">${displayText}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevrons-up-down text-muted-foreground opacity-50 shrink-0">
            <path d="m7 15 5 5 5-5" />
            <path d="m7 9 5-5 5 5" />
          </svg>
        </button>
      </div>
    `);
  }

  private __escape(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  private __setupResizeObserver(): void {
    const root = this.__htmlTrigger.getContentElement().getDomElement();
    if (!root) return;

    this.__resizeObserver = new ResizeObserver(([entry]) => {
      const target = entry.target as HTMLElement;
      this.__cachedContentWidth = Math.round(target.scrollWidth || entry.contentRect.width);
      this.__cachedContentHeight = Math.round(target.scrollHeight || entry.contentRect.height);
      this.scheduleLayoutUpdate();
    });
    this.__resizeObserver.observe(root);

    this.addListener("disappear", () => {
      this.__resizeObserver?.disconnect();
    });
  }

  // @ts-ignore
  _getContentHint(): qx.ui.layout.SizeHint {
    if (this.__cachedContentWidth > 0 && this.__cachedContentHeight > 0) {
      return { width: this.__cachedContentWidth, height: this.__cachedContentHeight };
    }
    const contentEl = this.__htmlTrigger.getContentElement()?.getDomElement();
    if (contentEl) {
      return { width: contentEl.scrollWidth || 0, height: contentEl.scrollHeight || 0 };
    }
    return { width: 0, height: 0 };
  }

  public getValue(): string {
    return this.__value;
  }

  public setValue(value: string): this {
    this.__value = value;
    this.__updateDisplay();
    return this;
  }

  public setOptions(options: { value: string; label: string }[]): this {
    this.__options = options;
    this.__filteredOptions = [...options];
    if (this.__value && !options.find((o) => o.value === this.__value)) {
      this.__value = "";
      this.__updateDisplay();
    }
    this.__renderOptions();
    return this;
  }

  public setEnabled(enabled: boolean): this {
    this.__disabled = !enabled;
    return this;
  }

  public onChange(handler: (value: string) => void): this {
    this.addListener("changeValue", (ev: qx.event.type.Data) => {
      handler((ev.getData() as string) ?? "");
    });
    return this;
  }
}
