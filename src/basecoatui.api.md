# BasecoatUI Component API Reference

Shadcn-style UI components for Qooxdoo. Components are in `src/components/ui/`.

---

## BsButton

**File:** `src/components/ui/Button.ts`

### Types

```typescript
type BsButtonVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
type BsButtonSize = "default" | "sm" | "lg" | "icon" | "sm-icon" | "lg-icon";
```

### Constructor

```typescript
new BsButton(text?, icon?, options?)
```

| Param    | Type                         | Default     |
|----------|------------------------------|-------------|
| text     | `string?`                    | `""`        |
| icon     | `InlineSvgIcon?`             | `undefined` |
| options  | `{ variant?, size?, className? }` | `{}`   |

### Methods

| Method           | Returns | Description               |
|------------------|---------|---------------------------|
| `getVariant()`   | `BsButtonVariant` | Get current variant |
| `getSize()`      | `BsButtonSize`    | Get current size    |
| `onClick(fn)`    | `this`            | Add click handler   |

### Events

| Event     | Type               |
|-----------|--------------------|
| `execute` | `qx.event.type.Event` |

---

## BsCard

**File:** `src/components/ui/Card.ts`

### Constructor

```typescript
new BsCard(options?)
```

| Param   | Type                    |
|---------|-------------------------|
| options | `{ className? }`       |

### Methods

| Method          | Returns | Description            |
|-----------------|---------|------------------------|
| `setContent(w)` | `this`  | Set card content       |
| `removeContent()` | `this` | Clear card content   |

---

## BsAvatar

**File:** `src/components/ui/Avatar.ts`

### Types

```typescript
type BsAvatarShape = "full" | "rounded" | "square";
```

### Constructor

```typescript
new BsAvatar(src?, alt?, fallback?, className?, shape?)
```

| Param     | Type           | Default        |
|-----------|----------------|----------------|
| src       | `string?`      | `""`           |
| alt       | `string?`      | `"User avatar"` |
| fallback  | `string?`      | `"?"`          |
| className | `string?`      | `""`           |
| shape     | `BsAvatarShape` | `"full"`      |

### Methods

| Method            | Returns | Description            |
|-------------------|---------|------------------------|
| `setSrc(src)`     | `this`  | Set image source       |
| `setAlt(alt)`     | `this`  | Set alt text           |
| `setFallback(f)`  | `this`  | Set fallback text      |
| `setShape(s)`     | `this`  | Set shape              |

---

## BsInput

**File:** `src/components/ui/Input.ts`

### Constructor

```typescript
new BsInput(value?, placeholder?, className?)
```

| Param       | Type      | Default  |
|-------------|-----------|----------|
| value       | `string?` | `""`     |
| placeholder | `string?` | `""`     |
| className   | `string?` | `""`     |

### Methods

| Method              | Returns | Description           |
|---------------------|---------|-----------------------|
| `getValue()`        | `string`| Get current value     |
| `setValue(v)`       | `this`  | Set value             |
| `setPlaceholder(v)` | `this`  | Set placeholder       |
| `setLeadingHtml(h)` | `this`  | Set leading icon HTML |
| `onInput(fn)`       | `this`  | Add input handler     |

### Events

| Event         | Type                  |
|---------------|-----------------------|
| `input`       | `qx.event.type.Data`  |
| `changeValue` | `qx.event.type.Data`  |

---

## BsTextarea

**File:** `src/components/ui/Textarea.ts`

### Constructor

```typescript
new BsTextarea(value?, placeholder?, className?, rows?)
```

| Param       | Type      | Default |
|-------------|-----------|---------|
| value       | `string?` | `""`    |
| placeholder | `string?` | `""`    |
| className   | `string?` | `""`    |
| rows        | `number?` | `4`     |

### Methods

| Method              | Returns | Description     |
|---------------------|---------|-----------------|
| `getValue()`        | `string`| Get value       |
| `setValue(v)`       | `this`  | Set value       |
| `setPlaceholder(v)` | `this`  | Set placeholder |
| `setRows(n)`        | `this`  | Set row count   |
| `onInput(fn)`       | `this`  | Add handler     |

---

## BsPassword

**File:** `src/components/ui/Password.ts`

### Constructor

```typescript
new BsPassword(value?, placeholder?, className?)
```

### Methods

| Method              | Returns | Description     |
|---------------------|---------|-----------------|
| `getValue()`        | `string`| Get value       |
| `setValue(v)`       | `this`  | Set value       |
| `setPlaceholder(v)` | `this`  | Set placeholder |
| `onInput(fn)`       | `this`  | Add handler     |

---

## BsSelect

**File:** `src/components/ui/Select.ts`

### Constructor

```typescript
new BsSelect(options?, className?)
```

| Param     | Type       | Default  |
|-----------|------------|----------|
| options   | `string[]` | `[]`     |
| className | `string?`  | `""`     |

