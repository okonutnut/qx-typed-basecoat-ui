type BsBasecoatToolTipSide = "top" | "bottom" | "left" | "right";
type BsBasecoatToolTipAlign = "start" | "center" | "end";

type BsBasecoatButtonVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

type BsBasecoatButtonSize =
  | "default"
  | "sm"
  | "lg"
  | "icon"
  | "sm-icon"
  | "lg-icon";

/**
 * Widget-based Basecoat button matching new_proj `myapp.components.ui.Button`:
 * `btn` + optional `btn-{variant}` + `btn-{size}`, native click, {@link BsTooltip} helpers.
 * For the Atom-based control used across the app, see {@link BsButton} in Button.ts.
 */
class BsBasecoatButton extends qx.ui.core.Widget {
  static events = {
    execute: "qx.event.type.Event",
  };

  private __html: qx.ui.embed.Html;
  private __buttonEl: HTMLButtonElement | null = null;
  private __label = "";
  private __iconHtml = "";
  private readonly __variant: BsBasecoatButtonVariant;
  private readonly __size: BsBasecoatButtonSize;
  private readonly __extraClassName: string;
  private __toolTip: BsTooltip | null = null;

  constructor(
    text?: string,
    icon?: InlineSvgIcon,
    options?: {
      variant?: BsBasecoatButtonVariant;
      size?: BsBasecoatButtonSize;
      className?: string;
    },
  ) {
    super();

    this._setLayout(new qx.ui.layout.Canvas());
    this.setFocusable(true);
    this.setAllowGrowX(true);

    this.__label = text ?? "";
    this.__iconHtml = icon ? icon.getHtml() : "";
    this.__variant = options?.variant ?? "default";
    this.__size = options?.size ?? "default";
    this.__extraClassName = options?.className ?? "";

    this.__html = new qx.ui.embed.Html("");
    this._add(this.__html, { edge: 0 });

    this.__render();

    this.__html.addListenerOnce("appear", () => {
      this.__bindButton();
    });

    this.addListener("focusin", () => {
      this.__buttonEl?.focus();
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

  private __variantClassSegment(): string {
    const map: Record<BsBasecoatButtonVariant, string> = {
      default: "primary",
      secondary: "secondary",
      destructive: "destructive",
      outline: "outline",
      ghost: "ghost",
      link: "link",
    };
    return map[this.__variant];
  }

  private __sizeClassSegment(): string {
    if (this.__size === "default") return "";
    return this.__size;
  }

  private __buildButtonClasses(): string {
    const parts = ["btn"];
    const v = this.__variantClassSegment();
    if (v) parts.push(`btn-${v}`);
    const s = this.__sizeClassSegment();
    if (s) parts.push(`btn-${s}`);
    if (this.__extraClassName) {
      parts.push(this.__extraClassName);
    }
    return parts.join(" ");
  }

  private __escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private __render(): void {
    const classes = this.__buildButtonClasses();
    const hasIcon = this.__iconHtml.length > 0;
    const iconGap =
      hasIcon && this.__label.length > 0
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

  private __bindButton(): void {
    const root = this.__html.getContentElement()?.getDomElement() as
      | HTMLElement
      | null
      | undefined;
    this.__buttonEl =
      (root?.querySelector("button") as HTMLButtonElement) ?? null;
    if (!this.__buttonEl) return;

    this.__buttonEl.onclick = () => {
      this.fireEvent("execute");
    };

    this.__syncTabIndex();
    this.__refreshTooltipOnDom();
  }

  private __syncTabIndex(): void {
    if (!this.__buttonEl) return;
    this.__buttonEl.setAttribute("tabindex", "-1");
  }

  private __refreshTooltipOnDom(): void {
    if (this.__toolTip) {
      this.__toolTip.attachTo(this);
    }
  }

  setLabel(label: string): this {
    this.__label = String(label || "");
    this.__render();
    return this;
  }

  getLabel(): string {
    return this.__label;
  }

  setBasecoatToolTip(
    text: string,
    side: BsBasecoatToolTipSide = "top",
    align: BsBasecoatToolTipAlign = "center",
  ): this {
    if (!this.__toolTip) {
      this.__toolTip = new BsTooltip(
        String(text || ""),
        side || "top",
        align || "center",
      );
      this.__toolTip.attachTo(this);
    } else {
      this.__toolTip.setText(String(text || ""));
      this.__toolTip.setSide(side || "top");
      this.__toolTip.setAlign(align || "center");
      this.__toolTip.attachTo(this);
    }
    return this;
  }

  clearBasecoatToolTip(): this {
    if (!this.__toolTip) return this;
    this.__toolTip.detachFrom(this);
    this.__toolTip.dispose();
    this.__toolTip = null;
    return this;
  }

  getBasecoatToolTip(): BsTooltip | null {
    return this.__toolTip;
  }

  getVariant(): BsBasecoatButtonVariant {
    return this.__variant;
  }

  getSize(): BsBasecoatButtonSize {
    return this.__size;
  }

  onClick(handler: () => void): this {
    this.addListener("execute", handler);
    return this;
  }

  destruct(): void {
    this.clearBasecoatToolTip();
    super.destruct();
  }
}
