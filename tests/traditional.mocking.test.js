import { afterEach, describe, expect, it, vi } from "vitest";
import { createRepo, listMyRepos } from "../src/githubClient.js";

const BASE_URL = "https://api.github.example";
const TOKEN = "does-not-matter-in-mocks";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("traditional mocking (stubbed fetch)", () => {
  it("can verify request shape quickly", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ name: "demo-repo", private: false })
    });

    const repo = await createRepo({
      baseUrl: BASE_URL,
      token: TOKEN,
      name: "demo-repo"
    });

    expect(repo.name).toBe("demo-repo");
    expect(fetchSpy).toHaveBeenCalledWith(
      `${BASE_URL}/user/repos`,
      expect.objectContaining({
        method: "POST"
      })
    );
  });

  it("does not model server state unless you manually fake it", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ name: "demo-repo", owner: { login: "octocat" } })
      })
      // This second response must be hand-authored; there is no real state.
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => []
      });

    await createRepo({
      baseUrl: BASE_URL,
      token: TOKEN,
      name: "demo-repo"
    });
    const repos = await listMyRepos({ baseUrl: BASE_URL, token: TOKEN });

    // This passes, but it hides a bug. A real backend would return the created repo.
    expect(repos).toEqual([]);
  });
});
