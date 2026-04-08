/**
 * Basecoat-style radio + group. Native &lt;input type="radio"&gt; with shared group name.
 */
class BsRadioButton extends qx.ui.core.Widget {
  static events = {
    changeChecked: "qx.event.type.Data",
  };

  private __html: qx.ui.embed.Html;
  private __inputElement: HTMLInputElement | null = null;
  private __labelTextElement: HTMLSpanElement | null = null;
  private __label = "";
  private __value = "";
  private __checked = false;
  private __groupName = "radio-group";

  constructor(label = "") {
    super();
    this._setLayout(new qx.ui.layout.HBox(8).set({ alignY: "middle" }));
    this.setAllowGrowX(true);
    this.setMinWidth(0);

    this.__html = new qx.ui.embed.Html(`
      <label class="label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0; padding: 4px 0; min-width: 120px;">
        <input type="radio" class="input" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary); flex-shrink: 0;">
        <span class="label-text" style="line-height: 1.2; white-space: nowrap; color: inherit; font-size: 14px; flex-shrink: 0; min-width: 80px;"></span>
      </label>
    `);
    this._add(this.__html);

    if (label) {
      this.setLabel(label);
    }

    this.addListener(
      "changeEnabled",
      (e: qx.event.type.Data) => {
        this.__applyEnabled(!!e.getData());
      },
      this,
    );

    this.__html.addListenerOnce("appear", () => {
      this.__initDom();
    });
  }

  private __initDom(): void {
    const dom = this.__html.getContentElement().getDomElement();
    if (!dom) return;

    this.__inputElement = dom.querySelector("input");
    this.__labelTextElement = dom.querySelector(".label-text");

    this.__applyLabel(this.__label);
    this.__applyValue(this.__value);
    this.__applyChecked(this.__checked);
    this.__applyGroupName(this.__groupName);
    this.__applyEnabled(this.getEnabled());

    if (this.__inputElement) {
      this.__inputElement.addEventListener("change", () => {
        if (this.__inputElement) {
          this.setChecked(this.__inputElement.checked);
        }
      });
    }

    dom.addEventListener("click", () => {
      if (this.getEnabled()) {
        this.toggle();
      }
    });
  }

  toggle(): void {
    if (this.getEnabled() && !this.getChecked()) {
      this.setChecked(true);
    }
  }

  private __applyLabel(label: string): void {
    if (this.__labelTextElement) {
      this.__labelTextElement.textContent = label;
    }
  }

  private __applyValue(value: string): void {
    if (this.__inputElement) {
      this.__inputElement.value = value;
    }
  }

  private __applyChecked(checked: boolean): void {
    if (this.__inputElement) {
      this.__inputElement.checked = checked;
    }
  }

  private __applyGroupName(groupName: string): void {
    if (this.__inputElement) {
      this.__inputElement.name = groupName;
    }
  }

  private __applyEnabled(enabled: boolean): void {
    if (this.__inputElement) {
      this.__inputElement.disabled = !enabled;
    }
    const dom = this.__html.getContentElement().getDomElement();
    if (dom) {
      dom.style.cursor = enabled ? "pointer" : "not-allowed";
      dom.style.opacity = enabled ? "1" : "0.5";
    }
  }

  getLabel(): string {
    return this.__label;
  }

  setLabel(label: string): this {
    this.__label = label ?? "";
    this.__applyLabel(this.__label);
    return this;
  }

  getValue(): string {
    return this.__value;
  }

  setValue(value: string): this {
    this.__value = value ?? "";
    this.__applyValue(this.__value);
    return this;
  }

  getChecked(): boolean {
    return this.__checked;
  }

  setChecked(checked: boolean): this {
    const next = !!checked;
    if (this.__checked === next) {
      this.__applyChecked(next);
      return this;
    }
    const old = this.__checked;
    this.__checked = next;
    this.__applyChecked(next);
    this.fireDataEvent("changeChecked", next, old);
    return this;
  }

  getGroupName(): string {
    return this.__groupName;
  }

  setGroupName(name: string): this {
    this.__groupName = name ?? "radio-group";
    this.__applyGroupName(this.__groupName);
    return this;
  }
}

type BsRadioSelectionDetail = { value: string; oldValue: string | null };

class BsRadioButtonGroup extends qx.ui.core.Widget {
  static events = {
    changeValue: "qx.event.type.Data",
    changeSelection: "qx.event.type.Data",
  };

  private __radioButtons: BsRadioButton[] = [];
  private __groupName = "radio-group";
  private __value: string | null = null;

  constructor() {
    super();
    this._setLayout(new qx.ui.layout.VBox(12).set({ alignX: "left" }));
  }

  add(radioButton: BsRadioButton): void {
    radioButton.setGroupName(this.__groupName);
    radioButton.addListener("changeChecked", this.__onRadioButtonChange, this);
    this.__radioButtons.push(radioButton);
    this._add(radioButton, { flex: 1 });
  }

  private __onRadioButtonChange(e: qx.event.type.Data): void {
    const radioButton = e.getTarget() as unknown as BsRadioButton;
    if (radioButton.getChecked()) {
      const oldValue = this.__value;
      this.setValue(radioButton.getValue());
      this.fireDataEvent("changeSelection", {
        value: radioButton.getValue(),
        oldValue: oldValue,
      } as BsRadioSelectionDetail);
    }
  }

  private __applyGroupName(groupName: string): void {
    this.__radioButtons.forEach((btn) => {
      btn.setGroupName(groupName);
    });
  }

  private __applyValueToRadios(value: string | null): void {
    this.__radioButtons.forEach((btn) => {
      if (btn.getValue() === value) {
        btn.setChecked(true);
      } else {
        btn.setChecked(false);
      }
    });
  }

  getGroupName(): string {
    return this.__groupName;
  }

  setGroupName(name: string): this {
    this.__groupName = name ?? "radio-group";
    this.__applyGroupName(this.__groupName);
    return this;
  }

  getValue(): string | null {
    return this.__value;
  }

  setValue(value: string | null): this {
    if (this.__value === value) {
      return this;
    }
    const oldValue = this.__value;
    this.__value = value;
    this.__applyValueToRadios(value);
    this.fireDataEvent("changeValue", value, oldValue);
    return this;
  }

  getRadioChildren(): BsRadioButton[] {
    return this.__radioButtons.slice();
  }

  clearSelection(): void {
    this.__radioButtons.forEach((btn) => {
      btn.setChecked(false);
    });
    this.setValue(null);
  }
}
