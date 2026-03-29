class ButtonPage extends qx.ui.container.Composite {
  private __responsiveWidth = 0;

  constructor() {
    super(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.__responsiveWidth = qx.bom.Viewport.getWidth();
    this.add(this.createVariantSection());
    this.add(this.createSizeSection());
    this.add(this.createWithIconSection());
    this.add(this.createDisabledSection());

    qx.event.Registration.addListener(window, "resize", this.__onResize, this);
  }

  private __onResize(): void {
    this.__responsiveWidth = qx.bom.Viewport.getWidth();
  }

  private __isMobile(): boolean {
    return this.__responsiveWidth < 768;
  }

  private createVariantSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Variants");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const variantsContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(12).set({ alignX: "center" }),
    );

    const row1 = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );
    row1.add(new BsButton("Default"));
    row1.add(new BsButton("Secondary", undefined, { variant: "secondary" }));
    row1.add(
      new BsButton("Destructive", undefined, { variant: "destructive" }),
    );
    variantsContainer.add(row1);

    const row2 = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );
    row2.add(new BsButton("Outline", undefined, { variant: "outline" }));
    row2.add(new BsButton("Ghost", undefined, { variant: "ghost" }));
    row2.add(new BsButton("Link", undefined, { variant: "link" }));
    variantsContainer.add(row2);

    card.setContent(variantsContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }

  private createSizeSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Sizes");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const sizesContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(16).set({ alignX: "center" }),
    );

    const row1 = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );
    row1.add(new BsButton("Small", undefined, { size: "sm" }));
    row1.add(new BsButton("Default", undefined, { size: "default" }));
    row1.add(new BsButton("Large", undefined, { size: "lg" }));
    sizesContainer.add(row1);

    const row2 = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );
    row2.add(
      new BsButton(undefined, new InlineSvgIcon("search", 16), {
        size: "icon",
      }),
    );
    row2.add(
      new BsButton(undefined, new InlineSvgIcon("search", 18), {
        size: "sm-icon",
      }),
    );
    row2.add(
      new BsButton(undefined, new InlineSvgIcon("search", 20), {
        size: "lg-icon",
      }),
    );
    sizesContainer.add(row2);

    card.setContent(sizesContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }

  private createWithIconSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("With Icons");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const iconContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(12).set({ alignX: "center" }),
    );

    const row1 = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );
    row1.add(
      new BsButton("Search", new InlineSvgIcon("search", 16)).set({
        width: 120,
      }),
    );
    row1.add(
      new BsButton("Download", new InlineSvgIcon("download", 16)).set({
        width: 120,
      }),
    );
    row1.add(
      new BsButton("Settings", new InlineSvgIcon("settings", 16)).set({
        width: 120,
      }),
    );
    iconContainer.add(row1);

    const row2 = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );
    row2.add(
      new BsButton("Email", new InlineSvgIcon("mail", 16), {
        variant: "outline",
      }).set({ width: 120 }),
    );
    row2.add(
      new BsButton("User", new InlineSvgIcon("user", 16), {
        variant: "secondary",
      }).set({ width: 120 }),
    );
    row2.add(
      new BsButton("Delete", new InlineSvgIcon("trash", 16), {
        variant: "destructive",
      }).set({ width: 120 }),
    );
    iconContainer.add(row2);

    card.setContent(iconContainer);

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

    const disabledContainer = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const defaultDisabled = new BsButton("Disabled");
    defaultDisabled.setEnabled(false);
    disabledContainer.add(defaultDisabled);

    const outlineDisabled = new BsButton("Disabled", undefined, {
      variant: "outline",
    });
    outlineDisabled.setEnabled(false);
    disabledContainer.add(outlineDisabled);

    const destructiveDisabled = new BsButton("Disabled", undefined, {
      variant: "destructive",
    });
    destructiveDisabled.setEnabled(false);
    disabledContainer.add(destructiveDisabled);

    card.setContent(disabledContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }
}
