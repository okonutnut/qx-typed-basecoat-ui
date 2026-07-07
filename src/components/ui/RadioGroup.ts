class BsRadioGroup extends qx.ui.basic.Atom {
  static events = {
    changeValue: "qx.event.type.Data",
  };

  private __htmlEmbed: qx.ui.embed.Html;
  private __name: string;
  private __options: { value: string; label: string; disabled?: boolean }[];
  private __value: string;
  private __disabled: boolean;
  private __fieldSetEl: HTMLFieldSetElement | null = null;
  private __inputEls: HTMLInputElement[] = [];
  private __resizeObserver: ResizeObserver | null = null;
  private __cachedContentWidth = 0;
  private __cachedContentHeight = 0;

  constructor(
    options: { value: string; label: string; disabled?: boolean }[],
    name?: string,
    initialValue?: string,
  ) {
    super();

    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);

    this.__options = options ?? [];
    this.__name = name ?? `radio-group-${Math.random().toString(36).slice(2)}`;
    this.__value = initialValue ?? "";
    this.__disabled = false;

    this.__htmlEmbed = new qx.ui.embed.Html("");
    this._add(this.__htmlEmbed);

    this.__render();

    this.__htmlEmbed.addListenerOnce("appear", () => {
      this.__initInputListeners();
      this.__setupResizeObserver();
    });
  }

  private __render(): void {
    const disabledAttr = this.__disabled ? "disabled" : "";
    const optionsHtml = this.__options
      .map(
        (opt) => `
        <label class="font-normal${opt.disabled ? " opacity-50" : ""}">
          <input
            type="radio"
            name="${this.__name}"
            value="${opt.value}"
            class="input"
            ${opt.disabled ? "disabled" : ""}
            ${this.__value === opt.value ? "checked" : ""}
          />
          ${opt.label}
        </label>
      `,
      )
      .join("");

    this.__htmlEmbed.setHtml(`
      <fieldset class="grid gap-3">
        ${optionsHtml}
      </fieldset>
    `);
  }

  private __initInputListeners(): void {
    const root = this.__htmlEmbed.getContentElement().getDomElement();
    if (!root) return;

    this.__fieldSetEl = root.querySelector("fieldset");
    this.__inputEls = Array.from(
      root.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    );

    this.__inputEls.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          this.__value = input.value;
          this.fireDataEvent("changeValue", input.value);
        }
      });
    });
  }

  public getValue(): string {
    return this.__value;
  }

  public setValue(value: string): this {
    this.__value = value;
    this.__inputEls.forEach((input) => {
      input.checked = input.value === value;
    });
    return this;
  }

  public setOptions(
    options: { value: string; label: string; disabled?: boolean }[],
  ): this {
    this.__options = options;
    this.__render();

    this.__htmlEmbed.addListenerOnce("appear", () => {
      this.__initInputListeners();
    });

    return this;
  }

  public getOptions() {
    return this.__options;
  }

  public setEnabled(enabled: boolean): this {
    this.__disabled = !enabled;
    if (this.__fieldSetEl) {
      this.__fieldSetEl.disabled = this.__disabled;
    }
    return this;
  }

  public isEnabled(): boolean {
    return !this.__disabled;
  }

  public onChangeValue(handler: (value: string) => void): this {
    this.addListener("changeValue", (ev: qx.event.type.Data) => {
      handler((ev.getData() as string) ?? "");
    });
    return this;
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
}
