import asyncio
import json
import os
from contextlib import asynccontextmanager
from typing import List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prisma import Prisma
from svix.webhooks import Webhook, WebhookVerificationError

load_dotenv()

# Database initialization
db = Prisma()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to the database on startup
    await db.connect()
    yield
    # Disconnect from the database on shutdown
    await db.disconnect()

app = FastAPI(title="DevTrackr", lifespan=lifespan)

CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

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

class RepositoryCreate(BaseModel):
    githubId: int
    name: str
    fullName: str
    description: Optional[str] = None
    userId: str

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
        commit_count = await db.commit.count()
        return {
            "status": "connected", 
            "user_count": user_count,
            "commit_count": commit_count
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
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/user/repos?sort=updated", headers=self.headers)
            response.raise_for_status()
            return response.json()

    async def get_commits(self, owner: str, repo_name: str):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/repos/{owner}/{repo_name}/commits?per_page=30", headers=self.headers)
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

# Repository Sync Route (Optimized)
@app.post("/github/sync")
async def sync_github_data(clerk_user_id: str):
    token = await get_github_token(clerk_user_id)
    gh = GitHubClient(token)

    user = await db.user.find_unique(where={'clerkId': clerk_user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database")

    repos_data = await gh.get_repositories()
    repos_data = repos_data[:15]  # Limit to top 15 for speed

    async def sync_single_repo(repo_info):
        repo = await db.repository.upsert(
            where={'githubId': repo_info['id']},
            data={
                'create': {
                    'githubId': repo_info['id'],
                    'name': repo_info['name'],
                    'fullName': repo_info['full_name'],
                    'description': repo_info.get('description'),
                    'language': repo_info.get('language'),
                    'stargazersCount': repo_info.get('stargazers_count', 0),
                    'forksCount': repo_info.get('forks_count', 0),
                    'userId': user.id
                },
                'update': {
                    'name': repo_info['name'],
                    'fullName': repo_info['full_name'],
                    'description': repo_info.get('description'),
                    'language': repo_info.get('language'),
                    'stargazersCount': repo_info.get('stargazers_count', 0),
                    'forksCount': repo_info.get('forks_count', 0),
                }
            }
        )

        try:
            commits_data = await gh.get_commits(repo_info['owner']['login'], repo_info['name'])
            commit_tasks = [
                db.commit.upsert(
                    where={'sha': c['sha']},
                    data={
                        'create': {
                            'sha': c['sha'],
                            'message': c['commit']['message'],
                            'date': c['commit']['author']['date'],
                            'authorName': c['commit']['author']['name'],
                            'authorEmail': c['commit']['author']['email'],
                            'repositoryId': repo.id,
                            'userId': user.id
                        },
                        'update': {
                            'message': c['commit']['message'],
                        }
                    }
                ) for c in commits_data
            ]
            await asyncio.gather(*commit_tasks)
        except Exception as e:
            print(f"Error syncing commits for {repo_info['name']}: {e}")
        
        return repo

    synced_repos = await asyncio.gather(*(sync_single_repo(r) for r in repos_data))
    return {"status": "success", "repositories_synced": len(synced_repos)}

# User Stats and General Endpoints
@app.get("/stats/user/{clerk_user_id}")
async def get_user_stats(clerk_user_id: str):
    user = await db.user.find_unique(where={'clerkId': clerk_user_id})
    if not user:
        return {"total_commits": 0, "total_repos": 0, "total_prs": 0}
    
    commit_count = await db.commit.count(where={'userId': user.id})
    repo_count = await db.repository.count(where={'userId': user.id})
    pr_count = await db.pullrequest.count(where={'userId': user.id})

    return {
        "total_commits": commit_count,
        "total_repos": repo_count,
        "total_prs": pr_count
    }

@app.get("/stats/activity/{clerk_user_id}")
async def get_user_activity(clerk_user_id: str):
    user = await db.user.find_unique(where={'clerkId': clerk_user_id})
    if not user:
        return []
    
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    commits = await db.commit.find_many(
        where={
            'userId': user.id,
            'date': {'gte': thirty_days_ago}
        },
        order={'date': 'asc'}
    )
    
    # Aggregate by date
    activity_map = {}
    for i in range(30):
        date_str = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        activity_map[date_str] = 0
        
    for commit in commits:
        commit_date = commit.date.strftime('%Y-%m-%d')
        if commit_date in activity_map:
            activity_map[commit_date] += 1
            
    # Convert to sorted list of counts
    sorted_activity = [activity_map[date] for date in sorted(activity_map.keys())]
    return sorted_activity

@app.post("/users/sync")
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

@app.get("/repositories")
async def get_repos():
    return await db.repository.find_many(include={'user': True})
