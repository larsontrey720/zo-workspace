---
name: ai-code-review
description: AI-powered code review for staged git changes. Catches bugs, security issues, and code smells before you push.
compatibility: Created for Zo Computer
metadata:
  author: georgeo.zo.computer
---

# AI Code Reviewer

AI-powered code review for staged git changes. Catches bugs, security issues, and code smells before you push.

## Quick Start

```bash
npx ai-code-review
```

## What It Does

- Reviews your staged git changes automatically
- Identifies bugs, logic errors, and anti-patterns
- Flags potential security issues
- Suggests concrete improvements with explanations
- Color-coded output (critical/warning/suggestion/good)

## Usage

```bash
# Stage your changes first
git add -A

# Run the review
npx ai-code-review
```

## When to Use

- Right before opening a pull request
- Working solo without a reviewer
- Late night coding when your brain is tired
- Quick sanity check on tricky refactors

## Integration with Zo

You can use this in your Zo workflow by:

1. Stage your changes: `git add -A`
2. Run the review via npx or integrate into your development workflow
3. Fix issues before pushing

This is useful for reviewing your own code before pushing to production, especially for:
- StreamLeap Studio updates
- zo.space route changes
- Bug bounty scripts

## Source

- GitHub: [github.com/lxgicstudios/ai-code-review](https://github.com/lxgicstudios/ai-code-review)
- Made by LXGIC Studios