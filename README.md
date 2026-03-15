<div align="center">
  <h1>🤖 README AI Generator</h1>
  <p><strong>A CLI tool and GitHub Action that automatically generates stunning READMEs for any repository.</strong></p>
  <img src="https://img.shields.io/badge/Works_with_Ollama-100%25_Free-success" alt="Ollama Compatible">
</div>

## 🚀 What is this?
It scans your entire repository, analyzes the code with AI, understands what your project does, and generates a beautiful, structured `README.md` automatically.

**Before (empty repo) ➔ After (generated README)**
*(Add side-by-side screenshot here)*

## 📦 Installation & Usage (CLI)

Run it instantly on any local project:
```bash
npx readme-ai-generator --local ./my-project
```

Use a different AI provider (like local, free Ollama):
```bash
npx readme-ai-generator --local . --provider ollama --model llama3.2
```

## ✨ Features
- **Smart Code Analysis**: Reads your file tree, dependencies, and code structure.
- **GitHub Action**: Auto-generate a README when you push a new repo without one.
- **Multi-Provider**: Works with OpenAI, Anthropic, OpenRouter, and Ollama.
- **Safety First**: Never overwrites existing READMEs unless `--force` is used.
- **Dry Run**: Preview the output in the terminal before saving.

## 🛠 GitHub Action Setup

Add to `.github/workflows/readme.yml`:

### OpenAI (Default)
```yaml
      - uses: VIVAAN-DHAWAN/readme-ai-generator@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          ai_provider: openai
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}
```

### Anthropic Claude
```yaml
      - uses: VIVAAN-DHAWAN/readme-ai-generator@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          ai_provider: anthropic
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          model: claude-sonnet-4-20250514
```

### OpenRouter
```yaml
      - uses: VIVAAN-DHAWAN/readme-ai-generator@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          ai_provider: openrouter
          openrouter_api_key: ${{ secrets.OPENROUTER_API_KEY }}
          model: google/gemini-2.5-flash
```

### Ollama (Local & Free)
```yaml
      - uses: VIVAAN-DHAWAN/readme-ai-generator@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          ai_provider: ollama
          ollama_host: http://YOUR_MACHINE_IP:11434
          model: llama3.2
```

## 🤝 Contributing
Contributions, issues and feature requests are welcome!

## 📄 License
MIT License