### Methods

| Method               | Returns  | Description          |
|----------------------|----------|----------------------|
| `getSelectedValue()` | `string` | Get selected value   |
| `setSelectedByLabel(l)` | `this` | Select by label    |
| `resetSelection()`   | `this`   | Reset selection      |
| `onChange(fn)`       | `this`   | Add change handler   |

---

## BsInputGroup

**File:** `src/components/ui/InputGroup.ts`

### Constructor

```typescript
new BsInputGroup(labelText, placeholder?, initialValue?, inputClassName?)
```

| Param           | Type      | Default |
|-----------------|-----------|---------|
| labelText       | `string`  | -       |
| placeholder     | `string?` | -       |
| initialValue    | `string?` | -       |
| inputClassName  | `string?` | -       |

### Methods

| Method               | Returns  | Description          |
|----------------------|----------|----------------------|
| `getValue()`         | `string` | Get input value      |
| `setValue(v)`        | `this`   | Set input value      |
| `onInput(fn)`        | `this`   | Add input handler    |
| `setError(msg?)`     | `this`   | Show error message   |
| `clearError()`       | `this`   | Clear error          |
| `getInputWidget()`   | `BsInput`| Get inner input      |

---

## BsSeparator

**File:** `src/components/ui/Separator.ts`

### Types

```typescript
type BsSeparatorOrientation = "horizontal" | "vertical";
```

### Constructor

```typescript
new BsSeparator(orientation?, decorative?, className?, label?)
```

| Param       | Type                   | Default        |
|-------------|------------------------|----------------|
| orientation | `BsSeparatorOrientation` | `"horizontal"` |
| decorative  | `boolean?`             | `true`         |
| className   | `string?`              | `""`           |
| label       | `string?`              | `""`           |

### Methods

| Method       | Returns | Description     |
|--------------|---------|-----------------|
| `setLabel(v)`| `this`  | Set label text  |

---

## BsDrawer

**File:** `src/components/ui/Drawer.ts`

### Constructor

```typescript
new BsDrawer(content, drawerPanel)
```

| Param       | Type                | Description         |
|-------------|---------------------|---------------------|
| content     | `qx.ui.core.Widget` | Background content  |
| drawerPanel | `qx.ui.core.Widget` | Drawer panel widget |

### Methods

| Method     | Returns | Description       |
|------------|---------|-------------------|
| `open()`   | `void`  | Open drawer       |
| `close()`  | `void`  | Close drawer      |
| `toggle()` | `void`  | Toggle drawer     |
| `isOpen()` | `boolean`| Check if open    |

---

## BsAlertDialog

**File:** `src/components/ui/AlertDialog.ts`

Singleton modal dialog. One shared `<dialog>` element is reused.

### Types

```typescript
interface BsAlertDialogConfig {
  title: string;
  description?: string;
  cancelLabel?: string;
  continueLabel?: string;
  onContinue?: () => void;
  children?: qx.ui.core.Widget;
  footerButtons?: "ok" | "ok-cancel" | "cancel";
}
```

### Static Method

```typescript
BsAlertDialog.show(config: BsAlertDialogConfig): void
```

---

## BsSidebarButton

**File:** `src/components/ui/SidebarButton.ts`

### Constructor

```typescript
new BsSidebarButton(text?, icon?, className?)
```

### Methods

| Method              | Returns | Description           |
|---------------------|---------|-----------------------|
| `setActive(v)`      | `this`  | Set active state      |
| `setCollapsed(v)`   | `this`  | Set collapsed state   |
| `setCentered(v)`    | `this`  | Set centered layout   |
| `setTrailingHtml(h)`| `this`  | Set trailing HTML     |
| `setEnabled(v)`     | `this`  | Set enabled state     |
| `isEnabled()`       | `boolean` | Get enabled state  |
| `setText(t)`        | `this`  | Set button text       |
| `onClick(fn)`       | `this`  | Add click handler     |

---

## BsSidebarAccount

**File:** `src/components/ui/SidebarAccount.ts`

### Constructor

```typescript
new BsSidebarAccount(name?, username?, avatarSrc?, avatarFallback?, className?)
```

### Methods

| Method               | Returns | Description          |
|----------------------|---------|----------------------|
| `setCollapsed(v)`    | `this`  | Set collapsed state  |
| `setName(n)`         | `this`  | Set display name     |
| `setUsername(u)`     | `this`  | Set username         |
| `setAvatar(src, fb?)`| `this`  | Set avatar           |
| `onAction(fn)`       | `this`  | Add action handler   |
| `onClick(fn)`        | `this`  | Add click handler    |

### Events

| Event     | Type                |
|-----------|---------------------|
| `execute` | `qx.event.type.Event` |
| `action`  | `qx.event.type.Data`  |
