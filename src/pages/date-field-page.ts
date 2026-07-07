class DateFieldPage extends qx.ui.container.Composite {
  private __responsiveWidth = 0;

  constructor() {
    super(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.__responsiveWidth = qx.bom.Viewport.getWidth();
    this.add(this.createBasicSection());
    this.add(this.createWithValueSection());
    this.add(this.createDisabledSection());
    this.add(this.createEventsSection());

    qx.event.Registration.addListener(window, "resize", this.__onResize, this);
  }

  private __onResize(): void {
    this.__responsiveWidth = qx.bom.Viewport.getWidth();
  }

  private __isMobile(): boolean {
    return this.__responsiveWidth < 768;
  }

  private createBasicSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Basic Date Field");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const container = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(16).set({ alignX: "left", alignY: "middle" }),
    );
    container.setPadding(16);

    const dateField = new BsDateField();
    dateField.setWidth(280);
    container.add(dateField);

    card.setContent(container);

    const wrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    wrapper.add(sectionTitle);
    wrapper.add(card);
    return wrapper;
  }

  private createWithValueSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("With Initial Value");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const container = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(16).set({ alignX: "left", alignY: "middle" }),
    );
    container.setPadding(16);

    const dateField = new BsDateField();
    dateField.setWidth(280);
    dateField.setValue(new Date(2026, 6, 15));
    container.add(dateField);

    const valueLabel = new qx.ui.basic.Label("Jul 15, 2026");
    valueLabel.setTextColor("var(--muted-foreground)");
    container.add(valueLabel);

    card.setContent(container);

    const wrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    wrapper.add(sectionTitle);
    wrapper.add(card);
    return wrapper;
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

    const container = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(16).set({ alignX: "left", alignY: "middle" }),
    );
    container.setPadding(16);

    const dateField = new BsDateField();
    dateField.setWidth(280);
    dateField.setEnabled(false);
    container.add(dateField);

    card.setContent(container);

    const wrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    wrapper.add(sectionTitle);
    wrapper.add(card);
    return wrapper;
  }

  private createEventsSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Event Handling");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const container = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(10).set({ alignX: "left" }),
    );
    container.setPadding(16);

    const dateField = new BsDateField();
    dateField.setWidth(280);
    container.add(dateField);

    const logLabel = new qx.ui.basic.Label("Selected date: none");
    logLabel.setTextColor("var(--muted-foreground)");

    dateField.onChange((value: Date | null) => {
      if (value) {
        logLabel.setValue(
          `Selected date: ${value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
        );
      } else {
        logLabel.setValue("Selected date: none");
      }
    });

    container.add(logLabel);

    card.setContent(container);

    const wrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    wrapper.add(sectionTitle);
    wrapper.add(card);
    return wrapper;
  }
}
