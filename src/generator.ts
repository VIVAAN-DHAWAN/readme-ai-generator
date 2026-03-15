import * as fs from 'fs';
import * as path from 'path';
import { AnalysisResult } from './analyzer';

export function generateReadme(projectName: string, analysis: AnalysisResult, templatePath?: string): string {
  let template = '';
  
  if (templatePath && fs.existsSync(templatePath)) {
    template = fs.readFileSync(templatePath, 'utf8');
  } else {
    // default template
    template = `<div align="center">
  <h1>{emoji} {projectName}</h1>
  <p><strong>{description}</strong></p>
  {badges}
</div>

## 🚀 What is this?
{problemSolved}

## ✨ Features
{features}

## 📦 Installation
\`\`\`bash
{installation}
\`\`\`

## 🛠 Usage
{usage}

## ⚙️ Configuration
{configuration}

## 📚 API / Endpoints
{apiEndpoints}

## 🛠 Tech Stack
{techStack}

## 🤝 Contributing
Contributions, issues and feature requests are welcome!

## 📄 License
This project is licensed under the MIT License.
`;
  }

  const featuresList = analysis.features.map(f => `- ${f}`).join('\n');
  const techStackList = analysis.techStack.map(t => `- ${t}`).join('\n');
  const badges = `![Language](https://img.shields.io/badge/Language-Any-blue)\n![License](https://img.shields.io/badge/License-MIT-green)`;

  return template
    .replace('{projectName}', projectName)
    .replace('{emoji}', analysis.emoji || '🤖')
    .replace('{description}', analysis.description || '')
    .replace('{badges}', badges)
    .replace('{problemSolved}', analysis.problemSolved || '')
    .replace('{features}', featuresList || '')
    .replace('{installation}', analysis.installation || 'npm install')
    .replace('{usage}', analysis.usage || '')
    .replace('{configuration}', analysis.configuration || 'None')
    .replace('{apiEndpoints}', analysis.apiEndpoints || 'None')
    .replace('{techStack}', techStackList || '');
}
