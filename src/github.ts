import * as github from '@actions/github';

export async function hasReadme(token: string, owner: string, repo: string): Promise<boolean> {
  const octokit = github.getOctokit(token);
  try {
    await octokit.rest.repos.getReadme({
      owner,
      repo,
    });
    return true;
  } catch (e: any) {
    if (e.status === 404) return false;
    throw e;
  }
}

export async function pushReadme(token: string, owner: string, repo: string, content: string, path: string = 'README.md') {
  const octokit = github.getOctokit(token);
  
  let sha: string | undefined;
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });
    if ('sha' in data) {
      sha = data.sha;
    }
  } catch (e: any) {
    // File might not exist
  }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: 'docs: auto-generate README.md using AI',
    content: Buffer.from(content).toString('base64'),
    sha,
  });
}
