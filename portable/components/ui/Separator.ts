class BsSeparator extends qx.ui.basic.Atom {
  private __htmlSeparator: qx.ui.embed.Html;
  private __orientation: "horizontal" | "vertical";
  private __decorative: boolean;
  private __className: string;
  private __label: string;
  private __resizeObserver: ResizeObserver | null = null;
  private __cachedContentWidth = 0;
  private __cachedContentHeight = 0;

  constructor(
    orientation: "horizontal" | "vertical" = "horizontal",
    decorative = true,
    className?: string,
    label?: string,
  ) {
    super();

    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);
    this.setAllowGrowY(true);

    this.__orientation = orientation;
    this.__decorative = decorative;
    this.__className = className ?? "";
    this.__label = label ?? "";

    this.__htmlSeparator = new qx.ui.embed.Html("");
    this.__htmlSeparator.setAllowGrowX(true);

    this.__render();
    this._add(this.__htmlSeparator);

    this.__setupResizeObserver();
  }

  private __setupResizeObserver(): void {
    const root = this.__htmlSeparator.getContentElement().getDomElement();
    if (!root) {
      qx.event.Timer.once(() => this.__setupResizeObserver(), this, 50);
      return;
    }

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
    const contentEl = this.__htmlSeparator.getContentElement()?.getDomElement();
    if (contentEl) {
      return { width: contentEl.scrollWidth || 0, height: contentEl.scrollHeight || 0 };
    }
    return { width: 0, height: 0 };
  }

  private __escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  private __render(): void {
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

  public setLabel(value: string): this {
    this.__label = value ?? "";
    this.__render();
    return this;
  }
}
