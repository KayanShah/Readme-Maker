import type { FormData, Badge } from './types';

function encodeBadgeLabel(label: string): string {
  return label
    .replace(/-/g, '--')
    .replace(/ /g, '_');
}

function badgeMd(b: Badge): string {
  const encoded = encodeBadgeLabel(b.label);
  let url = `https://img.shields.io/badge/${encoded}-${b.color}?style=flat-square`;
  if (b.logo) url += `&logo=${b.logo}`;
  if (b.logoColor) url += `&logoColor=${b.logoColor}`;
  return `![${b.label}](${url})`;
}

function encodeTypingLine(line: string): string {
  return encodeURIComponent(line).replace(/%20/g, '+');
}

export function generateReadme(data: FormData): string {
  const {
    name,
    location,
    typingLines,
    tagline,
    bio,
    githubUsername,
    email,
    whatIBuildLeftTitle,
    whatIBuildLeftDesc,
    whatIBuildRightTitle,
    whatIBuildRightDesc,
    achievements,
    badgeCategories,
    featuredRepos,
    goals,
    goalsYear,
    shoutoutUsername,
    shoutoutMessage,
    showFollowerGoal,
    showTrophies,
    showChart,
    showTools,
    showOpenToCollab,
  } = data;

  const lines = typingLines
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  const encodedLines = lines.map(encodeTypingLine).join(';');

  const typingSvgUrl = `https://readme-typing-svg.demolab.com?font=Fira+Code&size=26&duration=3500&pause=1000&color=0F3460&width=560&height=44&lines=${encodedLines}`;

  const achievementRows = achievements
    .map(a => `| ${a.emoji} | ${a.title} | ${a.scope} |`)
    .join('\n');

  const techStackSection = badgeCategories
    .filter(cat => cat.badges.length > 0)
    .map(cat => {
      const badgesMd = cat.badges.map(badgeMd).join('\n');
      return `**${cat.name}**\n${badgesMd}`;
    })
    .join('\n\n');

  const validRepos = featuredRepos.filter(r => r.trim());
  const featuredProjectRows: string[] = [];
  for (let i = 0; i < validRepos.length; i += 2) {
    const pair = validRepos.slice(i, i + 2);
    const cards = pair
      .map(repo => `  <a href="https://github.com/${githubUsername}/${repo}">\n    <img src="https://kayan-github-profile-projects-featu.vercel.app/api/pin/?username=${githubUsername}&repo=${repo}&theme=nord&bg_color=0F3460&hide_border=true" />\n  </a>`)
      .join('\n  &nbsp;\n  \n');
    featuredProjectRows.push(`<p align="center">\n${cards}\n</p>`);
  }
  const featuredProjectsSection = featuredProjectRows.join('\n\n');

  const goalsSection = goals
    .map(g => {
      const check = g.completed ? 'x' : ' ';
      const note = g.completed && g.note ? ` *(${g.note})*` : '';
      return `- [${check}] ${g.text}${note}`;
    })
    .join('\n');

  const locationStr = location ? ` based in ${location}` : '';

  const parts: string[] = [];

  // Header
  parts.push(`[![Typing SVG](${typingSvgUrl})](https://git.io/typing-svg)`);
  parts.push('');

  // Badges row
  const badgeLines: string[] = [];
  badgeLines.push(`<img src="https://komarev.com/ghpvc/?username=${githubUsername}&label=Profile+Views&color=0F3460&style=flat" alt="Visitor Count" />`);
  badgeLines.push(`<a href="mailto:${email}"><img src="https://img.shields.io/badge/Email-0F3460?style=flat-square&logo=icloud&logoColor=white" /></a>`);
  if (showOpenToCollab) {
    badgeLines.push(`<a href="mailto:${email}"><img src="https://img.shields.io/badge/Open_to_Collaborations-0F3460?style=flat-square&logo=handshake&logoColor=white" /></a>`);
  }
  badgeLines.push('');
  badgeLines.push('');
  badgeLines.push(`<img src="https://gh-follower-badge.vercel.app/api/thank-you?v=7" alt="Thank you badge" />`);
  if (showFollowerGoal) {
    badgeLines.push('');
    badgeLines.push('');
    badgeLines.push(`<img src="https://gh-follower-badge.vercel.app/api/goal?v=6" alt="Follower goal badge" />`);
  }
  parts.push(`<p>\n${badgeLines.join('\n')}\n\n</p>`);
  parts.push('');
  parts.push('---');
  parts.push('');

  // Tagline
  parts.push(`> *${tagline}*`);
  parts.push('');

  // Bio
  parts.push(bio);
  parts.push('');
  parts.push('---');
  parts.push('');

  // GitHub Stats
  parts.push('## GitHub Stats');
  parts.push('');
  parts.push('<p align="center">');
  parts.push(`  <img src="https://github-readme-streak-stats-kayan.vercel.app?user=${githubUsername}&theme=nord&hide_border=true" height="99.4px" alt="Refresh to load" />`);
  parts.push('  ');
  parts.push(`  <img src="https://github-profile-summary-cards-kayan.vercel.app/api/cards/stats?username=${githubUsername}&theme=nord_dark&t=1" width="20%" alt="Refresh to load" />`);
  parts.push('  ');
  parts.push(`  <img src="https://github-profile-summary-cards-kayan.vercel.app/api/cards/most-commit-language?username=${githubUsername}&theme=nord_dark" width="20%" alt="Refresh to load" />`);
  parts.push('  ');
  parts.push(`  <img src="https://github-profile-summary-cards-kayan.vercel.app/api/cards/productive-time?username=${githubUsername}&theme=nord_dark&utcOffset=0" width="20%" alt="Refresh to load" />`);
  parts.push('</p>');
  parts.push('');
  parts.push('---');
  parts.push('');

  // What I Build
  parts.push('## What I Build');
  parts.push('');
  parts.push('<table width="100%">');
  parts.push('  <tr>');
  parts.push('    <td width="50%" valign="top">');
  parts.push(`      <b>${whatIBuildLeftTitle}</b> — ${whatIBuildLeftDesc}`);
  parts.push('    </td>');
  parts.push('    <td width="50%" valign="top">');
  parts.push(`      <b>${whatIBuildRightTitle}</b> — ${whatIBuildRightDesc}`);
  parts.push('    </td>');
  parts.push('  </tr>');
  parts.push('</table>');
  parts.push('');

  // Achievements
  if (achievements.length > 0) {
    parts.push('## Honours & Achievements');
    parts.push('| | Achievement | Scope |');
    parts.push('|:---:|:---|:---:|');
    parts.push(achievementRows);
    parts.push('');
    parts.push('');
    parts.push('---');
    parts.push('');
  }

  // Tech Stack
  if (techStackSection) {
    parts.push('## Tech Stack');
    parts.push(' ');
    parts.push(techStackSection);
    parts.push('');
    parts.push('---');
    parts.push('');
  }

  // Featured Projects
  if (featuredProjectsSection) {
    parts.push(featuredProjectsSection);
    parts.push('');
    parts.push('---');
    parts.push('');
  }

  // Goals
  if (goals.length > 0) {
    parts.push(`## ${goalsYear} Goals`);
    parts.push(goalsSection);
    parts.push('');
    parts.push('');
    parts.push('---');
    parts.push('');
  }

  // Shoutout
  if (shoutoutUsername) {
    parts.push(`🤝 Shoutout to [**@${shoutoutUsername}**](https://github.com/${shoutoutUsername}) — ${shoutoutMessage}`);
    parts.push('');
  }

  // Footer
  parts.push('<a>');
  parts.push('⭐ If something here was useful or you want to connect, a follow or star goes a long way!');
  parts.push('');
  parts.push(`*Thanks for visiting - check out my public repos below. Much more to come!*`);
  parts.push('');
  parts.push('');

  // Activity Graph
  parts.push('<p align="center">');
  parts.push(`  <img src="https://github-readme-activity-graphkayan.vercel.app/graph?username=${githubUsername}&bg_color=2e3440&color=d8dee9&line=80a1c1&point=ffffff&area=true&area_color=61778f&hide_border=true" width="50%"/>`);
  parts.push('</p>');
  parts.push('');

  // Trophies
  if (showTrophies) {
    parts.push('<p align="center">');
    parts.push(`  <img src="https://github-trophies.vercel.app/?username=${githubUsername}&theme=monokai&no-frame=false&no-bg=false&margin-w=4" width="50%"/>`);
    parts.push('</p>');
    parts.push('');
  }

  // Chart
  if (showChart) {
    parts.push('<p align="center">');
    parts.push(`  <img src="https://kayan-github-chart-api.onrender.com/80a1c1/${githubUsername}" alt="${githubUsername}'s Github chart" width="50%"/>`);
    parts.push('</p>');
    parts.push('');
  }

  // Tools section
  if (showTools) {
    parts.push('');
    parts.push('<details>');
    parts.push('  <summary><i>Want to use any of the dynamic tools in your README?</i></summary>');
    parts.push('  ');
    parts.push('  - 🔥 [Streak Stats](https://github-readme-streak-stats-kayan.vercel.app) — GitHub streak card');
    parts.push('  - 📊 [Profile Summary Cards](https://github-profile-summary-cards-kayan.vercel.app) — Stats, languages & activity cards');
    parts.push('  - 📈 [Activity Graph](https://github-readme-activity-graphkayan.vercel.app) — Contribution activity graph');
    parts.push('  - 📌 [Project Cards](https://kayan-github-profile-projects-featu.vercel.app) — Pinned repo cards');
    parts.push('  - 📉 [GitHub Chart API](https://kayan-github-chart-api.onrender.com) — Contribution chart for any colour or theme');
    parts.push('');
    parts.push('</details>');
  }

  // Suppress unused variable warning
  void name;
  void locationStr;

  return parts.join('\n');
}
