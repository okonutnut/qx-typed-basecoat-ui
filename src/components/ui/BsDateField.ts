/**
 * Basecoat-style date field with calendar popover (port of new_proj DateField).
 */
class BsDateField extends qx.ui.core.Widget {
  static events = {
    changeValue: "qx.event.type.Data",
  };

  private __html: qx.ui.embed.Html;
  private __dateId: string;
  private __inputElement: HTMLInputElement | null = null;
  private __iconButton: HTMLButtonElement | null = null;
  private __popoverElement: HTMLElement | null = null;
  private __calendarElement: HTMLElement | null = null;
  private __isOpen = false;
  private __currentMonth: number;
  private __currentYear: number;
  private __selectedDate: Date | null = null;
  private __value: Date | null = null;
  private __popoverContainer: HTMLElement | null = null;
  private __updatePositionHandler: (() => void) | null = null;
  private __clickHandler: ((e: MouseEvent) => void) | null = null;
  private __calendarClickHandler: ((e: MouseEvent) => void) | null = null;
  private __calendarMouseDownHandler: ((e: MouseEvent) => void) | null = null;
  /** Which panel is shown inside the calendar popover. */
  private __calendarView: "days" | "months" | "years" = "days";
  /** First year shown in the year grid (12-year page). */
  private __yearPageStart = 2000;
  private readonly __mobileSidePadding = 12;
  /** Calendar popover width; day grid stays compact (not stretched to full input width). */
  private static readonly __popoverPreferredWidth = 280;
  /** Input caps at the same width as the popover so the field does not look oversized. */
  private static readonly __fieldMaxWidthPx = BsDateField.__popoverPreferredWidth;
  private static readonly __headerPickBtnStyle =
    "background: none; border: none; cursor: pointer; padding: calc(var(--spacing) * 0.25) calc(var(--spacing) * 0.35); border-radius: calc(var(--radius) - 4px); color: inherit; font: inherit; font-weight: 500; user-select: none; -webkit-user-select: none;";
  private static readonly __gridPickBtnStyle =
    "display: flex; align-items: center; justify-content: center; border: none; background: transparent; cursor: pointer; border-radius: calc(var(--radius) - 4px); font-size: var(--text-xs); padding: calc(var(--spacing) * 0.4); min-width: 0; transition: background-color 0.15s, color 0.15s;";

