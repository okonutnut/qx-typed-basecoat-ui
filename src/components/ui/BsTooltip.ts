type BsTooltipSide = "top" | "bottom" | "left" | "right";
type BsTooltipAlign = "start" | "center" | "end";

type BsTooltipTargetEntry = {
  widget: qx.ui.core.Widget;
  appearId: string | null;
};

/**
 * Port of new_proj `myapp.components.ui.ToolTip` (ToolTip.ts): Basecoat tooltip helper.
 *
 * Uses Basecoat attribute API on target elements:
 * - `data-tooltip="..."`
 * - `data-side="top|bottom|left|right"`
 * - `data-align="start|center|end"`
 *
 * One instance can attach to multiple widgets (shared tooltip).
 */
class BsTooltip extends qx.core.Object {
  private __targets: BsTooltipTargetEntry[] = [];
  private __text = "";
  private __side: BsTooltipSide = "top";
  private __align: BsTooltipAlign = "center";
  private __enabled = true;

  constructor(
    text = "",
    side: BsTooltipSide = "top",
    align: BsTooltipAlign = "center",
  ) {
    super();
    this.__text = String(text || "");
    this.__side = side || "top";
    this.__align = align || "center";
  }

  getText(): string {
    return this.__text;
  }

  setText(text: string): void {
    this.__text = String(text || "");
    this.__applyAll();
  }

  getSide(): BsTooltipSide {
    return this.__side;
  }

  setSide(side: BsTooltipSide): void {
    this.__side = side || "top";
    this.__applyAll();
  }

  getAlign(): BsTooltipAlign {
    return this.__align;
  }

  setAlign(align: BsTooltipAlign): void {
    this.__align = align || "center";
    this.__applyAll();
  }

  getEnabled(): boolean {
    return this.__enabled;
  }

  setEnabled(enabled: boolean): void {
    this.__enabled = !!enabled;
    this.__applyAll();
  }

  private __getTargetDom(
    widget: qx.ui.core.Widget | null,
  ): HTMLElement | null {
    if (!widget || widget.isDisposed()) return null;
    const contentEl = widget.getContentElement
      ? widget.getContentElement()
      : null;
    const dom = contentEl ? contentEl.getDomElement() : null;
    if (!dom) return null;
    return (
      (dom.querySelector(
        "button, input, textarea, select, [role='button']",
      ) as HTMLElement | null) || dom
    );
  }

  private __applyToWidget(widget: qx.ui.core.Widget): void {
    const el = this.__getTargetDom(widget);
    if (!el) return;

    if (!this.__enabled || !this.__text) {
      el.removeAttribute("data-tooltip");
      el.removeAttribute("data-side");
      el.removeAttribute("data-align");
      return;
    }

    el.setAttribute("data-tooltip", this.__text);
    el.setAttribute("data-side", this.__side);
    el.setAttribute("data-align", this.__align);
  }

  private __applyAll(): void {
    this.__targets.forEach((entry) => {
      if (!entry.widget || entry.widget.isDisposed()) return;
      this.__applyToWidget(entry.widget);
    });
  }

  attachTo(widget: qx.ui.core.Widget | null): void {
    if (!widget || widget.isDisposed()) return;
    const existing = this.__targets.find((e) => e.widget === widget);
    if (existing) {
      this.__applyToWidget(widget);
      return;
    }

    const entry: BsTooltipTargetEntry = {
      widget,
      appearId: null,
    };

    entry.appearId = widget.addListener(
      "appear",
      () => {
        this.__applyToWidget(widget);
      },
      this,
    );

    this.__targets.push(entry);
    this.__applyToWidget(widget);
  }

  detachFrom(widget: qx.ui.core.Widget | null): void {
    if (!widget) return;
    const index = this.__targets.findIndex((e) => e.widget === widget);
    if (index < 0) return;

    const entry = this.__targets[index];
    if (
      entry.appearId != null &&
      widget &&
      !widget.isDisposed() &&
      widget.removeListenerById
    ) {
      widget.removeListenerById(entry.appearId);
    }

    const dom = this.__getTargetDom(widget);
    if (dom) {
      dom.removeAttribute("data-tooltip");
      dom.removeAttribute("data-side");
      dom.removeAttribute("data-align");
    }

    this.__targets.splice(index, 1);
  }

  detachAll(): void {
    const copy = this.__targets.slice();
    copy.forEach((entry) => this.detachFrom(entry.widget));
  }

  getTargets(): qx.ui.core.Widget[] {
    return this.__targets.map((e) => e.widget);
  }

  destruct(): void {
    this.detachAll();
    this.__targets = [];
    super.destruct();
  }
}
