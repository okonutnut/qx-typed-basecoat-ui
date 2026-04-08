class FormPage extends qx.ui.container.Composite {
  constructor() {
    super(new qx.ui.layout.VBox(20).set({ alignX: "stretch" }));

    const form = new qx.ui.form.Form();
    this.addSection1(form);
    this.addSection2(form);

    // send button with validation
    const sendButton = new qx.ui.form.Button("Send");
    sendButton.addListener(
      "execute",
      function () {
        if (form.validate()) {
          alert("send...");
        }
      },
      this,
    );
    form.addButton(sendButton);

    // reset button
    const resetButton = new qx.ui.form.Button("Reset");
    resetButton.addListener(
      "execute",
      function () {
        form.reset("");
      },
      this,
    );
    form.addButton(resetButton);

    const formRenderer = new qx.ui.form.renderer.Single(form);
    this.add(formRenderer);

    this.add(this.__buildBasecoatDemoSection());
  }

  private __buildBasecoatDemoSection(): qx.ui.core.Widget {
    const section = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(16).set({ alignX: "stretch" }),
    );
    section.set({ paddingTop: 8 });

    const toastHost = new BsToast();

    const heading = new qx.ui.basic.Label("Basecoat widgets (Bs*)");
    heading.set({ font: "bold" });
    section.add(heading);

    const dataHeading = new qx.ui.basic.Label("Data widgets");
    dataHeading.set({ font: "bold" });
    section.add(dataHeading);

    const dateLabel = new qx.ui.basic.Label("BsDateField");
    section.add(dateLabel);
    const dateField = new BsDateField();
    dateField.setMinHeight(44);
    dateField.addListener("changeValue", (e: qx.event.type.Data) => {
      const d = e.getData() as Date | null;
      toastHost.show({
        category: "info",
        title: "Date changed",
        description: d ? d.toDateString() : "Cleared",
        cancel: { label: "Dismiss" },
      });
    });
    section.add(dateField);

    const tableLabel = new qx.ui.basic.Label(
      "BsTable (row click → toast, paginated)",
    );
    section.add(tableLabel);
    const table = new BsTable("Sample inventory");
    table.setAllowGrowX(true);
    table.setMinHeight(260);
    table.setHeaders(["SKU", "Item", "Qty"]);
    const tableRows: string[][] = [];
    for (let i = 1; i <= 22; i++) {
      tableRows.push([`SKU-${i}`, `Product ${i}`, String((i * 7) % 100)]);
    }
    table.setRows(tableRows);
    table.setPageSize(5);
    table.setPagination(true);
    table.addListener("rowClick", (e: qx.event.type.Data) => {
      const payload = e.getData() as { rowIndex: number; rowData: unknown };
      toastHost.show({
        category: "info",
        title: "Row selected",
        description: `Row index ${payload.rowIndex}`,
        cancel: { label: "Dismiss" },
      });
    });
    section.add(table);

    const agree = new BsCheckBox("I agree to the terms");
    section.add(agree);

    const radioGroup = new BsRadioButtonGroup();
    radioGroup.setGroupName("demo-plan");
    const rFree = new BsRadioButton("Free tier");
    rFree.setValue("free");
    const rPro = new BsRadioButton("Pro tier");
    rPro.setValue("pro");
    radioGroup.add(rFree);
    radioGroup.add(rPro);
    section.add(radioGroup);

    const combo = new BsComboBox();
    combo.add("Apple");
    combo.add("Banana");
    combo.add("Orange");
    section.add(combo);

    const sampleDialog = new BsDialog("Demo dialog", "Native dialog with Basecoat styling.");
    sampleDialog.setSectionContent("You can put forms or copy here.");

    const openDialogBtn = new BsButton("Open BsDialog", undefined, {
      variant: "outline",
    });
    openDialogBtn.onClick(() => sampleDialog.show());
    section.add(openDialogBtn);

    sampleDialog.addListener("save", () => {
      toastHost.show({
        category: "success",
        title: "Saved",
        description: "Save was clicked on the demo dialog.",
        cancel: { label: "Dismiss" },
      });
    });

    const toastBtn = new BsButton("Show BsToast", undefined, {
      variant: "secondary",
    });
    toastBtn.onClick(() => {
      toastHost.show({
        category: "info",
        title: "Toast",
        description: "Inline toaster demo.",
        cancel: { label: "Dismiss" },
      });
    });
    section.add(toastBtn);

    const host = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(0).set({ alignX: "stretch" }),
    );
    host.add(section);
    host.add(sampleDialog);
    host.add(toastHost);
    return host;
  }

  addSection1(form: qx.ui.form.Form) {
    form.addGroupHeader("Registration");
    const userName = new qx.ui.form.TextField();
    userName.setRequired(true);
    form.add(userName, "Name");
    const password = new qx.ui.form.PasswordField();
    password.setRequired(true);
    form.add(password, "Password");
    form.add(new qx.ui.form.CheckBox(), "Save?");
  }

  addSection2(form: qx.ui.form.Form) {
    // add the second header
    form.addGroupHeader("Personal Information");
    form.add(new qx.ui.form.Spinner(0, 50, 100), "Age");
    form.add(new qx.ui.form.TextField(), "Country");
    const genderBox = new qx.ui.form.SelectBox();
    genderBox.add(new qx.ui.form.ListItem("Man"));
    genderBox.add(new qx.ui.form.ListItem("Woman"));
    genderBox.add(new qx.ui.form.ListItem("Genderqueer/Non-Binary"));
    genderBox.add(new qx.ui.form.ListItem("Prefer not to disclose"));
    form.add(genderBox, "Gender");
    form.add(new qx.ui.form.TextArea(), "Bio");
  }
}
