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

## Code Style and Standards

- We use **Biome** for code linting and formatting
- Run `bun run lint` and `bun run format` before submitting PRs
- Follow TypeScript best practices
- Use meaningful commit messages
- Write clear, concise comments where necessary

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

## Testing

- Currently, manual testing is recommended
- Test your changes across different browsers
- Ensure the tool works properly with various screenshot sizes

## Reporting Issues

- Use GitHub Issues to report bugs or suggest features
- Provide clear descriptions, steps to reproduce, and screenshots if applicable
- Include browser information when reporting bugs
