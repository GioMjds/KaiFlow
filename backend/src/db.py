import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse


def _normalize_database_url(url: str) -> tuple[str, dict | None]:
    """
    Normalize the URL to ensure the asyncpg driver is used and
    extract a server_settings dict for asyncpg if `schema` is present.

    Returns: (normalized_url, server_settings_or_None)
    """
    if not url:
        return url, None

    if url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    server_settings = None

    parsed = urlparse(url)
    if parsed.query:
        qs = parse_qs(parsed.query, keep_blank_values=True)
        if "schema" in qs:
            schema_val = qs.pop("schema")[0]
            server_settings = {"search_path": schema_val}

        if "options" in qs:
            qs.pop("options")

        new_query = urlencode({k: v[0] for k, v in qs.items()}) if qs else ""
        parsed = parsed._replace(query=new_query)
        url = urlunparse(parsed)

    return url, server_settings


DATABASE_URL, SERVER_SETTINGS = _normalize_database_url(DATABASE_URL)

connect_args = {}
if SERVER_SETTINGS:
    connect_args["server_settings"] = SERVER_SETTINGS

engine = create_async_engine(DATABASE_URL, echo=False, future=True, connect_args=connect_args)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session