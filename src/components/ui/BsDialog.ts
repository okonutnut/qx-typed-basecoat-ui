type BsDialogSize = "sm" | "md" | "lg" | "xl" | "full" | "custom";
type BsDialogSaveIntent = "primary" | "destructive";

/**
 * Basecoat-style dialog using native &lt;dialog&gt;. Instance-based (vs BsAlertDialog singleton).
 */
class BsDialog extends qx.ui.core.Widget {
  static events = {
    save: "qx.event.type.Event",
    cancel: "qx.event.type.Event",
  };

  private __html: qx.ui.embed.Html;
  private readonly __dialogId: string;
  private readonly __titleId: string;
  private readonly __descriptionId: string;
  private __boundDialogEl: HTMLDialogElement | null = null;
  private __pendingSectionContent: string | null = null;
  private __closeIcon: InlineSvgIcon | null = null;

  private __titleText = "";
  private __descriptionText = "";
  private __cancelLabel = "Cancel";
  private __saveLabel = "Save changes";
  private __saveIntent: BsDialogSaveIntent = "primary";
  private __size: BsDialogSize = "md";
  private __dialogMaxWidth = "425px";
  private __dialogMaxHeight = "612px";
  private __richSectionContent = false;

  constructor(title = "", description = "") {
    super();
    this._setLayout(new qx.ui.layout.Canvas());
    this.__titleText = title;
    this.__descriptionText = description;

    this.__dialogId = "dialog-" + this.toHashCode();
    this.__titleId = this.__dialogId + "-title";
    this.__descriptionId = this.__dialogId + "-description";

    const titleEsc = this.__escapeHtml(title || "");
    const descEsc = this.__escapeHtml(description || "");

    this.__html = new qx.ui.embed.Html(`
      <dialog id="${this.__dialogId}" class="dialog" aria-labelledby="${this.__titleId}" aria-describedby="${this.__descriptionId}" style="margin: 0; max-width: 425px; max-height: 612px;">
        <div>
          <header>
            <h2 id="${this.__titleId}">${titleEsc}</h2>
            <p id="${this.__descriptionId}">${descEsc}</p>
          </header>
          <section>
            <div class="dialog-section-content"></div>
          </section>
          <footer>
            <button type="button" class="btn-outline dialog-cancel-btn">Cancel</button>
            <button type="button" class="btn dialog-save-btn">Save changes</button>
          </footer>
          <button type="button" class="dialog-close-btn" aria-label="Close dialog" style="position: absolute; top: 0; right: 0; margin: 0.5rem; padding: 0.25rem; background: transparent; border: none; cursor: pointer; color: inherit;">
            <span class="dialog-close-icon-host" style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;"></span>
          </button>
        </div>
      </dialog>
    `);
    this._add(this.__html, { edge: 0 });

    this.__html.addListenerOnce("appear", () => {
      this.__wireCloseIcon();
      this.__applyTitle(this.__titleText);
      this.__applyDescription(this.__descriptionText);
      this.__applyCancelLabel(this.__cancelLabel);
      this.__applySaveLabel(this.__saveLabel);
      this.__applySaveIntent(this.__saveIntent);
      this.__applyDialogSizing();
      this.__attachListeners();
    });
  }

  private __wireCloseIcon(): void {
    const dialog = this.__getDialogElement();
    if (!dialog) return;
    const host = dialog.querySelector(".dialog-close-icon-host");
    if (!host) return;

    const icon = new InlineSvgIcon("x", 24);
    this.__closeIcon = icon;

    const sync = () => {
      host.innerHTML = icon.getHtml() || "";
    };
    sync();
    icon.addListener("changeHtml", sync, this);
  }

