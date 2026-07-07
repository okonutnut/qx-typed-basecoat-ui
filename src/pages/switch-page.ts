class SwitchPage extends qx.ui.container.Composite {
  private __responsiveWidth = 0;

  constructor() {
    super(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.__responsiveWidth = qx.bom.Viewport.getWidth();
    this.add(this.createBasicSwitch());
    this.add(this.createSwitchWithLabel());
    this.add(this.createSwitchWithDescription());
    this.add(this.createSwitchSizeVariants());
    this.add(this.createDisabledSwitch());

    qx.event.Registration.addListener(window, "resize", this.__onResize, this);
  }

  private __onResize(): void {
    const newWidth = qx.bom.Viewport.getWidth();
    if (newWidth !== this.__responsiveWidth) {
      this.__responsiveWidth = newWidth;
    }
  }

  private __isMobile(): boolean {
    return this.__responsiveWidth < 768;
  }

  private __maxWidth(): number {
    return this.__isMobile() ? this.__responsiveWidth - 40 : 520;
  }

  private createBasicSwitch(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__maxWidth());

    const sw = new BsSwitch();

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    container.setPadding(24);

    const label = new qx.ui.basic.Label("Basic Switch");
    label.setTextColor("var(--foreground)");

    container.add(label);
    container.add(sw);

    card.setContent(container);
    return card;
  }

  private createSwitchWithLabel(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__maxWidth());

    const sw = new BsSwitch(true);
    sw.onToggle((checked) => {
      BsToast.show({ title: `Switch toggled: ${checked ? "ON" : "OFF"}` });
    });

    const row = new qx.ui.container.Composite(new qx.ui.layout.HBox(12));
    row.setAlignY("middle");
    row.setAllowGrowX(true);

    const label = new qx.ui.basic.Label("Notifications");
    label.setTextColor("var(--foreground)");

    row.add(label, { flex: 1 });
    row.add(sw);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    container.setPadding(24);

    const title = new qx.ui.basic.Label("Switch with Label");
    title.setTextColor("var(--foreground)");

    container.add(title);
    container.add(row);

    card.setContent(container);
    return card;
  }

  private createSwitchWithDescription(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__maxWidth());

    const sw = new BsSwitch();

    const row = new qx.ui.container.Composite(new qx.ui.layout.HBox(12));
    row.setAlignY("center");
    row.setAllowGrowX(true);

    const textColumn = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
    textColumn.setAllowGrowX(true);

    const label = new qx.ui.basic.Label("Share across devices");
    label.setTextColor("var(--foreground)");

    const desc = new qx.ui.basic.Label(
      "Focus is shared across devices, and turns off when you leave the app.",
    );
    desc.setTextColor("var(--muted-foreground)");

    textColumn.add(label);
    textColumn.add(desc);

    row.add(textColumn, { flex: 1 });
    row.add(sw);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    container.setPadding(24);

    const title = new qx.ui.basic.Label("Switch with Description");
    title.setTextColor("var(--foreground)");

    container.add(title);
    container.add(row);

    card.setContent(container);
    return card;
  }

  private createSwitchSizeVariants(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__maxWidth());

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    container.setPadding(24);

    const title = new qx.ui.basic.Label("Switch Sizes");
    title.setTextColor("var(--foreground)");
    container.add(title);

    const smallRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(12));
    smallRow.setAlignY("middle");
    const smallLabel = new qx.ui.basic.Label("Small");
    smallLabel.setTextColor("var(--foreground)");
    smallRow.add(smallLabel, { flex: 1 });
    smallRow.add(new BsSwitch(false, false, "sm"));
    container.add(smallRow);

    const defaultRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(12));
    defaultRow.setAlignY("middle");
    const defaultLabel = new qx.ui.basic.Label("Default");
    defaultLabel.setTextColor("var(--foreground)");
    defaultRow.add(defaultLabel, { flex: 1 });
    defaultRow.add(new BsSwitch(true, false, "default"));
    container.add(defaultRow);

    card.setContent(container);
    return card;
  }

  private createDisabledSwitch(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__maxWidth());

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    container.setPadding(24);

    const title = new qx.ui.basic.Label("Disabled Switch");
    title.setTextColor("var(--foreground)");
    container.add(title);

    const uncheckedRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(12));
    uncheckedRow.setAlignY("middle");
    const uncheckedLabel = new qx.ui.basic.Label("Disabled (unchecked)");
    uncheckedLabel.setTextColor("var(--foreground)");
    uncheckedRow.add(uncheckedLabel, { flex: 1 });
    uncheckedRow.add(new BsSwitch(false, true));
    container.add(uncheckedRow);

    const checkedRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(12));
    checkedRow.setAlignY("middle");
    const checkedLabel = new qx.ui.basic.Label("Disabled (checked)");
    checkedLabel.setTextColor("var(--foreground)");
    checkedRow.add(checkedLabel, { flex: 1 });
    checkedRow.add(new BsSwitch(true, true));
    container.add(checkedRow);

    card.setContent(container);
    return card;
  }
}