  constructor() {
    super();
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

    this.addListener("changeEnabled", (e: qx.event.type.Data) => {
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
          domElement.addEventListener("focusin", (e: FocusEvent) => {
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
  private __pinCompactFieldWidth(): void {
    const m = BsDateField.__fieldMaxWidthPx;
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
      pin(slot.querySelector(".bs-datefield-root") as HTMLElement | null);
    }
  }

  private static __pad2(n: number): string {
    const s = String(n);
    return s.length < 2 ? "0" + s : s;
  }

  private __destructCleanup(): void {
    this.__closeCalendar();
    if (this.__popoverContainer && this.__popoverContainer.parentNode) {
      this.__popoverContainer.parentNode.removeChild(this.__popoverContainer);
      this.__popoverContainer = null;
    }
  }

  private __getViewportWidth(): number {
    return (
      window.innerWidth ||
      document.documentElement.clientWidth ||
      1200
    );
  }

  private __setupDatePickerEvents(): void {
    const container = this.__getContainerElement();
    if (!container) return;

    this.__inputElement = container.querySelector(
      `#${this.__dateId}-trigger`,
    );
    this.__iconButton = container.querySelector(`#${this.__dateId}-icon-btn`);
    this.__popoverElement = container.querySelector(
      `#${this.__dateId}-popover`,
    );
    this.__calendarElement = container.querySelector(
      `#${this.__dateId}-calendar`,
    );

    if (
      !this.__inputElement ||
      !this.__popoverElement ||
      !this.__calendarElement
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

    const wrapperDiv = container.querySelector("div");
    if (wrapperDiv) {
      wrapperDiv.setAttribute("tabindex", "-1");
    }

    this.__inputElement.removeAttribute("tabindex");

    this.__inputElement.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.stopPropagation();
      }
    });

    this.__inputElement.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLInputElement | null;
      if (!target) return;
      this.__formatDateInput(target);
      this.__handleDateInput(target.value);
    });

    this.__inputElement.addEventListener("keypress", (e: KeyboardEvent) => {
      const char = String.fromCharCode(e.which || e.keyCode);
      if (
        !/[0-9/]/.test(char) &&
        !/[0-8]/.test(e.key) &&
        e.key !== "Backspace" &&
        e.key !== "Delete" &&
        e.key !== "Tab" &&
        e.key !== "ArrowLeft" &&
        e.key !== "ArrowRight" &&
        e.key !== "ArrowUp" &&
        e.key !== "ArrowDown" &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
      }
    });

    this.__inputElement.addEventListener("paste", (e: ClipboardEvent) => {
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
      this.__iconButton.addEventListener(
        "click",
        (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (this.getEnabled()) {
            this.__toggleCalendar();
          }
        },
        true,
      );
    }

    const prevBtn = container.querySelector(`#${this.__dateId}-prev-month`);
    const nextBtn = container.querySelector(`#${this.__dateId}-next-month`);
    if (prevBtn) {
      prevBtn.addEventListener("click", (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.__calendarNav(-1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.__calendarNav(1);
      });
    }

    this.__clickHandler = (e: MouseEvent) => {
      if (!this.__isOpen) return;
      const target = e.target as Node | null;
      if (!target) return;

      const prevBtn = this.__popoverElement?.querySelector(
        `#${this.__dateId}-prev-month`,
      );
      const nextBtn = this.__popoverElement?.querySelector(
        `#${this.__dateId}-next-month`,
      );
      if (
        (prevBtn && (prevBtn === target || prevBtn.contains(target))) ||
        (nextBtn && (nextBtn === target || nextBtn.contains(target)))
      ) {
        return;
      }

      const t = target instanceof Node ? target : null;
      const isInPopover =
        t &&
        this.__popoverElement &&
        this.__popoverElement.contains(t);
      const isInCalendar =
        t &&
        this.__calendarElement &&
        this.__calendarElement.contains(t);
      const isInInput =
        t && this.__inputElement && this.__inputElement.contains(t);
      const isInIcon =
        t && this.__iconButton && this.__iconButton.contains(t);

      if (!isInPopover && !isInCalendar && !isInInput && !isInIcon) {
        this.__closeCalendar();
      }
    };
  }

  private __getContainerElement(): HTMLElement | null {
    const ce = this.__html.getContentElement();
    if (ce) {
      return ce.getDomElement() as HTMLElement | null;
    }
    return null;
  }

  private __updatePopoverPosition(): void {
    if (!this.__isOpen || !this.__inputElement || !this.__popoverElement) {
      return;
    }
    const buttonRect = this.__inputElement.getBoundingClientRect();
    const viewportWidth = this.__getViewportWidth();
    const minLeft = this.__mobileSidePadding;
    const maxByViewport = Math.max(
      200,
      viewportWidth - this.__mobileSidePadding * 2,
    );
    const width = Math.min(
      BsDateField.__popoverPreferredWidth,
      maxByViewport,
    );
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

    const calendarElement = this.__popoverElement.querySelector(
      `#${this.__dateId}-calendar`,
    );
    if (calendarElement) {
      (calendarElement as HTMLElement).style.setProperty(
        "width",
        `${width}px`,
        "important",
      );
      (calendarElement as HTMLElement).style.setProperty(
        "max-width",
        `${width}px`,
        "important",
      );
      (calendarElement as HTMLElement).style.setProperty(
        "min-width",
        `${width}px`,
        "important",
      );
    }
  }

  private __toggleCalendar(): void {
    if (this.__isOpen) {
      this.__closeCalendar();
    } else {
      this.__openCalendar();
    }
  }

  private __openCalendar(): void {
    if (!this.__popoverElement || !this.__inputElement) return;
    if (typeof this.__popoverElement.querySelector !== "function") return;

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

    this.__calendarElement = this.__popoverElement.querySelector(
      `#${this.__dateId}-calendar`,
    ) as HTMLElement | null;

    if (this.__calendarElement) {
      if (this.__calendarClickHandler) {
        this.__calendarElement.removeEventListener(
          "click",
          this.__calendarClickHandler,
          true,
        );
      }
      if (this.__calendarMouseDownHandler) {
        this.__calendarElement.removeEventListener(
          "mousedown",
          this.__calendarMouseDownHandler,
          true,
        );
      }

      this.__calendarMouseDownHandler = (e: MouseEvent) => {
        let target = e.target as HTMLElement | null;
        while (target && target !== this.__calendarElement) {
          const id = target.id;
          if (
            id === `${this.__dateId}-month-label` ||
            id === `${this.__dateId}-year-label`
          ) {
            e.preventDefault();
            return;
          }
          target = target.parentElement;
        }
      };

      this.__calendarClickHandler = (e: MouseEvent) => {
        let target = e.target as HTMLElement | null;
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
            if (!this.getEnabled()) return;
            this.__calendarView = "months";
            this.__renderCalendar();
            return;
          }
          if (target.id === `${this.__dateId}-year-label`) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (!this.getEnabled()) return;
            this.__yearPageStart =
              Math.floor(this.__currentYear / 12) * 12;
            this.__yearPageStart = Math.max(
              1889,
              Math.min(this.__yearPageStart, 2089),
            );
            this.__calendarView = "years";
            this.__renderCalendar();
            return;
          }
          target = target.parentElement;
        }
      };

      this.__calendarElement.addEventListener(
        "mousedown",
        this.__calendarMouseDownHandler,
        true,
      );
      this.__calendarElement.addEventListener(
        "click",
        this.__calendarClickHandler,
        true,
      );
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
    this.__popoverElement.style.setProperty(
      "visibility",
      "visible",
      "important",
    );
    this.__inputElement.setAttribute("aria-expanded", "true");

    this.__updatePositionHandler = this.__updatePopoverPosition.bind(this);
    window.addEventListener("scroll", this.__updatePositionHandler, true);
    window.addEventListener("resize", this.__updatePositionHandler);

    if (this.__clickHandler) {
      setTimeout(() => {
        document.addEventListener("click", this.__clickHandler!, true);
      }, 0);
    }

    this.__renderCalendar();
  }

