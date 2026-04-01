class LabelPage extends qx.ui.container.Composite {
  private __responsiveWidth = 0;

  constructor() {
    super(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.__responsiveWidth = qx.bom.Viewport.getWidth();
    this.add(this.createBasicSection());
    this.add(this.createWithInputSection());
    this.add(this.createDisabledSection());

    qx.event.Registration.addListener(window, "resize", this.__onResize, this);
  }

  private __onResize(): void {
    this.__responsiveWidth = qx.bom.Viewport.getWidth();
  }

  private __isMobile(): boolean {
    return this.__responsiveWidth < 768;
  }

  private createBasicSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Basic Label");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(16).set({ alignX: "center" }),
    );

    const label = new BsLabel("Your email address");
    contentContainer.add(label, { alignY: "bottom" });

    card.setContent(contentContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }

  private createWithInputSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("With Input");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(0).set({ alignX: "center" }),
    );

    const formGroup = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));

    const emailLabel = new qx.ui.basic.Label("Email");
    formGroup.add(emailLabel, { alignY: "bottom" });

    const emailInput = new BsInput("", "you@example.com");
    formGroup.add(emailInput);

    contentContainer.add(formGroup);

    card.setContent(contentContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }

  private createDisabledSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Disabled State");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(12).set({ alignX: "center" }),
    );

    const formGroup = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));

    const disabledLabel = new qx.ui.basic.Label("Email");
    formGroup.add(disabledLabel, { alignY: "bottom" });

    const disabledInput = new BsInput("", "you@example.com");
    // @ts-ignore
    disabledInput.setEnabled(false);
    formGroup.add(disabledInput);

    contentContainer.add(formGroup);

    card.setContent(contentContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }
}
