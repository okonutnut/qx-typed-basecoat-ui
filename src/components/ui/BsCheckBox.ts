/**
 * Basecoat-style checkbox: label + native input.
 * API aligned with qx.ui.form.CheckBox: setLabel/getLabel, setValue/getValue (boolean), changeValue.
 */
class BsCheckBox extends qx.ui.core.Widget {
  static events = {
    changeValue: "qx.event.type.Data",
    changeLabel: "qx.event.type.Data",
  };

  private __html: qx.ui.embed.Html;
  private __label = "";
  private __value = false;
  private __initialLabel: string;

  constructor(label = "") {
    super();
    this.__initialLabel = label;
    this._setLayout(new qx.ui.layout.Canvas());

    const labelEsc = this.__escapeHtml(label || "");
    this.__html = new qx.ui.embed.Html(`
      <label class="label gap-3" style="margin: 0; padding: 0; display: inline-flex; align-items: center; cursor: pointer; min-width: 0;">
        <input type="checkbox" class="input" style="margin: 0;">
        <span class="checkbox-label-text">${labelEsc}</span>
      </label>
    `);
    this._add(this.__html, { edge: 0 });

    this.__html.addListenerOnce("appear", () => {
      if (this.__initialLabel) {
        this.setLabel(this.__initialLabel);
      }
      this.__applyValueToDom(this.__value);
      this.__attachInputListener();
    });
  }

  private __escapeHtml(text: string | null | undefined): string {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private __getRootElement(): HTMLLabelElement | null {
    const dom = this.__html.getContentElement()?.getDomElement() as
      | HTMLElement
      | null
      | undefined;
    return dom ? (dom.querySelector("label") as HTMLLabelElement | null) : null;
  }

  private __getInputElement(): HTMLInputElement | null {
    const root = this.__getRootElement();
    return root ? root.querySelector('input[type="checkbox"]') : null;
  }

  private __getLabelTextElement(): HTMLSpanElement | null {
    const root = this.__getRootElement();
    return root ? root.querySelector(".checkbox-label-text") : null;
  }

  private __attachInputListener(): void {
    const input = this.__getInputElement();
    if (!input) return;
    input.addEventListener("change", () => {
      if (this.isDisposed()) return;
      this.setValue(input.checked);
    });
  }

  private __applyValueToDom(value: boolean): void {
    const input = this.__getInputElement();
    if (input) input.checked = !!value;
  }

  getLabel(): string {
    return this.__label;
  }

  setLabel(value: string): this {
    const next = value ?? "";
    if (this.__label === next) return this;
    const old = this.__label;
    this.__label = next;
    const span = this.__getLabelTextElement();
    if (span) span.textContent = next;
    this.fireDataEvent("changeLabel", next, old);
    return this;
  }

  getValue(): boolean {
    return this.__value;
  }

  setValue(value: boolean): this {
    const next = !!value;
    if (this.__value === next) {
      this.__applyValueToDom(next);
      return this;
    }
    const old = this.__value;
    this.__value = next;
    this.__applyValueToDom(next);
    this.fireDataEvent("changeValue", next, old);
    return this;
  }
}
