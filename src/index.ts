#!/usr/bin/env node
import * as core from '@actions/core';
import * as github from '@actions/github';
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { scanLocalDirectory } from './scanner';
import { analyzeProject } from './analyzer';
import { generateReadme } from './generator';
import { hasReadme, pushReadme } from './github';

async function runAction() {
  try {
    const token = core.getInput('github_token', { required: true });
    const aiProvider = core.getInput('ai_provider') || 'openai';
    const openaiKey = core.getInput('openai_api_key');
    const anthropicKey = core.getInput('anthropic_api_key');
    const openrouterKey = core.getInput('openrouter_api_key');
    const ollamaHost = core.getInput('ollama_host') || 'http://localhost:11434';
    const outputFile = core.getInput('output_file') || 'README.md';
    const overwrite = core.getInput('overwrite') === 'true';

    let model = core.getInput('model');
    if (!model) {
      if (aiProvider === 'openai' || aiProvider === 'openrouter') model = 'gpt-4o';
      if (aiProvider === 'anthropic') model = 'claude-sonnet-4-20250514';
      if (aiProvider === 'ollama') model = 'llama3.2';
    }

    const { owner, repo } = github.context.repo;
    
    if (!overwrite) {
      const exists = await hasReadme(token, owner, repo);
      if (exists) {
        core.info('README already exists and overwrite is false. Skipping.');
        return;
      }
    }

    core.info('Scanning repository...');
    const scan = scanLocalDirectory(process.env.GITHUB_WORKSPACE || '.');
    
    core.info('Analyzing project with AI...');
    const analysis = await analyzeProject(scan, { provider: aiProvider, openaiKey, anthropicKey, openrouterKey, ollamaHost, model });
    
    if (!analysis) {
      throw new Error('AI analysis failed');
    }

    core.info('Generating README...');
    const readmeContent = generateReadme(repo, analysis);

    core.info('Pushing README to repository...');
    await pushReadme(token, owner, repo, readmeContent, outputFile);
    
    core.info('Successfully generated and pushed README!');
  } catch (error: any) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

async function runCLI() {
  const program = new Command();
  program
    .name('readme-ai-generator')
    .description('Generate stunning READMEs using AI')
    .option('--local <path>', 'Local directory to scan', '.')
    .option('--provider <provider>', 'AI Provider: openai | anthropic | openrouter | ollama', 'openai')
    .option('--model <model>', 'AI Model to use', 'gpt-4o')
    .option('--output <file>', 'Output file', 'README.md')
    .option('--force', 'Overwrite existing file')
    .option('--dry-run', 'Preview in terminal without saving')
    .parse(process.argv);

  const options = program.opts();
  
  if (fs.existsSync(options.output) && !options.force && !options.dryRun) {
    console.error(`Error: ${options.output} already exists. Use --force to overwrite.`);
    process.exit(1);
  }

  const dir = path.resolve(options.local);
  const projectName = path.basename(dir);
  console.log(`Scanning local directory: ${dir}`);
  const scan = scanLocalDirectory(dir);

  console.log(`Analyzing project using ${options.provider} (${options.model})...`);
  const analysis = await analyzeProject(scan, {
    provider: options.provider,
    openaiKey: process.env.OPENAI_API_KEY,
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    openrouterKey: process.env.OPENROUTER_API_KEY,
    ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434',
    model: options.model
  });

  if (!analysis) {
    console.error('Failed to get analysis from AI');
    process.exit(1);
  }

  const content = generateReadme(projectName, analysis);

  if (options.dryRun) {
    console.log('\n--- README PREVIEW ---\n');
    console.log(content);
    console.log('\n----------------------\n');
  } else {
    fs.writeFileSync(options.output, content, 'utf8');
    console.log(`Success! Generated ${options.output}`);
  }
}

if (process.env.GITHUB_ACTIONS) {
  runAction();
} else {
  runCLI();
}
