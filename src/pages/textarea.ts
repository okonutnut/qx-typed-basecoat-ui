class TextareaPage extends qx.ui.container.Composite {
  private __responsiveWidth = 0;

  constructor() {
    super(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.__responsiveWidth = qx.bom.Viewport.getWidth();
    this.add(this.createBasicTextarea());
    this.add(this.createTextareaWithLabel());

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

  private createBasicTextarea(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);
    card.setAllowGrowY(true);

    const textarea = new BsTextarea("", "Enter your text here...");
    textarea.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    container.setPadding(24);

    const label = new qx.ui.basic.Label("Basic Textarea");
    label.setTextColor("var(--foreground)");

    container.add(label);
    container.add(textarea);

    card.setContent(container);
    return card;
  }

  private createTextareaWithLabel(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    container.setPadding(24);

    const label = new qx.ui.basic.Label("Textarea with Label");
    label.setTextColor("var(--foreground)");

    const labelText = new qx.ui.basic.Label("Description");
    labelText.setTextColor("var(--foreground)");

    const textarea = new BsTextarea(
      "",
      "Enter your description here...",
      "w-full",
      4,
    );
    textarea.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);

    const description = new qx.ui.basic.Label(
      "Provide a detailed description of your request.",
    );
    description.setTextColor("var(--muted-foreground)");

    container.add(label);
    container.add(labelText);
    container.add(textarea);
    container.add(description);

    card.setContent(container);
    return card;
  }
}
