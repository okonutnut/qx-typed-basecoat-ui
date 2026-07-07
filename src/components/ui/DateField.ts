class BsDateField extends qx.ui.basic.Atom {
  static events = {
    changeValue: "qx.event.type.Data",
  };

  private __html: qx.ui.embed.Html | null = null;
  private __dateId: string;
  private __inputElement: HTMLInputElement | null = null;
  private __iconButton: HTMLButtonElement | null = null;
  private __popoverElement: HTMLElement | null = null;
  private __calendarElement: HTMLElement | null = null;
  private __isOpen: boolean = false;
  private __currentMonth: number;
  private __currentYear: number;
  private __selectedDate: Date | null = null;
  private __popoverContainer: HTMLDivElement | null = null;
  private __updatePositionHandler: ((ev: Event) => void) | null = null;
  private __clickHandler: ((ev: MouseEvent) => void) | null = null;
  private __calendarClickHandler: ((ev: MouseEvent) => void) | null = null;
  private __value: Date | null = null;
  private __disabled = false;

  constructor() {
    super();

    // Set a layout so children get measured and laid out
    this._setLayout(new qx.ui.layout.Canvas());

    // Generate unique ID for the component
    this.__dateId = `date-${qx.core.Id.getInstance().toHashCode(this)}`;
    this.__isOpen = false;
    this.__currentMonth = new Date().getMonth();
    this.__currentYear = new Date().getFullYear();

    // Create HTML with Basecoat input structure (similar to TextField)
    this.__html = new qx.ui.embed.Html(`
      <div style="margin: 0; padding: 0; min-width: 0; display: flex; align-items: center; height: 100%; position: relative; width: 100%;">
        <input 
          type="text" 
          class="input" 
          id="${this.__dateId}-trigger" 
          style="width: 100%; padding-right: calc(var(--spacing) * 8); cursor: text;"
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
          style="display: none !important; visibility: hidden !important; position: absolute; top: 100%; left: 0; margin-top: 2px; z-index: 10001; width: auto !important; min-width: 0 !important; max-width: none !important; background-color: var(--popover); color: var(--popover-foreground); border-radius: calc(var(--radius) - 2px); border: 1px solid var(--border); box-shadow: var(--shadow-md);"
        >
          <div id="${this.__dateId}-calendar" role="dialog" aria-label="Calendar" style="padding: calc(var(--spacing) * 0.75); box-sizing: border-box; width: 100% !important; min-width: 0 !important; max-width: 100% !important; pointer-events: auto !important;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: calc(var(--spacing) * 0.75);">
              <button type="button" id="${this.__dateId}-prev-month" style="background: none; border: none; cursor: pointer; padding: calc(var(--spacing) * 0.5); display: flex; align-items: center; color: var(--foreground); pointer-events: auto; z-index: 10; position: relative;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m15 18-6-6 6-6"></path>
                </svg>
              </button>
              <div id="${this.__dateId}-month-year" style="font-weight: 500; font-size: var(--text-sm);"></div>
              <button type="button" id="${this.__dateId}-next-month" style="background: none; border: none; cursor: pointer; padding: calc(var(--spacing) * 0.5); display: flex; align-items: center; color: var(--foreground); pointer-events: auto; z-index: 10; position: relative;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: calc(var(--spacing) * 0.15); margin-bottom: calc(var(--spacing) * 0.4);">
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Sun</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Mon</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Tue</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Wed</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Thu</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Fri</div>
              <div style="text-align: center; font-size: var(--text-xs); font-weight: 500; color: var(--muted-foreground); padding: calc(var(--spacing) * 0.25);">Sat</div>
            </div>
            <div id="${this.__dateId}-days" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: calc(var(--spacing) * 0.15);"></div>
          </div>
        </div>
        <input type="hidden" name="${this.__dateId}-value" value="" />
      </div>
    `);

    // Add child with layout properties
    this._add(this.__html, { edge: 0 });

    // Listen to enabled property changes
    this.addListener("changeEnabled", (e: qx.event.type.Data) => {
      this.__applyEnabled(e.getData());
    }, this);

    // Hook DOM events after the element appears
    this.__html.addListenerOnce("appear", () => {
      const widgetElement = this.getContentElement();
      if (widgetElement) {
        widgetElement.setStyle("overflow", "visible");
        widgetElement.setStyle("z-index", "1");
        widgetElement.setStyle("min-width", "0");
      }

      // Ensure container respects widget width
      const container = this.__getContainerElement();
      if (container) {
        container.style.minWidth = "0";
      }

      this.__setupDatePickerEvents();
      this.__renderCalendar();
      this.__applyEnabled(!this.__disabled);
      const initialValue = this.__value;
      if (initialValue) {
        this.__applyValue(initialValue);
      }
      
      // Make widget content element delegate focus to input
      if (widgetElement) {
        const domElement = widgetElement.getDomElement();
        if (domElement) {
          // When widget receives focus, delegate to input
          domElement.addEventListener("focusin", (e) => {
            const input = this.__inputElement;
            if (input && e.target === domElement) {
              input.focus();
            }
          });
        }
      }
    });
  }

  /**
   * Setup event listeners for the date picker
   */
  private __setupDatePickerEvents(): void {
    const container = this.__getContainerElement();
    if (!container) return;

    this.__inputElement = container.querySelector(`#${this.__dateId}-trigger`);
    this.__iconButton = container.querySelector(`#${this.__dateId}-icon-btn`);
    this.__popoverElement = container.querySelector(`#${this.__dateId}-popover`);
    this.__calendarElement = container.querySelector(`#${this.__dateId}-calendar`);

    if (!this.__inputElement || !this.__popoverElement || !this.__calendarElement) {
      return;
    }

    // Exclude qooxdoo widget content element from tab order
    const widgetElement = this.getContentElement();
    if (widgetElement) {
      const domElement = widgetElement.getDomElement();
      if (domElement) {   
        domElement.setAttribute("tabindex", "-1");
      }
    }
    
    // Exclude wrapper div from tab order so tabbing goes directly to input
    const wrapperDiv = container.querySelector("div");
    if (wrapperDiv) {
      wrapperDiv.setAttribute("tabindex", "-1");
    }
    
    // Ensure input is focusable - remove any tabindex that might prevent tab navigation
    if (this.__inputElement.hasAttribute("tabindex") && this.__inputElement.getAttribute("tabindex") === "-1") {
      this.__inputElement.removeAttribute("tabindex");
    }
    // Ensure input is explicitly in tab order
    this.__inputElement.removeAttribute("tabindex"); // Remove any existing tabindex
    // Native inputs are focusable by default - no tabindex needed

    // Handle Tab key to prevent widget wrapper from interfering
    this.__inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        // Allow Tab to work normally - don't prevent default
        // This ensures tab navigation works properly
        e.stopPropagation(); // Prevent widget wrapper from handling it
      }
    });

    // Input click - allow direct typing, don't open calendar
    // The calendar icon button will handle opening the calendar

    // Handle direct date input with strict formatting
    this.__inputElement.addEventListener("input", (e) => {
      this.__formatDateInput(e.target as HTMLInputElement);
      this.__handleDateInput((e.target as HTMLInputElement).value);
    });

    // Prevent invalid characters (only digits and slashes)
    this.__inputElement.addEventListener("keypress", (e) => {
      const char = String.fromCharCode(e.which || e.keyCode);
      // Allow digits, slashes, and control keys
      if (!/[0-9/]/.test(char) && !/[0-8]/.test(e.key) && 
          e.key !== 'Backspace' && e.key !== 'Delete' && 
          e.key !== 'Tab' && e.key !== 'ArrowLeft' && 
          e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && 
          e.key !== 'ArrowDown' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }
    });

    // Prevent paste of invalid content
    this.__inputElement.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedText = (e.clipboardData || (window as any).clipboardData).getData('text');
      // Remove all non-digit characters except slashes
      const cleaned = pastedText.replace(/[^\d/]/g, '');
      // Format the cleaned input
      const formatted = this.__formatDateString(cleaned);
      this.__inputElement!.value = formatted;
      this.__handleDateInput(formatted);
    });

    // Icon button click to toggle calendar
    if (this.__iconButton) {
      this.__iconButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.__disabled) {
          this.__toggleCalendar();
        }
      }, true);
    }

    // Previous/Next month buttons
    const prevBtn = container.querySelector(`#${this.__dateId}-prev-month`);
    const nextBtn = container.querySelector(`#${this.__dateId}-next-month`);
    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.__changeMonth(-1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.__changeMonth(1);
      });
    }

    // Click outside to close
    this.__clickHandler = (e) => {
      if (!this.__isOpen) return;

      const target = e.target as Node;

      // Check if click is on navigation buttons - if so, don't close
      const prevBtnEl = this.__popoverElement?.querySelector(`#${this.__dateId}-prev-month`);
      const nextBtnEl = this.__popoverElement?.querySelector(`#${this.__dateId}-next-month`);
      if ((prevBtnEl && (prevBtnEl === target || prevBtnEl.contains(target))) ||
          (nextBtnEl && (nextBtnEl === target || nextBtnEl.contains(target)))) {
        return; // Let the button handler process it
      }

      const isInCalendar = this.__calendarElement && this.__calendarElement.contains(target);
      const isInInput = this.__inputElement && this.__inputElement.contains(target);
      const isInIcon = this.__iconButton && this.__iconButton.contains(target);

      if (!isInCalendar && !isInInput && !isInIcon) {
        this.__closeCalendar();
      }
    };
  }

  /**
   * Get the container DOM element
   */
  private __getContainerElement(): HTMLElement | null {
    if (this.__html && this.__html.getContentElement()) {
      return this.__html.getContentElement().getDomElement();
    }
    return null;
  }

  /**
   * Update popover position (for scroll/resize)
   */
  private __updatePopoverPosition(): void {
    if (!this.__isOpen || !this.__inputElement || !this.__popoverElement) {
      return;
    }

    const buttonRect = this.__inputElement.getBoundingClientRect();
    const top = buttonRect.bottom + window.scrollY + 2;
    const left = buttonRect.left + window.scrollX;
    const width = buttonRect.width;

    this.__popoverElement.style.setProperty("top", `${top}px`, "important");
    this.__popoverElement.style.setProperty("left", `${left}px`, "important");
    this.__popoverElement.style.setProperty("width", `${width}px`, "important");

    // Make calendar match popover width
    if (this.__popoverElement) {
      const calendarElement = this.__popoverElement.querySelector(`#${this.__dateId}-calendar`) as HTMLElement;
      if (calendarElement) {
        calendarElement.style.setProperty("width", `${width}px`, "important");
        calendarElement.style.setProperty("max-width", `${width}px`, "important");
        calendarElement.style.setProperty("min-width", `${width}px`, "important");
      }
    }
  }

  /**
   * Toggle calendar open/closed
   */
  private __toggleCalendar(): void {
    if (this.__isOpen) {
      this.__closeCalendar();
    } else {
      this.__openCalendar();
    }
  }

  /**
   * Open the calendar
   */
  private __openCalendar(): void {
    if (!this.__popoverElement || !this.__inputElement) {
      return;
    }
    
    // Ensure __popoverElement is a DOM element
    if (typeof (this.__popoverElement as any).querySelector !== 'function') {
      console.error('DateField: _popoverElement is not a valid DOM element');
      return;
    }

    this.__isOpen = true;

    // Move popover to body to escape overflow constraints
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

    // Re-query calendar element after moving to body (in case reference is stale)
    if (this.__popoverElement) {
      this.__calendarElement = this.__popoverElement.querySelector(`#${this.__dateId}-calendar`);
    }

    // Use event delegation on the calendar element for navigation buttons
    if (this.__calendarElement) {
      // Remove old listener if exists
      if (this.__calendarClickHandler) {
        this.__calendarElement.removeEventListener("click", this.__calendarClickHandler);
      }

      // Add new event delegation handler
      this.__calendarClickHandler = (e) => {
        let target = e.target as HTMLElement | null;

        // Traverse up to find the button if clicking on SVG or path
        while (target && target !== this.__calendarElement) {
          if (target.id === `${this.__dateId}-prev-month`) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.__changeMonth(-1);
            return;
          }
          if (target.id === `${this.__dateId}-next-month`) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.__changeMonth(1);
            return;
          }
          target = target.parentElement;
        }
      };

      this.__calendarElement.addEventListener("click", this.__calendarClickHandler, true);
    }

    // Remove aria-hidden
    this.__popoverElement.removeAttribute("aria-hidden");

    // Position popover
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

    // Add scroll/resize listeners
    this.__updatePositionHandler = this.__updatePopoverPosition.bind(this);
    window.addEventListener("scroll", this.__updatePositionHandler, true);
    window.addEventListener("resize", this.__updatePositionHandler);

    // Add click outside listener
    if (this.__clickHandler) {
      setTimeout(() => {
        document.addEventListener("click", this.__clickHandler!, true);
      }, 0);
    }

    // Render calendar for current month
    this.__renderCalendar();
  }

  /**
   * Close the calendar
   */
  private __closeCalendar(): void {
    if (!this.__popoverElement || !this.__inputElement) {
      return;
    }

    this.__isOpen = false;

    // Remove scroll/resize listeners
    if (this.__updatePositionHandler) {
      window.removeEventListener("scroll", this.__updatePositionHandler, true);
      window.removeEventListener("resize", this.__updatePositionHandler);
      this.__updatePositionHandler = null;
    }

    // Remove document click listener
    if (this.__clickHandler) {
      document.removeEventListener("click", this.__clickHandler, true);
      this.__clickHandler = null;
    }

    // Remove calendar click handler
    if (this.__calendarClickHandler && this.__calendarElement) {
      this.__calendarElement.removeEventListener("click", this.__calendarClickHandler, true);
      this.__calendarClickHandler = null;
    }

    this.__popoverElement.setAttribute("aria-hidden", "true");
    this.__popoverElement.style.setProperty("display", "none", "important");
    this.__popoverElement.style.setProperty("visibility", "hidden", "important");
    this.__inputElement.setAttribute("aria-expanded", "false");

    // Move popover back to original container
    const container = this.__getContainerElement();
    if (container && this.__popoverElement.parentNode === this.__popoverContainer) {
      container.appendChild(this.__popoverElement);
    }
  }

  /**
   * Change month
   */
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

  /**
   * Render the calendar grid
   */
  private __renderCalendar(): void {
    // Query from popover element to work both before and after moving to body
    // If popoverElement exists (after setup), use it; otherwise use container
    let searchRoot: HTMLElement | null = null;
    if (this.__popoverElement) {
      searchRoot = this.__popoverElement;
    } else {
      const container = this.__getContainerElement();
      if (container) {
        searchRoot = container;
      }
    }

    if (!searchRoot) return;

    const daysContainer = searchRoot.querySelector(`#${this.__dateId}-days`) as HTMLElement;
    const monthYearDisplay = searchRoot.querySelector(`#${this.__dateId}-month-year`) as HTMLElement;

    if (!daysContainer || !monthYearDisplay) return;

    // Update month/year display
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearDisplay.textContent = `${monthNames[this.__currentMonth]} ${this.__currentYear}`;

    // Clear days container
    daysContainer.innerHTML = "";

    // Get first day of month and number of days
    const firstDay = new Date(this.__currentYear, this.__currentMonth, 1).getDay();
    const daysInMonth = new Date(this.__currentYear, this.__currentMonth + 1, 0).getDate();
    const today = new Date();
    const selectedDate = this.__selectedDate;

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const cell = document.createElement("div");
      cell.style.padding = "calc(var(--spacing) * 0.25)";
      daysContainer.appendChild(cell);
    }

    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.textContent = day.toString();
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
      const isSelected = selectedDate && cellDate.toDateString() === selectedDate.toDateString();

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
  }

  /**
   * Select a date
   */
  private __selectDate(date: Date): void {
    this.__selectedDate = date;
    this.setValue(date);
    this.__updateDisplay();
    this.__closeCalendar();
  }

  /**
   * Update the display text
   */
  private __updateDisplay(): void {
    if (!this.__inputElement) return;

    if (this.__selectedDate) {
      const month = String(this.__selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(this.__selectedDate.getDate()).padStart(2, "0");
      const year = this.__selectedDate.getFullYear();
      this.__inputElement.value = `${month}/${day}/${year}`;
    } else {
      this.__inputElement.value = "";
    }
  }

  /**
   * Handle direct date input from user
   */
  private __handleDateInput(value: string): void {
    if (!value || value.trim() === "") {
      this.__selectedDate = null;
      this.setValue(null);
      return;
    }

    // Parse MM/DD/YYYY format
    const date = this.__parseDateInput(value);
    if (date && !isNaN(date.getTime())) {
      this.__selectedDate = date;
      this.setValue(date);
      // Update calendar to show the entered month/year
      this.__currentMonth = date.getMonth();
      this.__currentYear = date.getFullYear();
      if (this.__isOpen) {
        this.__renderCalendar();
      }
    }
  }

  /**
   * Format date string to MM/DD/YYYY format
   */
  private __formatDateString(digits: string): string {
    let formatted = '';
    if (digits.length > 0) {
      formatted = digits.substring(0, 2);
    }
    if (digits.length > 2) {
      formatted += '/' + digits.substring(2, 4);
    }
    if (digits.length > 4) {
      formatted += '/' + digits.substring(4, 8);
    }
    return formatted;
  }

  /**
   * Format date input as user types (strict MM/DD/YYYY)
   */
  private __formatDateInput(input: HTMLInputElement): void {
    let value = input.value;
    const cursorPos = input.selectionStart ?? 0;
    
    // Remove all non-digit characters
    let digits = value.replace(/[^\d]/g, '');
    
    // Limit to 8 digits (MMDDYYYY)
    if (digits.length > 8) {
      digits = digits.substring(0, 8);
    }
    
    // Format with slashes: MM/DD/YYYY
    const formatted = this.__formatDateString(digits);
    
    // Validate month (01-12)
    if (digits.length >= 2) {
      const month = parseInt(digits.substring(0, 2), 10);
      if (month > 12) {
        // Invalid month, keep only first digit
        digits = digits.substring(0, 1);
        const newFormatted = this.__formatDateString(digits);
        input.value = newFormatted;
        setTimeout(() => {
          input.setSelectionRange(newFormatted.length, newFormatted.length);
        }, 0);
        return;
      }
    }
    
    // Validate day (01-31) - basic check
    if (digits.length >= 4) {
      const day = parseInt(digits.substring(2, 4), 10);
      if (day > 31) {
        // Invalid day, keep only first 3 digits
        digits = digits.substring(0, 3);
        const newFormatted = this.__formatDateString(digits);
        input.value = newFormatted;
        setTimeout(() => {
          input.setSelectionRange(newFormatted.length, newFormatted.length);
        }, 0);
        return;
      }
    }

    // Update value if changed
    if (input.value !== formatted) {
      input.value = formatted;
      // Adjust cursor position after formatting
      let newCursorPos = cursorPos;
      const oldLength = value.length;
      const newLength = formatted.length;
      
      // If a slash was added, move cursor forward
      if (newLength > oldLength) {
        newCursorPos = cursorPos + (newLength - oldLength);
      } else if (newLength < oldLength) {
        // If characters were removed, adjust cursor
        newCursorPos = Math.max(0, cursorPos - (oldLength - newLength));
      }
      
      // Ensure cursor doesn't go beyond the formatted string
      newCursorPos = Math.min(newCursorPos, formatted.length);
      
      setTimeout(() => {
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  }

  /**
   * Parse MM/DD/YYYY string to Date object
   */
  private __parseDateInput(value: string): Date | null {
    if (!value) return null;
    
    // Remove any non-digit characters except slashes
    const cleaned = value.replace(/[^\d/]/g, '');
    const parts = cleaned.split('/');
    
    if (parts.length !== 3) return null;
    
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    // Validate ranges
    if (isNaN(month) || month < 1 || month > 12) return null;
    if (isNaN(day) || day < 1 || day > 31) return null;
    if (isNaN(year) || year < 1900 || year > 2100) return null;
    
    // Create date and validate (handles invalid dates like Feb 30)
    const date = new Date(year, month - 1, day);
    if (date.getMonth() !== month - 1 || date.getDate() !== day || date.getFullYear() !== year) {
      return null; // Invalid date
    }
    
    return date;
  }

  /**
   * Convert Date object to YYYY-MM-DD string
   */
  private __dateToString(date: Date): string {
    if (!date || !(date instanceof Date)) {
      return "";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Apply value changes
   */
  private __applyValue(value: Date | null): void {
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

  /**
   * Apply enabled state
   */
  private __applyEnabled(enabled: boolean): void {
    if (this.__inputElement) {
      this.__inputElement.disabled = !enabled;
    }
    if (this.__iconButton) {
      this.__iconButton.disabled = !enabled;
      this.__iconButton.style.pointerEvents = enabled ? "auto" : "none";
      this.__iconButton.style.opacity = enabled ? "1" : "0.5";
    }
  }

  /**
   * Get the current value
   */
  public getValue(): Date | null {
    return this.__selectedDate || null;
  }

  /**
   * Set the date value
   */
  public setValue(value: Date | null): this {
    this.__value = value;
    this.fireDataEvent("changeValue", value);
    this.__applyValue(value);
    return this;
  }

  /**
   * Set enabled state
   */
  public setEnabled(enabled: boolean): this {
    this.__disabled = !enabled;
    this.__applyEnabled(enabled);
    return this;
  }

  /**
   * Listen to value changes
   */
  public onChange(handler: (value: Date | null) => void): this {
    this.addListener("changeValue", (ev: qx.event.type.Data) => {
      handler(ev.getData() as Date | null);
    });
    return this;
  }

  /**
   * Get the current value (alias)
   */
  public getValueDate(): Date | null {
    return this.__selectedDate || null;
  }

  /**
   * Reset the date field value
   */
  public resetValue(): this {
    this.setValue(null);
    return this;
  }

  /**
   * Set focus on the date field
   */
  public focus(): void {
    if (this.__inputElement) {
      this.__inputElement.focus();
    }
  }

  /**
   * Remove focus from the date field
   */
  public blur(): void {
    if (this.__inputElement) {
      this.__inputElement.blur();
    }
    this.__closeCalendar();
  }

  /**
   * Destructor
   */
  public destruct(): void {
    this.__closeCalendar();
    if (this.__popoverContainer && this.__popoverContainer.parentNode) {
      this.__popoverContainer.parentNode.removeChild(this.__popoverContainer);
    }
    super.destruct();
  }
}
