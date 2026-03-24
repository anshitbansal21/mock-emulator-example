import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createEmulator } from "emulate";
import {
  createRepo,
  getRepo,
  listMyRepos,
  renameRepo
} from "../src/githubClient.js";

const TOKEN = "local_test_token";
const PORT = 4101;

let github;

beforeAll(async () => {
  github = await createEmulator({
    service: "github",
    port: PORT,
    seed: {
      tokens: {
        [TOKEN]: {
          login: "octocat",
          scopes: ["repo", "user"]
        }
      },
      github: {
        users: [
          {
            login: "octocat",
            name: "The Octocat",
            email: "octocat@example.com"
          }
        ]
      }
    }
  });
});

afterEach(() => {
  github.reset();
});

afterAll(async () => {
  await github.close();
});

describe("stateful API emulation (emulate)", () => {
  it("persists create -> list behavior like a backend", async () => {
    await createRepo({
      baseUrl: github.url,
      token: TOKEN,
      name: "demo-repo"
    });

    const repos = await listMyRepos({ baseUrl: github.url, token: TOKEN });
    expect(repos.map((repo) => repo.name)).toContain("demo-repo");
  });

  it("supports multi-step flows without restubbing every call", async () => {
    const created = await createRepo({
      baseUrl: github.url,
      token: TOKEN,
      name: "before-rename"
    });

    await renameRepo({
      baseUrl: github.url,
      token: TOKEN,
      owner: created.owner.login,
      repo: created.name,
      newName: "after-rename"
    });

    const repo = await getRepo({
      baseUrl: github.url,
      token: TOKEN,
      owner: created.owner.login,
      repo: "after-rename"
    });

    expect(repo.name).toBe("after-rename");
  });
});
