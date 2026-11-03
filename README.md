# AgentDoc Action

This Action builds an AgentDoc for your A2A agent from the agent's address and checks it. Run it on every release, and the AgentDoc you publish stays true to what your agent says about itself.

An AgentDoc is one document that gathers what an agent publishes about itself, with each fact tied to its source. You can read more at [agentdoc.net](https://agentdoc.net).

## What it writes

- `.well-known/agentdoc.json` is the AgentDoc. Serve it from your agent's address.
- `agentdoc.html` is the same AgentDoc as a page people can read.

## Keep it current on every release

Copy this file to `.github/workflows/agentdoc.yml` in your agent's repository. Change the address to your agent's address.

```yaml
name: AgentDoc

on:
  release:
    types: [published]
  workflow_dispatch:

jobs:
  agentdoc:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.repository.default_branch }}

      - uses: CommonAgent/agentdoc-action@v1
        with:
          address: https://my-agent.example.com

      - name: Commit the AgentDoc
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add .well-known/agentdoc.json agentdoc.html
          git diff --cached --quiet || git commit -m "Update the AgentDoc"
          git push
```

It runs when you publish a release. You can also run it by hand from the Actions tab.

The Action reads your agent's live card. Run it after the new version of your agent is deployed.

The checkout step uses your default branch, so the commit lands there and not on the release tag.

## Keep the files as an artifact instead

If you deploy the files another way, upload them and skip the commit.

```yaml
      - uses: CommonAgent/agentdoc-action@v1
        id: agentdoc
        with:
          address: https://my-agent.example.com
          out: agentdoc-out

      - uses: actions/upload-artifact@v4
        with:
          name: agentdoc
          path: |
            ${{ steps.agentdoc.outputs.agentdoc-path }}
            ${{ steps.agentdoc.outputs.page-path }}
```

## Inputs

| Input | Required | Default | What it does |
|---|---|---|---|
| `address` | yes | | Your agent's address. The AgentDoc is built from what your agent publishes there. |
| `descriptor` | no | | Path or URL of your agent's Descriptor, if it is not served at your address. |
| `out` | no | `.` | The folder to write into. |
| `check` | no | `true` | Check the AgentDoc after building it. The step fails if the check fails, and the log lists each finding. |
| `version` | no | `latest` | The version of `@common-agent/agentdoc` to run. |
| `package` | no | | For testing this Action only. A path or URL to a package tarball to run in place of the npm release. |

## Outputs

| Output | What it holds |
|---|---|
| `agentdoc-path` | The path of the AgentDoc, such as `.well-known/agentdoc.json`. |
| `page-path` | The path of the page, such as `agentdoc.html`. |
| `ok` | `true` when the AgentDoc passed the check, `false` when it did not. It is empty when `check` is `false`. |

## What it runs

The Action needs Node.js 20.10 or later. GitHub's hosted runners have it.

It runs the `common-agent-doc` command from the [@common-agent/agentdoc](https://www.npmjs.com/package/@common-agent/agentdoc) package. It calls `build` with your address, then `check` on the file it wrote. You can run the same commands on your own computer:

```sh
npx -y @common-agent/agentdoc build https://my-agent.example.com --out .
npx -y @common-agent/agentdoc check .well-known/agentdoc.json
```

To add a signed Descriptor and learn what each part of an AgentDoc means, see [Make your own AgentDoc](https://agentdoc.net/make-your-own.html).

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
