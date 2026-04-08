class CardPage extends qx.ui.container.Composite {
  private __responsiveWidth = 0;

  constructor() {
    super(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.__responsiveWidth = qx.bom.Viewport.getWidth();
    this.add(this.createBasicCard());
    this.add(this.createCardWithList());
    this.add(this.createCardWithImage());

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

  private createBasicCard(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const emailInput = new qx.ui.form.TextField();
    emailInput.setPlaceholder("Email");

    const passwordInput = new qx.ui.form.PasswordField();
    passwordInput.setPlaceholder("Password");

    const formContent = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    formContent.setPadding(0, 24, 16, 24);

    const emailLabel = new qx.ui.basic.Label("Email");
    emailLabel.setTextColor("var(--foreground)");
    formContent.add(emailLabel);
    formContent.add(emailInput);

    const passwordLabel = new qx.ui.basic.Label("Password");
    passwordLabel.setTextColor("var(--foreground)");
    formContent.add(passwordLabel);
    formContent.add(passwordInput);

    const submitButton = new BsButton("Submit");
    submitButton.setMarginTop(12);
    formContent.add(submitButton);
    submitButton.addListener("execute", () => {
      const email = emailInput.getValue();
      const password = passwordInput.getValue();
      if (email && password) {
        alert(`Email: ${email}\nPassword: ${password}`);
      }
    });

    card.setContent(formContent);

    return card;
  }

  private createCardWithList(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const contentSection = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(8),
    );
    contentSection.setPadding(24);

    const contentText = new qx.ui.basic.Label(
      "Client requested dashboard redesign with focus on mobile responsiveness.",
    );
    contentText.setTextColor("var(--foreground)");
    contentSection.add(contentText);

    const listItems = [
      "New analytics widgets for daily/weekly metrics",
      "Simplified navigation menu",
      "Dark mode support",
      "Timeline: 6 weeks",
      "Follow-up meeting scheduled for next Tuesday",
    ];

    const listContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(4),
    );
    listContainer.setPadding(16, 0, 0, 0);

    listItems.forEach((item) => {
      const label = new qx.ui.basic.Label(`• ${item}`);
      label.setTextColor("var(--foreground)");
      listContainer.add(label);
    });

    contentSection.add(listContainer);
    card.setContent(contentSection);

    return card;
  }

  private createCardWithImage(): qx.ui.core.Widget {
    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const imageContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(0),
    );

    const image = new qx.ui.basic.Image(
      "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80&w=1080&q=75",
    );
    image.setWidth(this.__isMobile() ? this.__responsiveWidth - 88 : 400);
    image.setMaxHeight(200);
    image.setScale(true);
    imageContainer.add(image);

    card.setContent(imageContainer);

    const actionContainer = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(8),
    );
    actionContainer.setPadding(24, 24, 16, 24);

    const badge1 = new qx.ui.basic.Label("1");
    badge1.setBackgroundColor("var(--muted)");
    badge1.setTextColor("var(--muted-foreground)");
    badge1.setPadding(4, 8, 4, 8);

    const badge2 = new qx.ui.basic.Label("2");
    badge2.setBackgroundColor("var(--muted)");
    badge2.setTextColor("var(--muted-foreground)");
    badge2.setPadding(4, 8, 4, 8);

    const badge3 = new qx.ui.basic.Label("350m²");
    badge3.setBackgroundColor("var(--muted)");
    badge3.setTextColor("var(--muted-foreground)");
    badge3.setPadding(4, 8, 4, 8);

    const spacer = new qx.ui.core.Spacer();
    spacer.setAllowGrowX(true);

    const price = new qx.ui.basic.Label("$135,000");
    price.setTextColor("var(--foreground)");

    actionContainer.add(badge1);
    actionContainer.add(badge2);
    actionContainer.add(badge3);
    actionContainer.add(spacer);
    actionContainer.add(price);

    const contentWrapper = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(0),
    );
    contentWrapper.add(imageContainer);
    contentWrapper.add(actionContainer);
    card.setContent(contentWrapper);

    return card;
  }
}
