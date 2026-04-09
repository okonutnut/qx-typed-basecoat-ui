class RadioGroupPage extends qx.ui.container.Composite {
  private __responsiveWidth = 0;

  constructor() {
    super(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.__responsiveWidth = qx.bom.Viewport.getWidth();
    this.add(this.createDefaultSection());
    this.add(this.createFormSection());
    this.add(this.createDisabledSection());

    qx.event.Registration.addListener(window, "resize", this.__onResize, this);
  }

  private __onResize(): void {
    this.__responsiveWidth = qx.bom.Viewport.getWidth();
  }

  private __isMobile(): boolean {
    return this.__responsiveWidth < 768;
  }

  private createDefaultSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Default");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const radioContainer = new qx.ui.container.Composite(
      new qx.ui.layout.Grow(),
    );

    const radioGroup = new BsRadioGroup([
      { value: "default", label: "Default" },
      { value: "comfortable", label: "Comfortable", disabled: true },
      { value: "compact", label: "Compact" },
    ]);
    radioContainer.add(radioGroup);

    card.setContent(radioContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }

  private createFormSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("With Form");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const formContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(16).set({ alignX: "center" }),
    );

    const label = new qx.ui.basic.Label("Notify me about...");
    label.setTextColor("var(--foreground)");

    const radioGroup = new BsRadioGroup([
      { value: "1", label: "All new messages" },
      { value: "2", label: "Direct messages and mentions" },
      { value: "3", label: "Nothing" },
    ]);
    radioGroup.setValue("2");

    const submitBtn = new BsButton("Submit");

    formContainer.add(label);
    formContainer.add(radioGroup);
    formContainer.add(submitBtn);

    card.setContent(formContainer);

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

    const radioGroup = new BsRadioGroup([
      { value: "1", label: "Option 1" },
      { value: "2", label: "Option 2" },
      { value: "3", label: "Option 3" },
    ]);
    (radioGroup as any).setEnabled(false);
    disabledContainer.add(radioGroup);

    card.setContent(disabledContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }
}