  private __escapeHtml(text: string | null | undefined): string {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private __getDialogElement(): HTMLDialogElement | null {
    const root = this.__html.getContentElement()?.getDomElement() as
      | HTMLElement
      | null
      | undefined;
    if (!root) return null;
    if (root.tagName && root.tagName.toLowerCase() === "dialog") {
      return root as HTMLDialogElement;
    }
    const nested = root.querySelector("dialog");
    if (nested) return nested as HTMLDialogElement;
    const first = root.firstElementChild;
    if (first && first.tagName.toLowerCase() === "dialog") {
      return first as HTMLDialogElement;
    }
    return null;
  }

  private __getSectionContentElement(): HTMLElement | null {
    const dialog = this.__getDialogElement();
    if (!dialog) return null;
    return dialog.querySelector(".dialog-section-content");
  }

  private __attachListeners(): void {
    const dialog = this.__getDialogElement();
    if (!dialog || this.__boundDialogEl === dialog) return;

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        dialog.close();
        this.fireEvent("cancel");
      }
    });

    const closeBtn = dialog.querySelector(".dialog-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        dialog.close();
        this.fireEvent("cancel");
      });
    }

    const cancelBtn = dialog.querySelector(".dialog-cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        dialog.close();
        this.fireEvent("cancel");
      });
    }

    const saveBtn = dialog.querySelector(".dialog-save-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        this.fireEvent("save");
        dialog.close();
      });
    }

    this.__boundDialogEl = dialog;
  }

  private __applyTitle(value: string): void {
    const dialog = this.__getDialogElement();
    if (!dialog) return;
    const h2 = dialog.querySelector("#" + this.__titleId);
    if (h2) h2.textContent = value || "";
  }

  private __applyDescription(value: string): void {
    const dialog = this.__getDialogElement();
    if (!dialog) return;
    const p = dialog.querySelector("#" + this.__descriptionId);
    if (p) p.textContent = value || "";
  }

  private __applyCancelLabel(value: string): void {
    const dialog = this.__getDialogElement();
    if (!dialog) return;
    const btn = dialog.querySelector(".dialog-cancel-btn");
    if (btn) btn.textContent = value || "Cancel";
  }

  private __applySaveLabel(value: string): void {
    const dialog = this.__getDialogElement();
    if (!dialog) return;
    const btn = dialog.querySelector(".dialog-save-btn");
    if (btn) btn.textContent = value || "Save changes";
  }

  private __applySaveIntent(value: BsDialogSaveIntent): void {
    const dialog = this.__getDialogElement();
    if (!dialog) return;
    const btn = dialog.querySelector(".dialog-save-btn") as HTMLElement | null;
    if (!btn) return;
    if (value === "destructive") {
      btn.style.background = "var(--destructive)";
      btn.style.color = "var(--destructive-foreground)";
      btn.style.borderColor = "var(--destructive)";
    } else {
      btn.style.background = "";
      btn.style.color = "";
      btn.style.borderColor = "";
    }
  }

  private __applyDialogSizing(): void {
    const dialog = this.__getDialogElement();
    if (!dialog) return;

    const size = this.__size;
    const widthBySize: Record<string, string> = {
      sm: "360px",
      md: "425px",
      lg: "720px",
      xl: "980px",
      full: "1200px",
    };
    const heightBySize: Record<string, string> = {
      sm: "520px",
      md: "612px",
      lg: "760px",
      xl: "85vh",
      full: "92vh",
    };

    const maxWidth = this.__dialogMaxWidth;
    const maxHeight = this.__dialogMaxHeight;
    const hasCustomMaxWidth = maxWidth && maxWidth !== "425px";
    const hasCustomMaxHeight = maxHeight && maxHeight !== "612px";
    const useCustomSizing =
      size === "custom" || hasCustomMaxWidth || hasCustomMaxHeight;
    const targetWidth = useCustomSizing
      ? maxWidth || "425px"
      : widthBySize[size] || widthBySize.md;
    const targetHeight = useCustomSizing
      ? maxHeight || "612px"
      : heightBySize[size] || heightBySize.md;

    const panel = dialog.firstElementChild as HTMLElement | null;
    if (!panel?.style) return;

    const widthExpr = `min(${targetWidth}, calc(100vw - 2rem))`;
    const heightExpr = `min(${targetHeight}, calc(100vh - 2rem))`;

    panel.style.setProperty("width", widthExpr, "important");
    panel.style.setProperty("max-width", widthExpr, "important");
    panel.style.setProperty("max-height", heightExpr, "important");
    panel.style.setProperty("overflow", "auto", "important");

    const footer = dialog.querySelector("footer") as HTMLElement | null;
    if (footer?.style) {
      footer.style.setProperty("display", "flex", "important");
      footer.style.setProperty("flex-wrap", "wrap", "important");
      footer.style.setProperty("gap", "0.5rem", "important");
    }
  }

  getTitle(): string {
    return this.__titleText;
  }

  setTitle(value: string): this {
    this.__titleText = value ?? "";
    this.__applyTitle(this.__titleText);
    return this;
  }

  getDescription(): string {
    return this.__descriptionText;
  }

  setDescription(value: string): this {
    this.__descriptionText = value ?? "";
    this.__applyDescription(this.__descriptionText);
    return this;
  }

  getCancelLabel(): string {
    return this.__cancelLabel;
  }

  setCancelLabel(value: string): this {
    this.__cancelLabel = value ?? "Cancel";
    this.__applyCancelLabel(this.__cancelLabel);
    return this;
  }

  getSaveLabel(): string {
    return this.__saveLabel;
  }

  setSaveLabel(value: string): this {
    this.__saveLabel = value ?? "Save changes";
    this.__applySaveLabel(this.__saveLabel);
    return this;
  }

  getSaveIntent(): BsDialogSaveIntent {
    return this.__saveIntent;
  }

  setSaveIntent(value: BsDialogSaveIntent): this {
    this.__saveIntent = value;
    this.__applySaveIntent(this.__saveIntent);
    return this;
  }

  getSize(): BsDialogSize {
    return this.__size;
  }

  setSize(value: BsDialogSize): this {
    this.__size = value;
    this.__applyDialogSizing();
    return this;
  }

  getDialogMaxWidth(): string {
    return this.__dialogMaxWidth;
  }

  setDialogMaxWidth(value: string): this {
    this.__dialogMaxWidth = value ?? "425px";
    this.__applyDialogSizing();
    return this;
  }

  getDialogMaxHeight(): string {
    return this.__dialogMaxHeight;
  }

  setDialogMaxHeight(value: string): this {
    this.__dialogMaxHeight = value ?? "612px";
    this.__applyDialogSizing();
    return this;
  }

  getRichSectionContent(): boolean {
    return this.__richSectionContent;
  }

  setRichSectionContent(value: boolean): this {
    this.__richSectionContent = !!value;
    return this;
  }

  show(): void {
    const tryShow = (retriesLeft = 10) => {
      const dialog = this.__getDialogElement();
      if (!dialog) {
        if (retriesLeft > 0) {
          qx.event.Timer.once(() => tryShow(retriesLeft - 1), this, 25);
        }
        return;
      }

      this.__applyTitle(this.__titleText);
      this.__applyDescription(this.__descriptionText);
      this.__applyCancelLabel(this.__cancelLabel);
      this.__applySaveLabel(this.__saveLabel);
      this.__applySaveIntent(this.__saveIntent);
      this.__applyDialogSizing();
      this.__attachListeners();

      if (this.__pendingSectionContent != null) {
        this.setSectionContent(this.__pendingSectionContent);
      }

      if (typeof dialog.showModal === "function" && !dialog.open) {
        dialog.showModal();
      }
      this.__applyDialogSizing();
      qx.event.Timer.once(() => this.__applyDialogSizing(), this, 60);
    };

    tryShow();
  }

  close(): void {
    const dialog = this.__getDialogElement();
    if (dialog && typeof dialog.close === "function") {
      dialog.close();
    }
  }

  setSectionContent(html: string | null | undefined): void {
    const el = this.__getSectionContentElement();
    if (el) {
      el.innerHTML = this.__richSectionContent
        ? html || ""
        : this.__escapeHtml(String(html || ""));
      this.__pendingSectionContent = null;
    } else {
      this.__pendingSectionContent = html != null ? String(html) : "";
    }
  }

  getSectionElement(): HTMLElement | null {
    return this.__getSectionContentElement();
  }

  getDialogElement(): HTMLDialogElement | null {
    return this.__getDialogElement();
  }

  destruct(): void {
    if (this.__closeIcon) {
      this.__closeIcon.destroy();
      this.__closeIcon = null;
    }
    this.__boundDialogEl = null;
    this.__pendingSectionContent = null;
    super.destruct();
  }
}
