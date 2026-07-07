type BsAvatarShape = "full" | "rounded" | "square";

class BsAvatar extends qx.ui.basic.Atom {
  private __htmlAvatar: qx.ui.embed.Html;
  private __src: string;
  private __alt: string;
  private __fallback: string;
  private __className: string;
  private __shape: BsAvatarShape;
  private __imgEl: HTMLImageElement | null = null;
  private __fallbackEl: HTMLSpanElement | null = null;
  private __wrapperEl: HTMLElement | null = null;
  private __hasImageError = false;
  private __resizeObserver: ResizeObserver | null = null;
  private __cachedContentWidth = 32;
  private __cachedContentHeight = 32;

  constructor(
    src?: string,
    alt?: string,
    fallback?: string,
    className?: string,
    shape: BsAvatarShape = "full",
  ) {
    super();

    this._setLayout(new qx.ui.layout.Grow());

    this.__src = src ?? "";
    this.__alt = alt ?? "User avatar";
    this.__fallback = fallback ?? "?";
    this.__className = className ?? "";
    this.__shape = shape;

    this.__htmlAvatar = new qx.ui.embed.Html("");
    this.__render();
    this._add(this.__htmlAvatar);

    this.__htmlAvatar.addListenerOnce("appear", () => {
      this.__bindDom();
      this.__setupResizeObserver();
    });
  }

  private __escape(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  private __resolveShapeClass(): string {
    if (this.__shape === "rounded") return "rounded-md";
    if (this.__shape === "square") return "rounded-none";
    return "rounded-full";
  }

  private __bindDom(): void {
    const root = this.__htmlAvatar.getContentElement().getDomElement();
    this.__imgEl = (root?.querySelector("img") as HTMLImageElement) ?? null;
    this.__fallbackEl =
      (root?.querySelector("[data-avatar-fallback]") as HTMLSpanElement) ??
      null;
    this.__wrapperEl = root?.firstElementChild as HTMLElement | null;

    if (!this.__imgEl) return;

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

  private __syncVisibility(): void {
    if (!this.__fallbackEl) return;

    const shouldShowFallback = !this.__src || this.__hasImageError;
    this.__fallbackEl.style.display = shouldShowFallback ? "flex" : "none";
    if (this.__imgEl) {
      this.__imgEl.style.display = shouldShowFallback ? "none" : "block";
    }
    if (this.__wrapperEl) {
      this.__wrapperEl.classList.toggle("border", shouldShowFallback);
      this.__wrapperEl.classList.toggle("border-border", shouldShowFallback);
    }
  }

  private __setupResizeObserver(): void {
    const root = this.__htmlAvatar.getContentElement().getDomElement();
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
    const contentEl = this.__htmlAvatar.getContentElement()?.getDomElement();
    if (contentEl) {
      return { width: contentEl.scrollWidth || 0, height: contentEl.scrollHeight || 0 };
    }
    return { width: 0, height: 0 };
  }

  private __render(): void {
    const src = this.__escape(this.__src);
    const alt = this.__escape(this.__alt);
    const fallback = this.__escape(this.__fallback);
    const shapeClass = this.__resolveShapeClass();
    const wrapperClass = [
      "relative",
      "inline-flex",
      "size-8",
      "shrink-0",
      "overflow-hidden",
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
    `);

    qx.event.Timer.once(() => this.__bindDom(), this, 0);
  }

  public setSrc(src: string): this {
    this.__src = src ?? "";
    this.__hasImageError = false;
    this.__render();
    return this;
  }

  public setAlt(alt: string): this {
    this.__alt = alt ?? "User avatar";
    this.__render();
    return this;
  }

  public setFallback(fallback: string): this {
    this.__fallback = fallback ?? "?";
    this.__render();
    return this;
  }

  public setShape(shape: BsAvatarShape): this {
    this.__shape = shape;
    this.__render();
    return this;
  }
}
