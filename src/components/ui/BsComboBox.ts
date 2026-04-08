type BsComboBoxListItem = {
  getLabel: () => string;
  getValue: () => string;
  _label: string;
  _value: string;
};

/**
 * Basecoat-style custom select: button + listbox, popover portaled to body / dialog.
 */
class BsComboBox extends qx.ui.core.Widget {
  static events = {
    changeValue: "qx.event.type.Data",
    changeSelection: "qx.event.type.Data",
  };

  private __html: qx.ui.embed.Html;
  private readonly __comboId: string;
  private __buttonElement: HTMLButtonElement | null = null;
  private __popoverElement: HTMLElement | null = null;
  private __listboxElement: HTMLElement | null = null;
  private __valueSpan: HTMLElement | null = null;
  private __items: BsComboBoxListItem[] = [];
  private __itemMap = new Map<string, BsComboBoxListItem>();
  private __isOpen = false;
  private __selectedItem: BsComboBoxListItem | null = null;
  private __popoverContainer: HTMLElement | null = null;
  private __updatePositionHandler: (() => void) | null = null;
  private __clickHandler: ((e: Event) => void) | null = null;
  private readonly __mobileSidePadding = 12;
  private __storedValue = "";
  /** Match BsDateField / popover (280px); still fills narrow parents via min(100%, …). */
  private static readonly __fieldMaxWidthPx = 280;

  constructor() {
    super();
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

    this.addListener(
      "changeEnabled",
      (e: qx.event.type.Data) => {
        this.__applyEnabled(!!e.getData());
      },
      this,
    );

    this.__html.addListenerOnce("appear", () => {
      const widgetElement = this.getContentElement();
      if (widgetElement) {
        widgetElement.setStyle("overflow", "visible");
        const domElement = widgetElement.getDomElement();
        if (domElement) {
          domElement.addEventListener("focusin", (e: FocusEvent) => {
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

  private __pinCompactFieldWidth(): void {
    const m = BsComboBox.__fieldMaxWidthPx;
    const pin = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.setProperty("width", `min(100%, ${m}px)`, "important");
      el.style.setProperty(
        "max-width",
        `min(${m}px, calc(100vw - 1.5rem))`,
        "important",
      );
      el.style.setProperty("min-width", "0", "important");
      el.style.setProperty("box-sizing", "border-box", "important");
    };
    pin(this.getContentElement()?.getDomElement() as HTMLElement | null);
    pin(this.__html.getContentElement()?.getDomElement() as HTMLElement | null);
    const slot = this.__getContainerElement();
    pin(slot);
    if (slot) {
      pin(slot.querySelector(".bs-combobox-root") as HTMLElement | null);
    }
  }

  private __getViewportWidth(): number {
    return window.innerWidth || document.documentElement.clientWidth || 1200;
  }

  private __setupDropdownEvents(): void {
    const container = this.__html.getContentElement().getDomElement() as HTMLElement;
    this.__buttonElement = container.querySelector(
      `#${this.__comboId}-trigger`,
    ) as HTMLButtonElement | null;
    this.__popoverElement = container.querySelector(
      `#${this.__comboId}-popover`,
    ) as HTMLElement | null;
    this.__listboxElement = container.querySelector(
      `#${this.__comboId}-listbox`,
    ) as HTMLElement | null;
    this.__valueSpan = container.querySelector(".truncate");

    if (
      !this.__buttonElement ||
      !this.__popoverElement ||
      !this.__listboxElement ||
      !this.__valueSpan
    ) {
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

    this.__buttonElement.addEventListener(
      "click",
      (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.getEnabled()) {
          this.__toggleDropdown();
        }
      },
      true,
    );

    const clickHandler = (e: Event) => {
      const target = e.target as Node | null;
      if (
        this.__isOpen &&
        target &&
        !container.contains(target) &&
        !this.__popoverElement!.contains(target)
      ) {
        this.__closeDropdown();
      }
    };
    document.addEventListener("click", clickHandler);
    this.__clickHandler = clickHandler;

    this.__buttonElement.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.stopPropagation();
        return;
      }
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        if (!this.__isOpen) {
          this.__openDropdown();
        }
      } else if (e.key === "Escape" && this.__isOpen) {
        e.preventDefault();
        this.__closeDropdown();
      }
    });

    this.__listboxElement.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLElement | null;
      const option =
        target && target.closest ? target.closest("[role='option']") : null;
      if (option) {
        const value = option.getAttribute("data-value");
        this.__selectValue(value);
        this.__closeDropdown();
      }
    });

    this.__listboxElement.addEventListener("keydown", (e: KeyboardEvent) => {
      const options = Array.from(
        this.__listboxElement!.querySelectorAll("[role='option']"),
      ) as HTMLElement[];
      const currentIndex = options.findIndex(
        (opt) => opt === document.activeElement,
      );

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex =
          currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        if (options[nextIndex]) options[nextIndex].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        if (options[prevIndex]) options[prevIndex].focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const option = document.activeElement;
        if (option && option.getAttribute("role") === "option") {
          const value = option.getAttribute("data-value");
          this.__selectValue(value);
          this.__closeDropdown();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.__closeDropdown();
        this.__buttonElement!.focus();
      }
    });
  }

