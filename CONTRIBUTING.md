# Contributing to Screen Pastel

Thank you for your interest in contributing to Screen Pastel! We welcome contributions from the community to help improve this screenshot editing tool.

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/title`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/title`)
5. Open a Pull Request

## Development Setup

### Installation
1. Fork and clone the repository
2. Install dependencies: `bun install`
3. Run the development server: `bun run dev`

### Available Scripts
- `bun run dev` - Start the development server with Turbopack
- `bun run build` - Build the project
- `bun run start` - Start the production server
- `bun run lint` - Check code with Biome linter
- `bun run format` - Format code with Biome


## State Management: `commit()` vs `setState()`

The editor uses a custom `useHistory` hook that separates **live preview** from **undo-able changes**:

- **`setState()`** — Updates the UI immediately (e.g., while dragging a slider). Does **not** create an undo entry.
- **`commit()`** — Saves the change to undo history (e.g., when the slider is released). Creates an undo entry.

When adding or modifying controls, use this pattern:
```tsx
<Slider
  label="Padding"
  value={state.padding}
  onChange={(v) => setState((prev) => ({ ...prev, padding: v }))}    // live preview
  onCommit={(v) => commit((prev) => ({ ...prev, padding: v }))}     // undo-able
  min={0}
  max={200}
/>
```

This ensures that dragging a slider doesn't flood the undo history with intermediate values.

## Code Style

- We use **Biome** for code linting and formatting
- Run `bun run format` before submitting PRs to auto-fix formatting
- `bun run lint` will show remaining issues - not all need to be resolved
- Follow TypeScript best practices
- Write clear, concise comments where necessary
- Use meaningful commit messages (we use `feat:`, `fix:`, `refactor:` prefixes)

## Adding New Gradients

To add new background gradients to the tool, edit `lib/backgrounds.json`. Each gradient entry should have:
- `id`: A unique identifier
- `name`: Display name for the gradient
- `type`: Set to "gradient"
- `value`: CSS linear-gradient() string with colors and angle

Example:
```json
{
  "id": "new-gradient",
  "name": "My New Gradient",
  "type": "gradient",
  "value": "linear-gradient(135deg, #color1 0%, #color2 100%)"
}
```

## Adding New Controls

To add a new control panel to the sidebar:

1. Create a new component in `components/` following the pattern of existing controls
2. Accept `state`, `setState`, and `commit` as props
3. Use `setState` for live preview and `commit` for final values
4. Register the tab in the `tabs` array in `app/page.tsx`
5. Add the rendering case in `renderTabContent()`

## Testing

- Currently, manual testing is recommended
- Test your changes across different browsers
- Ensure the tool works properly with various screenshot sizes
- Verify both desktop (sidebar) and mobile (bottom panel) layouts

## Reporting Issues

- Use GitHub Issues to report bugs or suggest features
- Provide clear descriptions, steps to reproduce, and screenshots if applicable
- Include browser information when reporting bugs