  private __closeCalendar(): void {
    if (!this.__popoverElement || !this.__inputElement) return;

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
        this.__calendarElement.removeEventListener(
          "click",
          this.__calendarClickHandler,
          true,
        );
        this.__calendarClickHandler = null;
      }
      if (this.__calendarMouseDownHandler) {
        this.__calendarElement.removeEventListener(
          "mousedown",
          this.__calendarMouseDownHandler,
          true,
        );
        this.__calendarMouseDownHandler = null;
      }
    }

    this.__popoverElement.setAttribute("aria-hidden", "true");
    this.__popoverElement.style.setProperty("display", "none", "important");
    this.__popoverElement.style.setProperty(
      "visibility",
      "hidden",
      "important",
    );
    this.__inputElement.setAttribute("aria-expanded", "false");

    const container = this.__getContainerElement();
    if (
      container &&
      this.__popoverElement.parentNode === this.__popoverContainer
    ) {
      container.appendChild(this.__popoverElement);
    }
  }

  private __changeMonth(delta: number): void {
    this.__currentMonth += delta;
    if (this.__currentMonth < 0) {
      this.__currentMonth = 11;
      this.__currentYear--;
    } else if (this.__currentMonth > 11) {
      this.__currentMonth = 0;
      this.__currentYear++;
    }
    this.__renderCalendar();
  }

  private __calendarNav(delta: number): void {
    if (this.__calendarView === "days") {
      this.__changeMonth(delta);
    } else if (this.__calendarView === "months") {
      this.__currentYear += delta;
      this.__renderCalendar();
    } else {
      this.__yearPageStart += delta * 12;
      this.__yearPageStart = Math.max(
        1889,
        Math.min(this.__yearPageStart, 2089),
      );
      this.__renderCalendar();
    }
  }

  private __renderCalendar(): void {
    let searchRoot: ParentNode | null = null;
    if (this.__popoverElement) {
      searchRoot = this.__popoverElement;
    } else {
      searchRoot = this.__getContainerElement();
    }
    if (!searchRoot) return;

    const daysContainer = searchRoot.querySelector(
      `#${this.__dateId}-days`,
    ) as HTMLElement | null;
    const weekdaysRow = searchRoot.querySelector(
      `#${this.__dateId}-weekdays-row`,
    ) as HTMLElement | null;
    const monthsPanel = searchRoot.querySelector(
      `#${this.__dateId}-months-panel`,
    ) as HTMLElement | null;
    const yearsPanel = searchRoot.querySelector(
      `#${this.__dateId}-years-panel`,
    ) as HTMLElement | null;
    const monthBtn = searchRoot.querySelector(
      `#${this.__dateId}-month-label`,
    ) as HTMLButtonElement | null;
    const yearBtn = searchRoot.querySelector(
      `#${this.__dateId}-year-label`,
    ) as HTMLButtonElement | null;
    const yearRangeLabel = searchRoot.querySelector(
      `#${this.__dateId}-year-range-label`,
    ) as HTMLElement | null;
    const prevNav = searchRoot.querySelector(
      `#${this.__dateId}-prev-month`,
    ) as HTMLButtonElement | null;
    const nextNav = searchRoot.querySelector(
      `#${this.__dateId}-next-month`,
    ) as HTMLButtonElement | null;

    if (
      !daysContainer ||
      !weekdaysRow ||
      !monthsPanel ||
      !yearsPanel ||
      !monthBtn ||
      !yearBtn ||
      !yearRangeLabel
    ) {
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
      if (prevNav) prevNav.setAttribute("aria-label", "Previous month");
      if (nextNav) nextNav.setAttribute("aria-label", "Next month");
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

      const firstDay = new Date(
        this.__currentYear,
        this.__currentMonth,
        1,
      ).getDay();
      const daysInMonth = new Date(
        this.__currentYear,
        this.__currentMonth + 1,
        0,
      ).getDate();
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
        const isSelected =
          selectedDate &&
          cellDate.toDateString() === selectedDate.toDateString();

        if (isSelected) {
          cell.style.backgroundColor = "var(--primary)";
          cell.style.color = "var(--primary-foreground)";
        } else if (isToday) {
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
            } else {
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
      if (prevNav) prevNav.setAttribute("aria-label", "Previous year");
      if (nextNav) nextNav.setAttribute("aria-label", "Next year");
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

    if (prevNav) prevNav.setAttribute("aria-label", "Previous years");
    if (nextNav) nextNav.setAttribute("aria-label", "Next years");
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
      } else if (isCurrent) {
        cell.style.backgroundColor = "var(--primary)";
        cell.style.color = "var(--primary-foreground)";
      }
      cell.addEventListener("mouseenter", () => {
        if (!inRange || isCurrent) return;
        cell.style.backgroundColor = "var(--accent)";
        cell.style.color = "var(--accent-foreground)";
      });
      cell.addEventListener("mouseleave", () => {
        if (!inRange || isCurrent) return;
        cell.style.backgroundColor = "transparent";
        cell.style.color = "";
      });
      cell.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!inRange) return;
        this.__currentYear = y;
        this.__calendarView = "days";
        this.__renderCalendar();
      });
      yearsPanel.appendChild(cell);
    }
  }

  private __selectDate(date: Date): void {
    this.__selectedDate = date;
    this.setValue(date);
    this.__updateDisplay();
    this.__closeCalendar();
  }

  private __updateDisplay(): void {
    if (!this.__inputElement) return;
    if (this.__selectedDate) {
      const month = BsDateField.__pad2(this.__selectedDate.getMonth() + 1);
      const day = BsDateField.__pad2(this.__selectedDate.getDate());
      const year = this.__selectedDate.getFullYear();
      this.__inputElement.value = `${month}/${day}/${year}`;
    } else {
      this.__inputElement.value = "";
    }
  }

  private __handleDateInput(value: string): void {
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

  private __formatDateString(digits: string): string {
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

  private __formatDateInput(input: HTMLInputElement): void {
    const value = input.value;
    const cursorPos = input.selectionStart ?? input.value.length;
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
      } else if (newLength < oldLength) {
        newCursorPos = Math.max(0, cursorPos - (oldLength - newLength));
      }
      newCursorPos = Math.min(newCursorPos, formatted.length);
      setTimeout(() => {
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  }

  private __parseDateInput(value: string): Date | null {
    if (!value) return null;
    const cleaned = value.replace(/[^\d/]/g, "");
    const parts = cleaned.split("/");
    if (parts.length !== 3) return null;
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(month) || month < 1 || month > 12) return null;
    if (isNaN(day) || day < 1 || day > 31) return null;
    if (isNaN(year) || year < 1900 || year > 2100) return null;
    const date = new Date(year, month - 1, day);
    if (
      date.getMonth() !== month - 1 ||
      date.getDate() !== day ||
      date.getFullYear() !== year
    ) {
      return null;
    }
    return date;
  }

  private __applyValueToDom(value: Date | null): void {
    if (value && value instanceof Date) {
      this.__selectedDate = value;
      this.__currentMonth = value.getMonth();
      this.__currentYear = value.getFullYear();
      this.__updateDisplay();
      if (this.__isOpen) {
        this.__renderCalendar();
      }
    } else {
      this.__selectedDate = null;
      this.__updateDisplay();
    }
  }

  private __applyEnabled(enabled: boolean): void {
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
      const monthPick = container.querySelector(
        `#${this.__dateId}-month-label`,
      ) as HTMLButtonElement | null;
      const yearPick = container.querySelector(
        `#${this.__dateId}-year-label`,
      ) as HTMLButtonElement | null;
      if (monthPick) monthPick.disabled = !enabled;
      if (yearPick) yearPick.disabled = !enabled;
    }
  }

  getValue(): Date | null {
    return this.__value;
  }

  setValue(value: Date | null): this {
    const next =
      value && value instanceof Date && !isNaN(value.getTime()) ? value : null;
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

  resetValue(): void {
    this.setValue(null);
  }

  override focus(): void {
    if (this.__inputElement) {
      this.__inputElement.focus();
    }
  }

  blur(): void {
    if (this.__inputElement) {
      this.__inputElement.blur();
    }
    this.__closeCalendar();
  }
}