  private __getContainerElement(): HTMLElement | null {
    return (
      (this.__html.getContentElement().getDomElement() as HTMLElement) ?? null
    );
  }

  private __toggleDropdown(): void {
    if (this.__isOpen) {
      this.__closeDropdown();
    } else {
      this.__openDropdown();
    }
  }

  private __updatePopoverPosition(): void {
    if (!this.__isOpen || !this.__buttonElement || !this.__popoverElement) {
      return;
    }
    const buttonRect = this.__buttonElement.getBoundingClientRect();
    const viewportWidth = this.__getViewportWidth();
    const minLeft = this.__mobileSidePadding;
    const maxAllowedWidth = Math.max(
      180,
      viewportWidth - this.__mobileSidePadding * 2,
    );
    const width = Math.min(buttonRect.width, maxAllowedWidth);
    const leftPx = Math.max(
      minLeft,
      Math.min(
        buttonRect.left,
        viewportWidth - width - this.__mobileSidePadding,
      ),
    );
    const top = buttonRect.bottom + window.scrollY + 2;
    const left = leftPx + window.scrollX;

    this.__popoverElement.style.setProperty("top", `${top}px`, "important");
    this.__popoverElement.style.setProperty("left", `${left}px`, "important");
    this.__popoverElement.style.setProperty("width", `${width}px`, "important");
    this.__popoverElement.style.setProperty(
      "min-width",
      `${width}px`,
      "important",
    );
    this.__popoverElement.style.setProperty(
      "max-width",
      `${width}px`,
      "important",
    );
    this.__popoverElement.style.setProperty(
      "max-height",
      "45vh",
      "important",
    );
    if (this.__listboxElement) {
      this.__listboxElement.style.maxHeight = "45vh";
    }
  }

  private __openDropdown(): void {
    if (!this.__popoverElement || !this.__buttonElement) {
      return;
    }

    this.__isOpen = true;

    const dialogElement = this.__buttonElement.closest("dialog");
    let targetContainer: HTMLElement = document.body;
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
    } else if (this.__popoverContainer.parentNode !== targetContainer) {
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
    this.__popoverElement.style.setProperty(
      "visibility",
      "visible",
      "important",
    );
    this.__buttonElement.setAttribute("aria-expanded", "true");

    this.__updatePositionHandler = this.__updatePopoverPosition.bind(this);
    window.addEventListener("scroll", this.__updatePositionHandler, true);
    window.addEventListener("resize", this.__updatePositionHandler);

    const svg = this.__buttonElement.querySelector("svg");
    if (svg) {
      (svg as SVGElement).style.transform = "rotate(180deg)";
    }

    const firstOption = this.__listboxElement!.querySelector(
      "[role='option']",
    );
    if (firstOption) {
      setTimeout(() => (firstOption as HTMLElement).focus(), 0);
    }
  }

