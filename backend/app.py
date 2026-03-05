import json
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prisma import Prisma
from svix.webhooks import Webhook, WebhookVerificationError
import google.generativeai as genai
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache

load_dotenv()

# Database initialization
db = Prisma()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to the database on startup
    await db.connect()
    # Initialize cache backend
    FastAPICache.init(InMemoryBackend())
    yield
    # Disconnect from the database on shutdown
    await db.disconnect()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="DevTrackr", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API
class UserCreate(BaseModel):
    clerkId: str
    email: str
    name: Optional[str] = None
    avatarUrl: Optional[str] = None


# Root and Health Check
@app.get("/")
async def root():
    return {"message": "DevTrackr is Active!🚀"}

@app.get("/healthz")
async def health_check():
    return {"status": "ok"}

@app.get("/db_status")
async def database_status():
    try:
        user_count = await db.user.count()
        repo_row_count = await db.repository.count()
        return {
            "status": "connected",
            "user_count": user_count,
            "repo_rows": repo_row_count
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# Clerk Webhooks
@app.post("/webhooks/clerk")
async def clerk_webhook(
    request: Request,
    x_svix_signature: str = Header(None),
    x_svix_id: str = Header(None),
    x_svix_timestamp: str = Header(None)
):
    if not CLERK_WEBHOOK_SECRET:
        print("WARNING: CLERK_WEBHOOK_SECRET not set. Skipping verification (DEV ONLY)")

    payload = await request.body()

    if CLERK_WEBHOOK_SECRET:
        if not x_svix_signature or not x_svix_id or not x_svix_timestamp:
            raise HTTPException(status_code=400, detail="Missing svix headers")

        wh = Webhook(CLERK_WEBHOOK_SECRET)
        try:
            evt = wh.verify(payload, {
                "svix-id": x_svix_id,
                "svix-signature": x_svix_signature,
                "svix-timestamp": x_svix_timestamp,
            })
        except WebhookVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
    else:
        evt = json.loads(payload)

    data = evt.get("data")
    event_type = evt.get("type")

    if event_type in ["user.created", "user.updated"]:
        clerk_id = data.get("id")
        email_addresses = data.get("email_addresses", [])
        email = email_addresses[0].get("email_address") if email_addresses else None
        first_name = data.get("first_name") or ""
        last_name = data.get("last_name") or ""
        name = f"{first_name} {last_name}".strip()
        avatar_url = data.get("image_url")

        await db.user.upsert(
            where={'clerkId': clerk_id},
            data={
                'create': {
                    'clerkId': clerk_id,
                    'email': email or "",
                    'name': name,
                    'avatarUrl': avatar_url
                },
                'update': {
                    'email': email or "",
                    'name': name,
                    'avatarUrl': avatar_url
                }
            }
        )

    return {"status": "success"}


# GitHub API Client
class GitHubClient:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }

    async def get_repositories(self):
        """Fetch ALL repos across all pages — no artificial limits."""
        all_repos = []
        page = 1
        async with httpx.AsyncClient() as client:
            while True:
                response = await client.get(
                    f"{self.base_url}/user/repos?sort=updated&per_page=100&page={page}",
                    headers=self.headers
                )
                response.raise_for_status()
                batch = response.json()
                all_repos.extend(batch)
                # GitHub returns fewer than 100 results on the last page
                if len(batch) < 100:
                    break
                page += 1
        return all_repos

    async def get_commits(self, owner: str, repo_name: str, since: str = None):
        url = f"{self.base_url}/repos/{owner}/{repo_name}/commits?per_page=50"
        if since:
            url += f"&since={since}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code == 409:  # empty repo
                return []
            response.raise_for_status()
            return response.json()

    async def get_pull_requests(self, owner: str, repo_name: str):
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo_name}/pulls?state=all&per_page=30",
                headers=self.headers
            )
            if response.status_code in [404, 409]:
                return []
            response.raise_for_status()
            return response.json()


async def get_github_token(clerk_user_id: str):
    if not CLERK_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Clerk Secret Key not configured")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.clerk.com/v1/users/{clerk_user_id}/oauth_access_tokens/oauth_github",
            headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch GitHub token from Clerk")

        tokens = response.json()
        if not tokens:
            raise HTTPException(status_code=400, detail="No GitHub token found for user")

        return tokens[0].get("token")


