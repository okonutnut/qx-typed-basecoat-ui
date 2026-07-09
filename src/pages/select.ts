class SelectPage extends BasePage {
  constructor() {
    super();
    this.setLayout(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.add(this.createBasicSelect());
    this.add(this.createSelectWithLabel());
  }

  private createBasicSelect(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const select = new BsSelect([
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4",
    ]);
    select.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    container.setPadding(24);

    const label = new qx.ui.basic.Label("Basic Select");
    label.setTextColor("var(--foreground)");

    container.add(label);
    container.add(select);

    card.setContent(container);
    return card;
  }

  private createSelectWithLabel(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    container.setPadding(24);

    const label = new qx.ui.basic.Label("Select with Label");
    label.setTextColor("var(--foreground)");

    const labelText = new qx.ui.basic.Label("Country");
    labelText.setTextColor("var(--foreground)");

    const select = new BsSelect(
      [
        "United States",
        "Canada",
        "United Kingdom",
        "Germany",
        "France",
        "Japan",
        "Australia",
      ],
      "w-full",
    );
    select.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);

    const description = new qx.ui.basic.Label(
      "Select your country from the list.",
    );
    description.setTextColor("var(--muted-foreground)");

    container.add(label);
    container.add(labelText);
    container.add(select);
    container.add(description);

    card.setContent(container);
    return card;
  }
}