  private __closeDropdown(): void {
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
    this.__popoverElement.style.setProperty(
      "visibility",
      "hidden",
      "important",
    );
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
      (svg as SVGElement).style.transform = "rotate(0deg)";
    }
  }

  private __selectValue(value: string | null): void {
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

  private __syncItemsToDOM(): void {
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
      this.__listboxElement!.appendChild(option);
    });
    this.__updateSelectedDisplay();
  }

  private __updateSelectedDisplay(): void {
    if (!this.__valueSpan) {
      return;
    }
    if (this.__selectedItem) {
      this.__valueSpan.textContent = this.__selectedItem._label;
    } else {
      this.__valueSpan.textContent = "";
    }
    if (this.__listboxElement) {
      const options = this.__listboxElement.querySelectorAll("[role='option']");
      options.forEach((option: Element) => {
        const value = option.getAttribute("data-value");
        if (this.__selectedItem && value === this.__selectedItem._value) {
          option.setAttribute("aria-selected", "true");
        } else {
          option.removeAttribute("aria-selected");
        }
      });
    }
  }

  private __applyValueToSelection(value: string, _old?: string): void {
    if (value) {
      const item = this.__itemMap.get(value);
      if (item) {
        this.__selectedItem = item;
      }
    } else {
      this.__selectedItem = null;
    }
    this.__updateSelectedDisplay();
  }

  private __applyEnabled(enabled: boolean): void {
    if (this.__buttonElement) {
      this.__buttonElement.disabled = !enabled;
      if (!enabled && this.__isOpen) {
        this.__closeDropdown();
      }
    }
  }

  add(item: qx.ui.form.ListItem | string): void {
    let label: string;
    let value: string;

    if (item && typeof (item as qx.ui.form.ListItem).getLabel === "function") {
      const li = item as qx.ui.form.ListItem & {
        getValue?: () => string;
      };
      label = li.getLabel() as string;
      value = typeof li.getValue === "function" ? li.getValue() : label;
    } else if (typeof item === "string") {
      label = item;
      value = item;
    } else {
      return;
    }

    const listItem: BsComboBoxListItem = {
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

  getSelection(): BsComboBoxListItem[] {
    return this.__selectedItem ? [this.__selectedItem] : [];
  }

  resetSelection(): void {
    this.__selectedItem = null;
    this.setValue("");
    this.__updateSelectedDisplay();
  }

  getValue(): string {
    return this.__selectedItem
      ? this.__selectedItem._value
      : this.__storedValue || "";
  }

  setValue(valueOrLabel: string): void {
    if (!valueOrLabel) {
      if (this.__storedValue !== "") {
        const oldValue = this.__storedValue;
        this.__storedValue = "";
        this.__applyValueToSelection("", oldValue);
        this.fireDataEvent("changeValue", "", oldValue);
      }
      return;
    }

    let foundItem: BsComboBoxListItem | null = null;
    let foundValue: string | null = null;

    for (const item of this.__items) {
      if (item._label === valueOrLabel) {
        foundItem = item;
        foundValue = item._value;
        break;
      }
    }

    if (!foundItem) {
      foundItem = this.__itemMap.get(valueOrLabel) ?? null;
      if (foundItem) {
        foundValue = foundItem._value;
      } else {
        foundValue = valueOrLabel;
      }
    }

    const next = foundValue ?? "";
    if (this.__storedValue !== next) {
      const oldValue = this.__storedValue;
      this.__storedValue = next;
      this.__applyValueToSelection(next, oldValue);
      this.fireDataEvent("changeValue", next, oldValue);
    }
  }

  focus(): void {
    this.__buttonElement?.focus();
  }

  blur(): void {
    this.__buttonElement?.blur();
    this.__closeDropdown();
  }

  destruct(): void {
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
    if (this.__popoverContainer?.parentNode) {
      this.__popoverContainer.parentNode.removeChild(this.__popoverContainer);
      this.__popoverContainer = null;
    }
    super.destruct();
  }
}
