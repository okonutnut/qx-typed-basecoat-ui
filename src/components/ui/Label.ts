class BsLabel extends qx.ui.basic.Atom {
  private __htmlLabel: qx.ui.embed.Html;
  private __text: string;
  private __for: string;
  private __className: string;
  private __disabled: boolean;
  private __children: qx.ui.core.Widget[];

  constructor(text?: string, forId?: string, className?: string) {
    super();

    this._setLayout(new qx.ui.layout.Grow());

    this.__text = text ?? "";
    this.__for = forId ?? "";
    this.__className = className ?? "";
    this.__disabled = false;
    this.__children = [];

    this.__htmlLabel = new qx.ui.embed.Html("");
    this._add(this.__htmlLabel);

    this.__render();
  }

  private __escapeAttr(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  private __render(): void {
    const classes = ["label", this.__className]
      .filter(Boolean)
      .join(" ");

    const forAttr = this.__for ? `for="${this.__for}"` : "";
    const text = this.__escapeAttr(this.__text);

    this.__htmlLabel.setHtml(
      `<label class="${classes}" ${forAttr}>${text}</label>`,
    );
  }

  public getText(): string {
    return this.__text;
  }

  public setText(value: string): this {
    this.__text = value ?? "";
    this.__render();
    return this;
  }

  public setFor(value: string): this {
    this.__for = value ?? "";
    this.__render();
    return this;
  }

  public setDisabled(value: boolean): this {
    this.__disabled = value ?? false;
    this.__render();
    return this;
  }
}