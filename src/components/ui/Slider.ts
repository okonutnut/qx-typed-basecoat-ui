class BsSlider extends qx.ui.basic.Atom {
  static events = {
    input: "qx.event.type.Data",
    changeValue: "qx.event.type.Data",
  };

  private __htmlEmbed: qx.ui.embed.Html;
  private __min: number;
  private __max: number;
  private __value: number;
  private __step: number;
  private __disabled: boolean;
  private __inputEl: HTMLInputElement | null = null;
  private __resizeObserver: ResizeObserver | null = null;
  private __cachedContentWidth = 0;
  private __cachedContentHeight = 0;

  constructor(min?: number, max?: number, value?: number, step?: number) {
    super();

    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);
    this.setFocusable(true);

    this.__min = min ?? 0;
    this.__max = max ?? 100;
    this.__value = value ?? 50;
    this.__step = step ?? 1;
    this.__disabled = false;

    this.__htmlEmbed = new qx.ui.embed.Html("");
    this.__htmlEmbed.setAllowGrowX(true);

    this.__render();
    this._add(this.__htmlEmbed);

    this.__htmlEmbed.addListenerOnce("appear", () => {
      const root = this.__htmlEmbed.getContentElement().getDomElement();
      this.__inputEl = root?.querySelector("input") as HTMLInputElement | null;
      if (!this.__inputEl) return;

      this.__syncTabIndex();
      this.__updateSliderTrack();

      this.__inputEl.addEventListener("input", () => {
        const newValue = parseFloat(this.__inputEl?.value ?? "0");
        this.__value = newValue;
        this.__updateSliderTrack();
        this.fireDataEvent("input", newValue);
        this.fireDataEvent("changeValue", newValue);
      });

      this.__inputEl.addEventListener("change", () => {
        const newValue = parseFloat(this.__inputEl?.value ?? "0");
        this.__value = newValue;
        this.__updateSliderTrack();
        this.fireDataEvent("changeValue", newValue);
      });

      this.__setupResizeObserver();
    });

    this.addListener("focusin", () => {
      this.__inputEl?.focus();
    });

    this.addListener("changeTabIndex", () => {
      this.__syncTabIndex();
    });
  }

  private __syncTabIndex(): void {
    if (!this.__inputEl) return;
    this.__inputEl.setAttribute("tabindex", "1");
  }

  private __setupResizeObserver(): void {
    const root = this.__htmlEmbed.getContentElement().getDomElement();
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
    const contentEl = this.__htmlEmbed.getContentElement()?.getDomElement();
    if (contentEl) {
      return { width: contentEl.scrollWidth || 0, height: contentEl.scrollHeight || 0 };
    }
    return { width: 0, height: 0 };
  }

  private __updateSliderTrack(): void {
    if (!this.__inputEl) return;
    const min = this.__min;
    const max = this.__max;
    const val = this.__value;
    const percent = max === min ? 0 : ((val - min) / (max - min)) * 100;
    this.__inputEl.style.setProperty("--slider-value", `${percent}%`);
  }

  private __render(): void {
    const disabledAttr = this.__disabled ? "disabled" : "";
    const tabIndexAttr = 'tabindex="-1"';

    this.__htmlEmbed.setHtml(`
      <div class="w-full py-3 px-1">
        <input
          type="range"
          class="input w-full"
          min="${this.__min}"
          max="${this.__max}"
          value="${this.__value}"
          step="${this.__step}"
          ${disabledAttr}
          ${tabIndexAttr}
        />
      </div>
    `);

    this.__updateSliderTrack();
  }

  public getValue(): number {
    return this.__value;
  }

  public setValue(value: number): this {
    this.__value = value;
    if (this.__inputEl) {
      this.__inputEl.value = String(value);
      this.__updateSliderTrack();
    } else {
      this.__render();
    }
    return this;
  }

  public setMin(value: number): this {
    this.__min = value;
    if (this.__inputEl) {
      this.__inputEl.min = String(value);
      this.__updateSliderTrack();
    } else {
      this.__render();
    }
    return this;
  }

  public setMax(value: number): this {
    this.__max = value;
    if (this.__inputEl) {
      this.__inputEl.max = String(value);
      this.__updateSliderTrack();
    } else {
      this.__render();
    }
    return this;
  }

  public setStep(value: number): this {
    this.__step = value;
    if (this.__inputEl) {
      this.__inputEl.step = String(value);
    } else {
      this.__render();
    }
    return this;
  }

  public setEnabled(enabled: boolean): this {
    this.__disabled = !enabled;
    if (this.__inputEl) {
      this.__inputEl.disabled = this.__disabled;
    } else {
      this.__render();
    }
    return this;
  }

  public isEnabled(): boolean {
    return !this.__disabled;
  }

  public onInput(handler: (value: number) => void): this {
    this.addListener("input", (ev: qx.event.type.Data) => {
      handler((ev.getData() as number) ?? 0);
    });
    return this;
  }

  public onChangeValue(handler: (value: number) => void): this {
    this.addListener("changeValue", (ev: qx.event.type.Data) => {
      handler((ev.getData() as number) ?? 0);
    });
    return this;
  }
}
