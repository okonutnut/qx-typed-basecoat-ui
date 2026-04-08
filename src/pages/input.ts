class InputPage extends qx.ui.container.Composite {
  private __responsiveWidth = 0;

  constructor() {
    super(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.__responsiveWidth = qx.bom.Viewport.getWidth();
    this.add(this.createBasicInput());
    this.add(this.createInputWithSearchIcon());
    this.add(this.createInputWithSearchButton());
    this.add(this.createInputWithLabel());

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

  private createBasicInput(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const input = new BsInput("", "Enter your text...");
    input.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    container.setPadding(24);

    const label = new qx.ui.basic.Label("Basic Input");
    label.setTextColor("var(--foreground)");

    container.add(label);
    container.add(input);

    card.setContent(container);
    return card;
  }

  private createInputWithSearchIcon(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const input = new BsInput("", "Search...");
    input.setLeadingHtml(
      '<img src="resource/app/icons/search.svg" alt="" width="16" height="16" style="display:block;opacity:0.7" />',
    );
    input.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    container.setPadding(24);

    const label = new qx.ui.basic.Label("Input with Search Icon");
    label.setTextColor("var(--foreground)");

    container.add(label);
    container.add(input);

    card.setContent(container);
    return card;
  }

  private createInputWithSearchButton(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const inputContainer = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(0),
    );
    inputContainer.setAllowGrowX(true);

    const input = new BsInput("", "Search pages...");
    input.setLeadingHtml(
      '<img src="resource/app/icons/search.svg" alt="" width="16" height="16" style="display:block;opacity:0.7" />',
    );
    input.setAllowGrowX(true);
    input.setWidth(300);

    const searchButton = new BsButton("Search");
    searchButton.setWidth(80);

    inputContainer.add(input);
    inputContainer.add(searchButton);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    container.setPadding(24);

    const label = new qx.ui.basic.Label("Input with Search Button");
    label.setTextColor("var(--foreground)");

    container.add(label);
    container.add(inputContainer);

    card.setContent(container);
    return card;
  }

  private createInputWithLabel(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    container.setPadding(24);

    const label = new qx.ui.basic.Label("Input with Label");
    label.setTextColor("var(--foreground)");

    const labelText = new qx.ui.basic.Label("Email address");
    labelText.setTextColor("var(--foreground)");

    const input = new BsInput("", "you@example.com");
    input.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 472);

    const description = new qx.ui.basic.Label(
      "We'll never share your email with anyone else.",
    );
    description.setTextColor("var(--muted-foreground)");

    container.add(label);
    container.add(labelText);
    container.add(input);
    container.add(description);

    card.setContent(container);
    return card;
  }
}
