async function parseJson(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return {};
  }
  return response.json();
}

function authHeaders(token) {
  return {
    Authorization: `token ${token}`,
    "Content-Type": "application/json"
  };
}

export async function createRepo({ baseUrl, token, name, privateRepo = false }) {
  const response = await fetch(`${baseUrl}/user/repos`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ name, private: privateRepo })
  });

  if (!response.ok) {
    const body = await parseJson(response);
    throw new Error(`createRepo failed (${response.status}): ${JSON.stringify(body)}`);
  }

  return parseJson(response);
}

export async function listMyRepos({ baseUrl, token }) {
  const response = await fetch(`${baseUrl}/user/repos`, {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    const body = await parseJson(response);
    throw new Error(`listMyRepos failed (${response.status}): ${JSON.stringify(body)}`);
  }

  return parseJson(response);
}

export async function getRepo({ baseUrl, token, owner, repo }) {
  const response = await fetch(`${baseUrl}/repos/${owner}/${repo}`, {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    const body = await parseJson(response);
    throw new Error(`getRepo failed (${response.status}): ${JSON.stringify(body)}`);
  }

  return parseJson(response);
}

export async function renameRepo({ baseUrl, token, owner, repo, newName }) {
  const response = await fetch(`${baseUrl}/repos/${owner}/${repo}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ name: newName })
  });

  if (!response.ok) {
    const body = await parseJson(response);
    throw new Error(`renameRepo failed (${response.status}): ${JSON.stringify(body)}`);
  }

  return parseJson(response);
}