# GitHub Sync Route
# Each user gets exactly ONE row in Repository, Commit, and PullRequest.
# Every sync replaces the JSON arrays in those rows with the latest fetched data.
@app.post("/sync-github")
@limiter.limit("2/minute")
async def sync_github_data(request: Request, clerk_user_id: str):
    token = await get_github_token(clerk_user_id)
    gh = GitHubClient(token)

    user = await db.user.find_unique(where={'clerkId': clerk_user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database")

    # Fetch all repos (up to 100 most recently updated)
    raw_repos = await gh.get_repositories()

    # Build JSON arrays for each table
    repos_list = []
    commits_list = []
    prs_list = []

    for repo_info in raw_repos:
        owner = repo_info['owner']['login']
        repo_name = repo_info['name']

        # Structured repo entry
        repos_list.append({
            "githubId": repo_info['id'],
            "name": repo_info['name'],
            "fullName": repo_info['full_name'],
            "description": repo_info.get('description'),
            "language": repo_info.get('language'),
            "stargazersCount": repo_info.get('stargazers_count', 0),
            "forksCount": repo_info.get('forks_count', 0),
            "htmlUrl": repo_info.get('html_url'),
            "updatedAt": repo_info.get('updated_at'),
        })

        # Fetch commits for this repo
        try:
            raw_commits = await gh.get_commits(owner, repo_name)
            for c in raw_commits:
                commits_list.append({
                    "sha": c['sha'],
                    "message": c['commit']['message'],
                    "date": c['commit']['author']['date'],
                    "authorName": c['commit']['author'].get('name'),
                    "authorEmail": c['commit']['author'].get('email'),
                    "repoName": repo_name,
                    "repoFullName": repo_info['full_name'],
                })
        except Exception as e:
            print(f"Error fetching commits for {repo_name}: {e}")

        # Fetch pull requests for this repo
        try:
            raw_prs = await gh.get_pull_requests(owner, repo_name)
            for pr in raw_prs:
                prs_list.append({
                    "githubId": pr['id'],
                    "number": pr['number'],
                    "title": pr['title'],
                    "state": pr['state'],
                    "mergedAt": pr.get('merged_at'),
                    "repoName": repo_name,
                    "repoFullName": repo_info['full_name'],
                    "htmlUrl": pr.get('html_url'),
                    "createdAt": pr.get('created_at'),
                })
        except Exception as e:
            print(f"Error fetching PRs for {repo_name}: {e}")

    # Deduplicate commits by sha
    seen_shas = set()
    deduped_commits = []
    for c in commits_list:
        if c['sha'] not in seen_shas:
            seen_shas.add(c['sha'])
            deduped_commits.append(c)

    # Deduplicate PRs by githubId
    seen_pr_ids = set()
    deduped_prs = []
    for pr in prs_list:
        if pr['githubId'] not in seen_pr_ids:
            seen_pr_ids.add(pr['githubId'])
            deduped_prs.append(pr)

    # Upsert — one row per user in each table
    await db.repository.upsert(
        where={'userId': user.id},
        data={
            'create': {'userId': user.id, 'repositoriesData': json.dumps(repos_list)},
            'update': {'repositoriesData': json.dumps(repos_list)}
        }
    )

    await db.commit.upsert(
        where={'userId': user.id},
        data={
            'create': {'userId': user.id, 'commitsData': json.dumps(deduped_commits)},
            'update': {'commitsData': json.dumps(deduped_commits)}
        }
    )

    await db.pullrequest.upsert(
        where={'userId': user.id},
        data={
            'create': {'userId': user.id, 'pullRequestsData': json.dumps(deduped_prs)},
            'update': {'pullRequestsData': json.dumps(deduped_prs)}
        }
    )

    return {
        "status": "success",
        "repositories_synced": len(repos_list),
        "commits_synced": len(deduped_commits),
        "prs_synced": len(deduped_prs)
    }


# User Stats
@app.get("/stats/{clerk_user_id}")
@cache(expire=300)
async def get_user_stats(clerk_user_id: str):
    user = await db.user.find_unique(where={'clerkId': clerk_user_id})
    if not user:
        return {"total_commits": 0, "total_repos": 0, "total_prs": 0, "languages": {}, "pr_merge_rate": 0}

    repo_row = await db.repository.find_unique(where={'userId': user.id})
    commit_row = await db.commit.find_unique(where={'userId': user.id})
    pr_row = await db.pullrequest.find_unique(where={'userId': user.id})

    repos = repo_row.repositoriesData if repo_row else []
    commits = commit_row.commitsData if commit_row else []
    prs = pr_row.pullRequestsData if pr_row else []

    # Language breakdown from repos
    languages: dict[str, int] = {}
    for repo in repos:
        lang = repo.get("language")
        if lang:
            languages[lang] = languages.get(lang, 0) + 1

    # PR merge rate
    total_prs = len(prs)
    merged_prs = sum(1 for pr in prs if pr.get("mergedAt"))
    pr_merge_rate = round((merged_prs / total_prs) * 100, 1) if total_prs > 0 else 0

    # Productivity score (0-100)
    # Weighting: Commits (0.5 pts), Merged PRs (5 pts), Repos (2 pts)
    productivity_score = min(100, (len(commits) * 0.5) + (merged_prs * 5) + (len(repos) * 2))

    return {
        "total_commits": len(commits),
        "total_repos": len(repos),
        "total_prs": total_prs,
        "merged_prs": merged_prs,
        "pr_merge_rate": pr_merge_rate,
        "languages": languages,
        "productivity_score": round(productivity_score, 1)
    }


# User Activity (last 30 days commit heatmap)
@app.get("/activity/{clerk_user_id}")
@cache(expire=300)
async def get_user_activity(clerk_user_id: str):
    user = await db.user.find_unique(where={'clerkId': clerk_user_id})
    if not user:
        return []

    commit_row = await db.commit.find_unique(where={'userId': user.id})
    commits = commit_row.commitsData if commit_row else []

    thirty_days_ago = datetime.now() - timedelta(days=30)

    # Build a daily count map
    activity_map = {}
    for i in range(30):
        date_str = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        activity_map[date_str] = 0

    for commit in commits:
        try:
            commit_date_str = commit['date'][:10]  # YYYY-MM-DD
            commit_date = datetime.strptime(commit_date_str, '%Y-%m-%d')
            if commit_date >= thirty_days_ago and commit_date_str in activity_map:
                activity_map[commit_date_str] += 1
        except Exception:
            pass

    sorted_activity = [activity_map[date] for date in sorted(activity_map.keys())]
    return sorted_activity


# Repository-specific Activity (last 30 days commit heatmap)
@app.get("/activity/{clerk_user_id}/{repo_name:path}")
@cache(expire=300)
async def get_repo_activity(clerk_user_id: str, repo_name: str):
    user = await db.user.find_unique(where={'clerkId': clerk_user_id})
    if not user:
        return []

    commit_row = await db.commit.find_unique(where={'userId': user.id})
    commits = commit_row.commitsData if commit_row else []

    thirty_days_ago = datetime.now() - timedelta(days=30)

    # Build a daily count map
    activity_map = {}
    for i in range(30):
        date_str = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        activity_map[date_str] = 0

    for commit in commits:
        try:
            # Filter commits by repository name
            if commit.get('repoName') == repo_name or commit.get('repoFullName') == repo_name:
                commit_date_str = commit['date'][:10]  # YYYY-MM-DD
                commit_date = datetime.strptime(commit_date_str, '%Y-%m-%d')
                if commit_date >= thirty_days_ago and commit_date_str in activity_map:
                    activity_map[commit_date_str] += 1
        except Exception:
            pass

    sorted_activity = [activity_map[date] for date in sorted(activity_map.keys())]
    return sorted_activity


@app.post("/sync-user")
async def sync_user(user: UserCreate):
    return await db.user.upsert(
        where={'clerkId': user.clerkId},
        data={
            'create': {
                'clerkId': user.clerkId,
                'email': user.email,
                'name': user.name,
                'avatarUrl': user.avatarUrl
            },
            'update': {
                'email': user.email,
                'name': user.name,
                'avatarUrl': user.avatarUrl
            }
        }
    )

@app.get("/users")
async def get_users():
    return await db.user.find_many()

@app.get("/repos")
async def get_repos(clerk_user_id: Optional[str] = None):
    if clerk_user_id:
        user = await db.user.find_unique(where={'clerkId': clerk_user_id})
        if not user:
            return []
        repo_row = await db.repository.find_unique(where={'userId': user.id})
        if not repo_row:
            return []
        return repo_row.repositoriesData
    
    # Fallback to returning all repos across all users if requested
    all_repo_rows = await db.repository.find_many()
    all_repos = []
    for row in all_repo_rows:
        all_repos.extend(row.repositoriesData)
    return all_repos


# AI Insight Generation
@app.post("/generate-insight")
@limiter.limit("3/minute")
async def generate_insights(request: Request, clerk_user_id: str, force_refresh: bool = False):
    user = await db.user.find_unique(where={'clerkId': clerk_user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    commit_row = await db.commit.find_unique(where={'userId': user.id})
    repo_row = await db.repository.find_unique(where={'userId': user.id})

    commits = commit_row.commitsData if commit_row else []
    repos = repo_row.repositoriesData if repo_row else []

    # Filter last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_commits = [
        c for c in commits
        if datetime.strptime(c['date'][:10], '%Y-%m-%d') >= thirty_days_ago
    ]

    # Caching logic: check if we have a recent insight (last 24 hours)
    if not force_refresh:
        latest_insight = await db.insight.find_first(
            where={'userId': user.id},
            order={'createdAt': 'desc'}
        )
        if latest_insight:
            time_diff = datetime.now() - latest_insight.createdAt.replace(tzinfo=None)
            if time_diff < timedelta(days=7):
                return {
                    "insight": latest_insight.content, 
                    "cached": True,
                    "cached_at": latest_insight.createdAt.isoformat()
                }

    if not GEMINI_API_KEY:
        content = "AI Insights not configured. Set GEMINI_API_KEY in backend .env to generate live neural analysis."
        await db.insight.create(data={'content': content, 'userId': user.id})
        return {"insight": content}

    dev_name = user.name if user.name else "the developer"
    prompt = (
        f"Write a simple, crisp, and highly professional 2-3 sentence productivity report summarizing this GitHub activity for {dev_name}: "
        f"{len(recent_commits)} commits across {len(repos)} repositories in 30 days. "
        f"Speak directly to the developer data. Do not start with '{dev_name}' or explicitly repeat their name. "
        f"Sound like a senior engineer giving a quick, encouraging performance review. Do not use sci-fi, robotic, or overly flowery language."
    )

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        content = response.text.replace("\n", " ").strip()
        
        # Replace the old record (Maintain only one latest report per user)
        # We do this by deleting any existing insights for the user first
        await db.insight.delete_many(where={'userId': user.id})
        await db.insight.create(data={'content': content, 'userId': user.id})
        
        return {"insight": content, "cached": False}
    except Exception as e:
        print(f"Error generating insight: {e}")
        return {"insight": "Live delta streams detected. Neural analysis temporarily offline."}


# Repo-Specific AI Insight Generation (Returns on-the-fly analysis)
@app.post("/generate-repo-insight")
@limiter.limit("5/minute")
async def generate_repo_insights(request: Request, clerk_user_id: str, repo_name: str):
    user = await db.user.find_unique(where={'clerkId': clerk_user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not GEMINI_API_KEY:
        return {"insight": "AI Insights not configured. Set GEMINI_API_KEY in backend .env to enable analysis."}

    commit_row = await db.commit.find_unique(where={'userId': user.id})
    commits = commit_row.commitsData if commit_row else []

    # Filter last 30 days for this specific repo
    thirty_days_ago = datetime.now() - timedelta(days=30)
    repo_commits = [
        c for c in commits
        if (c.get('repoName') == repo_name or c.get('repoFullName') == repo_name)
    ]
    
    recent_commits = [
        c for c in repo_commits
        if datetime.strptime(c['date'][:10], '%Y-%m-%d') >= thirty_days_ago
    ]

    dev_name = user.name if user.name else "this developer"
    
    prompt = (
        f"Write a very brief, concise, and professional 2-3 sentence insight about {dev_name}'s recent work on the repository '{repo_name}'. "
        f"They made {len(recent_commits)} commits in the last 30 days out of {len(repo_commits)} total commits. "
        f"Speak directly to the data. Keep it highly analytical, encouraging, and sound like a senior engineer reviewing their specific repository contribution. "
        f"Do not start with their name. No robotic or overly flowery language."
    )

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        content = response.text.replace("\n", " ").strip()
        return {"insight": content}
    except Exception as e:
        print(f"Error generating repo insight: {e}")
        return {"insight": "Unable to generate insight at this time. Delta stream offline."}


@app.get("/insight/{clerk_user_id}")
async def get_insight(clerk_user_id: str):
    user = await db.user.find_unique(where={'clerkId': clerk_user_id})
    if not user:
        return {"insight": None}

    latest_insight = await db.insight.find_first(
        where={'userId': user.id},
        order={'createdAt': 'desc'}
    )
    if latest_insight:
        return {"insight": latest_insight.content}
    return {"insight": None}
